import Fuse from "fuse.js";
import { supabase } from "@/integrations/supabase/client";
import { allSearchableData } from "./searchData";

export interface SearchResult {
  id: string;
  type: "product" | "tool" | "toolkit" | "user" | "category";
  title: string;
  description?: string;
  image?: string;
  url: string;
  category?: string;
  tags?: string[];
  price?: number;
  rating?: number;
  viewCount?: number;
  upvotes?: number;
  score?: number;
}

export interface SearchFilters {
  type?: string[];
  category?: string[];
  priceRange?: [number, number];
  rating?: number;
  tags?: string[];
}

/* -----------------------------
   LOCAL FALLBACK FUZZY SEARCH
------------------------------ */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  if (s1 === s2) return 100;
  if (s1.includes(s2) || s2.includes(s1)) return 80;
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  let matchingWords = 0;
  for (const w1 of words1) {
    for (const w2 of words2) {
      if (w1.includes(w2) || w2.includes(w1)) {
        matchingWords++;
        break;
      }
    }
  }
  if (matchingWords > 0) {
    return 60 * (matchingWords / Math.max(words1.length, words2.length));
  }
  let overlap = 0;
  for (let i = 0; i < s2.length; i++) {
    if (s1.includes(s2[i])) overlap++;
  }
  return (overlap / s2.length) * 40;
}

export function performSearchFallback(query: string, limit = 10): SearchResult[] {
  if (!query || !query.trim()) return [];
  const searchTerm = query.trim().toLowerCase();
  const results: Array<SearchResult & { score: number }> = [];

  for (const item of allSearchableData) {
    let score = 0;
    score += calculateSimilarity(item.title, searchTerm) * 2;
    score += calculateSimilarity(item.description, searchTerm);
    if (item.keywords) {
      for (const kw of item.keywords) score += calculateSimilarity(kw, searchTerm) * 1.5;
    }
    score += calculateSimilarity(item.category, searchTerm) * 0.5;
    if (score > 20) results.push({ ...item, score });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

/* -----------------------------
   SUPABASE + FUSE LIVE SEARCH
------------------------------ */
class SearchService {
  private fuse: Fuse<SearchResult> | null = null;
  private searchData: SearchResult[] = [];
  private fuseOptions = {
    keys: [
      { name: "title", weight: 0.4 },
      { name: "description", weight: 0.3 },
      { name: "tags", weight: 0.2 },
      { name: "category", weight: 0.1 },
    ],
    threshold: 0.4,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
  };

  async initialize() {
    if (this.fuse) return;
    try {
      const [products, tools, toolkits, profiles, categories] = await Promise.all([
        this.fetchProducts(),
        this.fetchTools(),
        this.fetchToolkits(),
        this.fetchProfiles(),
        this.fetchCategories(),
      ]);
      this.searchData = [...products, ...tools, ...toolkits, ...profiles, ...categories];
      this.fuse = new Fuse(this.searchData, this.fuseOptions);
    } catch (error) {
      console.error("Search initialization failed:", error);
      // fallback to local data if Supabase fails
      this.searchData = allSearchableData as any;
      this.fuse = new Fuse(this.searchData, this.fuseOptions);
    }
  }

  private async fetchProducts(): Promise<SearchResult[]> {
    const { data, error } = await supabase
      .from("products")
      .select("id,title,subtitle,description,images,price,tags,view_count,categories(name)")
      .eq("status", "published");
    if (error) throw error;
    return (
      data?.map((p) => ({
        id: p.id,
        type: "product" as const,
        title: p.title,
        description: p.subtitle || p.description,
        image: p.images?.[0],
        url: `/product/${p.id}`,
        category: p.categories?.name,
        tags: p.tags || [],
        price: p.price,
        viewCount: p.view_count || 0,
      })) || []
    );
  }

  private async fetchTools(): Promise<SearchResult[]> {
    const { data, error } = await supabase
      .from("tools")
      .select("id,title,description,images,tags,upvote_count,view_count,categories(name)")
      .eq("status", "approved");
    if (error) throw error;
    return (
      data?.map((t) => ({
        id: t.id,
        type: "tool" as const,
        title: t.title,
        description: t.description,
        image: t.images?.[0],
        url: `/tool/${t.id}`,
        category: t.categories?.name,
        tags: t.tags || [],
        upvotes: t.upvote_count || 0,
        viewCount: t.view_count || 0,
      })) || []
    );
  }

  private async fetchToolkits(): Promise<SearchResult[]> {
    const { data, error } = await supabase
      .from("toolkits")
      .select("id,title,description,images,tags,view_count,categories(name)")
      .eq("status", "published");
    if (error) throw error;
    return (
      data?.map((t) => ({
        id: t.id,
        type: "toolkit" as const,
        title: t.title,
        description: t.description,
        image: t.images?.[0],
        url: `/toolkit/${t.id}`,
        category: t.categories?.name,
        tags: t.tags || [],
        viewCount: t.view_count || 0,
      })) || []
    );
  }

  private async fetchProfiles(): Promise<SearchResult[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,display_name,username,bio,avatar_url")
      .not("display_name", "is", null);
    if (error) throw error;
    return (
      data?.map((p) => ({
        id: p.id,
        type: "user" as const,
        title: p.display_name || p.username || "Unknown User",
        description: p.bio,
        image: p.avatar_url,
        url: `/profile/${p.id}`,
        tags: p.bio ? [p.bio] : [],
      })) || []
    );
  }

  private async fetchCategories(): Promise<SearchResult[]> {
    const { data, error } = await supabase.from("categories").select("id,name,description,type,slug");
    if (error) throw error;
    return (
      data?.map((c) => ({
        id: c.id,
        type: "category" as const,
        title: c.name,
        description: c.description,
        url: `/${c.type}s?category=${c.slug}`,
        tags: [c.type],
      })) || []
    );
  }

  async search(query: string, filters?: SearchFilters): Promise<SearchResult[]> {
    await this.initialize();
    if (!query.trim() || !this.fuse) return this.searchData.slice(0, 20);
    const results = this.fuse.search(query);
    let filtered = results.map((r) => ({ ...r.item, score: r.score }));
    if (filters) filtered = this.applyFilters(filtered, filters);
    return filtered.slice(0, 50);
  }

  private applyFilters(results: SearchResult[], filters: SearchFilters): SearchResult[] {
    return results.filter((r) => {
      if (filters.type?.length && !filters.type.includes(r.type)) return false;
      if (filters.category?.length && (!r.category || !filters.category.includes(r.category)))
        return false;
      if (filters.priceRange && r.price !== undefined) {
        const [min, max] = filters.priceRange;
        if (r.price < min || r.price > max) return false;
      }
      if (filters.rating && r.rating && r.rating < filters.rating) return false;
      if (filters.tags?.length && !r.tags?.some((t) =>
        filters.tags!.some((ft) => t.toLowerCase().includes(ft.toLowerCase()))
      )) return false;
      return true;
    });
  }

  async getSuggestions(query: string, limit = 5): Promise<string[]> {
    await this.initialize();
    if (!query.trim() || !this.fuse) return [];
    const results = this.fuse.search(query);
    const suggestions = new Set<string>();
    results.slice(0, limit).forEach((r) => {
      if (r.item.title.toLowerCase().includes(query.toLowerCase())) suggestions.add(r.item.title);
      r.item.tags?.forEach((tag) => {
        if (tag.toLowerCase().includes(query.toLowerCase())) suggestions.add(tag);
      });
    });
    return Array.from(suggestions).slice(0, limit);
  }

  async getPopularSearches(): Promise<string[]> {
    return [
      "SaaS starter kit",
      "React components",
      "AI tools",
      "Design system",
      "Marketing automation",
      "E-commerce template",
      "Analytics dashboard",
      "Mobile app template",
    ];
  }

  async refreshData() {
    this.fuse = null;
    this.searchData = [];
    await this.initialize();
  }
}

export const searchService = new SearchService();
