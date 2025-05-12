<script setup lang="ts">
import {computed, defineEmits, reactive, watch} from 'vue'
import {Markdown} from '../../markdown.ts'
import {
  DeleteOutlined,
  DownloadOutlined,
  FileMarkdownOutlined,
  FileTextOutlined,
  FileWordOutlined,
  UserOutlined
} from '@ant-design/icons-vue'
import {getImageUrl} from '../utils.ts'
import translations from '../../i18n.ts'

const markdown = new Markdown(false, false)
const mdPlaintext = new Markdown(true, false)
const mdHighlight = new Markdown(false, true)

enum Lang {
  Hant = '漢字',
  Hans = '简体字',
  En = 'English',
}

const t = computed(() => {
  switch (props.settings.lang) {
    case Lang.En:
      return translations.en
    case Lang.Hant:
      return translations.hant
    case Lang.Hans:
      return translations.hans
    default:
      return translations.en
  }
})

const props = defineProps<{ messages: Message[], settings: Settings }>()

const messages = reactive<Message[]>([])

watch(() => props.messages, async (newMessages) => {
  if (!newMessages?.length) return

  try {
    const processed = await Promise.all(
        newMessages.map(async (msg, index) => {
          const m = messages[index]
          // console.log(index, 'msg.content.length', msg.content.length, 'm.render', m?.render, 'msg.content', msg.content)
          if (m && m.render >= msg.content.length && m.content === msg.content) {
            if (msg.title) {
              m.title = msg.title
            }
            if (msg.finished) {
              m.finished = msg.finished
            }
            if (msg.suggest) {
              // m.suggest = msg.suggest
              m.suggest = [...msg.suggest]
              console.log('m.suggest', m.suggest)
            }
            // m.suggest=['1','2', '3']
            return m
          }

          const html = await mdHighlight.render(msg.content)

          if (msg.content) {
            return {
              ...msg,
              render: msg.content.length,
              html: `<div style="padding:10px">${html}<div>`,
            }
          } else {
            return msg
          }
        })
    )

    messages.splice(0, messages.length, ...processed)
  } catch (error) {
    console.error('Failed to process messages:', error)
  }
}, {immediate: true, deep: true})

const messageContainerClass = (me: boolean): string => {
  return me ? 'message-container right' : 'message-container left'
}

const downloadTextFile = (content: string, filename = '') => {
  const blob = new Blob([content], {type: 'text/plain'})

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename

  document.body.appendChild(a)
  a.click()

  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const download = (md: string, title: string | undefined) => {
  downloadTextFile(md, (title || md.split('\n')[0].slice(0, 10)) + '.txt')
}

const copyAsDoc = async (md: string) => {
  const outerHTML = await markdown.render(md)
  const type = 'text/html'
  const clipboardItemData = {
    [type]: new Blob([outerHTML], {type}),
  };
  try {
    console.log('html:', outerHTML)
    const clipboardItem = new ClipboardItem(clipboardItemData)
    await navigator.clipboard.write([clipboardItem])
  } catch (err) {
    console.error(err)
  }
}

const copyAsTxt = async (md: string) => {
  console.log('md', md)
  const txt = await mdPlaintext.render(md)

  console.log('plainText.render(md)', txt)

  await navigator.clipboard.writeText(txt.replace(/\n+/g, '\n'))
}

const copyAsMd = async (md: string) => {
  await navigator.clipboard.writeText(md)
}

const emit = defineEmits(['suggest'])

const suggest = (content: string) => {
  emit('suggest', content)
}

</script>

<template>
  <div class="messages-container">
    <div :class="messageContainerClass(message.user.me)" v-for="(message, index) in messages" :key="index">
      <a-tooltip v-if="!message.user.me">
        <template #title>{{ message.user.name }}</template>
        <a-avatar :src="getImageUrl(message.user.avatar)" shape="square" :size="64">
          <template #icon>
            <UserOutlined/>
          </template>
        </a-avatar>
      </a-tooltip>
      <div class="message-content">
        <div class="username">{{ props.settings.showNickname ? message.user.name : '' }} {{
            new Date().toLocaleString()
          }}
        </div>
        <div
            class="speech-bubble"
            v-html="message.html"
        >
        </div>
        <a-space direction="vertical" class="options" v-if="message.suggest">
          <a-typography-text underline class="link" v-for="(item, index) in message.suggest"
                             :key="index" @click="suggest(item)">{{ item }}
          </a-typography-text>
        </a-space>
        <a-space size="small" class="options" v-if="message.finished">
          <a-tooltip>
            <template #title>{{ t.delete }}</template>
            <DeleteOutlined @click=""/>
          </a-tooltip>
          <a-tooltip>
            <template #title>{{ t.download }}</template>
            <DownloadOutlined @click="download(message.content, message.title)"/>
          </a-tooltip>
          <a-tooltip>
            <template #title>{{ t.copyAsDoc }}</template>
            <FileWordOutlined @click="copyAsDoc(message.content)"/>
          </a-tooltip>
          <a-tooltip>
            <template #title>{{ t.copyAsTxt }}</template>
            <FileTextOutlined @click="copyAsTxt(message.content)"/>
          </a-tooltip>
          <a-tooltip>
            <template #title>{{ t.copyAsMd }}</template>
            <FileMarkdownOutlined @click="copyAsMd(message.content)"/>
          </a-tooltip>
        </a-space>
      </div>
      <a-tooltip v-if="message.user.me">
        <template #title>{{ message.user.name }}</template>
        <a-avatar :src="getImageUrl(message.user.avatar)" shape="square" :size="64">
          <template #icon>
            <UserOutlined/>
          </template>
        </a-avatar>
      </a-tooltip>
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
  text-align: left;
}

.message-container.left {
  justify-content: flex-start;
}

.message-container.right {
  justify-content: flex-end;
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

.left .username {
  text-align: left;
}

.right .username {
  text-align: right;
}

.speech-bubble {
  max-width: calc(100% - 12px);
  padding: 12px 16px;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  position: relative;
}

.left .speech-bubble {
  background-color: #444;
  border-top-left-radius: 0;
  align-self: flex-start;
}

.right .speech-bubble {
  background-color: #4CAF50;
  border-top-right-radius: 0;
  align-self: flex-end;
}

.left .options {
  align-self: flex-start;
}

.right .options {
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
  border-color: transparent #444 transparent transparent;
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

.link {
  cursor: pointer;
}
</style>
