import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Eye, 
  ThumbsUp, 
  DollarSign,
  ArrowLeft,
  X
} from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { SearchResult } from '@/lib/searchUtils';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState({
    type: [] as string[],
    category: [] as string[],
    priceRange: [0, 10000] as [number, number],
    rating: 0
  });

  const {
    results,
    isLoading,
    error,
    setQuery,
    setFilters: setSearchFilters,
    refreshData
  } = useSearch({
    debounceMs: 500,
    minQueryLength: 1
  });

  useEffect(() => {
    if (query) {
      setQuery(query);
      setSearchFilters(filters);
    }
  }, [query, filters, setQuery, setSearchFilters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get('search') as string;
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleTypeFilter = (type: string) => {
    setFilters(prev => ({
      ...prev,
      type: prev.type.includes(type)
        ? prev.type.filter(t => t !== type)
        : [...prev.type, type]
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: [],
      category: [],
      priceRange: [0, 10000],
      rating: 0
    });
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
        return <Filter className="h-4 w-4 text-purple-500" />;
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

  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.price || 0) - (b.price || 0);
      case 'price-high':
        return (b.price || 0) - (a.price || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'views':
        return (b.viewCount || 0) - (a.viewCount || 0);
      case 'newest':
        return 0; // For now, we don't have created_at in SearchResult
      default:
        return (a.score || 0) - (b.score || 0);
    }
  });

  const typeCounts = results.reduce((acc, result) => {
    acc[result.type] = (acc[result.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <h1 className="text-3xl font-bold mb-2">
            {query ? `Search results for "${query}"` : 'Search Results'}
          </h1>
          <p className="text-muted-foreground">
            {isLoading ? 'Searching...' : `${results.length} results found`}
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search everything..."
                defaultValue={query}
                className="pl-9 h-12"
              />
            </div>
            <Button type="submit" className="h-12 px-8">
              Search
            </Button>
          </div>
        </form>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="w-64 space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Filters</h3>
              
              {/* Type Filter */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
                {Object.entries(typeCounts).map(([type, count]) => (
                  <label key={type} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.type.includes(type)}
                      onChange={() => handleTypeFilter(type)}
                      className="rounded border-border"
                    />
                    <span className="text-sm capitalize">
                      {getTypeLabel(type as SearchResult['type'])} ({count})
                    </span>
                  </label>
                ))}
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Price Range</h4>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange[0]}
                    onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])}
                    className="h-8"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange[1]}
                    onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value) || 10000])}
                    className="h-8"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="views">Most Viewed</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1 border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Grid/List */}
            {error && (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">Search failed: {error}</p>
                <Button onClick={refreshData}>Retry</Button>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                <p>Searching...</p>
              </div>
            )}

            {!isLoading && !error && sortedResults.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No results found</p>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}

            {!isLoading && !error && sortedResults.length > 0 && (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {sortedResults.map((result) => (
                  <Card
                    key={`${result.type}-${result.id}`}
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => navigate(result.url)}
                  >
                    <CardContent className={viewMode === 'list' ? 'p-4' : 'p-6'}>
                      <div className={viewMode === 'list' ? 'flex gap-4' : ''}>
                        <div className={`${viewMode === 'list' ? 'flex-shrink-0' : 'mb-4'}`}>
                          {result.image ? (
                            <img
                              src={result.image}
                              alt={result.title}
                              className={`${viewMode === 'list' ? 'h-16 w-16' : 'h-32 w-full'} rounded-lg object-cover`}
                            />
                          ) : (
                            <div className={`${viewMode === 'list' ? 'h-16 w-16' : 'h-32 w-full'} rounded-lg bg-secondary flex items-center justify-center`}>
                              {getResultIcon(result.type)}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold truncate">{result.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(result.type)}
                            </Badge>
                          </div>
                          
                          {result.description && (
                            <p className={`text-muted-foreground mb-3 ${viewMode === 'list' ? 'line-clamp-2' : 'line-clamp-3'}`}>
                              {result.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            {result.price && (
                              <span className="font-medium text-green-600">
                                {formatPrice(result.price)}
                              </span>
                            )}
                            {result.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-current" />
                                {result.rating.toFixed(1)}
                              </div>
                            )}
                            {result.viewCount && (
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {result.viewCount.toLocaleString()}
                              </div>
                            )}
                            {result.upvotes && (
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="h-4 w-4" />
                                {result.upvotes.toLocaleString()}
                              </div>
                            )}
                          </div>

                          {result.tags && result.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {result.tags.slice(0, viewMode === 'list' ? 2 : 3).map((tag) => (
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
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SearchResults;