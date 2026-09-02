<script setup>
import { PhArrowUpRight, PhEnvelopeSimple, PhMapPin, PhPhone } from '@phosphor-icons/vue'
</script>

<template>
  <footer class="official-footer">
    <div class="official-footer__main">
      <div class="site-container official-footer__grid">
        <div class="official-footer__identity">
          <div><img src="/images/municipal-logo.png" alt="Makindye Ssabagabo Municipal Council logo" /><span><small>Official website</small><strong>Makindye Ssabagabo<br />Municipal Council</strong></span></div>
          <p>Quality, cost-effective and sustainable urban services for a well-planned, clean and prosperous municipality.</p>
        </div>

        <nav class="official-footer__navigation" aria-label="Footer navigation">
          <div><h2>Council</h2><RouterLink to="/about">About the municipality</RouterLink><RouterLink to="/directorates">Directorates</RouterLink><RouterLink to="/projects">Projects</RouterLink><RouterLink to="/careers">Careers</RouterLink></div>
          <div><h2>Public information</h2><RouterLink to="/services">Services</RouterLink><RouterLink to="/tenders">Tenders</RouterLink><RouterLink to="/open-government">Open government</RouterLink><RouterLink to="/faqs">FAQs</RouterLink><RouterLink to="/contact">Contact & feedback</RouterLink></div>
        </nav>

        <address class="official-footer__contact">
          <h2>Contact the council</h2>
          <p><PhMapPin :size="18" /> <span>Ndejje-Zanta<br />Wakiso District, Uganda</span></p>
          <a href="tel:0800256260"><PhPhone :size="18" /> 0800 256 260</a>
          <a href="mailto:info@msabagabo.go.ug"><PhEnvelopeSimple :size="18" /> info@msabagabo.go.ug</a>
        </address>
      </div>
    </div>

    <div class="official-footer__legal">
      <div class="site-container official-footer__legal-inner">
        <p>This is the official website of Makindye Ssabagabo Municipal Council, Wakiso District Local Government.</p>
        <nav aria-label="Legal and website information">
          <RouterLink to="/privacy">Privacy</RouterLink><RouterLink to="/accessibility">Accessibility</RouterLink><RouterLink to="/disclaimer">Disclaimer</RouterLink><RouterLink to="/site-map">Site map</RouterLink>
          <a href="https://www.wakiso.go.ug/" target="_blank" rel="noreferrer">Wakiso District <PhArrowUpRight :size="12" /></a>
        </nav>
      </div>
    </div>
  </footer>
</template>
