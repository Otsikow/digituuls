export type CommunityTool = {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  pricing: string;
  websiteUrl: string;
  repoUrl?: string | null;
  upvotes: number;
  tags: string[];
};

export const communityTools: CommunityTool[] = [
  {
    id: "1",
    title: "Notion",
    description: "All-in-one workspace for notes, docs, and collaboration",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&q=80",
    category: "Productivity",
    pricing: "Freemium",
    websiteUrl: "https://notion.so",
    upvotes: 1234,
    tags: ["Notes", "Docs", "Collaboration"],
  },
  {
    id: "2",
    title: "Figma",
    description: "Collaborative interface design tool",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80",
    category: "Design",
    pricing: "Freemium",
    websiteUrl: "https://figma.com",
    repoUrl: null,
    upvotes: 2156,
    tags: ["Design", "UI/UX", "Prototyping"],
  },
  {
    id: "3",
    title: "ChatGPT",
    description: "Advanced AI language model for conversations and content",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&q=80",
    category: "AI",
    pricing: "Freemium",
    websiteUrl: "https://chat.openai.com",
    upvotes: 3421,
    tags: ["AI", "ChatBot", "Writing"],
  },
  {
    id: "4",
    title: "VS Code",
    description: "Powerful, lightweight code editor",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80",
    category: "Development",
    pricing: "Free",
    websiteUrl: "https://code.visualstudio.com",
    repoUrl: "https://github.com/microsoft/vscode",
    upvotes: 4532,
    tags: ["Code Editor", "IDE", "Development"],
  },
  {
    id: "5",
    title: "Stripe",
    description: "Payment processing platform for the internet",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=80",
    category: "Marketing",
    pricing: "Usage-based",
    websiteUrl: "https://stripe.com",
    upvotes: 2876,
    tags: ["Payments", "API", "SaaS"],
  },
  {
    id: "6",
    title: "Supabase",
    description: "Open source Firebase alternative",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80",
    category: "Development",
    pricing: "Freemium",
    websiteUrl: "https://supabase.com",
    repoUrl: "https://github.com/supabase/supabase",
    upvotes: 3214,
    tags: ["Database", "Backend", "Auth"],
  },
];
