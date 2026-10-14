import assert from 'node:assert/strict'
import test from 'node:test'
import { departments, projects, officialFaqs } from '../src/data/siteData.js'

test('product-owner FAQs are complete, attributable and uniquely editable', () => {
  assert.equal(officialFaqs.length, 9)
  assert.equal(new Set(officialFaqs.map((item) => item.slug)).size, officialFaqs.length)
  officialFaqs.forEach((item) => {
    assert.ok(item.category)
    assert.ok(item.question)
    assert.ok(item.answer)
    assert.ok(item.department)
    assert.ok(item.departmentSlug)
    assert.ok(item.answerBlocks.length)
    assert.ok(item.sourceSection)
    assert.ok(item.sourceTitle)
    assert.match(item.lastReviewed, /^\d{4}-\d{2}-\d{2}$/)
  })
  assert.equal(officialFaqs.filter((item) => item.departmentSlug === 'finance-planning').length, 7)
  assert.equal(officialFaqs.filter((item) => item.departmentSlug === 'community-services').length, 2)
})

test('GKMA programme content has structured contracts, reporting and review metadata', () => {
  const project = projects.find((item) => item.slug === 'greater-kampala-metropolitan-area-urban-development-programme')
  assert.ok(project)
  assert.equal(project.contractPackages.length, 5)
  assert.equal(project.implementationUpdates.length, 20)
  project.contractPackages.forEach((entry) => {
    assert.ok(entry.id)
    assert.ok(entry.name)
    assert.ok(entry.works.length)
    assert.ok(entry.contractor)
    assert.ok(entry.start)
    assert.ok(entry.plannedCompletion)
    assert.ok(Number.isSafeInteger(entry.contractSumUgx))
  })
  project.implementationUpdates.forEach((entry) => {
    assert.ok(entry.id)
    assert.ok(entry.topic)
    assert.ok(entry.planned || entry.implemented)
  })
  assert.equal(project.participatingEntities.length, 9)
  assert.equal(project.pillars.length, 3)
  assert.equal(project.fundingComponents.length, 2)
  assert.ok(project.sourceTitle)
  assert.match(project.lastReviewed, /^\d{4}-\d{2}-\d{2}$/)
})

test('submitted department mandates are represented and attributable', () => {
  const submittedSlugs = [
    'administration', 'finance-planning', 'works-engineering', 'health',
    'education-sports', 'natural-resources', 'trade-industry-led',
    'production-marketing', 'community-services', 'internal-audit', 'planning-unit',
  ]
  for (const slug of submittedSlugs) {
    const department = departments.find((item) => item.slug === slug)
    assert.ok(department)
    assert.ok(department.mandate)
    assert.ok(department.services.length)
    assert.ok(department.fieldSources.mandate)
    assert.ok(department.sourceTitle)
    assert.match(department.lastReviewed, /^\d{4}-\d{2}-\d{2}$/)
  }
  assert.deepEqual(departments.find((item) => item.slug === 'finance-planning').units, ['Revenue', 'Planning/Budgeting', 'Expenditure', 'Reporting'])
  assert.deepEqual(departments.find((item) => item.slug === 'community-services').units, ['Community Development', 'Probation and Social Welfare', 'Labour and Industrial Relations'])
})
