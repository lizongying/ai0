import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { dirname, resolve } from 'path';
import electron from 'vite-plugin-electron';
import { fileURLToPath } from 'url';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import { ASSISTANTS, USER } from './src/constants';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// https://vite.dev/config/
export default defineConfig({
    define: {
        'process': {}
    },
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
                entry: `src/preload/${USER}.ts`, vite: {
                    build: {
                        outDir: 'dist/preload',
                        sourcemap: true,
                    },
                },
            },
        ].concat(Object.values(ASSISTANTS).filter(v => v.enable).map(v => v.id).map(i => {
            return [
                {
                    entry: `src/preload/${i}.ts`, vite: {
                        build: {
                            outDir: 'dist/preload',
                            sourcemap: true,
                        },
                    },
                },
                {
                    entry: `src/renderer/${i}.ts`, vite: {
                        build: {
                            outDir: 'dist/renderer',
                            sourcemap: true,
                        },
                    },
                }
            ];
        }).flat()) : []),
        Components({
            resolvers: [
                AntDesignVueResolver({
                    importStyle: false, // css in js
                }),
            ],
        }),
    ],
    resolve: {
        alias: {
            '@': '/src',
            'html-to-docx': resolve(__dirname, '/src/shared/html-to-docx.esm.js'),
        },
    },
    build: !process.argv.includes('dev') ? {
        outDir: 'dist/home',
        sourcemap: true,
    } : {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/home/index.js'),
            },
            output: {
                dir: 'dist',
                entryFileNames: '[name].js',
            }
        },
        outDir: 'dist/home',
    },
});
