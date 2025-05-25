/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          accent: 'var(--primary-accent)',
        },
        secondary: {
          accent: 'var(--secondary-accent)',
        },
        tertiary: {
          accent: 'var(--tertiary-accent)',
        },
        background: {
          dark: 'var(--dark-bg)',
          darker: 'var(--darker-bg)',
          card: 'var(--card-bg)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
        },
        border: {
          color: 'var(--border-color)',
        },
      },
    },
  },
  plugins: [],
}
