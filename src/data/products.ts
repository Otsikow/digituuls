export type Product = {
  id: string;
  title: string;
  subtitle: string;
  price: number; // cents
  image: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  category: string;
};

export const products: Product[] = [
  {
    id: "1",
    title: "SaaS Starter Kit Pro",
    subtitle: "Complete Next.js boilerplate with auth & payments",
    price: 14900,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    rating: 4.9,
    reviewCount: 127,
    isNew: true,
    category: "SaaS Projects",
  },
  {
    id: "2",
    title: "AI Content Generator",
    subtitle: "GPT-powered content creation tool with templates",
    price: 4900,
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    rating: 4.8,
    reviewCount: 89,
    isBestSeller: true,
    category: "AI Tools",
  },
  {
    id: "3",
    title: "Design System Library",
    subtitle: "200+ components for Figma & React",
    price: 7900,
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    rating: 5.0,
    reviewCount: 234,
    isBestSeller: true,
    category: "Design Assets",
  },
  {
    id: "4",
    title: "Marketing Automation Suite",
    subtitle: "Email campaigns & analytics dashboard",
    price: 9900,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    rating: 4.7,
    reviewCount: 156,
    category: "Marketing",
  },
  {
    id: "5",
    title: "E-commerce Template Bundle",
    subtitle: "Modern store templates with checkout flow",
    price: 5900,
    image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80",
    rating: 4.6,
    reviewCount: 98,
    category: "Templates",
  },
  {
    id: "6",
    title: "Analytics Dashboard Kit",
    subtitle: "Beautiful charts and data visualization components",
    price: 3900,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    rating: 4.9,
    reviewCount: 176,
    category: "UI Components",
  },
];
