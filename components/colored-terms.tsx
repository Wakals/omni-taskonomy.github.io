import type { ReactNode } from 'react';

// Wrap exact modality terms without replacing characters or matching inside other words.
export function coloredTerms(value: string): ReactNode {
  const pattern = /\b(image[- ]to[- ]image|image[- ]to[- ]text|visual generation|visual understanding|understanding tasks|understanding task|generation-to-understanding|generation and understanding|generation|understanding|I2I|I2T)\b/gi;
  return value.split(pattern).map((part, index) => {
    if (index % 2 === 0) return part;
    if (/^generation-to-understanding$/i.test(part)) {
      return <span key={index}>
        <span className="term-generation">{part.slice(0, 10)}</span>
        {part.slice(10, 14)}
        <span className="term-understanding">{part.slice(14)}</span>
      </span>;
    }
    if (/^generation and understanding$/i.test(part)) {
      return <span key={index}>
        <span className="term-generation">{part.slice(0, 10)}</span>
        {part.slice(10, 15)}
        <span className="term-understanding">{part.slice(15)}</span>
      </span>;
    }
    const generation = /generation|image[- ]to[- ]image|i2i/i.test(part);
    return <span key={index} className={generation ? 'term-generation' : 'term-understanding'}>{part}</span>;
  });
}
