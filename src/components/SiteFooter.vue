<script setup>
import { PhArrowUpRight, PhEnvelopeSimple, PhMapPin, PhPhone } from '@phosphor-icons/vue'
</script>

<template>
  <footer class="bg-ink text-white">
    <div class="site-container py-14 lg:py-18">
      <div class="grid gap-12 lg:grid-cols-[1.15fr_2fr] lg:gap-20">
        <div>
          <div class="flex items-center gap-4">
            <img class="h-18 w-18 object-contain" src="/images/municipal-logo.png" alt="" />
            <div>
              <p class="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-orange-400">Official website</p>
              <p class="mt-1 max-w-xs text-lg font-extrabold leading-tight">Makindye Ssabagabo Municipal Council</p>
            </div>
          </div>
          <p class="mt-6 max-w-sm text-sm leading-6 text-white/62">
            Quality, cost-effective and sustainable urban services for a well-planned, clean and prosperous municipality.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-x-7 gap-y-10 sm:grid-cols-3">
          <div>
            <h2 class="footer-heading">Council</h2>
            <div class="footer-links">
              <RouterLink to="/about">About us</RouterLink>
              <RouterLink to="/departments">Departments</RouterLink>
              <RouterLink to="/projects">Projects</RouterLink>
              <RouterLink to="/opportunities">Opportunities</RouterLink>
            </div>
          </div>
          <div>
            <h2 class="footer-heading">Resources</h2>
            <div class="footer-links">
              <RouterLink to="/services">Services</RouterLink>
              <RouterLink to="/news">News</RouterLink>
              <RouterLink to="/news#publications">Publications</RouterLink>
              <RouterLink to="/contact">Feedback</RouterLink>
            </div>
          </div>
          <div class="col-span-2 sm:col-span-1">
            <h2 class="footer-heading">Contact</h2>
            <div class="grid gap-3.5 text-sm text-white/65">
              <p class="flex gap-2.5"><PhMapPin class="mt-0.5 shrink-0 text-orange-400" :size="18" /> Ndejje-Zanta, Wakiso District</p>
              <a class="flex gap-2.5 hover:text-white" href="tel:0800256260"><PhPhone class="shrink-0 text-orange-400" :size="18" /> 0800 256 260</a>
              <a class="flex gap-2.5 hover:text-white" href="mailto:info@msabagabo.go.ug"><PhEnvelopeSimple class="shrink-0 text-orange-400" :size="18" /> info@msabagabo.go.ug</a>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-14 flex flex-col gap-5 border-t border-white/12 pt-6 text-xs text-white/48 sm:flex-row sm:items-center sm:justify-between">
        <p>This is the official website of Makindye Ssabagabo Municipal Council.</p>
        <div class="flex flex-wrap gap-x-5 gap-y-2">
          <a class="inline-flex items-center gap-1 hover:text-white" href="#">Privacy</a>
          <a class="inline-flex items-center gap-1 hover:text-white" href="#">Accessibility</a>
          <a class="inline-flex items-center gap-1 hover:text-white" href="https://www.wakiso.go.ug/" target="_blank" rel="noreferrer">
            Wakiso District <PhArrowUpRight :size="12" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

