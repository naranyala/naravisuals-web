import mitt from "mitt";

/**
 * Global Events for the Documentation Site
 */
export type AppEvents = {
  // Navigation
  "nav:navigate": { target: string; isMobile: boolean };
  "nav:resolved": { slug: string };

  // UI State
  "ui:sidebar:toggle": boolean;
  "ui:sidebar:pathChanged": { path: readonly any[] };
  "ui:toc:toggle": boolean;
  "ui:settings:toggle": boolean;
  "ui:ast:toggle": boolean;

  // Theme & Appearance
  "theme:change": { theme: string; isDark: boolean };
  "font:change": { font: string };

  // Content Lifecycle
  "mermaid:loading": boolean;
  "mermaid:rendered": { slug: string; count: number };
  "mathjax:rendered": { slug: string };

  // Search
  "search:query": string;
  "search:results": any[];
};

export interface IEventBusService {
  emit<K extends keyof AppEvents>(type: K, event: AppEvents[K]): void;
  on<K extends keyof AppEvents>(type: K, handler: (event: AppEvents[K]) => void): () => void;
  off<K extends keyof AppEvents>(type: K, handler: (event: AppEvents[K]) => void): void;
}

export const createEventBusService = (): IEventBusService => {
  const emitter = mitt<AppEvents>();

  return {
    emit: (type, event) => emitter.emit(type, event),
    on: (type, handler) => {
      emitter.on(type, handler as any);
      return () => emitter.off(type, handler as any);
    },
    off: (type, handler) => emitter.off(type, handler as any),
  };
};
