export { compile, runSync, runAsync } from './runner';
export type { RunResult, RunOptions, Snapshot, FrameView, VarView, Segment, CompileResult } from './runner';
export { explainError, PascalError } from './errors';
export type { PascalErrorData, PascalWarning, FriendlyError } from './errors';
export type { Note } from './interpreter';
