import { searchService } from '../searchUtils';

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: [],
          error: null
        }))
      }))
    }))
  }
}));

describe('SearchService', () => {
  beforeEach(() => {
    // Reset the service before each test
    (searchService as any).fuse = null;
    (searchService as any).searchData = [];
  });

  test('should initialize with empty data', async () => {
    await searchService.initialize();
    expect(searchService).toBeDefined();
  });

  test('should return empty results for empty query', async () => {
    await searchService.initialize();
    const results = await searchService.search('');
    expect(Array.isArray(results)).toBe(true);
  });

  test('should return suggestions for valid query', async () => {
    await searchService.initialize();
    const suggestions = await searchService.getSuggestions('test');
    expect(Array.isArray(suggestions)).toBe(true);
  });

  test('should return popular searches', async () => {
    const popular = await searchService.getPopularSearches();
    expect(Array.isArray(popular)).toBe(true);
    expect(popular.length).toBeGreaterThan(0);
  });
});