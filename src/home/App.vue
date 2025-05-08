<script setup lang="ts">
import {
  EllipsisOutlined,
  FileAddOutlined,
  FileImageOutlined,
  LoadingOutlined,
  PlusOutlined,
  RightOutlined,
  SendOutlined,
  TranslationOutlined,
  UserOutlined
} from '@ant-design/icons-vue'
import {message, theme} from 'ant-design-vue'

import {computed, type CSSProperties, h, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch} from 'vue'
import Chat from './components/Chat.vue'
import {getImageUrl, getTimestamp, parseText} from './utils.ts'
import translations from '../i18n'
import {DatabaseManager} from './db.ts'


enum Lang {
  Hant = '漢字',
  Hans = '简体字',
  En = 'English',
}

const t = computed(() => {
  switch (settings.lang) {
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

const open = ref<boolean>(false)

const showDrawer = () => {
  open.value = true
}

const ellipsis = ref(true)

const groupNotify = ref(`亲爱的群成员们：
大家好！为营造高效、友好的交流环境，现就群内规则提醒如下，请仔细阅读：
1️⃣ 群功能定位
本群旨在AI工作交流，请勿发布无关广告、谣言或敏感内容。
2️⃣ 发言规范
▫️ 文明交流，禁止人身攻击或歧视性言论；
▫️ 私聊需求请主动@好友，避免群内频繁@全体成员。
4️⃣ 问题反馈
如遇技术问题或疑问，请联系管理员 https://github.com/lizongying/ai0/
感谢大家的配合与支持！让我们共同维护一个有价值的社群空间～
—— 群管理团队`)

const lines = computed(() => groupNotify.value.split('\n'))
const lineMax = 5

const headerStyle: CSSProperties = {
  height: 64,
  paddingInline: 50,
  lineHeight: '64px',
  backgroundColor: '#333',
}

const contentStyle: CSSProperties = {
  textAlign: 'center',
  height: '100vh',
  lineHeight: '1.5em',
  backgroundColor: '#333',
  padding: '0 50px',
  overflow: 'scroll',
}

const siderStyle: CSSProperties = {
  backgroundColor: '#333',
  borderRight: '1px solid rgba(253, 253, 253, 0.12)',
}

const footerStyle: CSSProperties = {
  paddingTop: 0,
  height: '200px',
  backgroundColor: '#333',
  position: 'relative',
}

const collapsed = ref(false)

const windowWidth = ref(window.innerWidth)

const handleResize = () => {
  windowWidth.value = window.innerWidth
  collapsed.value = window.innerWidth < 800
}

const loadSettingsFromLocalStorage = (): Settings | null => {
  const savedSettings = localStorage.getItem('settings')
  if (savedSettings) {
    return JSON.parse(savedSettings)
  }
  return null
}

const savedSettings = loadSettingsFromLocalStorage()

const settingsDefault: Settings = {
  groupName: 'AI工作群',
  myName: '我',
  saveMessage: true,
  showNickname: true,
  lang: Lang.Hant,
  avatar: getImageUrl('me.png')
}
console.log('settingsDefault', settingsDefault)

const settings: Settings = reactive({
  groupName: savedSettings?.groupName || settingsDefault.groupName,
  myName: savedSettings?.myName || settingsDefault.myName,
  saveMessage: savedSettings?.saveMessage ?? settingsDefault.saveMessage,
  showNickname: savedSettings?.showNickname ?? settingsDefault.showNickname,
  lang: savedSettings?.lang || settingsDefault.lang,
  avatar: savedSettings?.avatar || settingsDefault.avatar
})

watch(
    () => settings,
    (newSettings) => {
      localStorage.setItem('settings', JSON.stringify(newSettings))
    },
    {deep: true}
)

const user: { [key: string]: User } = reactive({
  deepseek: <User>{
    id: 'deepseek',
    name: 'DeepSeek',
    avatar: 'deepseek.png',
    link: 'https://chat.deepseek.com/',
    desc: 'Chat with DeepSeek AI – your intelligent assistant for coding, content creation, file reading, and more. Upload documents, engage in long-context conversations, and get expert help in AI, natural language processing, and beyond. | 深度求索（DeepSeek）助力编程代码开发、创意写作、文件处理等任务，支持文件上传及长文本对话，随时为您提供高效的AI支持。',
    online: false,
    me: false,
  },
  doubao: <User>{
    id: 'doubao',
    name: '豆包',
    avatar: 'doubao.png',
    link: 'https://www.doubao.com/chat/',
    desc: '豆包是你的 AI 聊天智能对话问答助手，写作文案翻译编程全能工具。豆包为你答疑解惑，提供灵感，辅助创作，也可以和你畅聊任何你感兴趣的话题。',
    online: false,
    me: false,
  },
  kimi: <User>{
    id: 'kimi',
    name: 'Kimi',
    avatar: 'kimi.png',
    link: 'https://kimi.moonshot.cn/chat/',
    desc: 'Kimi是一款学生和职场人的新质生产力工具。帮你解读论文，写代码查BUG，策划方案，创作小说，多语言翻译。有问题问Kimi，一键解决你的所有难题',
    online: false,
    me: false,
  },
  zhida: <User>{
    id: 'zhida',
    name: '知乎直達',
    avatar: 'zhida.png',
    link: 'https://zhida.zhihu.com/',
    desc: '知乎直答（zhida.ai）是知乎推出的一款使用 AI 大模型等先进技术的产品，以知乎社区的优质内容为核心，多种数据源为辅助，为人们提供一种全新的获取可靠信息的途径。知乎直答是多智能体系统，能够满足用户多维度的需求；同时对生成结果进行溯源，以确保内容的可信、可控以及对知识产权和版权的尊重。知乎直答致力于为用户提供卓越的使用体验，用技术拉近创作者和用户之间的距离。有问题，就会有答案。',
    online: false,
    me: false,
  },
  tongyi: <User>{
    id: 'tongyi',
    name: '通义',
    avatar: 'tongyi.png',
    link: 'https://www.tongyi.com/qianwen/',
    desc: '通义是一个通情、达义的国产AI模型，可以帮你解答问题、文档阅读、联网搜索并写作总结，最多支持1000万字的文档速读。通义_你的全能AI助手',
    online: false,
    me: false,
  },
  hunyuan: <User>{
    id: 'hunyuan',
    name: '騰訊混元',
    avatar: 'hunyuan.png',
    link: 'https://llm.hunyuan.tencent.com/#/chat',
    desc: '腾讯混元大模型是由腾讯研发的大语言模型，具备跨领域知识和自然语言理解能力，实现基于人机自然语言对话的方式，理解用户指令并执行任务，帮助用户实现人获取信息，知识和灵感。',
    online: false,
    me: false,
  },
  zhipu: <User>{
    id: 'zhipu',
    name: '智普',
    avatar: 'zhipu.png',
    link: 'https://chat.z.ai/',
    desc: 'Z Chat is an advanced AI assistant developed by Z.ai. Built on open-source GLM models, it supports text generation, reasoning, and deep research - making it a powerful and free AI chatbot tailored for both English and Chinese users.',
    online: false,
    me: false,
  },
  mita: <User>{
    id: 'mita',
    name: '秘塔AI搜索',
    avatar: 'mita.png',
    link: 'https://metaso.cn/',
    desc: '秘塔AI搜索，没有广告，直达结果',
    online: false,
    me: false,
  },
  zhipuqingyan: <User>{
    id: 'zhipuqingyan',
    name: '智譜清言',
    avatar: 'zhipuqingyan.png',
    link: 'https://chatglm.cn/main/alltoolsdetail?lang=zh',
    desc: '中国版对话语言模型，与GLM大模型进行对话。',
    online: false,
    me: false,
  },
  yiyan: <User>{
    id: 'yiyan',
    name: '文心一言',
    avatar: 'yiyan.png',
    link: 'https://yiyan.baidu.com/',
    desc: '文心一言既是你的智能伙伴，可以陪你聊天、回答问题、画图识图；也是你的AI助手，可以提供灵感、撰写文案、阅读文档、智能翻译，帮你高效完成工作和学习任务。',
    online: false,
    me: false,
  },
  me: <User>{
    id: 'me',
    name: computed(() => settings.myName),
    avatar: computed(() => settings.avatar || ''),
    link: 'https://github.com/lizongying/ai0/',
    desc: '什麼都沒有說',
    online: true,
    me: true,
  },
})

const users: User[] = reactive([
  user.deepseek,
  user.doubao,
  user.kimi,
  user.zhida,
  user.tongyi,
  user.hunyuan,
  user.zhipu,
  user.mita,
  user.zhipuqingyan,
  user.me,
])

interface Data {
  from: string
  to: string
  data: string
}

let dbManager: DatabaseManager | null = null

const pageSize = 10
let offset = 0

onMounted(async () => {
  dbManager = new DatabaseManager()
  await dbManager.initialize()

  if (window.electronAPI) {
    window.electronAPI.onMessage('chat', async (data: Data) => {
      console.log('Received data:', data)
      await addMessage(data.data, user[data.from])
    })

    window.electronAPI.onMessage('status', async (data: Data) => {
      console.log('user status:', data)
      if (user[data.from]) {
        user[data.from].online = true
      }
    })
  }

  window.addEventListener('resize', handleResize)

  let rs = await dbManager.findMessages(pageSize, offset)
  console.log('rs', rs)
  if (rs) {
    for (const i of rs.reverse()) {
      const u = user[i.userId]
      if (u) {
        currentMessage = {
          user: u,
          title: i.title,
          content: i.content,
          createTime: i.createTime,
          finished: true,
          render: 0,
        }
        messages.push(currentMessage)
      }
    }
  }

  setTimeout(async () => {
    await scrollToBottom()
  }, 1000)

  // window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  // window.removeEventListener('keydown', handleKeydown)
})

// const handleKeydown = (e: KeyboardEvent) => {
//   if (inputFocus.value && e.code === 'Enter'
//       && !content.value.endsWith('@')
//       && !content.value.endsWith('@deepseek ')
//       && !content.value.endsWith('@doubao ')
//       && !content.value.endsWith('@kimi ')
//       && !content.value.endsWith('@zhida ')
//       && !content.value.endsWith('@tongyi ')
//       && !content.value.endsWith('@hunyuan ')
//       && !content.value.endsWith('@zhipu ')
//       && !content.value.endsWith('@mita ')
//       && !content.value.endsWith('@zhipuqingyan ')
//   ) {
//     e.preventDefault()
//     sendMessage()
//   }
// }

const messages = reactive<Message[]>([])

let currentMessage: Message | null = null

const addMessage = async (content: string, user: User) => {
  if (user.id === 'me') {
    currentMessage = {
      user: user,
      content: content,
      createTime: getTimestamp(),
      finished: true,
      render: 0,
    }
    messages.push(currentMessage)
    if (settings.saveMessage) {
      try {
        const messageId = await dbManager?.addMessage({
          userId: currentMessage.user.id,
          title: currentMessage.title,
          content: currentMessage.content,
          createTime: currentMessage.createTime,
        })
        console.log('Added message with ID:', messageId)
      } catch (error) {
        console.error('Failed to add message:', error)
      }
    }
  } else if (user.id === 'kimi') {
    if (!content.startsWith('data: ')) {
      return
    }
    try {
      for (const i of content.split('\n')) {
        if (!i.trim()) {
          continue
        }
        const d = JSON.parse(i.slice(6))
        console.log('d?.event', d?.event)
        if (d?.event === 'resp') {
          currentMessage = {
            user: user,
            content: '',
            createTime: getTimestamp(),
            finished: false,
            render: 0,
          }
          messages.push(currentMessage)
        }
        if (d?.event === 'all_done' && currentMessage) {
          currentMessage.finished = true
          messages.push({} as any)
          messages.pop()
          const messageId = await dbManager?.addMessage({
            userId: currentMessage.user.id,
            title: currentMessage.title,
            content: currentMessage.content,
            createTime: currentMessage.createTime,
          })
          console.log('Added message with ID:', messageId)
        }
        if (d?.event === 'cmpl') {
          if (d?.text && currentMessage) {
            currentMessage.content += d?.text
            messages.push({} as any)
            messages.pop()
          }
        }
      }
    } catch {
    }
  } else if (user.id === 'doubao') {
    if (!content.startsWith('data: ')) {
      return
    }
    try {
      const d = JSON.parse(content.slice(6))
      if (d?.event_id === '0') {
        currentMessage = {
          user: user,
          content: '',
          createTime: getTimestamp(),
          finished: false,
          render: 0,
        }
        messages.push(currentMessage)
      }
      if (d?.event_type === 2001) {
        const event_data = JSON.parse(d?.event_data)
        if (event_data?.message?.content_type === 2001) {
          const text = JSON.parse(event_data?.message?.content)
          console.log(1111, text?.text, event_data?.is_finish)

          if (text?.text && currentMessage) {
            currentMessage.content += text?.text
            messages.push({} as any)
            messages.pop()
          }

          if (event_data?.is_finish && currentMessage) {
            currentMessage.finished = true
            messages.push({} as any)
            messages.pop()
            const messageId = await dbManager?.addMessage({
              userId: currentMessage.user.id,
              title: currentMessage.title,
              content: currentMessage.content,
              createTime: currentMessage.createTime,
            })
            console.log('Added message with ID:', messageId)
          }
        }
      }
    } catch {
    }
  } else {
    const rs = parseText(content)

    for (const r of rs) {
      // console.log('r', r)

      if (r.event === 'ready') {
        currentMessage = {
          user: user,
          content: '',
          createTime: getTimestamp(),
          finished: false,
          render: 0,
        }
        messages.push(currentMessage)
      } else if (r.event === 'finish') {
        if (currentMessage) {
          currentMessage.finished = true
          messages.push({} as any)
          messages.pop()
        }
      } else if (r.event === 'update_session') {
        if (r.data && 'updated_at' in r.data && r.data.updated_at) {
          if (currentMessage) {
            currentMessage.updateTime = Math.ceil(r.data.updated_at)
          }
        }
      } else if (r.event === 'title') {
        if (r.data && 'content' in r.data) {
          if (currentMessage) {
            currentMessage.title = r.data.content
            console.log('title', currentMessage.title)
            messages.push({} as any)
            messages.pop()
          }
        }
      } else if (r.event === 'close') {
        if (settings.saveMessage && currentMessage) {
          try {
            const messageId = await dbManager?.addMessage({
              userId: currentMessage.user.id,
              title: currentMessage.title,
              content: currentMessage.content,
              createTime: currentMessage.createTime,
            })
            console.log('Added message with ID:', messageId)
          } catch (error) {
            console.error('Failed to add message:', error)
          }
        }
      } else if (!r.event && (r.data && 'p' in r.data)) {
        if (r.data.p === 'response/content') {
          if (currentMessage) {
            currentMessage.content += r.data?.v
            messages.push({} as any)
            messages.pop()
            // console.log('messages', messages)
          }
        } else {
          if (Array.isArray(r.data?.v)) {
            r.data?.v.forEach(i => {
              if (i.v === 'TIMEOUT' && currentMessage) {
                currentMessage.content = '服务器繁忙，请稍后再试。'
                messages.push({} as any)
                messages.pop()
              }
            })
          }
        }
      } else {
        if (r.data?.v && typeof r.data?.v === 'string') {
          if (currentMessage) {
            currentMessage.content += r.data?.v
            messages.push({} as any)
            messages.pop()
            // console.log('messages', messages)
          }
        }
      }
    }

  }
  await scrollToBottom()
}

const options = computed(() =>
    users.filter(i => i !== user.me).map(d => {
      return {
        value: d.id,
        label: d.name,
      }
    }).concat({
      value: 'all',
      label: t.value.allMembers,
    })
)

const selected = reactive<{ value: string }>({value: ''})

const onSelect = (option: { value: string }) => {
  selected.value = option.value
}

const content = ref('')

const scrollContainer = ref<HTMLDivElement | null>(null)

const regex = /@\w+/g
const extractMentions = (text: string) => {
  const mentions = text.match(regex)
  return mentions || []
}

const sendMessage = async () => {
  const text = content.value.trim()
  if (!text) {
    return
  }
  if (window.electronAPI) {
    const mentions = extractMentions(text)
    mentions.forEach(i => {
      console.log('mentions', i.slice(1))
      window.electronAPI.sendMessage('chat', {from: 'me', to: i.slice(1), content: text})
    })
  }

  await addMessage(text, user.me)
  content.value = selected.value ? `@${selected.value} ` : ''
}

const scrollToBottom = async () => {
  await nextTick(() => {
    setTimeout(() => {
      const parentElement = scrollContainer.value?.parentElement
      if (parentElement) {
        parentElement.scrollTop = parentElement.scrollHeight
      }
    }, 0)
  })
}

const inputRef = ref<Mentions | null>(null)

const focusInput = () => {
  if (inputRef.value) {
    (inputRef.value as Mentions)?.focus()
  }
}

const newChatStyle = computed(() => {
  return {
    width: '100%',
    textAlign: !collapsed ? 'left' : 'center'
  }
})

const loading = ref<boolean>(false)
const imageUrl = ref<string>(settings.avatar || '')

const beforeUpload = (file: File) => {
  const url = URL.createObjectURL(file)
  loading.value = true
  imageUrl.value = url

  const reader = new FileReader()
  reader.addEventListener('load', () => {
    settings.avatar = reader.result as string
  })
  reader.readAsDataURL(file)

  user.me.avatar = url
  loading.value = false
  return false
}

const reset = async () => {
  await dbManager?.clearMessage()

  settings.groupName = settingsDefault.groupName
  settings.myName = settingsDefault.myName
  settings.saveMessage = settingsDefault.saveMessage
  settings.showNickname = settingsDefault.showNickname
  settings.lang = settingsDefault.lang
  settings.avatar = settingsDefault.avatar

  if (settings.avatar) {
    imageUrl.value = settings.avatar
  }

  message.success(t.value.resetFinished)
}

const openWindow = async (id: string) => {
  window.electronAPI?.sendMessage('open', {from: 'me', to: id})
}

const newChat = async (id: string) => {
  content.value = `@${id} `
  focusInput()
}

const inputFocus = ref(true)
const inputFocusChange = (focus: boolean) => {
  inputFocus.value = focus
}

</script>

<template>
  <a-config-provider
      :theme="{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#00b96b',
          },
          components: {
            Radio: {
              colorPrimary: '#00b96b',
            },
          },
    }"
  >
    <a-layout>
      <a-layout-sider :style="siderStyle" :width="!collapsed ? 300 : 120">
        <a-affix :offset-top="0">
          <a-space direction="vertical" size="large" style="width: calc(100% - 50px); margin: 10px 20px;">
            <a-button :icon="h(PlusOutlined)" @click="focusInput()" :shape="!collapsed ? 'default' : 'default'"
                      size="large" :style="newChatStyle">
              {{ !collapsed ? t.newChat : '' }}
            </a-button>
          </a-space>
        </a-affix>
        <div style="height: calc(100% - 74px); overflow-x: scroll;">
          <a-list item-layout="horizontal" :data-source="users">
            <template #renderItem="{ item}">
              <a-list-item>
                <a-list-item-meta
                >
                  <template #title v-if="!collapsed">
                    <a-flex gap="middle" align="start" vertical>
                      <!--                      <a :href="item.link" target="_blank">{{ item.name }}</a>-->
                      <a @click="newChat(item.id)">{{ item.name }}</a>
                    </a-flex>
                  </template>

                  <template #description v-if="!collapsed">
                    <a-flex gap="middle" align="start" vertical>
                      <a-typography>
                        <a-typography-paragraph :ellipsis="{ rows: 2, expandable: false, symbol: 'more' }"
                                                style="margin-bottom: 0;"
                                                :content="item.desc">
                        </a-typography-paragraph>
                      </a-typography>
                    </a-flex>
                  </template>

                  <template #avatar>
                    <a-badge :dot="true" :color="item.online ? 'green' : 'red'">
                      <!--                      <template #count>-->
                      <!--                        <ClockCircleOutlined style="color: #f5222d"/>-->
                      <!--                      </template>-->
                      <a-tooltip>
                        <template #title>{{ item.name }}</template>
                        <a-avatar :src="getImageUrl(item.avatar)" shape="square" :size="64"
                                  @click="openWindow(item.id)">
                          <template #icon>
                            <UserOutlined/>
                          </template>
                        </a-avatar>
                      </a-tooltip>
                    </a-badge>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </a-layout-sider>

      <a-layout>
        <a-layout-header :style="headerStyle">
          <a-flex gap="middle" justify="space-between" align="center">
            <a-flex justify="center" align="flex-end">
              <a-typography>
                <a-typography-title :level="4">{{ settings.groupName }}</a-typography-title>
              </a-typography>
            </a-flex>
            <a-flex justify="flex-end" align="center">
              <EllipsisOutlined @click="showDrawer" style="font-size: 64px;"/>
            </a-flex>
          </a-flex>

        </a-layout-header>
        <a-layout-content :style="contentStyle">
          <div ref="scrollContainer" class="scrollContainer">
            <Chat :messages="messages" :settings="settings"></Chat>
          </div>
        </a-layout-content>
        <a-layout-footer :style="footerStyle">
          <a-divider/>
          <div style="position: relative; display: flex;">
            <a-mentions
                ref="inputRef"
                autofocus
                v-model:value="content"
                rows="4"
                :placeholder="t.mention"
                :options="options"
                @blur="inputFocusChange(false)"
                @focus="inputFocusChange(true)"
                @select="onSelect"
            ></a-mentions>
            <a-flex justify="flex-end" align="flex-end" class="send">
              <a-space size="small">
                <a-tooltip :title="t.image">
                  <a-button shape="circle">
                    <template #icon>
                      <TranslationOutlined/>
                    </template>
                  </a-button>
                </a-tooltip>
                <a-tooltip :title="t.image">
                  <a-button shape="circle">
                    <template #icon>
                      <FileImageOutlined/>
                    </template>
                  </a-button>
                </a-tooltip>
                <a-tooltip :title="t.file">
                  <a-button shape="circle">
                    <template #icon>
                      <FileAddOutlined/>
                    </template>
                  </a-button>
                </a-tooltip>
                <a-tooltip :title="t.send">
                  <a-button type="primary" shape="circle" :icon="h(SendOutlined)" @click="sendMessage"/>
                </a-tooltip>
              </a-space>
            </a-flex>
          </div>
        </a-layout-footer>
      </a-layout>
    </a-layout>

    <a-drawer
        v-model:open="open"
        class="custom-class"
        root-class-name="root-class-name"
        :root-style="{ color: 'blue' }"
        style="color: red"
        :title="settings.groupName"
        placement="right"
    >
      <a-flex wrap="wrap" gap="large">
        <a-tooltip v-for="item in users" :key="item">
          <template #title>{{ item.name }}</template>
          <a-avatar shape="square" :size="64" @click="openWindow(item.id)"
                    :src="getImageUrl(item.avatar)">
            <template #icon>
              <UserOutlined/>
            </template>
          </a-avatar>
        </a-tooltip>
      </a-flex>

      <a-divider/>

      <a-form
          name="basic"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
          autocomplete="off"
      >
        <a-flex gap="middle" vertical>
          <a-typography>
            <a-typography-paragraph strong>{{ t.notice }}</a-typography-paragraph>
            <template v-for="(line, index) in lines">
              <li v-if="index < lineMax">
                <a-typography-paragraph :key="index" :content="line"/>
              </li>
              <li v-if="!ellipsis && index >= lineMax">
                <a-typography-paragraph :key="index" :content="line"/>
              </li>
            </template>
            <a-typography-link :v-if="ellipsis && lines.length >= lineMax" @click="ellipsis=!ellipsis">
              {{ ellipsis ? t.more : t.short }}
            </a-typography-link>
            <a-typography-paragraph/>
          </a-typography>
          <a-typography>
            <a-typography-paragraph strong>{{ t.groupName }}</a-typography-paragraph>
            <a-typography-paragraph v-model:content="settings.groupName" editable/>
          </a-typography>
          <a-typography>
            <a-typography-paragraph strong>{{ t.myName }}</a-typography-paragraph>
            <a-typography-paragraph v-model:content="settings.myName" editable/>
          </a-typography>

          <a-form-item :label="t.searchMessage">
            <RightOutlined @click="" style="width: 100%"/>
          </a-form-item>

          <a-form-item :label="t.saveMessage">
            <a-switch v-model:checked="settings.saveMessage"/>
          </a-form-item>

          <a-form-item :label="t.showNickname">
            <a-switch v-model:checked="settings.showNickname"/>
          </a-form-item>

          <a-form-item :label="t.avatar">
            <a-upload
                name="avatar"
                list-type="picture-card"
                class="avatar-uploader"
                :show-upload-list="false"
                :before-upload="beforeUpload"
            >
              <a-avatar v-if="imageUrl" :src="imageUrl" shape="square" :size="64">
                <template #icon>
                  <UserOutlined/>
                </template>
              </a-avatar>
              <div v-else>
                <loading-outlined v-if="loading"></loading-outlined>
                <plus-outlined v-else></plus-outlined>
                <div>{{ t.upload }}</div>
              </div>
            </a-upload>
          </a-form-item>

          <a-form-item :label="t.language">
            <a-radio-group v-model:value="settings.lang" button-style="solid">
              <a-radio-button v-for="lang in Lang" :key="lang" :value="lang">
                {{ lang }}
              </a-radio-button>
            </a-radio-group>
          </a-form-item>

          <a-form-item :label="t.reset">
            <a-button type="primary" @click="reset">{{ t.reset }}
            </a-button>
          </a-form-item>
        </a-flex>
      </a-form>
    </a-drawer>
  </a-config-provider>
</template>

<style scoped>

.ant-layout.ant-layout-has-sider {
  height: 100%;
}

.anticon-ellipsis > svg {
  font-size: 5em;
  width: 5em;
  height: 5em;
}

h4.ant-typography {
  margin-top: 0;
  margin-bottom: 0;
}

a {
  color: white;
}

.send {
  position: absolute;
  width: 100%;
  right: 10px;
  bottom: 10px;
  display: flex;
  justify-content: end;
}
</style>
