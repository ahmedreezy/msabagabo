<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { cmsContent } from '../stores/cmsContent'
import DirectorateDepartment from '../components/DirectorateDepartment.vue'
import EducationDepartment from '../components/EducationDepartment.vue'
import NotFoundView from './NotFoundView.vue'
import { publicEducationProfile } from '../lib/educationProfile.js'

const route = useRoute()
const department = computed(() => cmsContent.departments.find((item) => item.slug === route.params.slug))
const departmentFaqs = computed(() => cmsContent.faqs.filter((item) => item.departmentSlug === department.value?.slug))
const educationDraft = ref(null)
const educationPreview = computed(() => import.meta.env.DEV && !!educationDraft.value && !publicEducationProfile(department.value || {}))
const educationDepartment = computed(() => educationPreview.value ? { ...department.value, educationProfile: department.value?.educationProfile || educationDraft.value } : department.value)

onMounted(async () => {
  if (import.meta.env.DEV) {
    const { createEducationDraft } = await import('../data/educationDraft.js')
    educationDraft.value = createEducationDraft()
  }
})
</script>

<template>
  <EducationDepartment v-if="department?.slug === 'education-sports'" :department="educationDepartment" :faqs="departmentFaqs" :preview="educationPreview" />
  <DirectorateDepartment v-else-if="department" :department="department" :faqs="departmentFaqs" />
  <div v-else-if="!cmsContent.loaded" class="site-container py-20" role="status">Loading directorate…</div>
  <NotFoundView v-else />
</template>
