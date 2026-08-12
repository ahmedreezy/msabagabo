<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PhCaretDown, PhEnvelopeSimple, PhMagnifyingGlass, PhPhone } from '@phosphor-icons/vue'

const route = useRoute()
const router = useRouter()
const menuOpen = ref(false)
const activeDesktopMenu = ref(null)
const openMobileGroup = ref(null)
const searchQuery = ref('')

const navigation = [
  { label: 'Home', to: '/' },
  {
    label: 'About',
    to: '/about',
    children: [
      { label: 'Our municipality', to: '/about' },
      { label: 'Leadership', to: '/about#leadership' },
      { label: 'Divisions', to: '/about#divisions' },
    ],
  },
  {
    label: 'Departments',
    to: '/departments',
    children: [
      { label: 'All departments', to: '/departments' },
      { label: 'Administration', to: '/departments/administration' },
      { label: 'Finance & Planning', to: '/departments/finance-planning' },
      { label: 'Works & Engineering', to: '/departments/works-engineering' },
      { label: 'Health', to: '/departments/health' },
      { label: 'Education & Sports', to: '/departments/education-sports' },
      { label: 'Natural Resources', to: '/departments/natural-resources' },
    ],
  },
  { label: 'Services', to: '/services' },
  { label: 'Projects', to: '/projects' },
  {
    label: 'News',
    to: '/news',
    children: [
      { label: 'News & announcements', to: '/news' },
      { label: 'Publications', to: '/news#publications' },
      { label: 'Gallery', to: '/news#gallery' },
    ],
  },
  { label: 'Opportunities', to: '/opportunities' },
  { label: 'Contact', to: '/contact' },
]

const closeMenus = () => {
  menuOpen.value = false
  activeDesktopMenu.value = null
  openMobileGroup.value = null
}

const toggleDesktopMenu = (label) => {
  activeDesktopMenu.value = activeDesktopMenu.value === label ? null : label
}

const toggleMobileGroup = (label) => {
  openMobileGroup.value = openMobileGroup.value === label ? null : label
}

const handleKeydown = (event) => {
  if (event.key === 'Escape') closeMenus()
}

const submitSiteSearch = () => {
  router.push({ path: '/services', query: searchQuery.value ? { q: searchQuery.value } : {} })
}

watch(() => route.fullPath, closeMenus)
watch(menuOpen, (open) => { document.body.style.overflow = open ? 'hidden' : '' })
onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <a class="skip-link" href="#main-content">Skip to main content</a>

  <header class="site-header official-header">
    <div class="national-stripe" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span></div>

    <div class="government-masthead">
      <div class="site-container government-masthead__inner">
        <RouterLink class="government-brand" to="/" aria-label="Makindye Ssabagabo Municipal Council home">
          <img src="/images/municipal-logo.png" alt="Makindye Ssabagabo Municipal Council logo" />
          <span>
            <small class="government-brand__official"><img src="/images/uganda-flag.png" alt="" /> Official Government of Uganda website</small>
            <strong>Makindye Ssabagabo Municipal Council</strong>
            <em>Wakiso District Local Government</em>
          </span>
        </RouterLink>

        <div class="government-masthead__utilities">
          <a class="masthead-contact" href="tel:0800256260"><PhPhone :size="17" /><span><small>Toll free</small><strong>0800 256 260</strong></span></a>
          <a class="masthead-contact" href="mailto:info@msabagabo.go.ug"><PhEnvelopeSimple :size="17" /><span><small>Email</small><strong>info@msabagabo.go.ug</strong></span></a>
          <form class="masthead-search" role="search" @submit.prevent="submitSiteSearch">
            <label class="sr-only" for="site-search">Search this website</label>
            <PhMagnifyingGlass :size="19" />
            <input id="site-search" v-model="searchQuery" type="search" placeholder="Search" />
            <button type="submit" aria-label="Submit search">→</button>
          </form>
        </div>

        <button class="official-menu-trigger" type="button" :aria-expanded="menuOpen" aria-controls="mobile-navigation" :aria-label="menuOpen ? 'Close menu' : 'Open menu'" @click="menuOpen = !menuOpen"><span></span><span></span><span></span></button>
      </div>
    </div>

    <nav class="government-navigation" aria-label="Primary navigation">
      <div class="site-container government-navigation__inner">
        <div class="government-navigation__links">
          <div v-for="item in navigation" :key="item.label" class="government-navigation__item">
            <RouterLink v-if="!item.children" class="government-navigation__link" :class="{ 'is-active': route.path === item.to }" :to="item.to">{{ item.label }}</RouterLink>
            <button v-else class="government-navigation__link" :class="{ 'is-active': route.path.startsWith(item.to) }" type="button" :aria-expanded="activeDesktopMenu === item.label" @click="toggleDesktopMenu(item.label)">
              {{ item.label }} <PhCaretDown :size="12" weight="bold" :class="{ 'rotate-180': activeDesktopMenu === item.label }" />
            </button>
            <Transition name="dropdown-reveal">
              <div v-if="item.children && activeDesktopMenu === item.label" class="official-nav-dropdown">
                <p>{{ item.label }}</p>
                <RouterLink v-for="child in item.children" :key="child.label" :to="child.to">{{ child.label }} <span>→</span></RouterLink>
              </div>
            </Transition>
          </div>
        </div>
        <RouterLink class="citizen-services-link" to="/services"><strong>Find a service</strong><i>→</i></RouterLink>
      </div>
    </nav>

    <Transition name="menu-fade">
      <div v-if="menuOpen" id="mobile-navigation" class="official-mobile-menu">
        <div class="site-container official-mobile-menu__inner">
          <form class="official-mobile-search" role="search" @submit.prevent="submitSiteSearch">
            <PhMagnifyingGlass :size="20" /><input v-model="searchQuery" type="search" placeholder="Search services and information" aria-label="Search website" /><button type="submit">Search</button>
          </form>
          <nav aria-label="Mobile navigation">
            <div v-for="(item, index) in navigation" :key="item.label" class="official-mobile-nav-item">
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
              <RouterLink v-if="!item.children" :to="item.to">{{ item.label }}</RouterLink>
              <template v-else>
                <button type="button" @click="toggleMobileGroup(item.label)">{{ item.label }}<PhCaretDown :size="17" weight="bold" :class="{ 'rotate-180': openMobileGroup === item.label }" /></button>
                <div v-if="openMobileGroup === item.label" class="official-mobile-children">
                  <RouterLink v-for="child in item.children" :key="child.label" :to="child.to">{{ child.label }}</RouterLink>
                </div>
              </template>
            </div>
          </nav>
          <RouterLink class="official-mobile-feedback" to="/contact">Report an issue or send feedback <span>→</span></RouterLink>
        </div>
      </div>
    </Transition>
  </header>
</template>
