<script setup>
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'

const route = useRoute()
</script>

<template>
  <div class="min-h-[100dvh] bg-canvas text-ink">
    <SiteHeader v-if="!route.meta.admin" />
    <main id="main-content">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page-transition" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </main>
    <SiteFooter v-if="!route.meta.admin" />
  </div>
</template>
