import 'katex/dist/katex.min.css';
import type { Metadata } from 'next';
import manuscriptContent from '@/content/manuscript-excerpts.json';
import paperMetadata from '@/content/paper-metadata.json';
import './globals.css';
export const metadata: Metadata = {
 title: manuscriptContent.excerpts.title.text,
 description: manuscriptContent.excerpts.description.text,
 authors: paperMetadata.authors.map(author => ({ name: author.name })),
 metadataBase: new URL('https://omni-taskonomy.github.io/'),
 alternates: { canonical: '/' },
 openGraph: {
  title: manuscriptContent.excerpts.title.text,
  description: manuscriptContent.excerpts.description.text,
  url: '/',
  type: 'article',
 },
 robots: { index: true, follow: true },
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) {
 return <html lang="en"><body>{children}</body></html>;
}
