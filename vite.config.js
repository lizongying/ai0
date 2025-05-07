import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { dirname, resolve } from 'path';
import electron from 'vite-plugin-electron';
import { fileURLToPath } from 'url';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
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
        alias: { '@': '/src' },
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
});
