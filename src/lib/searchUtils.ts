import { SearchResult, allSearchableData } from "./searchData";

/**
 * Calculate similarity score between two strings
 * Uses a simple character matching algorithm
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // Exact match
  if (s1 === s2) return 100;
  
  // Contains match
  if (s1.includes(s2) || s2.includes(s1)) return 80;
  
  // Word boundary match
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  
  let matchingWords = 0;
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1.includes(word2) || word2.includes(word1)) {
        matchingWords++;
        break;
      }
    }
  }
  
  if (matchingWords > 0) {
    return 60 * (matchingWords / Math.max(words1.length, words2.length));
  }
  
  // Character overlap
  let overlap = 0;
  for (let i = 0; i < s2.length; i++) {
    if (s1.includes(s2[i])) {
      overlap++;
    }
  }
  
  return (overlap / s2.length) * 40;
}

/**
 * Search through all searchable data with fuzzy matching
 */
export function performSearch(query: string, limit: number = 10): SearchResult[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const searchTerm = query.trim().toLowerCase();
  const results: Array<SearchResult & { score: number }> = [];

  for (const item of allSearchableData) {
    let score = 0;
    
    // Check title
    const titleScore = calculateSimilarity(item.title, searchTerm);
    score += titleScore * 2; // Title matches are weighted higher
    
    // Check description
    const descScore = calculateSimilarity(item.description, searchTerm);
    score += descScore;
    
    // Check keywords
    if (item.keywords) {
      for (const keyword of item.keywords) {
        const keywordScore = calculateSimilarity(keyword, searchTerm);
        score += keywordScore * 1.5; // Keywords are important
      }
    }
    
    // Check category
    const categoryScore = calculateSimilarity(item.category, searchTerm);
    score += categoryScore * 0.5;
    
    // Only include results with a meaningful score
    if (score > 20) {
      results.push({ ...item, score });
    }
  }

  // Sort by score (descending) and limit results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ score, ...item }) => item);
}

/**
 * Get search suggestions based on partial input
 */
export function getSearchSuggestions(query: string, limit: number = 5): string[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const searchTerm = query.trim().toLowerCase();
  const suggestions = new Set<string>();

  for (const item of allSearchableData) {
    // Add title if it matches
    if (item.title.toLowerCase().includes(searchTerm)) {
      suggestions.add(item.title);
    }
    
    // Add matching keywords
    if (item.keywords) {
      for (const keyword of item.keywords) {
        if (keyword.toLowerCase().includes(searchTerm)) {
          suggestions.add(keyword);
        }
      }
    }
    
    if (suggestions.size >= limit) {
      break;
    }
  }

  return Array.from(suggestions).slice(0, limit);
}

/**
 * Group search results by category
 */
export function groupResultsByCategory(results: SearchResult[]): Record<string, SearchResult[]> {
  const grouped: Record<string, SearchResult[]> = {};
  
  for (const result of results) {
    if (!grouped[result.category]) {
      grouped[result.category] = [];
    }
    grouped[result.category].push(result);
  }
  
  return grouped;
}

/**
 * Get popular/trending search terms
 */
export function getPopularSearches(): string[] {
  return [
    "AI tools",
    "SaaS starter kit",
    "Design system",
    "Marketing automation",
    "Analytics dashboard",
    "Content generator"
  ];
}
