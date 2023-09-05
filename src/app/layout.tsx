import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Watermark from './watermark'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'Cool stuff',
	description: 'Generated with nextjs',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<main className="drop-shadow-xl">
					{children}
				</main>
			</body>
			{Watermark()}
		</html>
	)
}
