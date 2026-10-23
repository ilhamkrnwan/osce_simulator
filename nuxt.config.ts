import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-23',
  devtools: { enabled: true },

  // Simulator ujian full-WebGL: tidak ada konten publik, SPA biasa
  ssr: false,

  modules: ['@pinia/nuxt', '@nuxt/eslint', '@nuxt/fonts'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  devServer: {
    host: '127.0.0.1',
    port: 5173,
  },
})
