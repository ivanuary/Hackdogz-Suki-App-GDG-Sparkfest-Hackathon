// search.js — shared matching logic, used by both the map (pin highlighting)
// and the UI screens (results list, nearby cards).

function itemMatchesQuery(item, query) {
  return item.name.toLowerCase().includes(query.toLowerCase());
}

function stallMatchesQuery(stall, query) {
  if (!query) return false;
  const q = query.toLowerCase();
  if (stall.label.toLowerCase().includes(q)) return true;
  return stall.items.some(it => itemMatchesQuery(it, q));
}

// True if a stall should be highlighted/included given current search state
// (covers both a real text search and the "browse all" quick-chip mode).
function stallIsHighlighted(stall) {
  if (browseAllActive) return true;
  return stallMatchesQuery(stall, currentSearchQuery);
}

function matchingItems(stall, query) {
  if (!query) return stall.items;
  const q = query.toLowerCase();
  const matches = stall.items.filter(it => itemMatchesQuery(it, q));
  return matches.length ? matches : stall.items;
}

function matchingItemsLabel(stall, query) {
  return matchingItems(stall, query)
    .map(it => escapeHtml(it.name) + (it.price ? ' · ₱' + escapeHtml(it.price) : ''))
    .join(', ');
}

// Returns the stalls to show in the results list given current state.
function getSearchResults() {
  if (browseAllActive) return stalls;
  if (!currentSearchQuery) return [];
  return stalls.filter(s => stallMatchesQuery(s, currentSearchQuery));
}
