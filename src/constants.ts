const USER = 'me'


interface Assistant {
    id: string
    link: string
}

const ASSISTANTS: Record<string, Assistant> = {
    DEEPSEEK: {id: 'deepseek', link: 'https://chat.deepseek.com/'},
    YIYAN: {id: 'yiyan', link: 'https://yiyan.baidu.com/'},
    DOUBAO: {id: 'doubao', link: 'https://www.doubao.com/chat/'},
    KIMI: {id: 'kimi', link: 'https://kimi.moonshot.cn/chat/'},
    ZHIDA: {id: 'zhida', link: 'https://zhida.zhihu.com/'},
    TONGYI: {id: 'tongyi', link: 'https://www.tongyi.com/qianwen/'},
    HUNYUAN: {id: 'hunyuan', link: 'https://llm.hunyuan.tencent.com/#/chat'},
    ZHIPU: {id: 'zhipu', link: 'https://chat.z.ai/'},
    MITA: {id: 'mita', link: 'https://metaso.cn/'},
    QINGYAN: {id: 'qingyan', link: 'https://chatglm.cn/main/alltoolsdetail?lang=zh'},
}

export {USER, ASSISTANTS}