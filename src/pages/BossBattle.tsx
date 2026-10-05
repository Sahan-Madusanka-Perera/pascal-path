import { ArrowRight, Lightbulb, Swords, Trophy } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CodeBlock } from '../components/code/CodeBlock';
import { Playground, type PlaygroundHandle } from '../components/code/Playground';
import { FocusBar } from '../components/layout/AppShell';
import { confetti } from '../components/layout/Celebrations';
import { TestResults } from '../components/questions/TestResults';
import { Icon } from '../components/ui/icons';
import { Bar } from '../components/ui/primitives';
import { inline, Rich } from '../components/ui/Rich';
import { BOSSES, UNITS } from '../content';
import { runCodeTests, type CodeCheck } from '../engine/grading';
import { bossAvailable } from '../engine/progress';
import { bossStageDone } from '../engine/rewards';
import { getState, useAppState } from '../engine/store';
import NotFound from './NotFound';

export default function BossBattle() {
  const { bossId = '' } = useParams();
  const boss = BOSSES[bossId];
  const nav = useNavigate();
  const s = useAppState();
  const [started, setStarted] = useState(false);
  const [stage, setStage] = useState(() => {
    const st = getState().bosses[bossId];
    return st && !st.done ? Math.min(st.stage, (boss?.stages.length ?? 1) - 1) : 0;
  });
  const [check, setCheck] = useState<CodeCheck | null>(null);
  const [hints, setHints] = useState(0);
  const [hit, setHit] = useState(0);
  const [won, setWon] = useState(false);
  const [showSol, setShowSol] = useState(false);
  const pg = useRef<PlaygroundHandle>(null);
  if (!boss) return <NotFound />;
  const unit = UNITS.find((u) => u.id === boss.unit)!;
  const open = bossAvailable(s, unit.id);
  const total = boss.stages.length;
  const cur = boss.stages[stage];
  const hp = won ? 0 : (total - stage) / total;
  const exit = () => nav('/challenges');

  const attack = () => {
    const code = pg.current?.getCode() ?? cur.starter;
    const c = runCodeTests(code, cur.tests, cur.requires);
    setCheck(c);
    if (c.passed) {
      setHit((h) => h + 1);
      bossStageDone(boss.id, stage, total);
      if (stage + 1 >= total) {
        setWon(true);
        confetti({ count: 220 });
      }
    }
  };
  const nextStage = () => {
    setStage(stage + 1);
    setCheck(null);
    setHints(0);
    setShowSol(false);
  };

  return (
    <div className="focus boss" style={{ ['--unit' as string]: `var(--hue-${unit.hue})` } as React.CSSProperties}>
      <FocusBar onClose={exit} label="Leave boss battle">
        <div className="boss-hp">
          <span className="boss-hp-emoji" aria-hidden="true" key={hit}>
            <span className={hit ? 'boss-hit' : ''}>
              <Icon name={boss.emoji} size={24} />
            </span>
          </span>
          <div className="boss-hp-bar">
            <div className="boss-hp-label">
              <b>{boss.title}</b> <span className="subtle">HP</span>
            </div>
            <Bar value={hp} color="var(--danger)" label="Boss health" />
          </div>
        </div>
      </FocusBar>
      <main className="focus-main focus-main-wide">
        {!started ? (
          <div className="boss-intro fade-up">
            <div className="boss-intro-icon" aria-hidden="true">
              <Icon name={boss.emoji} size={40} />
            </div>
            <h1>{boss.title}</h1>
            <p className="meta-line">
              <Swords size={14} aria-hidden="true" /> Boss battle · {unit.title}
            </p>
            <p className="page-lead">{boss.story}</p>
            <ol className="boss-stage-list">
              {boss.stages.map((st, i) => (
                <li key={i} className={i < stage || s.bosses[boss.id]?.done ? 'is-done' : ''}>
                  <span>{i + 1}</span> {st.title}
                </li>
              ))}
            </ol>
            {!open && <p className="callout callout-tip">This boss uses everything from {unit.title}. You haven't finished those lessons yet — you can still try!</p>}
            <button type="button" className="btn btn-primary btn-lg" onClick={() => setStarted(true)}>
              {stage > 0 ? `Continue from stage ${stage + 1}` : 'Start the battle'} <ArrowRight size={18} />
            </button>
          </div>
        ) : won ? (
          <div className="boss-win fade-up">
            <Trophy size={64} className="pop" aria-hidden="true" />
            <h1>{boss.title} defeated!</h1>
            <p className="page-lead">You used everything from {unit.title} to solve {total} problems. That's real programming.</p>
            <div className="row row-wrap">
              <Link to="/challenges" className="btn btn-primary btn-lg">
                More challenges
              </Link>
              <Link to="/learn" className="btn btn-lg">
                Back to the map
              </Link>
            </div>
          </div>
        ) : (
          <div className="stack boss-stage fade-up" key={stage}>
            <h1 className="lesson-title">{cur.title}</h1>
            <p className="meta-line">
              Stage {stage + 1} of {total}
            </p>
            <div className="card try-task">
              <Rich text={cur.prompt} />
            </div>
            <Playground
              ref={pg}
              initialCode={cur.starter}
              minLines={Math.max(10, cur.starter.split('\n').length + 3)}
              actions={
                check?.passed ? undefined : (
                  <button type="button" className="btn btn-sm btn-danger" onClick={attack}>
                    <Swords size={15} /> Attack! (check code)
                  </button>
                )
              }
              footer={check ? <TestResults check={check} /> : undefined}
              externalError={check?.compileError?.error ?? null}
            />
            {check?.passed ? (
              <div className="callout callout-success pop">
                <div>
                  <b className="callout-label">Direct hit</b>
                  Stage cleared. {stage + 1 < total ? 'The boss is weakening…' : ''}
                  {stage + 1 < total && (
                    <div className="boss-next">
                      <button type="button" className="btn btn-primary" onClick={nextStage}>
                        Next stage <ArrowRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="help">
                {hints > 0 && (
                  <ol className="hints">
                    {cur.hints.slice(0, hints).map((h, i) => (
                      <li key={i} className="hint fade-up">
                        <span className="hint-label">
                          <Lightbulb size={15} aria-hidden="true" /> Hint {i + 1}
                        </span>
                        <span>{inline(h)}</span>
                      </li>
                    ))}
                  </ol>
                )}
                <div className="help-row">
                  <button type="button" className="btn btn-sm" onClick={() => setHints((h) => h + 1)} disabled={hints >= cur.hints.length}>
                    <Lightbulb size={15} /> {hints >= cur.hints.length ? 'No more hints' : 'Give me a hint'}
                  </button>
                  {hints >= cur.hints.length && (
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => setShowSol(true)}>
                      Show a solution
                    </button>
                  )}
                </div>
                {showSol && (
                  <div className="reveal">
                    <span className="eyebrow">One possible solution — type it yourself to learn it</span>
                    <CodeBlock code={cur.solution} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
