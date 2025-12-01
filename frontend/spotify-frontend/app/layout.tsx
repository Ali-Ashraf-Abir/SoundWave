import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SongProvider } from "@/context/SongContext";

export const metadata: Metadata = {
  title: "SoundWave - Music for Everyone",
  description: "Stream millions of songs. Discover new music. Create playlists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SongProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
        </SongProvider>
      </body>
    </html>
  );
}