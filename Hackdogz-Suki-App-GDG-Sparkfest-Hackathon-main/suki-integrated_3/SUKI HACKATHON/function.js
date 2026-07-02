// =========================================================
// 1. SPLASH & LOADING SCREENS
// =========================================================
const splashScreen = document.getElementById('splash-screen');
const loadingScreen = document.getElementById('loading-screen');
const splashStartBtn = document.getElementById('splash-start-btn');

if (splashStartBtn) {
    splashStartBtn.addEventListener('click', function () {
        // Fade out splash
        splashScreen.classList.add('fade-out');
        setTimeout(() => splashScreen.classList.add('hidden'), 500);
        
        // Show loading
        loadingScreen.classList.add('active');
        
        // Fade out loading and show main app
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => loadingScreen.classList.add('hidden'), 500);
        }, 1800);
    });
}

// =========================================================
// 2. SCREEN NAVIGATION
// =========================================================
const screens = {
    start:   document.getElementById('start-screen'),
    results: document.getElementById('results-screen'),
    store:   document.getElementById('store-screen'),
    map:     document.getElementById('map-screen'),
};

function showScreen(name, options = {}) {
    // Always single screen flow (no side-by-side)
    Object.values(screens).forEach(s => {
        if (s) s.classList.remove('active', 'slide-up', 'slide-in');
    });
    
    const target = screens[name];
    if (!target) return;

    if (options.slideUp) {
        // Start off-screen (below), then animate up into view
        target.classList.add('active', 'slide-up');
        void target.offsetWidth; // force reflow
        requestAnimationFrame(() => target.classList.add('slide-in'));
    } else {
        target.classList.add('active');
    }
    
    // FIX: Leaflet needs to re-calculate its size when its hidden container becomes visible
    if (name === 'map' && typeof map !== 'undefined') {
        setTimeout(() => map.invalidateSize(), 150);
    }

    // The floating "Find Location" button lives outside the screens themselves
    // (anchored to .container in the HTML/CSS), so it only shows up while the
    // store screen is open.
    const findLocationBtn = document.getElementById('find-location-btn');
    if (findLocationBtn) {
        findLocationBtn.classList.toggle('visible', name === 'store');
    }
}

document.getElementById('back-btn')?.addEventListener('click', () => showScreen('results'));
document.getElementById('map-back-btn')?.addEventListener('click', () => showScreen('store'));
document.getElementById('menu-btn')?.addEventListener('click', () => alert('Menu coming soon!'));

// Logo tap -> always jump back to the very first search screen
document.querySelectorAll('.results-logo-img, .store-top-logo').forEach(function (logo) {
    logo.addEventListener('click', function () {
        showScreen('start');
    });
});


// =========================================================
// 3. STORE DATA, GEOLOCATION & BACKEND SEARCH
// =========================================================

// Fallback location shown only if the user denies/ignores the location
const TEMP_LOCATION = { lat: 14.5978, lng: 121.0110, label: 'PUP Sta. Mesa (default)' };
const STARTING_POINT = [TEMP_LOCATION.lat, TEMP_LOCATION.lng];

let USER_COORDS = { lat: TEMP_LOCATION.lat, lng: TEMP_LOCATION.lng };
let usingTempLocation = true;
let STORES = [];
let lastQuery = '';

// Search UI Elements
const loadingBox = document.getElementById('search-loading');
const emptyBox = document.getElementById('search-empty');
const errorBox = document.getElementById('search-error');
const resultsBox = document.getElementById('results-list');
const exactLabel = document.getElementById('exact-matches-label');
const exactBox = document.getElementById('exact-matches-list');
const relatedLabel = document.getElementById('related-matches-label');
const relatedBox = document.getElementById('related-matches-list');

function setSearchState(state) {
    if(loadingBox) loadingBox.classList.remove('active');
    if(emptyBox) emptyBox.classList.remove('active');
    if(errorBox) errorBox.classList.remove('active');
    if(resultsBox) resultsBox.classList.remove('active');

    if (state === 'loading' && loadingBox) loadingBox.classList.add('active');
    else if (state === 'empty' && emptyBox) emptyBox.classList.add('active');
    else if (state === 'error' && errorBox) errorBox.classList.add('active');
    else if (state === 'results' && resultsBox) {
        resultsBox.classList.add('active');
    }
}

function showLocationBanner(text) {
    let banner = document.getElementById('location-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'location-banner';
        banner.style.cssText = 'position:fixed; top:10px; left:50%; transform:translateX(-50%); background:#3a2010; color:#fff; padding:8px 16px; border-radius:20px; font-size:12px; z-index:9999; box-shadow:0 2px 8px rgba(0,0,0,0.3); max-width:90%; text-align:center;';
        document.body.appendChild(banner);
    }
    banner.textContent = text;
    banner.style.display = 'block';
    clearTimeout(banner._hideTimer);
    banner._hideTimer = setTimeout(() => { banner.style.display = 'none'; }, 4000);
}

function getUserLocation() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            usingTempLocation = true;
            showLocationBanner('📍 Geolocation not supported — using ' + TEMP_LOCATION.label);
            resolve(USER_COORDS);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                USER_COORDS = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                usingTempLocation = false;
                resolve(USER_COORDS);
            },
            () => {
                usingTempLocation = true;
                showLocationBanner('📍 Location access denied — using ' + TEMP_LOCATION.label);
                resolve(USER_COORDS);
            },
            { timeout: 8000 }
        );
    });
}

function transformStore(store) {
    const paymentLabels = { cash: '💵 Cash', gcash: '📱 Gcash', maya: '💳 Maya' };
    const payments = (store.payment_methods || []).map(p => paymentLabels[p.toLowerCase()] || p);
    const products = Object.entries(store.store_products || {}).map(([name, price]) => ({
        name: name.replace(/\b\w/g, c => c.toUpperCase()),
        price: price,
    }));

    function fmtTime(hhmm) {
        if (!hhmm) return '';
        const [h] = hhmm.split(':').map(Number);
        const suffix = h >= 12 ? 'PM' : 'AM';
        const hour = h % 12 === 0 ? 12 : h % 12;
        return hour + ':00 ' + suffix;
    }

    return {
        id: store.store_id,
        name: store.store_name,
        category: store.store_type || 'Store',
        type: store.store_type || 'Store',
        location: store.store_address,
        lat: store.latitude,
        lng: store.longitude,
        distance: typeof store.distance === 'number' ? store.distance : null,
        isOpen: store.is_open === true,
        hoursText: fmtTime(store.opening_time) + ' - ' + fmtTime(store.closing_time),
        payments: payments,
        products: products,
    };
}

async function fetchStores(product) {
    const params = new URLSearchParams({ product: product || '', lat: USER_COORDS.lat, lon: USER_COORDS.lng });
    const response = await fetch(`/search?${params.toString()}`);
    if (!response.ok) throw new Error('Backend request failed: ' + response.status);

    const data = await response.json();
    if (!data.has_results) return { exact: [], related: [] };

    return {
        exact: data.exact_matches.map(transformStore),
        related: data.related_matches.map(transformStore),
    };
}

async function loadInitialStores() {
    await getUserLocation();
    try {
        const { exact, related } = await fetchStores('');
        STORES = [...exact, ...related];
    } catch (err) {
        console.error('Could not load stores from backend:', err);
        STORES = [];
    }
    return STORES;
}

async function doSearch(query) {
    const q = query.trim();
    if (!q) return;
    lastQuery = q;
    
    const resInput = document.getElementById('results-search-input');
    if(resInput) resInput.value = q;

    showScreen('results');
    setSearchState('loading');

    let exact = [];
    let related = [];
    try {
        const result = await fetchStores(q);
        exact = result.exact;
        related = result.related;
    } catch (err) {
        console.error('Search request failed:', err);
        setSearchState('error');
        return;
    }

    if (!resultsBox || !exactBox || !relatedBox) return;
    exactBox.innerHTML = '';
    relatedBox.innerHTML = '';

    function renderCard(store, container) {
        const distStr = store.distance == null ? '' : (store.distance < 1 ? Math.round(store.distance * 1000) + ' m' : store.distance.toFixed(1) + ' km');

        const card = document.createElement('div');
        card.className = 'store-result-card';
        card.dataset.storeId = store.id;
        card.innerHTML = `
            <div class="store-result-thumb"></div>
            <div class="store-result-info">
                <div class="store-result-name">${store.name}</div>
                <div class="store-result-sub">${store.category} · ${store.location} ${distStr ? `<span style="color:#3a8a3a; font-weight:bold;">(📍 ${distStr})</span>` : ''}</div>
            </div>
            <span class="store-result-badge ${store.isOpen ? 'open' : 'closed'}">${store.isOpen ? 'OPEN' : 'CLOSED'}</span>
        `;
        card.addEventListener('click', () => openStore(store));
        container.appendChild(card);
    }

    if (exact.length === 0 && related.length === 0) {
        setSearchState('empty');
    } else {
        exact.forEach(store => renderCard(store, exactBox));
        related.forEach(store => renderCard(store, relatedBox));

        if(exactLabel) exactLabel.style.display = exact.length ? '' : 'none';
        if(relatedLabel) relatedLabel.style.display = related.length ? '' : 'none';

        setSearchState('results');
    }
}

document.getElementById('start-search-input')?.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && this.value.trim() !== '') doSearch(this.value);
});
document.getElementById('results-search-input')?.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && this.value.trim() !== '') doSearch(this.value);
});
document.getElementById('retry-search-btn')?.addEventListener('click', function () {
    if (lastQuery) doSearch(lastQuery);
});

// =========================================================
// 4. STORE UI LOGIC
// =========================================================
let currentViewedStore = null; 

function openStore(store) {
    currentViewedStore = store; 

    document.getElementById('store-name').textContent = store.name;
    const storeTypeTag = document.getElementById('store-type-tag');
    if(storeTypeTag) storeTypeTag.textContent = store.type;
    
    const statusEl = document.getElementById('store-status');
    if (statusEl) {
        statusEl.textContent = store.isOpen ? 'Open' : 'Closed';
        statusEl.className = 'store-status ' + (store.isOpen ? 'open' : 'closed');
    }
    
    const hoursEl = document.getElementById('store-hours');
    if(hoursEl) hoursEl.textContent = store.hoursText || '';

    const paymentList = document.getElementById('payment-list');
    if (paymentList && store.payments) {
        paymentList.innerHTML = store.payments.map(p => `<span class="payment-pill">${p}</span>`).join('');
    }

    const productsGrid = document.querySelector('#tab-products .products-grid');
    if (productsGrid) {
        productsGrid.innerHTML = (store.products && store.products.length)
            ? store.products.map(p => `
                <div class="product-card">
                    <div class="product-img-placeholder"></div>
                    <p class="product-name">${p.name}</p>
                    <p class="product-price">₱${Number(p.price).toFixed(2)}</p>
                </div>
              `).join('')
            : '<p style="color:#888; font-size:13px;">No products listed yet.</p>';
    }

    showScreen('store', { slideUp: true });
    activateTab('products');
    
    document.querySelectorAll('#store-screen .fade-section').forEach(el => el.classList.remove('visible'));
    setTimeout(() => { if (screens.store) screens.store.scrollTop = 0; }, 10);
    setTimeout(initStoreFade, 50);
}

// Map redirect logic
document.getElementById('find-location-btn')?.addEventListener('click', () => {
    showScreen('map', { slideUp: true }); 
    
    if (currentViewedStore && typeof map !== 'undefined') {
        setTimeout(() => {
            map.invalidateSize();
            map.flyTo([currentViewedStore.lat, currentViewedStore.lng], 18, { animate: true, duration: 1.2 });
            
            if(window.mainStoreMarker) map.removeLayer(window.mainStoreMarker);
            
            window.mainStoreMarker = L.marker([currentViewedStore.lat, currentViewedStore.lng])
                .addTo(map)
                .bindPopup(`<div style="text-align:center;"><b>${currentViewedStore.name}</b><br><span style="font-size:11px;color:#888;">${currentViewedStore.location}</span></div>`)
                .openPopup();
        }, 250); 
    }
});

function activateTab(tabName) {
    document.querySelectorAll('.tab-pill').forEach(pill => pill.classList.toggle('active', pill.dataset.tab === tabName));
    const target = document.getElementById('tab-' + tabName);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
document.querySelectorAll('.tab-pill').forEach(pill => {
    pill.addEventListener('click', function () { activateTab(this.dataset.tab); }); 
});

function initStoreFade() {
    const storeScreen = document.getElementById('store-screen');
    if (!storeScreen) return;
    
    const sections = storeScreen.querySelectorAll('.fade-section');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { root: storeScreen, threshold: 0.1, rootMargin: '0px 0px -20px 0px' });
    sections.forEach(el => observer.observe(el));
}


// =========================================================
// 5. MAP PROTOTYPE LOGIC (LEAFLET)
// =========================================================
const STORAGE_KEY = 'palengkemap:pins';

let pins = [];
let nextPinId = 1;
let nextItemId = 1;
let searchQuery = '';
let map, draftMarker = null;
const markersById = {};

function escapeHtml(str){
    const d = document.createElement('div');
    d.textContent = str == null ? '' : str;
    return d.innerHTML;
}

function flashInput(id){
    const el = document.getElementById(id);
    if(!el) return;
    el.style.borderColor = '#990000';
    el.focus();
    setTimeout(() => { el.style.borderColor = ''; }, 900);
}

function findPin(id){ return pins.find(p => p.id === id); }

function pinMatches(pin){
    if(!searchQuery) return false;
    const q = searchQuery.toLowerCase();
    return pin.items.some(it => it.name.toLowerCase().includes(q));
}

function matchedItemsLabel(pin){
    const q = searchQuery.toLowerCase();
    return pin.items.filter(it => it.name.toLowerCase().includes(q))
      .map(it => escapeHtml(it.name) + (it.price ? ' · ₱' + escapeHtml(it.price) : ''))
      .join(', ');
}

function pinIconHtml(extraClass){
    return '<div class="map-pin ' + extraClass + '"><span class="pin-dot"></span></div>';
}
function makeIcon(extraClass){
    return L.divIcon({ className:'', html: pinIconHtml(extraClass), iconSize:[26,26], iconAnchor:[13,26], popupAnchor:[0,-26] });
}

function newPinPopupHtml(lat, lng){
    return '<div class="popup-box">'
      + '<p style="font-size:11px; color:#7A4A22; margin:0 0 2px; text-transform:uppercase;">New store</p>'
      + '<h2 style="font-size:16px; margin:0 0 8px; color:#3a2010;">Add a pin here</h2>'
      + '<div class="label-row"><input id="pinLabelInput" type="text" placeholder="Store name (optional)"></div>'
      + '<div class="field-row">'
      + '<input id="itemNameInput" type="text" placeholder="Item, e.g. kalamansi" onkeydown="handleItemKey(event,\'new\')">'
      + '<input id="itemPriceInput" class="price" type="text" placeholder="₱/kg" onkeydown="handleItemKey(event,\'new\')">'
      + '</div>'
      + '<button class="save-btn" type="button" onclick="saveNewPin(' + lat + ',' + lng + ')">Save pin</button>'
      + '<button class="cancel-btn" type="button" onclick="cancelDraft()">Cancel</button>'
      + '</div>';
}

function editPinPopupHtml(pin){
    const itemsHtml = pin.items.map(it =>
      '<div class="item-row">'
      + '<span class="item-name">' + escapeHtml(it.name) + '</span>'
      + '<span class="item-price">' + (it.price ? '₱' + escapeHtml(it.price) : '—') + '</span>'
      + '<button class="stock-pill ' + (it.inStock ? 'in-stock' : 'out-stock') + '" type="button" onclick="toggleStock(' + pin.id + ',' + it.id + ')">' + (it.inStock ? 'In stock' : 'Out') + '</button>'
      + '<button class="remove-item" type="button" onclick="removeItem(' + pin.id + ',' + it.id + ')" aria-label="Remove">✕</button>'
      + '</div>'
    ).join('');
    return '<div class="popup-box">'
      + '<p style="font-size:11px; color:#7A4A22; margin:0 0 2px; text-transform:uppercase;">Store</p>'
      + '<div class="label-row"><input type="text" value="' + escapeHtml(pin.label) + '" onblur="updateLabel(' + pin.id + ', this.value)" onkeydown="if(event.key===\'Enter\') this.blur()"></div>'
      + '<div class="item-list">' + (itemsHtml || '<p style="color:#888; font-size:12px;">No items yet.</p>') + '</div>'
      + '<div class="field-row">'
      + '<input id="itemNameInput" type="text" placeholder="Add another item" onkeydown="handleItemKey(event,\'edit\',' + pin.id + ')">'
      + '<input id="itemPriceInput" class="price" type="text" placeholder="₱/kg" onkeydown="handleItemKey(event,\'edit\',' + pin.id + ')">'
      + '</div>'
      + '<button class="add-btn" type="button" onclick="addItem(' + pin.id + ')">Add item</button>'
      + '<button class="remove-pin" type="button" onclick="removePin(' + pin.id + ')">Remove this pin</button>'
      + '</div>';
}

function onMapClick(e){
    if(draftMarker){ map.removeLayer(draftMarker); draftMarker = null; }
    const { lat, lng } = e.latlng;
    draftMarker = L.marker([lat, lng], { icon: makeIcon('ghost') }).addTo(map);
    draftMarker.bindPopup(newPinPopupHtml(lat, lng), { minWidth: 226, closeButton: true }).openPopup();
}

function cancelDraft(){
    if(draftMarker){ map.closePopup(); map.removeLayer(draftMarker); draftMarker = null; }
}

function handleItemKey(ev, mode, pinId){
    if(ev.key === 'Enter'){
      if(mode === 'new' && draftMarker) saveNewPin(draftMarker.getLatLng().lat, draftMarker.getLatLng().lng);
      else if(mode === 'edit') addItem(pinId);
    }
}

function saveNewPin(lat, lng){
    const labelEl = document.getElementById('pinLabelInput');
    const label = labelEl ? labelEl.value.trim() : '';
    const name = document.getElementById('itemNameInput').value.trim();
    const price = document.getElementById('itemPriceInput').value.trim();
    if(!name){ flashInput('itemNameInput'); return; }

    if(draftMarker){ map.removeLayer(draftMarker); draftMarker = null; }

    const pin = { id: nextPinId++, label: label || ('Store ' + (pins.length + 1)), lat, lng, items: [{ id: nextItemId++, name, price, inStock: true }] };
    pins.push(pin);
    addPinMarker(pin);
    markersById[pin.id].openPopup();
    saveState();
}

function addPinMarker(pin){
    const marker = L.marker([pin.lat, pin.lng], { icon: makeIcon('') }).addTo(map);
    marker.bindPopup(editPinPopupHtml(pin), { minWidth: 226, closeButton: true });
    marker.on('click', () => marker.openPopup());
    markersById[pin.id] = marker;
}

function refreshPopup(pinId){
    const pin = findPin(pinId);
    const marker = markersById[pinId];
    if(!pin || !marker) return;
    marker.setPopupContent(editPinPopupHtml(pin));
}

function addItem(pinId){
    const name = document.getElementById('itemNameInput').value.trim();
    const price = document.getElementById('itemPriceInput').value.trim();
    if(!name){ flashInput('itemNameInput'); return; }
    findPin(pinId).items.push({ id: nextItemId++, name, price, inStock: true });
    refreshPopup(pinId);
    saveState();
}

function toggleStock(pinId, itemId){
    const item = findPin(pinId).items.find(i => i.id === itemId);
    item.inStock = !item.inStock;
    refreshPopup(pinId);
    saveState();
}

function removeItem(pinId, itemId){
    findPin(pinId).items = findPin(pinId).items.filter(i => i.id !== itemId);
    refreshPopup(pinId);
    saveState();
}

function updateLabel(pinId, value){
    const pin = findPin(pinId);
    if(pin) pin.label = value.trim() || pin.label;
    refreshPopup(pinId);
    saveState();
    renderResults();
}

function removePin(pinId){
    if(markersById[pinId]){ map.removeLayer(markersById[pinId]); delete markersById[pinId]; }
    pins = pins.filter(p => p.id !== pinId);
    saveState();
    renderResults();
}

function updateSearchVisuals(){
    pins.forEach(pin => {
      const marker = markersById[pin.id];
      if(!marker) return;
      if(pinMatches(pin)){
        marker.setIcon(makeIcon('matched'));
        marker.unbindTooltip();
        marker.bindTooltip(matchedItemsLabel(pin), { permanent: true, direction: 'top', offset: [0, -24], className: 'pin-tag-tooltip' }).openTooltip();
      } else {
        marker.unbindTooltip();
        marker.setIcon(makeIcon(searchQuery ? 'dimmed' : ''));
      }
    });
}

// Map Search & Reset
window.handleSearch = function(){
    searchQuery = document.getElementById('mapSearchInput').value.trim();
    updateSearchVisuals();
    renderResults();
};

document.getElementById('map-reset-btn')?.addEventListener('click', () => {
    if(!confirm('Clear all pins and start over?')) return;
    Object.values(markersById).forEach(m => map.removeLayer(m));
    Object.keys(markersById).forEach(k => delete markersById[k]);
    pins = [];
    document.getElementById('mapSearchInput').value = '';
    searchQuery = '';
    renderResults();
    saveState();
});

function locatePin(id){
    const pin = findPin(id);
    if(!pin || !markersById[id]) return;
    map.setView([pin.lat, pin.lng], 18);
    const marker = markersById[id];
    marker.openPopup();
    const el = marker.getElement();
    if(el){
        el.classList.add('flash');
        setTimeout(() => el.classList.remove('flash'), 1000);
    }
}

function renderResults(){
    const panel = document.getElementById('resultsPanel');
    if(!searchQuery){ panel.style.display = 'none'; panel.innerHTML = ''; return; }
    const q = searchQuery.toLowerCase();
    const rows = [];
    pins.forEach(pin => pin.items.forEach(it => { if(it.name.toLowerCase().includes(q)) rows.push({ pin, item: it }); }));
    
    panel.style.display = 'block';
    if(rows.length === 0){
      panel.innerHTML = `<p style="font-size:13px; color:#888;">No stalls found selling "${escapeHtml(searchQuery)}".</p>`;
      return;
    }
    panel.innerHTML = '<h3 style="font-size:12px; margin-bottom:8px; color:#7A4A22; text-transform:uppercase;">Map Results</h3>' + rows.map(r =>
      `<div class="result-row" style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-top:1px solid #e0c9a6; font-size:13px;">
          <span><b>${escapeHtml(r.pin.label)}</b> — ${escapeHtml(r.item.name)} ${r.item.price ? '₱'+r.item.price : ''}</span>
          <button style="border:none; background:#7A4A22; color:#fff; padding:6px 12px; border-radius:20px; font-size:11px; cursor:pointer;" onclick="locatePin(${r.pin.id})">Locate</button>
      </div>`
    ).join('');
}

async function saveState(){
    try { if(window.storage) await window.storage.set(STORAGE_KEY, JSON.stringify({ pins, nextPinId, nextItemId })); } catch(e){}
}

async function initMap(){
    if(!document.getElementById('leafletMap')) return;

    // Load geolocation and real store list before drawing anything
    await loadInitialStores();
    const centerPoint = [USER_COORDS.lat, USER_COORDS.lng];

    // Initialize map centered on the resolved location
    map = L.map('leafletMap', { zoomControl: false }).setView(centerPoint, 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    map.on('click', onMapClick);
    
    // 1. PLOT STARTING POINT
    const startIcon = L.divIcon({
        className: 'custom-start-icon',
        html: '<div style="background:#3a8a3a; width:18px; height:18px; border-radius:50%; border:3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9]
    });

    const startLabel = usingTempLocation ? TEMP_LOCATION.label : 'YOUR LOCATION';
    L.marker(centerPoint, { icon: startIcon, interactive: false }).addTo(map)
        .bindTooltip(`<b>${usingTempLocation ? 'STARTING POINT' : 'YOU ARE HERE'}</b><br>${startLabel}`, { permanent: true, direction: 'right', offset: [12, 0], className: 'pin-tag-tooltip' })
        .openTooltip();

    // 2. PLOT BACKEND STORES
    STORES.forEach(store => {
        const storeMarker = L.marker([store.lat, store.lng], { icon: makeIcon('') }).addTo(map);
        storeMarker.bindTooltip(`<b>${store.name}</b><br>${store.category}`, { direction: 'top', offset: [0, -20] });
        storeMarker.on('click', () => openStore(store));
    });

    // 3. LOAD USER-ADDED PINS
    try {
      if(window.storage){
        window.storage.get(STORAGE_KEY).then(res => {
          if(res && res.value){
            const data = JSON.parse(res.value);
            pins = data.pins || [];
            nextPinId = data.nextPinId || (pins.length + 1);
            nextItemId = data.nextItemId || 1;
            pins.forEach(addPinMarker);
          }
        });
      }
    } catch(e){}
}

// Initialize Leaflet Map
document.addEventListener('DOMContentLoaded', initMap);