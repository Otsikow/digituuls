import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, TrendingUp, Filter, Star, DollarSign, Eye, ThumbsUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { useSearch } from '@/hooks/useSearch';
import { SearchResult } from '@/lib/searchUtils';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const {
    query,
    setQuery,
    results,
    suggestions,
    popularSearches,
    isLoading,
    error,
    clearSearch
  } = useSearch({
    debounceMs: 200,
    minQueryLength: 1
  });

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        Math.min(prev + 1, results.length + suggestions.length - 1)
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleResultClick(results[selectedIndex]);
      } else if (selectedIndex >= results.length && selectedIndex < results.length + suggestions.length) {
        const suggestion = suggestions[selectedIndex - results.length];
        setQuery(suggestion);
      } else if (query.trim()) {
        // Navigate to search results page
        navigate(`/search?q=${encodeURIComponent(query)}`);
        onOpenChange(false);
      }
    } else if (e.key === 'Escape') {
      onOpenChange(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    onOpenChange(false);
    clearSearch();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  const handlePopularSearchClick = (search: string) => {
    setQuery(search);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price / 100);
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'product':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'tool':
        return <ThumbsUp className="h-4 w-4 text-blue-500" />;
      case 'toolkit':
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      case 'user':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'category':
        return <Filter className="h-4 w-4 text-gray-500" />;
      default:
        return <Search className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'product':
        return 'Product';
      case 'tool':
        return 'Tool';
      case 'toolkit':
        return 'Toolkit';
      case 'user':
        return 'User';
      case 'category':
        return 'Category';
      default:
        return 'Item';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold">Search Everything</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search products, tools, toolkits, users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9 pr-9 h-12 text-base"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <Separator />

        <ScrollArea className="flex-1 px-6 pb-6">
          {error && (
            <div className="text-center py-8 text-red-500">
              <p>Search failed: {error}</p>
              <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
                Retry
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
              <p>Searching...</p>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {/* Search Results */}
              {results.length > 0 && (
                <div className="space-y-2 mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Results ({results.length})
                  </h3>
                  {results.map((result, index) => (
                    <Card
                      key={`${result.type}-${result.id}`}
                      className={`cursor-pointer transition-colors ${
                        selectedIndex === index
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => handleResultClick(result)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {result.image ? (
                              <img
                                src={result.image}
                                alt={result.title}
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                                {getResultIcon(result.type)}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium truncate">{result.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {getTypeLabel(result.type)}
                              </Badge>
                            </div>
                            
                            {result.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {result.description}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {result.price && (
                                <span className="font-medium text-green-600">
                                  {formatPrice(result.price)}
                                </span>
                              )}
                              {result.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-current" />
                                  {result.rating.toFixed(1)}
                                </div>
                              )}
                              {result.viewCount && (
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {result.viewCount.toLocaleString()}
                                </div>
                              )}
                              {result.upvotes && (
                                <div className="flex items-center gap-1">
                                  <ThumbsUp className="h-3 w-3" />
                                  {result.upvotes.toLocaleString()}
                                </div>
                              )}
                            </div>

                            {result.tags && result.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {result.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="space-y-2 mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Suggestions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        className={`text-xs ${
                          selectedIndex === results.length + index
                            ? 'border-primary bg-primary/5'
                            : ''
                        }`}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <Search className="h-3 w-3 mr-1" />
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              {!query && popularSearches.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Popular Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search) => (
                      <Button
                        key={search}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => handlePopularSearchClick(search)}
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {query && results.length === 0 && suggestions.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No results found</p>
                  <p className="text-sm">
                    Try searching with different keywords or check your spelling
                  </p>
                </div>
              )}
            </>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};