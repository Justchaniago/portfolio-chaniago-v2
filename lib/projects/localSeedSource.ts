import { projects as legacyProjects } from '../../data/projects';
import { Project, ProjectMedia, ProjectLink } from './types';

export class LocalSeedSource {
    getProjects(): Project[] {
        return legacyProjects.map((legacy, index) => {
            const gallery: ProjectMedia[] = legacy.gallery.map((src, i) => {
                const brightness = legacy.galleryBrightness && legacy.galleryBrightness[i]
                    ? (legacy.galleryBrightness[i] as 'light' | 'dark')
                    : 'dark';
                return {
                    src,
                    alt: `${legacy.title} Gallery ${i + 1}`,
                    kind: 'gallery',
                    brightness,
                };
            });

            const coverBrightness = legacy.galleryBrightness && legacy.galleryBrightness[0]
                ? (legacy.galleryBrightness[0] as 'light' | 'dark')
                : 'dark';

            const coverImage: ProjectMedia = {
                src: legacy.image,
                alt: `${legacy.title} Cover`,
                kind: 'cover',
                brightness: coverBrightness,
            };

            // Define default technologies based on project slug to give realistic seed profiles
            let technologies: string[] = ['React', 'TypeScript', 'GSAP'];
            if (legacy.slug === 'gong-cha-panel') {
                technologies = ['React', 'TypeScript', 'GSAP', 'Next.js', 'TailwindCSS', 'WebSockets'];
            } else if (legacy.slug === 'gong-cha') {
                technologies = ['React Native', 'TypeScript', 'Redux', 'Node.js', 'Framer Motion'];
            } else if (legacy.slug === 'teman-dengar') {
                technologies = ['Next.js', 'React', 'TypeScript', 'TailwindCSS', 'OpenAI API', 'Python'];
            }

            // Default links
            const links: ProjectLink[] = [];

            return {
                id: legacy.id,
                slug: legacy.slug,
                title: legacy.title,
                summary: legacy.description,
                description: legacy.description,
                featured: true,
                featuredPriority: index + 1,
                sortOrder: index + 1,
                status: 'published',
                year: 2024,
                category: legacy.category,
                technologies,
                coverImage,
                gallery,
                links,
                impact: legacy.impact,
                role: legacy.slug === 'teman-dengar' ? ['Lead Developer', 'UX Designer'] : ['Frontend Engineer'],
                industry: legacy.slug === 'teman-dengar' ? 'Healthcare/A.I.' : 'Retail & Food Beverage',
            };
        });
    }
}
