import { ProjectRepository } from './repository.interface';
import { Project } from './types';
import { LocalSeedSource } from './localSeedSource';
import { validateProjects } from './validation';

export class LocalProjectRepository implements ProjectRepository {
    private projects: Project[];

    constructor(private seedSource: LocalSeedSource) {
        this.projects = this.seedSource.getProjects();
        validateProjects(this.projects);
    }

    async getAllProjects(): Promise<Project[]> {
        return this.projects;
    }

    async getPublishedProjects(): Promise<Project[]> {
        return this.projects.filter(p => p.status === 'published');
    }

    async getFeaturedProjects(): Promise<Project[]> {
        const published = await this.getPublishedProjects();
        return published
            .filter(p => p.featured)
            .sort((a, b) => {
                if (a.featuredPriority !== b.featuredPriority) {
                    return a.featuredPriority - b.featuredPriority;
                }
                return a.sortOrder - b.sortOrder;
            });
    }

    async getProjectBySlug(slug: string): Promise<Project | null> {
        const published = await this.getPublishedProjects();
        return published.find(p => p.slug === slug) || null;
    }

    async getProjectsByCategory(category: string): Promise<Project[]> {
        const published = await this.getPublishedProjects();
        return published.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
}
