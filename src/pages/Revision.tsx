import { Check, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Icon } from '../components/ui/icons';
import { Link } from 'react-router-dom';
import { CodeBlock } from '../components/code/CodeBlock';
import { PageHeader } from '../components/ui/primitives';
import { inline } from '../components/ui/Rich';
import { TOPICS, UNITS } from '../content';
import { COMMON_MISTAKES, DIFFERENCES, PATTERNS } from '../content/revision';
import { useAppState } from '../engine/store';

const TABS = [
  { id: 'notes', label: 'Quick notes' },
  { id: 'concepts', label: 'Key concepts' },
  { id: 'differences', label: 'Differences' },
  { id: 'patterns', label: 'Code patterns' },
  { id: 'mistakes', label: 'Common mistakes' },
] as const;
type Tab = (typeof TABS)[number]['id'];

export default function Revision() {
  const s = useAppState();
  const [tab, setTab] = useState<Tab>(() => {
    try {
      return (localStorage.getItem('pp:revtab') as Tab) || 'notes';
    } catch {
      return 'notes';
    }
  });
  const [q, setQ] = useState('');
  const choose = (t: Tab) => {
    setTab(t);
    try {
      localStorage.setItem('pp:revtab', t);
    } catch {
      /* ignore */
    }
  };
  const terms = useMemo(
    () =>
      Object.values(TOPICS)
        .flatMap((t) => (t.revision.keyTerms ?? []).map((k) => ({ ...k, topic: t.id })))
        .sort((a, b) => a.term.localeCompare(b.term)),
    [],
  );
  const filtered = terms.filter((k) => !q || (k.term + ' ' + k.def).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="page revision">
      <PageHeader title="Revise smarter" lead="Short, scannable summaries of every syllabus topic. Perfect for the days before your exam." />
      <div className="tabs" role="tablist" aria-label="Revision sections">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className="tab" onClick={() => choose(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'notes' && (
        <div className="stack">
          {UNITS.filter((u) => u.topics.length).map((u) => (
            <section key={u.id}>
              <h2 className="rev-unit">
                <Icon name={u.icon} size={18} className="unit-inline-icon" /> {u.title}
              </h2>
              <div className="grid-auto">
                {u.topics.map((tid) => {
                  const tp = TOPICS[tid];
                  const done = !!s.revisionsDone[tid];
                  return (
                    <Link key={tid} to={`/revision/${tid}`} className="card card-link rev-card" style={{ ['--unit' as string]: `var(--hue-${u.hue})` } as React.CSSProperties}>
                      <div className="row">
                        <span className="chip">5 min</span>
                        {done && (
                          <span className="chip chip-easy">
                            <Check size={12} /> Revised
                          </span>
                        )}
                      </div>
                      <h3>{tp.title}</h3>
                      <p className="muted">{inline(tp.revision.what)}</p>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {tab === 'concepts' && (
        <div className="stack">
          <label className="search">
            <Search size={18} aria-hidden="true" />
            <input className="input" placeholder="Search key terms…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search key terms" />
          </label>
          <dl className="glossary">
            {filtered.map((k) => (
              <div key={k.term + k.topic} className="glossary-item">
                <dt>{k.term}</dt>
                <dd>
                  {inline(k.def)}{' '}
                  <Link to={`/revision/${k.topic}`} className="small-link">
                    {TOPICS[k.topic].title}
                  </Link>
                </dd>
              </div>
            ))}
            {!filtered.length && <p className="subtle">No matching terms.</p>}
          </dl>
        </div>
      )}

      {tab === 'differences' && (
        <div className="diff-list">
          {DIFFERENCES.map((d) => (
            <section key={d.title} className="card diff">
              <h3>{d.title}</h3>
              <div className={'diff-cols' + (d.c ? ' diff-cols-3' : '')}>
                {[d.a, d.b, d.c].filter(Boolean).map((col) => (
                  <div key={col!.name} className="diff-col">
                    <b className="mono">{col!.name}</b>
                    <ul>
                      {col!.points.map((p) => (
                        <li key={p}>{inline(p)}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {tab === 'patterns' && (
        <div className="grid-2">
          {PATTERNS.map((p) => (
            <section key={p.title} className="card pattern">
              <h3>{p.title}</h3>
              <p className="muted">{p.when}</p>
              <CodeBlock code={p.code} compact />
            </section>
          ))}
        </div>
      )}

      {tab === 'mistakes' && (
        <div className="stack">
          {COMMON_MISTAKES.map((m) => (
            <section key={m.title} className="card mistake">
              <h3>{m.title}</h3>
              <div className="mistake-cols">
                <div>
                  <span className="mistake-tag is-wrong">
                    <X size={13} strokeWidth={3} aria-hidden="true" /> Wrong
                  </span>
                  <CodeBlock code={m.wrong} compact />
                </div>
                <div>
                  <span className="mistake-tag is-right">
                    <Check size={13} strokeWidth={3} aria-hidden="true" /> Correct
                  </span>
                  <CodeBlock code={m.right} compact />
                </div>
              </div>
              <p className="muted">{inline(m.why)}</p>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
