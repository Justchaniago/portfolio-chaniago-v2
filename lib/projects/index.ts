import { LocalSeedSource } from './localSeedSource';
import { LocalProjectRepository } from './localProjectRepository';

export * from './types';
export * from './repository.interface';
export * from './localSeedSource';
export * from './localProjectRepository';
export * from './validation';

// Instantiate singleton instance for application runtime
const seedSource = new LocalSeedSource();
export const projectRepository = new LocalProjectRepository(seedSource);
