import type { Metadata, Viewport } from "next";
import "@/styles/lab.css";
import "@/styles/figures.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { site } from "@/content/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Namu AI Lab", template: "%s · Namu AI Lab" },
  description: site.description,
  openGraph: { siteName: "Namu AI Lab", type: "website", locale: "en" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: [
    { color: "#FFFFFF" },
  ],
};

/* Runs before paint: marks JS as present, so scroll reveals hide content only when JS can show it. */
const boot = `document.documentElement.classList.add('js')`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        <link rel="preload" href="/fonts/dmsans-lab.woff2" as="font" type="font/woff2" crossOrigin="" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "Organization", "@id": `${site.url}/#org`, name: "Namu AI Lab", url: site.url,
          parentOrganization: { "@type": "Organization", name: "Namu", url: site.parent.url },
          sameAs: ["https://github.com/namu-ai-lab"],
        }) }} />
      </head>
      <body>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
