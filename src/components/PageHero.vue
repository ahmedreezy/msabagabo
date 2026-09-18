<script setup>
import { computed } from 'vue'
import { PhArrowRight, PhArrowUpRight } from '@phosphor-icons/vue'
import { getPagePresentation } from '../stores/cmsContent'

const props = defineProps({
  pageKey: { type: String, required: true },
  fallbackKey: { type: String, default: 'utility-default' },
  variant: { type: String, default: 'page' },
  eyebrow: { type: String, default: '' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  preferProps: { type: Boolean, default: false },
  showBreadcrumb: { type: Boolean, default: true },
  secondaryLabel: { type: String, default: '' },
  secondaryTo: { type: String, default: '' },
})

const presentation = computed(() => getPagePresentation(props.pageKey, props.fallbackKey))
const content = computed(() => {
  const item = presentation.value || {}
  return {
    eyebrow: props.preferProps ? (props.eyebrow || item.eyebrow) : (item.eyebrow || props.eyebrow),
    title: props.preferProps ? (props.title || item.title) : (item.title || props.title),
    summary: props.preferProps ? (props.description || item.summary) : (item.summary || props.description),
    image: item.image,
    imageAlt: item.imageAlt || '',
    focalX: Number.isFinite(Number(item.focalX)) ? Number(item.focalX) : 50,
    focalY: Number.isFinite(Number(item.focalY)) ? Number(item.focalY) : 50,
    ctaLabel: item.ctaLabel || '',
    ctaTo: item.ctaTo || '',
    isIllustrative: Boolean(item.isIllustrative),
    credit: item.credit || 'Illustrative visual',
  }
})

const heroStyle = computed(() => ({
  '--hero-focal-x': `${content.value.focalX}%`,
  '--hero-focal-y': `${content.value.focalY}%`,
}))

const isExternal = (to) => /^(https?:|mailto:|tel:)/i.test(to || '')
</script>

<template>
  <section class="page-hero" :class="`page-hero--${variant}`" :style="heroStyle">
    <div class="site-container page-hero__shell">
      <div class="page-hero__content">
        <nav v-if="showBreadcrumb" class="page-hero__breadcrumb" aria-label="Breadcrumb">
          <RouterLink to="/">Home</RouterLink>
          <span aria-hidden="true">/</span>
          <span><slot name="breadcrumb">{{ content.title }}</slot></span>
        </nav>

        <div class="page-hero__copy">
          <p v-if="content.eyebrow" class="page-hero__eyebrow">{{ content.eyebrow }}</p>
          <h1>{{ content.title }}</h1>
          <p v-if="content.summary" class="page-hero__summary">{{ content.summary }}</p>
          <div v-if="content.ctaLabel || secondaryLabel" class="page-hero__actions">
            <component
              :is="isExternal(content.ctaTo) ? 'a' : 'RouterLink'"
              v-if="content.ctaLabel && content.ctaTo"
              class="page-hero__button page-hero__button--primary"
              :href="isExternal(content.ctaTo) ? content.ctaTo : undefined"
              :to="!isExternal(content.ctaTo) ? content.ctaTo : undefined"
            >
              {{ content.ctaLabel }} <PhArrowRight :size="17" weight="bold" />
            </component>
            <component
              :is="isExternal(secondaryTo) ? 'a' : 'RouterLink'"
              v-if="secondaryLabel && secondaryTo"
              class="page-hero__button page-hero__button--secondary"
              :href="isExternal(secondaryTo) ? secondaryTo : undefined"
              :to="!isExternal(secondaryTo) ? secondaryTo : undefined"
            >
              {{ secondaryLabel }} <PhArrowUpRight :size="17" weight="bold" />
            </component>
          </div>
        </div>
      </div>

      <figure class="page-hero__media">
        <img
          :src="content.image"
          :alt="content.imageAlt"
          loading="eager"
          :fetchpriority="variant === 'signature' ? 'high' : 'auto'"
          decoding="async"
        />
        <figcaption v-if="content.isIllustrative" class="page-hero__credit">{{ content.credit }}</figcaption>
      </figure>
    </div>
  </section>
</template>
