// Enhanced fuzzy/context-aware search using Fuse.js
// Usage: import fuzzyFilter from './fuzzyFilter';
// filtered = fuzzyFilter(list, search, keys)

import Fuse from 'fuse.js';

export default function fuzzyFilter(list, search, keys) {
  if (!search || !search.trim()) return list;
  
  // Enhanced Fuse.js configuration for better search results
  const fuse = new Fuse(list, {
    keys: keys,
    threshold: 0.3, // Lower threshold for more accurate results
    ignoreLocation: true,
    minMatchCharLength: 2,
    isCaseSensitive: false,
    includeScore: true, // Include relevance scores
    includeMatches: true, // Include match details
    findAllMatches: true, // Find all matches, not just the first
    useExtendedSearch: true, // Enable advanced search operators
    distance: 100, // Allow for more typos
    location: 0,
    shouldSort: true, // Sort by relevance
    tokenize: true, // Split search into tokens
    matchAllTokens: false, // Don't require all tokens to match
  });
  
  const results = fuse.search(search);
  
  // Sort by relevance score and return items
  return results
    .sort((a, b) => (a.score || 1) - (b.score || 1))
    .map(result => result.item);
}

// Advanced search with multiple search strategies
export function advancedSearch(list, search, keys) {
  if (!search || !search.trim()) return list;
  
  const searchTerm = search.toLowerCase().trim();
  
  // Strategy 1: Exact matches (highest priority)
  let exactMatches = list.filter(item => 
    keys.some(key => {
      const value = item[key];
      return value && String(value).toLowerCase() === searchTerm;
    })
  );
  
  // Strategy 2: Starts with matches
  let startsWithMatches = list.filter(item => 
    keys.some(key => {
      const value = item[key];
      return value && String(value).toLowerCase().startsWith(searchTerm);
    })
  );
  
  // Strategy 3: Contains matches
  let containsMatches = list.filter(item => 
    keys.some(key => {
      const value = item[key];
      return value && String(value).toLowerCase().includes(searchTerm);
    })
  );
  
  // Strategy 4: Fuzzy search for remaining items
  const remainingItems = list.filter(item => 
    !exactMatches.includes(item) && 
    !startsWithMatches.includes(item) && 
    !containsMatches.includes(item)
  );
  
  const fuzzyResults = fuzzyFilter(remainingItems, search, keys);
  
  // Combine results in order of relevance
  return [...exactMatches, ...startsWithMatches, ...containsMatches, ...fuzzyResults];
}

// Search with highlighting
export function searchWithHighlighting(list, search, keys) {
  const results = fuzzyFilter(list, search, keys);
  
  return results.map(item => {
    const highlightedItem = { ...item };
    
    keys.forEach(key => {
      if (item[key] && search) {
        const value = String(item[key]);
        const regex = new RegExp(`(${search})`, 'gi');
        highlightedItem[`${key}_highlighted`] = value.replace(regex, '<mark>$1</mark>');
      }
    });
    
    return highlightedItem;
  });
}
