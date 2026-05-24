import { Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import ClientAgentChat from "@/components/clientAgentChat/ClientAgentChat";

const manrope = Manrope({ subsets: ["latin", "cyrillic"] });

export const metadata = {
  title: {
    default: "AdoptPET",
    template: "%s | Next.js 14",
  },
  description: "Адопція тварин",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        <div className="container">
          <Navbar />

          <main className="main">{children}</main>

          <Footer />
        </div>

        <ClientAgentChat />
      </body>
    </html>
  );
}
