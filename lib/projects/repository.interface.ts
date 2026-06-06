import { Project } from './types';

export interface ProjectRepository {
    getAllProjects(): Promise<Project[]>;
    getPublishedProjects(): Promise<Project[]>;
    getFeaturedProjects(): Promise<Project[]>;
    getProjectBySlug(slug: string): Promise<Project | null>;
    getProjectsByCategory(category: string): Promise<Project[]>;
}
