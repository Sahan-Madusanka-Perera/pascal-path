import { ArrowLeft, CalendarCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { confetti } from '../components/layout/Celebrations';
import { QuestionRunner, type QuestionOutcome } from '../components/questions/QuestionRunner';
import { completeDaily } from '../engine/rewards';
import { dailyQuestion } from '../engine/session';
import { today, useAppState } from '../engine/store';

export default function Daily() {
  const s = useAppState();
  const q = dailyQuestion();
  const already = s.daily[today()];
  const [result, setResult] = useState<QuestionOutcome | null>(null);

  const onDone = (o: QuestionOutcome) => {
    setResult(o);
    completeDaily(o.correct);
    if (o.correct) confetti();
  };

  return (
    <div className="page page-narrow daily-page">
      <Link to="/challenges" className="back-link">
        <ArrowLeft size={16} /> Challenges
      </Link>
      <header className="page-header">
        <div className="page-header-text">
          <h1>Today's challenge</h1>
          <p className="meta-line">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <p className="page-lead">One problem a day. Everyone gets the same one — think it through before using hints.</p>
        </div>
      </header>
      {already !== undefined || result ? (
        <div className="card daily-done">
          <CalendarCheck size={40} aria-hidden="true" />
          <h2>{(result?.correct ?? already) ? 'Challenge complete! +50 XP' : "You've had a go today"}</h2>
          <p className="muted">A new challenge appears tomorrow. Keep your streak going with some practice.</p>
          <div className="row row-wrap">
            <Link to="/practice" className="btn btn-primary">
              Keep practising
            </Link>
            <Link to="/challenges" className="btn">
              More challenges
            </Link>
          </div>
        </div>
      ) : (
        <QuestionRunner q={q} mode="daily" onDone={onDone} inlineFooter continueLabel="Finish" />
      )}
    </div>
  );
}
