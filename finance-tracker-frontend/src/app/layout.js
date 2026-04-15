import './globals.css'
import Navbar from './Navbar'
import { AuthProvider } from './AuthContext'

export const metadata = {
    title: 'Finance Tracker',
    description: 'Personal finance management application',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head />
            <body>
                <AuthProvider>
                    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                        <Navbar />
                        <main style={{ flex: 1 }}>
                            {children}
                        </main>
                    </div>
                </AuthProvider>
            </body>
        </html>
    )
}
