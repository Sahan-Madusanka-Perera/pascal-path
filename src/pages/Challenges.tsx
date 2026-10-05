import { ArrowRight, CalendarCheck, Lock, Sparkles, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TYPE_LABEL } from '../components/questions/QuestionRunner';
import { Icon } from '../components/ui/icons';
import { PageHeader } from '../components/ui/primitives';
import { BOSSES, TOPICS, UNITS } from '../content';
import { ACHIEVEMENTS } from '../engine/achievements';
import { bossAvailable } from '../engine/progress';
import { dailyQuestion } from '../engine/session';
import { today, useAppState } from '../engine/store';

export const GAMES = [
  { id: 'debug-race', icon: 'flag', title: 'Debugging Race', text: 'Find the bug before the clock runs out. 60 seconds.', skill: 'Debugging' },
  { id: 'output-predictor', icon: 'telescope', title: 'Output Predictor', text: 'Read the code, predict what it prints. Gets harder as you go.', skill: 'Tracing' },
  { id: 'code-builder', icon: 'blocks', title: 'Code Builder', text: 'Snap the lines of code into the right order.', skill: 'Structure' },
  { id: 'memory', icon: 'brain', title: 'Memory Challenge', text: 'Watch the assignments, then remember the final values.', skill: 'Variables' },
  { id: 'logic', icon: 'toggle', title: 'Logic Rush', text: 'TRUE or FALSE? Quick-fire conditions with and, or, not.', skill: 'Conditions' },
] as const;

export default function Challenges() {
  const s = useAppState();
  const dq = dailyQuestion();
  const dailyDone = s.daily[today()] !== undefined;
  const earned = Object.keys(s.achievements).length;
  const date = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="page challenges">
      <PageHeader title="Test yourself" lead="A new challenge every day, boss battles that combine everything in a unit, and quick games to sharpen your skills." />

      <Link to="/challenges/daily" className={'daily' + (dailyDone ? ' is-done' : '')}>
        <span className="daily-icon" aria-hidden="true">
          {dailyDone ? <CalendarCheck size={26} /> : <Sparkles size={26} />}
        </span>
        <span className="daily-text">
          <b className="daily-title">{dailyDone ? (s.daily[today()] ? "Today's challenge: done" : "Today's challenge: attempted") : `Today's challenge · ${TYPE_LABEL[dq.type]}`}</b>
          <span className="muted">
            {dailyDone ? 'A new one appears tomorrow.' : `${date} · ${TOPICS[dq.topic]?.title} · ${dq.difficulty === 'challenge' ? 'Challenge' : 'Practice'} level · +50 XP`}
          </span>
        </span>
        {!dailyDone && (
          <span className="btn btn-primary">
            Play <ArrowRight size={16} />
          </span>
        )}
      </Link>

      <section>
        <div className="section-title">
          <h2 className="section-h">Boss battles</h2>
          <span className="subtle">
            {Object.values(s.bosses).filter((b) => b.done).length} of {Object.keys(BOSSES).length} defeated
          </span>
        </div>
        <div className="boss-grid">
          {UNITS.filter((u) => u.boss && BOSSES[u.boss]).map((u) => {
            const b = BOSSES[u.boss!];
            const open = bossAvailable(s, u.id);
            const st = s.bosses[b.id];
            return (
              <Link
                key={b.id}
                to={`/challenges/boss/${b.id}`}
                className={'boss-card' + (st?.done ? ' is-done' : open ? '' : ' is-locked')}
                style={{ ['--unit' as string]: `var(--hue-${u.hue})` } as React.CSSProperties}
              >
                <span className="boss-card-icon" aria-hidden="true">
                  {st?.done ? <Trophy size={22} /> : <Icon name={b.emoji} size={22} />}
                </span>
                <span className="boss-card-body">
                  <b>{b.title}</b>
                  <span className="boss-card-meta">
                    {u.title} ·{' '}
                    {st?.done ? (
                      'Defeated'
                    ) : open ? (
                      st?.stage ? `Stage ${st.stage + 1} of ${b.stages.length}` : `${b.stages.length} stages`
                    ) : (
                      <>
                        <Lock size={11} aria-hidden="true" /> finish the unit first
                      </>
                    )}
                  </span>
                  <span className="muted boss-card-story">{b.story}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="section-h">Mini games</h2>
        <div className="rec-list">
          {GAMES.map((g) => (
            <Link key={g.id} to={`/games/${g.id}`} className="rec game-row">
              <span className="rec-icon">
                <Icon name={g.icon} size={19} />
              </span>
              <span className="rec-text">
                <b>{g.title}</b>
                <span className="muted">{g.text}</span>
              </span>
              <span className="game-row-meta">
                <span className="chip">{g.skill}</span>
                {s.games[g.id] && <span className="chip chip-xp">Best {s.games[g.id].best}</span>}
              </span>
              <ArrowRight size={18} className="rec-arrow" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <div className="rec-list">
        <Link to="/progress#achievements" className="rec">
          <span className="rec-icon">
            <Trophy size={19} aria-hidden="true" />
          </span>
          <span className="rec-text">
            <b>Achievements</b>
            <span className="muted">
              {earned} of {ACHIEVEMENTS.length} unlocked
            </span>
          </span>
          <ArrowRight size={18} className="rec-arrow" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
