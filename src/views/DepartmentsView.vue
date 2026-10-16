<script setup>
import { computed } from 'vue'
import { PhArrowRight, PhBellRinging, PhUserCircle } from '@phosphor-icons/vue'
import PageIntro from '../components/PageIntro.vue'
import { cmsContent } from '../stores/cmsContent'
import { departmentSectors } from '../lib/departmentContent.js'
import { departmentPublications } from '../lib/departmentPublications.js'

const departments = computed(() => cmsContent.departments.map((department) => {
  const featuredLeader = department.featureTeamAsLeadership
    ? department.team?.find((member) => member?.name || member?.photo)
    : null

  return {
    ...department,
    directoryLeader: {
      name: department.hodName || featuredLeader?.name || department.hodTitle || department.lead || 'Profile being updated',
      role: department.hodTitle || featuredLeader?.role || department.lead || '',
      photo: department.hodPhoto || featuredLeader?.photo || '',
      label: featuredLeader && !department.hodName ? 'Department leadership' : 'Head of Department',
    },
    sectorCount: departmentSectors(department).length,
    noticeCount: departmentPublications(department, cmsContent.publications).length,
  }
}))
</script>

<template>
  <div class="departments-page">
    <PageIntro eyebrow="Municipal administration" title="Departments and units" description="Meet departmental leadership, find public services, read official notices and contact the office responsible for your enquiry." />

    <section class="department-directory" aria-labelledby="department-directory-title">
      <div class="site-container">
        <header class="department-directory__heading">
          <div><p class="section-kicker">Council service directory</p><h2 id="department-directory-title">Choose a department</h2></div>
          <p>Each page brings together the department’s mandate, HOD, services, official documents and public contact routes.</p>
        </header>

        <div class="department-directory__grid">
          <article v-for="(department, index) in departments" :key="department.slug" class="department-directory-card">
            <div class="department-directory-card__number">{{ String(index + 1).padStart(2, '0') }}</div>
            <div class="department-directory-card__body">
              <div class="department-directory-card__lead">
                <img v-if="department.directoryLeader.photo" :src="department.directoryLeader.photo" :alt="`${department.directoryLeader.name}${department.directoryLeader.role ? `, ${department.directoryLeader.role}` : ''}`" loading="lazy" />
                <span v-else><PhUserCircle :size="30" weight="duotone" /></span>
                <div><small>{{ department.directoryLeader.label }}</small><strong>{{ department.directoryLeader.name }}</strong></div>
              </div>
              <h2>{{ department.name }}</h2>
              <p>{{ department.summary }}</p>
              <dl><div><dt>Structure</dt><dd>{{ department.sectorCount }} {{ department.sectorCount === 1 ? 'sector' : 'sectors' }}</dd></div><div><dt>Notice board</dt><dd><PhBellRinging :size="14" />{{ department.noticeCount }} {{ department.noticeCount === 1 ? 'document' : 'documents' }}</dd></div></dl>
              <RouterLink :to="`/departments/${department.slug}`">Open department page <PhArrowRight :size="17" weight="bold" /></RouterLink>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.departments-page { background: #f3f4f2; }
.department-directory { padding-block: clamp(4rem, 7vw, 7rem); }
.department-directory__heading { display: grid; grid-template-columns: minmax(0, 1fr) minmax(18rem, .55fr); gap: 3rem; align-items: end; border-bottom: 1px solid rgb(23 35 58 / .14); padding-bottom: 1.7rem; }
.department-directory__heading h2 { margin-top: .65rem; color: #17233a; font-size: clamp(2.2rem, 4vw, 3.7rem); font-weight: 840; letter-spacing: -.055em; line-height: 1; }
.department-directory__heading > p { max-width: 34rem; color: rgb(23 35 58 / .62); font-size: .86rem; line-height: 1.75; }
.department-directory__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 2rem; border-top: 1px solid rgb(23 35 58 / .12); }
.department-directory-card { display: grid; grid-template-columns: 3.5rem minmax(0, 1fr); border-bottom: 1px solid rgb(23 35 58 / .12); padding: 1.8rem 1.8rem 2rem 0; }.department-directory-card:nth-child(odd) { border-right: 1px solid rgb(23 35 58 / .12); }.department-directory-card:nth-child(even) { padding-left: 1.8rem; }
.department-directory-card__number { color: #8f3f48; font-family: ui-monospace, monospace; font-size: .7rem; font-weight: 850; font-variant-numeric: tabular-nums; }
.department-directory-card__body { display: flex; min-width: 0; flex-direction: column; }
.department-directory-card__lead { display: grid; grid-template-columns: 3.25rem minmax(0, 1fr); gap: .75rem; align-items: center; }.department-directory-card__lead img,.department-directory-card__lead > span { width: 3.25rem; height: 3.75rem; background: #e4e7e5; object-fit: cover; }.department-directory-card__lead > span { display: grid; place-items: center; color: #667085; }.department-directory-card__lead small,.department-directory-card__lead strong { display: block; }.department-directory-card__lead small { color: #8f3f48; font-size: .57rem; font-weight: 850; letter-spacing: .07em; text-transform: uppercase; }.department-directory-card__lead strong { margin-top: .2rem; overflow-wrap: anywhere; color: #475467; font-size: .72rem; line-height: 1.4; }
.department-directory-card h2 { margin-top: 1.3rem; color: #17233a; font-size: clamp(1.25rem, 2vw, 1.7rem); font-weight: 820; letter-spacing: -.035em; line-height: 1.15; }.department-directory-card__body > p { max-width: 42rem; margin-top: .7rem; color: rgb(23 35 58 / .6); font-size: .78rem; line-height: 1.7; }
.department-directory-card dl { display: flex; flex-wrap: wrap; gap: .8rem 1.4rem; margin-top: 1.2rem; }.department-directory-card dl div { display: flex; gap: .4rem; font-size: .65rem; }.department-directory-card dt { color: rgb(23 35 58 / .45); }.department-directory-card dd { display: inline-flex; align-items: center; gap: .25rem; color: #344054; font-weight: 750; }
.department-directory-card a { display: inline-flex; align-items: center; align-self: flex-start; gap: .5rem; margin-top: 1.5rem; color: #8f3f48; font-size: .75rem; font-weight: 820; }.department-directory-card a svg { transition: transform 220ms ease; }.department-directory-card a:hover svg { transform: translateX(.25rem); }.department-directory-card a:focus-visible { outline: 3px solid rgb(143 63 72 / .3); outline-offset: 4px; }
@media (max-width: 780px) { .department-directory__heading { grid-template-columns: 1fr; gap: 1rem; }.department-directory__grid { grid-template-columns: 1fr; }.department-directory-card,.department-directory-card:nth-child(even) { border-right: 0; padding: 1.5rem 0; } }
@media (max-width: 480px) { .department-directory-card { grid-template-columns: 2rem minmax(0, 1fr); }.department-directory-card dl { flex-direction: column; gap: .35rem; } }
</style>
