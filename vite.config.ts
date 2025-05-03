import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {dirname, resolve} from 'path'
import electron from 'vite-plugin-electron'
import {fileURLToPath} from 'url'
import Components from 'unplugin-vue-components/vite'
import {AntDesignVueResolver} from 'unplugin-vue-components/resolvers'
import {createSvgIconsPlugin} from 'vite-plugin-svg-icons'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log(!process.argv.includes('dev'))

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        createSvgIconsPlugin({
            // Specify the icon folder to be cached
            iconDirs: [resolve(__dirname, 'src/icons')],
            // Specify symbolId format
            symbolId: 'icon-[name]',
        }),
        electron(!process.argv.includes('dev') ? [
            {
                entry: 'src/main/index.ts', vite: {
                    build: {
                        outDir: 'dist/main',
                        sourcemap: true,
                    },
                },
            },
            {
                entry: 'src/main/renderer_deepseek.ts', vite: {
                    build: {
                        outDir: 'dist/main',
                        sourcemap: true,
                    },
                },
            },
            {
                entry: 'src/preload/index.ts', vite: {
                    build: {
                        outDir: 'dist/preload',
                        sourcemap: true,
                    },
                },
            },
            {
                entry: 'src/preload/me.ts', vite: {
                    build: {
                        outDir: 'dist/preload',
                        sourcemap: true,
                    },
                },
            }
        ] : []),
        Components({
            resolvers: [
                AntDesignVueResolver({
                    importStyle: false, // css in js
                }),
            ],
        }),
    ],
    resolve: {
        alias: {'@': '/src'},
    },
    build: !process.argv.includes('dev') ? {
        outDir: 'dist/renderer',
        sourcemap: true,
    } : {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/renderer/index.js'),
            },
            output: {
                dir: 'dist',
                entryFileNames: '[name].js',
            }
        },
        outDir: 'dist/renderer',
    },
})
