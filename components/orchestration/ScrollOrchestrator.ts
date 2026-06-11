export type ScrollOrchestratorState = {
  progress: number;
  direction: 1 | -1;
  velocity: number;
};

export type ScrollSubscription = (state: ScrollOrchestratorState) => void;

export type ScrollOrchestrator = {
  getState(): ScrollOrchestratorState;
  update(progress: number, direction: number, velocity: number): void;
  subscribe(sub: ScrollSubscription): () => void;
  destroy(): void;
};

type PortfolioScrollWindow = Window & {
  __scrollTriggerProgress?: number;
};

export function createScrollOrchestrator(): ScrollOrchestrator {
  let state: ScrollOrchestratorState = {
    progress: 0,
    direction: 1,
    velocity: 0,
  };

  const subscribers = new Set<ScrollSubscription>();

  const publish = () => {
    // Publish progress to global window property
    if (typeof window !== 'undefined') {
      (window as PortfolioScrollWindow).__scrollTriggerProgress = state.progress;
      window.dispatchEvent(
        new CustomEvent('scrollTriggerProgress', {
          detail: { progress: state.progress },
        })
      );
    }

    subscribers.forEach((sub) => sub({ ...state }));
  };

  return {
    getState() {
      return { ...state };
    },

    update(progress, direction, velocity) {
      // Normalize direction to 1 or -1
      const normalizedDirection = direction < 0 ? -1 : 1;

      state = {
        progress,
        direction: normalizedDirection,
        velocity,
      };

      publish();
    },

    subscribe(sub) {
      subscribers.add(sub);
      // Immediately notify subscriber with current state
      sub({ ...state });

      return () => {
        subscribers.delete(sub);
      };
    },

    destroy() {
      subscribers.clear();
    },
  };
}
