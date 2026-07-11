import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    const isDev = mode === 'development';
    const isProd = mode === 'production';

    return {
      plugins: [react()],
      define: {
        __APP_ENV__: JSON.stringify(mode),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      ...(isDev && {
        server: {
          host: '0.0.0.0',
          port: Number(env.VITE_PORT) || 3000,
          strictPort: true,
        },
      }),
      build: {
        sourcemap: !isProd,
        minify: isProd,
      },      
    };
});
