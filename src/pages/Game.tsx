import { Check, Heart, Play, RotateCcw, Timer, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CodeBlock } from '../components/code/CodeBlock';
import { FocusBar } from '../components/layout/AppShell';
import { confetti } from '../components/layout/Celebrations';
import { QuestionView } from '../components/questions/QuestionView';
import { Icon } from '../components/ui/icons';
import { inline } from '../components/ui/Rich';
import { ALL_QUESTIONS } from '../content';
import type { ArrangeQ, SpotQ } from '../content/types';
import { genLogic, genMemory, genOutputQuestion, type GenMCQ, type LogicQ, type MemoryQ } from '../engine/generators';
import { grade, type Answer } from '../engine/grading';
import { recordGame } from '../engine/rewards';
import { shuffle } from '../engine/session';
import { useAppState } from '../engine/store';
import { GAMES } from './Challenges';
import NotFound from './NotFound';

type Phase = 'intro' | 'play' | 'over';

const RULES: Record<string, string[]> = {
  'debug-race': ['Each program has exactly one bug.', 'Tap the line with the bug.', 'Correct: +1 point. Wrong: −5 seconds.', 'You have 60 seconds.'],
  'output-predictor': ['Read the program and choose what it prints.', 'Questions get harder as you score.', 'You have 90 seconds.'],
  'code-builder': ['Tap code blocks to build each program in the right order.', 'Press Check when you think it is right.', 'Solve as many as you can in 2 minutes.'],
  memory: ['Watch the assignment statements one at a time.', 'Then answer: what is the final value?', 'You have 3 lives. Each round gets longer.'],
  logic: ['You will see values for x and y and a condition.', 'Decide: is the condition TRUE or FALSE?', 'Keys: T = TRUE, F = FALSE. Wrong answers cost 3 seconds.', 'You have 60 seconds.'],
};

export default function Game() {
  const { gameId = '' } = useParams();
  const game = GAMES.find((g) => g.id === gameId);
  const nav = useNavigate();
  const s = useAppState();
  const [phase, setPhase] = useState<Phase>('intro');
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [round, setRound] = useState(0);
  if (!game) return <NotFound />;
  const best = s.games[game.id]?.best ?? 0;

  const end = (finalScore: number) => {
    setScore(finalScore);
    const earned = Math.min(40, finalScore * 4);
    setXp(earned);
    recordGame(game.id, finalScore, earned);
    if (finalScore > best && finalScore > 0) confetti({ count: 120 });
    setPhase('over');
  };

  return (
    <div className="focus game">
      <FocusBar onClose={() => nav('/challenges')} label="Leave game">
        <span className="game-title">
          <Icon name={game.icon} size={18} /> {game.title}
        </span>
      </FocusBar>
      <main className="focus-main">
        {phase === 'intro' && (
          <div className="game-intro fade-up">
            <div className="game-intro-icon" aria-hidden="true">
              <Icon name={game.icon} size={34} />
            </div>
            <h1>{game.title}</h1>
            <ul className="game-rules">
              {RULES[game.id].map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            {best > 0 && <p className="chip chip-xp">Your best: {best}</p>}
            <button type="button" className="btn btn-primary btn-lg" onClick={() => { setRound((r) => r + 1); setPhase('play'); }}>
              <Play size={18} /> Start
            </button>
          </div>
        )}
        {phase === 'play' && (
          <div key={round}>
            {game.id === 'debug-race' && <DebugRace onEnd={end} />}
            {game.id === 'output-predictor' && <OutputPredictor onEnd={end} />}
            {game.id === 'code-builder' && <CodeBuilder onEnd={end} />}
            {game.id === 'memory' && <Memory onEnd={end} />}
            {game.id === 'logic' && <Logic onEnd={end} />}
          </div>
        )}
        {phase === 'over' && (
          <div className="game-over fade-up">
            <div className="game-score pop">{score}</div>
            <p className="page-lead">{score > best && score > 0 ? 'New personal best!' : score >= best && best > 0 ? 'You matched your best!' : `Your best is ${Math.max(best, score)}.`}</p>
            {xp > 0 && <span className="chip chip-xp">+{xp} XP</span>}
            <div className="row row-wrap">
              <button type="button" className="btn btn-primary btn-lg" onClick={() => { setRound((r) => r + 1); setPhase('play'); }}>
                <RotateCcw size={18} /> Play again
              </button>
              <Link to="/challenges" className="btn btn-lg">
                Other games
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function useCountdown(seconds: number, onEnd: () => void) {
  const [left, setLeft] = useState(seconds);
  const ended = useRef(false);
  const endRef = useRef(onEnd);
  endRef.current = onEnd;
  useEffect(() => {
    const id = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (left <= 0 && !ended.current) {
      ended.current = true;
      endRef.current();
    }
  }, [left]);
  const penalty = useCallback((n: number) => setLeft((l) => l - n), []);
  return { left: Math.max(0, left), penalty };
}

function Hud({ left, score, lives }: { left?: number; score: number; lives?: number }) {
  return (
    <div className="hud">
      {left !== undefined && (
        <span className={'hud-pill' + (left <= 10 ? ' is-urgent' : '')}>
          <Timer size={16} aria-hidden="true" /> {left}s
        </span>
      )}
      {lives !== undefined && (
        <span className="hud-pill" aria-label={`${lives} lives`}>
          {Array.from({ length: 3 }, (_, i) => (
            <Heart key={i} size={16} fill={i < lives ? 'currentColor' : 'none'} className="hud-heart" aria-hidden="true" />
          ))}
        </span>
      )}
      <span className="hud-pill hud-score">Score {score}</span>
    </div>
  );
}

// ---------------------------------------------------------------- Debugging race
function DebugRace({ onEnd }: { onEnd: (s: number) => void }) {
  const pool = useMemo(() => shuffle(ALL_QUESTIONS.filter((q): q is SpotQ => q.type === 'spot')), []);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [flash, setFlash] = useState<{ line: number; ok: boolean } | null>(null);
  const scoreRef = useRef(0);
  const { left, penalty } = useCountdown(60, () => onEnd(scoreRef.current));
  const q = pool[i % pool.length];
  const tap = (line: number) => {
    if (flash) return;
    const ok = q.lines.includes(line);
    setFlash({ line, ok });
    if (ok) {
      scoreRef.current++;
      setScore(scoreRef.current);
    } else penalty(5);
    setTimeout(() => {
      setFlash(null);
      setI((x) => x + 1);
    }, ok ? 450 : 1100);
  };
  const marks: Record<number, 'good' | 'bad'> = {};
  if (flash) {
    marks[flash.line] = flash.ok ? 'good' : 'bad';
    if (!flash.ok) q.lines.forEach((l) => (marks[l] = 'good'));
  }
  return (
    <div className="stack">
      <Hud left={left} score={score} />
      <p className="game-prompt">{inline(q.prompt.split('\n')[0])}</p>
      <div className={flash && !flash.ok ? 'shake-once' : ''}>
        <CodeBlock code={q.code} marks={marks} onLineClick={tap} />
      </div>
      {flash && !flash.ok && <p className="subtle">{inline(q.explanation)}</p>}
    </div>
  );
}

// ---------------------------------------------------------------- Output predictor
function OutputPredictor({ onEnd }: { onEnd: (s: number) => void }) {
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [q, setQ] = useState<GenMCQ>(() => genOutputQuestion(Math.random, 0));
  const [picked, setPicked] = useState<string | null>(null);
  const { left } = useCountdown(90, () => onEnd(scoreRef.current));
  const choose = (o: string) => {
    if (picked) return;
    setPicked(o);
    const ok = o === q.answer;
    if (ok) {
      scoreRef.current++;
      setScore(scoreRef.current);
    }
    setTimeout(() => {
      setPicked(null);
      setQ(genOutputQuestion(Math.random, Math.floor(scoreRef.current / 2)));
    }, ok ? 500 : 1800);
  };
  return (
    <div className="stack">
      <Hud left={left} score={score} />
      <p className="game-prompt">What does this print?</p>
      <CodeBlock code={q.code} />
      <div className="options options-2">
        {q.options.map((o) => {
          const state = picked ? (o === q.answer ? ' is-correct' : o === picked ? ' is-wrong' : '') : '';
          return (
            <button key={o} type="button" className={'option' + state} onClick={() => choose(o)} disabled={!!picked && !state}>
              <span className="option-text mono pre">{o}</span>
            </button>
          );
        })}
      </div>
      {picked && picked !== q.answer && <p className="subtle fade-up">{q.explain}</p>}
    </div>
  );
}

// ---------------------------------------------------------------- Code builder
function CodeBuilder({ onEnd }: { onEnd: (s: number) => void }) {
  const pool = useMemo(() => shuffle(ALL_QUESTIONS.filter((q): q is ArrangeQ => q.type === 'arrange')), []);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [wrong, setWrong] = useState(0);
  const [ok, setOk] = useState(false);
  const { left, penalty } = useCountdown(120, () => onEnd(scoreRef.current));
  const q = pool[i % pool.length];
  const check = () => {
    if (!answer) return;
    const g = grade(q, answer);
    if (g.correct) {
      scoreRef.current++;
      setScore(scoreRef.current);
      setOk(true);
      setTimeout(() => {
        setOk(false);
        setAnswer(null);
        setI((x) => x + 1);
      }, 600);
    } else {
      setWrong((w) => w + 1);
      penalty(5);
    }
  };
  return (
    <div className="stack">
      <Hud left={left} score={score} />
      <div key={`${i}-${wrong}`} className={wrong ? 'shake-once' : ''}>
        <QuestionView q={q} resetKey={i} onAnswer={setAnswer} locked={ok} />
      </div>
      <div className="row">
        <span className="spacer" />
        {ok && (
          <span className="chip chip-easy pop">
            <Check size={14} /> Correct!
          </span>
        )}
        <button type="button" className="btn btn-primary" onClick={check} disabled={!answer || ok}>
          Check
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => { setAnswer(null); setI((x) => x + 1); }}>
          Skip
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Memory
function Memory({ onEnd }: { onEnd: (s: number) => void }) {
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [q, setQ] = useState<MemoryQ>(() => genMemory(Math.random, 0));
  const [shown, setShown] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const asking = shown > q.steps.length;
  useEffect(() => {
    if (asking) return;
    const id = setTimeout(() => setShown((x) => x + 1), shown === 0 ? 600 : 1400);
    return () => clearTimeout(id);
  }, [shown, asking]);
  const choose = (o: string) => {
    if (picked) return;
    setPicked(o);
    const ok = o === q.answer;
    const nextLives = ok ? lives : lives - 1;
    const nextScore = ok ? score + 1 : score;
    setScore(nextScore);
    setLives(nextLives);
    setTimeout(() => {
      if (nextLives <= 0) return onEnd(nextScore);
      const nl = ok ? level + 1 : level;
      setLevel(nl);
      setQ(genMemory(Math.random, nl));
      setShown(0);
      setPicked(null);
    }, ok ? 700 : 2000);
  };
  return (
    <div className="stack">
      <Hud score={score} lives={lives} />
      {!asking ? (
        <div className="memory-stage">
          <p className="subtle">Remember the values… (round {level + 1})</p>
          <div className="memory-lines">
            {q.steps.slice(0, shown).map((st, k) => (
              <div key={k} className={'mono memory-line fade-up' + (k === shown - 1 ? ' is-now' : ' is-old')}>
                {k === shown - 1 ? st : '••••••••'}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="stack fade-up">
          <p className="game-prompt">
            After all the statements, what is the value of <code className="ic">{q.ask}</code>?
          </p>
          <div className="options options-2">
            {q.options.map((o) => {
              const state = picked ? (o === q.answer ? ' is-correct' : o === picked ? ' is-wrong' : '') : '';
              return (
                <button key={o} type="button" className={'option' + state} onClick={() => choose(o)} disabled={!!picked && !state}>
                  <span className="option-text mono">{o}</span>
                </button>
              );
            })}
          </div>
          {picked && picked !== q.answer && <CodeBlock code={q.steps.join('\n')} compact title="The statements were" />}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Logic rush
function Logic({ onEnd }: { onEnd: (s: number) => void }) {
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [q, setQ] = useState<LogicQ>(() => genLogic(Math.random, 0));
  const [fb, setFb] = useState<boolean | null>(null);
  const { left, penalty } = useCountdown(60, () => onEnd(scoreRef.current));
  const answer = useCallback(
    (v: boolean) => {
      if (fb !== null) return;
      const ok = v === q.answer;
      setFb(ok);
      if (ok) {
        scoreRef.current++;
        setScore(scoreRef.current);
      } else penalty(3);
      setTimeout(() => {
        setFb(null);
        setQ(genLogic(Math.random, Math.floor(scoreRef.current / 3)));
      }, ok ? 300 : 1200);
    },
    [fb, q, penalty],
  );
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 't' || e.key === 'T' || e.key === 'ArrowLeft') answer(true);
      if (e.key === 'f' || e.key === 'F' || e.key === 'ArrowRight') answer(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answer]);
  return (
    <div className="stack logic-game">
      <Hud left={left} score={score} />
      <div className="logic-vars">
        {Object.entries(q.vars).map(([k, v]) => (
          <span key={k} className="logic-var mono">
            {k} = <b>{String(v)}</b>
          </span>
        ))}
      </div>
      <div className={'logic-expr mono' + (fb === true ? ' is-ok' : fb === false ? ' is-bad shake-once' : '')}>{q.expr}</div>
      {fb === false && <p className="subtle center">It was {q.answer ? 'TRUE' : 'FALSE'}.</p>}
      <div className="logic-buttons">
        <button type="button" className="btn btn-success btn-lg" onClick={() => answer(true)}>
          <Check size={20} /> TRUE <span className="kbd">T</span>
        </button>
        <button type="button" className="btn btn-danger btn-lg" onClick={() => answer(false)}>
          <X size={20} /> FALSE <span className="kbd">F</span>
        </button>
      </div>
    </div>
  );
}
