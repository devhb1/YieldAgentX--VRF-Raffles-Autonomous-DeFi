import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Web3Provider } from "@/components/Web3Provider";
import { Navigation } from "@/components/Navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DeFi Multi-Agent: Yield Optimizer with Raffle | Chainlink Hackathon",
  description: "Maximize your DeFi yields while you sleep - AI agents that never rest. Built for Chainlink Hackathon with VRF raffle system.",
  keywords: ["DeFi", "Chainlink", "AI Agents", "Yield Farming", "VRF", "Raffle", "Hackathon", "Web3"],
  authors: [{ name: "Chainlink Hackathon Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Web3Provider>
          <Navigation />
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
