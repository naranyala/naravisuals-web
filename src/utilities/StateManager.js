// Simple state management with subscriptions
const StateManager = (() => {
  return class StateManager {
    constructor(initialState = {}) {
      this.state = { ...initialState };
      this.listeners = new Map();
      this.actions = new Map();
      this.middlewares = [];
    }

    setState(newState, notify = true) {
      const prevState = { ...this.state };
      this.state = { ...this.state, ...newState };
      
      if (notify) {
        this.notifyListeners(prevState);
      }
    }

    getState() {
      return { ...this.state };
    }

    subscribe(key, callback) {
      if (!this.listeners.has(key)) {
        this.listeners.set(key, new Set());
      }
      this.listeners.get(key).add(callback);
      
      // Return unsubscribe function
      return () => {
        const keyListeners = this.listeners.get(key);
        if (keyListeners) {
          keyListeners.delete(callback);
        }
      };
    }

    notifyListeners(prevState) {
      this.listeners.forEach((callbacks, key) => {
        if (this.state[key] !== prevState[key]) {
          callbacks.forEach(callback => callback(this.state[key], prevState[key]));
        }
      });
    }

    // Action dispatcher (Redux-like)
    dispatch(action) {
      const middlewareResult = this.runMiddlewares(action);
      if (middlewareResult === false) return;

      if (this.actions.has(action.type)) {
        const newState = this.actions.get(action.type)(this.state, action.payload);
        this.setState(newState);
      }
    }

    // Register actions
    registerAction(type, reducer) {
      this.actions.set(type, reducer);
    }

    // Middleware support
    use(middleware) {
      this.middlewares.push(middleware);
    }

    runMiddlewares(action) {
      for (const middleware of this.middlewares) {
        if (middleware(action, this.state) === false) {
          return false;
        }
      }
      return true;
    }

    // Persistence
    persist(key) {
      // Load from storage
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          this.setState(JSON.parse(stored), false);
        } catch (error) {
          console.warn('Failed to load persisted state:', error);
        }
      }

      // Save on changes
      this.subscribe('*', () => {
        localStorage.setItem(key, JSON.stringify(this.state));
      });
    }

    // Dev tools integration
    enableDevTools() {
      if (window.__REDUX_DEVTOOLS_EXTENSION__) {
        const devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect();
        
        devTools.init(this.state);
        
        this.subscribe('*', () => {
          devTools.send('STATE_UPDATE', this.state);
        });
      }
    }

    // Selector support
    createSelector(selector) {
      let lastValue = selector(this.state);
      
      return (callback) => {
        return this.subscribe('*', () => {
          const newValue = selector(this.state);
          if (newValue !== lastValue) {
            lastValue = newValue;
            callback(newValue);
          }
        });
      };
    }
  };
})();
