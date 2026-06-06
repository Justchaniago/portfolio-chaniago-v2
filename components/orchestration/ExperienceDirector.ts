import type { WorkScene } from '../scenes/WorkScene';
import type { ContactScene } from '../scenes/ContactScene';
import type { EclipseTransition } from '../transitions/EclipseTransition';

export type ExperienceSceneId = 'hero' | 'about' | 'work' | 'contact';
export type ExperienceTransitionId = 'eclipse';
export type ExperienceDirection = 'forward' | 'reverse';

export type ExperienceDirectorPhase =
  | 'IDLE'
  | 'SCENE_EXITING'
  | 'TRANSITION_ENTERING'
  | 'TRANSITION_COVERING'
  | 'SCENE_ENTERING'
  | 'SCENE_ACTIVE'
  | 'REVERSING';

export type ExperienceDirectorState = {
  activeScene: ExperienceSceneId;
  previousScene: ExperienceSceneId | null;
  pendingScene: ExperienceSceneId | null;
  activeTransition: ExperienceTransitionId | null;
  direction: ExperienceDirection;
  phase: ExperienceDirectorPhase;
  locked: boolean;
};

type ExperienceDirectorDependencies = {
  workScene: WorkScene;
  contactScene: ContactScene;
  eclipseTransition: EclipseTransition;
};

export type ExperienceDirector = {
  getState(): ExperienceDirectorState;
  getActiveScene(): ExperienceSceneId;
  canEnterContact(): boolean;
  canRestoreWork(): boolean;
  canStartEclipse(direction: ExperienceDirection): boolean;
  requestContact(): boolean;
  requestWorkRestore(): boolean;
  destroy(): void;
};

export function createExperienceDirector({
  workScene,
  contactScene,
  eclipseTransition,
}: ExperienceDirectorDependencies): ExperienceDirector {
  let state: ExperienceDirectorState = {
    activeScene: 'work',
    previousScene: null,
    pendingScene: null,
    activeTransition: null,
    direction: 'forward',
    phase: 'IDLE',
    locked: false,
  };

  const setState = (nextState: Partial<ExperienceDirectorState>) => {
    state = { ...state, ...nextState };
  };

  return {
    getState() {
      return { ...state };
    },

    getActiveScene() {
      return state.activeScene;
    },

    canEnterContact() {
      return !state.locked && !contactScene.isActive();
    },

    canRestoreWork() {
      return !state.locked && contactScene.isActive();
    },

    canStartEclipse() {
      return !state.locked;
    },

    requestContact() {
      if (!this.canEnterContact()) return false;

      setState({
        previousScene: state.activeScene,
        pendingScene: 'contact',
        activeTransition: 'eclipse',
        direction: 'forward',
        phase: 'SCENE_EXITING',
      });

      eclipseTransition.complete();
      workScene.exit();

      setState({ phase: 'SCENE_ENTERING' });
      contactScene.enter();

      setState({
        activeScene: 'contact',
        pendingScene: null,
        phase: 'SCENE_ACTIVE',
      });

      return true;
    },

    requestWorkRestore() {
      if (!this.canRestoreWork()) return false;

      setState({
        previousScene: state.activeScene,
        pendingScene: 'work',
        activeTransition: 'eclipse',
        direction: 'reverse',
        phase: 'SCENE_EXITING',
      });

      eclipseTransition.exit();
      workScene.resume();
      contactScene.exit();

      setState({
        activeScene: 'work',
        pendingScene: null,
        phase: 'SCENE_ACTIVE',
      });

      return true;
    },

    destroy() {
      setState({
        pendingScene: null,
        activeTransition: null,
        phase: 'IDLE',
        locked: false,
      });
    },
  };
}
