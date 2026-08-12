<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  PhCaretDown,
  PhEnvelopeSimple,
  PhList,
  PhMagnifyingGlass,
  PhPhone,
  PhX,
} from '@phosphor-icons/vue'

const route = useRoute()
const menuOpen = ref(false)
const activeDesktopMenu = ref(null)
const openMobileGroup = ref(null)

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
    label: 'News & Resources',
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

watch(
  () => route.fullPath,
  () => closeMenus(),
)

watch(menuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <a class="skip-link" href="#main-content">Skip to main content</a>

  <header class="site-header">
    <div class="national-stripe" aria-hidden="true">
      <span></span><span></span><span></span><span></span><span></span><span></span>
    </div>

    <div class="bg-ink text-white/82">
      <div class="site-container flex min-h-10 items-center justify-between gap-4 py-2 text-[0.72rem] font-semibold tracking-wide">
        <div class="flex items-center gap-2.5">
          <img class="h-4 w-6 object-cover" src="/images/uganda-flag.png" alt="Flag of Uganda" />
          <span class="hidden sm:inline">An official Government of Uganda website</span>
          <span class="sm:hidden">Government of Uganda</span>
        </div>

        <div class="flex items-center gap-4 sm:gap-6">
          <a class="utility-link hidden md:inline-flex" href="mailto:info@msabagabo.go.ug">
            <PhEnvelopeSimple :size="15" weight="regular" />
            info@msabagabo.go.ug
          </a>
          <a class="utility-link" href="tel:0800256260">
            <PhPhone :size="15" weight="regular" />
            <span class="hidden sm:inline">Toll free</span> 0800 256 260
          </a>
        </div>
      </div>
    </div>

    <div class="bg-white">
      <div class="site-container flex items-center justify-between gap-5 py-4 lg:py-5">
        <RouterLink class="group flex min-w-0 items-center gap-3.5" to="/" aria-label="Makindye Ssabagabo Municipal Council home">
          <img
            class="h-15 w-15 shrink-0 object-contain transition-transform duration-500 ease-premium group-hover:scale-[1.03] lg:h-17 lg:w-17"
            src="/images/municipal-logo.png"
            alt="Makindye Ssabagabo Municipal Council logo"
          />
          <div class="min-w-0">
            <p class="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-civic-700">Wakiso District</p>
            <p class="mt-1 max-w-[17rem] text-sm font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-base lg:max-w-none lg:text-lg">
              Makindye Ssabagabo Municipal Council
            </p>
          </div>
        </RouterLink>

        <div class="hidden items-center gap-3 lg:flex">
          <RouterLink class="header-action header-action-secondary" to="/contact">
            Contact & Feedback
          </RouterLink>
          <RouterLink class="header-action header-action-primary" to="/services">
            <PhMagnifyingGlass :size="18" weight="bold" />
            Find a service
          </RouterLink>
        </div>

        <button
          class="menu-trigger lg:hidden"
          type="button"
          :aria-expanded="menuOpen"
          aria-controls="mobile-navigation"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
          @click="menuOpen = !menuOpen"
        >
          <PhX v-if="menuOpen" :size="24" weight="bold" />
          <PhList v-else :size="24" weight="bold" />
        </button>
      </div>
    </div>

    <nav class="hidden border-y border-ink/8 bg-white lg:block" aria-label="Primary navigation">
      <div class="site-container flex h-15 items-stretch justify-between gap-1">
        <div class="flex items-stretch">
          <div v-for="item in navigation" :key="item.label" class="relative flex items-stretch">
            <RouterLink
              v-if="!item.children"
              class="desktop-nav-link"
              :class="{ 'is-active': route.path === item.to }"
              :to="item.to"
            >
              {{ item.label }}
            </RouterLink>
            <button
              v-else
              class="desktop-nav-link gap-1.5"
              :class="{ 'is-active': route.path.startsWith(item.to) }"
              type="button"
              :aria-expanded="activeDesktopMenu === item.label"
              @click="toggleDesktopMenu(item.label)"
            >
              {{ item.label }}
              <PhCaretDown
                :size="13"
                weight="bold"
                class="transition-transform duration-300 ease-premium"
                :class="{ 'rotate-180': activeDesktopMenu === item.label }"
              />
            </button>

            <div v-if="item.children && activeDesktopMenu === item.label" class="nav-dropdown">
              <RouterLink
                v-for="child in item.children"
                :key="child.label"
                class="nav-dropdown-link"
                :to="child.to"
              >
                {{ child.label }}
              </RouterLink>
            </div>
          </div>
        </div>

        <RouterLink class="flex items-center gap-2 text-sm font-bold text-civic-700 transition-colors hover:text-orange-600" to="/contact">
          Report an issue
        </RouterLink>
      </div>
    </nav>

    <Transition name="menu-fade">
      <div v-if="menuOpen" id="mobile-navigation" class="mobile-menu lg:hidden">
        <div class="site-container flex h-full flex-col overflow-y-auto py-6">
          <div class="relative mb-6">
            <PhMagnifyingGlass class="absolute left-4 top-1/2 -translate-y-1/2 text-ink/45" :size="20" />
            <input class="mobile-search" type="search" placeholder="Search services and information" aria-label="Search website" />
          </div>

          <nav class="flex-1" aria-label="Mobile navigation">
            <div v-for="item in navigation" :key="item.label" class="border-b border-ink/10">
              <RouterLink v-if="!item.children" class="mobile-nav-link" :to="item.to">
                {{ item.label }}
              </RouterLink>
              <template v-else>
                <button class="mobile-nav-link w-full" type="button" @click="toggleMobileGroup(item.label)">
                  {{ item.label }}
                  <PhCaretDown
                    :size="17"
                    weight="bold"
                    class="transition-transform duration-300 ease-premium"
                    :class="{ 'rotate-180': openMobileGroup === item.label }"
                  />
                </button>
                <div v-if="openMobileGroup === item.label" class="mb-4 grid gap-1 pl-4">
                  <RouterLink v-for="child in item.children" :key="child.label" class="mobile-child-link" :to="child.to">
                    {{ child.label }}
                  </RouterLink>
                </div>
              </template>
            </div>
          </nav>

          <div class="mt-7 grid gap-3 pb-8">
            <RouterLink class="header-action header-action-primary justify-center" to="/services">Find a service</RouterLink>
            <RouterLink class="header-action header-action-secondary justify-center" to="/contact">Contact & Feedback</RouterLink>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

