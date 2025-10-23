import { searchService } from './searchUtils';

export const refreshSearchIndex = async () => {
  try {
    await searchService.refreshData();
    return { success: true, message: 'Search index refreshed successfully' };
  } catch (error) {
    console.error('Failed to refresh search index:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to refresh search index' 
    };
  }
};

export const getSearchStats = async () => {
  try {
    // This would ideally come from a database query
    // For now, we'll return mock data
    return {
      totalItems: 0,
      lastUpdated: new Date().toISOString(),
      categories: {
        products: 0,
        tools: 0,
        toolkits: 0,
        users: 0,
        categories: 0
      }
    };
  } catch (error) {
    console.error('Failed to get search stats:', error);
    return null;
  }
};