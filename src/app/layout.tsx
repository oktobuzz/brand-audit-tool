import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Brand Intelligence Audit Tool | Deep Market Research Dashboard",
    description: "AI-powered brand intelligence audit tool that analyzes social media, marketplace listings, SEO, and competitive landscape using public data.",
    keywords: "brand audit, market research, competitive analysis, social media audit, SEO analysis",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}
