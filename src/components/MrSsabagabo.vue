<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import {
  PhArrowSquareOut,
  PhChatCircleDots,
  PhPaperPlaneRight,
  PhPhone,
  PhRobot,
  PhShieldCheck,
  PhX,
} from '@phosphor-icons/vue'
import { askMrSsabagabo, assistantAvailable } from '../services/assistant'

const welcomeMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Hello, I am Mr. Ssabagabo, an AI guide for municipal services. Tell me what you need help with and I will direct you to the relevant published information.',
  sources: [],
}

const quickQuestions = [
  'Where do I ask about registering a school?',
  'Which office handles trading licences?',
  'How do I report a road or drainage problem?',
  'Where can I get building application guidance?',
]

const isOpen = ref(false)
const isSending = ref(false)
const question = ref('')
const errorMessage = ref('')
const messages = ref([welcomeMessage])
const trigger = ref(null)
const panel = ref(null)
const input = ref(null)
const messageList = ref(null)

const isNetlifyPreview = /(^|\.)netlify\.(app|live)$/i.test(window.location.hostname)

const remainingCharacters = computed(() => 500 - question.value.length)

const safeHref = (url) => {
  const value = String(url || '')
  if (value.startsWith('/')) return value
  try {
    const parsed = new URL(value)
    return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : '/contact'
  } catch {
    return '/contact'
  }
}

const isExternal = (url) => /^https?:\/\//i.test(String(url || ''))
const cleanVisibleText = (value) => String(value || '').replace(/[—–]/g, '-')

const scrollToLatest = async () => {
  await nextTick()
  messageList.value?.scrollTo({ top: messageList.value.scrollHeight, behavior: 'smooth' })
}

const open = async () => {
  isOpen.value = true
  await nextTick()
  input.value?.focus()
}

const close = () => {
  isOpen.value = false
  errorMessage.value = ''
  nextTick(() => trigger.value?.focus())
}

const handleDialogKeydown = (event) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }
  if (event.key !== 'Tab' || !panel.value) return
  const focusable = [...panel.value.querySelectorAll('a[href], button:not(:disabled), textarea:not(:disabled)')]
    .filter((element) => element.getClientRects().length)
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

const send = async (suggestedQuestion = '') => {
  const content = String(suggestedQuestion || question.value).trim().slice(0, 500)
  if (!content || isSending.value) return

  errorMessage.value = ''
  question.value = ''
  const history = messages.value
    .filter((message) => message.id !== 'welcome' && !message.pending)
    .map(({ role, content: messageContent }) => ({ role, content: messageContent }))
  messages.value.push({ id: crypto.randomUUID(), role: 'user', content, sources: [] })
  const pendingId = crypto.randomUUID()
  messages.value.push({ id: pendingId, role: 'assistant', content: '', sources: [], pending: true })
  isSending.value = true
  await scrollToLatest()

  try {
    const response = await askMrSsabagabo(content, history)
    const pending = messages.value.find((message) => message.id === pendingId)
    if (pending) {
      pending.content = cleanVisibleText(response.answer)
      pending.sources = Array.isArray(response.sources) ? response.sources : []
      pending.pending = false
      pending.grounded = response.grounded !== false
    }
  } catch (error) {
    messages.value = messages.value.filter((message) => message.id !== pendingId)
    errorMessage.value = cleanVisibleText(error.message || 'The assistant could not answer right now.')
  } finally {
    isSending.value = false
    await scrollToLatest()
    input.value?.focus()
  }
}

watch(isOpen, (openState) => {
  document.body.classList.toggle('assistant-open', openState && window.innerWidth < 640)
})

onBeforeUnmount(() => document.body.classList.remove('assistant-open'))
</script>

<template>
  <div
    class="municipal-assistant"
    :class="{ 'municipal-assistant--netlify-preview': isNetlifyPreview }"
  >
    <button
      v-if="!isOpen"
      ref="trigger"
      class="assistant-trigger"
      type="button"
      aria-haspopup="dialog"
      aria-controls="mr-ssabagabo-dialog"
      @click="open"
    >
      <span class="assistant-trigger__icon"><PhChatCircleDots :size="23" weight="fill" /></span>
      <span><strong>Ask Mr. Ssabagabo</strong><small>Municipal service guide</small></span>
    </button>

    <section
      v-else
      id="mr-ssabagabo-dialog"
      ref="panel"
      class="assistant-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assistant-title"
      aria-describedby="assistant-description"
      @keydown="handleDialogKeydown"
    >
      <header class="assistant-header">
        <span class="assistant-avatar" aria-hidden="true"><PhRobot :size="25" weight="fill" /></span>
        <span class="assistant-header__copy">
          <strong id="assistant-title">Mr. Ssabagabo</strong>
          <small id="assistant-description">AI municipal information guide</small>
        </span>
        <button class="assistant-close" type="button" aria-label="Close Mr. Ssabagabo" @click="close">
          <PhX :size="20" weight="bold" />
        </button>
      </header>

      <div ref="messageList" class="assistant-messages" aria-live="polite" aria-relevant="additions text">
        <div class="assistant-notice">
          <PhShieldCheck :size="18" weight="fill" />
          <p>Uses approved public information. Do not share passwords, identification numbers or confidential records.</p>
        </div>

        <article
          v-for="message in messages"
          :key="message.id"
          class="assistant-message"
          :class="`assistant-message--${message.role}`"
        >
          <div v-if="message.pending" class="assistant-thinking" role="status" aria-label="Mr. Ssabagabo is checking published information">
            <span></span><span></span><span></span>
          </div>
          <template v-else>
            <p>{{ message.content }}</p>
            <div v-if="message.sources?.length" class="assistant-sources">
              <strong>Published sources</strong>
              <a
                v-for="source in message.sources"
                :key="`${message.id}-${source.url}-${source.title}`"
                :href="safeHref(source.url)"
                :target="isExternal(source.url) ? '_blank' : undefined"
                :rel="isExternal(source.url) ? 'noreferrer' : undefined"
              >
                <span>{{ source.title }}</span><PhArrowSquareOut v-if="isExternal(source.url)" :size="14" />
              </a>
            </div>
          </template>
        </article>

        <div v-if="messages.length === 1" class="assistant-prompts" aria-label="Suggested questions">
          <button v-for="prompt in quickQuestions" :key="prompt" type="button" @click="send(prompt)">{{ prompt }}</button>
        </div>

        <div v-if="errorMessage" class="assistant-error" role="alert">
          <p>{{ errorMessage }}</p>
          <a href="/contact">Contact the council</a>
        </div>
      </div>

      <form class="assistant-compose" @submit.prevent="send()">
        <label for="assistant-question">Ask about a municipal service</label>
        <div class="assistant-compose__field">
          <textarea
            id="assistant-question"
            ref="input"
            v-model="question"
            :disabled="isSending || !assistantAvailable"
            maxlength="500"
            rows="2"
            placeholder="For example: Which office helps with school registration?"
            @keydown.enter.exact.prevent="send()"
          ></textarea>
          <button :disabled="isSending || !assistantAvailable || !question.trim()" type="submit" aria-label="Send question">
            <PhPaperPlaneRight :size="20" weight="fill" />
          </button>
        </div>
        <div class="assistant-compose__meta">
          <span>{{ remainingCharacters }} characters remaining</span>
          <a href="tel:0800256260"><PhPhone :size="14" /> 0800 256 260</a>
        </div>
      </form>
    </section>
  </div>
</template>

<style scoped>
.municipal-assistant { --assistant-bottom-offset: clamp(1rem, 2.5vw, 2rem); position: fixed; right: clamp(1rem, 2.5vw, 2rem); bottom: var(--assistant-bottom-offset); z-index: 60; }
.municipal-assistant.municipal-assistant--netlify-preview { --assistant-bottom-offset: 5.5rem; }
.assistant-trigger { display: flex; align-items: center; gap: .75rem; min-height: 3.75rem; border: 1px solid rgb(255 255 255 / .16); border-radius: .75rem; background: #17233a; padding: .55rem 1rem .55rem .6rem; color: #f8fafc; box-shadow: 0 1rem 3rem rgb(17 27 48 / .24); cursor: pointer; transition: transform 220ms ease, background-color 220ms ease; }
.assistant-trigger:hover { transform: translateY(-2px); background: #243552; }
.assistant-trigger:active { transform: scale(.98); }
.assistant-trigger__icon { display: grid; width: 2.6rem; height: 2.6rem; flex: 0 0 auto; place-items: center; border-radius: .55rem; background: #8f3f48; color: white; }
.assistant-trigger > span:last-child { display: grid; gap: .12rem; text-align: left; }
.assistant-trigger strong { font-size: .86rem; line-height: 1.2; }
.assistant-trigger small { color: rgb(255 255 255 / .66); font-size: .68rem; }
.assistant-panel { display: grid; width: min(25rem, calc(100vw - 2rem)); height: min(43rem, calc(100dvh - var(--assistant-bottom-offset) - 1rem)); grid-template-rows: auto minmax(0, 1fr) auto; overflow: hidden; border: 1px solid rgb(17 27 48 / .14); border-radius: .9rem; background: #f8fafc; box-shadow: 0 1.5rem 5rem rgb(17 27 48 / .28); }
.assistant-header { display: flex; align-items: center; gap: .75rem; min-height: 4.5rem; background: #17233a; padding: .7rem .75rem; color: #f8fafc; }
.assistant-avatar { display: grid; width: 2.8rem; height: 2.8rem; flex: 0 0 auto; place-items: center; border-radius: .6rem; background: #8f3f48; }
.assistant-header__copy { display: grid; flex: 1; gap: .08rem; }
.assistant-header__copy strong { font-size: 1rem; }
.assistant-header__copy small { color: rgb(255 255 255 / .65); font-size: .72rem; }
.assistant-close { display: grid; width: 2.5rem; height: 2.5rem; place-items: center; border: 0; border-radius: .55rem; background: rgb(255 255 255 / .1); color: white; cursor: pointer; }
.assistant-close:hover { background: rgb(255 255 255 / .18); }
.assistant-messages { overflow-y: auto; overscroll-behavior: contain; padding: 1rem; scrollbar-color: #9ca3af transparent; }
.assistant-notice { display: grid; grid-template-columns: auto 1fr; gap: .55rem; margin-bottom: 1rem; border-left: 3px solid #8f3f48; background: #f7eeee; padding: .7rem .75rem; color: #4f2930; }
.assistant-notice p { margin: 0; font-size: .7rem; line-height: 1.45; }
.assistant-message { display: grid; margin-block: .7rem; }
.assistant-message > p { width: fit-content; max-width: 92%; margin: 0; border-radius: .7rem; padding: .72rem .82rem; font-size: .8rem; line-height: 1.58; white-space: pre-wrap; overflow-wrap: anywhere; }
.assistant-message--assistant > p { background: #e9edf3; color: #17233a; }
.assistant-message--user { justify-items: end; }
.assistant-message--user > p { background: #17233a; color: #f8fafc; }
.assistant-sources { display: grid; width: 92%; gap: .35rem; margin-top: .45rem; padding-left: .15rem; }
.assistant-sources > strong { color: #526078; font-size: .65rem; letter-spacing: .04em; text-transform: uppercase; }
.assistant-sources a { display: flex; align-items: center; justify-content: space-between; gap: .4rem; color: #71323a; font-size: .7rem; font-weight: 750; text-decoration: underline; text-decoration-color: rgb(113 50 58 / .32); text-underline-offset: 2px; }
.assistant-thinking { display: flex; width: fit-content; gap: .3rem; border-radius: .7rem; background: #e9edf3; padding: .9rem; }
.assistant-thinking span { width: .38rem; height: .38rem; border-radius: 50%; background: #526078; animation: assistant-pulse 1.1s infinite ease-in-out; }
.assistant-thinking span:nth-child(2) { animation-delay: 120ms; }
.assistant-thinking span:nth-child(3) { animation-delay: 240ms; }
.assistant-prompts { display: grid; gap: .45rem; margin-top: 1rem; }
.assistant-prompts button { border: 1px solid rgb(23 35 58 / .16); border-radius: .55rem; background: white; padding: .66rem .72rem; color: #243552; font-size: .73rem; font-weight: 700; line-height: 1.35; text-align: left; cursor: pointer; }
.assistant-prompts button:hover { border-color: #8f3f48; background: #f7eeee; }
.assistant-error { border-left: 3px solid #8f3f48; background: #f7eeee; padding: .75rem; color: #4f2930; font-size: .75rem; line-height: 1.45; }
.assistant-error p { margin: 0; }
.assistant-error a { display: inline-block; margin-top: .35rem; color: #71323a; font-weight: 800; text-decoration: underline; }
.assistant-compose { border-top: 1px solid rgb(23 35 58 / .12); background: white; padding: .8rem; }
.assistant-compose > label { display: block; margin-bottom: .4rem; color: #3d4a60; font-size: .68rem; font-weight: 800; }
.assistant-compose__field { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: .45rem; border: 1px solid #a8b0bd; border-radius: .65rem; padding: .35rem; background: #fff; }
.assistant-compose__field:focus-within { border-color: #8f3f48; box-shadow: 0 0 0 2px rgb(143 63 72 / .18); }
.assistant-compose textarea { min-height: 3.1rem; max-height: 7rem; resize: vertical; border: 0; outline: 0; background: transparent; padding: .38rem; color: #151b26; font-size: .78rem; line-height: 1.45; }
.assistant-compose textarea::placeholder { color: #697386; opacity: 1; }
.assistant-compose__field button { display: grid; width: 2.55rem; height: 2.55rem; place-items: center; border: 0; border-radius: .55rem; background: #8f3f48; color: white; cursor: pointer; }
.assistant-compose__field button:hover:not(:disabled) { background: #71323a; }
.assistant-compose__field button:disabled { background: #c3c7cf; color: #697386; cursor: not-allowed; }
.assistant-compose__meta { display: flex; justify-content: space-between; gap: .5rem; margin-top: .42rem; color: #697386; font-size: .62rem; }
.assistant-compose__meta a { display: inline-flex; align-items: center; gap: .2rem; color: #526078; font-weight: 750; }
@keyframes assistant-pulse { 0%, 80%, 100% { transform: scale(.65); opacity: .45; } 40% { transform: scale(1); opacity: 1; } }
@media (max-width: 639px) {
  .municipal-assistant { --assistant-bottom-offset: .65rem; right: .65rem; left: .65rem; }
  .municipal-assistant.municipal-assistant--netlify-preview { --assistant-bottom-offset: 5.5rem; }
  .assistant-trigger { margin-left: auto; }
  .assistant-panel { width: 100%; height: calc(100dvh - var(--assistant-bottom-offset) - .65rem); }
}
@media (prefers-reduced-motion: reduce) {
  .assistant-trigger { transition: none; }
  .assistant-thinking span { animation: none; opacity: .7; }
}
</style>

