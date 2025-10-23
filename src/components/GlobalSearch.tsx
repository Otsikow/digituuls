import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { 
  Search, 
  FileText, 
  Package, 
  Wrench, 
  Home, 
  TrendingUp,
  ShoppingBag,
  User,
  Sparkles
} from "lucide-react";
import { performSearch, groupResultsByCategory, getPopularSearches } from "@/lib/searchUtils";
import { SearchResult } from "@/lib/searchData";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryIcons: Record<string, any> = {
  Products: Package,
  Tools: Wrench,
  Toolkits: ShoppingBag,
  Pages: FileText,
  Account: User,
  Features: Sparkles,
};

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [groupedResults, setGroupedResults] = useState<Record<string, SearchResult[]>>({});

  // Perform search when query changes
  useEffect(() => {
    if (query.trim().length > 0) {
      const searchResults = performSearch(query, 20);
      setResults(searchResults);
      setGroupedResults(groupResultsByCategory(searchResults));
    } else {
      setResults([]);
      setGroupedResults({});
    }
  }, [query]);

  const handleSelect = useCallback((url: string) => {
    navigate(url);
    onOpenChange(false);
    setQuery("");
  }, [navigate, onOpenChange]);

  const popularSearches = getPopularSearches();

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search products, tools, pages, and more..." 
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {query.trim().length === 0 ? (
          <>
            <CommandEmpty>Start typing to search...</CommandEmpty>
            <CommandGroup heading="Popular Searches">
              {popularSearches.map((search) => (
                <CommandItem
                  key={search}
                  onSelect={() => setQuery(search)}
                  className="cursor-pointer"
                >
                  <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{search}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : results.length === 0 ? (
          <CommandEmpty>
            <div className="flex flex-col items-center gap-2 py-6">
              <Search className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No results found for "{query}"
              </p>
              <p className="text-xs text-muted-foreground">
                Try searching for products, tools, or pages
              </p>
            </div>
          </CommandEmpty>
        ) : (
          <>
            {Object.entries(groupedResults).map(([category, items], index) => {
              const Icon = categoryIcons[category] || FileText;
              return (
                <div key={category}>
                  {index > 0 && <CommandSeparator />}
                  <CommandGroup heading={category}>
                    {items.map((item) => (
                      <CommandItem
                        key={item.id}
                        onSelect={() => handleSelect(item.url)}
                        className="cursor-pointer"
                      >
                        <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <span className="font-medium truncate">{item.title}</span>
                          <span className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </span>
                        </div>
                        {item.metadata?.price && (
                          <span className="ml-2 text-xs text-muted-foreground shrink-0">
                            ${(item.metadata.price / 100).toFixed(2)}
                          </span>
                        )}
                        {item.metadata?.rating && (
                          <span className="ml-2 text-xs text-muted-foreground shrink-0">
                            ⭐ {item.metadata.rating}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </div>
              );
            })}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
