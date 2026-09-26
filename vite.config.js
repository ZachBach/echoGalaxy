import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // relative base: the app serves both standalone and as a built copy under
  // the Aurelius site at /galaxy/ (same pattern as /helix/ and /ikos/)
  base: './',
  plugins: [react()],
  // The shared Helix package (file:../../helix/capacitor) imports @capacitor/core
  // as a peer. Resolve it from this app so there is one copy of the bridge.
  resolve: { dedupe: ['@capacitor/core'] },
})
