<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PageHero from './PageHero.vue'

const props = defineProps({
  pageKey: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  variant: { type: String, default: '' },
  preferProps: { type: Boolean, default: false },
})

const route = useRoute()
const pageKeyByRoute = {
  departments: 'directorates',
  'department-detail': 'directorate-default',
  privacy: 'legal-default',
  accessibility: 'legal-default',
  disclaimer: 'legal-default',
  'site-map': 'legal-default',
  'not-found': 'utility-default',
}

const resolvedPageKey = computed(() => props.pageKey || pageKeyByRoute[route.name] || String(route.name || 'utility-default'))
const resolvedVariant = computed(() => props.variant || (['department-detail', 'privacy', 'accessibility', 'disclaimer', 'site-map', 'not-found'].includes(String(route.name)) ? 'compact' : 'page'))
const usesDynamicTitle = computed(() => props.preferProps || ['department-detail', 'privacy', 'accessibility', 'disclaimer', 'site-map'].includes(String(route.name)))
</script>

<template>
  <PageHero
    :page-key="resolvedPageKey"
    :variant="resolvedVariant"
    :eyebrow="eyebrow"
    :title="title"
    :description="description"
    :prefer-props="usesDynamicTitle"
  >
    <template #breadcrumb><slot name="breadcrumb">{{ title }}</slot></template>
  </PageHero>
</template>
