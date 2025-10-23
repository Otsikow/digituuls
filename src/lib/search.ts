import Fuse from "fuse.js";
import type { Product } from "@/data/products";
import type { CommunityTool } from "@/data/tools";
import type { Toolkit } from "@/data/toolkits";
import type { AppPage } from "@/data/pages";
import { products } from "@/data/products";
import { communityTools } from "@/data/tools";
import { toolkits } from "@/data/toolkits";
import { appPages } from "@/data/pages";

export type SearchEntity =
  | { type: "product"; data: Product }
  | { type: "tool"; data: CommunityTool }
  | { type: "toolkit"; data: Toolkit }
  | { type: "page"; data: AppPage };

export type SearchResult = {
  type: SearchEntity["type"];
  score?: number;
  // denormalized fields for rendering
  id: string;
  title: string;
  description?: string;
  image?: string;
  url: string;
  badges?: string[];
};

function normalizeData(): SearchEntity[] {
  const productEntities: SearchEntity[] = products.map((p) => ({ type: "product", data: p }));
  const toolEntities: SearchEntity[] = communityTools.map((t) => ({ type: "tool", data: t }));
  const toolkitEntities: SearchEntity[] = toolkits.map((t) => ({ type: "toolkit", data: t }));
  const pageEntities: SearchEntity[] = appPages.map((p) => ({ type: "page", data: p }));
  return [...productEntities, ...toolEntities, ...toolkitEntities, ...pageEntities];
}

const fuse = new Fuse<SearchEntity>(normalizeData(), {
  includeScore: true,
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 2,
  keys: [
    // products
    { name: "data.title", weight: 0.6 },
    { name: "data.subtitle", weight: 0.35 },
    { name: "data.category", weight: 0.25 },
    // tools
    { name: "data.description", weight: 0.3 },
    { name: "data.tags", weight: 0.25 },
    // toolkits
    { name: "data.slug", weight: 0.15 },
    // pages
    { name: "data.path", weight: 0.1 },
  ],
});

export function searchAll(query: string, limit = 20): SearchResult[] {
  if (!query?.trim()) return [];
  const results = fuse.search(query, { limit });
  return results.map(({ item, score }) => toSearchResult(item, score));
}

function toSearchResult(entity: SearchEntity, score?: number): SearchResult {
  switch (entity.type) {
    case "product": {
      const p = entity.data;
      return {
        type: entity.type,
        score,
        id: p.id,
        title: p.title,
        description: p.subtitle,
        image: p.image,
        url: `/product/${p.id}`,
        badges: [p.category].filter(Boolean),
      };
    }
    case "tool": {
      const t = entity.data;
      return {
        type: entity.type,
        score,
        id: t.id,
        title: t.title,
        description: t.description,
        image: t.image,
        url: t.websiteUrl,
        badges: [t.category, t.pricing, ...(t.tags ?? [])].filter(Boolean).slice(0, 4),
      };
    }
    case "toolkit": {
      const t = entity.data;
      return {
        type: entity.type,
        score,
        id: t.id,
        title: t.title,
        description: t.description,
        image: t.image,
        url: `/toolkits`,
        badges: [t.category, `${t.toolsCount} tools`],
      };
    }
    case "page": {
      const p = entity.data;
      return {
        type: entity.type,
        score,
        id: p.id,
        title: p.title,
        description: p.description,
        url: p.path,
      };
    }
  }
}

export function getQuickSuggestions(maxPerType = 5): SearchResult[] {
  const items: SearchResult[] = [];
  products.slice(0, maxPerType).forEach((p) =>
    items.push({ type: "product", id: p.id, title: p.title, description: p.subtitle, image: p.image, url: `/product/${p.id}`, badges: [p.category] })
  );
  communityTools.slice(0, maxPerType).forEach((t) =>
    items.push({ type: "tool", id: t.id, title: t.title, description: t.description, image: t.image, url: t.websiteUrl, badges: [t.category, t.pricing] })
  );
  toolkits.slice(0, maxPerType).forEach((t) =>
    items.push({ type: "toolkit", id: t.id, title: t.title, description: t.description, image: t.image, url: `/toolkit/${t.slug}`, badges: [t.category] })
  );
  appPages.slice(0, maxPerType).forEach((p) =>
    items.push({ type: "page", id: p.id, title: p.title, description: p.description, url: p.path })
  );
  return items;
}
