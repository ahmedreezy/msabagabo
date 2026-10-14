<script setup>
import { PhArrowRight, PhCheckCircle, PhMapPin } from '@phosphor-icons/vue'
import PageIntro from '../components/PageIntro.vue'

const divisions = [
  { name: 'Bunamwaya Division', description: 'An established urban division serving communities along the Kampala metropolitan edge.' },
  { name: 'Masajja Division', description: 'A growing residential and commercial division with expanding public service needs.' },
  { name: 'Ndejje Division', description: 'Home to the municipal headquarters at Ndejje-Zanta and several major service facilities.' },
]

const functions = [
  'Plan and maintain municipal roads, drainage and public infrastructure',
  'Coordinate public health, sanitation and environmental services',
  'Provide and supervise education and community development services',
  'Regulate physical development, trade, markets and public spaces',
  'Mobilise local revenue and manage municipal public resources',
  'Promote local economic development and citizen participation',
]
</script>

<template>
  <div>
    <PageIntro
      eyebrow="About the council"
      title="A municipality built around service"
      description="Makindye Ssabagabo Municipal Council is an urban local government in Wakiso District and part of the Greater Kampala Metropolitan Area."
    />

    <section class="bg-white py-16 sm:py-20 lg:py-24">
      <div class="site-container grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <p class="section-kicker">Our purpose</p>
          <h2 class="section-title mt-4">Planning a clean, prosperous municipality</h2>
        </div>
        <div class="grid gap-7 text-base leading-7 text-ink/64">
          <p>
            The council plans, regulates and delivers decentralized urban services for residents, businesses and communities across Bunamwaya, Masajja and Ndejje divisions.
          </p>
          <p>
            Its work is guided by the Local Governments Act and related laws governing public finance, health, education, physical planning, trade and the environment.
          </p>
          <div class="grid gap-4 bg-sage-50 p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.14em] text-civic-700">Vision</p>
              <p class="mt-3 font-extrabold leading-6 text-ink">A well-planned, clean and prosperous municipal council.</p>
            </div>
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.14em] text-civic-700">Mission</p>
              <p class="mt-3 font-extrabold leading-6 text-ink">To provide quality, cost-effective and sustainable urban services.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-civic-900 py-16 text-white sm:py-20 lg:py-24">
      <div class="site-container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <p class="section-kicker text-orange-300">Council mandate</p>
          <h2 class="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.045em] sm:text-4xl">Urban services with clear public responsibility</h2>
          <p class="mt-5 max-w-md text-sm leading-6 text-white/65">The Local Governments Act establishes the council's authority to provide and regulate municipal services.</p>
        </div>
        <div class="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <div v-for="item in functions" :key="item" class="flex gap-3 border-b border-white/12 pb-5">
            <PhCheckCircle class="mt-0.5 shrink-0 text-orange-300" :size="21" weight="fill" />
            <p class="text-sm font-semibold leading-6 text-white/82">{{ item }}</p>
          </div>
        </div>
      </div>
    </section>

    <section id="divisions" class="bg-canvas py-16 sm:py-20 lg:py-24">
      <div class="site-container">
        <div class="max-w-2xl">
          <p class="section-kicker">Local administration</p>
          <h2 class="section-title mt-4">Three municipal divisions</h2>
        </div>
        <div class="mt-10 grid gap-4 md:grid-cols-3">
          <article v-for="division in divisions" :key="division.name" class="bg-white p-6 shadow-soft sm:p-8">
            <PhMapPin class="text-orange-600" :size="27" weight="regular" />
            <h3 class="mt-8 text-xl font-extrabold tracking-[-0.03em]">{{ division.name }}</h3>
            <p class="mt-3 text-sm leading-6 text-ink/56">{{ division.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <section id="leadership" class="bg-white py-16 sm:py-20 lg:py-24">
      <div class="site-container grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <img class="aspect-[4/3] w-full object-cover" src="/images/municipality-aerial.jpg" alt="Municipal team at Makindye Ssabagabo offices" />
        <div>
          <p class="section-kicker">Leadership and accountability</p>
          <h2 class="section-title mt-4">Political direction. Technical delivery.</h2>
          <p class="section-description">The Mayor and Municipal Council provide political leadership. The Town Clerk leads technical administration and implementation.</p>
          <RouterLink class="text-link mt-7" to="/departments">Meet the departments <PhArrowRight :size="17" weight="bold" /></RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>
