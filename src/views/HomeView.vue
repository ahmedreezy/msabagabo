<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import {
  PhArrowRight,
  PhArrowUpRight,
  PhBookOpenText,
  PhChalkboardTeacher,
  PhChatCircleText,
  PhCloud,
  PhCloudFog,
  PhCloudLightning,
  PhCloudRain,
  PhCloudSun,
  PhFirstAidKit,
  PhGraduationCap,
  PhHouseLine,
  PhLeaf,
  PhMapPin,
  PhMapTrifold,
  PhMegaphone,
  PhRoadHorizon,
  PhSealCheck,
  PhSun,
  PhUsersThree,
  PhWind,
} from '@phosphor-icons/vue'
import PageHero from '../components/PageHero.vue'
import { cmsContent, formatCmsDate } from '../stores/cmsContent'

const quickFacts = [
  { term: 'Mandate', detail: 'Plan, regulate and deliver sustainable urban services.' },
  { term: 'Location', detail: 'Greater Kampala, Wakiso District, toward Lake Victoria.' },
  { term: 'Lower units', detail: '3 divisions · 8 wards · 55 cells / villages.' },
  { term: 'Public purpose', detail: 'A well-planned, clean and prosperous municipality.' },
]

const statisticIcons = {
  users: PhUsersThree,
  map: PhMapTrifold,
  pin: PhMapPin,
  home: PhHouseLine,
  education: PhChalkboardTeacher,
  health: PhFirstAidKit,
}

const projects = computed(() => cmsContent.projects)
const updates = computed(() => cmsContent.updates)
const leadership = computed(() => cmsContent.leadership)
const statistics = computed(() => cmsContent.stats.map((stat) => ({ ...stat, icon: statisticIcons[stat.icon] || PhUsersThree })))

const achievements = [
  {
    title: 'Stronger road maintenance capacity',
    description: 'A municipal road grader was acquired using locally generated property-tax revenue.',
    icon: PhRoadHorizon,
  },
  {
    title: 'Expanded learning infrastructure',
    description: 'Classroom blocks, sanitation facilities, rainwater tanks and desks have been delivered to municipal schools.',
    icon: PhGraduationCap,
  },
  {
    title: 'Supported universal education',
    description: 'Sixteen primary schools and two secondary schools receive government capitation support.',
    icon: PhBookOpenText,
  },
  {
    title: 'Improved organised transport',
    description: 'Lubugumu and Busingiri–Nyanama taxi parks were opened to support safer urban mobility.',
    icon: PhSealCheck,
  },
]

const notices = [
  {
    type: 'Public consultation',
    title: 'Submit views on the Waste Management Bill',
    date: 'Open notice',
    to: '/news',
  },
  {
    type: 'Procurement',
    title: 'Current tenders and bidding opportunities',
    date: 'Supplier information',
    to: '/tenders',
  },
  {
    type: 'Citizen information',
    title: 'Municipal Clients’ Charter 2023/24–2025/26',
    date: 'Service standards',
    to: '/news#publications',
  },
]

const resources = [
  { name: 'NIRA', description: 'National identification services', href: 'https://www.nira.go.ug/', logo: '/images/government-logos/nira.png', logoClass: 'government-resources__logo--wide', logoAlt: 'National Identification and Registration Authority logo' },
  { name: 'URA', description: 'Tax registration and payments', href: 'https://ura.go.ug/', logo: '/images/government-logos/ura.png', logoClass: 'government-resources__logo--ura', logoAlt: 'Uganda Revenue Authority logo' },
  { name: 'Passport Services', description: 'Apply for or track a passport', href: 'https://www.passports.go.ug/', logo: '/images/government-logos/passport-dcic.png', logoClass: 'government-resources__logo--seal', logoAlt: 'Directorate of Citizenship and Immigration Control logo' },
  { name: 'BIMS', description: 'Building application services', href: 'https://bims.go.ug/', logo: '/images/government-logos/bims-nbrb.png', logoClass: 'government-resources__logo--wide', logoAlt: 'National Building Review Board logo' },
  { name: 'Ministry of Local Government', description: 'National local government information', href: 'https://molg.go.ug/', logo: '/images/government-logos/uganda-coat-of-arms.png', logoClass: 'government-resources__logo--coat', logoAlt: 'Coat of arms of Uganda' },
  { name: 'Wakiso District', description: 'District services and information', href: 'https://www.wakiso.go.ug/', logo: '/images/government-logos/wakiso.png', logoClass: 'government-resources__logo--wide', logoAlt: 'Wakiso District Local Government logo' },
  { name: 'NSSF Uganda', description: 'Social security member services', href: 'https://www.nssfug.org/', logo: '/images/government-logos/nssf.png', logoClass: 'government-resources__logo--nssf', logoAlt: 'National Social Security Fund Uganda logo' },
  { name: 'Government of Uganda', description: 'National government portal', href: 'https://www.gou.go.ug/', logo: '/images/government-logos/uganda-coat-of-arms.png', logoClass: 'government-resources__logo--coat', logoAlt: 'Coat of arms of Uganda' },
]

const weatherConditions = {
  Clear: { icon: PhSun, className: 'is-clear' },
  'Partly cloudy': { icon: PhCloudSun, className: 'is-partly-cloudy' },
  Cloudy: { icon: PhCloud, className: 'is-cloudy' },
  'Light rain': { icon: PhCloudRain, className: 'is-light-rain' },
  'Heavy rain': { icon: PhCloudRain, className: 'is-heavy-rain' },
  Thunderstorm: { icon: PhCloudLightning, className: 'is-thunderstorm' },
  Windy: { icon: PhWind, className: 'is-windy' },
  Foggy: { icon: PhCloudFog, className: 'is-foggy' },
}

const environmentBulletin = computed(() => cmsContent.environment?.[0] || null)
const weatherVisual = computed(() => weatherConditions[environmentBulletin.value?.weatherCondition] || weatherConditions.Cloudy)
const airQuality = computed(() => {
  const value = Number(environmentBulletin.value?.aqi)
  if (!Number.isFinite(value)) return { label: 'Not available', className: 'is-unavailable', level: 0 }
  if (value <= 50) return { label: 'Good', className: 'is-good', level: 1 }
  if (value <= 100) return { label: 'Moderate', className: 'is-moderate', level: 2 }
  if (value <= 150) return { label: 'Unhealthy for sensitive groups', className: 'is-sensitive', level: 3 }
  if (value <= 200) return { label: 'Unhealthy', className: 'is-unhealthy', level: 4 }
  if (value <= 300) return { label: 'Very unhealthy', className: 'is-very-unhealthy', level: 5 }
  return { label: 'Hazardous', className: 'is-hazardous', level: 6 }
})

const kampalaDateKey = (value = new Date()) => new Intl.DateTimeFormat('en-CA', {
  year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Africa/Nairobi',
}).format(value)
const bulletinIsToday = computed(() => environmentBulletin.value?.date === kampalaDateKey())
const environmentDateLabel = computed(() => environmentBulletin.value?.date ? formatCmsDate(environmentBulletin.value.date) : '')
const displayReading = (value) => value === 0 || value ? value : '—'

const pageRoot = ref(null)
const statisticsGrid = ref(null)
const animatedStatistics = ref(statistics.value.map(() => '0'))
const quickFactsRail = ref(null)
const leadershipRail = ref(null)
const projectsRail = ref(null)
const resourcesRail = ref(null)
const railState = reactive({ quickFacts: 0, leadership: 0, projects: 0, resources: 0 })
let revealObserver
let statisticsObserver
let countAnimationFrame

const animateStatistics = () => {
  if (countAnimationFrame) window.cancelAnimationFrame(countAnimationFrame)
  const numericValue = (value) => {
    const normalized = String(value ?? '').trim().replace(/,/g, '')
    return /^-?\d+(?:\.\d+)?$/.test(normalized) ? Number(normalized) : null
  }
  const targets = statistics.value.map((stat) => numericValue(stat.value))
  animatedStatistics.value = statistics.value.map((stat, index) => targets[index] == null ? stat.value : '0')

  const duration = 2000
  const startedAt = performance.now()

  const tick = (now) => {
    const progress = Math.min((now - startedAt) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 4)
    animatedStatistics.value = targets.map((target, index) => target == null
      ? statistics.value[index].value
      : Math.round(target * eased).toLocaleString('en-UG'))
    if (progress < 1) countAnimationFrame = window.requestAnimationFrame(tick)
  }

  countAnimationFrame = window.requestAnimationFrame(tick)
}

const updateRailPosition = (event, key) => {
  const rail = event.currentTarget
  const items = Array.from(rail.children)
  if (!items.length) return

  railState[key] = items.reduce((closest, item, index) => {
    const distance = Math.abs((item.offsetLeft - rail.offsetLeft) - rail.scrollLeft)
    return distance < closest.distance ? { index, distance } : closest
  }, { index: 0, distance: Number.POSITIVE_INFINITY }).index
}

const scrollRailTo = (rail, index) => {
  const item = rail?.children?.[index]
  if (!item) return
  rail.scrollTo({ left: item.offsetLeft - rail.offsetLeft, behavior: 'smooth' })
}

onMounted(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reducedMotion) {
    animatedStatistics.value = statistics.value.map((stat) => stat.value)
  } else {
    if ('IntersectionObserver' in window) {
      statisticsObserver = new IntersectionObserver(([entry]) => {
        if (!entry?.isIntersecting) return
        animateStatistics()
        statisticsObserver.disconnect()
      }, { threshold: 0.01, rootMargin: '0px 0px -4% 0px' })
      if (statisticsGrid.value) statisticsObserver.observe(statisticsGrid.value)
    } else {
      animateStatistics()
    }
  }

  if (!reducedMotion) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        revealObserver.unobserve(entry.target)
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
    pageRoot.value?.querySelectorAll('.home-reveal').forEach((element) => revealObserver.observe(element))
  } else {
    pageRoot.value?.querySelectorAll('.home-reveal').forEach((element) => element.classList.add('is-visible'))
  }
})

onBeforeUnmount(() => {
  revealObserver?.disconnect()
  statisticsObserver?.disconnect()
  if (countAnimationFrame) window.cancelAnimationFrame(countAnimationFrame)
})
</script>

<template>
  <div ref="pageRoot" class="civic-home enhanced-home">
    <PageHero
      page-key="home"
      variant="signature"
      :show-breadcrumb="false"
      secondary-label="Report an issue"
      secondary-to="/contact#e8ebf0ck"
      data-nav-section="/"
    />

    <section class="home-leadership" data-nav-section="/about" aria-labelledby="leadership-heading">
      <div class="site-container">
        <div class="leadership-compact-heading home-reveal">
          <div><p class="home-eyebrow"><span>01</span> Our team</p><h2 id="leadership-heading">Meet the MSMC leadership team.</h2></div>
          <p>Political direction and technical administration working together for dependable public services.</p>
        </div>

        <div class="leadership-showcase home-reveal" id="leadership">
          <div ref="leadershipRail" class="leadership-grid" @scroll.passive="updateRailPosition($event, 'leadership')">
            <article v-for="(leader, index) in leadership" :key="leader._cmsId || leader.slug || leader.id || index" class="leadership-card" :class="[`leadership-card--${leader.id || leader.slug || 'officer'}`, { 'is-rail-active': railState.leadership === index }]">
              <div class="leadership-card__portrait" :class="{ 'leadership-card__portrait--image': leader.image }" :aria-hidden="leader.image ? undefined : 'true'">
                <img v-if="leader.image" :src="leader.image" :alt="`${leader.name || leader.office}, ${leader.role}`" loading="lazy" decoding="async" />
                <span v-else>{{ leader.mark }}</span>
              </div>
              <div>
                <p>{{ leader.role }}</p>
                <h3>{{ leader.name || leader.office }}</h3>
                <span v-if="leader.name" class="leadership-card__office">{{ leader.office }}</span>
                <span class="leadership-card__description">{{ leader.description }}</span>
              </div>
            </article>
          </div>
          <div class="mobile-slide-indicator" aria-label="Leadership slides">
            <button v-for="(_, index) in leadership" :key="index" type="button" :class="{ 'is-active': railState.leadership === index }" :aria-label="`Show leadership slide ${index + 1}`" :aria-current="railState.leadership === index ? 'true' : undefined" @click="scrollRailTo(leadershipRail, index)"></button>
          </div>
          <RouterLink class="home-text-link leadership-showcase__link" to="/about#leadership">View leadership structure <span><PhArrowRight :size="16" weight="bold" /></span></RouterLink>
        </div>
      </div>
    </section>

    <section v-if="environmentBulletin" class="daily-environment" aria-labelledby="daily-environment-heading">
      <div class="site-container">
        <header class="daily-environment__heading home-reveal">
          <div><p class="home-eyebrow"><span>Daily</span> Public environment</p><h2 id="daily-environment-heading">Today in {{ environmentBulletin.location || 'Makindye Ssabagabo' }}</h2></div>
          <p :class="{ 'is-stale': !bulletinIsToday }"><span></span>{{ bulletinIsToday ? 'Today’s bulletin' : `Latest available · ${environmentDateLabel}` }}</p>
        </header>

        <div class="daily-environment__readings home-reveal">
          <article class="weather-reading" :class="weatherVisual.className">
            <div class="weather-reading__ambient" aria-hidden="true"><i></i><i></i><i></i></div>
            <div class="weather-scene" aria-hidden="true">
              <span class="weather-scene__sun"></span>
              <span class="weather-scene__cloud weather-scene__cloud--back"><i></i><i></i><i></i></span>
              <span class="weather-scene__cloud weather-scene__cloud--front"><i></i><i></i><i></i></span>
              <span class="weather-scene__rain"><i></i><i></i><i></i><i></i></span>
              <span class="weather-scene__lightning"></span>
              <span class="weather-scene__wind"><i></i><i></i><i></i></span>
              <span class="weather-scene__fog"><i></i><i></i><i></i></span>
            </div>
            <div class="environment-reading__label"><span>Weather</span><strong>Municipal weather station</strong></div>
            <div class="weather-reading__primary">
              <span class="weather-reading__icon"><component :is="weatherVisual.icon" :size="62" weight="duotone" /></span>
              <div><strong>{{ displayReading(environmentBulletin.temperature) }}<sup>°C</sup></strong><p>{{ environmentBulletin.weatherCondition }}</p></div>
            </div>
            <dl class="weather-reading__metrics">
              <div><dt>High / low</dt><dd>{{ displayReading(environmentBulletin.highTemperature) }}° / {{ displayReading(environmentBulletin.lowTemperature) }}°</dd></div>
              <div><dt>Rain</dt><dd>{{ displayReading(environmentBulletin.rainChance) }}%</dd></div>
              <div><dt>Humidity</dt><dd>{{ displayReading(environmentBulletin.humidity) }}%</dd></div>
              <div><dt>Wind</dt><dd>{{ displayReading(environmentBulletin.windSpeed) }} km/h</dd></div>
            </dl>
          </article>

          <article class="air-reading" :class="airQuality.className">
            <div class="environment-reading__label"><span>Air quality</span><strong>Municipal monitoring system</strong></div>
            <div class="air-reading__primary">
              <span class="air-reading__icon"><PhLeaf :size="34" weight="duotone" /></span>
              <div><p>Air Quality Index</p><strong>{{ displayReading(environmentBulletin.aqi) }}</strong><em>{{ airQuality.label }}</em></div>
            </div>
            <div class="air-reading__scale" aria-hidden="true"><i v-for="level in 6" :key="level" :class="{ 'is-reached': level <= airQuality.level }"></i></div>
            <dl class="air-reading__metrics">
              <div><dt>PM2.5</dt><dd>{{ displayReading(environmentBulletin.pm25) }} <small>µg/m³</small></dd></div>
              <div><dt>PM10</dt><dd>{{ displayReading(environmentBulletin.pm10) }} <small>µg/m³</small></dd></div>
            </dl>
          </article>
        </div>

        <div class="daily-environment__guidance home-reveal">
          <article class="guidance-ribbon guidance-ribbon--weather"><span><PhCloudRain :size="24" weight="duotone" /></span><p><strong>Weather guidance</strong>{{ environmentBulletin.weatherGuidance }}</p></article>
          <article class="guidance-ribbon guidance-ribbon--air"><span><PhLeaf :size="24" weight="duotone" /></span><p><strong>Air-quality guidance</strong>{{ environmentBulletin.airQualityGuidance }}</p></article>
          <time :datetime="environmentBulletin.date">Published {{ environmentDateLabel }}</time>
        </div>
      </div>
    </section>

    <section class="municipal-profile" data-nav-section="/about" aria-labelledby="municipality-heading">
      <div class="site-container">
        <div class="municipal-profile__intro home-reveal">
          <div class="municipal-profile__heading">
            <p class="home-eyebrow"><span>02</span> About us</p>
            <h2 id="municipality-heading">Serving one of Uganda’s fastest-growing urban communities.</h2>
          </div>
          <div class="municipal-profile__summary">
            <p class="municipal-profile__lead">Makindye Ssabagabo Municipal Council is an urban local government in Wakiso District, within the Greater Kampala Metropolitan Area.</p>
            <p>The Council plans, regulates and delivers decentralised services across Bunamwaya, Masajja and Ndejje divisions. Its mandate covers roads and drainage, public health, education, physical planning, trade, environmental management, community development and accountable use of public resources.</p>
            <RouterLink class="home-text-link" to="/about">Discover our mandate <span><PhArrowRight :size="16" weight="bold" /></span></RouterLink>
          </div>
        </div>

        <dl ref="quickFactsRail" class="municipal-profile__quickfacts home-reveal" @scroll.passive="updateRailPosition($event, 'quickFacts')">
          <div v-for="(fact, index) in quickFacts" :key="fact.term" :class="{ 'is-rail-active': railState.quickFacts === index }"><dt>{{ fact.term }}</dt><dd>{{ fact.detail }}</dd></div>
        </dl>
        <div class="mobile-slide-indicator" aria-label="About section slides">
          <button v-for="(_, index) in quickFacts" :key="index" type="button" :class="{ 'is-active': railState.quickFacts === index }" :aria-label="`Show about slide ${index + 1}`" :aria-current="railState.quickFacts === index ? 'true' : undefined" @click="scrollRailTo(quickFactsRail, index)"></button>
        </div>

      </div>
    </section>

    <section class="municipal-statistics" data-nav-section="/about" aria-labelledby="statistics-heading">
      <div class="site-container">
        <div class="municipal-statistics__heading home-reveal">
          <div><p class="home-eyebrow home-eyebrow--light">Municipality at a glance</p><h2 id="statistics-heading">Key municipal statistics</h2></div>
          <p>A concise view of our population, administration and core public facilities.</p>
        </div>
        <div ref="statisticsGrid" class="municipal-statistics__grid home-reveal">
          <article v-for="(stat, index) in statistics" :key="stat.label" class="municipal-stat">
            <component :is="stat.icon" :size="23" weight="regular" />
            <strong :aria-label="stat.value">{{ animatedStatistics[index] }}<small v-if="stat.suffix"> {{ stat.suffix }}</small></strong>
            <h3>{{ stat.label }}</h3>
            <p>{{ stat.detail }}</p>
          </article>
        </div>
        <p class="municipal-statistics__source">Population: Uganda National Population and Housing Census 2024. Administrative and service indicators: municipal planning records.</p>
      </div>
    </section>

    <section class="projects-achievements" data-nav-section="/projects" aria-labelledby="projects-heading">
      <div class="site-container">
        <div class="projects-achievements__header home-reveal">
          <div><p class="home-eyebrow"><span>03</span> Delivery in action</p><h2 id="projects-heading">Ongoing activities &amp; achievements</h2></div>
          <RouterLink class="home-pill-link" to="/projects">View all projects <span><PhArrowRight :size="16" weight="bold" /></span></RouterLink>
        </div>

        <div class="delivery-compact-grid home-reveal">
          <div ref="projectsRail" class="project-editorial-grid" @scroll.passive="updateRailPosition($event, 'projects')">
            <article v-for="(project, index) in projects" :key="project.title" class="project-editorial-card" :class="{ 'project-editorial-card--featured': index === 0, 'is-rail-active': railState.projects === index }">
              <img :src="project.image" :alt="project.title" />
              <div class="project-editorial-card__scrim"></div>
              <div class="project-editorial-card__content">
                <div><span>{{ project.sector }}</span><em>{{ project.status }}</em></div>
                <h3>{{ project.title }}</h3>
                <RouterLink to="/projects" :aria-label="`Read about ${project.title}`"><PhArrowUpRight :size="20" weight="bold" /></RouterLink>
              </div>
            </article>
          </div>
          <div class="mobile-slide-indicator" aria-label="Project slides">
            <button v-for="(_, index) in projects" :key="index" type="button" :class="{ 'is-active': railState.projects === index }" :aria-label="`Show project slide ${index + 1}`" :aria-current="railState.projects === index ? 'true' : undefined" @click="scrollRailTo(projectsRail, index)"></button>
          </div>

          <aside class="achievement-ledger">
            <div class="achievement-ledger__intro"><p class="home-eyebrow"><span>Progress</span> Key achievements</p><h2>Visible results.</h2></div>
            <div class="achievement-ledger__list">
              <article v-for="(achievement, index) in achievements" :key="achievement.title">
                <span>{{ String(index + 1).padStart(2, '0') }}</span>
                <component :is="achievement.icon" :size="22" weight="regular" />
                <div><h3>{{ achievement.title }}</h3><p>{{ achievement.description }}</p></div>
              </article>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section class="council-newsroom" data-nav-section="/open-government" aria-labelledby="news-heading">
      <div class="site-container">
        <div class="council-newsroom__heading home-reveal">
          <p class="home-eyebrow"><span>04</span> Council newsroom</p>
          <h2 id="news-heading">Announcements, news &amp; advertisements</h2>
          <p>Official updates from the Municipal Council, presented clearly and in one place.</p>
        </div>

        <div class="council-newsroom__layout">
          <div class="news-editorial home-reveal">
            <article class="news-editorial__feature">
              <img :src="updates[0].image" :alt="updates[0].title" />
              <div><p>{{ updates[0].type }} <span>/</span> {{ formatCmsDate(updates[0].date) }}</p><h3>{{ updates[0].title }}</h3><div>{{ updates[0].excerpt }}</div><RouterLink class="home-text-link" to="/news">Read the update <span><PhArrowRight :size="16" weight="bold" /></span></RouterLink></div>
            </article>
            <RouterLink v-for="update in updates.slice(1)" :key="update.title" class="news-editorial__row" to="/news">
              <img :src="update.image" :alt="update.title" />
              <div><p>{{ update.type }} · {{ update.date }}</p><h3>{{ update.title }}</h3></div>
              <span><PhArrowRight :size="17" weight="bold" /></span>
            </RouterLink>
          </div>

          <aside class="notice-desk home-reveal" aria-labelledby="notice-heading">
            <div class="notice-desk__heading"><span><PhMegaphone :size="22" /></span><div><p>Official desk</p><h3 id="notice-heading">Notices &amp; advertisements</h3></div></div>
            <RouterLink v-for="notice in notices" :key="notice.title" class="notice-desk__item" :to="notice.to">
              <p>{{ notice.type }}</p><h4>{{ notice.title }}</h4><span>{{ notice.date }} <PhArrowRight :size="15" weight="bold" /></span>
            </RouterLink>
            <RouterLink class="notice-desk__button" to="/tenders">Browse current tenders <span><PhArrowUpRight :size="16" weight="bold" /></span></RouterLink>
          </aside>
        </div>
      </div>
    </section>

    <section class="government-resources" data-nav-section="/services" aria-labelledby="resources-heading">
      <div class="site-container">
        <div class="government-resources__heading home-reveal">
          <div><p class="home-eyebrow home-eyebrow--light"><span>05</span> Useful resources</p><h2 id="resources-heading">Government services</h2></div>
          <p>Trusted links to national institutions and essential public-service platforms.</p>
        </div>
        <div ref="resourcesRail" class="government-resources__grid home-reveal" @scroll.passive="updateRailPosition($event, 'resources')">
          <a v-for="(resource, index) in resources" :key="resource.name" :class="{ 'is-rail-active': railState.resources === index }" :href="resource.href" target="_blank" rel="noreferrer">
            <span class="government-resources__icon"><img :class="resource.logoClass" :src="resource.logo" :alt="resource.logoAlt" /></span>
            <span><strong>{{ resource.name }}</strong><small>{{ resource.description }}</small></span>
            <PhArrowUpRight :size="18" weight="bold" />
          </a>
        </div>
        <div class="mobile-slide-indicator" aria-label="Government resource slides">
          <button v-for="(_, index) in resources" :key="index" type="button" :class="{ 'is-active': railState.resources === index }" :aria-label="`Show resource slide ${index + 1}`" :aria-current="railState.resources === index ? 'true' : undefined" @click="scrollRailTo(resourcesRail, index)"></button>
        </div>
        <div class="government-resources__contact home-reveal">
          <div><PhChatCircleText :size="24" weight="regular" /><span><strong>Can’t find what you need?</strong><small>Our help desk can direct you to the right directorate.</small></span></div>
          <RouterLink class="home-pill-link home-pill-link--light" to="/contact">Contact the council <span><PhArrowRight :size="16" weight="bold" /></span></RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>
