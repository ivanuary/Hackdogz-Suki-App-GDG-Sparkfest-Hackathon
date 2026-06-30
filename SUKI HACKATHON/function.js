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

function showScreen(name) {
    // Safety check: only remove active class if the screen actually exists
    Object.values(screens).forEach(s => {
        if (s) s.classList.remove('active');
    });
    
    if (screens[name]) {
        screens[name].classList.add('active');
        
        // FIX: Leaflet needs to re-calculate its size when its hidden container becomes visible
        if (name === 'map' && typeof map !== 'undefined') {
            setTimeout(() => map.invalidateSize(), 150);
        }
    }
}

document.getElementById('back-btn')?.addEventListener('click', () => showScreen('results'));
document.getElementById('map-back-btn')?.addEventListener('click', () => showScreen('store'));
document.getElementById('menu-btn')?.addEventListener('click', () => alert('Menu coming soon!'));


// =========================================================
// 3. STORE DATA & SEARCH
// =========================================================

// FIX: Define as a simple array so it doesn't crash if Leaflet loads late
const STARTING_POINT = [14.5978, 121.0110]; // PUP Sta. Mesa

const STORES = [
    { id: 1, name: 'Aling Nena\'s Tindahan', category: 'Sari-sari Store', location: 'Teresa St.', lat: 14.5985, lng: 121.0095, rating: '★★★★☆', ratingCount: 42, type: 'Sari-sari', openHours: { open: 6, close: 22 }, payments: ['💵 Cash', '📱 Gcash', '💳 Maya'] },
    { id: 2, name: 'Mang Tino\'s Palengke', category: 'Palengke', location: 'Old Sta. Mesa', lat: 14.5992, lng: 121.0125, rating: '★★★★★', ratingCount: 88, type: 'Palengke', openHours: { open: 4, close: 12 }, payments: ['💵 Cash'] },
    { id: 3, name: 'Talipapa ng Barangay', category: 'Talipapa', location: 'Pureza', lat: 14.6005, lng: 121.0040, rating: '★★★☆☆', ratingCount: 15, type: 'Talipapa', openHours: { open: 5, close: 11 }, payments: ['💵 Cash', '📱 Gcash'] },
    { id: 4, name: 'Ate Beng\'s Karinderya', category: 'Karinderya', location: 'Stop & Shop', lat: 14.6010, lng: 121.0150, rating: '★★★★☆', ratingCount: 31, type: 'Karinderya', openHours: { open: 6, close: 20 }, payments: ['💵 Cash', '📱 Gcash', '💳 Maya'] },
    { id: 5, name: 'Kuya Jun Bigasan', category: 'Bigasan', location: 'V. Mapa', lat: 14.6030, lng: 121.0175, rating: '★★★★★', ratingCount: 55, type: 'Bigasan', openHours: { open: 7, close: 18 }, payments: ['💵 Cash', '📱 Gcash'] },
];

function isStoreOpen(store) {
    const now = new Date();
    const pstHour = (now.getUTCHours() + 8) % 24; // Convert to Philippine Standard Time
    return pstHour >= store.openHours.open && pstHour < store.openHours.close;
}

function doSearch(query) {
    const q = query.trim().toLowerCase();
    if (!q) return;
    
    const matched = STORES.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.category.toLowerCase().includes(q) || 
        s.location.toLowerCase().includes(q) || 
        s.type.toLowerCase().includes(q)
    );
    
    const toShow = matched.length > 0 ? matched : STORES;
    const list = document.getElementById('results-list');
    if (!list) return;
    
    list.innerHTML = '';

    toShow.forEach(function (store) {
        const open = isStoreOpen(store);
        
        // FIX: Ask Leaflet for the distance only when a search happens
        const startLatLng = L.latLng(STARTING_POINT[0], STARTING_POINT[1]);
        const storeLatLng = L.latLng(store.lat, store.lng);
        const distanceMeters = startLatLng.distanceTo(storeLatLng);
        
        // Format distance: show meters if under 1km, otherwise show km
        const distStr = distanceMeters < 1000 
            ? Math.round(distanceMeters) + ' m' 
            : (distanceMeters / 1000).toFixed(1) + ' km';

        const card = document.createElement('div');
        card.className = 'store-result-card';
        card.dataset.storeId = store.id;
        card.innerHTML = `
            <div class="store-result-thumb"></div>
            <div class="store-result-info">
                <div class="store-result-name">${store.name}</div>
                <div class="store-result-sub">${store.category} · ${store.location} <span style="color:#3a8a3a; font-weight:bold;">(📍 ${distStr})</span></div>
                <div class="store-result-stars">${store.rating} <span style="color:#999;font-size:0.74rem">(${store.ratingCount})</span></div>
            </div>
            <span class="store-result-badge ${open ? 'open' : 'closed'}">${open ? 'OPEN' : 'CLOSED'}</span>
        `;
        card.addEventListener('click', () => openStore(store));
        list.appendChild(card);
    });
    
    document.getElementById('results-search-input').value = query;
    showScreen('results');
}

// Search Inputs
document.getElementById('start-search-input')?.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && this.value.trim() !== '') doSearch(this.value);
});

document.getElementById('results-search-input')?.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && this.value.trim() !== '') doSearch(this.value);
});


// =========================================================
// 4. STORE UI LOGIC
// =========================================================
let currentViewedStore = null; 

function openStore(store) {
    currentViewedStore = store; 

    document.getElementById('store-name').textContent = store.name;
    document.getElementById('store-type-tag').textContent = store.type;
    
    // Status + hours
    const open = isStoreOpen(store);
    const statusEl = document.getElementById('store-status');
    if (statusEl) {
        statusEl.textContent = open ? 'Open' : 'Closed';
        statusEl.className = 'store-status ' + (open ? 'open' : 'closed');
    }

    function fmt(h) {
        const suffix = h >= 12 ? 'PM' : 'AM';
        const hour = h % 12 === 0 ? 12 : h % 12;
        return hour + ':00 ' + suffix;
    }
    document.getElementById('store-hours').textContent = fmt(store.openHours.open) + ' - ' + fmt(store.openHours.close);

    // Payments
    const paymentList = document.getElementById('payment-list');
    if (paymentList && store.payments) {
        paymentList.innerHTML = store.payments.map(p => `<span class="payment-pill">${p}</span>`).join('');
    }

    if (screens.store) screens.store.scrollTop = 0;
    activateTab('products');
    showScreen('store');
    
    document.querySelectorAll('#store-screen .fade-section').forEach(el => el.classList.remove('visible'));
    setTimeout(initStoreFade, 50);
}

// Find on Map button logic
document.getElementById('find-location-btn')?.addEventListener('click', () => {
    showScreen('map'); 
    
    if (currentViewedStore && typeof map !== 'undefined') {
        setTimeout(() => {
            map.invalidateSize();
            
            // Fly the camera to the shop's exact coordinates
            map.flyTo([currentViewedStore.lat, currentViewedStore.lng], 18, { animate: true, duration: 1.2 });
            
            // Clear any old "main" pin we dropped before
            if(window.mainStoreMarker) {
                map.removeLayer(window.mainStoreMarker);
            }
            
            // Drop a brand new pin with the shop's name
            window.mainStoreMarker = L.marker([currentViewedStore.lat, currentViewedStore.lng])
                .addTo(map)
                .bindPopup(`<div style="text-align:center;"><b>${currentViewedStore.name}</b><br><span style="font-size:11px;color:#888;">${currentViewedStore.location}</span></div>`)
                .openPopup();
                
        }, 250); 
    }
});


// Tabs functionality
function activateTab(tabName) {
    document.querySelectorAll('.tab-pill').forEach(pill => pill.classList.toggle('active', pill.dataset.tab === tabName));
    const target = document.getElementById('tab-' + tabName);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
document.querySelectorAll('.tab-pill').forEach(pill => pill.addEventListener('click', function () { activateTab(this.dataset.tab); }));

// Scroll fade-in animations
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

function initMap(){
    if(!document.getElementById('leafletMap')) return;
    
    // Initialize map centered at PUP (using the standard array we defined at the top)
    map = L.map('leafletMap', { zoomControl: false }).setView(STARTING_POINT, 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    map.on('click', onMapClick);
    
    // --- 1. PLOT STARTING POINT (PUP) ---
    const startIcon = L.divIcon({
        className: 'custom-start-icon',
        html: '<div style="background:#3a8a3a; width:18px; height:18px; border-radius:50%; border:3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9]
    });

    L.marker(STARTING_POINT, { icon: startIcon, interactive: false }).addTo(map)
        .bindTooltip("<b>STARTING POINT</b><br>PUP Sta. Mesa", { permanent: true, direction: 'right', offset: [12, 0], className: 'pin-tag-tooltip' })
        .openTooltip();

    // --- 2. PLOT THE DATABASE STORES ---
    STORES.forEach(store => {
        const storeMarker = L.marker([store.lat, store.lng], { icon: makeIcon('') }).addTo(map);
        storeMarker.bindTooltip(`<b>${store.name}</b><br>${store.category}`, { direction: 'top', offset: [0, -20] });
    });

    // --- 3. LOAD USER-ADDED PINS FROM STORAGE ---
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