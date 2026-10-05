import { ArrowLeft, ArrowRight, BookOpen, Check, Crown, Dumbbell, Lock, NotebookPen, Swords, Target } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '../components/ui/icons';
import { Bar } from '../components/ui/primitives';
import { questionsForTopic, TOPIC_ORDER, TOPICS, unitOf } from '../content';
import { isUnlocked, topicStatus, topicStrength } from '../engine/progress';
import { useAppState } from '../engine/store';
import NotFound from './NotFound';

export default function TopicPage() {
  const { topicId = '' } = useParams();
  const s = useAppState();
  const topic = TOPICS[topicId];
  if (!topic) return <NotFound />;
  const unit = unitOf(topicId);
  const status = topicStatus(s, topicId);
  const lesson = s.lessons[topicId];
  const strength = topicStrength(s, topicId);
  const check = s.checks[topicId];
  const qs = questionsForTopic(topicId);
  const challengeCount = qs.filter((q) => q.difficulty === 'challenge' || q.difficulty === 'boss').length;
  const idx = TOPIC_ORDER.indexOf(topicId);
  const prev = idx > 0 ? TOPICS[TOPIC_ORDER[idx - 1]] : null;
  const next = idx < TOPIC_ORDER.length - 1 ? TOPICS[TOPIC_ORDER[idx + 1]] : null;
  const unlocked = isUnlocked(s, topicId);
  const lessonDone = !!lesson?.done;
  const lessonPct = lessonDone ? 1 : lesson ? lesson.step / topic.lesson.length : 0;

  const stages = [
    {
      key: 'learn', icon: BookOpen, title: 'Learn', desc: `${topic.lesson.length} short steps · about ${topic.minutes} min`,
      state: lessonDone ? 'done' : lesson?.step ? 'active' : 'todo',
      meta: lessonDone ? 'Completed — "I have read this"' : lesson?.step ? `${Math.round(lessonPct * 100)}% done` : 'Start here',
      to: `/learn/${topicId}/lesson`, cta: lessonDone ? 'Review lesson' : lesson?.step ? 'Continue lesson' : 'Start lesson',
    },
    {
      key: 'practice', icon: Dumbbell, title: 'Practice', desc: 'Easy → harder questions with hints',
      state: strength.count >= 4 ? 'done' : strength.count > 0 ? 'active' : 'todo',
      meta: strength.count ? `${Math.round(strength.accuracy * 100)}% correct over ${strength.count} questions` : `${qs.length} questions in the bank`,
      to: `/practice/session?mode=topic&topic=${topicId}`, cta: strength.count ? 'Practise more' : 'Start practising',
    },
    {
      key: 'challenge', icon: Swords, title: 'Challenge', desc: 'Harder problems — think before using hints',
      state: qs.some((q) => (q.difficulty === 'challenge') && s.qstats[q.id]?.right) ? 'done' : 'todo',
      meta: `${challengeCount} challenge question${challengeCount === 1 ? '' : 's'}`,
      to: `/practice/session?mode=challenge&topic=${topicId}`, cta: 'Take the challenge',
    },
    {
      key: 'master', icon: Crown, title: 'Mastery check', desc: '5 questions · pass with 80% to master the topic',
      state: check?.passedAt ? 'done' : 'todo',
      meta: check?.passedAt ? `Mastered — "I can do this" (best ${check.best}%)` : check ? `Best so far: ${check.best}%` : 'Prove you can do it',
      to: `/practice/session?mode=check&topic=${topicId}`, cta: check?.passedAt ? 'Retake check' : 'Take mastery check',
    },
  ] as const;

  return (
    <div className="page page-narrow topic-page" style={{ ['--unit' as string]: `var(--hue-${unit.hue})` } as React.CSSProperties}>
      <Link to={`/learn#${unit.id}`} className="back-link">
        <ArrowLeft size={16} /> {unit.title}
      </Link>
      <header className="topic-hero">
        <div className="topic-hero-icon" aria-hidden="true">
          <Icon name={unit.icon} size={34} />
        </div>
        <div className="topic-hero-text">
          <h1>{topic.title}</h1>
          <p className="page-lead">{topic.short}</p>
          <div className="row row-wrap">
            <span className={'chip ' + (status === 'mastered' ? 'chip-xp' : status === 'learned' ? 'chip-easy' : '')}>
              {status === 'mastered' ? 'Mastered' : status === 'learned' ? 'Lesson done' : status === 'learning' ? 'In progress' : status === 'locked' ? 'Locked' : 'Not started'}
            </span>
            <span className="chip">{topic.source}</span>
            <span className="chip">About {topic.minutes} min</span>
          </div>
        </div>
      </header>

      {!unlocked && (
        <div className="callout callout-tip">
          <Lock size={18} className="callout-icon" aria-hidden="true" />
          <div>
            <b className="callout-label">Recommended order</b>
            This topic builds on <Link to={`/learn/${TOPIC_ORDER[idx - 1]}`}>{prev?.title}</Link>. You can still jump ahead if you already know it.
          </div>
        </div>
      )}

      <section className="card">
        <h2 className="section-h">By the end you will be able to</h2>
        <ul className="objectives">
          {topic.objectives.map((o) => (
            <li key={o}>
              <Target size={16} aria-hidden="true" /> {o}
            </li>
          ))}
        </ul>
      </section>

      <section className="stages" aria-label="Steps for this topic">
        {stages.map((st, i) => (
          <div key={st.key} className={'stage is-' + st.state}>
            <div className="stage-rail" aria-hidden="true">
              <span className="stage-dot">{st.state === 'done' ? <Check size={18} strokeWidth={3} /> : i + 1}</span>
            </div>
            <div className="stage-card card">
              <div className="stage-head">
                <st.icon size={20} aria-hidden="true" />
                <h3>{st.title}</h3>
              </div>
              <p className="muted">{st.desc}</p>
              <p className="stage-meta">{st.meta}</p>
              {st.key === 'learn' && lessonPct > 0 && lessonPct < 1 && <Bar value={lessonPct} size="sm" color="var(--unit)" label="Lesson progress" />}
              {st.key === 'practice' && strength.count > 0 && <Bar value={strength.score / 100} size="sm" color="var(--unit)" label="Topic strength" />}
              <Link to={st.to} className={'btn ' + (st.state !== 'done' && (i === 0 || stages[i - 1].state === 'done') ? 'btn-primary' : '')}>
                {st.cta} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </section>

      <Link to={`/revision/${topicId}`} className="card card-link revision-link">
        <NotebookPen size={22} aria-hidden="true" />
        <div>
          <b>Revision page</b>
          <p className="muted">The whole topic on one page — review it in 5 minutes before an exam.</p>
        </div>
        <ArrowRight size={18} aria-hidden="true" />
      </Link>

      <nav className="topic-nav" aria-label="Topics">
        {prev ? (
          <Link to={`/learn/${prev.id}`} className="btn btn-ghost">
            <ArrowLeft size={16} /> {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/learn/${next.id}`} className="btn btn-ghost">
            {next.title} <ArrowRight size={16} />
          </Link>
        )}
      </nav>
    </div>
  );
}
