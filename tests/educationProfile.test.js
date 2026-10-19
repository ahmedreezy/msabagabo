import assert from 'node:assert/strict'
import { closeSync, existsSync, openSync, readSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import { createEducationDraft } from '../src/data/educationDraft.js'
import { educationPublicationIssues, emptyEducationProfile, filterSchools, moveEducationEntry, normalizeEducationProfile, phoneLink, publicEducationProfile, safeLink } from '../src/lib/educationProfile.js'
import { allDepartmentFaqs, departmentFaqs, departmentSectors } from '../src/lib/departmentContent.js'
import { departmentPublications } from '../src/lib/departmentPublications.js'
import { departments, homepageAchievements, pagePresentations, projects, publications } from '../src/data/siteData.js'

const readyDepartment = () => ({
  slug: 'education-sports', name: 'Education & Sports', summary: 'Education information.', team: [],
  educationProfile: {
    ...emptyEducationProfile(), approved: true,
    schools: [{ id: 'school-a', name: 'A school', level: 'Primary', programme: 'UPE', reviewed: true, sourceUrl: 'https://www.msabagabo.go.ug/education' }],
  },
})

test('research pack remains a draft with unknown contact and dates left blank', () => {
  const draft = createEducationDraft()
  assert.equal(draft.approved, false)
  assert.equal(draft.schools.length, 21)
  assert.ok(draft.schools.every((item) => !item.reviewed && !item.phone && !item.email))
  assert.ok(draft.activities.every((item) => !item.date && !item.image))
  const department = { ...readyDepartment(), educationProfile: draft }
  assert.ok(educationPublicationIssues(department).length > 20)
  assert.equal(publicEducationProfile(department), null)
})

test('search combines name, level and programme without changing source order', () => {
  const schools = createEducationDraft().schools
  assert.equal(filterSchools(schools, '  BUSAbaLA ').length, 1)
  assert.equal(filterSchools(schools, '', 'Secondary').length, 5)
  assert.equal(filterSchools(schools, '', 'Secondary', 'Partnership').length, 3)
  assert.equal(filterSchools(schools, 'Lubugumu', 'Secondary', 'USE').length, 1)
  assert.equal(filterSchools(schools, '', 'Primary', 'USE').length, 0)
  assert.equal(filterSchools(schools, 'no-such-school').length, 0)
  assert.deepEqual(filterSchools(schools), schools)
})

test('hydration clones nested data, supports older records and preserves unknown fields', () => {
  const initial = { ...createEducationDraft(), futureField: 'preserved' }
  const hydrated = normalizeEducationProfile(initial)
  hydrated.schools[0].name = 'Changed locally'
  assert.notEqual(initial.schools[0].name, hydrated.schools[0].name)
  assert.equal(hydrated.futureField, 'preserved')
  assert.deepEqual(normalizeEducationProfile({ schools: null }).schools, [])
  assert.deepEqual(educationPublicationIssues({ slug: 'health' }), [])
  assert.equal(publicEducationProfile({ slug: 'education-sports' }), null)
})

test('reordering and JSON save/reload preserve IDs, new fields and service compatibility', () => {
  const department = { ...readyDepartment(), services: ['School inspection'], educationProfile: createEducationDraft() }
  const first = department.educationProfile.schools[0].id
  department.educationProfile = moveEducationEntry(department.educationProfile, 'schools', 0, 1)
  const reloaded = JSON.parse(JSON.stringify(department))
  assert.equal(reloaded.educationProfile.schools[1].id, first)
  assert.deepEqual(reloaded.services, ['School inspection'])
  assert.deepEqual(moveEducationEntry(reloaded.educationProfile, 'schools', 0, -1), reloaded.educationProfile)
})

test('only approved profiles with resolved notes can be projected publicly', () => {
  const department = readyDepartment()
  assert.deepEqual(educationPublicationIssues(department), [])
  const projected = publicEducationProfile(department)
  assert.equal(projected.schools[0].name, 'A school')
  assert.ok(!('reviewed' in projected.schools[0]))
  assert.ok(!('sourceUrl' in projected.schools[0]))
  assert.ok(!('reviewNotes' in projected))
  department.educationProfile.reviewNotes = 'Check school details'
  assert.equal(publicEducationProfile(department), null)
  department.educationProfile.reviewNotes = ''
  department.educationProfile.schools[0].reviewNote = 'Unresolved classification'
  assert.equal(publicEducationProfile(department), null)
  department.educationProfile.schools[0].reviewNote = ''
  department.educationProfile.schools[0].reviewed = false
  assert.equal(publicEducationProfile(department), null)
})

test('optional team photos are accepted, incomplete people and unsafe links are blocked', () => {
  const department = readyDepartment()
  department.team = [{ name: 'Test officer', role: 'Education officer', photo: '' }]
  assert.deepEqual(educationPublicationIssues(department), [])
  department.team[0].role = ''
  assert.ok(educationPublicationIssues(department).some((item) => item.includes('name and role')))
  for (const value of ['javascript:alert(1)', '//evil.example', 'https://', '/\\evil.example', 'https://user:password@example.com']) assert.equal(safeLink(value), '')
  assert.equal(safeLink('/images/school.jpg'), '/images/school.jpg')
  assert.equal(phoneLink('------'), '')
  assert.equal(phoneLink('      '), '')
  assert.equal(phoneLink('+256 326 808 091'), 'tel:+256326808091')
})

test('publication requires valid programme, date, photo caption, source and contact', () => {
  const department = readyDepartment()
  department.educationProfile.schools[0].programme = 'Unconfirmed'
  department.educationProfile.contacts = [{ id: 'office', label: 'Office', kind: 'Telephone', value: 'bad number', reviewed: true, sourceUrl: 'https://example.com' }]
  department.educationProfile.activities = [{ id: 'project', title: 'Classrooms', date: '2026-02-30', description: 'Update', image: '/images/test.jpg', caption: '', reviewed: true, sourceUrl: '' }]
  const issues = educationPublicationIssues(department).join('\n')
  assert.match(issues, /programme/)
  assert.match(issues, /valid update date/)
  assert.match(issues, /photograph caption/)
  assert.match(issues, /source reference/)
  assert.match(issues, /valid contact/)
})

test('all municipal departments use the shared mandate, sectors and FAQ model', () => {
  assert.equal(departments.length, 11)
  assert.equal(new Set(departments.map(({ slug }) => slug)).size, departments.length)
  assert.ok(departments.every((department) => department.slug && department.name && department.mandate))
  assert.deepEqual(departments.map(({ slug }) => slug), [
    'finance-planning', 'administration', 'internal-audit', 'planning-unit', 'education-sports',
    'works-engineering', 'production-marketing', 'trade-industry-led', 'community-services', 'natural-resources', 'health',
  ])
  assert.equal(departmentSectors({ units: ['Legacy unit'] })[0].name, 'Legacy unit')
  assert.equal(departmentFaqs(departments.find(({ slug }) => slug === 'finance-planning')).length, 7)
  assert.ok(allDepartmentFaqs(departments).length >= 20)
})

test('GKMA programme data has structured contracts and progress records', () => {
  const programme = projects.find(({ recordType }) => recordType === 'Programme')
  assert.ok(programme)
  assert.equal(programme.contracts.length, 5)
  assert.ok(programme.contracts.every((contract) => contract.lot && contract.contractor && contract.works && contract.contractSum.startsWith('UGX ')))
  assert.ok(programme.activities.length >= 10)
  assert.ok(programme.activities.every((activity) => activity.planned && activity.implemented && activity.status))
})

test('homepage uses the supplied municipal image and CMS-ready achievement records', () => {
  const home = pagePresentations.find(({ slug }) => slug === 'home')
  assert.equal(home.image, '/images/msmc-aerial-home.jpg')
  assert.equal(home.isIllustrative, false)
  assert.ok(home.imageAlt.includes('Aerial view'))
  assert.equal(homepageAchievements.length, 4)
  assert.ok(homepageAchievements.every((achievement) => achievement.title && achievement.description && achievement.icon))
})

test('Administration and Education use optimized department hero photographs', () => {
  const administration = pagePresentations.find(({ slug }) => slug === 'directorate-administration')
  const education = pagePresentations.find(({ slug }) => slug === 'directorate-education-sports')
  assert.equal(administration.image, '/images/departments/administration-offices.webp')
  assert.equal(education.image, '/images/departments/education-building-v3.webp')
  assert.equal(administration.isIllustrative, false)
  assert.equal(education.isIllustrative, false)
  assert.equal(education.credit, '')
  assert.ok(administration.imageAlt)
  assert.ok(education.imageAlt)
})

test('Works publishes the verified Principal Engineer portrait', () => {
  const works = departments.find(({ slug }) => slug === 'works-engineering')
  assert.equal(works.hodName, 'Wilber Mukasa')
  assert.equal(works.hodTitle, 'Principal Engineer')
  assert.equal(works.hodPhoto, '/images/departments/wilber-mukasa-principal-engineer.webp')
})

test('Education publishes the verified Principal Education Officer portrait', () => {
  const education = departments.find(({ slug }) => slug === 'education-sports')
  assert.equal(education.hodName, 'Nsangi Pauline')
  assert.equal(education.hodTitle, 'Principal Education Officer')
  assert.equal(education.hodPhoto, '/images/departments/nsangi-pauline-principal-education-officer.webp')
})

test('Physical Planning and Natural Resources publishes its two verified technical leaders', () => {
  const naturalResources = departments.find(({ slug }) => slug === 'natural-resources')
  assert.equal(naturalResources.featureTeamAsLeadership, true)
  assert.deepEqual(naturalResources.team.map(({ name, role }) => ({ name, role })), [
    { name: 'Matia Bisirikirwa', role: 'Head of Physical Planning Unit' },
    { name: 'Ssempala Alaphat', role: 'Senior Environment Officer' },
  ])
  assert.ok(naturalResources.team.every(({ photo }) => photo?.endsWith('.webp')))
})

test('Community-Based Services includes the confirmed MDF directory and public FAQs', () => {
  const community = departments.find(({ slug }) => slug === 'community-services')
  const forum = community.publicBodies.find(({ id }) => id === 'metropolitan-development-forum')
  assert.equal(forum.members.length, 36)
  assert.equal(forum.members[0].name, 'Mr. Seruwagi Patrick')
  assert.equal(forum.members[2].name, 'Ms.Namaganda Margaret')
  assert.equal(forum.members[26].category, 'PLWHIDS')
  assert.equal(forum.members[35].name, 'Mr. Sebalamu John')
  assert.equal(forum.documentUrl, '/documents/msmc-metropolitan-development-forum-members.pdf')
  assert.ok(community.faqs.some(({ id }) => id === 'community-mdf-purpose'))
  assert.ok(community.faqs.some(({ id }) => id === 'community-mdf-representation'))
})

test('department Notice Boards receive only documents assigned to that department', () => {
  const community = departments.find(({ slug }) => slug === 'community-services')
  const administration = departments.find(({ slug }) => slug === 'administration')
  const finance = departments.find(({ slug }) => slug === 'finance-planning')
  const planning = departments.find(({ slug }) => slug === 'planning-unit')
  const naturalResources = departments.find(({ slug }) => slug === 'natural-resources')
  const works = departments.find(({ slug }) => slug === 'works-engineering')
  assert.deepEqual(departmentPublications(community, publications).map(({ title }) => title), ['MSMC Metropolitan Development Forum member directory'])
  assert.equal(departmentPublications(administration, publications).length, 2)
  assert.deepEqual(departmentPublications(finance, publications).filter(({ url }) => url).map(({ title }) => title), ['Final Budget FY 2026/2027'])
  assert.deepEqual(departmentPublications(planning, publications).filter(({ url }) => url).map(({ title }) => title), ['List of Proposed Road Names Forwarded to PPC for Approval'])
  assert.equal(departmentPublications(naturalResources, publications).length, 24)
  assert.deepEqual(departmentPublications(works, publications).map(({ title }) => title), ['GKMA Community and Contractors’ Grievance Redress Committees'])
  assert.equal(publications.filter(({ url }) => url).length, 28)
})

test('Administration publishes the complete e-GP FAQ collection under Procurement and Disposal', () => {
  const administration = departments.find(({ slug }) => slug === 'administration')
  const eGpQuestions = departmentFaqs(administration).filter(({ id }) => id.startsWith('egp-'))
  assert.equal(eGpQuestions.length, 43)
  assert.ok(eGpQuestions.every(({ sectorId }) => sectorId === 'procurement'))
  assert.equal(eGpQuestions[0].sectionTitle, 'E-GOVERNMENT PROCUREMENT (e-GP 2.0 )\nFREQUENTLY ASKED QUESTIONS AND ANSWERS')
  assert.equal(eGpQuestions[0].question, 'What is e-GP?')
  assert.match(eGpQuestions[42].question, /Local Governments/)
})

test('every published Notice Board download is a bundled PDF', () => {
  publications.filter(({ url }) => url).forEach(({ title, url }) => {
    const filePath = resolve('public', url.replace(/^\//, '').replace(/^documents\//, 'documents/'))
    assert.equal(existsSync(filePath), true, `${title} is missing ${filePath}`)
    const descriptor = openSync(filePath, 'r')
    const signature = Buffer.alloc(4)
    readSync(descriptor, signature, 0, signature.length, 0)
    closeSync(descriptor)
    assert.equal(signature.toString('ascii'), '%PDF', `${title} is not a PDF`)
  })
})
