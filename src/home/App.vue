<script setup lang="ts">
import {
  EllipsisOutlined,
  FileAddOutlined,
  LoadingOutlined,
  PlusOutlined,
  RightOutlined,
  SendOutlined,
  TranslationOutlined,
  UserOutlined
} from '@ant-design/icons-vue'
import {Mentions, message, theme, type UploadProps} from 'ant-design-vue'

import {v4 as uuidv4} from 'uuid';


import {
  computed,
  type CSSProperties,
  h,
  nextTick,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch
} from 'vue'
import Chat from './components/Chat.vue'
import {getImageUrl, getTimestamp, parseText} from './utils.ts'
import {Lang, translations} from '../i18n'
import {DatabaseManager} from './db.ts'

import {ASSISTANTS, USER} from '../constants'

const [messageApi, contextHolder] = message.useMessage()

const {DEEPSEEK, DOUBAO, KIMI, TONGYI, HUNYUAN, ZHIPU, MITA, QINGYAN, SHUSHENG} = ASSISTANTS

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

const groupNotify = ref(`親愛的群成員們：
大家好！幾位重量級AI已經加入了本群，等待你的指令：
1️⃣ 如何使用
你可以在本群安排AI為你工作，你可以@某人，或@全體。
2️⃣ 注意事項
▫️ 不支持多開。請只開啟一次本軟件，若存在已經開啟的本軟件，請關閉後再重新啟動。
▫️ 如果沒有輸出，請點擊頭像打開官網窗口進行檢查，有時AI會要求驗證碼或者登陸。建議登錄後使用。
3️⃣ 問題反饋
如有相關問題或功能建議，請訪問 https://github.com/lizongying/ai0/`)

const lines = computed(() => groupNotify.value.split('\n'))
const lineMax = 5

let oldestId = Number.MAX_SAFE_INTEGER
let latestId = 0

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

const user: { [key: string]: User } = reactive({})

Object.values(ASSISTANTS).filter(v => v.enable).forEach((assistant) => {
  user[assistant.id] = <User>{
    ...assistant,
    online: false,
    me: false,
  }
})

user[USER] = <User>{
  id: USER,
  name: computed(() => settings.myName),
  avatar: computed(() => settings.avatar || ''),
  link: 'https://github.com/lizongying/ai0/',
  desc: '什麼都沒有說',
  online: true,
  me: true,
}

const users: User[] = reactive(Object.values(ASSISTANTS).filter(v => v.enable).map(v => user[v.id]).concat([user.me]))

let dbManager: DatabaseManager | null = null

const pageSize = 100
let offset = 0

let isComposing = false

const {getMentions} = Mentions

onBeforeMount(async () => {
  window.electronAPI?.onMessage('status', async (data: MessageStatus) => {
    console.log('status data:', data)
    if (user[data.from]) {
      user[data.from].online = true
    }
  })
})

onMounted(async () => {
  dbManager = new DatabaseManager()
  await dbManager.initialize()

  if (window.electronAPI) {
    window.electronAPI.onMessage('chat', async (data: MessageChat) => {
      // console.log('chat data:', data)
      await addMessage(data.data, user[data.from])
    })
  }

  if (window.electronAPI) {
    window.electronAPI.sendMessage('status', {from: USER, status: 'ready'})
  }

  window.addEventListener('resize', handleResize)
  document.querySelector('textarea')?.addEventListener('keydown', handleKeydown)

  let rs = await dbManager.findMessages(pageSize, offset)
  if (rs) {
    for (const i of rs.reverse()) {
      const u = user[i.userId]
      if (u) {
        const currentMessage: Message = {
          id: i.id,
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

    if (messages && messages.length) {
      oldestId = messages[0].id || Number.MAX_SAFE_INTEGER
      latestId = messages[messages.length - 1].id || 0
    }
  }

  setTimeout(async () => {
    await scrollToBottom()
  }, 1000)

})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  document.querySelector('textarea')?.removeEventListener('keydown', handleKeydown)
})

const handleKeydown = (e: KeyboardEvent) => {
  if (inputFocus.value && e.code === 'Enter'
      && !content.value.endsWith(`@${selected.value} `)
      && !isComposing
      && !e.isComposing
  ) {
    sendMessage()
  }
}

const messages = reactive<Message[]>([])

const messagesMap = new Map<string, Message>()

const saveMessage = async (currentMessage: Message): Promise<number> => {
  let messageId = Date.now()
  if (settings.saveMessage) {
    try {
      messageId = await dbManager?.addMessage({
        userId: currentMessage.user.id,
        title: currentMessage.title,
        content: currentMessage.content,
        createTime: currentMessage.createTime,
      }) || 0
      console.log('Added message with ID:', messageId)
    } catch (error) {
      console.error('Failed to add message:', error)
    }
  }
  currentMessage.id = messageId
  return messageId
}

const newMessage = (user: User) => {
  const currentMessage: Message = {
    user: user,
    content: '',
    createTime: getTimestamp(),
    finished: false,
    render: 0,
    thinking: '',
  }
  messagesMap.set(user.id, currentMessage)
  messages.push(currentMessage)
  if (messages.length > pageSize) {
    messages.shift()
  }
}

const finishedMessage = async (currentMessage: Message | undefined): Promise<void> => {
  if (currentMessage && !currentMessage.finished) {
    currentMessage.finished = true
    currentMessage.id = await saveMessage(currentMessage)
    messages.push({} as any)
    messages.pop()

    latestId = currentMessage.id
  }
}

const addMessage = async (content: string, user: User) => {
  if (user.id === USER) {
    newMessage(user)
    const currentMessage = messagesMap.get(user.id)
    if (currentMessage) {
      currentMessage.content = content
      await finishedMessage(currentMessage)
    }
  } else if (user.id === SHUSHENG.id) {
    if (content === '[NEW]') {
      newMessage(user)
      return
    }

    if (content === '[DONE]') {
      const currentMessage = messagesMap.get(user.id)
      await finishedMessage(currentMessage)
      return
    }

    let t = content.trim().split('\n\n')
    try {
      for (const i of t) {
        if (!i.trim()) {
          continue
        }
        if (!i.startsWith('data: ')) {
          continue
        }
        const d = JSON.parse(i.slice(6)).data
        // console.log('d', d)

        const currentMessage = messagesMap.get(user.id)

        if (d?.response && currentMessage) {
          currentMessage.content = d?.response
          messages.push({} as any)
          messages.pop()
        }
      }
    } catch(e) {
      console.error(e)
    }
  } else if (user.id === MITA.id) {
    if (content === '[NEW]') {
      newMessage(user)
      return
    }

    if (content === '[DONE]') {
      const currentMessage = messagesMap.get(user.id)
      await finishedMessage(currentMessage)
      return
    }

    let t = content.trim().split('\n\n')
    try {
      for (const i of t) {
        if (!i.trim()) {
          continue
        }
        const d = JSON.parse(i)
        // console.log('d', d)

        const currentMessage = messagesMap.get(user.id)

        if (d?.text && currentMessage) {
          currentMessage.content += d?.text
          messages.push({} as any)
          messages.pop()
        }
      }
    } catch {
    }
  } else if (user.id === QINGYAN.id) {
    if (content === '[NEW]') {
      newMessage(user)
      return
    }

    let t = content.trim().split('\n\n')
    try {
      for (const i of t) {
        if (!i.trim()) {
          continue
        }
        if (!i.startsWith('data: ')) {
          continue
        }
        const d = JSON.parse(i.slice(6))
        // console.log('d', d)

        const currentMessage = messagesMap.get(user.id)

        const arr = d?.parts
        if (Array.isArray(arr) && arr.length > 0) {
          if (arr[0].status === 'finish') {
            await finishedMessage(currentMessage)
          }

          const ca = arr[0]?.content
          if (Array.isArray(ca) && ca.length > 0) {
            const c = ca[0]?.text
            if (c && currentMessage) {
              currentMessage.content += c
              messages.push({} as any)
              messages.pop()
            }
          }
        }
      }
    } catch {
    }
  } else if (user.id === ZHIPU.id) {
    if (content === '[NEW]') {
      newMessage(user)
      return
    }

    let t = content.trim().split('\n\n')
    try {
      for (const i of t) {
        if (!i.trim()) {
          continue
        }
        if (!i.startsWith('data: ')) {
          continue
        }
        const d = JSON.parse(i.slice(6))

        const currentMessage = messagesMap.get(user.id)

        if (d?.data?.data?.done === true) {
          await finishedMessage(currentMessage)
        }

        const c = d?.data?.data?.content
        if (c && currentMessage) {
          if (c.startsWith('<details')) {
            let index = c.indexOf('</details>')
            if (index > -1) {
              const regex = /<summary>([^<]+?)<\/summary>/m
              const result = c.slice(0, index).match(regex)
              if (result) {
                const thinking = c.slice(result.index + result[0].length, index).split('\n').map((s: string) => s.replace(/^>\s/, '')).join('\n').trim()
                if (thinking && currentMessage && thinking != currentMessage.thinking) {
                  currentMessage.thinkingStatus = 1
                  currentMessage.thinking = thinking
                  messages.push({} as any)
                  messages.pop()
                }
              }

              const c0 = c.slice(index + 10)
              if (c0.length > 0) {
                currentMessage.thinkingStatus = 2
                currentMessage.content = c.slice(index + 10)
              }
            } else {
              currentMessage.content = ''
            }
          } else {
            currentMessage.thinkingStatus = 2
            currentMessage.content = c
          }

          messages.push({} as any)
          messages.pop()
        }
      }
    } catch {
    }
  } else if (user.id === HUNYUAN.id) {
    let t = content.trim().split('\n\n')
    try {
      for (const i of t) {
        if (!i.trim()) {
          continue
        }
        if (i === '[NEW]') {
          newMessage(user)
          continue
        }
        if (!i.startsWith('data: ')) {
          continue
        }
        const d = JSON.parse(i.slice(6))
        const currentMessage = messagesMap.get(user.id)
        if (d?.model_response?.type === 1 && currentMessage) {
          currentMessage.thinkingStatus = 1
          messages.push({} as any)
          messages.pop()
          continue
        }

        if (d?.model_response?.type === 3 && currentMessage) {
          currentMessage.thinkingStatus = 2
          messages.push({} as any)
          messages.pop()
          continue
        }

        const arr = d?.choices
        if (Array.isArray(arr) && arr.length > 0) {
          if (arr[0].finish_reason === 'stop') {
            await finishedMessage(currentMessage)
          }
          const thinking = arr[0]?.delta?.reasoning_content
          if (thinking && currentMessage) {
            currentMessage.thinking += thinking
            messages.push({} as any)
            messages.pop()
          }
          const c = arr[0]?.delta?.content
          if (c && currentMessage) {
            currentMessage.content += c
            messages.push({} as any)
            messages.pop()
          }
        }
      }
    } catch {
    }
  } else if (user.id === TONGYI.id) {
    if (!content.startsWith('data: ')) {
      return
    }
    try {
      for (const i of content.split('\n')) {
        if (!i.trim()) {
          continue
        }
        const d = JSON.parse(i.slice(6))
        if (d?.pkgId === 0) {
          newMessage(user)
        }
        const currentMessage = messagesMap.get(user.id)

        if (d?.chat_prompt && currentMessage) {
          if (!currentMessage.suggest) {
            currentMessage.suggest = []
          }
          currentMessage.suggest.push(d?.chat_prompt)
          console.log('suggest', currentMessage.suggest)
          messages.push({} as any)
          messages.pop()
          continue
        }

        if (d?.stopReason === 'stop') {
          await finishedMessage(currentMessage)
        }
        const contents = d?.contents
        if (Array.isArray(contents) && contents.length > 0) {
          for (const ii of contents) {
            if (ii?.content && ii?.contentType === 'think' && ii?.status === 'finished' && currentMessage) {
              currentMessage.thinkingStatus = 2
              messages.push({} as any)
              messages.pop()
              continue
            }

            if (ii?.content && ii?.contentType === 'think' && currentMessage) {
              currentMessage.thinkingStatus = 1
              currentMessage.thinking += JSON.parse(ii?.content).content
              messages.push({} as any)
              messages.pop()
              continue
            }

            if (ii?.content && ii?.contentType === 'text' && currentMessage) {
              if (ii?.incremental == true) {
                if (ii?.status !== 'finished') {
                  currentMessage.content += ii?.content
                  messages.push({} as any)
                  messages.pop()
                }
              } else {
                currentMessage.content = ii?.content
                messages.push({} as any)
                messages.pop()
              }
            }
          }
        }
      }
    } catch {
    }
  } else if (user.id === KIMI.id) {
    try {
      for (const i of content.split('\n')) {
        if (!i.trim()) {
          continue
        }
        const currentMessage = messagesMap.get(user.id)
        if (i.trim() === '[DONE]') {
          await finishedMessage(currentMessage)
          continue
        }
        if (!i.startsWith('data: ')) {
          continue
        }
        const d = JSON.parse(i.slice(6))
        if (d?.event === 'resp') {
          newMessage(user)
        }

        if (d?.event === 'chat_prompt') {
          if (d?.text && currentMessage) {
            if (!currentMessage.suggest) {
              currentMessage.suggest = []
            }
            currentMessage.suggest.push(d?.text)
            messages.push({} as any)
            messages.pop()
          }
        }

        if (d?.event === 'k1') {
          if (d?.text && currentMessage) {
            currentMessage.thinkingStatus = 1
            currentMessage.thinking += d?.text
            messages.push({} as any)
            messages.pop()
          }
          continue
        }
        if (d?.event === 'cmpl') {
          if (d?.text && currentMessage) {
            currentMessage.thinkingStatus = 2
            currentMessage.content += d?.text
            messages.push({} as any)
            messages.pop()
          }
        }
      }
    } catch {
    }
  } else if (user.id === DOUBAO.id) {
    try {
      for (const i of content.split('\n')) {
        if (!i.trim()) {
          continue
        }
        const currentMessage = messagesMap.get(user.id)
        if (i.trim() === '[DONE]') {
          await finishedMessage(currentMessage)
          continue
        }
        if (!i.startsWith('data: ')) {
          continue
        }
        const d = JSON.parse(i.slice(6))
        if (d?.event_id === '0') {
          newMessage(user)
        }
        if (d?.event_type === 2001) {
          const event_data = JSON.parse(d?.event_data)
          const text = JSON.parse(event_data?.message?.content)
          console.log('content', text)

          if (text?.think && currentMessage) {
            currentMessage.thinkingStatus = 1
            currentMessage.thinking += text?.think
            messages.push({} as any)
            messages.pop()
            continue
          }

          if ('type' in text) {
            continue
          }

          if (text?.suggest && currentMessage) {
            if (!currentMessage.suggest) {
              currentMessage.suggest = []
            }
            currentMessage.suggest.push(text?.suggest)
            messages.push({} as any)
            messages.pop()
          }

          if (text?.text && currentMessage) {
            currentMessage.thinkingStatus = 2
            currentMessage.content += text?.text
            messages.push({} as any)
            messages.pop()
          }
        }
      }
    } catch {
    }
  } else if (user.id === DEEPSEEK.id) {
    const rs = parseText(content)
    for (const r of rs) {
      const currentMessage = messagesMap.get(user.id)
      if (r.event === 'ready') {
        newMessage(user)
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
            messages.push({} as any)
            messages.pop()
          }
        }
      } else if (r.event === 'close') {
        await finishedMessage(currentMessage)
      } else if (!r.event && (r.data && 'p' in r.data)) {
        if (r.data.p === 'response/content') {
          if (currentMessage) {
            currentMessage.thinkingStatus = 2
            currentMessage.content += r.data?.v
            messages.push({} as any)
            messages.pop()
          }
        }
        if (r.data.p === 'response/thinking_content') {
          if (currentMessage) {
            if (!currentMessage.thinking) {
              currentMessage.thinking = ''
            }
            currentMessage.thinkingStatus = 1
            currentMessage.thinking += r.data?.v
            messages.push({} as any)
            messages.pop()
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
            if (currentMessage.thinkingStatus === 2) {
              currentMessage.content += r.data?.v
            } else {
              currentMessage.thinking += r.data?.v
            }
            messages.push({} as any)
            messages.pop()
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

const scrollContainer = ref<any>(null)
const scrollContent = ref<HTMLDivElement | null>(null)

const loadMoreData = async (): Promise<number> => {
  let rs = await dbManager?.findNextMessages(pageSize / 2, latestId)
  if (rs && rs.length) {
    for (const i of rs) {
      const u = user[i.userId]
      if (u) {
        const currentMessage: Message = {
          id: i.id,
          user: u,
          title: i.title,
          content: i.content,
          createTime: i.createTime,
          finished: true,
          render: 0,
        }
        messages.push(currentMessage)
        if (messages.length > pageSize) {
          messages.shift()
        }
      }
    }

    if (messages && messages.length) {
      oldestId = messages[0].id || Number.MAX_SAFE_INTEGER
      latestId = messages[messages.length - 1].id || 0
    }
  }

  console.log('loadMoreData', latestId, rs?.length || 0)
  return rs?.length || 0
}

const loadEarlierData = async (): Promise<number> => {
  let rs = await dbManager?.findPrevMessages(pageSize / 2, oldestId)
  if (rs && rs.length) {
    for (const i of rs) {
      const u = user[i.userId]
      if (u) {
        const currentMessage: Message = {
          id: i.id,
          user: u,
          title: i.title,
          content: i.content,
          createTime: i.createTime,
          finished: true,
          render: 0,
        }
        messages.unshift(currentMessage)
        if (messages.length > pageSize) {
          messages.pop()
        }
      }
    }

    if (messages && messages.length) {
      oldestId = messages[0].id || Number.MAX_SAFE_INTEGER
      latestId = messages[messages.length - 1].id || 0
    }
  }

  console.log('loadEarlierData', oldestId, rs?.length || 0)
  return rs?.length || 0
}

const SCROLL_DEBOUNCE_MS = 200
const SCROLL_THRESHOLD = 10
let lastScrollTop = 0
let debounceTimer: any = null

const handleScroll = async () => {
  const container = scrollContainer.value.$el
  if (!container) return
  const scrollTop = container.scrollTop || 0
  const scrollHeight = container.scrollHeight || 0
  const clientHeight = container.clientHeight || 0

  const scrollDirection = scrollTop > lastScrollTop ? 'down' : 'up'
  lastScrollTop = scrollTop

  const isNearBottom = scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD

  if (debounceTimer) clearTimeout(debounceTimer)

  debounceTimer = setTimeout(async () => {
    if (scrollDirection === 'down' && isNearBottom) {
      await loadMoreData()
    } else if (scrollDirection === 'up' && scrollTop <= SCROLL_THRESHOLD) {
      await loadEarlierData()
    }
  }, SCROLL_DEBOUNCE_MS)
}

let mentions: any = []

const sendMessage = async () => {
  const text = content.value.trim()
  if (!text) {
    return
  }

  mentions = []
  if (window.electronAPI) {

    const file = fileData.value

    const uuid = uuidv4()

    mentions = [...new Set(getMentions(text))]
    if (mentions.map((i: any) => i.value).includes('all')) {
      users.filter(i => i !== user.me && i.online).forEach((i: any) => {
        if (file) {
          const arr = i.accept.split(',')
          if (!arr.some((element: string) => file.name.includes(element))) {
            message.warning(`${i.id} support: ${i.accept}`)
          } else {
            window.electronAPI.sendMessage('file', <MessageFile>{
              from: USER,
              to: i.id,
              fileName: file.name,
              fileType: file.type,
              fileData: file.data,
              id: uuid
            })
          }
        }

        window.electronAPI.sendMessage('chat', <MessageChat>{from: USER, to: i.id, data: text, id: uuid})
      })
    } else {
      mentions.forEach((i: any) => {
        if (file) {
          const arr = user[i.value].accept.split(',')
          if (!arr.some(element => file.name.includes(element))) {
            message.warning(`${i.value} support: ${user[i.value].accept}`)
          } else {
            window.electronAPI.sendMessage('file', <MessageFile>{
              from: USER,
              to: i.value,
              fileName: file.name,
              fileType: file.type,
              fileData: file.data,
              id: uuid
            })
          }
        }
        window.electronAPI.sendMessage('chat', <MessageChat>{from: USER, to: i.value, data: text, id: uuid})
      })
    }
  }

  await addMessage(text, user.me)
  content.value = mentions.length > 0 ? mentions.map((i: any) => `@${i.value}`).join(' ') + ' ' : ''

  fileList.value = []
  fileData.value = null
}

const scrollToBottom = async () => {
  await nextTick(() => {
    setTimeout(() => {
      const parentElement = scrollContent.value?.parentElement
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
  window.electronAPI?.sendMessage('open', <MessageOpen>{from: USER, to: id})
}

const newChat = async (id: string) => {
  content.value = `@${id} `
  focusInput()
}

const inputFocus = ref(true)
const inputFocusChange = (focus: boolean) => {
  inputFocus.value = focus
}

const handleCompositionStart = () => {
  isComposing = true
}

const handleCompositionEnd = () => {
  isComposing = false
}

const handleSuggest = async (msg: string) => {
  const m = mentions.length > 0 ? mentions.map((i: any) => `@${i.value}`).join(' ') + ' ' : ''
  content.value = `${m} ${msg}`
  await sendMessage()
}

const delMessage = async (id: number) => {
  const index = messages.findIndex((message: Message) => message.id === id)
  if (index !== -1) {
    messages.splice(index, 1)
  }
  await dbManager?.removeMessage(id)
  messageApi.info(`ID: ${id} 已刪除`)
}

const fileData = ref<FileData | null>(null)

const beforeFileUpload = async (file: File) => {
  console.log('before fileUpload', file)
  fileData.value = {
    name: file.name,
    type: file.type,
    data: await file.arrayBuffer(),
  }

  const url = URL.createObjectURL(file)
  console.log(url)
  loading.value = true
  // imageUrl.value = url

  const reader = new FileReader()
  reader.addEventListener('load', () => {

    // const fileDataUrl = reader.result;

    // settings.avatar = reader.result as string
  })
  reader.readAsDataURL(file)

  // user.me.avatar = url
  loading.value = false
  return false
}

const fileList = ref<UploadProps['fileList']>([])

const translate = ref(false)
const changeTranslate = () => {
  translate.value = !translate.value
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
    <contextHolder/>
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
        <a-layout-content :style="contentStyle" ref="scrollContainer" @scroll="handleScroll">
          <div ref="scrollContent">
            <Chat :messages="messages" :settings="settings" @suggest="handleSuggest" @delMessage="delMessage"></Chat>
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
                @compositionstart="handleCompositionStart"
                @compositionend="handleCompositionEnd"
            >


            </a-mentions>

            <div class="fileList">
              <a-upload
                  v-model:file-list="fileList"
              >
              </a-upload>
            </div>
            <a-flex justify="flex-end" align="flex-end" class="send">
              <a-space size="small">
                <a-tooltip :title="t.translate">
                  <a-button shape="circle" @click="changeTranslate" :type="translate?'primary':''">
                    <template #icon>
                      <TranslationOutlined/>
                    </template>
                  </a-button>
                </a-tooltip>
                <a-tooltip :title="t.file">
                  <a-upload
                      v-model:file-list="fileList"
                      maxCount="1"
                      :before-upload="beforeFileUpload"
                  >
                    <a-button shape="circle">
                      <template #icon>
                        <FileAddOutlined/>
                      </template>
                    </a-button>
                    <template #itemRender="">
                    </template>
                  </a-upload>
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
  right: 10px;
  bottom: 10px;
  display: flex;
  justify-content: end;
}

.fileList {
  position: absolute;
  right: 10px;
  top: 10px;
  display: flex;
  justify-content: end;
}

.hidden-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  overflow: hidden;
  z-index: -1;
}
</style>
