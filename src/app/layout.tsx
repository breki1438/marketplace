import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {getServerSession} from "next-auth";
import SessionProvider from "@/components/SessionProvider";
import NavMenu from "@/components/NavMenu";
import {authOptions} from "@/lib/auth";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Marketplace",
    description: "Marketplace",
};

export default async function RootLayout({
                                             children,
                                         }: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await getServerSession(authOptions);

    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <SessionProvider session={session}>
                    <main>
                        <NavMenu />
                        <div className="bg-[#2C2628] min-h-[calc(100vh-56px)] top-0">
                            {children}
                        </div>
                    </main>
                </SessionProvider>
            </body>
        </html>
    );
}
