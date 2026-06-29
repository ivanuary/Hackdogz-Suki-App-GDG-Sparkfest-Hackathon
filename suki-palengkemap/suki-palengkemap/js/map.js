// map.js — the real, working map (originally PalengkeMap), adapted to read/write
// the shared `stalls` array from data.js so the rest of the app (search, results,
// detail, nearby cards) reflects whatever gets pinned here.

let map;
let draftMarker = null;
const markersById = {};

function pinIconHtml(extraClass) {
  return '<div class="map-pin ' + extraClass + '"><span class="pin-dot"></span></div>';
}
function makeIcon(extraClass) {
  return L.divIcon({ className: '', html: pinIconHtml(extraClass), iconSize: [26, 26], iconAnchor: [13, 26], popupAnchor: [0, -26] });
}

function flashInput(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.borderColor = 'var(--danger)';
  el.focus();
  setTimeout(() => { el.style.borderColor = ''; }, 900);
}

// ---- popup content builders ----
function newPinPopupHtml() {
  return '<div class="popup-box">'
    + '<p class="eyebrow" style="margin:0 0 2px;">New stall</p>'
    + '<h2>Add a pin here</h2>'
    + '<div class="label-row"><input id="pinLabelInput" type="text" placeholder="Stall name (optional)"></div>'
    + '<div class="field-row">'
    + '<input id="itemNameInput" type="text" placeholder="Item, e.g. kalamansi" onkeydown="handleItemKey(event,\'new\')">'
    + '<input id="itemPriceInput" class="price" type="text" placeholder="₱/kg" onkeydown="handleItemKey(event,\'new\')">'
    + '</div>'
    + '<button class="save-btn" type="button" onclick="saveNewPin()">Save pin</button>'
    + '<button class="cancel-btn" type="button" onclick="cancelDraft()">Cancel</button>'
    + '</div>';
}

function editPinPopupHtml(stall) {
  const itemsHtml = stall.items.map(it =>
    '<div class="item-row">'
    + '<span class="item-name">' + escapeHtml(it.name) + '</span>'
    + '<span class="item-price">' + (it.price ? '₱' + escapeHtml(it.price) : '—') + '</span>'
    + '<button class="stock-pill ' + (it.inStock ? 'in-stock' : 'out-stock') + '" type="button" onclick="toggleStock(' + stall.id + ',' + it.id + ')">' + (it.inStock ? 'In stock' : 'Out') + '</button>'
    + '<button class="remove-item" type="button" onclick="removeItem(' + stall.id + ',' + it.id + ')" aria-label="Remove ' + escapeHtml(it.name) + '">✕</button>'
    + '</div>'
  ).join('');
  return '<div class="popup-box">'
    + '<p class="eyebrow" style="margin:0 0 2px;">Stall</p>'
    + '<div class="label-row"><input type="text" value="' + escapeHtml(stall.label) + '" onblur="updateLabel(' + stall.id + ', this.value)" onkeydown="if(event.key===\'Enter\') this.blur()"></div>'
    + '<div class="item-list">' + (itemsHtml || '<p class="hint" style="margin:0;">No items yet.</p>') + '</div>'
    + '<div class="field-row">'
    + '<input id="itemNameInput" type="text" placeholder="Add another item" onkeydown="handleItemKey(event,\'edit\',' + stall.id + ')">'
    + '<input id="itemPriceInput" class="price" type="text" placeholder="₱/kg" onkeydown="handleItemKey(event,\'edit\',' + stall.id + ')">'
    + '</div>'
    + '<button class="add-btn" type="button" onclick="addItem(' + stall.id + ')">Add item</button>'
    + '<button class="remove-pin" type="button" onclick="removePin(' + stall.id + ')">Remove this pin</button>'
    + '</div>';
}

// ---- map interactions ----
function onMapClick(e) {
  if (draftMarker) { map.removeLayer(draftMarker); draftMarker = null; }
  const { lat, lng } = e.latlng;
  draftMarker = L.marker([lat, lng], { icon: makeIcon('ghost') }).addTo(map);
  draftMarker.bindPopup(newPinPopupHtml(), { minWidth: 226, closeButton: true }).openPopup();
}

function cancelDraft() {
  if (draftMarker) { map.closePopup(); map.removeLayer(draftMarker); draftMarker = null; }
}

function handleItemKey(ev, mode, stallId) {
  if (ev.key === 'Enter') {
    if (mode === 'new' && draftMarker) saveNewPin();
    else if (mode === 'edit') addItem(stallId);
  }
}

function saveNewPin() {
  const labelEl = document.getElementById('pinLabelInput');
  const label = labelEl ? labelEl.value.trim() : '';
  const name = document.getElementById('itemNameInput').value.trim();
  const price = document.getElementById('itemPriceInput').value.trim();
  if (!name) { flashInput('itemNameInput'); return; }

  const { lat, lng } = draftMarker.getLatLng();
  map.removeLayer(draftMarker);
  draftMarker = null;

  const stall = {
    id: nextStallId++,
    label: label || ('Stall ' + (stalls.length + 1)),
    lat, lng,
    items: [{ id: nextItemId++, name, price, inStock: true }]
  };
  stalls.push(stall);
  addPinMarker(stall);
  markersById[stall.id].openPopup();
  saveStalls();
  onStallsChanged();
}

function addPinMarker(stall) {
  const marker = L.marker([stall.lat, stall.lng], { icon: makeIcon('') }).addTo(map);
  marker.bindPopup(editPinPopupHtml(stall), { minWidth: 226, closeButton: true });
  marker.on('click', () => marker.openPopup());
  markersById[stall.id] = marker;
}

function refreshPopup(stallId) {
  const stall = findStall(stallId);
  const marker = markersById[stallId];
  if (!stall || !marker) return;
  marker.setPopupContent(editPinPopupHtml(stall));
}

function addItem(stallId) {
  const name = document.getElementById('itemNameInput').value.trim();
  const price = document.getElementById('itemPriceInput').value.trim();
  if (!name) { flashInput('itemNameInput'); return; }
  findStall(stallId).items.push({ id: nextItemId++, name, price, inStock: true });
  refreshPopup(stallId);
  saveStalls();
  onStallsChanged();
}

function toggleStock(stallId, itemId) {
  const item = findStall(stallId).items.find(i => i.id === itemId);
  item.inStock = !item.inStock;
  refreshPopup(stallId);
  saveStalls();
  onStallsChanged();
}

function removeItem(stallId, itemId) {
  const stall = findStall(stallId);
  stall.items = stall.items.filter(i => i.id !== itemId);
  refreshPopup(stallId);
  saveStalls();
  onStallsChanged();
}

function updateLabel(stallId, value) {
  const stall = findStall(stallId);
  if (stall) stall.label = value.trim() || stall.label;
  refreshPopup(stallId);
  saveStalls();
  onStallsChanged();
}

function removePin(stallId) {
  const marker = markersById[stallId];
  if (marker) { map.removeLayer(marker); delete markersById[stallId]; }
  stalls = stalls.filter(s => s.id !== stallId);
  saveStalls();
  onStallsChanged();
}

// ---- search visuals on the map itself ----
function updateMapSearchVisuals() {
  stalls.forEach(stall => {
    const marker = markersById[stall.id];
    if (!marker) return;
    const matched = stallIsHighlighted(stall);
    const activeQuery = browseAllActive ? '' : currentSearchQuery;
    if (matched && activeQuery) {
      marker.setIcon(makeIcon('matched'));
      marker.unbindTooltip();
      marker.bindTooltip(matchingItemsLabel(stall, activeQuery), { permanent: true, direction: 'top', offset: [0, -24], className: 'pin-tag-tooltip' }).openTooltip();
    } else if (matched) {
      // browse-all with no text query: just highlight, no per-item label needed
      marker.setIcon(makeIcon('matched'));
      marker.unbindTooltip();
    } else {
      marker.unbindTooltip();
      marker.setIcon(makeIcon((currentSearchQuery || browseAllActive) ? 'dimmed' : ''));
    }
  });
}

function locatePin(id) {
  const stall = findStall(id);
  const marker = markersById[id];
  if (!stall || !marker) return;
  map.setView([stall.lat, stall.lng], Math.max(map.getZoom(), DEFAULT_ZOOM));
  marker.openPopup();
  const el = marker.getElement();
  if (el) {
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 1000);
  }
}

function resetMap() {
  if (!confirm('Clear all pins and start over?')) return;
  Object.values(markersById).forEach(m => map.removeLayer(m));
  Object.keys(markersById).forEach(k => delete markersById[k]);
  stalls = [];
  saveStalls();
  onStallsChanged();
}

function initMap() {
  map = L.map('leafletMap', { zoomControl: true }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  map.on('click', onMapClick);

  stalls.forEach(addPinMarker);
}
