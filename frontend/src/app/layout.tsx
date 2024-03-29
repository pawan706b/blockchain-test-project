import './globals.css'
import type { Metadata } from 'next'
import { headers } from 'next/headers'

import { cookieToInitialState } from 'wagmi'

import { config } from '@/config'
import { ContextProvider } from '@/context'
import NavBar from './components/NavBar'

export const metadata: Metadata = {
  title: 'FailSafe Blockchain Test',
  description: 'Generated by create next app'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialState = cookieToInitialState(config, headers().get('cookie'))
  return (
    <html lang="en">
      <body>
        {/* Navbar */}
        <NavBar />
        <ContextProvider initialState={initialState}>{children}</ContextProvider>
      </body>
    </html>
  )
}