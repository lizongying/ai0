const USER = 'me'


interface Assistant {
    id: string
    link: string
    name: string,
    avatar: string,
    desc: string,
    enable: boolean
}

const ASSISTANTS: Record<string, Assistant> = {
    DEEPSEEK: {
        id: 'deepseek',
        link: 'https://chat.deepseek.com/',
        name: 'DeepSeek',
        avatar: 'deepseek.png',
        desc: 'Chat with DeepSeek AI – your intelligent assistant for coding, content creation, file reading, and more. Upload documents, engage in long-context conversations, and get expert help in AI, natural language processing, and beyond. | 深度求索（DeepSeek）助力编程代码开发、创意写作、文件处理等任务，支持文件上传及长文本对话，随时为您提供高效的AI支持。',
        enable: true
    },
    DOUBAO: {
        id: 'doubao',
        link: 'https://www.doubao.com/chat/',
        name: '豆包',
        avatar: 'doubao.png',
        desc: '豆包是你的 AI 聊天智能对话问答助手，写作文案翻译编程全能工具。豆包为你答疑解惑，提供灵感，辅助创作，也可以和你畅聊任何你感兴趣的话题。',
        enable: true
    },
    KIMI: {
        id: 'kimi',
        link: 'https://kimi.moonshot.cn/chat/',
        name: 'Kimi',
        avatar: 'kimi.png',
        desc: 'Kimi是一款学生和职场人的新质生产力工具。帮你解读论文，写代码查BUG，策划方案，创作小说，多语言翻译。有问题问Kimi，一键解决你的所有难题',
        enable: true
    },
    TONGYI: {
        id: 'tongyi',
        link: 'https://www.tongyi.com/qianwen/',
        name: '通义',
        avatar: 'tongyi.png',
        desc: '通义是一个通情、达义的国产AI模型，可以帮你解答问题、文档阅读、联网搜索并写作总结，最多支持1000万字的文档速读。通义_你的全能AI助手',
        enable: true
    },
    HUNYUAN: {
        id: 'hunyuan',
        link: 'https://llm.hunyuan.tencent.com/#/chat',
        name: '騰訊混元',
        avatar: 'hunyuan.png',
        desc: '腾讯混元大模型是由腾讯研发的大语言模型，具备跨领域知识和自然语言理解能力，实现基于人机自然语言对话的方式，理解用户指令并执行任务，帮助用户实现人获取信息，知识和灵感。',
        enable: true
    },
    ZHIPU: {
        id: 'zhipu',
        link: 'https://chat.z.ai/',
        name: '智普',
        avatar: 'zhipu.png',
        desc: 'Z Chat is an advanced AI assistant developed by Z.ai. Built on open-source GLM models, it supports text generation, reasoning, and deep research - making it a powerful and free AI chatbot tailored for both English and Chinese users.',
        enable: true
    },
    MITA: {
        id: 'mita',
        link: 'https://metaso.cn/',
        name: '秘塔AI搜索',
        avatar: 'mita.png',
        desc: '秘塔AI搜索，没有广告，直达结果',
        enable: true
    },
    QINGYAN: {
        id: 'qingyan',
        link: 'https://chatglm.cn/main/alltoolsdetail?lang=zh',
        name: '智譜清言',
        avatar: 'qingyan.png',
        desc: '中国版对话语言模型，与GLM大模型进行对话。',
        enable: false
    },
    ZHIDA: {
        id: 'zhida',
        link: 'https://zhida.zhihu.com/',
        name: '知乎直達',
        avatar: 'zhida.png',
        desc: '知乎直答（zhida.ai）是知乎推出的一款使用 AI 大模型等先进技术的产品，以知乎社区的优质内容为核心，多种数据源为辅助，为人们提供一种全新的获取可靠信息的途径。知乎直答是多智能体系统，能够满足用户多维度的需求；同时对生成结果进行溯源，以确保内容的可信、可控以及对知识产权和版权的尊重。知乎直答致力于为用户提供卓越的使用体验，用技术拉近创作者和用户之间的距离。有问题，就会有答案。',
        enable: false
    },
    YIYAN: {
        id: 'yiyan',
        link: 'https://yiyan.baidu.com/',
        name: '文心一言',
        avatar: 'yiyan.png',
        desc: '文心一言既是你的智能伙伴，可以陪你聊天、回答问题、画图识图；也是你的AI助手，可以提供灵感、撰写文案、阅读文档、智能翻译，帮你高效完成工作和学习任务。',
        enable: false
    },
}

export {USER, ASSISTANTS}