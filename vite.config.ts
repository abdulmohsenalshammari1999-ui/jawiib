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

    // Terser for aggressive minification + obfuscation
    minify: 'terser',
    terserOptions: {
      compress: {
        // Strip all console output from production bundle
        drop_console: true,
        drop_debugger: true,
        // Extra passes improve obfuscation
        passes: 2,
        // Remove dead code
        dead_code: true,
        // Collapse single-use variables
        collapse_vars: true,
      },
      mangle: {
        // Rename local variables to short names
        toplevel: false,
        // Mangle properties beginning with _ (private convention)
        properties: {
          regex: /^_/,
        },
      },
      format: {
        // Remove all comments from output
        comments: false,
      },
    },
  },
})

export default config
