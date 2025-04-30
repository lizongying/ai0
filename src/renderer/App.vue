<script setup lang="ts">
import MarkDown from './components/MarkDown.vue'
import {
  ClockCircleOutlined,
  EllipsisOutlined,
  FileAddOutlined,
  FileImageOutlined,
  PlusOutlined,
  RightOutlined,
  SendOutlined,
  UserOutlined
} from '@ant-design/icons-vue'
import {theme} from 'ant-design-vue'


import {computed, type CSSProperties, h, nextTick, onMounted, reactive, ref} from 'vue'
import Chat from './components/Chat.vue'
import {getImageUrl} from './utils.ts'

import translations from '../i18n'

let t = translations['hant']

interface FormState {
  username: string;
  password: string;
  remember: boolean;
}

const formState = reactive<FormState>({
  username: '',
  password: '',
  remember: true,
});
const onFinish = (values: any) => {
  console.log('Success:', values);
};

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};


const open = ref<boolean>(false);

const afterOpenChange = (bool: boolean) => {
  console.log('open', bool);
};

const showDrawer = () => {
  open.value = true
}

const msg = ref('')

const ellipsis = ref(true)


// const sendToChild = (msg: String) => {
//   ipcRenderer.send('to-child', `Hello from Main Window! ${msg}`);
// }

const groupNotify = ref(`亲爱的群成员们：
大家好！为营造高效、友好的交流环境，现就群内规则及近期事项提醒如下，请仔细阅读：
1️⃣ 群功能定位
本群旨在AI技术交流，请勿发布无关广告、谣言或敏感内容。
2️⃣ 发言规范
▫️ 文明交流，禁止人身攻击或歧视性言论；
▫️ 重要通知请勿刷屏，避免覆盖他人信息；
▫️ 私聊需求请主动添加好友，避免群内频繁@全体成员。
3️⃣ 近期重点安排
⏰ 时间：【XX月XX日（周X）XX:XX】
📍 事项：【例：项目进度汇报/主题分享会/线下活动报名】
📝 要求：【例：提前准备资料/准时参会/完成问卷填写】
4️⃣ 问题反馈
如遇技术问题或规则疑问，请联系管理员【@管理员昵称】或私信沟通，我们将第一时间协助处理。
感谢大家的配合与支持！让我们共同维护一个有价值的社群空间～
—— 群管理团队`)

const lines = computed(() => groupNotify.value.split('\n'))
const lineMax = 5

const headerStyle: CSSProperties = {
  textAlign: 'center',
  color: '#fff',
  height: 64,
  paddingInline: 50,
  lineHeight: '64px',
  backgroundColor: '#333',
};

const contentStyle: CSSProperties = {
  textAlign: 'center',
  minHeight: 120,
  height: '100vh',
  lineHeight: '1.5em',
  color: '#fff',
  backgroundColor: '#333',
  padding: '24px 50px',
  overflow: 'scroll',
};

const siderStyle: CSSProperties = {
  textAlign: 'center',
  lineHeight: '64px',
  color: '#fff',
  backgroundColor: '#333',
  overflow: 'scroll',
};

const footerStyle: CSSProperties = {
  height: '200px',
  textAlign: 'center',
  color: '#fff',
  backgroundColor: '#333',
  position: 'relative',
};

onMounted(() => {
  if (window.electronAPI) {
    window.electronAPI.onMessage('app-status', (data: any) => {
      console.log('收到主进程消息:', data)
    })

    window.electronAPI.onMessage('from-child', (data: any) => {
      console.log('Received from child:', data)
      msg.value = data
    })
  }
})


interface DataItem {
  id: string
  name: string
  avatar: string
  link: string
  desc: string
}

const data: DataItem[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    avatar: 'deepseek.png',
    link: 'https://chat.deepseek.com/',
    desc: 'Chat with DeepSeek AI – your intelligent assistant for coding, content creation, file reading, and more. Upload documents, engage in long-context conversations, and get expert help in AI, natural language processing, and beyond. | 深度求索（DeepSeek）助力编程代码开发、创意写作、文件处理等任务，支持文件上传及长文本对话，随时为您提供高效的AI支持。',
  },
  {
    id: 'doubao',
    name: '豆包',
    avatar: 'doubao.png',
    link: 'https://www.doubao.com/chat/',
    desc: '豆包是你的 AI 聊天智能对话问答助手，写作文案翻译编程全能工具。豆包为你答疑解惑，提供灵感，辅助创作，也可以和你畅聊任何你感兴趣的话题。',
  },
  {
    id: 'kimi',
    name: 'Kimi',
    avatar: 'kimi.png',
    link: 'https://kimi.moonshot.cn/chat/',
    desc: 'Kimi是一款学生和职场人的新质生产力工具。帮你解读论文，写代码查BUG，策划方案，创作小说，多语言翻译。有问题问Kimi，一键解决你的所有难题',
  },
  {
    id: 'zhida',
    name: '知乎直達',
    avatar: 'zhida.png',
    link: 'https://zhida.zhihu.com/',
    desc: '知乎直答（zhida.ai）是知乎推出的一款使用 AI 大模型等先进技术的产品，以知乎社区的优质内容为核心，多种数据源为辅助，为人们提供一种全新的获取可靠信息的途径。知乎直答是多智能体系统，能够满足用户多维度的需求；同时对生成结果进行溯源，以确保内容的可信、可控以及对知识产权和版权的尊重。知乎直答致力于为用户提供卓越的使用体验，用技术拉近创作者和用户之间的距离。有问题，就会有答案。',
  },
  {
    id: 'tongyi',
    name: '通义',
    avatar: 'tongyi.png',
    link: 'https://www.tongyi.com/qianwen/',
    desc: '通义是一个通情、达义的国产AI模型，可以帮你解答问题、文档阅读、联网搜索并写作总结，最多支持1000万字的文档速读。通义_你的全能AI助手',
  },
  {
    id: 'hunyuan',
    name: '騰訊混元',
    avatar: 'hunyuan.png',
    link: 'https://llm.hunyuan.tencent.com/#/chat',
    desc: '腾讯混元大模型是由腾讯研发的大语言模型，具备跨领域知识和自然语言理解能力，实现基于人机自然语言对话的方式，理解用户指令并执行任务，帮助用户实现人获取信息，知识和灵感。',
  },
  {
    id: 'zhipu',
    name: '智普',
    avatar: 'zhipu.png',
    link: 'https://chat.z.ai/',
    desc: 'Z Chat is an advanced AI assistant developed by Z.ai. Built on open-source GLM models, it supports text generation, reasoning, and deep research - making it a powerful and free AI chatbot tailored for both English and Chinese users.'
  },
  {
    id: 'mita',
    name: '秘塔AI搜索',
    avatar: 'mita.png',
    link: 'https://metaso.cn/',
    desc: '秘塔AI搜索，没有广告，直达结果',
  },
  {
    id: 'zhipuqingyan',
    name: '智譜清言',
    avatar: 'zhipuqingyan.png',
    link: 'https://chatglm.cn/main/alltoolsdetail?lang=zh',
    desc: '中国版对话语言模型，与GLM大模型进行对话。',
  },
  {
    id: 'yiyan',
    name: '文心一言',
    avatar: 'yiyan.png',
    link: 'https://yiyan.baidu.com/',
    desc: '文心一言既是你的智能伙伴，可以陪你聊天、回答问题、画图识图；也是你的AI助手，可以提供灵感、撰写文案、阅读文档、智能翻译，帮你高效完成工作和学习任务。',
  },
];

interface Message {
  username: string
  avatar: string
  me: boolean
  content: string
}

const settings: Settings = reactive({
  groupName: 'AI技术交流群',
  myName: '我',
})

const messages = ref<Message[]>([
  {
    username: 'DeepSeek',
    avatar: 'deepseek.png',
    me: false,
    content: 'Hello there! How are you doing today?\n\nI was wondering if you could help me with something...'
  },
  {
    username: settings.myName,
    avatar: 'https://i.pravatar.cc/150?img=5',
    me: true,
    content: 'Hi Alice! I\'m doing well, thanks. **What can I help you with?**'
  },
  {
    username: 'Alice',
    avatar: 'https://i.pravatar.cc/150?img=1',
    me: false,
    content: 'I need help with:\n1. Vue components\n2. TypeScript\n3. Markdown rendering\n\n*Can you assist?*'
  },
  {
    username: settings.myName,
    avatar: 'https://i.pravatar.cc/150?img=5',
    me: true,
    content: 'Absolutely! Here are some resources:\n\n- [Vue Documentation](https://vuejs.org)\n- [TypeScript Handbook](https://www.typescriptlang.org/docs)\n\n```javascript\n// Example code\nconst message = "Happy coding!"\n```'
  }
])

// Function to add a new message
const addMessage = (content: string, me: boolean = true) => {
  messages.value.push({
    username: me ? settings.myName : 'Alice',
    avatar: me ? 'https://i.pravatar.cc/150?img=5' : 'https://i.pravatar.cc/150?img=1',
    me,
    content
  })

  console.log('messages', messages.value)
}

const options = computed(() =>
    data.map((d) => {
      return {
        value: d.id,
        label: d.name,
      }
    })
)

const who = ref('')

const scrollContainer = ref<HTMLDivElement | null>(null)

const sendMessage = async () => {
  addMessage(who.value, true)
  await nextTick(() => {
    setTimeout(() => {
      const parentElement = scrollContainer.value?.parentElement
      if (parentElement) {
        parentElement.scrollTop = parentElement.scrollHeight
      }
    }, 0)
  })
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
      <a-layout-sider :style="siderStyle" :width="300">
        <a-affix :offset-top="0">
          <a-space direction="vertical" size="large" style="width: calc(100% - 60px); margin: 0 20px; line-height: 0">
            <a-button :icon="h(PlusOutlined)" @click="" size="large" style="width: 100%; text-align: left">
              新对话
            </a-button>
          </a-space>
        </a-affix>


        <a-list item-layout="horizontal" :data-source="data">
          <template #renderItem="{ item}">
            <a-list-item>
              <a-list-item-meta
              >
                <template #title>
                  <a-flex gap="middle" align="start" vertical>
                    <a :href="item.link" target="_blank">{{ item.name }}</a>
                  </a-flex>
                </template>

                <template #description>
                  <a-flex gap="middle" align="start" vertical>
                    <a-typography>
                      <a-typography-paragraph :ellipsis="{ rows: 2, expandable: false, symbol: 'more' }"
                                              style="margin-bottom: 0; text-align: left"
                                              :content="item.desc">
                      </a-typography-paragraph>
                    </a-typography>
                  </a-flex>
                </template>

                <template #avatar>
                  <a-badge>
                    <template #count>
                      <ClockCircleOutlined style="color: #f5222d"/>
                    </template>
                    <a-tooltip>
                      <template #title>{{ item.name }}</template>
                      <a-avatar :src="getImageUrl(item.avatar)" shape="square" :size="64">
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
            <div>
              <img src="/ai0-512x512.png" class="logo" alt="logo"/>
            </div>
            <MarkDown :md="msg"></MarkDown>

            <Chat :messages="messages" :settings="settings"></Chat>
          </div>
        </a-layout-content>
        <a-layout-footer :style="footerStyle">
          <a-divider/>
          <div style="position: relative; display: flex;">
            <a-mentions
                autofocus
                v-model:value="who"
                rows="4"
                :placeholder="t.mention"
                :options="options"
                style="text-align: left"
            ></a-mentions>
            <a-flex justify="flex-end" align="flex-end" class="send">
              <a-space size="large" style="margin-right: 10px">
                <a-tooltip :title="t.image">
                  <a-button shape="circle">
                    <template #icon>
                      <FileImageOutlined/>
                    </template>
                  </a-button>
                </a-tooltip>
              </a-space>
              <a-space size="large" style="margin-right: 10px">
                <a-tooltip :title="t.file">
                  <a-button shape="circle">
                    <template #icon>
                      <FileAddOutlined/>
                    </template>
                  </a-button>
                </a-tooltip>
              </a-space>
              <a-space size="large">
                <a-tooltip :title="t.send">
                  <a-button type="primary" shape="circle" :icon="h(SendOutlined)" @click="sendMessage()"/>
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
        @after-open-change="afterOpenChange"
    >
      <a-flex wrap="wrap" gap="large">
        <a-avatar v-for="item in data" :key="item" shape="square" :size="64" @click=""
                  :src="getImageUrl(item.avatar)">
          <template #icon>
            <UserOutlined/>
          </template>
        </a-avatar>
      </a-flex>

      <a-divider/>

      <a-form
          :model="formState"
          name="basic"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
          autocomplete="off"
          @finish="onFinish"
          @finishFailed="onFinishFailed"
      >
        <a-flex gap="middle" vertical>
          <a-typography>
            <a-typography-paragraph strong>群公告</a-typography-paragraph>
            <template v-for="(line, index) in lines">
              <li v-if="index < lineMax">
                <a-typography-paragraph :key="index" :content="line"/>
              </li>
              <li v-if="!ellipsis && index >= lineMax">
                <a-typography-paragraph :key="index" :content="line"/>
              </li>
            </template>
            <a-typography-link :v-if="ellipsis && lines.length >= lineMax" @click="ellipsis=!ellipsis">
              {{ ellipsis ? '更多' : '收缩' }}
            </a-typography-link>
          </a-typography>
          <a-typography>
            <a-typography-paragraph strong>群聊名稱</a-typography-paragraph>
            <a-typography-paragraph v-model:content="settings.groupName" editable/>
          </a-typography>
          <a-typography>
            <a-typography-paragraph strong>我在本群的暱稱</a-typography-paragraph>
            <a-typography-paragraph v-model:content="settings.myName" editable/>
          </a-typography>

          <a-form-item label="查找聊天记录">
            <RightOutlined @click="" style="width: 100%"/>
          </a-form-item>

          <a-form-item label="保存聊天记录">
            <a-switch v-model:checked="formState.remember"/>
          </a-form-item>

          <a-form-item label="显示群成员昵称">
            <a-switch v-model:checked="formState.remember"/>
          </a-form-item>
        </a-flex>
      </a-form>
    </a-drawer>
  </a-config-provider>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

pre {
  margin: 0; /* 去掉默认的外边距 */
  padding: 0; /* 去掉默认的内边距 */
  background-color: transparent; /* 去掉默认的白色背景 */
  border: none; /* 去掉默认的边框 */
  font-family: inherit; /* 使用继承的字体 */
  font-size: inherit; /* 使用继承的字体大小 */
  white-space: pre-wrap; /* 允许自动换行 */
  overflow-x: auto; /* 允许水平滚动 */
}

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
  color: white;
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
