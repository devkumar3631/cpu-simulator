import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: "/operating_system_algorithm_simulator/",
  plugins: [react(), tailwindcss()]
});
