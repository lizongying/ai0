import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        electron([
            {
                entry: 'src/main/index.ts', vite: {
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
            }
        ])
    ],
    resolve: {
        alias: {'@': '/src'},
    },
    build: {
        outDir: 'dist/renderer',
        sourcemap: true,
    },
    // build: {
    //     rollupOptions: {
    //         input: {
    //             main: resolve(__dirname, 'src/main/index.js'),
    //         },
    //         output: {
    //             dir: 'dist',
    //             entryFileNames: '[name].js',
    //         }
    //     },
    //     outDir: 'dist/renderer', // 渲染进程输出目录
    // },
})
