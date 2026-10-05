import { ArrowRight, Crown, Eye, RefreshCw, Shuffle, Swords, Target } from 'lucide-react';
import { Icon } from '../components/ui/icons';
import { Link } from 'react-router-dom';
import { Bar, PageHeader } from '../components/ui/primitives';
import { questionsForTopic, TOPICS, UNITS } from '../content';
import { dueForReview, topicStatus, topicStrength, weakAreas } from '../engine/progress';
import { useAppState } from '../engine/store';

export default function PracticeHub() {
  const s = useAppState();
  const weak = weakAreas(s);
  const due = dueForReview(s);
  const learnedCount = Object.values(s.lessons).filter((l) => l.done).length;

  const modes = [
    { to: '/practice/session?mode=random', icon: Shuffle, title: 'Random practice', text: `8 mixed questions from ${learnedCount ? 'topics you have learned' : 'the first topics'}.`, tone: 'primary' },
    {
      to: weak.length ? `/practice/session?mode=weak&topic=${weak[0].topicId}` : '/practice/session?mode=weak',
      icon: Target,
      title: 'Weak areas',
      text: weak.length ? `Focus on ${weak.slice(0, 2).map((w) => TOPICS[w.topicId].title).join(' and ')}, starting with easier questions.` : 'No weak areas found yet — nice! This will adapt as you practise.',
      tone: 'streak',
    },
    { to: '/practice/session?mode=review', icon: RefreshCw, title: 'Smart review', text: due.length ? `${due.length} topic${due.length > 1 ? 's' : ''} due for review, plus questions you missed before.` : 'Revisit questions you got wrong so they stick.', tone: 'info' },
    { to: '/practice/session?mode=challenge', icon: Swords, title: 'Challenge mode', text: 'Harder problems that combine ideas. Think first, hint later!', tone: 'danger' },
    { to: '/practice/session?mode=output', icon: Eye, title: 'Predict the output', text: 'Read code and work out exactly what it prints — a classic exam skill.', tone: 'xp' },
  ];

  return (
    <div className="page practice">
      <PageHeader title="Practice makes programmers" lead="Questions adapt to you: ones you miss come back, and weak topics get extra attention." />

      <section className="rec-list">
        {modes.map((m) => (
          <Link key={m.title} to={m.to} className={'rec tone-' + m.tone}>
            <span className="rec-icon">
              <m.icon size={19} aria-hidden="true" />
            </span>
            <span className="rec-text">
              <b>{m.title}</b>
              <span className="muted">{m.text}</span>
            </span>
            <ArrowRight size={18} className="rec-arrow" aria-hidden="true" />
          </Link>
        ))}
      </section>

      <section>
        <div className="section-title">
          <h2 className="section-h">Practice by topic</h2>
          <span className="subtle">Strength = what you can actually do</span>
        </div>
        <div className="topic-table">
          {UNITS.filter((u) => u.topics.length).map((u) => (
            <div key={u.id} className="topic-group" style={{ ['--unit' as string]: `var(--hue-${u.hue})` } as React.CSSProperties}>
              <div className="topic-group-head">
                <Icon name={u.icon} size={18} className="unit-inline-icon" /> {u.title}
              </div>
              {u.topics.map((tid) => {
                const tp = TOPICS[tid];
                const st = topicStrength(s, tid);
                const status = topicStatus(s, tid);
                const n = questionsForTopic(tid).length;
                return (
                  <div key={tid} className="topic-row">
                    <Link to={`/learn/${tid}`} className="topic-row-name">
                      <b>{tp.title}</b>
                      <span className="subtle">
                        {n} questions{status === 'mastered' ? ' · mastered' : status === 'learned' ? ' · lesson done' : ''}
                      </span>
                    </Link>
                    <div className="topic-row-bar">
                      <Bar value={st.score / 100} size="sm" color="var(--unit)" label={`${tp.title} strength`} />
                      <span className="subtle">{st.score}%</span>
                    </div>
                    <div className="topic-row-actions">
                      <Link to={`/practice/session?mode=topic&topic=${tid}`} className="btn btn-sm">
                        Practise
                      </Link>
                      <Link to={`/practice/session?mode=check&topic=${tid}`} className="btn btn-sm btn-ghost" aria-label={`Mastery check for ${tp.title}`}>
                        <Crown size={15} /> <span className="hide-sm">Check</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
