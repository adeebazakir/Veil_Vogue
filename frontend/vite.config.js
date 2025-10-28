// // vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Import the React plugin

// https://vitejs.dev/config/
export default defineConfig({
  // The plugins array tells Vite to use the React plugin
  plugins: [react()], 
});



