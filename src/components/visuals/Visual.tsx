import { ArrowDown, ArrowRight, Car, Check, Play, Repeat, RotateCcw, ScanLine, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { VisualKind } from '../../content/types';
import { CodeBlock } from '../code/CodeBlock';
import { inline } from '../ui/Rich';

export function Visual({ kind }: { kind: VisualKind }) {
  const C = VISUALS[kind];
  return (
    <div className="visual card">
      <C />
    </div>
  );
}

// ---------------------------------------------------------------- program anatomy
const ANATOMY_CODE = `program Average;
var
  mark1, mark2 : integer;
  avg : real;
begin
  mark1 := 70;
  mark2 := 85;
  avg := (mark1 + mark2) / 2;
  writeln('Average: ', avg:0:1);
end.`;
const PARTS = [
  { name: 'Heading', lines: [1], text: '`program Average;` gives the program a name. It ends with a semicolon.' },
  { name: 'Declarations', lines: [2, 3, 4], text: 'The `var` section lists every variable and its data type **before** the program starts. (A `const` section can go here too.)' },
  { name: 'Main body', lines: [5, 6, 7, 8, 9], text: 'Between `begin` and `end` are the statements. Pascal runs them **one by one, from top to bottom**.' },
  { name: 'The end', lines: [10], text: '`end.` with a full stop tells Pascal the program is finished.' },
];
function ProgramAnatomy() {
  const [p, setP] = useState(0);
  const marks = Object.fromEntries(PARTS[p].lines.map((l) => [l, 'selected' as const]));
  return (
    <div className="viz-anatomy">
      <div className="segmented anatomy-tabs" role="group" aria-label="Program parts">
        {PARTS.map((x, i) => (
          <button key={x.name} type="button" aria-pressed={p === i} onClick={() => setP(i)}>
            {i + 1}. {x.name}
          </button>
        ))}
      </div>
      <div className="anatomy-grid">
        <CodeBlock code={ANATOMY_CODE} marks={marks} />
        <div className="anatomy-explain fade-up" key={p}>
          <h3>{PARTS[p].name}</h3>
          <p>{inline(PARTS[p].text)}</p>
          <button type="button" className="btn btn-sm" onClick={() => setP((p + 1) % PARTS.length)}>
            Next part <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- data boxes game
const TYPES = [
  { t: 'integer', d: 'whole numbers', c: 'var(--hue-blue)' },
  { t: 'real', d: 'decimal numbers', c: 'var(--hue-teal)' },
  { t: 'char', d: 'ONE character', c: 'var(--hue-orange)' },
  { t: 'string', d: 'text', c: 'var(--hue-pink)' },
  { t: 'boolean', d: 'TRUE / FALSE', c: 'var(--hue-violet)' },
];
const VALUES: Array<{ v: string; t: string; why: string }> = [
  { v: '16', t: 'integer', why: '16 is a whole number.' },
  { v: '5.8', t: 'real', why: '5.8 has a decimal point, so it is a real.' },
  { v: "'A'", t: 'char', why: "'A' is exactly one character in quotes." },
  { v: "'Kamal'", t: 'string', why: "'Kamal' is text with many characters." },
  { v: 'TRUE', t: 'boolean', why: 'TRUE is a yes/no value.' },
  { v: '-5', t: 'integer', why: 'Negative whole numbers are integers too.' },
  { v: '1250.75', t: 'real', why: 'It has a decimal part.' },
  { v: "'7'", t: 'char', why: "It's in quotes, so it's a character, not a number!" },
];
function DataBoxes() {
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [sel, setSel] = useState<string | null>(VALUES[0].v);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const drop = (type: string) => {
    if (!sel) return;
    const val = VALUES.find((x) => x.v === sel)!;
    if (val.t === type) {
      const next = { ...placed, [sel]: type };
      setPlaced(next);
      setMsg({ ok: true, text: val.why });
      setSel(VALUES.find((x) => !next[x.v])?.v ?? null);
    } else setMsg({ ok: false, text: `Not ${type}. ${val.why}` });
  };
  const left = VALUES.filter((x) => !placed[x.v]);
  return (
    <div className="databoxes">
      <p className="subtle">Pick a value, then tap the box (data type) it belongs in.</p>
      <div className="databox-values">
        {left.length ? (
          left.map((x) => (
            <button key={x.v} type="button" className={'value-chip mono' + (sel === x.v ? ' is-selected' : '')} onClick={() => setSel(x.v)} aria-pressed={sel === x.v}>
              {x.v}
            </button>
          ))
        ) : (
          <span className="databox-done">
            <Check size={18} /> All sorted! Each type stores a different kind of value.
          </span>
        )}
        {left.length < VALUES.length && (
          <button type="button" className="icon-btn" onClick={() => { setPlaced({}); setSel(VALUES[0].v); setMsg(null); }} aria-label="Restart">
            <RotateCcw size={16} />
          </button>
        )}
      </div>
      <div className={'databox-msg' + (msg ? (msg.ok ? ' is-ok' : ' is-bad') : '')} aria-live="polite">
        {msg?.text ?? ' '}
      </div>
      <div className="databox-grid">
        {TYPES.map((ty) => (
          <button key={ty.t} type="button" className="databox" style={{ ['--c' as string]: ty.c } as React.CSSProperties} onClick={() => drop(ty.t)}>
            <span className="databox-name mono">{ty.t}</span>
            <span className="databox-desc">{ty.d}</span>
            <span className="databox-items">
              {VALUES.filter((x) => placed[x.v] === ty.t).map((x) => (
                <span key={x.v} className="databox-item mono pop">
                  {x.v}
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- variable box
const VAR_STEPS = [
  { code: 'score := 10;', value: 10 },
  { code: 'score := 20;', value: 20 },
  { code: 'score := score + 5;', value: 25 },
  { code: 'score := score * 2;', value: 50 },
];
function VariableBox() {
  const [i, setI] = useState(-1);
  const value = i >= 0 ? VAR_STEPS[i].value : null;
  const old = i > 0 ? VAR_STEPS[i - 1].value : null;
  return (
    <div className="varbox-demo">
      <div className="varbox-demo-code">
        {VAR_STEPS.map((s, k) => (
          <div key={k} className={'vd-line mono' + (k === i ? ' is-now' : k < i ? ' is-past' : '')}>
            <span className="vd-num">{k + 1}</span> {s.code}
          </div>
        ))}
      </div>
      <div className="varbox-demo-stage">
        <div className="big-box">
          <div className="big-box-label mono">score</div>
          <div className="big-box-inner">
            {value === null ? <span className="subtle">empty</span> : <span key={i} className="big-box-val mono flash">{value}</span>}
          </div>
          <div className="big-box-type mono">integer</div>
        </div>
        <p className="vd-caption" aria-live="polite">
          {i < 0 ? 'A variable is a labelled box. Press Next to run each line.' : old !== null ? `The old value ${old} is replaced by ${value}. The label "score" stays the same.` : `The value ${value} is stored in the box.`}
        </p>
        <div className="row">
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setI(Math.min(VAR_STEPS.length - 1, i + 1))} disabled={i >= VAR_STEPS.length - 1}>
            <Play size={14} /> Next line
          </button>
          <button type="button" className="btn btn-sm" onClick={() => setI(-1)}>
            <RotateCcw size={14} /> Restart
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- div / mod
function DivMod() {
  const [n, setN] = useState(17);
  const [d, setD] = useState(5);
  const q = Math.trunc(n / d);
  const r = n % d;
  return (
    <div className="divmod">
      <div className="divmod-controls">
        <label>
          <span>Number: <b className="mono">{n}</b></span>
          <input type="range" min={0} max={40} value={n} onChange={(e) => setN(Number(e.target.value))} />
        </label>
        <label>
          <span>Divide by: <b className="mono">{d}</b></span>
          <input type="range" min={1} max={9} value={d} onChange={(e) => setD(Number(e.target.value))} />
        </label>
      </div>
      <div className="divmod-groups" aria-label={`${n} sweets shared into groups of ${d}`}>
        {Array.from({ length: q }, (_, g) => (
          <div key={g} className="divmod-group">
            {Array.from({ length: d }, (_, k) => (
              <span key={k} className="dot" />
            ))}
          </div>
        ))}
        {r > 0 && (
          <div className="divmod-group divmod-rest">
            {Array.from({ length: r }, (_, k) => (
              <span key={k} className="dot dot-rest" />
            ))}
          </div>
        )}
      </div>
      <div className="divmod-results">
        <div className="divmod-res">
          <code className="mono">{n} div {d}</code> = <b>{q}</b>
          <span className="subtle">full groups</span>
        </div>
        <div className="divmod-res divmod-res-mod">
          <code className="mono">{n} mod {d}</code> = <b>{r}</b>
          <span className="subtle">left over</span>
        </div>
        <div className="divmod-res">
          <code className="mono">{n} / {d}</code> = <b>{+(n / d).toFixed(4)}</b>
          <span className="subtle">real division</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- truth table
function Switch({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} className={'tswitch' + (on ? ' is-on' : '')} onClick={onClick}>
      <span className="tswitch-label mono">{label}</span>
      <span className="tswitch-track">
        <span className="tswitch-knob" />
      </span>
      <b className="mono">{on ? 'TRUE' : 'FALSE'}</b>
    </button>
  );
}
function Lamp({ on, label }: { on: boolean; label: string }) {
  return (
    <div className={'lamp' + (on ? ' is-on' : '')}>
      <span className="lamp-bulb" aria-hidden="true" />
      <span className="mono lamp-label">{label}</span>
      <b className="mono">{on ? 'TRUE' : 'FALSE'}</b>
    </div>
  );
}
function TruthTable() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const rows = [
    [true, true],
    [true, false],
    [false, true],
    [false, false],
  ];
  return (
    <div className="truth">
      <div className="truth-live">
        <div className="truth-switches">
          <Switch on={a} onClick={() => setA(!a)} label="A" />
          <Switch on={b} onClick={() => setB(!b)} label="B" />
        </div>
        <div className="truth-lamps">
          <Lamp on={a && b} label="A and B" />
          <Lamp on={a || b} label="A or B" />
          <Lamp on={!a} label="not A" />
        </div>
      </div>
      <table className="truth-table">
        <thead>
          <tr>
            <th>A</th>
            <th>B</th>
            <th>A and B</th>
            <th>A or B</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([x, y], i) => (
            <tr key={i} className={x === a && y === b ? 'is-current' : ''}>
              {[x, y, x && y, x || y].map((v, k) => (
                <td key={k} className={v ? 'is-t' : 'is-f'}>
                  {v ? 'TRUE' : 'FALSE'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------- write vs writeln
function WriteVsWriteln() {
  const [stmts, setStmts] = useState<Array<{ ln: boolean; text: string }>>([]);
  const words = ['Hello', 'World', 'Pascal', '!'];
  const add = (ln: boolean) => setStmts((s) => [...s, { ln, text: words[s.length % words.length] }]);
  const screen = stmts.map((s) => s.text + (s.ln ? '\n' : '')).join('');
  return (
    <div className="wvw">
      <div className="wvw-code">
        <div className="eyebrow">Your statements</div>
        {stmts.length === 0 && <p className="subtle">Add some statements →</p>}
        {stmts.map((s, i) => (
          <div key={i} className="mono wvw-line fade-up">
            <span className="syn-bi">{s.ln ? 'writeln' : 'write'}</span>('{s.text}');
          </div>
        ))}
        <div className="row row-wrap wvw-buttons">
          <button type="button" className="btn btn-sm" onClick={() => add(false)} disabled={stmts.length >= 8}>
            + write
          </button>
          <button type="button" className="btn btn-sm" onClick={() => add(true)} disabled={stmts.length >= 8}>
            + writeln
          </button>
          <button type="button" className="icon-btn" onClick={() => setStmts([])} aria-label="Clear">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
      <div className="wvw-screen">
        <div className="eyebrow">Screen</div>
        <pre className="mono">
          {screen}
          <span className="cursor" aria-hidden="true">
            ▌
          </span>
        </pre>
        <p className="subtle wvw-note">The ▌ shows where the next output will appear. `writeln` moves it to a new line; `write` leaves it where it is.</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- if flowchart
function IfFlow() {
  const [marks, setMarks] = useState(62);
  const pass = marks >= 50;
  return (
    <div className="ifflow">
      <label className="ifflow-input">
        <span>
          marks = <b className="mono">{marks}</b>
        </span>
        <input type="range" min={0} max={100} value={marks} onChange={(e) => setMarks(Number(e.target.value))} />
      </label>
      <div className="flow">
        <div className="flow-node flow-start">Start</div>
        <ArrowDown className="flow-arrow" size={20} />
        <div className="flow-diamond">
          <span className="mono">marks &gt;= 50 ?</span>
        </div>
        <div className="flow-branches">
          <div className={'flow-branch' + (pass ? ' is-taken' : '')}>
            <span className="flow-tag flow-yes">TRUE</span>
            <ArrowDown className="flow-arrow" size={20} />
            <div className="flow-node mono">writeln('You PASSED!')</div>
          </div>
          <div className={'flow-branch' + (!pass ? ' is-taken' : '')}>
            <span className="flow-tag flow-no">FALSE</span>
            <ArrowDown className="flow-arrow" size={20} />
            <div className="flow-node mono">writeln('You FAILED.')</div>
          </div>
        </div>
        <ArrowDown className="flow-arrow" size={20} />
        <div className="flow-node flow-start">Continue</div>
      </div>
      <p className="ifflow-out" aria-live="polite">
        Output: <b className="mono">{pass ? 'You PASSED!' : 'You FAILED.'}</b> — only <em>one</em> branch runs.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- loop kinds
function LoopKinds() {
  const kinds = [
    { name: 'for', when: 'You know how many times', check: 'Counts automatically', min: 'Can run 0 times', code: 'for i := 1 to 5 do\n  writeln(i);' },
    { name: 'while', when: "You don't know how many times", check: 'Checks BEFORE each round', min: 'Can run 0 times', code: 'while count <= 5 do\nbegin\n  writeln(count);\n  count := count + 1;\nend;' },
    { name: 'repeat', when: 'It must run at least once', check: 'Checks AFTER each round', min: 'Always runs at least once', code: 'repeat\n  readln(number);\nuntil number > 0;' },
  ];
  const [k, setK] = useState(0);
  return (
    <div className="loopkinds">
      <div className="segmented" role="group" aria-label="Loop type">
        {kinds.map((x, i) => (
          <button key={x.name} type="button" aria-pressed={k === i} onClick={() => setK(i)} className="mono">
            {x.name}
          </button>
        ))}
      </div>
      <div className="loopkinds-body fade-up" key={k}>
        <CodeBlock code={kinds[k].code} compact />
        <dl className="loopkinds-facts">
          <div><dt>Use when</dt><dd>{kinds[k].when}</dd></div>
          <div><dt>Condition</dt><dd>{kinds[k].check}</dd></div>
          <div><dt>Minimum runs</dt><dd>{kinds[k].min}</dd></div>
        </dl>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- while vs repeat
function WhileVsRepeat() {
  const [start, setStart] = useState(10);
  const [ran, setRan] = useState(false);
  const whileOut: number[] = [];
  for (let x = start; x < 5 && whileOut.length < 12; x++) whileOut.push(x);
  const repeatOut: number[] = [];
  let x = start;
  do {
    repeatOut.push(x);
    x++;
  } while (!(x > 5) && repeatOut.length < 12);
  return (
    <div className="wvr">
      <label className="ifflow-input">
        <span>
          Start with x = <b className="mono">{start}</b>
        </span>
        <input type="range" min={0} max={10} value={start} onChange={(e) => { setStart(Number(e.target.value)); setRan(false); }} />
      </label>
      <div className="wvr-grid">
        <div className="wvr-col">
          <CodeBlock code={`x := ${start};\nwhile x < 5 do\nbegin\n  writeln(x);\n  x := x + 1;\nend;`} compact />
          <div className="wvr-out">
            <span className="eyebrow">Prints</span>
            <span className="mono">{ran ? (whileOut.length ? whileOut.join(' ') : '(nothing!)') : '…'}</span>
          </div>
          {ran && <p className="subtle">Checked first: {start < 5 ? `${start} < 5 is TRUE, so it runs.` : `${start} < 5 is FALSE, so the body never runs.`}</p>}
        </div>
        <div className="wvr-col">
          <CodeBlock code={`x := ${start};\nrepeat\n  writeln(x);\n  x := x + 1;\nuntil x > 5;`} compact />
          <div className="wvr-out">
            <span className="eyebrow">Prints</span>
            <span className="mono">{ran ? repeatOut.join(' ') : '…'}</span>
          </div>
          {ran && <p className="subtle">Runs first, checks after — so it always prints at least once.</p>}
        </div>
      </div>
      <button type="button" className="btn btn-primary btn-sm" onClick={() => setRan(true)}>
        <Play size={14} /> Run both
      </button>
    </div>
  );
}

// ---------------------------------------------------------------- array train
function ArrayTrain() {
  const marks = [45, 75, 36, 81, 60];
  const [i, setI] = useState<number | null>(3);
  const [typed, setTyped] = useState('3');
  const n = Number(typed);
  const valid = typed.trim() !== '' && Number.isInteger(n) && n >= 0 && n <= 4;
  useEffect(() => setI(valid ? n : null), [typed, valid, n]);
  return (
    <div className="train">
      <div className="train-cars" role="list">
        <div className="train-engine" aria-hidden="true">
          <span className="mono">marks</span>
        </div>
        {marks.map((m, k) => (
          <button key={k} type="button" role="listitem" className={'train-car' + (i === k ? ' is-active' : '')} onClick={() => setTyped(String(k))}>
            <span className="train-val mono">{m}</span>
            <span className="train-idx mono">[{k}]</span>
          </button>
        ))}
      </div>
      <div className="train-access">
        <label className="mono">
          marks[
          <input className="train-input mono" value={typed} onChange={(e) => setTyped(e.target.value)} inputMode="numeric" aria-label="Index" maxLength={2} />]
        </label>
        <span className={'train-result' + (valid ? '' : ' is-bad')} aria-live="polite">
          {valid ? (
            <>
              = <b className="mono">{marks[n]}</b> (the {ordinal(n + 1)} element)
            </>
          ) : (
            <>
              <X size={16} /> Index out of range — this array only has positions 0 to 4
            </>
          )}
        </span>
      </div>
      <p className="subtle">
        <code className="ic">marks : array[0..4] of integer;</code> — one name, 5 elements, each found by its index.
      </p>
    </div>
  );
}
const ordinal = (n: number) => n + (['th', 'st', 'nd', 'rd'][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10] ?? 'th');

// ---------------------------------------------------------------- procedure vs function
function ProcVsFunc() {
  const [pRun, setPRun] = useState(false);
  const [fRun, setFRun] = useState(false);
  return (
    <div className="pvf">
      <div className="pvf-col">
        <div className="pvf-machine pvf-proc">
          <div className="eyebrow">Procedure</div>
          <b className="mono">PrintMenu</b>
          <span className="subtle">does a job</span>
        </div>
        <CodeBlock code={'PrintMenu;   { just call it }'} compact />
        <button type="button" className="btn btn-sm" onClick={() => setPRun(true)}>
          <Play size={14} /> Call it
        </button>
        <pre className="pvf-screen mono">{pRun ? '1. New Game\n2. Load Game\n3. Exit' : ' '}</pre>
        <p className="subtle">Nothing comes back — it just does its job (printing).</p>
      </div>
      <div className="pvf-col">
        <div className="pvf-machine pvf-func">
          <div className="eyebrow">Function</div>
          <b className="mono">Square(n)</b>
          <span className="subtle">gives back an answer</span>
        </div>
        <CodeBlock code={'answer := Square(4);'} compact />
        <button type="button" className="btn btn-sm" onClick={() => setFRun(true)}>
          <Play size={14} /> Call it
        </button>
        <div className="pvf-return">
          <span className="mono">4</span> <ArrowRight size={16} /> <span className="pvf-box mono">Square</span> <ArrowRight size={16} />
          <span className={'mono pvf-ans' + (fRun ? ' pop' : '')}>{fRun ? '16' : '?'}</span>
          <ArrowRight size={16} /> <span className="mono">answer</span>
        </div>
        <p className="subtle">The value 16 comes back and is stored in <code className="ic">answer</code>.</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- language ladder
const LADDER = [
  { level: 'High-level language', ex: 'total := total + 1;', who: 'Easy for humans', pts: ['English-like words', 'Machine independent', 'Needs a compiler or interpreter'], c: 'var(--hue-green)' },
  { level: 'Assembly language', ex: 'MOV AX, total\nADD AX, 1\nMOV total, AX', who: 'Symbols (mnemonics)', pts: ['Uses short codes like MOV, ADD', 'Needs an assembler', 'Still machine dependent'], c: 'var(--hue-amber)' },
  { level: 'Machine language', ex: '10110000 00000001\n00000100 00000001', who: 'Only 0s and 1s', pts: ['CPU runs it directly — fast', 'No translator needed', 'Very hard for humans', 'Machine dependent'], c: 'var(--hue-red)' },
];
function LanguageLadder() {
  const [k, setK] = useState(0);
  return (
    <div className="ladder">
      <div className="ladder-steps">
        {LADDER.map((l, i) => (
          <button key={l.level} type="button" className={'ladder-step' + (k === i ? ' is-active' : '')} style={{ ['--c' as string]: l.c, ['--i' as string]: i } as React.CSSProperties} onClick={() => setK(i)} aria-pressed={k === i}>
            <b>{l.level}</b>
            <span className="subtle">{l.who}</span>
          </button>
        ))}
        <div className="ladder-axis subtle">
          <span>↑ Easier for humans</span>
          <span>↓ Closer to the CPU</span>
        </div>
      </div>
      <div className="ladder-detail fade-up" key={k}>
        <div className="eyebrow">Same instruction: "add 1 to total"</div>
        <pre className="ladder-code mono">{LADDER[k].ex}</pre>
        <ul>
          {LADDER[k].pts.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- compiler vs interpreter
const TPROG = ["writeln('Line 1');", "writeln('Line 2');", "writeln('Line 3)';", "writeln('Line 4');"];
function Translators() {
  const [mode, setMode] = useState<'compiler' | 'interpreter' | null>(null);
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!mode) return;
    setT(0);
    const id = setInterval(() => setT((x) => x + 1), 700);
    return () => clearInterval(id);
  }, [mode]);
  const maxT = mode === 'compiler' ? 3 : 4;
  const tt = Math.min(t, maxT);
  const lineState = (i: number): string => {
    if (!mode) return '';
    if (mode === 'compiler') {
      if (tt >= 1) return i === 2 ? (tt >= 2 ? 'is-error' : 'is-scan') : 'is-scan';
      return '';
    }
    if (i < tt && i < 2) return 'is-ran';
    if (i === 2 && tt >= 3) return 'is-error';
    if (i === tt && i <= 2) return 'is-scan';
    return '';
  };
  const output = mode === 'interpreter' ? ['Line 1', 'Line 2'].slice(0, Math.min(tt, 2)) : [];
  return (
    <div className="translators">
      <div className="row row-wrap">
        <button type="button" className={'btn btn-sm' + (mode === 'compiler' ? ' btn-primary' : '')} onClick={() => setMode('compiler')}>
          <Play size={14} /> Use a compiler
        </button>
        <button type="button" className={'btn btn-sm' + (mode === 'interpreter' ? ' btn-primary' : '')} onClick={() => setMode('interpreter')}>
          <Play size={14} /> Use an interpreter
        </button>
      </div>
      <div className="translators-grid">
        <div className="tprog">
          <div className="eyebrow">Program (line 3 has an error)</div>
          {TPROG.map((l, i) => (
            <div key={i} className={'tprog-line mono ' + lineState(i)}>
              <span className="vd-num">{i + 1}</span> {l}
            </div>
          ))}
        </div>
        <div className="tscreen">
          <div className="eyebrow">What happens</div>
          {!mode && <p className="subtle">Choose a translator to see how it handles the program.</p>}
          {mode === 'compiler' && (
            <div className="stack">
              {tt >= 1 && <p className="fade-up tline"><ScanLine size={16} aria-hidden="true" /> Translates the <b>whole program at once</b>…</p>}
              {tt >= 2 && <p className="fade-up tline tbad"><X size={16} aria-hidden="true" /> Finds the error in line 3. Compilation fails.</p>}
              {tt >= 3 && <p className="fade-up"><b>Nothing runs</b> — not even lines 1 and 2. Fix the error and compile again. Once it compiles, the machine code can run many times without translating again.</p>}
            </div>
          )}
          {mode === 'interpreter' && (
            <div className="stack">
              <pre className="tout mono">{output.join('\n') || ' '}</pre>
              {tt >= 1 && <p className="fade-up tline"><Repeat size={16} aria-hidden="true" /> Translates and runs <b>one line at a time</b>.</p>}
              {tt >= 3 && <p className="fade-up tline tbad"><X size={16} aria-hidden="true" /> Stops at line 3, but lines 1 and 2 already ran.</p>}
              {tt >= 4 && <p className="fade-up">It translates again every time you run the program.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- paradigms
function Paradigms() {
  const [k, setK] = useState<'proc' | 'decl'>('proc');
  return (
    <div className="paradigms">
      <p className="subtle">Goal: find the students with marks above 75.</p>
      <div className="segmented" role="group" aria-label="Paradigm">
        <button type="button" aria-pressed={k === 'proc'} onClick={() => setK('proc')}>
          Procedural — HOW
        </button>
        <button type="button" aria-pressed={k === 'decl'} onClick={() => setK('decl')}>
          Declarative — WHAT
        </button>
      </div>
      {k === 'proc' ? (
        <div className="paradigm-body fade-up" key="p">
          <ol className="paradigm-steps">
            <li>Start at the first student</li>
            <li>Check: are their marks &gt; 75?</li>
            <li>If yes, print their name</li>
            <li>Move to the next student</li>
            <li>Repeat until no students are left</li>
          </ol>
          <p>You tell the computer <b>every step</b> of how to do it. Pascal works this way.</p>
        </div>
      ) : (
        <div className="paradigm-body fade-up" key="d">
          <pre className="ladder-code mono">"Give me all students where marks &gt; 75"</pre>
          <p>You describe <b>what</b> you want; the system works out how. Common in databases (like SQL) and AI.</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- OOP car
function OopCar() {
  const [cars, setCars] = useState([
    { name: 'ToyotaCar', color: 'Red', brand: 'Toyota', speed: 0, fuel: 80 },
    { name: 'BMWCar', color: 'Blue', brand: 'BMW', speed: 0, fuel: 55 },
    { name: 'HondaCar', color: 'White', brand: 'Honda', speed: 0, fuel: 30 },
  ]);
  const [sel, setSel] = useState(0);
  const act = (m: 'start' | 'accelerate' | 'brake' | 'stop') =>
    setCars((cs) =>
      cs.map((c, i) => {
        if (i !== sel) return c;
        if (m === 'accelerate') return { ...c, speed: Math.min(120, c.speed + 20), fuel: Math.max(0, c.fuel - 5) };
        if (m === 'brake') return { ...c, speed: Math.max(0, c.speed - 20) };
        if (m === 'stop') return { ...c, speed: 0 };
        return c;
      }),
    );
  const c = cars[sel];
  return (
    <div className="oop">
      <div className="oop-class">
        <div className="eyebrow">Class (the blueprint)</div>
        <b className="mono">Car</b>
        <div className="oop-sec">
          <span className="subtle">Properties (data)</span>
          <span className="mono">color, brand, speed, fuelLevel</span>
        </div>
        <div className="oop-sec">
          <span className="subtle">Methods (actions)</span>
          <span className="mono">start(), stop(), accelerate(), brake()</span>
        </div>
      </div>
      <div className="oop-objects">
        <div className="eyebrow">Objects (real cars made from the blueprint)</div>
        <div className="row row-wrap">
          {cars.map((x, i) => (
            <button key={x.name} type="button" className={'oop-obj' + (sel === i ? ' is-active' : '')} onClick={() => setSel(i)} aria-pressed={sel === i}>
              <Car size={16} aria-hidden="true" /> <span className="mono">{x.name}</span>
            </button>
          ))}
        </div>
        <dl className="oop-props mono">
          <div><dt>color</dt><dd>{c.color}</dd></div>
          <div><dt>brand</dt><dd>{c.brand}</dd></div>
          <div><dt>speed</dt><dd key={c.speed} className="flash">{c.speed} km/h</dd></div>
          <div><dt>fuelLevel</dt><dd>{c.fuel}%</dd></div>
        </dl>
        <div className="row row-wrap">
          {(['accelerate', 'brake', 'stop'] as const).map((m) => (
            <button key={m} type="button" className="btn btn-sm mono" onClick={() => act(m)}>
              {m}()
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const VISUALS: Record<VisualKind, () => React.ReactElement> = {
  'program-anatomy': ProgramAnatomy,
  'data-boxes': DataBoxes,
  'variable-box': VariableBox,
  divmod: DivMod,
  'truth-table': TruthTable,
  'write-vs-writeln': WriteVsWriteln,
  'if-flow': IfFlow,
  'loop-kinds': LoopKinds,
  'while-vs-repeat': WhileVsRepeat,
  'array-train': ArrayTrain,
  'proc-vs-func': ProcVsFunc,
  'language-ladder': LanguageLadder,
  translators: Translators,
  paradigms: Paradigms,
  'oop-car': OopCar,
};
