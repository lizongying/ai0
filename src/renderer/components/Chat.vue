<script setup lang="ts">
import {reactive, watch} from 'vue'
import {marked} from 'marked'
import {UserOutlined} from "@ant-design/icons-vue";
import {getImageUrl} from '../utils.ts'

interface Message {
  username: string
  avatar: string
  me: boolean
  content: string
  html?: string
}

const props = defineProps<{ messages: Message[], settings: Settings }>()
const messages = reactive<Message[]>([])

const parseMarkdown = async (md: string): Promise<string> => {
  try {
    console.log('md', md)
    return (await marked.parse(md)) || ''
  } catch (error) {
    console.error('Markdown parsing error:', error)
    return ''
  }
}

watch(() => props.messages, async (newMessages) => {
  console.log('newMessages', newMessages)
  if (!newMessages?.length) return

  try {
    const processed = await Promise.all(
        newMessages.map(async (msg) => ({
          ...msg,
          html: await parseMarkdown(msg.content)
        }))
    )

    messages.splice(0, messages.length, ...processed)
  } catch (error) {
    console.error('Failed to process messages:', error)
  }
}, {immediate: true, deep: true})

const messageContainerClass = (me: boolean): string => {
  return me ? 'message-container right' : 'message-container left'
}

</script>

<template>
  <div class="messages-container">
    <div :class="messageContainerClass(message.me)" v-for="(message, index) in messages" :key="index">
      <div class="avatar" v-if="!message.me" :style="{ backgroundImage: `url(${message.avatar})` }"></div>
      <a-tooltip v-if="!message.me">
        <template #title>{{ message.username }}</template>
        <a-avatar :src="getImageUrl(message.avatar)" shape="square" :size="64">
          <template #icon>
            <UserOutlined/>
          </template>
        </a-avatar>
      </a-tooltip>
      <div class="message-content">
        <div class="username">{{ message.username }} {{ new Date().toLocaleString() }}</div>
        <div
            class="speech-bubble"
            v-html="message.html"
        ></div>
      </div>
      <a-tooltip v-if="message.me">
        <template #title>{{ message.username }}</template>
        <a-avatar :src="getImageUrl(message.avatar)" shape="square" :size="64">
          <template #icon>
            <UserOutlined/>
          </template>
        </a-avatar>
      </a-tooltip>
      <div class="avatar" v-if="message.me" :style="{ backgroundImage: `url(${message.avatar})` }"></div>
    </div>
  </div>
</template>

<style scoped>
.messages-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-container {
  display: flex;
  gap: 12px;
}

.message-container.left {
  justify-content: flex-start;
  text-align: left;
}

.message-container.right {
  justify-content: flex-end;
  text-align: right;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #213547;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.message-content {
  width: calc(100% - 140px);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-size: 12px;
  color: #666;
}

.speech-bubble {
  max-width: calc(100% - 140px);
  padding: 12px 16px;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  position: relative;
}

.left .speech-bubble {
  background-color: #2196F3;
  border-top-left-radius: 0;
  align-self: flex-start;
}

.right .speech-bubble {
  background-color: #4CAF50;
  border-top-right-radius: 0;
  align-self: flex-end;
}

.left .speech-bubble::before,
.right .speech-bubble::after {
  content: '';
  position: absolute;
  top: 0;
  width: 0;
  height: 0;
  border-style: solid;
}

.left .speech-bubble::before {
  left: -8px;
  border-width: 0 8px 8px 0;
  border-color: transparent #2196F3 transparent transparent;
}

.right .speech-bubble::after {
  right: -8px;
  border-width: 0 0 8px 8px;
  border-color: transparent transparent transparent #4CAF50;
}

.speech-bubble :deep(p) {
  margin: 0.5em 0;
}

.speech-bubble :deep(p:first-child) {
  margin-top: 0;
}

.speech-bubble :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
