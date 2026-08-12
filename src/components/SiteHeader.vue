<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  PhCaretDown,
  PhEnvelopeSimple,
  PhMagnifyingGlass,
  PhPhone,
} from '@phosphor-icons/vue'

const route = useRoute()
const menuOpen = ref(false)
const activeDesktopMenu = ref(null)
const openMobileGroup = ref(null)

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

  <header class="site-header">
    <div class="national-stripe" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span></div>

    <div class="government-bar">
      <div class="site-container government-bar__inner">
        <div class="government-bar__identity">
          <img src="/images/uganda-flag.png" alt="Flag of Uganda" />
          <span class="hidden sm:inline">An official Government of Uganda website</span>
          <span class="sm:hidden">Government of Uganda</span>
        </div>
        <div class="government-bar__contacts">
          <a href="mailto:info@msabagabo.go.ug"><PhEnvelopeSimple :size="15" /><span class="hidden md:inline">info@msabagabo.go.ug</span></a>
          <a href="tel:0800256260"><PhPhone :size="15" /><span class="hidden sm:inline">Toll free</span> 0800 256 260</a>
        </div>
      </div>
    </div>

    <div class="main-navigation">
      <div class="site-container main-navigation__inner">
        <RouterLink class="municipal-brand" to="/" aria-label="Makindye Ssabagabo Municipal Council home">
          <img src="/images/municipal-logo.png" alt="Makindye Ssabagabo Municipal Council logo" />
          <span><small>Wakiso District</small><strong>Makindye Ssabagabo<br />Municipal Council</strong></span>
        </RouterLink>

        <nav class="primary-navigation" aria-label="Primary navigation">
          <div v-for="item in navigation" :key="item.label" class="primary-navigation__item">
            <RouterLink v-if="!item.children" class="primary-navigation__link" :class="{ 'is-active': route.path === item.to }" :to="item.to">{{ item.label }}</RouterLink>
            <button v-else class="primary-navigation__link" :class="{ 'is-active': route.path.startsWith(item.to) }" type="button" :aria-expanded="activeDesktopMenu === item.label" @click="toggleDesktopMenu(item.label)">
              {{ item.label }}
              <PhCaretDown :size="12" weight="bold" :class="{ 'rotate-180': activeDesktopMenu === item.label }" />
            </button>
            <Transition name="dropdown-reveal">
              <div v-if="item.children && activeDesktopMenu === item.label" class="nav-dropdown">
                <p>{{ item.label }}</p>
                <RouterLink v-for="child in item.children" :key="child.label" class="nav-dropdown-link" :to="child.to">{{ child.label }}</RouterLink>
              </div>
            </Transition>
          </div>
        </nav>

        <div class="navigation-actions">
          <RouterLink class="navigation-search" to="/services" aria-label="Find a service"><PhMagnifyingGlass :size="21" weight="bold" /></RouterLink>
          <RouterLink class="navigation-report" to="/contact"><span>Report an issue</span><i>→</i></RouterLink>
        </div>

        <button class="menu-trigger" type="button" :aria-expanded="menuOpen" aria-controls="mobile-navigation" :aria-label="menuOpen ? 'Close menu' : 'Open menu'" @click="menuOpen = !menuOpen">
          <span></span><span></span>
        </button>
      </div>
    </div>

    <Transition name="menu-fade">
      <div v-if="menuOpen" id="mobile-navigation" class="mobile-menu">
        <div class="site-container mobile-menu__inner">
          <RouterLink class="mobile-service-search" to="/services"><PhMagnifyingGlass :size="20" weight="bold" /> Find a service or information</RouterLink>
          <nav class="mobile-navigation" aria-label="Mobile navigation">
            <div v-for="(item, index) in navigation" :key="item.label" class="mobile-navigation__item">
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
              <RouterLink v-if="!item.children" class="mobile-nav-link" :to="item.to">{{ item.label }}</RouterLink>
              <template v-else>
                <button class="mobile-nav-link" type="button" @click="toggleMobileGroup(item.label)">{{ item.label }}<PhCaretDown :size="17" weight="bold" :class="{ 'rotate-180': openMobileGroup === item.label }" /></button>
                <div v-if="openMobileGroup === item.label" class="mobile-children">
                  <RouterLink v-for="child in item.children" :key="child.label" class="mobile-child-link" :to="child.to">{{ child.label }}</RouterLink>
                </div>
              </template>
            </div>
          </nav>
          <RouterLink class="mobile-report" to="/contact">Report an issue or send feedback <span>→</span></RouterLink>
        </div>
      </div>
    </Transition>
  </header>
</template>
