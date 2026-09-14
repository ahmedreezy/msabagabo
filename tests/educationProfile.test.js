import assert from 'node:assert/strict'
import test from 'node:test'
import { createEducationDraft } from '../src/data/educationDraft.js'
import { educationPublicationIssues, emptyEducationProfile, filterSchools, moveEducationEntry, normalizeEducationProfile, phoneLink, publicEducationProfile, safeLink } from '../src/lib/educationProfile.js'

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
