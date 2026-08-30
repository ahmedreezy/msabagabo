<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import {
  PhArrowRight,
  PhArrowUpRight,
  PhBlueprint,
  PhBookOpenText,
  PhBuildings,
  PhChalkboardTeacher,
  PhChatCircleText,
  PhFirstAidKit,
  PhGlobe,
  PhGraduationCap,
  PhHouseLine,
  PhIdentificationCard,
  PhMapPin,
  PhMapTrifold,
  PhMegaphone,
  PhBookOpenUser,
  PhReceipt,
  PhRoadHorizon,
  PhSealCheck,
  PhUsers,
  PhUsersThree,
} from '@phosphor-icons/vue'
import { cmsContent, formatCmsDate } from '../stores/cmsContent'

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

const leadership = [
  {
    id: 'mayor',
    office: 'Office of the Mayor',
    name: 'Galabuzi John Bosco',
    role: 'Mayor',
    description: 'Leads the elected Municipal Council.',
    mark: 'M',
    image: '/images/mayor.webp',
    imageAlt: 'Galabuzi John Bosco, Mayor of Makindye Ssabagabo Municipal Council',
  },
  {
    id: 'town-clerk',
    office: 'Office of the Town Clerk',
    name: 'Otimong Moses',
    role: 'Town Clerk',
    description: 'Directs administration and service delivery.',
    mark: 'TC',
    image: '/images/town-clerk-landscape.png',
    imageAlt: 'Otimong Moses, Town Clerk of Makindye Ssabagabo Municipal Council',
  },
  {
    id: 'speaker',
    office: 'Office of the Speaker',
    role: 'Speaker',
    description: 'Presides over council sittings.',
    mark: 'S',
  },
  {
    id: 'heads-of-departments',
    office: 'Heads of Departments',
    role: 'Sector delivery',
    description: 'Coordinate the council’s technical sectors.',
    mark: 'HD',
  },
]

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
    to: '/opportunities',
  },
  {
    type: 'Citizen information',
    title: 'Municipal Clients’ Charter 2023/24–2025/26',
    date: 'Service standards',
    to: '/news#publications',
  },
]

const resources = [
  { name: 'NIRA', description: 'National identification services', href: 'https://www.nira.go.ug/', icon: PhIdentificationCard },
  { name: 'URA', description: 'Tax registration and payments', href: 'https://ura.go.ug/', icon: PhReceipt },
  { name: 'Passport Services', description: 'Apply for or track a passport', href: 'https://www.passports.go.ug/', icon: PhBookOpenUser },
  { name: 'BIMS', description: 'Building application services', href: 'https://bims.go.ug/', icon: PhBlueprint },
  { name: 'Ministry of Local Government', description: 'National local government information', href: 'https://molg.go.ug/', icon: PhBuildings },
  { name: 'Wakiso District', description: 'District services and information', href: 'https://www.wakiso.go.ug/', icon: PhMapPin },
  { name: 'NSSF Uganda', description: 'Social security member services', href: 'https://www.nssfug.org/', icon: PhUsers },
  { name: 'Government of Uganda', description: 'National government portal', href: 'https://www.gou.go.ug/', icon: PhGlobe },
]

const currentSlide = ref(0)
const isPlaying = ref(true)
const pageRoot = ref(null)
const statisticsGrid = ref(null)
const animatedStatistics = ref(statistics.value.map(() => '0'))
const quickFactsRail = ref(null)
const leadershipRail = ref(null)
const projectsRail = ref(null)
const resourcesRail = ref(null)
const railState = reactive({ quickFacts: 0, leadership: 0, projects: 0, resources: 0 })
let slideTimer
let revealObserver
let statisticsObserver
let countAnimationFrame

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
  if (reducedMotion) isPlaying.value = false
  startSlideTimer()

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
  clearSlideTimer()
  revealObserver?.disconnect()
  statisticsObserver?.disconnect()
  if (countAnimationFrame) window.cancelAnimationFrame(countAnimationFrame)
})
</script>

<template>
  <div ref="pageRoot" class="civic-home enhanced-home">
    <section class="works-carousel" data-nav-section="/" aria-roledescription="carousel" aria-label="Municipal works">
      <div class="works-carousel__slides">
        <figure v-for="(slide, index) in slides" :key="slide.title" class="works-slide" :class="{ 'is-active': currentSlide === index }" :aria-hidden="currentSlide !== index">
          <img :src="slide.image" :alt="currentSlide === index ? slide.alt : ''" />
        </figure>
      </div>
      <div class="works-carousel__scrim" aria-hidden="true"></div>

      <div class="site-container works-carousel__inner">
        <div class="works-carousel__copy" aria-live="polite" aria-atomic="true">
          <p>{{ slides[currentSlide].eyebrow }}</p>
          <h1>{{ slides[currentSlide].title }}</h1>
          <p class="works-carousel__description">{{ slides[currentSlide].description }}</p>
          <div class="works-carousel__actions">
            <RouterLink class="civic-button civic-button--primary" to="/projects">Explore our projects <span><PhArrowRight :size="17" weight="bold" /></span></RouterLink>
            <RouterLink class="civic-button civic-button--secondary" to="/contact">Report an issue <span><PhArrowUpRight :size="17" weight="bold" /></span></RouterLink>
          </div>
        </div>

      </div>
    </section>

    <section class="municipal-profile" data-nav-section="/about" aria-labelledby="municipality-heading">
      <div class="site-container">
        <div class="municipal-profile__intro home-reveal">
          <div class="municipal-profile__heading">
            <p class="home-eyebrow"><span>01</span> About us</p>
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

        <div class="leadership-compact-heading home-reveal">
          <div><p class="home-eyebrow"><span>Leadership</span> Accountable service</p><h3>Meet the MSMC leadership team</h3></div>
          <p>Political direction and technical administration working together for dependable public services.</p>
        </div>

        <div class="leadership-showcase home-reveal" id="leadership">
          <div ref="leadershipRail" class="leadership-grid" @scroll.passive="updateRailPosition($event, 'leadership')">
            <article v-for="(leader, index) in leadership" :key="leader.id" class="leadership-card" :class="[`leadership-card--${leader.id}`, { 'is-rail-active': railState.leadership === index }]">
              <div class="leadership-card__portrait" :class="{ 'leadership-card__portrait--image': leader.image }" :aria-hidden="leader.image ? undefined : 'true'">
                <img v-if="leader.image" :src="leader.image" :alt="leader.imageAlt" loading="lazy" decoding="async" />
                <span v-else>{{ leader.mark }}</span>
              </div>
              <div>
                <p>{{ leader.role }}</p>
                <h4>{{ leader.name || leader.office }}</h4>
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

    <section class="council-newsroom" data-nav-section="/news" aria-labelledby="news-heading">
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
            <RouterLink class="notice-desk__button" to="/opportunities">Browse all opportunities <span><PhArrowUpRight :size="16" weight="bold" /></span></RouterLink>
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
            <span class="government-resources__icon"><component :is="resource.icon" :size="25" weight="regular" /></span>
            <span><strong>{{ resource.name }}</strong><small>{{ resource.description }}</small></span>
            <PhArrowUpRight :size="18" weight="bold" />
          </a>
        </div>
        <div class="mobile-slide-indicator" aria-label="Government resource slides">
          <button v-for="(_, index) in resources" :key="index" type="button" :class="{ 'is-active': railState.resources === index }" :aria-label="`Show resource slide ${index + 1}`" :aria-current="railState.resources === index ? 'true' : undefined" @click="scrollRailTo(resourcesRail, index)"></button>
        </div>
        <div class="government-resources__contact home-reveal">
          <div><PhChatCircleText :size="24" weight="regular" /><span><strong>Can’t find what you need?</strong><small>Our help desk can direct you to the right department.</small></span></div>
          <RouterLink class="home-pill-link home-pill-link--light" to="/contact">Contact the council <span><PhArrowRight :size="16" weight="bold" /></span></RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>
