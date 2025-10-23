export type Toolkit = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  toolsCount: number;
  views: number;
  tags: string[];
  category: string;
};

export const toolkits: Toolkit[] = [
  {
    id: "1",
    title: "Startup Launch Kit",
    slug: "startup-launch-kit",
    description: "Everything you need to launch your startup in 30 days",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
    toolsCount: 12,
    views: 2341,
    tags: ["Startup", "Launch", "Marketing"],
    category: "Startup",
  },
  {
    id: "2",
    title: "Full-Stack Developer Toolkit",
    slug: "fullstack-dev-toolkit",
    description: "Complete toolset for modern full-stack development",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80",
    toolsCount: 18,
    views: 3892,
    tags: ["Development", "Full-Stack", "DevOps"],
    category: "Developer",
  },
  {
    id: "3",
    title: "Designer's Arsenal",
    slug: "designers-arsenal",
    description: "Curated design tools for UI/UX professionals",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
    toolsCount: 15,
    views: 2156,
    tags: ["Design", "UI/UX", "Creative"],
    category: "Design",
  },
  {
    id: "4",
    title: "AI Content Creator Bundle",
    slug: "ai-content-creator",
    description: "AI-powered tools for content creation and automation",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
    toolsCount: 10,
    views: 4521,
    tags: ["AI", "Content", "Automation"],
    category: "AI",
  },
  {
    id: "5",
    title: "Marketing Growth Stack",
    slug: "marketing-growth-stack",
    description: "Tools to scale your marketing and grow your audience",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
    toolsCount: 14,
    views: 3214,
    tags: ["Marketing", "Growth", "Analytics"],
    category: "Marketing",
  },
  {
    id: "6",
    title: "Remote Work Essentials",
    slug: "remote-work-essentials",
    description: "Everything for productive remote and async work",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&q=80",
    toolsCount: 11,
    views: 1876,
    tags: ["Productivity", "Remote", "Collaboration"],
    category: "Productivity",
  },
];
