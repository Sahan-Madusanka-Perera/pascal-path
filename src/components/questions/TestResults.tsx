import { CheckCircle2, ListChecks, XCircle } from 'lucide-react';
import type { CodeCheck } from '../../engine/grading';
import { explainError } from '../../pascal';
import { inline } from '../ui/Rich';

export function TestResults({ check, compact }: { check: CodeCheck; compact?: boolean }) {
  if (check.compileError) {
    if (!compact) return null; // the editor's error card already shows it
    const f = check.compileError.error ? explainError(check.compileError.error) : null;
    return (
      <div className="tests tests-fail">
        <div className="tests-head">
          <XCircle size={18} /> The program doesn't run yet{f ? `: ${f.title}` : ''}
          {check.compileError.error?.line ? ` (line ${check.compileError.error.line})` : ''}
        </div>
      </div>
    );
  }
  const passed = check.results.filter((r) => r.passed).length;
  const total = check.results.length;
  const allOk = check.passed;
  return (
    <div className={'tests ' + (allOk ? 'tests-pass' : 'tests-fail')} aria-live="polite">
      <div className="tests-head">
        <ListChecks size={18} aria-hidden="true" />
        {allOk ? 'All tests passed!' : check.failedRequirement && passed === total ? 'Tests passed, but one thing is missing' : `${passed} of ${total} test${total === 1 ? '' : 's'} passed`}
      </div>
      {check.failedRequirement && passed === total && <p className="tests-req">{inline(check.failedRequirement.message)}</p>}
      {!compact && (
        <div className="tests-list">
          {check.results.map((r, i) => {
            const err = r.run.error && r.run.status !== 'compile-error' ? explainError(r.run.error) : null;
            return (
              <details key={i} className={'test ' + (r.passed ? 'is-pass' : 'is-fail')} open={!r.passed && i === check.results.findIndex((x) => !x.passed)}>
                <summary>
                  {r.passed ? <CheckCircle2 size={16} aria-label="passed" /> : <XCircle size={16} aria-label="failed" />}
                  <span>
                    Test {i + 1}
                    {r.test.inputs?.length ? <span className="subtle"> · input {r.test.inputs.join(', ')}</span> : null}
                  </span>
                </summary>
                <div className="test-body">
                  {err ? (
                    <p>
                      <b>{err.title}</b> — {inline(err.explanation)}
                    </p>
                  ) : (
                    <>
                      {r.missing && (
                        <p>
                          Expected to see <code className="ic">{r.missing}</code> in the output{r.test.exact !== undefined ? ' (exactly)' : ''}, but it wasn't there.
                        </p>
                      )}
                      {r.unwanted && (
                        <p>
                          The output shouldn't contain <code className="ic">{r.unwanted}</code>.
                        </p>
                      )}
                    </>
                  )}
                  <div className="test-out">
                    <span className="eyebrow">Your output</span>
                    <pre>{r.output || '(nothing printed)'}</pre>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
