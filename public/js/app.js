/* ============================================
   GIZDODOSPECIALS — Customer App Logic
   Faithful port of V3 (Zustand + React) → vanilla JS
   ============================================ */
(function () {
  'use strict';

  /* --------------------------------------------
     CONFIG
  -------------------------------------------- */
  const CONFIG = {
    WHATSAPP_PHONE: '+2349023731643',
    BANK_NAME: 'GTBank',
    BANK_ACCOUNT: '3005029891',
    BANK_ACC_NAME: 'Gizdodo Special Hub',
    SUPABASE_URL: '',
    SUPABASE_KEY: '',
  };

  // Inject env vars if available (Netlify injects window.ENV)
  if (window.ENV) {
    Object.assign(CONFIG, window.ENV);
  }

  /* --------------------------------------------
     SVG ICONS (inline, no external dep)
  -------------------------------------------- */
  const ICONS = {
    shoppingBag: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    plus: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    minus: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    x: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    menu: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>',
    arrowLeft: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    search: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    check: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    checkCircle: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    leaf: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
    heart: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    truck: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    phone: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    mail: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    mapPin: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    clock: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    store: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    creditCard: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
    chefHat: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>',
    package: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    landmark: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>',
    loader: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>',
    instagram: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
    music: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    messageCircle: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
    utensils: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>',
  };

  /* --------------------------------------------
     PRODUCT DATA (from V3 seed.ts)
  -------------------------------------------- */
  const PRODUCTS = [
    { id: 'gizdodo', name: 'Gizdodo', description: 'Our signature dish — perfectly fried plantain (dodo) paired with sautéed gizzard in a rich, spicy sauce. A Lagos favourite.', category: 'mains', acceptsAddons: true, regular: 9000, maxi: 15000, combo: 17000, comboLabel: 'Gizdodo + Spaghetti', images: { regular: '', maxi: '', combo: '' } },
    { id: 'chickendodo', name: 'Chickendodo', description: 'Crispy fried plantain served with succulent, well-seasoned chicken in our special sauce.', category: 'mains', acceptsAddons: true, regular: 9000, maxi: 15000, combo: 18000, comboLabel: 'Chickendodo + Special Toppings', images: { regular: '', maxi: '', combo: '' } },
    { id: 'turkeydodo', name: 'Turkeydodo', description: 'Juicy smoked turkey paired with golden fried plantain and our signature savoury sauce.', category: 'mains', acceptsAddons: true, regular: 10000, maxi: 17000, combo: 20000, comboLabel: 'Turkeydodo + Extra Cheese', images: { regular: '', maxi: '', combo: '' } },
    { id: 'beefdodo', name: 'Beefdodo', description: 'Tender, flavourful beef served with crispy fried plantain in a rich pepper sauce.', category: 'mains', acceptsAddons: true, regular: 8000, maxi: 13000, combo: 15000, comboLabel: 'Beefdodo + Extra Noodles', images: { regular: '', maxi: '', combo: '' } },
    { id: 'snaildodo', name: 'Snaildodo', description: 'Perfectly cooked snails in a fiery, aromatic sauce alongside golden plantain. A delicacy!', category: 'mains', acceptsAddons: true, regular: 10000, maxi: 20000, combo: null, comboLabel: null, images: { regular: '', maxi: '', combo: '' } },
    { id: 'chickenfeet', name: 'Chicken Feet Mix', description: 'Spicy, saucy chicken feet mixed with peppers and onions, served with fried plantain.', category: 'mains', acceptsAddons: true, regular: 9000, maxi: 13000, combo: null, comboLabel: null, images: { regular: '', maxi: '', combo: '' } },
  ];

  const ADDONS = [
    { id: 'pasta', name: 'Pasta', description: 'Well-cooked pasta to pair with your Maxi meal.', price: 2000 },
    { id: 'spaghetti', name: 'Spaghetti', description: 'Classic spaghetti, perfectly boiled.', price: 2000 },
    { id: 'noodles', name: 'Noodles', description: 'Soft and tasty noodles.', price: 2000 },
    { id: 'rice', name: 'Rice', description: 'Fluffy white rice.', price: 2000 },
    { id: 'cheese', name: 'Cheese', description: 'Melted cheese topping for extra richness.', price: 3000 },
    { id: 'toppings', name: 'Special Topping Mix', description: 'Our exclusive blend of premium toppings.', price: 3000 },
  ];

  const DRINKS = [
    { id: 'pineapple', name: 'Pineapple Juice', price: 3000 },
    { id: 'pineapple-ginger', name: 'Pineapple + Ginger Juice', price: 3000 },
    { id: 'chapman', name: 'Chapman', price: 3000 },
  ];

  /* --------------------------------------------
     STATE (replaces Zustand)
  -------------------------------------------- */
  const state = {
    currentView: 'home',
    tier: 'regular',
    categoryFilter: 'all',
    cart: [],
    mobileNavOpen: false,
    cartOpen: false,
    checkoutOpen: false,
    addonPickerOpen: false,
    pendingCartItem: null,
    selectedAddonIds: new Set(),
    trackingInput: '',
  };

  /* --------------------------------------------
     HELPERS
  -------------------------------------------- */
  function formatPrice(amount) {
    return '\u20A6' + amount.toLocaleString();
  }

  function getCartTotal() {
    return state.cart.reduce(function (sum, item) {
      var addonsTotal = item.addOns.reduce(function (s, a) { return s + a.price; }, 0);
      return sum + (item.price + addonsTotal) * item.quantity;
    }, 0);
  }

  function getCartCount() {
    return state.cart.reduce(function (sum, item) { return sum + item.quantity; }, 0);
  }

  function cartItemKey(item) {
    return item.productId + '-' + item.tier + '-' + item.addOns.map(function (a) { return a.name; }).sort().join(',');
  }

  function relativeTime(dateStr) {
    var now = Date.now();
    var then = new Date(dateStr).getTime();
    var mins = Math.floor((now - then) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return mins + ' min ago';
    var hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + ' hour' + (hrs > 1 ? 's' : '') + ' ago';
    return Math.floor(hrs / 24) + 'd ago';
  }

  /* --------------------------------------------
     TOAST (replaces Sonner)
  -------------------------------------------- */
  function toast(message, type) {
    type = type || 'success';
    var container = document.getElementById('toast-container');
    var el = document.createElement('div');
    el.className = 'toast ' + type;
    var iconName = type === 'success' ? 'checkCircle' : 'x';
    el.innerHTML = '<span class="toast-icon">' + ICONS[iconName] + '</span><span>' + message + '</span>';
    container.appendChild(el);
    setTimeout(function () {
      el.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(function () { el.remove(); }, 300);
    }, 4000);
  }

  /* --------------------------------------------
     VIEW ROUTING
  -------------------------------------------- */
  function setView(view) {
    state.currentView = view;
    state.mobileNavOpen = false;
    closeMobileNav();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Update URL hash
    if (view === 'home') history.pushState('', '', window.location.pathname);
    else window.location.hash = view;
    renderView();
  }

  function renderView() {
    var sections = document.querySelectorAll('.view-section');
    for (var i = 0; i < sections.length; i++) {
      sections[i].classList.remove('active');
    }
    var target = document.getElementById('view-' + state.currentView);
    if (target) target.classList.add('active');
    // Update nav active states
    var navLinks = document.querySelectorAll('[data-nav]');
    for (var j = 0; j < navLinks.length; j++) {
      navLinks[j].classList.toggle('active', navLinks[j].getAttribute('data-nav') === state.currentView);
    }
  }

  /* --------------------------------------------
     MOBILE NAV
  -------------------------------------------- */
  function openMobileNav() {
    state.mobileNavOpen = true;
    document.getElementById('mobile-nav').classList.add('open');
    document.getElementById('mobile-nav-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileNav() {
    state.mobileNavOpen = false;
    document.getElementById('mobile-nav').classList.remove('open');
    document.getElementById('mobile-nav-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  /* --------------------------------------------
     CART
  -------------------------------------------- */
  function addToCart(item) {
    var key = cartItemKey(item);
    var existing = state.cart.find(function (c) { return cartItemKey(c) === key; });
    if (existing) {
      existing.quantity++;
    } else {
      state.cart.push(Object.assign({}, item, { quantity: 1 }));
    }
    renderCartBadge();
    if (state.cartOpen) renderCartDrawer();
  }

  function removeFromCart(productId, tier) {
    state.cart = state.cart.filter(function (c) {
      return !(c.productId === productId && c.tier === tier);
    });
    renderCartBadge();
    renderCartDrawer();
  }

  function updateQuantity(productId, tier, qty) {
    if (qty <= 0) { removeFromCart(productId, tier); return; }
    var item = state.cart.find(function (c) { return c.productId === productId && c.tier === tier; });
    if (item) item.quantity = qty;
    renderCartBadge();
    renderCartDrawer();
  }

  function clearCart() {
    state.cart = [];
    renderCartBadge();
  }

  function renderCartBadge() {
    var count = getCartCount();
    var badge = document.getElementById('cart-badge');
    if (!badge) return;
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  /* --------------------------------------------
     CART DRAWER
  -------------------------------------------- */
  function openCart() {
    state.cartOpen = true;
    renderCartDrawer();
    document.getElementById('cart-drawer').classList.add('open');
    document.getElementById('cart-drawer-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    state.cartOpen = false;
    document.getElementById('cart-drawer').classList.remove('open');
    document.getElementById('cart-drawer-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderCartDrawer() {
    var container = document.getElementById('cart-items');
    var count = getCartCount();
    var total = getCartTotal();
    document.getElementById('cart-count-text').textContent = count + ' ' + (count === 1 ? 'item' : 'items');

    if (state.cart.length === 0) {
      container.innerHTML = '<div class="cart-empty">' +
        '<div class="cart-empty-icon">' + ICONS.shoppingBag + '</div>' +
        '<p>Your cart is empty</p>' +
        '<button class="btn btn-outline btn-sm" onclick="closeCart(); setView(\'menu\')">Browse Menu</button>' +
        '</div>';
      document.getElementById('cart-footer').style.display = 'none';
      return;
    }

    document.getElementById('cart-footer').style.display = 'flex';
    var html = '';
    state.cart.forEach(function (item) {
      var addonsTotal = item.addOns.reduce(function (s, a) { return s + a.price; }, 0);
      var unitTotal = item.price + addonsTotal;
      var lineTotal = unitTotal * item.quantity;
      var tierBadge = item.tier !== 'regular' ? '<span class="cart-item-badge">' + (item.tier === 'maxi' ? 'Maxi' : item.comboLabel || 'Combo') + '</span>' : '';
      var addonsText = item.addOns.length > 0 ? '<p class="cart-item-addons">+ ' + item.addOns.map(function (a) { return a.name; }).join(', ') + '</p>' : '';
      html += '<div class="cart-item">' +
        '<div class="cart-item-img"><span class="placeholder-icon">' + ICONS.utensils + '</span></div>' +
        '<div class="cart-item-body">' +
          '<div class="cart-item-name-row"><span class="cart-item-name">' + item.name + '</span>' + tierBadge + '</div>' +
          addonsText +
          '<p class="cart-item-price">' + formatPrice(unitTotal) + ' each</p>' +
          '<div class="cart-item-actions">' +
            '<div class="qty-controls">' +
              '<button class="qty-btn" onclick="updateQuantity(\'' + item.productId + '\',\'' + item.tier + '\',' + (item.quantity - 1) + ')" aria-label="Decrease quantity">' + ICONS.minus + '</button>' +
              '<span class="qty-value">' + item.quantity + '</span>' +
              '<button class="qty-btn" onclick="updateQuantity(\'' + item.productId + '\',\'' + item.tier + '\',' + (item.quantity + 1) + ')" aria-label="Increase quantity">' + ICONS.plus + '</button>' +
            '</div>' +
            '<span class="cart-item-line-total">' + formatPrice(lineTotal) + '</span>' +
            '<button class="cart-item-remove" onclick="removeFromCart(\'' + item.productId + '\',\'' + item.tier + '\')" aria-label="Remove item">' + ICONS.x + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    });
    container.innerHTML = html;
    document.getElementById('cart-subtotal').textContent = formatPrice(total);
  }

  /* --------------------------------------------
     MENU RENDERING
  -------------------------------------------- */
  function setTier(tier) {
    state.tier = tier;
    renderTierTabs();
    renderMenu();
  }

  function setCategory(cat) {
    state.categoryFilter = cat;
    renderCategoryTabs();
    renderMenu();
  }

  function renderTierTabs() {
    var tabs = document.querySelectorAll('.tier-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('active', tabs[i].getAttribute('data-tier') === state.tier);
    }
  }

  function renderCategoryTabs() {
    var tabs = document.querySelectorAll('.category-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('active', tabs[i].getAttribute('data-cat') === state.categoryFilter);
    }
  }

  function getPrice(product) {
    if (state.tier === 'regular') return product.regular;
    if (state.tier === 'maxi') return product.maxi;
    if (state.tier === 'combo') return product.combo || product.maxi;
    return product.regular;
  }

  function getTierLabel(tier) {
    return tier === 'regular' ? 'Regular' : tier === 'maxi' ? 'Maxi' : 'Special Combo';
  }

  function renderMenu() {
    var mainsContainer = document.getElementById('mains-grid');
    var addonsContainer = document.getElementById('addons-grid');
    var drinksContainer = document.getElementById('drinks-grid');
    var addonsSection = document.getElementById('addons-section');

    // Mains
    var mainsHtml = '';
    PRODUCTS.forEach(function (p) {
      var price = getPrice(p);
      var imgUrl = p.images[state.tier] || '';
      var imgHtml = imgUrl
        ? '<img src="' + imgUrl + '" alt="' + p.name + ' - ' + getTierLabel(state.tier) + '" loading="lazy">'
        : '<span class="placeholder-icon">' + ICONS.utensils + '</span>';
      var addonNotice = p.acceptsAddons
        ? '<span class="addon-notice">+ Add-ons available with Maxi</span>'
        : '';
      var comboInfo = state.tier === 'combo' && p.comboLabel
        ? '<p class="combo-desc" style="font-size:12px;color:var(--primary);font-weight:600;margin-top:4px;">' + p.comboLabel + '</p>'
        : '';
      var btnLabel = state.tier === 'combo' && !p.combo
        ? 'Unavailable'
        : 'Add to Order · ' + formatPrice(price);
      var btnDisabled = (state.tier === 'combo' && !p.combo) ? ' disabled' : '';
      var btnAction = (state.tier === 'combo' && !p.combo)
        ? ''
        : ' onclick="handleAddToCart(\'' + p.id + '\')"';

      mainsHtml += '<div class="product-card">' +
        '<div class="product-card-image" data-product-id="' + p.id + '">' + imgHtml + '</div>' +
        '<div class="product-card-body">' +
          '<h4>' + p.name + '</h4>' +
          '<p class="desc">' + p.description + '</p>' +
          addonNotice + comboInfo +
          '<p class="product-price">' + formatPrice(price) + '</p>' +
        '</div>' +
        '<button class="btn btn-primary" style="width:100%"' + btnDisabled + btnAction + '>' + btnLabel + '</button>' +
      '</div>';
    });
    mainsContainer.innerHTML = mainsHtml;

    // Add-ons section visibility — always visible, but only functional for maxi
    if (addonsSection) {
      addonsSection.style.display = 'block';
      if (state.categoryFilter === 'all' || state.categoryFilter === 'addons') {
        addonsSection.style.display = 'block';
      } else {
        addonsSection.style.display = 'none';
      }
    }

    // Add-ons
    var addonsHtml = '';
    ADDONS.forEach(function (a) {
      addonsHtml += '<div class="mini-card">' +
        '<div class="mini-card-info"><p class="name">' + a.name + '</p><p class="price">' + formatPrice(a.price) + '</p></div>' +
        '<button class="mini-card-add-btn" onclick="addAddonDirect(\'' + a.id + '\')" aria-label="Add ' + a.name + '">' + ICONS.plus + '</button>' +
      '</div>';
    });
    addonsContainer.innerHTML = addonsHtml;

    // Drinks
    var drinksHtml = '';
    DRINKS.forEach(function (d) {
      drinksHtml += '<div class="mini-card">' +
        '<div class="mini-card-info"><p class="name">' + d.name + '</p><p class="price">' + formatPrice(d.price) + '</p></div>' +
        '<button class="mini-card-add-btn" onclick="addDrink(\'' + d.id + '\')" aria-label="Add ' + d.name + '">' + ICONS.plus + '</button>' +
      '</div>';
    });
    drinksContainer.innerHTML = drinksHtml;

    // Category section visibility
    var addonsWrap = document.getElementById('addons-section-wrap');
    var drinksWrap = document.getElementById('drinks-section-wrap');
    if (addonsWrap) addonsWrap.style.display = (state.categoryFilter === 'all' || state.categoryFilter === 'addons') ? 'block' : 'none';
    if (drinksWrap) drinksWrap.style.display = (state.categoryFilter === 'all' || state.categoryFilter === 'drinks') ? 'block' : 'none';
  }

  /* --------------------------------------------
     ADD TO CART LOGIC
  -------------------------------------------- */
  function handleAddToCart(productId) {
    var product = PRODUCTS.find(function (p) { return p.id === productId; });
    if (!product) return;
    var price = getPrice(product);

    // If maxi and acceptsAddons, open addon picker
    if (state.tier === 'maxi' && product.acceptsAddons) {
      state.pendingCartItem = {
        productId: product.id,
        name: product.name,
        price: price,
        tier: state.tier,
        comboLabel: product.comboLabel,
        addOns: [],
      };
      state.selectedAddonIds = new Set();
      openAddonPicker();
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      price: price,
      tier: state.tier,
      comboLabel: state.tier === 'combo' ? product.comboLabel : null,
      addOns: [],
    });
    toast(product.name + ' added to cart');
  }

  function addAddonDirect(addonId) {
    var addon = ADDONS.find(function (a) { return a.id === addonId; });
    if (!addon) return;
    addToCart({
      productId: 'addon-' + addon.id,
      name: addon.name,
      price: addon.price,
      tier: 'addon',
      comboLabel: null,
      addOns: [],
    });
    toast(addon.name + ' added');
  }

  function addDrink(drinkId) {
    var drink = DRINKS.find(function (d) { return d.id === drinkId; });
    if (!drink) return;
    addToCart({
      productId: 'drink-' + drink.id,
      name: drink.name,
      price: drink.price,
      tier: 'drink',
      comboLabel: null,
      addOns: [],
    });
    toast(drink.name + ' added');
  }

  /* --------------------------------------------
     ADDON PICKER SHEET
  -------------------------------------------- */
  function openAddonPicker() {
    state.addonPickerOpen = true;
    renderAddonPicker();
    document.getElementById('addon-sheet').classList.add('open');
    document.getElementById('addon-sheet-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeAddonPicker() {
    state.addonPickerOpen = false;
    document.getElementById('addon-sheet').classList.remove('open');
    document.getElementById('addon-sheet-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  function toggleAddon(addonId) {
    if (state.selectedAddonIds.has(addonId)) state.selectedAddonIds.delete(addonId);
    else state.selectedAddonIds.add(addonId);
    renderAddonPicker();
  }

  function renderAddonPicker() {
    var container = document.getElementById('addon-items');
    var basePrice = state.pendingCartItem ? state.pendingCartItem.price : 0;
    var addonsTotal = 0;
    var html = '';
    ADDONS.forEach(function (a) {
      var selected = state.selectedAddonIds.has(a.id);
      if (selected) addonsTotal += a.price;
      html += '<div class="addon-item' + (selected ? ' selected' : '') + '" onclick="toggleAddon(\'' + a.id + '\')">' +
        '<div class="addon-check">' + ICONS.check + '</div>' +
        '<div class="addon-info"><p class="name">' + a.name + '</p><p class="price">' + formatPrice(a.price) + '</p></div>' +
      '</div>';
    });
    container.innerHTML = html;
    document.getElementById('addon-total').textContent = formatPrice(basePrice + addonsTotal);
  }

  function confirmAddonPicker() {
    if (!state.pendingCartItem) return;
    var selectedAddons = ADDONS.filter(function (a) { return state.selectedAddonIds.has(a.id); }).map(function (a) { return { name: a.name, price: a.price }; });
    addToCart(Object.assign({}, state.pendingCartItem, { addOns: selectedAddons }));
    toast(state.pendingCartItem.name + ' added to cart');
    closeAddonPicker();
  }

  /* --------------------------------------------
     CHECKOUT
  -------------------------------------------- */
  function openCheckout() {
    state.checkoutOpen = true;
    closeCart();
    renderCheckout();
    document.getElementById('checkout-sheet').classList.add('open');
    document.getElementById('checkout-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCheckout() {
    state.checkoutOpen = false;
    document.getElementById('checkout-sheet').classList.remove('open');
    document.getElementById('checkout-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  function setDeliveryType(type) {
    document.getElementById('delivery-type-delivery').classList.toggle('active', type === 'delivery');
    document.getElementById('delivery-type-pickup').classList.toggle('active', type === 'pickup');
    var addrFields = document.getElementById('address-fields');
    addrFields.style.display = type === 'delivery' ? 'block' : 'none';
  }

  function renderCheckout() {
    var total = getCartTotal();
    document.getElementById('checkout-amount').textContent = formatPrice(total);
    document.getElementById('checkout-confirm-amount').textContent = formatPrice(total);

    // Order summary
    var summaryHtml = '';
    state.cart.forEach(function (item) {
      var addonsTotal = item.addOns.reduce(function (s, a) { return s + a.price; }, 0);
      var unitTotal = item.price + addonsTotal;
      var tierStr = item.tier !== 'regular' && item.tier !== 'addon' && item.tier !== 'drink'
        ? ' <span style="color:var(--primary);font-weight:600;">(' + (item.comboLabel || getTierLabel(item.tier)) + ')</span>' : '';
      var addonsStr = item.addOns.length > 0 ? '<p class="item-addons">+ ' + item.addOns.map(function (a) { return a.name; }).join(', ') + '</p>' : '';
      summaryHtml += '<div class="order-summary-item">' +
        '<div class="item-name">' + item.name + tierStr + ' <span class="item-qty">×' + item.quantity + '</span>' + addonsStr + '</div>' +
        '<span class="item-total">' + formatPrice(unitTotal * item.quantity) + '</span>' +
      '</div>';
    });
    summaryHtml += '<div class="order-summary-total"><span class="label">Total</span><span class="value">' + formatPrice(total) + '</span></div>';
    document.getElementById('checkout-summary').innerHTML = summaryHtml;
  }

  function handlePlaceOrder() {
    var name = document.getElementById('checkout-name').value.trim();
    var phone = document.getElementById('checkout-phone').value.trim();
    var email = document.getElementById('checkout-email').value.trim();
    var deliveryType = document.getElementById('delivery-type-delivery').classList.contains('active') ? 'delivery' : 'pickup';
    var address = document.getElementById('checkout-address').value.trim();
    var area = document.getElementById('checkout-area').value.trim();
    var notes = document.getElementById('checkout-notes').value.trim();
    var paymentConfirmed = document.getElementById('checkout-payment-confirmed').checked;

    if (!name) { toast('Please enter your full name', 'error'); return; }
    if (!phone) { toast('Please enter your phone number', 'error'); return; }
    if (state.cart.length === 0) { toast('Your cart is empty', 'error'); return; }
    if (deliveryType === 'delivery' && !address) { toast('Please enter your delivery address', 'error'); return; }
    if (!paymentConfirmed) { toast('Please confirm you have made the payment', 'error'); return; }

    var total = getCartTotal();

    // Build WhatsApp message
    var msg = '*New Order from GIZDODOSPECIALS*%0A%0A';
    msg += '*Customer:* ' + name + '%0A';
    msg += '*Phone:* ' + phone + '%0A';
    if (email) msg += '*Email:* ' + email + '%0A';
    msg += '*Type:* ' + (deliveryType === 'delivery' ? 'Delivery' : 'Pickup') + '%0A';
    if (deliveryType === 'delivery') {
      msg += '*Address:* ' + address + '%0A';
      if (area) msg += '*Area:* ' + area + '%0A';
    }
    if (notes) msg += '*Notes:* ' + notes + '%0A';
    msg += '%0A*Order:*%0A';
    state.cart.forEach(function (item) {
      var tierStr = item.tier !== 'regular' && item.tier !== 'addon' && item.tier !== 'drink'
        ? ' (' + (item.comboLabel || getTierLabel(item.tier)) + ')' : '';
      var addonsStr = item.addOns.length > 0 ? ' + ' + item.addOns.map(function (a) { return a.name; }).join(', ') : '';
      msg += '• ' + item.name + tierStr + addonsStr + ' ×' + item.quantity + ' = ' + formatPrice((item.price + item.addOns.reduce(function (s, a) { return s + a.price; }, 0)) * item.quantity) + '%0A';
    });
    msg += '%0A*Total: ' + formatPrice(total) + '*%0A';
    msg += '%0APayment made to ' + CONFIG.BANK_NAME + ' ' + CONFIG.BANK_ACCOUNT + ' (' + CONFIG.BANK_ACC_NAME + ')';

    // Also save to Supabase if configured
    if (CONFIG.SUPABASE_URL && CONFIG.SUPABASE_KEY) {
      saveOrderToSupabase({ name: name, phone: phone, email: email, deliveryType: deliveryType, address: address, area: area, notes: notes, total: total });
    }

    // Generate order number
    var now = new Date();
    var dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    var rand = Math.floor(Math.random() * 9000) + 1000;
    var orderNumber = 'GZ-' + dateStr + '-' + rand;

    // Open WhatsApp
    window.open('https://wa.me/' + CONFIG.WHATSAPP_PHONE.replace(/[^0-9]/g, '') + '?text=' + msg, '_blank');

    // Clear and show success
    clearCart();
    closeCheckout();
    document.getElementById('success-order-number').textContent = orderNumber;
    document.getElementById('success-modal').classList.add('open');

    // Reset form
    document.getElementById('checkout-name').value = '';
    document.getElementById('checkout-phone').value = '';
    document.getElementById('checkout-email').value = '';
    document.getElementById('checkout-address').value = '';
    document.getElementById('checkout-area').value = '';
    document.getElementById('checkout-notes').value = '';
    document.getElementById('checkout-payment-confirmed').checked = false;
    setDeliveryType('delivery');
  }

  function saveOrderToSupabase(order) {
    try {
      fetch(CONFIG.SUPABASE_URL + '/rest/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': CONFIG.SUPABASE_KEY,
          'Authorization': 'Bearer ' + CONFIG.SUPABASE_KEY,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          customer_name: order.name,
          customer_phone: order.phone,
          customer_email: order.email,
          delivery_type: order.deliveryType,
          delivery_address: order.address,
          delivery_area: order.area,
          order_notes: order.notes,
          total: order.total,
          status: 'payment_pending',
          items: JSON.stringify(state.cart),
        }),
      });
    } catch (e) { /* silent — WhatsApp is the primary channel */ }
  }

  function closeSuccessModal() {
    document.getElementById('success-modal').classList.remove('open');
    setView('home');
  }

  /* --------------------------------------------
     ORDER TRACKING
  -------------------------------------------- */
  function handleTrackOrder() {
    var input = document.getElementById('track-input');
    var orderNumber = input.value.trim();
    if (!orderNumber) return;

    var container = document.getElementById('track-result');
    var errorEl = document.getElementById('track-error');
    container.innerHTML = '';
    errorEl.style.display = 'none';

    // Show loading
    container.innerHTML = '<div style="text-align:center;padding:40px;"><div class="skeleton" style="width:60%;height:20px;margin:0 auto 12px;"></div><div class="skeleton" style="width:40%;height:16px;margin:0 auto;"></div></div>';

    if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_KEY) {
 errorEl.textContent = 'Order tracking requires Supabase configuration. Please contact us on WhatsApp for order updates.';
      errorEl.style.display = 'block';
      container.innerHTML = '';
      return;
    }

    fetch(CONFIG.SUPABASE_URL + '/rest/v1/orders?order_number=eq.' + orderNumber, {
      headers: { 'apikey': CONFIG.SUPABASE_KEY, 'Authorization': 'Bearer ' + CONFIG.SUPABASE_KEY },
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data || data.length === 0) {
          errorEl.textContent = 'Order not found. Please check your order number.';
          errorEl.style.display = 'block';
          container.innerHTML = '';
          return;
        }
        renderTrackedOrder(data[0]);
      })
      .catch(function () {
        errorEl.textContent = 'Something went wrong. Please try again.';
        errorEl.style.display = 'block';
        container.innerHTML = '';
      });
  }

  var STATUS_STEPS = [
    { key: 'payment_pending', label: 'Payment Pending', icon: 'creditCard' },
    { key: 'confirmed', label: 'Confirmed', icon: 'checkCircle' },
    { key: 'preparing', label: 'Preparing', icon: 'chefHat' },
    { key: 'ready', label: 'Ready', icon: 'package' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: 'truck' },
    { key: 'delivered', label: 'Delivered', icon: 'checkCircle' },
  ];

  function getStatusIndex(status) {
    for (var i = 0; i < STATUS_STEPS.length; i++) { if (STATUS_STEPS[i].key === status) return i; }
    return 0;
  }

  function renderTrackedOrder(order) {
    var container = document.getElementById('track-result');
    var currentIdx = getStatusIndex(order.status);
    var statusLabel = order.status.replace(/_/g, ' ').toUpperCase();

    var items = [];
    try { items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []); } catch (e) { items = []; }

    // Items HTML
    var itemsHtml = '';
    items.forEach(function (item) {
      var itemTotal = (item.price + item.addOns.reduce(function (s, a) { return s + a.price; }, 0)) * item.quantity;
      var tierStr = item.tier && item.tier !== 'regular' && item.tier !== 'addon' && item.tier !== 'drink'
        ? ' <span style="color:var(--primary);">(' + (item.comboLabel || item.tier) + ')</span>' : '';
      itemsHtml += '<div class="track-item-row"><span>' + item.name + tierStr + ' <span style="color:var(--text-muted);">×' + item.quantity + '</span></span><span style="font-weight:600;">' + formatPrice(itemTotal) + '</span></div>';
    });

    // Timeline HTML
    var timelineHtml = '';
    STATUS_STEPS.forEach(function (step, idx) {
      var isCompleted = idx <= currentIdx;
      var isCurrent = idx === currentIdx;
      var lineClass = idx < currentIdx ? ' completed' : '';
      var iconHtml = ICONS[step.icon] || ICONS.checkCircle;
      timelineHtml += '<div class="timeline-step' + (isCompleted ? ' completed' : '') + (isCurrent ? ' current' : '') + '">' +
        '<div>' +
          '<div class="timeline-icon">' + iconHtml + '</div>' +
          (idx < STATUS_STEPS.length - 1 ? '<div class="timeline-line' + lineClass + '"></div>' : '') +
        '</div>' +
        '<div class="timeline-content">' +
          '<p class="label">' + step.label + '</p>' +
          (isCurrent ? '<p class="current-label">Current status</p>' : '') +
        '</div>' +
      '</div>';
    });

    container.innerHTML =
      '<div class="track-card">' +
        '<div class="track-card-header">' +
          '<div class="track-order-num"><span>Order Number</span><strong>' + (order.order_number || 'N/A') + '</strong></div>' +
          '<span class="status-badge ' + order.status + '">' + statusLabel + '</span>' +
        '</div>' +
        '<div class="track-details-grid">' +
          '<div><p class="track-detail-label">Customer</p><p class="track-detail-value">' + (order.customer_name || '') + '</p></div>' +
          '<div><p class="track-detail-label">Total</p><p class="track-detail-value total">' + formatPrice(order.total || 0) + '</p></div>' +
          '<div><p class="track-detail-label">Delivery</p><p class="track-detail-value" style="text-transform:capitalize;">' + (order.delivery_type || '') + '</p></div>' +
          '<div><p class="track-detail-label">Placed</p><p class="track-detail-value">' + relativeTime(order.created_at) + '</p></div>' +
        '</div>' +
      '</div>' +
      (order.status !== 'cancelled' ?
        '<div class="track-card"><h3 style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:24px;">Order Progress</h3><div class="timeline">' + timelineHtml + '</div></div>' :
        '<div class="track-card" style="text-align:center;padding:32px;"><p style="color:var(--destructive);font-weight:700;font-size:18px;">Order Cancelled</p><p style="color:var(--destructive);opacity:0.6;margin-top:8px;font-size:14px;">Contact us for more information.</p></div>') +
      '<div class="track-card"><h3 style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:16px;">Order Items</h3><div class="track-items">' + itemsHtml +
      '<div class="track-item-total"><span>Total</span><span class="amount">' + formatPrice(order.total || 0) + '</span></div></div></div>';
  }

  /* --------------------------------------------
     SCROLL ANIMATIONS (replaces Framer Motion)
  -------------------------------------------- */
  function initScrollAnimations() {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '-40px' });

    var elements = document.querySelectorAll('.animate-on-scroll');
    for (var i = 0; i < elements.length; i++) observer.observe(elements[i]);
  }

  /* --------------------------------------------
     HASH ROUTING
  -------------------------------------------- */
  function handleHash() {
 var hash = window.location.hash.replace('#', '');
    if (hash && ['home', 'menu', 'track', 'contact'].indexOf(hash) !== -1) {
      setView(hash);
    }
  }

  /* --------------------------------------------
     INIT
  -------------------------------------------- */
  function init() {
    // Render initial state
    renderView();
    renderCartBadge();
    renderTierTabs();
    renderCategoryTabs();
    renderMenu();
    initScrollAnimations();
    handleHash();

    // Event listeners
    window.addEventListener('hashchange', handleHash);

    // Close overlays on escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (state.addonPickerOpen) closeAddonPicker();
        else if (state.checkoutOpen) closeCheckout();
        else if (state.cartOpen) closeCart();
        else if (state.mobileNavOpen) closeMobileNav();
      }
    });

    // Track input enter key
    var trackInput = document.getElementById('track-input');
    if (trackInput) trackInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') handleTrackOrder(); });

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    }
  }

  // Expose functions to global scope for onclick handlers
  window.setView = setView;
  window.openMobileNav = openMobileNav;
  window.closeMobileNav = closeMobileNav;
  window.openCart = openCart;
  window.closeCart = closeCart;
  window.updateQuantity = updateQuantity;
  window.removeFromCart = removeFromCart;
  window.setTier = setTier;
  window.setCategory = setCategory;
  window.handleAddToCart = handleAddToCart;
  window.addAddonDirect = addAddonDirect;
  window.addDrink = addDrink;
  window.toggleAddon = toggleAddon;
  window.confirmAddonPicker = confirmAddonPicker;
  window.openCheckout = openCheckout;
  window.closeCheckout = closeCheckout;
  window.setDeliveryType = setDeliveryType;
  window.handlePlaceOrder = handlePlaceOrder;
  window.closeSuccessModal = closeSuccessModal;
  window.handleTrackOrder = handleTrackOrder;

  // Boot
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
