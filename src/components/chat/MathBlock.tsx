import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathBlockProps {
  math: string;
  block?: boolean;
}

export const MathBlock: React.FC<MathBlockProps> = ({ math, block = false }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
      });
    } catch (err) {
      console.warn('[KaTeX Error]', err);
      return math;
    }
  }, [math, block]);

  if (block) {
    return (
      <div
        className="my-3 py-2 px-3 overflow-x-auto text-center rounded-lg bg-white/[0.02] border border-white/5 font-serif selection:bg-[#00f0ff] selection:text-black"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className="inline-block px-1 font-serif selection:bg-[#00f0ff] selection:text-black"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MathBlock;
