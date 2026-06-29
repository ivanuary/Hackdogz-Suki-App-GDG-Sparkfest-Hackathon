// ui.js — screen navigation (from the original Suki prototype) plus rendering
// functions that pull real data from `stalls` instead of hardcoded mock content.

function goTo(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.nav === screenId));
  if (screenId === 'mapview' && map) {
    // Leaflet needs a nudge after becoming visible/resized
    setTimeout(() => map.invalidateSize(), 50);
  }
}

function quickSearch(term, isBrowseAll) {
  browseAllActive = !!isBrowseAll;
  currentSearchQuery = term || '';
  syncSearchInputs(currentSearchQuery);
  goTo('results');
  renderResultsList();
  updateMapSearchVisuals();
  renderMapSheet();
}

function runSearchFrom(inputId) {
  const value = document.getElementById(inputId).value.trim();
  browseAllActive = false;
  currentSearchQuery = value;
  syncSearchInputs(value);
  goTo('results');
  renderResultsList();
  updateMapSearchVisuals();
  renderMapSheet();
}

function syncSearchInputs(value) {
  const landing = document.getElementById('searchInputLanding');
  const results = document.getElementById('searchInputResults');
  if (landing) landing.value = value;
  if (results) results.value = value;
}

function renderNearby() {
  const el = document.getElementById('nearbyScroll');
  if (!el) return;
  if (!stalls.length) {
    el.innerHTML = '<div class="empty-nearby">No stalls registered yet — open the map and tap anywhere to add the first one.</div>';
    return;
  }
  el.innerHTML = stalls.slice(0, 8).map(s => {
    const itemCount = s.items.length;
    return '<div class="nearby-card" onclick="openDetail(' + s.id + ')">'
      + '<div class="thumb"></div>'
      + '<div class="info"><div class="name">' + escapeHtml(s.label) + '</div><div class="meta">' + itemCount + ' item' + (itemCount !== 1 ? 's' : '') + '</div></div>'
      + '</div>';
  }).join('');
}

function renderResultsList() {
  const meta = document.getElementById('resultsMeta');
  const list = document.getElementById('resultList');
  if (!meta || !list) return;

  const results = getSearchResults();
  const queryLabel = currentSearchQuery ? ' for "' + escapeHtml(currentSearchQuery) + '"' : '';
  meta.textContent = results.length + ' suki spot' + (results.length !== 1 ? 's' : '') + ' found' + (browseAllActive ? '' : queryLabel);

  if (!results.length) {
    list.innerHTML = '<p class="empty-results">' + ((currentSearchQuery || browseAllActive)
      ? 'No stalls found. Try a different search, or add one yourself on the map.'
      : 'Search for an item above to find a stall that has it.') + '</p>';
    return;
  }

  list.innerHTML = results.map(s => {
    const dist = formatDistance(distanceMeters(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng, s.lat, s.lng));
    const matchLine = (!browseAllActive && currentSearchQuery)
      ? '<div class="result-match-line">' + matchingItemsLabel(s, currentSearchQuery) + '</div>'
      : '';
    return '<div class="result-card" onclick="openDetail(' + s.id + ')">'
      + '<div class="thumb"></div>'
      + '<div class="body">'
      + '<div class="result-row1"><span class="name">' + escapeHtml(s.label) + '</span><span class="result-distance">' + dist + '</span></div>'
      + '<div class="result-meta-line">' + s.items.length + ' item' + (s.items.length !== 1 ? 's' : '') + ' listed</div>'
      + matchLine
      + '</div>'
      + '</div>';
  }).join('');
}

function openDetail(id) {
  const stall = findStall(id);
  if (!stall) return;
  currentDetailStallId = id;

  document.getElementById('detailName').textContent = stall.label;
  document.getElementById('detailItemCount').textContent = stall.items.length + ' item' + (stall.items.length !== 1 ? 's' : '');
  document.getElementById('detailDistance').textContent = formatDistance(distanceMeters(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng, stall.lat, stall.lng));

  const productsEl = document.getElementById('detailProducts');
  productsEl.innerHTML = stall.items.map(it =>
    '<div class="product-card"><div class="thumb"></div><div class="info">'
    + '<div class="name">' + escapeHtml(it.name) + '</div>'
    + '<div class="price">' + (it.price ? '₱' + escapeHtml(it.price) : '—') + '</div>'
    + '<div class="stock ' + (it.inStock ? 'in' : 'out') + '">' + (it.inStock ? 'In stock' : 'Out of stock') + '</div>'
    + '</div></div>'
  ).join('') || '<p class="hint-note">No items listed yet.</p>';

  goTo('detail');
}

function findThisStall() {
  if (currentDetailStallId == null) return;
  goTo('mapview');
  setTimeout(() => locatePin(currentDetailStallId), 60);
}

function renderMapSheet() {
  const sheet = document.getElementById('mapSheet');
  if (!sheet) return;

  if (!currentSearchQuery && !browseAllActive) {
    sheet.innerHTML = '<div class="handle"></div><div class="map-sheet-empty">Tap the map to add a stall, or search to find one.</div>';
    return;
  }

  const results = getSearchResults();
  if (!results.length) {
    sheet.innerHTML = '<div class="handle"></div><div class="map-sheet-empty">No stalls match yet.</div>';
    return;
  }

  sheet.innerHTML = '<div class="handle"></div><div class="map-sheet-title">' + results.length + ' match' + (results.length !== 1 ? 'es' : '') + '</div>'
    + results.map(s => {
      const dist = formatDistance(distanceMeters(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng, s.lat, s.lng));
      return '<div class="map-sheet-row"><div><div class="name">' + escapeHtml(s.label) + '</div><div class="meta">' + dist + '</div></div><button onclick="locatePin(' + s.id + ')">Locate</button></div>';
    }).join('');
}

// Called by map.js after any add/edit/remove so every screen stays in sync.
function onStallsChanged() {
  renderNearby();
  renderResultsList();
  renderMapSheet();
}
