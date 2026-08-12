<script setup>
import { PhArrowRight, PhDownloadSimple, PhFilePdf } from '@phosphor-icons/vue'
import PageIntro from '../components/PageIntro.vue'
import { publications, updates } from '../data/siteData'
</script>

<template>
  <div>
    <PageIntro eyebrow="Council newsroom" title="News & resources" description="Read public notices, municipal updates, reports and official publications." />
    <section class="bg-white py-16 sm:py-20 lg:py-24">
      <div class="site-container">
        <h2 class="section-title">Latest updates</h2>
        <div class="mt-10 grid gap-6 lg:grid-cols-3">
          <article v-for="update in updates" :key="update.title" class="overflow-hidden bg-canvas">
            <img class="aspect-[16/10] w-full object-cover" :src="update.image" :alt="update.title" />
            <div class="p-6">
              <p class="content-meta">{{ update.type }} <span>/</span> {{ update.date }}</p>
              <h3 class="mt-3 text-xl font-extrabold leading-tight tracking-[-0.03em]">{{ update.title }}</h3>
              <p class="mt-3 text-sm leading-6 text-ink/56">{{ update.excerpt }}</p>
              <a class="text-link mt-5" href="#">Read update <PhArrowRight :size="16" weight="bold" /></a>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section id="publications" class="bg-sage-50 py-16 sm:py-20 lg:py-24">
      <div class="site-container grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
        <div>
          <p class="section-kicker">Document library</p>
          <h2 class="section-title mt-4">Publications</h2>
          <p class="section-description">Official plans, reports, budgets and service standards.</p>
        </div>
        <div class="grid gap-3">
          <a v-for="publication in publications" :key="publication.title" class="group flex items-center gap-4 bg-white p-5 transition duration-500 ease-premium hover:-translate-y-0.5 hover:shadow-soft" href="#">
            <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-orange-50 text-orange-700"><PhFilePdf :size="22" /></span>
            <div class="min-w-0 flex-1">
              <p class="font-extrabold text-ink">{{ publication.title }}</p>
              <p class="mt-1 text-xs font-semibold text-ink/45">{{ publication.category }} · {{ publication.format }}</p>
            </div>
            <PhDownloadSimple class="shrink-0 text-ink/30 group-hover:text-civic-700" :size="20" weight="bold" />
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

