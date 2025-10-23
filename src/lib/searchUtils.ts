import Fuse from 'fuse.js';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  type: 'product' | 'tool' | 'toolkit' | 'user' | 'category';
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

class SearchService {
  private fuseOptions = {
    keys: [
      { name: 'title', weight: 0.4 },
      { name: 'description', weight: 0.3 },
      { name: 'tags', weight: 0.2 },
      { name: 'category', weight: 0.1 }
    ],
    threshold: 0.4,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2
  };

  private fuse: Fuse<SearchResult> | null = null;
  private searchData: SearchResult[] = [];

  async initialize() {
    if (this.fuse) return;
    
    try {
      // Fetch all searchable data from Supabase
      const [productsResult, toolsResult, toolkitsResult, profilesResult, categoriesResult] = await Promise.all([
        this.fetchProducts(),
        this.fetchTools(),
        this.fetchToolkits(),
        this.fetchProfiles(),
        this.fetchCategories()
      ]);

      this.searchData = [
        ...productsResult,
        ...toolsResult,
        ...toolkitsResult,
        ...profilesResult,
        ...categoriesResult
      ];

      this.fuse = new Fuse(this.searchData, this.fuseOptions);
    } catch (error) {
      console.error('Failed to initialize search:', error);
      // Fallback to empty search
      this.fuse = new Fuse([], this.fuseOptions);
    }
  }

  private async fetchProducts(): Promise<SearchResult[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        title,
        subtitle,
        description,
        images,
        price,
        tags,
        view_count,
        categories(name),
        sellers(user_id, profiles(display_name))
      `)
      .eq('status', 'published');

    if (error) throw error;

    return data?.map(product => ({
      id: product.id,
      type: 'product' as const,
      title: product.title,
      description: product.subtitle || product.description,
      image: product.images?.[0] || undefined,
      url: `/product/${product.id}`,
      category: product.categories?.name,
      tags: product.tags || [],
      price: product.price,
      viewCount: product.view_count || 0,
      rating: 0 // TODO: Calculate from reviews
    })) || [];
  }

  private async fetchTools(): Promise<SearchResult[]> {
    const { data, error } = await supabase
      .from('tools')
      .select(`
        id,
        title,
        description,
        images,
        pricing,
        tags,
        upvote_count,
        view_count,
        categories(name)
      `)
      .eq('status', 'approved');

    if (error) throw error;

    return data?.map(tool => ({
      id: tool.id,
      type: 'tool' as const,
      title: tool.title,
      description: tool.description,
      image: tool.images?.[0] || undefined,
      url: `/tool/${tool.id}`,
      category: tool.categories?.name,
      tags: tool.tags || [],
      upvotes: tool.upvote_count || 0,
      viewCount: tool.view_count || 0
    })) || [];
  }

  private async fetchToolkits(): Promise<SearchResult[]> {
    const { data, error } = await supabase
      .from('toolkits')
      .select(`
        id,
        title,
        description,
        images,
        tags,
        view_count,
        categories(name)
      `)
      .eq('status', 'published');

    if (error) throw error;

    return data?.map(toolkit => ({
      id: toolkit.id,
      type: 'toolkit' as const,
      title: toolkit.title,
      description: toolkit.description,
      image: toolkit.images?.[0] || undefined,
      url: `/toolkit/${toolkit.slug}`,
      category: toolkit.categories?.name,
      tags: toolkit.tags || [],
      viewCount: toolkit.view_count || 0
    })) || [];
  }

  private async fetchProfiles(): Promise<SearchResult[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        display_name,
        username,
        bio,
        avatar_url
      `)
      .not('display_name', 'is', null);

    if (error) throw error;

    return data?.map(profile => ({
      id: profile.id,
      type: 'user' as const,
      title: profile.display_name || profile.username || 'Unknown User',
      description: profile.bio,
      image: profile.avatar_url || undefined,
      url: `/profile/${profile.id}`,
      tags: profile.bio ? [profile.bio] : []
    })) || [];
  }

  private async fetchCategories(): Promise<SearchResult[]> {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        description,
        type
      `);

    if (error) throw error;

    return data?.map(category => ({
      id: category.id,
      type: 'category' as const,
      title: category.name,
      description: category.description,
      url: `/${category.type}s?category=${category.slug}`,
      tags: [category.type]
    })) || [];
  }

  async search(query: string, filters?: SearchFilters): Promise<SearchResult[]> {
    await this.initialize();
    
    if (!query.trim() || !this.fuse) {
      return this.searchData.slice(0, 20); // Return popular items when no query
    }

    const results = this.fuse.search(query);
    
    let filteredResults = results.map(result => ({
      ...result.item,
      score: result.score
    }));

    // Apply filters
    if (filters) {
      filteredResults = this.applyFilters(filteredResults, filters);
    }

    return filteredResults.slice(0, 50); // Limit results
  }

  private applyFilters(results: SearchResult[], filters: SearchFilters): SearchResult[] {
    return results.filter(result => {
      // Type filter
      if (filters.type && filters.type.length > 0) {
        if (!filters.type.includes(result.type)) return false;
      }

      // Category filter
      if (filters.category && filters.category.length > 0) {
        if (!result.category || !filters.category.includes(result.category)) return false;
      }

      // Price range filter
      if (filters.priceRange && result.price !== undefined) {
        const [min, max] = filters.priceRange;
        if (result.price < min || result.price > max) return false;
      }

      // Rating filter
      if (filters.rating && result.rating !== undefined) {
        if (result.rating < filters.rating) return false;
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        if (!result.tags || !result.tags.some(tag => 
          filters.tags!.some(filterTag => 
            tag.toLowerCase().includes(filterTag.toLowerCase())
          )
        )) return false;
      }

      return true;
    });
  }

  async getSuggestions(query: string, limit = 5): Promise<string[]> {
    await this.initialize();
    
    if (!query.trim() || !this.fuse) return [];

    const results = this.fuse.search(query);
    const suggestions = new Set<string>();

    results.slice(0, limit).forEach(result => {
      // Add title suggestions
      if (result.item.title.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(result.item.title);
      }
      
      // Add tag suggestions
      result.item.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(tag);
        }
      });
    });

    return Array.from(suggestions).slice(0, limit);
  }

  async getPopularSearches(): Promise<string[]> {
    // Return popular search terms (could be stored in database)
    return [
      'SaaS starter kit',
      'React components',
      'AI tools',
      'Design system',
      'Marketing automation',
      'E-commerce template',
      'Analytics dashboard',
      'Mobile app template'
    ];
  }

  async refreshData() {
    this.fuse = null;
    this.searchData = [];
    await this.initialize();
  }
}

export const searchService = new SearchService();