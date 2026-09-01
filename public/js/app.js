/* ============================================
   GIZDODOSPECIALS — Customer App Logic (Home + Menu)
   Standalone product cards · + Button · Extras Modal · Cart · FAB
   Cart persists via localStorage across pages
   ============================================ */
(function () {
  'use strict';

  /* --------------------------------------------
     CONFIG
  -------------------------------------------- */
  var CONFIG = {
    WHATSAPP_PHONE: '__VITE_WHATSAPP_PHONE__',
    BANK_NAME: 'GTBank',
    BANK_ACCOUNT: '3005029891',
    BANK_ACC_NAME: 'Gizdodo Special Hub',
    SUPABASE_URL: '__VITE_SUPABASE_URL__',
    SUPABASE_KEY: '__VITE_SUPABASE_ANON_KEY__',
  };

  if (window.ENV) {
    if (window.ENV.SUPABASE_URL) CONFIG.SUPABASE_URL = window.ENV.SUPABASE_URL;
    if (window.ENV.SUPABASE_ANON_KEY) CONFIG.SUPABASE_KEY = window.ENV.SUPABASE_ANON_KEY;
    if (window.ENV.WHATSAPP_PHONE) CONFIG.WHATSAPP_PHONE = window.ENV.WHATSAPP_PHONE;
  }

  /* --------------------------------------------
     SVG ICONS
  -------------------------------------------- */
  var ICONS = {
    plus: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    minus: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    x: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    check: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    checkCircle: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    shoppingBag: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    utensils: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>',
  };

  /* --------------------------------------------
     PRODUCT DATA (hardcoded fallback — standalone cards)
  -------------------------------------------- */
  var PRODUCTS = [
    { id: 'gizdodo-regular', name: 'Gizdodo', description: 'Our signature dish \u2014 perfectly fried plantain (dodo) paired with saut\u00e9ed gizzard in a rich, spicy sauce. A Lagos favourite.', category: 'mains', acceptsExtras: false, price: 9000, image: '/images/gizdodo-regular.jpg' },
    { id: 'gizdodo-maxi', name: 'Gizdodo Maxi', description: 'Our signature dish \u2014 perfectly fried plantain (dodo) paired with saut\u00e9ed gizzard in a rich, spicy sauce. A Lagos favourite. Bigger portion!', category: 'mains', acceptsExtras: true, price: 15000, image: '/images/gizdodo-maxi.jpg' },
    { id: 'gizdodo-combo', name: 'Gizdodo Special Combo', description: 'Our signature Gizdodo paired with extra spaghetti for a complete satisfying meal.', category: 'mains', acceptsExtras: false, price: 17000, image: '/images/gizdodo-combo.jpg' },
    { id: 'chickendodo-regular', name: 'Chickendodo', description: 'Crispy fried plantain served with succulent, well-seasoned chicken in our special sauce.', category: 'mains', acceptsExtras: false, price: 9000, image: '/images/chickendodo-regular.jpg' },
    { id: 'chickendodo-maxi', name: 'Chickendodo Maxi', description: 'Crispy fried plantain served with succulent, well-seasoned chicken in our special sauce. Bigger portion!', category: 'mains', acceptsExtras: true, price: 15000, image: '/images/chickendodo-maxi.jpg' },
    { id: 'chickendodo-combo', name: 'Chickendodo Special Combo', description: 'Our Chickendodo paired with special toppings for an extra flavourful experience.', category: 'mains', acceptsExtras: false, price: 18000, image: '/images/chickendodo-combo.jpg' },
    { id: 'turkeydodo-regular', name: 'Turkeydodo', description: 'Juicy smoked turkey paired with golden fried plantain and our signature savoury sauce.', category: 'mains', acceptsExtras: false, price: 10000, image: '/images/turkeydodo-regular.jpg' },
    { id: 'turkeydodo-maxi', name: 'Turkeydodo Maxi', description: 'Juicy smoked turkey paired with golden fried plantain and our signature savoury sauce. Bigger portion!', category: 'mains', acceptsExtras: true, price: 17000, image: '/images/turkeydodo-maxi.jpg' },
    { id: 'turkeydodo-combo', name: 'Turkeydodo Special Combo', description: 'Our Turkeydodo paired with extra cheese for a rich, indulgent meal.', category: 'mains', acceptsExtras: false, price: 20000, image: '/images/turkeydodo-combo.jpg' },
    { id: 'beefdodo-regular', name: 'Beefdodo', description: 'Tender, flavourful beef served with crispy fried plantain in a rich pepper sauce.', category: 'mains', acceptsExtras: false, price: 8000, image: '/images/beefdodo-regular.jpg' },
    { id: 'beefdodo-maxi', name: 'Beefdodo Maxi', description: 'Tender, flavourful beef served with crispy fried plantain in a rich pepper sauce. Bigger portion!', category: 'mains', acceptsExtras: true, price: 13000, image: '/images/beefdodo-maxi.jpg' },
    { id: 'beefdodo-combo', name: 'Beefdodo Special Combo', description: 'Our Beefdodo paired with extra noodles for a complete satisfying meal.', category: 'mains', acceptsExtras: false, price: 15000, image: '/images/beefdodo-combo.jpg' },
    { id: 'snaildodo-regular', name: 'Snaildodo', description: 'Perfectly cooked snails in a fiery, aromatic sauce alongside golden plantain. A delicacy!', category: 'mains', acceptsExtras: false, price: 10000, image: '/images/snaildodo-regular.jpg' },
    { id: 'snaildodo-maxi', name: 'Snaildodo Maxi', description: 'Perfectly cooked snails in a fiery, aromatic sauce alongside golden plantain. A delicacy! Bigger portion!', category: 'mains', acceptsExtras: true, price: 20000, image: '/images/snaildodo-maxi.jpg' },
    { id: 'chickenfeet-regular', name: 'Chicken Feet Mix', description: 'Spicy, saucy chicken feet mixed with peppers and onions, served with fried plantain.', category: 'mains', acceptsExtras: false, price: 9000, image: '/images/chickenfeet-regular.jpg' },
    { id: 'chickenfeet-maxi', name: 'Chicken Feet Mix Maxi', description: 'Spicy, saucy chicken feet mixed with peppers and onions, served with fried plantain. Bigger portion!', category: 'mains', acceptsExtras: true, price: 13000, image: '/images/chickenfeet-maxi.jpg' },
  ];

  var DRINKS = [
    { id: 'pineapple', name: 'Pineapple Juice', price: 3000, image: '/images/pineapple-juice.jpg' },
    { id: 'pineapple-ginger', name: 'Pineapple + Ginger Juice', price: 3000, image: '/images/pineapple-juice.jpg' },
    { id: 'chapman', name: 'Chapman', price: 3000, image: '/images/chapman.jpg' },
  ];

  var EXTRAS = [
    { id: 'pasta', name: 'Pasta', price: 2000 },
    { id: 'spaghetti', name: 'Spaghetti', price: 2000 },
    { id: 'noodles', name: 'Noodles', price: 2000 },
    { id: 'rice', name: 'Rice', price: 2000 },
    { id: 'cheese', name: 'Cheese', price: 3000 },
    { id: 'toppings', name: 'Special Topping Mix', price: 3000 },
  ];

  /* --------------------------------------------
     STATE
  -------------------------------------------- */
  var state = {
    categoryFilter: 'all',
    cart: [],
    mobileNavOpen: false,
    cartOpen: false,
    checkoutOpen: false,
    extrasModalOpen: false,
    pendingCartItem: null,
    selectedExtras: {},  // { extraId: quantity }
  };

  /* --------------------------------------------
     LOCALSTORAGE CART PERSISTENCE
  -------------------------------------------- */
  var CART_KEY = 'gizdodo_cart';

  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(state.cart)); } catch (e) {}
  }

  function loadCart() {
    try {
      var stored = localStorage.getItem(CART_KEY);
      if (stored) {
        state.cart = JSON.parse(stored);
        if (!Array.isArray(state.cart)) state.cart = [];
      }
    } catch (e) { state.cart = []; }
  }

  /* --------------------------------------------
     HELPERS
  -------------------------------------------- */
  function formatPrice(amount) {
    return '\u20A6' + amount.toLocaleString();
  }

  function getCartTotal() {
    return state.cart.reduce(function (sum, item) {
      var extrasTotal = item.extras.reduce(function (s, e) { return s + e.price * e.qty; }, 0);
      return sum + (item.price + extrasTotal) * item.quantity;
    }, 0);
  }

  function getCartCount() {
    return state.cart.reduce(function (sum, item) { return sum + item.quantity; }, 0);
  }

  function cartItemKey(item) {
    var extrasKey = item.extras.map(function (e) { return e.id + ':' + e.qty; }).sort().join(',');
    return item.productId + '|' + extrasKey;
  }

  function getCartQtyForCard(productId) {
    var qty = 0;
    state.cart.forEach(function (item) {
      if (item.productId === productId) qty += item.quantity;
    });
    return qty;
  }

  /* --------------------------------------------
     TOAST
  -------------------------------------------- */
  function toast(message, type) {
    type = type || 'success';
    var container = document.getElementById('toast-container');
    if (!container) return;
    var el = document.createElement('div');
    el.className = 'toast ' + type;
    var iconName = type === 'success' ? 'checkCircle' : 'x';
    el.innerHTML = '<span class="toast-icon">' + (ICONS[iconName] || ICONS.checkCircle) + '</span><span>' + message + '</span>';
    container.appendChild(el);
    setTimeout(function () {
      el.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(function () { el.remove(); }, 300);
    }, 4000);
  }

  function copyText(text, el) {
    var target = el || (typeof event !== 'undefined' ? event.currentTarget : null);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () { showCopied(target); });
    } else {
      var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); showCopied(target);
    }
  }

  function showCopied(el) {
    if (!el) return;
    el.classList.add('copied');
    setTimeout(function () { el.classList.remove('copied'); }, 1500);
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
     CART (persists to localStorage)
  -------------------------------------------- */
  function addToCart(item) {
    var key = cartItemKey(item);
    var existing = state.cart.find(function (c) { return cartItemKey(c) === key; });
    if (existing) { existing.quantity++; } else { state.cart.push(Object.assign({}, item, { quantity: 1 })); }
    saveCart();
    renderCartBadge(); renderFAB(); renderMenu();
    if (state.cartOpen) renderCartDrawer();
  }

  function removeFromCart(idx) {
    if (idx >= 0 && idx < state.cart.length) { state.cart.splice(idx, 1); }
    saveCart();
    renderCartBadge(); renderFAB(); renderMenu(); renderCartDrawer();
  }

  function updateQuantity(idx, qty) {
    if (qty <= 0) { removeFromCart(idx); return; }
    if (state.cart[idx]) state.cart[idx].quantity = qty;
    saveCart();
    renderCartBadge(); renderFAB(); renderMenu();
    if (state.cartOpen) renderCartDrawer();
  }

  function clearCart() {
    state.cart = [];
    saveCart();
    renderCartBadge(); renderFAB();
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

  function renderFAB() {
    var fab = document.getElementById('cart-fab');
    if (!fab) return;
    var count = getCartCount();
    var total = getCartTotal();
    if (count > 0) {
      fab.style.display = 'flex';
      document.getElementById('fab-count').textContent = count;
      document.getElementById('fab-text').textContent = count + ' item' + (count !== 1 ? 's' : '');
      document.getElementById('fab-total').textContent = formatPrice(total);
    } else {
      fab.style.display = 'none';
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
        '<button class="btn btn-outline btn-sm" onclick="closeCart(); document.getElementById(\'menu\').scrollIntoView({behavior:\'smooth\'})">Browse Menu</button>' +
        '</div>';
      document.getElementById('cart-footer').style.display = 'none';
      return;
    }

    document.getElementById('cart-footer').style.display = 'flex';
    var html = '';
    state.cart.forEach(function (item, idx) {
      var extrasTotal = item.extras.reduce(function (s, e) { return s + e.price * (e.qty || 1); }, 0);
      var unitTotal = item.price + extrasTotal;
      var lineTotal = unitTotal * item.quantity;
      var extrasText = item.extras.length > 0 ? '<p class="cart-item-extras">+ ' + item.extras.map(function (e) { return e.name + (e.qty > 1 ? ' x' + e.qty : ''); }).join(', ') + '</p>' : '';
      var imgHtml = item.image
        ? '<img src="' + item.image + '" alt="' + item.name + '">'
        : '<span class="placeholder-icon" style="font-size:11px;">' + ICONS.utensils + '</span>';
      html += '<div class="cart-item">' +
        '<div class="cart-item-img">' + imgHtml + '</div>' +
        '<div class="cart-item-body">' +
          '<div class="cart-item-name-row"><span class="cart-item-name">' + item.name + '</span></div>' +
          extrasText +
          '<p class="cart-item-price">' + formatPrice(unitTotal) + ' each</p>' +
          '<div class="cart-item-actions">' +
            '<div class="qty-controls">' +
              '<button class="qty-btn" onclick="updateQuantity(' + idx + ',' + (item.quantity - 1) + ')" aria-label="Decrease quantity">' + ICONS.minus + '</button>' +
              '<span class="qty-value">' + item.quantity + '</span>' +
              '<button class="qty-btn" onclick="updateQuantity(' + idx + ',' + (item.quantity + 1) + ')" aria-label="Increase quantity">' + ICONS.plus + '</button>' +
            '</div>' +
            '<span class="cart-item-line-total">' + formatPrice(lineTotal) + '</span>' +
            '<button class="cart-item-remove" onclick="removeFromCart(' + idx + ')" aria-label="Remove item">' + ICONS.x + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    });
    container.innerHTML = html;
    document.getElementById('cart-subtotal').textContent = formatPrice(total);
  }

  /* --------------------------------------------
     EXTRAS MODAL (centered, ADD buttons)
  -------------------------------------------- */
  function openExtrasModal(productId) {
    var product = PRODUCTS.find(function (p) { return p.id === productId; });
    if (!product) return;
    state.pendingCartItem = {
      productId: product.id, name: product.name, price: product.price,
      extras: [], image: product.image || '',
    };
    state.selectedExtras = {};
    state.extrasModalOpen = true;
    renderExtrasModal();
    document.getElementById('extras-modal').classList.add('open');
    document.getElementById('extras-modal-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeExtrasModal() {
    state.extrasModalOpen = false;
    state.pendingCartItem = null;
    state.selectedExtras = {};
    document.getElementById('extras-modal').classList.remove('open');
    document.getElementById('extras-modal-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  function toggleExtra(extraId) {
    if (state.selectedExtras[extraId]) {
      delete state.selectedExtras[extraId];
    } else {
      state.selectedExtras[extraId] = 1;
    }
    renderExtrasModal();
  }

  function renderExtrasModal() {
    var pending = state.pendingCartItem;
    if (!pending) return;

    document.getElementById('extras-modal-product').textContent = pending.name + ' \u2014 ' + formatPrice(pending.price);

    var bodyHtml = '';
    EXTRAS.forEach(function (e) {
      var qty = state.selectedExtras[e.id] || 0;
      var isAdded = qty > 0;
      bodyHtml += '<div class="extras-row' + (isAdded ? ' selected' : '') + '">' +
        '<div class="extras-row-info">' +
          '<span class="extras-row-name">' + e.name + '</span>' +
          '<span class="extras-row-price">' + formatPrice(e.price) + '</span>' +
        '</div>' +
        '<div class="extras-row-actions">' +
          '<button class="extras-add-btn' + (isAdded ? ' added' : '') + '" onclick="toggleExtra(\'' + e.id + '\')">' + (isAdded ? 'ADDED' : 'ADD') + '</button>' +
        '</div>' +
      '</div>';
    });
    document.getElementById('extras-modal-body').innerHTML = bodyHtml;

    // Footer total
    var extrasTotal = 0;
    for (var eid in state.selectedExtras) {
      var ex = EXTRAS.find(function (e) { return e.id === eid; });
      if (ex) extrasTotal += ex.price * state.selectedExtras[eid];
    }
    var grandTotal = pending.price + extrasTotal;
    var extrasStr = extrasTotal > 0 ? ' + Extras: ' + formatPrice(extrasTotal) : '';

    document.getElementById('extras-modal-footer').innerHTML =
      '<div class="extras-total-row"><span class="label">Base: ' + formatPrice(pending.price) + extrasStr + '</span><span class="value">' + formatPrice(grandTotal) + '</span></div>' +
      '<button class="btn btn-primary" style="width:100%;padding:16px;" onclick="confirmExtrasSelection()">Add to Cart \u2014 ' + formatPrice(grandTotal) + '</button>';
  }

  function confirmExtrasSelection() {
    var pending = state.pendingCartItem;
    if (!pending) return;

    var selectedExtras = [];
    for (var eid in state.selectedExtras) {
      var ex = EXTRAS.find(function (e) { return e.id === eid; });
      if (ex && state.selectedExtras[eid] > 0) {
        selectedExtras.push({ id: ex.id, name: ex.name, price: ex.price, qty: state.selectedExtras[eid] });
      }
    }

    pending.extras = selectedExtras;
    addToCart(pending);

    var extrasStr = selectedExtras.length > 0 ? ' with ' + selectedExtras.map(function (e) { return e.name; }).join(', ') : '';
    toast(pending.name + extrasStr + ' added to cart');
    closeExtrasModal();
  }

  /* --------------------------------------------
     MENU RENDERING
  -------------------------------------------- */
  function setCategory(cat) {
    state.categoryFilter = cat;
    renderCategoryTabs();
    renderMenu();
  }

  function renderCategoryTabs() {
    var tabs = document.querySelectorAll('.category-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('active', tabs[i].getAttribute('data-cat') === state.categoryFilter);
    }
  }

  function renderMenu() {
    var mainsContainer = document.getElementById('mains-grid');
    var drinksContainer = document.getElementById('drinks-grid');

    // ---- Mains: each product is a standalone card ----
    var mainsHtml = '';
    PRODUCTS.forEach(function (p) {
      var imgUrl = p.image || '';
      var imgHtml = imgUrl
        ? '<img src="' + imgUrl + '" alt="' + p.name + '" loading="lazy">'
        : '<span class="placeholder-icon">' + ICONS.utensils + '</span>';

      var qty = getCartQtyForCard(p.id);
      var countHtml = qty > 0 ? '<span class="card-add-count">' + qty + '</span>' : '';

      var extrasHint = '';
      if (p.acceptsExtras) { extrasHint = '<span class="extras-hint">Extras available</span>'; }

      var addAction;
      if (p.acceptsExtras) {
        addAction = 'onclick="openExtrasModal(\'' + p.id + '\')"';
      } else {
        addAction = 'onclick="handleAddToCartDirect(\'' + p.id + '\')"';
      }

      var cardId = 'card-desc-' + p.id;
      var descId = 'desc-' + p.id;
      var shortDesc = p.description || '';
      var isLong = shortDesc.length > 80;

      mainsHtml += '<div class="product-card" data-product-id="' + p.id + '">' +
        '<div class="product-card-image">' + imgHtml + '</div>' +
        '<div class="product-card-body">' +
          '<span class="card-name">' + p.name + '</span>' +
          '<div class="card-desc-wrap" id="' + cardId + '">' +
            '<span class="card-desc" id="' + descId + '">' + escHtml(shortDesc) + '</span>' +
            (isLong ? ' <button class="see-more-btn" onclick="toggleDesc(\'' + p.id + '\', this)">See more</button>' : '') +
          '</div>' +
          extrasHint +
          '<div class="product-card-footer">' +
            '<span class="card-price">' + formatPrice(p.price) + '</span>' +
            '<button class="card-add-btn" ' + addAction + '>' + ICONS.plus + countHtml + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    });
    mainsContainer.innerHTML = mainsHtml;

    // ---- Drinks ----
    var drinksHtml = '';
    DRINKS.forEach(function (d) {
      var dImgHtml = d.image
        ? '<img src="' + d.image + '" alt="' + d.name + '" loading="lazy">'
        : '<span class="placeholder-icon">' + ICONS.utensils + '</span>';
      var qty = getCartQtyForCard('drink-' + d.id);
      var countHtml = qty > 0 ? '<span class="card-add-count">' + qty + '</span>' : '';
      drinksHtml += '<div class="product-card" data-product-id="drink-' + d.id + '">' +
        '<div class="product-card-image">' + dImgHtml + '</div>' +
        '<div class="product-card-body">' +
          '<span class="card-name">' + d.name + '</span>' +
          '<span class="card-desc">Refreshing drink to complement your meal.</span>' +
          '<div class="product-card-footer">' +
            '<span class="card-price">' + formatPrice(d.price) + '</span>' +
            '<button class="card-add-btn" onclick="addDrink(\'' + d.id + '\')">' + ICONS.plus + countHtml + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    });
    drinksContainer.innerHTML = drinksHtml;

    // ---- Category section visibility ----
    var mainsWrap = document.getElementById('mains-section-wrap');
    var drinksWrap = document.getElementById('drinks-section-wrap');
    if (mainsWrap) mainsWrap.style.display = (state.categoryFilter === 'all' || state.categoryFilter === 'mains') ? 'block' : 'none';
    if (drinksWrap) drinksWrap.style.display = (state.categoryFilter === 'all' || state.categoryFilter === 'drinks') ? 'block' : 'none';
  }

  function escHtml(s) {
    var div = document.createElement('div');
    div.textContent = s || '';
    return div.innerHTML;
  }

  function toggleDesc(productId, btn) {
    var descEl = document.getElementById('desc-' + productId);
    var wrapEl = document.getElementById('card-desc-' + productId);
    if (!descEl || !wrapEl) return;
    if (wrapEl.classList.contains('expanded')) {
      var p = PRODUCTS.find(function (pr) { return pr.id === productId; });
      descEl.textContent = p ? (p.description || '') : '';
      wrapEl.classList.remove('expanded');
      btn.textContent = 'See more';
    } else {
      wrapEl.classList.add('expanded');
      btn.textContent = 'See less';
    }
  }

  /* --------------------------------------------
     ADD TO CART (direct, no extras)
  -------------------------------------------- */
  function handleAddToCartDirect(productId) {
    var product = PRODUCTS.find(function (p) { return p.id === productId; });
    if (!product) return;
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      extras: [],
      image: product.image || '',
    });
    toast(product.name + ' added to cart');
  }

  function addDrink(drinkId) {
    var drink = DRINKS.find(function (d) { return d.id === drinkId; });
    if (!drink) return;
    addToCart({
      productId: 'drink-' + drink.id,
      name: drink.name,
      price: drink.price,
      extras: [],
      image: drink.image || '',
    });
    toast(drink.name + ' added');
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

    var summaryHtml = '';
    state.cart.forEach(function (item) {
      var extrasTotal = item.extras.reduce(function (s, e) { return s + (e.price || 0) * (e.qty || 1); }, 0);
      var unitTotal = item.price + extrasTotal;
      var extrasStr = item.extras.length > 0 ? '<p class="item-extras">+ ' + item.extras.map(function (e) { return e.name + (e.qty > 1 ? ' x' + e.qty : ''); }).join(', ') + '</p>' : '';
      summaryHtml += '<div class="order-summary-item">' +
        '<div class="item-name">' + item.name + ' <span class="item-qty">\u00D7' + item.quantity + '</span>' + extrasStr + '</div>' +
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

    // Generate order number
    var now = new Date();
    var dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    var rand = Math.floor(Math.random() * 9000) + 1000;
    var orderNumber = 'GZ-' + dateStr + '-' + rand;

    // Save to Supabase
    if (CONFIG.SUPABASE_URL && CONFIG.SUPABASE_KEY) {
      saveOrderToSupabase({ orderNumber: orderNumber, name: name, phone: phone, email: email, deliveryType: deliveryType, address: address, area: area, notes: notes, total: total });
    }

    // Clear cart and show success
    clearCart();
    closeCheckout();
    renderMenu();
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
          order_number: order.orderNumber,
          customer_name: order.name, customer_phone: order.phone, customer_email: order.email,
          delivery_type: order.deliveryType, delivery_address: order.address, delivery_area: order.area,
          order_notes: order.notes, total: order.total, status: 'payment_pending',
          items: JSON.stringify(state.cart),
        }),
      });
    } catch (e) {}
  }

  function closeSuccessModal() {
    document.getElementById('success-modal').classList.remove('open');
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
  }

  /* --------------------------------------------
     SCROLL ANIMATIONS
  -------------------------------------------- */
  function initScrollAnimations() {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1, rootMargin: '-40px' });
    var elements = document.querySelectorAll('.animate-on-scroll');
    for (var i = 0; i < elements.length; i++) observer.observe(elements[i]);
  }

  /* --------------------------------------------
     BACK TO TOP
  -------------------------------------------- */
  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', function () {
      btn.classList.toggle('visible', window.scrollY > 400);
    });
  }

  /* --------------------------------------------
     SUPABASE PRODUCT SYNC
     Each DB row = one standalone product card
  -------------------------------------------- */
  function isSupabaseConfigured() {
    return CONFIG.SUPABASE_URL && CONFIG.SUPABASE_KEY &&
           CONFIG.SUPABASE_URL.indexOf('__VITE_') !== 0;
  }

  function syncProductsWithSupabase() {
    if (!isSupabaseConfigured()) { renderMenu(); return; }
    fetch(CONFIG.SUPABASE_URL + '/rest/v1/products?is_active=eq.true&order=sort_order.asc', {
      headers: { 'apikey': CONFIG.SUPABASE_KEY, 'Authorization': 'Bearer ' + CONFIG.SUPABASE_KEY },
    })
    .then(function (r) { return r.json(); })
    .then(function (rows) {
      if (!rows || rows.length === 0) { renderMenu(); return; }
      var mains = rows.filter(function (r) { return r.category === 'mains'; });
      var drinks = rows.filter(function (r) { return r.category === 'drinks'; });
      if (mains.length > 0) {
        PRODUCTS = mains.map(function (r) {
          return {
            id: r.product_id,
            name: r.name,
            description: r.description || '',
            category: 'mains',
            acceptsExtras: !!r.accepts_extras,
            price: r.regular_price || 0,
            image: r.image_regular || r.image_single || '',
            comboLabel: r.combo_label || null,
          };
        });
      }
      if (drinks.length > 0) {
        DRINKS = drinks.map(function (r) {
          return {
            id: r.product_id,
            name: r.name,
            price: r.regular_price || 0,
            image: r.image_single || '',
          };
        });
      }
      renderMenu();
    })
    .catch(function () { renderMenu(); });
  }

  /* --------------------------------------------
     INIT
  -------------------------------------------- */
  function init() {
    loadCart();
    renderCartBadge();
    renderFAB();
    renderCategoryTabs();
    syncProductsWithSupabase();
    initScrollAnimations();
    initBackToTop();

    if (window.location.hash) {
      var target = document.querySelector(window.location.hash);
      if (target) setTimeout(function () { target.scrollIntoView({ behavior: 'smooth' }); }, 100);
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (state.extrasModalOpen) closeExtrasModal();
        else if (state.checkoutOpen) closeCheckout();
        else if (state.cartOpen) closeCart();
        else if (state.mobileNavOpen) closeMobileNav();
      }
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    }
  }

  // Expose to global scope
  window.openMobileNav = openMobileNav;
  window.closeMobileNav = closeMobileNav;
  window.openCart = openCart;
  window.closeCart = closeCart;
  window.updateQuantity = updateQuantity;
  window.removeFromCart = removeFromCart;
  window.setCategory = setCategory;
  window.handleAddToCartDirect = handleAddToCartDirect;
  window.openExtrasModal = openExtrasModal;
  window.closeExtrasModal = closeExtrasModal;
  window.toggleExtra = toggleExtra;
  window.confirmExtrasSelection = confirmExtrasSelection;
  window.addDrink = addDrink;
  window.openCheckout = openCheckout;
  window.closeCheckout = closeCheckout;
  window.setDeliveryType = setDeliveryType;
  window.handlePlaceOrder = handlePlaceOrder;
  window.closeSuccessModal = closeSuccessModal;
  window.copyText = copyText;
  window.toggleDesc = toggleDesc;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
