declare global {
  interface IncomingRequestCfProperties {}
  
  interface ExecutionContext {
    waitUntil(promise: Promise<any>): void;
    passThroughOnException(): void;
  }
}

export {};
