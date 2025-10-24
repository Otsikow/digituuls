import { useState, useEffect, useCallback, useMemo } from 'react';
import { searchService, SearchResult, SearchFilters } from '@/lib/searchUtils';

interface UseSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  initialFilters?: SearchFilters;
}

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  suggestions: string[];
  popularSearches: string[];
  isLoading: boolean;
  error: string | null;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  clearSearch: () => void;
  refreshData: () => Promise<void>;
}

export const useSearch = (options: UseSearchOptions = {}): UseSearchReturn => {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    initialFilters = {}
  } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string, searchFilters: SearchFilters) => {
      if (!searchQuery.trim() || searchQuery.length < minQueryLength) {
        setResults([]);
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const [searchResults, searchSuggestions] = await Promise.all([
          searchService.search(searchQuery, searchFilters),
          searchService.getSuggestions(searchQuery)
        ]);

        setResults(searchResults);
        setSuggestions(searchSuggestions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs),
    [debounceMs, minQueryLength]
  );

  // Load popular searches on mount
  useEffect(() => {
    const loadPopularSearches = async () => {
      try {
        const popular = await searchService.getPopularSearches();
        setPopularSearches(popular);
      } catch (err) {
        console.error('Failed to load popular searches:', err);
      }
    };

    loadPopularSearches();
  }, []);

  // Trigger search when query or filters change
  useEffect(() => {
    debouncedSearch(query, filters);
  }, [query, filters, debouncedSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setError(null);
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      await searchService.refreshData();
      // Re-trigger search with current query
      if (query.trim()) {
        debouncedSearch(query, filters);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, [query, filters, debouncedSearch]);

  const memoizedResults = useMemo(() => results, [results]);
  const memoizedSuggestions = useMemo(() => suggestions, [suggestions]);

  return {
    query,
    setQuery,
    results: memoizedResults,
    suggestions: memoizedSuggestions,
    popularSearches,
    isLoading,
    error,
    filters,
    setFilters,
    clearSearch,
    refreshData
  };
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}