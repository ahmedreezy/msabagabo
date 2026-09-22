<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PhArrowRight, PhCaretDown, PhEnvelopeSimple, PhMagnifyingGlass, PhPhone } from '@phosphor-icons/vue'
import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuRoot,
  NavigationMenuTrigger,
} from 'reka-ui'

const route = useRoute()
const router = useRouter()
const menuOpen = ref(false)
const activeDesktopMenu = ref('')
const openMobileGroup = ref(null)
const searchQuery = ref('')
const headerElement = ref(null)
const isScrolled = ref(false)
const activeHomeSection = ref('/')
let scrollFrame
let headerResizeObserver
let homeSections = []

const HEADER_COMPACT_ENTER_Y = 64
const HEADER_COMPACT_EXIT_Y = 8

const syncHeaderHeight = (syncHeroHeight = false) => {
  const height = headerElement.value?.offsetHeight
  if (!height) return

  document.documentElement.style.setProperty('--site-header-height', `${height}px`)
  if (syncHeroHeight) document.documentElement.style.setProperty('--hero-header-height', `${height}px`)
}

const navigation = [
  { label: 'Home', to: '/' },
  {
    label: 'About Us',
    to: '/about',
    children: [
      { label: 'Our municipality', to: '/about' },
      { label: 'Leadership', to: '/about#leadership' },
      { label: 'Divisions', to: '/about#divisions' },
    ],
  },
  {
    label: 'Directorates',
    to: '/directorates',
    activePaths: ['/departments'],
    children: [
      { label: 'All directorates', to: '/directorates' },
      { label: 'Administration', to: '/directorates/administration' },
      { label: 'Finance & Planning', to: '/directorates/finance-planning' },
      { label: 'Works & Engineering', to: '/directorates/works-engineering' },
      { label: 'Health', to: '/directorates/health' },
      { label: 'Education & Sports', to: '/directorates/education-sports' },
      { label: 'Natural Resources', to: '/directorates/natural-resources' },
    ],
  },
  { label: 'Services', to: '/services' },
  { label: 'Projects', to: '/projects' },
  {
    label: 'Opportunities',
    to: '/opportunities',
    activePaths: ['/tenders', '/careers'],
    children: [
      { label: 'Bids & tenders', to: '/tenders' },
      { label: 'Employment opportunities', to: '/careers#employment' },
      { label: 'Internships & trainees', to: '/careers#internships' },
    ],
  },
  { label: 'Open Gov', to: '/open-government' },
  {
    label: 'Contact Us',
    to: '/contact',
    activePaths: ['/faqs'],
    children: [
      { label: 'Contact details', to: '/contact#contact-details' },
      { label: 'Citizen feedback', to: '/contact#e8ebf0ck' },
      { label: 'Frequently asked questions', to: '/faqs' },
    ],
  },
]

const closeMenus = () => {
  menuOpen.value = false
  activeDesktopMenu.value = ''
  openMobileGroup.value = null
}

const setMobileGroup = (label, open) => {
  openMobileGroup.value = open ? label : null
}

const handleKeydown = (event) => {
  if (event.key === 'Escape') closeMenus()
}

const handleOutsidePointer = (event) => {
  if (headerElement.value && !headerElement.value.contains(event.target)) closeMenus()
}

const handleResize = () => {
  if (window.innerWidth >= 1200) closeMenus()
  syncHeaderHeight(!isScrolled.value)
  handleScroll()
}

const handleScroll = () => {
  if (scrollFrame) return
  scrollFrame = window.requestAnimationFrame(() => {
    const compactHeader = isScrolled.value
      ? window.scrollY > HEADER_COMPACT_EXIT_Y
      : window.scrollY > HEADER_COMPACT_ENTER_Y

    if (compactHeader !== isScrolled.value) isScrolled.value = compactHeader
    updateActiveHomeSection()
    scrollFrame = undefined
  })
}

const collectHomeSections = () => {
  homeSections = route.path === '/' ? Array.from(document.querySelectorAll('[data-nav-section]')) : []
  updateActiveHomeSection()
}

const updateActiveHomeSection = () => {
  if (route.path !== '/' || !homeSections.length) return

  const headerHeight = headerElement.value?.offsetHeight ?? 0
  const readingLine = Math.max(headerHeight + 24, window.innerHeight * 0.32)
  const currentSection = homeSections.find((section) => {
    const bounds = section.getBoundingClientRect()
    return bounds.top <= readingLine && bounds.bottom > readingLine
  })

  if (currentSection?.dataset.navSection) activeHomeSection.value = currentSection.dataset.navSection
}

const isNavItemActive = (item) => {
  if (route.path === '/') return activeHomeSection.value === item.to
  const matchingPaths = [item.to, ...(item.activePaths || [])]
  return matchingPaths.some((path) => route.path === path || (path !== '/' && route.path.startsWith(`${path}/`)))
}

const submitSiteSearch = () => {
  router.push({ path: '/services', query: searchQuery.value ? { q: searchQuery.value } : {} })
}

watch(() => route.fullPath, async () => {
  closeMenus()
  await nextTick()
  collectHomeSections()
})
watch(menuOpen, (open) => { document.body.style.overflow = open ? 'hidden' : '' })
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleResize, { passive: true })
  document.addEventListener('pointerdown', handleOutsidePointer)
  nextTick(() => {
    collectHomeSections()
    syncHeaderHeight(true)
    if ('ResizeObserver' in window && headerElement.value) {
      headerResizeObserver = new ResizeObserver(() => syncHeaderHeight())
      headerResizeObserver.observe(headerElement.value)
    }
  })
  handleScroll()
})
onBeforeUnmount(() => {
  if (scrollFrame) window.cancelAnimationFrame(scrollFrame)
  document.body.style.overflow = ''
  headerResizeObserver?.disconnect()
  document.documentElement.style.removeProperty('--site-header-height')
  document.documentElement.style.removeProperty('--hero-header-height')
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('pointerdown', handleOutsidePointer)
})
</script>

<template>
  <a class="skip-link" href="#main-content">Skip to main content</a>

  <header ref="headerElement" class="site-header official-header corporate-header" :class="{ 'is-scrolled': isScrolled }">
    <div class="corporate-utility-bar">
      <div class="site-container corporate-utility-bar__inner">
        <p>Official Government of Uganda website</p>
        <div>
          <a href="tel:0800256260"><PhPhone :size="14" /> 0800 256 260</a>
          <a href="mailto:info@msabagabo.go.ug"><PhEnvelopeSimple :size="14" /> info@msabagabo.go.ug</a>
        </div>
      </div>
    </div>

    <div class="corporate-navbar">
      <div class="site-container corporate-navbar__inner">
        <RouterLink class="government-brand" to="/" aria-label="Makindye Ssabagabo Municipal Council home">
          <img src="/images/municipal-logo.png" alt="Makindye Ssabagabo Municipal Council logo" />
          <span>
            <strong>Makindye Ssabagabo Municipal Council</strong>
            <em>Wakiso District Local Government</em>
          </span>
        </RouterLink>

        <NavigationMenuRoot v-model="activeDesktopMenu" class="corporate-navigation" aria-label="Primary navigation" :delay-duration="120" :skip-delay-duration="250">
          <NavigationMenuList class="corporate-navigation__list">
            <NavigationMenuItem v-for="item in navigation" :key="item.label" :value="item.label" class="government-navigation__item" :class="{ 'is-open': activeDesktopMenu === item.label }">
              <NavigationMenuLink v-if="!item.children" as-child :active="isNavItemActive(item)">
                <RouterLink class="government-navigation__link" :class="{ 'is-active': isNavItemActive(item) }" :to="item.to">{{ item.label }}</RouterLink>
              </NavigationMenuLink>
              <template v-else>
                <NavigationMenuTrigger class="government-navigation__group" :class="{ 'is-active': isNavItemActive(item) }">
                  <span class="government-navigation__group-link">{{ item.label }}</span>
                  <span class="government-navigation__toggle" aria-hidden="true"><PhCaretDown :size="12" weight="bold" /></span>
                </NavigationMenuTrigger>
                <NavigationMenuContent class="official-nav-dropdown">
                  <p>{{ item.label }}</p>
                  <NavigationMenuLink v-for="child in item.children" :key="child.label" as-child>
                    <RouterLink :to="child.to">{{ child.label }} <PhArrowRight :size="14" weight="bold" /></RouterLink>
                  </NavigationMenuLink>
                </NavigationMenuContent>
              </template>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenuRoot>

        <form class="corporate-search" role="search" @submit.prevent="submitSiteSearch">
          <label class="sr-only" for="site-search">Search this website</label>
          <PhMagnifyingGlass class="corporate-search__icon" :size="18" aria-hidden="true" />
          <input id="site-search" v-model="searchQuery" type="search" placeholder="Search council services" />
          <button type="submit"><span>Search</span><PhArrowRight :size="15" weight="bold" aria-hidden="true" /></button>
        </form>

        <button class="official-menu-trigger" type="button" :aria-expanded="menuOpen" aria-controls="mobile-navigation" :aria-label="menuOpen ? 'Close menu' : 'Open menu'" @click="menuOpen = !menuOpen"><span></span><span></span><span></span></button>
      </div>
    </div>

    <Transition name="menu-fade">
      <div v-if="menuOpen" id="mobile-navigation" class="official-mobile-menu">
        <div class="site-container official-mobile-menu__inner">
          <form class="official-mobile-search" role="search" @submit.prevent="submitSiteSearch">
            <PhMagnifyingGlass :size="20" /><input v-model="searchQuery" type="search" placeholder="Search services and information" aria-label="Search website" /><button type="submit">Search</button>
          </form>
          <nav aria-label="Mobile navigation">
            <template v-for="(item, index) in navigation" :key="item.label">
              <div v-if="!item.children" class="official-mobile-nav-item" :class="{ 'is-active': isNavItemActive(item) }">
                <span>{{ String(index + 1).padStart(2, '0') }}</span>
                <RouterLink :aria-current="isNavItemActive(item) ? 'page' : undefined" :to="item.to">{{ item.label }}</RouterLink>
              </div>
              <CollapsibleRoot
                v-else
                class="official-mobile-nav-item official-mobile-nav-item--group"
                :class="{ 'is-active': isNavItemActive(item) }"
                :open="openMobileGroup === item.label"
                @update:open="setMobileGroup(item.label, $event)"
              >
                <span>{{ String(index + 1).padStart(2, '0') }}</span>
                <div class="official-mobile-group">
                  <RouterLink :to="item.to">{{ item.label }}</RouterLink>
                  <CollapsibleTrigger class="official-mobile-group__trigger" :aria-label="`${openMobileGroup === item.label ? 'Hide' : 'Show'} ${item.label} links`">
                    <PhCaretDown :size="17" weight="bold" />
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent class="official-mobile-children">
                  <RouterLink v-for="child in item.children" :key="child.label" :to="child.to">{{ child.label }}</RouterLink>
                </CollapsibleContent>
              </CollapsibleRoot>
            </template>
          </nav>
          <RouterLink class="official-mobile-feedback" to="/contact">Report an issue or send feedback <PhArrowRight :size="18" weight="bold" /></RouterLink>
        </div>
      </div>
    </Transition>
  </header>
  <div class="site-header-spacer" aria-hidden="true"></div>
</template>
