import { Fragment, type ReactNode } from 'react';
import { CodeBlock } from '../code/CodeBlock';

/**
 * Renders the tiny content markup used in src/content:
 * `code`, **bold**, *italic*, "- " bullets, blank line = new paragraph, ```code fences```.
 */
export function Rich({ text, className }: { text: string; className?: string }) {
  const blocks = parseBlocks(text);
  return (
    <div className={'rich ' + (className ?? '')}>
      {blocks.map((b, i) => {
        if (b.kind === 'code') return <CodeBlock key={i} code={b.text} compact />;
        if (b.kind === 'list')
          return (
            <ul key={i}>
              {b.items.map((it, j) => (
                <li key={j}>{inline(it)}</li>
              ))}
            </ul>
          );
        return <p key={i}>{inline(b.text)}</p>;
      })}
    </div>
  );
}

type Block = { kind: 'p'; text: string } | { kind: 'code'; text: string } | { kind: 'list'; items: string[] };

function parseBlocks(text: string): Block[] {
  const out: Block[] = [];
  const lines = text.replace(/\r/g, '').split('\n');
  let i = 0;
  let para: string[] = [];
  const flush = () => {
    if (para.length) out.push({ kind: 'p', text: para.join('\n') });
    para = [];
  };
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith('```')) {
      flush();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) code.push(lines[i++]);
      i++;
      out.push({ kind: 'code', text: code.join('\n') });
      continue;
    }
    if (/^\s*- /.test(line)) {
      flush();
      const items: string[] = [];
      while (i < lines.length && /^\s*- /.test(lines[i])) items.push(lines[i++].replace(/^\s*- /, ''));
      out.push({ kind: 'list', items });
      continue;
    }
    if (!line.trim()) {
      flush();
      i++;
      continue;
    }
    para.push(line);
    i++;
  }
  flush();
  return out;
}

/** Inline markup: `code`, **bold**, *italic*, newlines → <br>. */
export function inline(text: string): ReactNode {
  const parts: ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\n)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok === '\n') parts.push(<br key={k++} />);
    else if (tok.startsWith('`')) parts.push(<code className="ic" key={k++}>{tok.slice(1, -1)}</code>);
    else if (tok.startsWith('**')) parts.push(<strong key={k++}>{tok.slice(2, -2)}</strong>);
    else parts.push(<em key={k++}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <Fragment>{parts}</Fragment>;
}
