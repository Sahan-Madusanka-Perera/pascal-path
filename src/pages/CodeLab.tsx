import { BookMarked, FilePlus2, Save, Trash2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Playground, type PlaygroundHandle } from '../components/code/Playground';
import { PageHeader } from '../components/ui/primitives';
import { TOPICS } from '../content';
import { EXAMPLES } from '../content/examples';
import { getState, update, useAppState } from '../engine/store';

const BLANK = `program MyProgram;
var
  name : string;
begin
  write('What is your name? ');
  readln(name);
  writeln('Hello, ', name, '! Welcome to the Code Lab.');
end.`;

export default function CodeLab() {
  const s = useAppState();
  const [params, setParams] = useSearchParams();
  const pg = useRef<PlaygroundHandle>(null);
  const exampleId = params.get('example');
  const example = EXAMPLES.find((e) => e.id === exampleId);
  const [initial, setInitial] = useState(() => example?.code ?? (getState().lab.code || BLANK));
  const [activeId, setActiveId] = useState<string | null>(example?.id ?? null);
  const [savedMsg, setSavedMsg] = useState('');
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const groups = useMemo(() => {
    const m = new Map<string, typeof EXAMPLES>();
    for (const e of EXAMPLES) {
      const key = TOPICS[e.topic]?.title ?? 'More';
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(e);
    }
    return [...m.entries()];
  }, []);

  const load = (code: string, id: string | null) => {
    setInitial(code);
    setActiveId(id);
    pg.current?.setCode(code);
    if (id && EXAMPLES.some((e) => e.id === id)) setParams({ example: id }, { replace: true });
    else setParams({}, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onChange = (code: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => update((d) => void (d.lab.code = code)), 400);
  };

  const saveSnippet = () => {
    const code = pg.current?.getCode() ?? '';
    const m = code.match(/program\s+([A-Za-z_][\w]*)/i);
    const name = m?.[1] ?? `Program ${s.lab.snippets.length + 1}`;
    update((d) => {
      d.lab.snippets = [{ name, code, ts: Date.now() }, ...d.lab.snippets.filter((x) => x.name !== name)].slice(0, 30);
    });
    setSavedMsg(`Saved "${name}"`);
    setTimeout(() => setSavedMsg(''), 2500);
  };

  return (
    <div className="page lab">
      <PageHeader title="Your Pascal playground" lead="Write any program, run it, and watch it step by step. Try the examples from your tute, then change them and see what happens.">
        <div className="row row-wrap">
          <button type="button" className="btn btn-sm" onClick={() => load(BLANK, null)}>
            <FilePlus2 size={16} /> New
          </button>
          <button type="button" className="btn btn-sm" onClick={saveSnippet}>
            <Save size={16} /> Save
          </button>
          <span className="subtle lab-saved" aria-live="polite">
            {savedMsg}
          </span>
        </div>
      </PageHeader>

      <div className="lab-grid">
        <aside className="lab-side card" aria-label="Examples">
          <label className="lab-select">
            <span className="sr-only">Load an example</span>
            <select
              className="select"
              value={activeId ?? ''}
              onChange={(e) => {
                const ex = EXAMPLES.find((x) => x.id === e.target.value);
                if (ex) load(ex.code, ex.id);
              }}
            >
              <option value="">Load an example…</option>
              {EXAMPLES.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </label>
          <div className="lab-list">
            {s.lab.snippets.length > 0 && (
              <div className="lab-group">
                <div className="eyebrow">
                  <BookMarked size={12} aria-hidden="true" /> My programs
                </div>
                {s.lab.snippets.map((sn) => (
                  <div key={sn.name} className="lab-item-row">
                    <button type="button" className="lab-item" onClick={() => load(sn.code, 'my:' + sn.name)} aria-current={activeId === 'my:' + sn.name}>
                      {sn.name}
                    </button>
                    <button type="button" className="icon-btn" aria-label={`Delete ${sn.name}`} onClick={() => update((d) => void (d.lab.snippets = d.lab.snippets.filter((x) => x.name !== sn.name)))}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {groups.map(([g, list]) => (
              <div key={g} className="lab-group">
                <div className="eyebrow">{g}</div>
                {list.map((e) => (
                  <button key={e.id} type="button" className="lab-item" onClick={() => load(e.code, e.id)} aria-current={activeId === e.id} title={e.description}>
                    {e.title}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </aside>
        <section className="lab-main">
          {example && activeId === example.id && <p className="subtle lab-desc">{example.description}</p>}
          <Playground ref={pg} initialCode={initial} onCodeChange={onChange} lab minLines={18} layout="split" consoleMinHeight={260} editorLabel="Code Lab editor" />
          <p className="subtle lab-tip">
            Tip: <span className="kbd">Ctrl</span> + <span className="kbd">Enter</span> runs your code. Your work is saved automatically on this device.
          </p>
        </section>
      </div>
    </div>
  );
}
