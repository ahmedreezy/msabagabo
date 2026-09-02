<script setup>
import { reactive, ref } from 'vue'
import { PhCheckCircle, PhEnvelopeSimple, PhMapPin, PhPhone } from '@phosphor-icons/vue'
import PageIntro from '../components/PageIntro.vue'

const submitted = ref(false)
const form = reactive({ name: '', email: '', phone: '', subject: '', message: '' })

const submit = () => {
  submitted.value = true
}
</script>

<template>
  <div>
    <PageIntro eyebrow="Contact the council" title="How can we help?" description="Send an enquiry, request information or share feedback about a municipal service." />
    <section class="bg-white py-16 sm:py-20 lg:py-24">
      <div class="site-container grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <aside id="contact-details" class="scroll-mt-36 grid content-start gap-4">
          <div class="bg-civic-900 p-6 text-white">
            <PhPhone class="text-orange-300" :size="25" />
            <p class="mt-5 text-xs font-bold uppercase tracking-[0.13em] text-white/52">Toll free</p>
            <a class="mt-2 block text-xl font-extrabold" href="tel:0800256260">0800 256 260</a>
          </div>
          <div class="bg-sage-50 p-6">
            <PhEnvelopeSimple class="text-civic-700" :size="25" />
            <p class="mt-5 text-xs font-bold uppercase tracking-[0.13em] text-ink/45">Email</p>
            <a class="mt-2 block font-extrabold text-civic-800" href="mailto:info@msabagabo.go.ug">info@msabagabo.go.ug</a>
          </div>
          <div class="bg-orange-50 p-6">
            <PhMapPin class="text-orange-700" :size="25" />
            <p class="mt-5 text-xs font-bold uppercase tracking-[0.13em] text-ink/45">Head office</p>
            <p class="mt-2 font-extrabold">Ndejje-Zanta, Wakiso District</p>
          </div>
        </aside>

        <div id="feedback" class="scroll-mt-36">
          <div v-if="submitted" class="bg-sage-50 p-8" role="status">
            <PhCheckCircle class="text-civic-700" :size="36" weight="fill" />
            <h2 class="mt-5 text-2xl font-extrabold tracking-[-0.035em]">Your message is ready for submission</h2>
            <p class="mt-3 text-sm leading-6 text-ink/58">This first draft demonstrates the completed form state. CMS and email delivery will be connected during backend integration.</p>
            <button class="button-primary mt-7" type="button" @click="submitted = false">Send another message</button>
          </div>

          <form v-else class="grid gap-5" @submit.prevent="submit">
            <div class="grid gap-5 sm:grid-cols-2">
              <label class="form-field">Full name <input v-model="form.name" required type="text" autocomplete="name" /></label>
              <label class="form-field">Email address <input v-model="form.email" required type="email" autocomplete="email" /></label>
            </div>
            <div class="grid gap-5 sm:grid-cols-2">
              <label class="form-field">Phone number <input v-model="form.phone" type="tel" autocomplete="tel" /></label>
              <label class="form-field">Subject <input v-model="form.subject" required type="text" /></label>
            </div>
            <label class="form-field">Message <textarea v-model="form.message" required rows="6"></textarea></label>
            <button class="button-primary w-fit" type="submit">Submit message</button>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

