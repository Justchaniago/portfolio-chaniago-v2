export type ProjectStatus = 'draft' | 'published' | 'archived';

export type ProjectLinkType =
    | 'live'
    | 'repo'
    | 'case-study'
    | 'external';

export type ProjectMediaKind =
    | 'cover'
    | 'thumbnail'
    | 'gallery'
    | 'hero'
    | 'og';

export type ProjectMediaBrightness = 'light' | 'dark';

export interface ProjectMedia {
    src: string;
    alt: string;
    kind: ProjectMediaKind;
    brightness?: ProjectMediaBrightness;
    width?: number;
    height?: number;
    focalPoint?: {
        x: number;
        y: number;
    };
}

export interface ProjectLink {
    label: string;
    href: string;
    type: ProjectLinkType;
}

export interface ProjectSeo {
    title?: string;
    description?: string;
    image?: string;
    canonicalPath?: string;
}

export interface ProjectCaseStudy {
    problem?: string;
    solution?: string;
    outcome?: string;
    role?: string;
    process?: string;
    technicalDetails?: string;
    body?: string;
}

export interface ProjectAnalyticsMeta {
    trackingId?: string;
    conversionCategory?: string;
}

export interface Project {
    id: string;
    slug: string;
    title: string;
    summary: string;
    featured: boolean;
    featuredPriority: number;
    sortOrder: number;
    status: ProjectStatus;
    year: number;
    category: string;
    technologies: string[];
    coverImage: ProjectMedia;
    gallery: ProjectMedia[];
    links: ProjectLink[];
    description?: string;
    industry?: string;
    role?: string[];
    impact?: string;
    projectType?: string;
    tags?: string[];
    seo?: ProjectSeo;
    caseStudy?: ProjectCaseStudy;
    analytics?: ProjectAnalyticsMeta;
    createdAt?: string;
    updatedAt?: string;
}
