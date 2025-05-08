/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly RENDERER: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}