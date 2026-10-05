import { Eye, Play, RotateCcw, Square, Trash2 } from 'lucide-react';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type ReactNode } from 'react';
import { recordRun, recordVisualise } from '../../engine/rewards';
import { t } from '../../i18n';
import { runAsync, type PascalErrorData, type PascalWarning, type RunResult, type Segment } from '../../pascal';
import { CodeEditor, type CodeEditorHandle } from './CodeEditor';
import { Console } from './Console';
import { ErrorCard, WarningList } from './ErrorCard';
import { Visualizer } from './Visualizer';

export interface PlaygroundHandle {
  getCode: () => string;
  setCode: (c: string) => void;
  showLine: (line: number) => void;
}

interface Props {
  initialCode: string;
  /** Code restored by the Reset button (defaults to initialCode). */
  resetCode?: string;
  presetInputs?: string[];
  onCodeChange?: (code: string) => void;
  minLines?: number;
  lab?: boolean;
  layout?: 'stack' | 'split';
  /** Extra buttons placed in the toolbar (e.g. "Check my code"). */
  actions?: ReactNode;
  /** Shown below the console (e.g. test results). */
  footer?: ReactNode;
  editorLabel?: string;
  consoleMinHeight?: number;
  /** Error line from an external check (e.g. test compile). */
  externalError?: PascalErrorData | null;
}

type Status = 'idle' | 'running' | 'done' | 'error' | 'stopped';

export const Playground = forwardRef<PlaygroundHandle, Props>(function Playground(
  { initialCode, resetCode, presetInputs, onCodeChange, minLines = 10, lab, layout = 'stack', actions, footer, editorLabel, consoleMinHeight, externalError },
  ref,
) {
  const [code, setCodeState] = useState(initialCode);
  const [status, setStatus] = useState<Status>('idle');
  const [segments, setSegments] = useState<Segment[]>([]);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<PascalErrorData | null>(null);
  const [warnings, setWarnings] = useState<PascalWarning[]>([]);
  const [lastRun, setLastRun] = useState<{ code: string; result: RunResult } | null>(null);
  const [showViz, setShowViz] = useState(false);
  const editor = useRef<CodeEditorHandle>(null);
  const stopRef = useRef(false);
  const inputResolver = useRef<((v: string | null) => void) | null>(null);
  const buffer = useRef<Segment[]>([]);
  const flushScheduled = useRef(false);

  const setCode = useCallback(
    (c: string) => {
      setCodeState(c);
      onCodeChange?.(c);
    },
    [onCodeChange],
  );

  useImperativeHandle(ref, () => ({
    getCode: () => code,
    setCode: (c) => setCode(c),
    showLine: (line) => editor.current?.focusLine(line),
  }));

  useEffect(() => {
    setCodeState(initialCode);
  }, [initialCode]);

  useEffect(
    () => () => {
      stopRef.current = true;
      inputResolver.current?.(null);
    },
    [],
  );

  const flush = () => {
    flushScheduled.current = false;
    setSegments([...buffer.current.map((s) => ({ ...s }))]);
  };
  const push = (seg: Segment) => {
    const b = buffer.current;
    const lastSeg = b[b.length - 1];
    if (lastSeg && lastSeg.kind === seg.kind && seg.kind === 'out') lastSeg.text += seg.text;
    else b.push({ ...seg });
    if (!flushScheduled.current) {
      flushScheduled.current = true;
      requestAnimationFrame(flush);
    }
  };

  const run = async () => {
    if (status === 'running') return;
    stopRef.current = false;
    buffer.current = [];
    setSegments([]);
    setError(null);
    setWarnings([]);
    setShowViz(false);
    setStatus('running');
    const src = code;
    const result = await runAsync(src, {
      inputs: presetInputs,
      trace: true,
      traceLimit: 1500,
      onOutput: (text) => push({ kind: 'out', text }),
      onEcho: (line) => push({ kind: 'in', text: line + '\n' }),
      onClear: () => {
        buffer.current = [];
        setSegments([]);
      },
      onInput: () =>
        new Promise<string | null>((resolve) => {
          flush();
          setWaiting(true);
          inputResolver.current = (v) => {
            inputResolver.current = null;
            setWaiting(false);
            resolve(v);
          };
        }),
      shouldStop: () => stopRef.current,
    });
    flush();
    setWaiting(false);
    setLastRun({ code: src, result });
    setWarnings(result.warnings);
    if (result.status === 'ok') setStatus('done');
    else if (result.status === 'stopped') setStatus('stopped');
    else {
      setStatus('error');
      setError(result.error ?? null);
    }
    recordRun({ lab: !!lab, ok: result.status === 'ok' });
  };

  const stop = () => {
    stopRef.current = true;
    inputResolver.current?.(null);
  };

  const reset = () => {
    stop();
    setCode(resetCode ?? initialCode);
    buffer.current = [];
    setSegments([]);
    setError(null);
    setWarnings([]);
    setStatus('idle');
    setLastRun(null);
    setShowViz(false);
  };

  const clearOutput = () => {
    buffer.current = [];
    setSegments([]);
    setError(null);
    setWarnings([]);
    if (status !== 'running') setStatus('idle');
  };

  const canVisualise = !!lastRun && lastRun.code === code && lastRun.result.trace.length > 1 && status !== 'running';
  const shownError = error ?? externalError ?? null;
  const errorLine = shownError && shownError.line > 0 && shownError.code !== 'R_STOPPED' ? shownError.line : undefined;

  const openViz = () => {
    setShowViz(true);
    recordVisualise();
  };

  return (
    <div className={'playground playground-' + layout}>
      <div className="playground-toolbar">
        {status === 'running' ? (
          <button type="button" className="btn btn-danger btn-sm" onClick={stop}>
            <Square size={14} fill="currentColor" /> {t('code.stop')}
          </button>
        ) : (
          <button type="button" className="btn btn-primary btn-sm" onClick={run} aria-keyshortcuts="Control+Enter">
            <Play size={15} fill="currentColor" /> {t('code.run')}
          </button>
        )}
        <button
          type="button"
          className="btn btn-sm"
          onClick={openViz}
          disabled={!canVisualise}
          title={canVisualise ? 'Watch your program run step by step' : 'Run your program first'}
        >
          <Eye size={16} /> <span className="hide-sm">{t('code.show')}</span>
          <span className="show-sm">Steps</span>
        </button>
        {actions}
        <span className="spacer" />
        <button type="button" className="icon-btn" onClick={clearOutput} aria-label={t('code.clear')} title={t('code.clear')}>
          <Trash2 size={17} />
        </button>
        <button type="button" className="icon-btn" onClick={reset} aria-label={t('code.reset')} title="Reset code">
          <RotateCcw size={17} />
        </button>
      </div>
      <div className="playground-body">
        <div className="playground-editor">
          <CodeEditor ref={editor} value={code} onChange={setCode} onRun={run} errorLine={errorLine} minLines={minLines} label={editorLabel} />
        </div>
        <div className="playground-output">
          <Console
            segments={segments}
            waiting={waiting}
            onSubmit={(l) => inputResolver.current?.(l)}
            status={status}
            minHeight={consoleMinHeight}
          />
          {shownError && <ErrorCard error={shownError} onShowLine={(l) => editor.current?.focusLine(l)} />}
          {status === 'stopped' && !shownError && <p className="subtle playground-note">Program stopped.</p>}
          <WarningList warnings={warnings} />
          {footer}
        </div>
      </div>
      {showViz && lastRun && (
        <div className="viz-modal" role="dialog" aria-modal="true" aria-label="Show me what happened">
          <div className="viz-modal-inner">
            <Visualizer code={lastRun.code} trace={lastRun.result.trace} output={lastRun.result.output} truncated={lastRun.result.traceTruncated} onClose={() => setShowViz(false)} />
          </div>
        </div>
      )}
    </div>
  );
});
