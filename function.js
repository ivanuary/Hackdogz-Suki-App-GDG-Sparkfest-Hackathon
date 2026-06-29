//loading
window.addEventListener('load', function () {
    const loader = document.getElementById('loading-screen');
    setTimeout(function () {
        loader.classList.add('fade-out');
        setTimeout(function () {
            loader.classList.add('hidden');
        }, 500);
    }, 1800);
});

//screen
const screens = {
    start:   document.getElementById('start-screen'),
    results: document.getElementById('results-screen'),
    store:   document.getElementById('store-screen'),
    map:     document.getElementById('map-screen'),
};

function showScreen(name) {
    // Always single screen flow (no side-by-side)
    Object.values(screens).forEach(s => s.classList.remove('active'));
    if (screens[name]) {
        screens[name].classList.add('active');
    }
}

//data
const STORES = [
    {
        id: 1,
        name: 'Aling Nena\'s Tindahan',
        category: 'Sari-sari Store',
        location: 'Angono, Rizal',
        rating: '★★★★☆',
        ratingCount: 42,
        type: 'Sari-sari',
        openHours: { open: 6, close: 22 },
    },
    {
        id: 2,
        name: 'Mang Tino\'s Palengke',
        category: 'Palengke',
        location: 'Angono, Rizal',
        rating: '★★★★★',
        ratingCount: 88,
        type: 'Palengke',
        openHours: { open: 4, close: 12 },
    },
    {
        id: 3,
        name: 'Talipapa ng Barangay',
        category: 'Talipapa',
        location: 'Binangonan, Rizal',
        rating: '★★★☆☆',
        ratingCount: 15,
        type: 'Talipapa',
        openHours: { open: 5, close: 11 },
    },
    {
        id: 4,
        name: 'Ate Beng\'s Karinderya',
        category: 'Karinderya',
        location: 'Angono, Rizal',
        rating: '★★★★☆',
        ratingCount: 31,
        type: 'Karinderya',
        openHours: { open: 6, close: 20 },
    },
    {
        id: 5,
        name: 'Kuya Jun Bigasan',
        category: 'Bigasan · Rice Store',
        location: 'Cainta, Rizal',
        rating: '★★★★★',
        ratingCount: 55,
        type: 'Bigasan',
        openHours: { open: 7, close: 18 },
    },
];

function isStoreOpen(store) {
    const now = new Date();
    const pstHour = (now.getUTCHours() + 8) % 24;
    return pstHour >= store.openHours.open && pstHour < store.openHours.close;
}

function getEmoji(type) {
    return '';
}


//search res
function doSearch(query) {
    const q = query.trim().toLowerCase();
    if (!q) return;

    // Filter stores loosely
    const matched = STORES.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q)
    );

    const toShow = matched.length > 0 ? matched : STORES;

    const list = document.getElementById('results-list');
    list.innerHTML = '';

    toShow.forEach(function (store) {
        const open = isStoreOpen(store);
        const card = document.createElement('div');
        card.className = 'store-result-card';
        card.dataset.storeId = store.id;
        card.innerHTML = `
            <div class="store-result-thumb"></div>
            <div class="store-result-info">
                <div class="store-result-name">${store.name}</div>
                <div class="store-result-sub">${store.category} · ${store.location}</div>
                <div class="store-result-stars">${store.rating} <span style="color:#999;font-size:0.74rem">(${store.ratingCount})</span></div>
            </div>
            <span class="store-result-badge ${open ? 'open' : 'closed'}">${open ? 'OPEN' : 'CLOSED'}</span>
        `;
        card.addEventListener('click', function () {
            openStore(store);
        });
        list.appendChild(card);
    });

    document.getElementById('results-search-input').value = query;

    showScreen('results');
}

document.getElementById('results-search-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && this.value.trim() !== '') {
        doSearch(this.value);
    }
});


//open
function openStore(store) {
    document.getElementById('store-name').textContent = store.name;
    document.getElementById('store-type-tag').textContent = store.type;

    screens.store.scrollTop = 0;
    activateTab('products');
    showScreen('store');

    // Reset fade sections then re-observe
    document.querySelectorAll('#store-screen .fade-section').forEach(el => {
        el.classList.remove('visible');
    });
    setTimeout(initStoreFade, 50);
}


//search
const startSearchInput = document.getElementById('start-search-input');
const menuBtn = document.getElementById('menu-btn');

startSearchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && this.value.trim() !== '') {
        doSearch(this.value);
    }
});

menuBtn.addEventListener('click', function () {
    alert('Menu coming soon!');
});


//tabs
function activateTab(tabName) {
    // Update pill styles
    document.querySelectorAll('.tab-pill').forEach(function (pill) {
        pill.classList.toggle('active', pill.dataset.tab === tabName);
    });

  
    const target = document.getElementById('tab-' + tabName);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

document.querySelectorAll('.tab-pill').forEach(function (pill) {
    pill.addEventListener('click', function () {
        activateTab(this.dataset.tab);
    });
});


//return
document.getElementById('back-btn').addEventListener('click', function () {
    showScreen('results');
});

document.getElementById('map-back-btn').addEventListener('click', function () {
    showScreen('store');
});


//find loc
document.getElementById('find-location-btn').addEventListener('click', function () {
    showScreen('map');
});


//store status
function updateStoreStatus() {
}

updateStoreStatus();

// scroll fade-in for store screen
function initStoreFade() {
    const storeScreen = document.getElementById('store-screen');
    const sections = storeScreen.querySelectorAll('.fade-section');

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        root: storeScreen,
        threshold: 0.1,
        rootMargin: '0px 0px -20px 0px'
    });

    sections.forEach(function(el) {
        observer.observe(el);
    });
}