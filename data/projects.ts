export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  slug: string;
  impact: string;
  gallery: string[];
}

export const projects: Project[] = [
  {
    id: '01',
    title: 'Gong Cha Panel',
    category: 'Franchise Operations Console',
    description: 'Streamlining high-throughput retail operations and logistics through a unified real-time dashboard.',
    impact: 'Optimizing franchise performance and store management for global beverage retailers.',
    image: '/images/project1.png',
    slug: 'gong-cha-panel',
    gallery: ['/images/project1.png', '/images/Gongchacontrolpanel.png', '/images/project_aura.png'],
  },
  {
    id: '02',
    title: 'Gong Cha',
    category: 'Mobile Ordering Platform',
    description: 'Streamlining bubble tea order rituals through seamless mobile architectures.',
    impact: 'Redefining daily loyalty rituals and beverage ordering for a global tea brand.',
    image: '/images/project2.png',
    slug: 'gong-cha',
    gallery: ['/images/project2.png', '/images/Gongchaapp.png', '/images/bannertransparan.png'],
  },
  {
    id: '03',
    title: 'Teman Dengar',
    category: 'AI Emotional Companion',
    description: 'An AI-powered emotional companion helping users understand behavioral and emotional patterns through reflective, supportive conversations.',
    impact: 'Supporting emotional patterns through responsive AI architectures and reflective check-in experiences.',
    image: '/images/project3.png',
    slug: 'teman-dengar',
    gallery: ['/images/project3.png', '/images/project_kuro.png', '/images/chaniago.jpg'],
  }
];
