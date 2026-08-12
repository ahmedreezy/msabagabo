<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-[100dvh] bg-zinc-50 text-zinc-950">
    <header class="border-b border-zinc-200 bg-white">
      <nav
        class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <RouterLink class="font-semibold tracking-tight" to="/">Msabagabo</RouterLink>

        <div class="flex items-center gap-6 text-sm font-medium text-zinc-600">
          <RouterLink class="transition-colors hover:text-zinc-950" to="/">Home</RouterLink>
          <RouterLink class="transition-colors hover:text-zinc-950" to="/about">About</RouterLink>
        </div>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>
