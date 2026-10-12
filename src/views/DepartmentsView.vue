<script setup>
import { computed } from 'vue'
import { PhArrowRight } from '@phosphor-icons/vue'
import { cmsContent, getPagePresentation } from '../stores/cmsContent'

const departments = computed(() => cmsContent.departments)
const presentation = computed(() => getPagePresentation('directorates'))
</script>

<template>
  <div>
    <section class="directorates-hero">
      <div class="site-container directorates-hero__layout">
        <div class="directorates-hero__copy">
          <nav aria-label="Breadcrumb"><RouterLink to="/">Home</RouterLink><span aria-hidden="true">/</span><span aria-current="page">Directorates</span></nav>
          <p>Municipal administration</p>
          <h1>Directorates</h1>
          <div>Find each directorate’s mandate, legal authority, services, units and contact information.</div>
        </div>
        <figure v-if="presentation?.image" class="directorates-hero__media">
          <img :src="presentation.image" :alt="presentation.imageAlt" />
          <figcaption v-if="presentation.isIllustrative">{{ presentation.credit || 'Illustrative visual' }}</figcaption>
        </figure>
      </div>
    </section>
    <section class="bg-white py-16 sm:py-20 lg:py-24">
      <div class="site-container cms-responsive-grid grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="department in departments"
          :key="department.slug"
          class="cms-department-card group flex min-h-72 flex-col bg-canvas p-6 shadow-[inset_0_0_0_1px_rgba(23,35,58,0.06)] transition duration-500 ease-premium hover:-translate-y-1 hover:bg-white hover:shadow-soft sm:p-8"
          :to="`/directorates/${department.slug}`"
        >
          <p class="text-xs font-bold uppercase tracking-[0.14em] text-civic-700">Directorate</p>
          <h2 class="mt-5 text-xl font-extrabold leading-tight tracking-[-0.035em] text-ink">{{ department.name }}</h2>
          <p class="mt-4 flex-1 text-sm leading-6 text-ink/56">{{ department.summary }}</p>
          <span class="mt-7 inline-flex items-center gap-2 text-sm font-bold text-civic-700">
            View directorate
            <PhArrowRight class="transition-transform duration-500 ease-premium group-hover:translate-x-1" :size="17" weight="bold" />
          </span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.directorates-hero { border-bottom: 1px solid #d8dee8; background: #edf0f4; }
.directorates-hero__layout { display: grid; min-height: 30rem; grid-template-columns: minmax(0, 1.05fr) minmax(22rem, .95fr); align-items: center; gap: clamp(2rem, 6vw, 6rem); padding-block: clamp(3rem, 6vw, 5.5rem); }
.directorates-hero__copy nav { display: flex; gap: .65rem; margin-bottom: 3rem; color: #667085; font-size: .75rem; font-weight: 650; }
.directorates-hero__copy nav a:hover { color: #71323a; }
.directorates-hero__copy > p { color: #3d5070; font-size: .72rem; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }
.directorates-hero__copy h1 { margin-top: .8rem; color: #151b26; font-size: clamp(3.3rem, 6vw, 6rem); font-weight: 850; line-height: .96; letter-spacing: -.06em; text-wrap: balance; }
.directorates-hero__copy > div { max-width: 39rem; margin-top: 1.25rem; color: #667085; font-size: clamp(1rem, 1.4vw, 1.15rem); line-height: 1.75; }
.directorates-hero__media { position: relative; margin: 0; overflow: hidden; background: #17233a; box-shadow: 1.2rem 1.2rem 0 rgb(23 35 58 / .08); }
.directorates-hero__media::before { position: absolute; z-index: 1; inset: 0; border: 1px solid rgb(255 255 255 / .18); content: ''; pointer-events: none; }
.directorates-hero__media img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; }
.directorates-hero__media figcaption { position: absolute; z-index: 2; right: .65rem; bottom: .65rem; background: rgb(23 35 58 / .82); padding: .35rem .5rem; color: white; font-size: .58rem; font-weight: 700; }
@media (max-width: 800px) {
  .directorates-hero__layout { min-height: auto; grid-template-columns: 1fr; padding-block: 2rem 3.5rem; }
  .directorates-hero__copy nav { margin-bottom: 2rem; }
  .directorates-hero__media { width: min(100%, 36rem); box-shadow: .75rem .75rem 0 rgb(23 35 58 / .08); }
}
</style>
