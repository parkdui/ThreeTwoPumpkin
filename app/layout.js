import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: '3, 2, Pumpkin!',
  description: 'Interactive Portfolio',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        {children}
        <Script
          src="https://unpkg.com/ml5@latest/dist/ml5.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}

