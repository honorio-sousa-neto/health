export class WorkflowError extends Error {
  constructor(message: string, public statusCode = 409) { super(message); }
}
