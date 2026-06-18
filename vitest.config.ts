import {defineConfig} from 'vitest/config'


export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'src/main.tsx',
        'src/components/ui/**',
        'dist/**',
        'docs/**',
        'public/docs/**',
        'cypress/**',
        '*.config.*',
        '*.cjs',
      ],
    },
    setupFiles: ['./vitest-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})