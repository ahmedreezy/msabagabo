<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  PhArrowRight,
  PhArrowUpRight,
  PhBlueprint,
  PhBookOpenText,
  PhBuildings,
  PhCaretLeft,
  PhCaretRight,
  PhChatCircleText,
  PhIdentificationCard,
  PhMegaphone,
  PhPause,
  PhPlay,
  PhBookOpenUser,
  PhBriefcase,
  PhReceipt,
  PhUsers,
} from '@phosphor-icons/vue'
import { citizenActions, projects, updates } from '../data/siteData'

const slides = [
  {
    eyebrow: 'Roads & drainage',
    title: 'Building a better connected municipality',
    description: 'Road and drainage improvements are opening safer routes for residents, businesses and public services.',
    image: '/images/road-project.jpg',
    alt: 'Road rehabilitation and drainage works in Makindye Ssabagabo Municipality',
  },
  {
    eyebrow: 'Education infrastructure',
    title: 'Better learning spaces for our children',
    description: 'New classroom facilities are expanding safe, practical learning environments for growing communities.',
    image: '/images/school-project.jpg',
    alt: 'Construction work on a municipal classroom block',
  },
  {
    eyebrow: 'Urban development',
    title: 'Investing in the places people use every day',
    description: 'Municipal projects are strengthening public infrastructure and supporting orderly urban growth.',
    image: '/images/municipal-project.jpg',
    alt: 'Municipal public infrastructure project in Makindye Ssabagabo',
  },
]

const actionIcons = {
  buildings: PhBuildings,
  users: PhUsers,
  blueprint: PhBlueprint,
  identification: PhIdentificationCard,
  passport: PhBookOpenUser,
  receipt: PhReceipt,
}

const actionClasses = ['gov-service-land', 'gov-service-hr', 'gov-service-bims', 'gov-service-id', 'gov-service-passport', 'gov-service-taxes']
const publicLinks = [
  { title: 'Publications', description: 'Reports, plans and public documents.', to: '/news#publications', icon: PhBookOpenText },
  { title: 'Tenders & opportunities', description: 'Current procurement and work opportunities.', to: '/opportunities', icon: PhBriefcase },
  { title: 'Council notices', description: 'Official notices and announcements.', to: '/news', icon: PhMegaphone },
  { title: 'Contact & feedback', description: 'Ask a question or share feedback.', to: '/contact', icon: PhChatCircleText },
]

const currentSlide = ref(0)
const isPlaying = ref(true)
let slideTimer

const clearSlideTimer = () => {
  if (slideTimer) window.clearInterval(slideTimer)
  slideTimer = undefined
}

const startSlideTimer = () => {
  clearSlideTimer()
  if (!isPlaying.value) return
  slideTimer = window.setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slides.length
  }, 8000)
}

const showSlide = (index) => {
  currentSlide.value = (index + slides.length) % slides.length
  startSlideTimer()
}

const togglePlayback = () => {
  isPlaying.value = !isPlaying.value
}

const handleCarouselKeydown = (event) => {
  if (event.key === 'ArrowLeft') showSlide(currentSlide.value - 1)
  if (event.key === 'ArrowRight') showSlide(currentSlide.value + 1)
}

watch(isPlaying, startSlideTimer)

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) isPlaying.value = false
  startSlideTimer()
})

onBeforeUnmount(clearSlideTimer)
</script>

<template>
  <div class="civic-home">
    <section class="works-carousel" aria-roledescription="carousel" aria-label="Municipal works" tabindex="0" @keydown="handleCarouselKeydown">
      <div class="works-carousel__slides">
        <figure v-for="(slide, index) in slides" :key="slide.title" class="works-slide" :class="{ 'is-active': currentSlide === index }" :aria-hidden="currentSlide !== index">
          <img :src="slide.image" :alt="currentSlide === index ? slide.alt : ''" />
        </figure>
      </div>

      <div class="site-container works-carousel__inner">
        <div class="works-carousel__copy" aria-live="polite" aria-atomic="true">
          <p>{{ slides[currentSlide].eyebrow }}</p>
          <h1>{{ slides[currentSlide].title }}</h1>
          <span class="identity-rule" aria-hidden="true"><i></i><i></i><i></i></span>
          <p class="works-carousel__description">{{ slides[currentSlide].description }}</p>
          <div class="works-carousel__actions">
            <RouterLink class="civic-button civic-button--primary" to="/projects">Explore our projects <PhArrowRight :size="18" weight="bold" /></RouterLink>
            <RouterLink class="civic-button civic-button--secondary" to="/contact">Report an issue</RouterLink>
          </div>
        </div>

        <button class="carousel-arrow carousel-arrow--previous" type="button" aria-label="Previous project" @click="showSlide(currentSlide - 1)"><PhCaretLeft :size="25" weight="bold" /></button>
        <button class="carousel-arrow carousel-arrow--next" type="button" aria-label="Next project" @click="showSlide(currentSlide + 1)"><PhCaretRight :size="25" weight="bold" /></button>

        <div class="carousel-status">
          <span>{{ String(currentSlide + 1).padStart(2, '0') }} / {{ String(slides.length).padStart(2, '0') }}</span>
          <div class="carousel-indicators" aria-label="Choose a project slide">
            <button v-for="(_, index) in slides" :key="index" type="button" :class="{ 'is-active': currentSlide === index }" :aria-label="`Show project ${index + 1}`" :aria-current="currentSlide === index ? 'true' : undefined" @click="showSlide(index)"></button>
          </div>
          <button class="carousel-playback" type="button" :aria-label="isPlaying ? 'Pause slideshow' : 'Play slideshow'" @click="togglePlayback">
            <PhPause v-if="isPlaying" :size="18" weight="fill" />
            <PhPlay v-else :size="18" weight="fill" />
          </button>
        </div>
      </div>
    </section>

    <RouterLink class="public-notice-bar" to="/news">
      <span class="public-notice-bar__label"><PhMegaphone :size="22" /> Public notice</span>
      <strong>Municipal complaints and grievance policy</strong>
      <span class="public-notice-bar__action">Read notice <PhArrowRight :size="18" weight="bold" /></span>
    </RouterLink>

    <section class="government-services" aria-labelledby="services-heading">
      <div class="site-container">
        <div class="government-services__heading">
          <div><p>Citizen services</p><h2 id="services-heading">Access government services</h2></div>
          <span>Start with the service you need.</span>
        </div>

        <div class="government-services__grid">
          <a v-for="(action, index) in citizenActions" :key="action.title" class="government-service" :class="actionClasses[index]" :href="action.href" target="_blank" rel="noreferrer">
            <span class="government-service__icon"><component :is="actionIcons[action.icon]" :size="64" weight="regular" /></span>
            <span class="government-service__content"><strong>{{ action.title }}</strong><small>{{ action.description }}</small><em>{{ action.domain }}</em></span>
            <span class="government-service__arrow"><PhArrowUpRight :size="20" weight="bold" /></span>
          </a>
        </div>

        <div class="government-services__help">
          <span>Need help finding the right service?</span>
          <RouterLink to="/contact">Contact the council <PhArrowRight :size="17" weight="bold" /></RouterLink>
          <RouterLink class="government-services__all" to="/services">View all service information</RouterLink>
        </div>
      </div>
    </section>

    <section class="municipality-story" aria-labelledby="municipality-heading">
      <div class="site-container municipality-story__layout">
        <figure class="municipality-story__media">
          <img src="/images/municipality-aerial.jpg" alt="Aerial view of an urban centre in Makindye Ssabagabo Municipality" />
          <figcaption>Masajja <i></i> Ndejje <i></i> Bunamwaya</figcaption>
        </figure>
        <div class="municipality-story__content">
          <span class="section-rule" aria-hidden="true"></span>
          <p class="municipality-story__eyebrow">Our municipality</p>
          <h2 id="municipality-heading">A growing urban centre in Greater Kampala</h2>
          <p>Makindye Ssabagabo brings together established communities, new neighbourhoods, commerce and public infrastructure across three divisions.</p>
          <dl class="municipality-facts">
            <div><dt>3</dt><dd>Municipal divisions</dd></div>
            <div><dt>84.7 km²</dt><dd>Municipal area</dd></div>
            <div><dt>9</dt><dd>Departments</dd></div>
          </dl>
          <div class="municipality-story__links">
            <RouterLink to="/about">Learn about the municipality <PhArrowRight :size="17" weight="bold" /></RouterLink>
            <RouterLink to="/departments">Explore departments <PhArrowRight :size="17" weight="bold" /></RouterLink>
          </div>
        </div>
      </div>
    </section>

    <section class="council-information">
      <div class="site-container council-information__layout">
        <div class="council-updates">
          <div class="council-updates__heading"><p>News & notices</p><h2>Latest from the council</h2><span>Current notices, decisions and municipal progress.</span></div>
          <article class="featured-update">
            <img :src="projects[0].image" :alt="projects[0].title" />
            <div><p>{{ updates[0].type }} <i></i> {{ updates[0].date }}</p><h3>{{ updates[0].title }}</h3><span>{{ updates[0].excerpt }}</span><RouterLink to="/news">View all updates <PhArrowRight :size="17" weight="bold" /></RouterLink></div>
          </article>
          <RouterLink v-for="update in updates.slice(1)" :key="update.title" class="compact-update" to="/news">
            <time>{{ update.date }}</time><span>{{ update.type }}</span><strong>{{ update.title }}</strong><PhArrowRight :size="19" weight="bold" />
          </RouterLink>
        </div>

        <aside class="public-information" aria-labelledby="public-info-heading">
          <p>Resources</p><h2 id="public-info-heading">Public information</h2>
          <RouterLink v-for="item in publicLinks" :key="item.title" class="public-information__link" :to="item.to">
            <span><component :is="item.icon" :size="30" weight="regular" /></span>
            <span><strong>{{ item.title }}</strong><small>{{ item.description }}</small></span>
            <PhArrowRight :size="21" weight="bold" />
          </RouterLink>
        </aside>
      </div>
    </section>
  </div>
</template>
