<script setup>
defineProps({
  blocks: { type: Array, default: () => [] },
  fallback: { type: String, default: '' },
})
</script>

<template>
  <div class="faq-answer text-sm leading-7 text-ink/68">
    <template v-if="blocks.length">
      <template v-for="(block, index) in blocks" :key="block.id || index">
        <p v-if="block.type === 'paragraph'" class="whitespace-pre-line">{{ block.text }}</p>
        <ol v-else-if="block.type === 'steps'" class="grid list-decimal gap-2 pl-5">
          <li v-for="item in block.items" :key="item.title || item.text || item"><strong v-if="item.title" class="text-ink/80">{{ item.title }}: </strong>{{ item.text || item }}</li>
        </ol>
        <ul v-else-if="block.type === 'list'" class="grid list-disc gap-2 pl-5">
          <li v-for="item in block.items" :key="item.title || item.text || item"><strong v-if="item.title" class="text-ink/80">{{ item.title }}: </strong>{{ item.text || item }}</li>
        </ul>
        <aside v-else-if="block.type === 'note'" class="border-l-2 border-orange-600 bg-orange-50 px-4 py-3 text-ink/72">{{ block.text }}</aside>
      </template>
    </template>
    <p v-else class="whitespace-pre-line">{{ fallback }}</p>
  </div>
</template>

<style scoped>
.faq-answer > * + * { margin-top: 1rem; }
</style>
