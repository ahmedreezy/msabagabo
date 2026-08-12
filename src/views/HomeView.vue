<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  PhArrowRight, PhArrowUpRight, PhBlueprint, PhBuildings, PhIdentificationCard,
  PhMagnifyingGlass, PhMapPinArea, PhMegaphone, PhBookOpenUser, PhReceipt, PhUsers,
} from '@phosphor-icons/vue'
import { citizenActions, departments, projects, stats, updates } from '../data/siteData'

const router = useRouter()
const query = ref('')
const actionIcons = { buildings: PhBuildings, users: PhUsers, blueprint: PhBlueprint, identification: PhIdentificationCard, passport: PhBookOpenUser, receipt: PhReceipt }
const actionClasses = ['service-land', 'service-hr', 'service-bims', 'service-id', 'service-passport', 'service-taxes']
const submitSearch = () => router.push({ path: '/services', query: query.value ? { q: query.value } : {} })
</script>

<template>
  <div class="home-page">
    <section class="urban-hero">
      <div class="urban-hero__map" aria-hidden="true"></div>
      <div class="urban-hero__layout">
        <div class="urban-hero__content">
          <div class="uganda-marker" aria-hidden="true"><i></i><i></i><i></i></div>
          <p class="urban-hero__eyebrow">Makindye Ssabagabo Municipal Council</p>
          <h1>A city that<br />works for you.</h1>
          <p class="urban-hero__copy">Services, projects and public information—made easier to find.</p>
          <form class="urban-search" role="search" @submit.prevent="submitSearch">
            <label class="sr-only" for="home-search">Search municipal services and information</label>
            <PhMagnifyingGlass :size="25" weight="regular" aria-hidden="true" />
            <input id="home-search" v-model="query" type="search" placeholder="Find a service or information" />
            <button type="submit" aria-label="Search"><PhArrowRight :size="23" weight="bold" /></button>
          </form>
          <div class="urban-hero__actions">
            <RouterLink class="hero-button hero-button--gold" to="/services">Explore services <span><PhArrowRight :size="17" weight="bold" /></span></RouterLink>
            <RouterLink class="hero-button hero-button--outline" to="/contact">Report an issue <span><PhArrowUpRight :size="17" weight="bold" /></span></RouterLink>
          </div>
        </div>
        <div class="urban-hero__media">
          <img src="/images/urban-road.jpg" alt="Urban road corridor in Makindye Ssabagabo Municipality" />
          <div class="hero-location"><PhMapPinArea :size="18" weight="fill" /> Kigo–Lweza corridor</div>
          <RouterLink class="hero-notice" to="/news">
            <span class="hero-notice__icon"><PhMegaphone :size="27" weight="regular" /></span>
            <span><small>Public notice</small><strong>Municipal complaints and grievance policy</strong></span>
            <PhArrowRight class="hero-notice__arrow" :size="20" weight="bold" />
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="service-gateway">
      <div class="site-container">
        <div class="editorial-heading">
          <div><div class="uganda-marker" aria-hidden="true"><i></i><i></i><i></i></div><h2>Start with<br />what you need</h2></div>
          <p>Direct access to the public services residents use most.</p>
        </div>
        <div class="service-mosaic">
          <a v-for="(action, index) in citizenActions" :key="action.title" class="service-tile group" :class="actionClasses[index]" :href="action.href" target="_blank" rel="noreferrer">
            <span class="service-tile__number">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="service-tile__graphic"><component class="service-tile__icon" :is="actionIcons[action.icon]" :size="58" weight="regular" /></span>
            <span class="service-tile__body"><strong>{{ action.title }}</strong><small>{{ action.description }}</small></span>
            <span class="service-tile__arrow"><PhArrowUpRight :size="18" weight="bold" /></span>
          </a>
        </div>
        <RouterLink class="service-help" to="/contact"><span>Not sure where to start?</span><strong>Contact the council</strong><span class="service-help__arrow"><PhArrowRight :size="20" weight="bold" /></span></RouterLink>
      </div>
    </section>

    <section class="municipal-facts" aria-label="Municipal facts">
      <div class="site-container municipal-facts__grid"><div v-for="item in stats" :key="item.label" class="municipal-fact"><strong>{{ item.value }}</strong><span>{{ item.label }}</span></div></div>
    </section>

    <section class="department-index">
      <div class="department-index__map" aria-hidden="true"></div>
      <div class="site-container department-index__layout">
        <div class="department-index__intro">
          <div class="uganda-marker uganda-marker--light" aria-hidden="true"><i></i><i></i><i></i></div>
          <h2>The offices<br />behind the city</h2>
          <p>Clear mandates. Practical services.<br />People you can reach.</p>
          <div class="department-index__image"><img src="/images/contract-signing.jpg" alt="Municipal officers at an official project contract event" /></div>
        </div>
        <div class="department-index__list">
          <RouterLink v-for="(department, index) in departments.slice(0, 6)" :key="department.slug" class="department-index__row group" :to="`/departments/${department.slug}`">
            <span>{{ String(index + 1).padStart(2, '0') }}</span><strong>{{ department.shortName }}</strong><i><PhArrowRight :size="19" weight="bold" /></i>
          </RouterLink>
          <RouterLink class="department-index__all" to="/departments">View all departments <PhArrowRight :size="19" weight="bold" /></RouterLink>
        </div>
      </div>
    </section>

    <section class="progress-section">
      <div class="site-container">
        <div class="editorial-heading editorial-heading--progress">
          <div><div class="uganda-marker" aria-hidden="true"><i></i><i></i><i></i></div><h2>Progress you<br />can see</h2></div>
          <p>Follow the roads, schools and public facilities being delivered across the municipality.</p>
        </div>
        <div class="progress-layout">
          <article class="progress-feature">
            <img :src="projects[0].image" :alt="projects[0].title" />
            <div class="progress-feature__caption"><small>{{ projects[0].sector }}</small><h3>{{ projects[0].title }}</h3><p>{{ projects[0].status }}</p><RouterLink to="/projects">View all projects <PhArrowRight :size="17" weight="bold" /></RouterLink></div>
          </article>
          <aside class="council-latest">
            <img :src="projects[1].image" :alt="projects[1].title" />
            <div class="council-latest__content">
              <p class="section-kicker">Latest from the council</p><h3>News, notices and decisions</h3>
              <RouterLink v-for="update in updates.slice(0, 2)" :key="update.title" class="latest-row" to="/news"><small>{{ update.date }}</small><strong>{{ update.title }}</strong><PhArrowUpRight :size="17" weight="bold" /></RouterLink>
              <RouterLink class="latest-all" to="/news">All updates <PhArrowRight :size="17" weight="bold" /></RouterLink>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section class="civic-cta">
      <div class="site-container civic-cta__layout"><div><p>We are here to help</p><h2>Talk to the right municipal office.</h2></div><RouterLink class="civic-cta__button" to="/contact">Contact the council <span><PhArrowUpRight :size="19" weight="bold" /></span></RouterLink></div>
    </section>
  </div>
</template>
