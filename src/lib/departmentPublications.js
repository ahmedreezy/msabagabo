const normalized = (value) => String(value || '').trim().toLocaleLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim()

export const departmentPublications = (department, publications = []) => {
  if (!department) return []
  const departmentNames = new Set([department.name, department.shortName, department.lead].map(normalized).filter(Boolean))

  return publications
    .filter((publication) => publication.departmentSlug === department.slug || departmentNames.has(normalized(publication.department)))
    .sort((a, b) => Date.parse(b.publishedDate || b.date || '') - Date.parse(a.publishedDate || a.date || ''))
}

