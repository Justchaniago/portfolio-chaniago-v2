import { Project } from './types';

export function validateProjects(projects: Project[]): void {
    const seenSlugs = new Set<string>();
    const isDev = process.env.NODE_ENV !== 'production';

    for (const project of projects) {
        const context = `Project with ID "${project.id}"`;

        // 1. Missing required fields
        if (!project.id || typeof project.id !== 'string') {
            handleValidationError(`${context}: Missing or invalid "id".`, isDev);
        }
        if (!project.slug || typeof project.slug !== 'string') {
            handleValidationError(`${context}: Missing or invalid "slug".`, isDev);
        }
        if (!project.title || typeof project.title !== 'string') {
            handleValidationError(`${context}: Missing or invalid "title".`, isDev);
        }
        if (!project.summary || typeof project.summary !== 'string') {
            handleValidationError(`${context}: Missing or invalid "summary".`, isDev);
        }
        if (typeof project.featured !== 'boolean') {
            handleValidationError(`${context}: Missing or invalid "featured" boolean.`, isDev);
        }
        if (typeof project.featuredPriority !== 'number') {
            handleValidationError(`${context}: Missing or invalid "featuredPriority" number.`, isDev);
        }
        if (typeof project.sortOrder !== 'number') {
            handleValidationError(`${context}: Missing or invalid "sortOrder" number.`, isDev);
        }
        const validStatuses = ['draft', 'published', 'archived'];
        if (!project.status || !validStatuses.includes(project.status)) {
            handleValidationError(`${context}: "status" must be one of: ${validStatuses.join(', ')}.`, isDev);
        }
        if (typeof project.year !== 'number') {
            handleValidationError(`${context}: Missing or invalid "year" number.`, isDev);
        }
        if (!project.category || typeof project.category !== 'string') {
            handleValidationError(`${context}: Missing or invalid "category".`, isDev);
        }
        if (!Array.isArray(project.technologies)) {
            handleValidationError(`${context}: "technologies" must be an array of strings.`, isDev);
        }
        if (!project.coverImage || typeof project.coverImage !== 'object') {
            handleValidationError(`${context}: Missing or invalid "coverImage".`, isDev);
        } else {
            if (!project.coverImage.src || !project.coverImage.alt || project.coverImage.kind !== 'cover') {
                handleValidationError(`${context}: coverImage must have a valid src, alt, and kind === 'cover'.`, isDev);
            }
        }
        if (!Array.isArray(project.gallery)) {
            handleValidationError(`${context}: "gallery" must be an array.`, isDev);
        } else {
            for (let i = 0; i < project.gallery.length; i++) {
                const item = project.gallery[i];
                if (!item || !item.src || !item.alt || item.kind !== 'gallery') {
                    handleValidationError(`${context}: gallery image at index ${i} must have a valid src, alt, and kind === 'gallery'.`, isDev);
                }
            }
        }
        if (!Array.isArray(project.links)) {
            handleValidationError(`${context}: "links" must be an array of ProjectLink objects.`, isDev);
        }

        // 2. Duplicate slug detection
        if (project.slug) {
            if (seenSlugs.has(project.slug)) {
                handleValidationError(`Duplicate slug detected: "${project.slug}" on project ID "${project.id}".`, isDev);
            }
            seenSlugs.add(project.slug);
        }

        // 3. Invalid featured configuration
        if (project.featured) {
            if (project.featuredPriority <= 0) {
                handleValidationError(`${context}: Is featured but featuredPriority is not greater than 0.`, isDev);
            }
            if (project.status !== 'published') {
                handleValidationError(`${context}: Is featured but status is not "published".`, isDev);
            }
        }
    }
}

function handleValidationError(message: string, isDev: boolean): void {
    const fullMessage = `[ProjectRepository Validation Error] ${message}`;
    if (isDev) {
        throw new Error(fullMessage);
    } else {
        console.error(fullMessage);
    }
}
