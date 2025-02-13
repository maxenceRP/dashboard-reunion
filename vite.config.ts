import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      host: env.HOST,
      port: Number(env.VITE_PORT),
      strictPort: true,
    },
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});