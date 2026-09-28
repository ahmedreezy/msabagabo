import { emptyEducationProfile } from '../lib/educationProfile.js'

const sourceUrl = 'https://www.msabagabo.go.ug/education'
const draft = (id, data, reviewNote = 'Confirm this information with the Education department before publication.') => ({ id, ...data, sourceUrl, reviewed: false, reviewNote })

// This research pack is imported only by the editor and a DEV-only route branch.
// No school counts or historical ratios are treated as current statistics.
export const createEducationDraft = () => ({
  ...emptyEducationProfile(),
  reviewNotes: 'Confirm the reporting date and school classifications, current officers and contact routes. Review service guidance with the department. Add verified sports activities, dated project updates and documents. Do not publish the undated statistics on the source page.',
  guidance: [
    draft('education-enquiries', { title: 'Education enquiries', audience: 'Parents, guardians and school communities seeking education information.', steps: ['Use the school directory below to find a listed school.', 'Contact the council for guidance from the Education & Sports department.'], responsible: 'Education & Sports department' }, 'Draft navigation guidance. Confirm the municipal enquiry route and responsible officer.'),
    draft('school-inspection', { title: 'School standards and inspection', audience: 'Parents, school leaders and residents with concerns about school standards.', steps: ['Identify the school and the concern you would like the department to review.', 'Ask the council to connect you with the office responsible for school inspection.'], responsible: 'School inspection' }, 'Confirm the reporting procedure. These steps are a draft, not an established complaints process.'),
    draft('inclusive-education', { title: 'Inclusive education support', audience: 'Families and schools seeking guidance on support for learners with special needs.', steps: ['Contact the council to ask about available inclusive education guidance.'], responsible: 'Education & Sports department' }, 'Confirm available support and referral contacts. Do not imply that a particular placement or service is guaranteed.'),
    draft('sports', { title: 'Sports and co-curricular activities', audience: 'Schools and community groups seeking information about education and sports activities.', steps: ['Ask the department about current school sports and co-curricular activities.'], responsible: 'Education & Sports department' }, 'Confirm the current programme, calendar and contact officer.'),
  ],
  schools: [
    'Andrews Kaggwa PS', 'Busabala PS', 'Kigo Prisons PS', 'Kigo Lunya PS', 'Seguku PS',
    'Namasuba Umea PS', 'Nyanama Moslem PS', 'Lubugumu Umea PS', 'Mutungo Kitiiko PS',
    'Kibiri Church of Uganda PS', 'Kibiri Catholic School', 'St Gyaviira PS',
    'Bunamwaya Church of Uganda PS', 'Bunamwaya Catholic School', 'St Pius Masajja PS', 'Masajja Umea PS',
  ].map((name, index) => draft(`primary-${index + 1}`, { name, level: 'Primary', programme: 'UPE', location: '', phone: '', email: '' }))
    .concat(['Aggrey Memorial Senior Secondary School', 'Lubugumu Jamia Senior Secondary School'].map((name, index) => draft(`secondary-${index + 1}`, { name, level: 'Secondary', programme: 'USE', location: '', phone: '', email: '' })))
    .concat(['Awegys Christian Secondary School', 'Agrolinks Senior Secondary School', 'Global Harvest Senior Secondary School'].map((name, index) => draft(`partnership-${index + 1}`, { name, level: 'Secondary', programme: 'Partnership', location: '', phone: '', email: '' }))),
  units: [
    draft('inspection', { title: 'Inspection and school standards', description: 'Inspection, supervision and monitoring of schools, with support for school administration and management.' }),
    draft('oversight', { title: 'Education oversight', description: 'Coordination of education service delivery and improvements to teaching and learning environments.' }),
    draft('inclusion', { title: 'Special needs and inclusion', description: 'Support for inclusive education and attention to the needs of learners with disabilities.' }),
    draft('co-curricular', { title: 'Sports and co-curricular activities', description: 'Coordination of inclusive co-curricular activities and improvements to play facilities.' }),
  ],
  activities: [
    draft('namasuba-classrooms', { title: 'Classroom development at Namasuba UMEA Primary School', date: '', description: 'The municipal education page records phased construction of a storied school building.', image: '', caption: '' }, 'Historical achievement: confirm the date and present status, and obtain a photograph of this specific project.'),
    draft('lubugumu-classrooms', { title: 'Classroom block at Lubugumu UMEA Primary School', date: '', description: 'The municipal education page records a two-classroom block at the school.', image: '', caption: '' }, 'Historical achievement: confirm the date and present status, and obtain a photograph of this specific project.'),
  ],
})
