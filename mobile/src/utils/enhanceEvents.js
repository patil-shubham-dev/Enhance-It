// Simple event emitter for cross-tab communication
// Emits when a new enhancement is saved so History can auto-refresh

const listeners = new Set();

export const enhanceEvents = {
  emit: () => {
    listeners.forEach((fn) => {
      try {
        fn();
      } catch (_) {}
    });
  },
  on: (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
