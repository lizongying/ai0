<script setup lang="ts">
import {computed, ref, shallowRef, watch} from 'vue'
import {marked} from 'marked'

const props = defineProps<{ md: string }>()
const cachedHtml = shallowRef<string | null>(null)
const isParsing = ref(false)

const html = computed(() => {
  if (isParsing.value) {
    return '<p>Loading...</p>'
  }
  if (cachedHtml.value !== null) {
    return cachedHtml.value
  }
  return '<p>Loading...</p>'
})

watch(() => props.md, async (newMd) => {
  if (!newMd) return
  await parseMarkdown(newMd)
}, {immediate: true})

async function parseMarkdown(md: string) {
  if (isParsing.value) return
  isParsing.value = true
  try {
    cachedHtml.value = await marked.parse(md)
  } catch (error) {
    cachedHtml.value = '<p>Error</p>'
  } finally {
    isParsing.value = false
  }
}
</script>

<template>
  <div>{{ html }}</div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
