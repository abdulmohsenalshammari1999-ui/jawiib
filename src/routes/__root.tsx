import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, maximum-scale=3',
      },
      {
        title: 'جاوب - لعبة المعلومات العامة',
      },
      {
        name: 'description',
        content: 'لعبة الثقافة العامة الخليجية — 456 سؤال، 22 فئة، وضع فرق وكل ضد الكل، أسلحة وسرقة نقاط!',
      },
      {
        name: 'theme-color',
        content: '#06060F',
      },
      {
        property: 'og:title',
        content: 'جاوب - لعبة الثقافة العامة الخليجية',
      },
      {
        property: 'og:description',
        content: 'لعبة الثقافة العامة الخليجية — 456 سؤال، 22 فئة، وضع فرق وكل ضد الكل، أسلحة وسرقة نقاط!',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:image',
        content: 'https://jawib.app/og-image.png',
      },
      {
        property: 'og:url',
        content: 'https://jawib.app',
      },
      {
        property: 'og:site_name',
        content: 'جاوب',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'جاوب - لعبة الثقافة العامة الخليجية',
      },
      {
        name: 'twitter:description',
        content: 'لعبة الثقافة العامة الخليجية — 456 سؤال، 22 فئة، وضع فرق وكل ضد الكل، أسلحة وسرقة نقاط!',
      },
      {
        name: 'twitter:image',
        content: 'https://jawib.app/og-image.png',
      },
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'default',
      },
      {
        name: 'apple-mobile-web-app-title',
        content: 'جاوب',
      },
      {
        name: 'copyright',
        content: '© 2025 Jawib. All rights reserved.',
      },
      {
        name: 'robots',
        content: 'index, follow',
      },
    ],
    links: [
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
      {
        rel: 'canonical',
        href: 'https://jawib.app',
      },
      {
        rel: 'apple-touch-icon',
        href: '/apple-touch-icon.png',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body className="bg-jawwib-bg text-jawwib-text min-h-screen">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
