import { useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "react-router-dom";
import { searchAll, type SearchResult } from "@/lib/search";

function useQueryParam(name: string): string {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search).get(name) ?? "", [search, name]);
}

const SearchResults = () => {
  const q = useQueryParam("q") || useQueryParam("search");
  const results: SearchResult[] = useMemo(() => searchAll(q, 50), [q]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <div className="mb-6 flex items-baseline justify-between gap-3">
          <h1 className="text-3xl font-bold">Search results</h1>
          {q && (
            <p className="text-sm text-muted-foreground">for "{q}" · {results.length} matches</p>
          )}
        </div>

        {results.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-4">No results found</p>
            <Link to="/">
              <Button variant="outline">Go Home</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((r) => (
              <Card key={`${r.type}-${r.id}`} className="border-border/50 bg-gradient-card hover:border-primary/50 transition-all">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">{r.type}</div>
                      <h3 className="font-semibold text-lg leading-snug">{r.title}</h3>
                    </div>
                    {r.image && (
                      <img src={r.image} alt={r.title} className="h-14 w-14 rounded-md object-cover" />
                    )}
                  </div>

                  {r.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>
                  )}

                  {r.badges && r.badges.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {r.badges.map((b) => (
                        <Badge key={b} variant="outline" className="text-xs">{b}</Badge>
                      ))}
                    </div>
                  )}

                  <div className="pt-2">
                    {r.url.startsWith("http") ? (
                      <a href={r.url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">Open</Button>
                      </a>
                    ) : (
                      <Link to={r.url}>
                        <Button size="sm" variant="outline">Open</Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SearchResults;
