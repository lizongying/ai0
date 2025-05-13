const USER = 'me'


interface Assistant {
    id: string
    link: string
    enable: boolean
}

const ASSISTANTS: Record<string, Assistant> = {
    DEEPSEEK: {id: 'deepseek', link: 'https://chat.deepseek.com/', enable: true},
    DOUBAO: {id: 'doubao', link: 'https://www.doubao.com/chat/', enable: true},
    KIMI: {id: 'kimi', link: 'https://kimi.moonshot.cn/chat/', enable: true},
    TONGYI: {id: 'tongyi', link: 'https://www.tongyi.com/qianwen/', enable: true},
    HUNYUAN: {id: 'hunyuan', link: 'https://llm.hunyuan.tencent.com/#/chat', enable: true},
    ZHIPU: {id: 'zhipu', link: 'https://chat.z.ai/', enable: true},
    MITA: {id: 'mita', link: 'https://metaso.cn/', enable: true},
    QINGYAN: {id: 'qingyan', link: 'https://chatglm.cn/main/alltoolsdetail?lang=zh', enable: false},
    ZHIDA: {id: 'zhida', link: 'https://zhida.zhihu.com/', enable: false},
    YIYAN: {id: 'yiyan', link: 'https://yiyan.baidu.com/', enable: false},
}

export {USER, ASSISTANTS}