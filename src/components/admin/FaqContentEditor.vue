<script setup>
import { PhArrowDown, PhArrowUp, PhPlus, PhTrash } from '@phosphor-icons/vue'

const blocks = defineModel({ type: Array, default: () => [] })
const blockTypes = { paragraph: 'Paragraph', list: 'Bulleted list', steps: 'Numbered steps', note: 'Public note' }
const addBlock = (type = 'paragraph') => blocks.value.push({ id: crypto.randomUUID(), type, text: '', ...(type === 'list' || type === 'steps' ? { items: [] } : {}) })
const removeBlock = (index) => blocks.value.splice(index, 1)
const move = (index, direction) => {
  const destination = index + direction
  if (destination < 0 || destination >= blocks.value.length) return
  const [block] = blocks.value.splice(index, 1)
  blocks.value.splice(destination, 0, block)
}
const addItem = (block) => block.items.push({ title: '', text: '' })
const removeItem = (block, index) => block.items.splice(index, 1)
</script>

<template>
  <section class="structured-editor" aria-label="Structured FAQ answer">
    <header><div><strong>Answer sections</strong><p>Use paragraphs, semantic lists and public notes.</p></div><button type="button" @click="addBlock()"><PhPlus :size="16" /> Add section</button></header>
    <p v-if="!blocks.length" class="empty">No structured answer sections yet.</p>
    <article v-for="(block, index) in blocks" :key="block.id || index">
      <div class="row"><label><span>Section type</span><select v-model="block.type"><option v-for="(label, value) in blockTypes" :key="value" :value="value">{{ label }}</option></select></label><div class="actions"><button type="button" aria-label="Move section up" @click="move(index, -1)"><PhArrowUp /></button><button type="button" aria-label="Move section down" @click="move(index, 1)"><PhArrowDown /></button><button type="button" aria-label="Remove section" @click="removeBlock(index)"><PhTrash /></button></div></div>
      <label v-if="block.type === 'paragraph' || block.type === 'note'"><span>Text</span><textarea v-model="block.text" rows="4"></textarea></label>
      <div v-else class="items">
        <div v-for="(item, itemIndex) in block.items" :key="itemIndex" class="item">
          <input v-model="item.title" type="text" placeholder="Optional label" />
          <textarea v-model="item.text" rows="2" placeholder="Item text"></textarea>
          <button type="button" :aria-label="`Remove item ${itemIndex + 1}`" @click="removeItem(block, itemIndex)"><PhTrash /></button>
        </div>
        <button type="button" @click="addItem(block)"><PhPlus :size="15" /> Add item</button>
      </div>
    </article>
  </section>
</template>

<style scoped>
.structured-editor{display:grid;grid-column:1/-1;gap:.8rem;border:1px solid rgb(7 59 44/.12);background:#f8faf6;padding:1rem}.structured-editor>header,.row{display:flex;align-items:center;justify-content:space-between;gap:1rem}.structured-editor header strong{font-size:.8rem}.structured-editor header p,.empty{margin-top:.2rem;color:#68766e;font-size:.62rem}.structured-editor button{display:inline-flex;align-items:center;gap:.35rem;border:1px solid rgb(7 59 44/.18);padding:.5rem .65rem;color:#073b2c;font-size:.62rem;font-weight:800}.structured-editor article{display:grid;gap:.75rem;background:white;padding:.85rem}.row label{min-width:12rem}.actions{display:flex;gap:.3rem}.actions button{padding:.45rem}.items{display:grid;gap:.55rem}.item{display:grid;grid-template-columns:minmax(8rem,.35fr) 1fr auto;gap:.45rem;align-items:start}.item button{min-height:2.9rem}.structured-editor input,.structured-editor textarea,.structured-editor select{width:100%;border:1px solid rgb(7 59 44/.16);background:#fbfcfa;padding:.65rem;font-size:.68rem}
</style>
