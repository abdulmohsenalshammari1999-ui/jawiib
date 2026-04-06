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
        content: 'width=device-width, initial-scale=1, maximum-scale=1',
      },
      {
        title: 'جاوب - لعبة المعلومات العامة',
      },
      {
        name: 'description',
        content: 'لعبة معلومات عامة عربية مع مقدم ذكي بلهجة كويتية - 16 فئة و288 سؤال',
      },
      {
        name: 'theme-color',
        content: '#06060F',
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
