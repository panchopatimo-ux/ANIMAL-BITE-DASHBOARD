import type { MetadataRoute } from 'next'

const appIcon = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2008_21_18%20AM-7FBoWFov6QNYJaVvN5YiN0FnbtTyJd.png'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Animal Bite Center | Batanes General Hospital',
    short_name: 'Animal Bite Center',
    description: 'Animal bite case monitoring and surveillance for Batanes General Hospital.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0b7a3e',
    icons: [
      { src: appIcon, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: appIcon, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  }
}
