declare global {
    interface Settings {
        groupName: string
        myName: string
        saveMessage: boolean
        showNickname: boolean
        lang: string
        avatar?: string
    }

    interface User {
        id: string
        name: string | ComputedRef<string>
        avatar: string | ComputedRef<string>
        link: string
        desc: string
        online: boolean
        me: boolean
    }

    // TODO a lock for updated?
    interface Message {
        user: User
        title?: string
        content: string
        createTime: number
        updateTime?: number
        finished: boolean
        render: number
        html?: string
    }

    interface MessageStore {
        id?: number
        userId: string
        content: string
        createTime: number
    }

    interface Window {
        electronAPI: {
            sendMessage: (channel: string, data: any) => void
            onMessage: (channel: string, callback: (...args: any[]) => void) => void
        }
    }

    interface Mentions {
        focus(): void;
    }


    interface Response {
        message_id: number
        parent_id: number
        model: string
        role: string
        content: string
        thinking_enabled: boolean
        thinking_content?: any
        thinking_elapsed_secs?: any
        ban_edit: boolean
        "ban_regenerate": boolean
        "status": string
        "accumulated_token_usage": number
        files: any[]
        tips: any[]
        inserted_at: number
        search_enabled: boolean
        search_status?: any
        search_results?: any
    }

    interface V {
        response: Response
    }

    interface Data {
        v?: string | V
        updated_at?: number
        content?: string
        p?: string
        o?: string
    }

    interface Result {
        event?: string
        data?: Data
    }
}

export {}