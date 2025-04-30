export {}
declare global {
    interface Window {
        electronAPI: {
            sendMessage: (channel: string, data: any) => void;
            onMessage: (channel: string, callback: (...args: any[]) => void) => void;
        };
    }

    interface Settings {
        groupName: string
        myName: string
    }
}