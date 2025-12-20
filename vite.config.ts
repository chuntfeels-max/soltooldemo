
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // @ts-ignore
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      'process.env.HELIUS_API_KEY': JSON.stringify(env.HELIUS_API_KEY || env.API_KEY || '')
    },
    resolve: {
      // 确保只使用一个 React 副本（优先使用本地安装的）
      dedupe: ['react', 'react-dom']
    },
    server: {
      host: true,
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true
    }
  };
});
