<script setup lang="ts">
import {computed, defineEmits, reactive, ref, watch} from 'vue'
import {Markdown} from '../../markdown.ts'
import {
  DeleteOutlined,
  DownloadOutlined,
  FileMarkdownOutlined,
  FileTextOutlined,
  FileWordOutlined,
  UserOutlined,
  FileExcelOutlined
} from '@ant-design/icons-vue'
import {getImageUrl} from '../utils.ts'
import translations from '../../i18n.ts'

const markdown = new Markdown()
const mdExcel = new Markdown('excel')
const mdPlaintext = new Markdown('plainText')
const mdHighlight = new Markdown('highlight')

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
          if (msg.content) {
            const m = messages[index]
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
              }
              return m
            }

            return {
              ...msg,
              render: msg.content.length,
              html: await mdHighlight.render(msg.content),
            }
          } else {
            return {
              ...msg,
              thinking: msg.thinking,
              thinkingStatus: msg.thinkingStatus,
            }
          }
        })
    )

    messages.splice(0, messages.length, ...processed)
    activeRow.value = messages.length - 1
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

const copyAsExcel = async (md: string) => {
  const outerHTML = await mdExcel.render(md)
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

const emit = defineEmits(['suggest', 'delMessage'])

const suggest = (content: string) => {
  emit('suggest', content)
}

const delMessage = (id: number) => {
  if (id) {
    const index = messages.findIndex((message: Message) => message.id === id)
    if (index !== -1) {
      messages.splice(index, 1)
    }
    emit('delMessage', id)
  }
}

const activeKey = ref(['1'])

const activeRow = ref(1)

const handleMouseOver = (index: number) => {
  activeRow.value = index
}

const handleHtmlMouseOver = (event: any) => {
  const table = event.target.closest('table')
  if (table) {
    console.log('Table wrapper clicked!');
    // 在这里添加你的逻辑
  }
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
            style="padding:10px"
            @mouseover="handleMouseOver(index)"
        >
          <a-collapse v-model:activeKey="activeKey" ghost v-if="message.thinking">
            <a-collapse-panel key="1" :header="message.thinkingStatus===1 ? '思考中...' : '已深度思考'">
              <a-typography-text type="secondary">
                <pre class="thinking">{{ message.thinking }}</pre>
              </a-typography-text>
            </a-collapse-panel>
          </a-collapse>
          <div v-html="message.html" @mouseover="handleHtmlMouseOver"></div>
          <a-space direction="vertical" v-if="message.suggest" style="margin-top: 1em;">
            <a-typography-text underline class="link" v-for="(item, index) in message.suggest"
                               :key="index" @click="suggest(item)">{{ item }}
            </a-typography-text>
          </a-space>
        </div>
        <a-space size="small" class="options" v-if="message.finished && index===activeRow">
          <a-tooltip>
            <template #title>{{ t.delete }}</template>
            <DeleteOutlined @click="delMessage(message.id||0)"/>
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
            <template #title>{{ t.copyAsExcel }}</template>
            <FileExcelOutlined @click="copyAsExcel(message.content)"/>
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
        <div style="height: 21px;" v-if="message.finished && index!==activeRow">
        </div>
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

.thinking {
  font-family: inherit;
  font-size: 1em;

  margin: 0;
  padding: 0;

  background: none;
  border: none;
}
</style>
