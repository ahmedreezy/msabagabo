<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { PhArrowRight, PhCheckCircle, PhLockKey, PhWarningCircle } from '@phosphor-icons/vue'
import { isSupabaseConfigured } from '../../lib/supabase'
import { cmsAuth } from '../../services/cms'

const router = useRouter()
const email = ref('')
const password = ref('')
const submitting = ref(false)
const errorMessage = ref('')

const submit = async () => {
  errorMessage.value = ''
  submitting.value = true
  try {
    await cmsAuth.signIn(email.value.trim(), password.value)
    await router.replace('/admin')
  } catch (error) {
    errorMessage.value = error.message || 'Sign-in failed. Check your details and try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="admin-login">
    <section class="admin-login__identity" aria-label="CMS identity">
      <RouterLink to="/" class="admin-login__brand">
        <img src="/images/municipal-logo.png" alt="Makindye Ssabagabo Municipal Council logo" />
        <span><small>Municipal Council</small><strong>Content office</strong></span>
      </RouterLink>
      <div>
        <p>Authorised staff</p>
        <h1>Publish clear, current municipal information.</h1>
      </div>
      <p class="admin-login__support"><PhCheckCircle :size="18" weight="fill" /> Role-controlled publishing and audit history</p>
    </section>

    <section class="admin-login__panel" aria-labelledby="admin-login-title">
      <div class="admin-login__form-wrap">
        <span class="admin-login__lock"><PhLockKey :size="24" /></span>
        <p class="admin-login__eyebrow">Secure access</p>
        <h2 id="admin-login-title">Sign in to the CMS</h2>

        <div v-if="!isSupabaseConfigured" class="admin-login__setup" role="status">
          <PhWarningCircle :size="20" />
          <div><strong>Configuration required</strong><p>Add the Supabase URL and anonymous key to the project environment before signing in.</p></div>
        </div>

        <form v-else @submit.prevent="submit">
          <label><span>Email address</span><input v-model="email" type="email" autocomplete="email" required /></label>
          <label><span>Password</span><input v-model="password" type="password" autocomplete="current-password" minlength="8" required /></label>
          <p v-if="errorMessage" class="admin-login__error" role="alert"><PhWarningCircle :size="17" /> {{ errorMessage }}</p>
          <button type="submit" :disabled="submitting">
            <span>{{ submitting ? 'Signing in…' : 'Sign in' }}</span><PhArrowRight :size="18" weight="bold" />
          </button>
        </form>

        <RouterLink class="admin-login__back" to="/">Return to public website</RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.admin-login { display: grid; min-height: 100dvh; grid-template-columns: minmax(22rem, .82fr) minmax(30rem, 1.18fr); background: #f3f1ea; color: #13231d; }
.admin-login__identity { display: flex; min-height: 100%; flex-direction: column; justify-content: space-between; background: #073b2c; padding: clamp(2rem, 5vw, 5.5rem); color: white; }
.admin-login__brand { display: flex; align-items: center; gap: .9rem; color: white; }
.admin-login__brand img { width: 3.7rem; height: 3.7rem; object-fit: contain; }
.admin-login__brand small, .admin-login__brand strong { display: block; }
.admin-login__brand small { color: rgb(255 255 255 / .55); font-size: .65rem; font-weight: 750; letter-spacing: .1em; text-transform: uppercase; }
.admin-login__brand strong { margin-top: .2rem; font-size: 1rem; }
.admin-login__identity > div > p { color: #e8c774; font-size: .68rem; font-weight: 850; letter-spacing: .13em; text-transform: uppercase; }
.admin-login__identity h1 { max-width: 37rem; margin-top: 1.15rem; font-size: clamp(2.8rem, 5vw, 5.7rem); font-weight: 900; line-height: .95; letter-spacing: -.065em; text-wrap: balance; }
.admin-login__support { display: flex; align-items: center; gap: .6rem; color: rgb(255 255 255 / .65); font-size: .75rem; }
.admin-login__support svg { color: #e8c774; }
.admin-login__panel { display: grid; place-items: center; padding: 2rem; }
.admin-login__form-wrap { width: min(100%, 28rem); }
.admin-login__lock { display: grid; width: 3.2rem; height: 3.2rem; place-items: center; background: rgb(7 59 44 / .08); color: #073b2c; }
.admin-login__eyebrow { margin-top: 2rem; color: #8b6719; font-size: .65rem; font-weight: 850; letter-spacing: .13em; text-transform: uppercase; }
.admin-login h2 { margin-top: .6rem; font-size: clamp(2rem, 4vw, 3.4rem); font-weight: 900; line-height: 1; letter-spacing: -.055em; }
.admin-login form { display: grid; gap: 1.15rem; margin-top: 2.25rem; }
.admin-login label span { display: block; margin-bottom: .5rem; font-size: .72rem; font-weight: 800; }
.admin-login input { width: 100%; min-height: 3.3rem; border: 1px solid rgb(7 59 44 / .18); background: white; padding: .8rem .9rem; outline: none; transition: border-color 220ms, box-shadow 220ms; }
.admin-login input:focus { border-color: #a8791e; box-shadow: 0 0 0 3px rgb(168 121 30 / .12); }
.admin-login form button { display: flex; min-height: 3.4rem; align-items: center; justify-content: space-between; margin-top: .4rem; background: #073b2c; padding: .8rem 1rem; color: white; font-size: .76rem; font-weight: 850; transition: transform 220ms, background-color 220ms; }
.admin-login form button:hover:not(:disabled) { transform: translateY(-2px); background: #0b513d; }
.admin-login form button:disabled { cursor: wait; opacity: .6; }
.admin-login__error { display: flex; align-items: center; gap: .5rem; color: #9b2c2c; font-size: .72rem; }
.admin-login__setup { display: flex; gap: .75rem; margin-top: 2rem; background: #fff4d8; padding: 1rem; color: #6d5216; }
.admin-login__setup svg { flex-shrink: 0; }
.admin-login__setup strong { font-size: .78rem; }
.admin-login__setup p { margin-top: .25rem; font-size: .7rem; line-height: 1.5; }
.admin-login__back { display: inline-block; margin-top: 1.6rem; border-bottom: 1px solid rgb(7 59 44 / .35); color: #41544b; font-size: .7rem; font-weight: 750; }
@media (max-width: 800px) {
  .admin-login { width: 100%; min-width: 0; overflow-x: clip; grid-template-columns: minmax(0, 1fr); }
  .admin-login__identity { min-height: 18rem; padding: 1.5rem; }
  .admin-login__identity h1 { max-width: 28rem; overflow-wrap: anywhere; font-size: clamp(2.2rem, 10vw, 3.4rem); }
  .admin-login__support { display: none; }
  .admin-login__panel { place-items: start center; padding: 2.5rem 1.25rem 4rem; }
  .admin-login__form-wrap,.admin-login form,.admin-login label { min-width: 0; }
  .admin-login input { min-width: 0; max-width: 100%; font-size: 1rem; }
  .admin-login__setup,.admin-login__error { min-width: 0; overflow-wrap: anywhere; }
}
@media (max-width: 420px) {
  .admin-login__identity { min-height: 15rem; padding: 1.1rem; }
  .admin-login__brand img { width: 3rem; height: 3rem; }
  .admin-login__identity h1 { font-size: clamp(2rem, 10vw, 2.65rem); }
  .admin-login__panel { padding: 2rem 1rem 3rem; }
}
</style>
