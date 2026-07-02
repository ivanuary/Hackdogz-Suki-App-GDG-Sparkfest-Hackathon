//splash screen then loading
const splashScreen = document.getElementById('splash-screen');
const loadingScreen = document.getElementById('loading-screen');
const splashStartBtn = document.getElementById('splash-start-btn');
 
splashStartBtn.addEventListener('click', function () {
    // splash fade out
    splashScreen.classList.add('fade-out');
    setTimeout(function () {
        splashScreen.classList.add('hidden');
    }, 500);
 
    // going to loading
    loadingScreen.classList.add('active');
 
    // loading fade out and main screen
    setTimeout(function () {
        loadingScreen.classList.add('fade-out');
        setTimeout(function () {
            loadingScreen.classList.add('hidden');
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

function showScreen(name, options) {
    options = options || {};

    // Always single screen flow (no side-by-side)
    Object.values(screens).forEach(function (s) {
        s.classList.remove('active', 'slide-up', 'slide-in');
    });

    const target = screens[name];
    if (!target) return;

    if (options.slideUp) {
        // Start off-screen (below), then animate up into view
        target.classList.add('active', 'slide-up');
        // force reflow so the starting position is applied before we animate
        void target.offsetWidth;
        requestAnimationFrame(function () {
            target.classList.add('slide-in');
        });
    } else {
        target.classList.add('active');
    }

    // The floating "Find Location" button lives outside the screens themselves,
    // so it only shows up while the store screen is open.
    const findLocationBtn = document.getElementById('find-location-btn');
    if (findLocationBtn) {
        findLocationBtn.classList.toggle('visible', name === 'store');
    }
}

// Logo tap -> always jump back to the very first search screen
document.querySelectorAll('.results-logo-img, .store-top-logo').forEach(function (logo) {
    logo.addEventListener('click', function () {
        showScreen('start');
    });
});

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
        payments: ['Cash', 'Gcash', 'Maya'],
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
        payments: ['Cash'],
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
        payments: ['Cash', 'Gcash'],
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
        payments: ['Cash', 'Gcash', 'Maya'],
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
        payments: ['Cash', 'Gcash'],
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
//search res
const loadingBox = document.getElementById('search-loading');
const emptyBox = document.getElementById('search-empty');
const errorBox = document.getElementById('search-error');
const resultsBox = document.getElementById('results-list');
const resultsLabel = document.getElementById('results-label');

let lastQuery = '';

function setSearchState(state) {
    loadingBox.classList.remove('active');
    emptyBox.classList.remove('active');
    errorBox.classList.remove('active');
    resultsBox.classList.remove('active');
    resultsLabel.classList.remove('active');

    if (state === 'loading') {
        loadingBox.classList.add('active');
    } else if (state === 'empty') {
        emptyBox.classList.add('active');
    } else if (state === 'error') {
        errorBox.classList.add('active');
    } else if (state === 'results') {
        resultsBox.classList.add('active');
        resultsLabel.classList.add('active');
    }
}

function renderStoreCard(store) {
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
    return card;
}

function renderResults(list) {
    resultsBox.innerHTML = '';
    list.forEach(function (store) {
        resultsBox.appendChild(renderStoreCard(store));
    });
}

function getSearchResults(query) {
    const q = query.trim().toLowerCase();
    return STORES.filter(function (store) {
        return store.name.toLowerCase().includes(q) ||
               store.category.toLowerCase().includes(q) ||
               store.location.toLowerCase().includes(q) ||
               store.type.toLowerCase().includes(q);
    });
}

function doSearch(query) {
    const trimmed = query.trim();
    if (trimmed === '') {
        return;
    }

    lastQuery = query;
    document.getElementById('results-search-input').value = query;

    showScreen('results');
    setSearchState('loading');

    setTimeout(function () {
        const matched = getSearchResults(query);

        if (matched.length === 0) {
            setSearchState('empty');
        } else {
            renderResults(matched);
            setSearchState('results');
        }
    }, 500);
}

document.getElementById('results-search-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && this.value.trim() !== '') {
        doSearch(this.value);
    }
});

document.getElementById('retry-search-btn').addEventListener('click', function () {
    if (lastQuery) {
        doSearch(lastQuery);
    }
});

//open
function openStore(store) {
    document.getElementById('store-name').textContent = store.name;
    document.getElementById('store-type-tag').textContent = store.type;

    // Status + hours
    const open = isStoreOpen(store);
    const statusEl = document.getElementById('store-status');
    statusEl.textContent = open ? 'Open' : 'Closed';
    statusEl.className = 'store-status ' + (open ? 'open' : 'closed');

    function fmt(h) {
        const suffix = h >= 12 ? 'PM' : 'AM';
        const hour = h % 12 === 0 ? 12 : h % 12;
        return hour + ':00 ' + suffix;
    }
    document.getElementById('store-hours').textContent =
        fmt(store.openHours.open) + ' - ' + fmt(store.openHours.close);

    // Payments
    const paymentList = document.getElementById('payment-list');
    paymentList.innerHTML = store.payments
        .map(p => `<span class="payment-pill">${p}</span>`)
        .join('');

    showScreen('store', { slideUp: true });

    document.querySelectorAll('#store-screen .fade-section').forEach(el => {
        el.classList.remove('visible');
    });

    document.querySelectorAll('.tab-pill').forEach(function (pill) {
        pill.classList.toggle('active', pill.dataset.tab === 'products');
    });

    setTimeout(function () {
        screens.store.scrollTop = 0;
    }, 10);

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
    showScreen('map', { slideUp: true });
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