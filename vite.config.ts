import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'

const config = defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    netlify(),
    tanstackStart(),
    viteReact(),
  ],

  build: {
    // Never emit source maps in production
    sourcemap: false,

    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
        dead_code: true,
      },
      mangle: {
        // Safe: rename local variables only — do NOT mangle properties.
        // Property mangling with regex: /^_/ would rename _-prefixed internal
        // fields used by TanStack Router/Start and break the runtime.
        toplevel: false,
      },
      format: {
        comments: false,
      },
    },
  },
})

export default config
