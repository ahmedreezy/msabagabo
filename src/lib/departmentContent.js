const makeId = (prefix, index, value = '') => {
  const slug = String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `${prefix}-${slug || index + 1}`
}

export const departmentSectors = (department = {}) => {
  const source = Array.isArray(department.sectors) && department.sectors.length
    ? department.sectors
    : (department.units || []).map((name) => ({ name }))

  return source.map((sector, index) => typeof sector === 'string'
    ? { id: makeId('sector', index, sector), name: sector, summary: '' }
    : {
        id: sector.id || makeId('sector', index, sector.name || sector.title),
        name: sector.name || sector.title || '',
        summary: sector.summary || sector.description || '',
      }).filter((sector) => sector.name)
}

export const departmentFaqs = (department = {}) => (Array.isArray(department.faqs) ? department.faqs : [])
  .map((faq, index) => ({
    id: faq.id || makeId('faq', index, faq.question),
    question: String(faq.question || '').trim(),
    answer: String(faq.answer || faq.response || '').trim(),
    sectorId: faq.sectorId || '',
  }))
  .filter((faq) => faq.question && faq.answer)

export const normalizeDepartmentContent = (department = {}) => ({
  ...department,
  sectors: departmentSectors(department),
  faqs: departmentFaqs(department),
})

export const allDepartmentFaqs = (departments = []) => departments.flatMap((department) =>
  departmentFaqs(department).map((faq) => ({
    ...faq,
    departmentName: department.name,
    departmentSlug: department.slug,
  })),
)
