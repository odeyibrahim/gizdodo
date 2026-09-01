/* ============================================
   GIZDODOSPECIALS — Customer App Logic (Home + Menu)
   Standalone tier cards · + Button · Extras Modal · Cart · FAB
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
     PRODUCT DATA (hardcoded fallback)
  -------------------------------------------- */
  var PRODUCTS = [
    { id: 'gizdodo', name: 'Gizdodo', description: 'Our signature dish \u2014 perfectly fried plantain (dodo) paired with saut\u00e9ed gizzard in a rich, spicy sauce. A Lagos favourite.', category: 'mains', acceptsExtras: true, regular: 9000, maxi: 15000, combo: 17000, comboLabel: 'Gizdodo with Extra Spaghetti', images: { regular: '/images/gizdodo-regular.jpg', maxi: '/images/gizdodo-maxi.jpg', combo: '/images/gizdodo-combo.jpg' } },
    { id: 'chickendodo', name: 'Chickendodo', description: 'Crispy fried plantain served with succulent, well-seasoned chicken in our special sauce.', category: 'mains', acceptsExtras: true, regular: 9000, maxi: 15000, combo: 18000, comboLabel: 'Chickendodo with Special Toppings', images: { regular: '/images/chickendodo-regular.jpg', maxi: '/images/chickendodo-maxi.jpg', combo: '/images/chickendodo-combo.jpg' } },
    { id: 'turkeydodo', name: 'Turkeydodo', description: 'Juicy smoked turkey paired with golden fried plantain and our signature savoury sauce.', category: 'mains', acceptsExtras: true, regular: 10000, maxi: 17000, combo: 20000, comboLabel: 'Turkeydodo with Extra Cheese', images: { regular: '/images/turkeydodo-regular.jpg', maxi: '/images/turkeydodo-maxi.jpg', combo: '/images/turkeydodo-combo.jpg' } },
    { id: 'beefdodo', name: 'Beefdodo', description: 'Tender, flavourful beef served with crispy fried plantain in a rich pepper sauce.', category: 'mains', acceptsExtras: true, regular: 8000, maxi: 13000, combo: 15000, comboLabel: 'Beefdodo with Extra Noodles', images: { regular: '/images/beefdodo-regular.jpg', maxi: '/images/beefdodo-maxi.jpg', combo: '/images/beefdodo-combo.jpg' } },
    { id: 'snaildodo', name: 'Snaildodo', description: 'Perfectly cooked snails in a fiery, aromatic sauce alongside golden plantain. A delicacy!', category: 'mains', acceptsExtras: true, regular: 10000, maxi: 20000, combo: null, comboLabel: null, images: { regular: '/images/snaildodo-regular.jpg', maxi: '/images/snaildodo-maxi.jpg', combo: '' } },
    { id: 'chickenfeet', name: 'Chicken Feet Mix', description: 'Spicy, saucy chicken feet mixed with peppers and onions, served with fried plantain.', category: 'mains', acceptsExtras: true, regular: 9000, maxi: 13000, combo: null, comboLabel: null, images: { regular: '/images/chickenfeet-regular.jpg', maxi: '/images/chickenfeet-maxi.jpg', combo: '' } },
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
    extrasPickerOpen: false,
    pendingCartItem: null,
    selectedExtraIds: {},
  };

  /* --------------------------------------------
     HELPERS
  -------------------------------------------- */
  function formatPrice(amount) {
    return '\u20A6' + amount.toLocaleString();
  }

  function getCartTotal() {
    return state.cart.reduce(function (sum, item) {
      var extrasTotal = item.extras.reduce(function (s, e) { return s + e.price; }, 0);
      return sum + (item.price + extrasTotal) * item.quantity;
    }, 0);
  }

  function getCartCount() {
    return state.cart.reduce(function (sum, item) { return sum + item.quantity; }, 0);
  }

  function cartItemKey(item) {
    return item.productId + '-' + item.tier + '-' + item.extras.map(function (e) { return e.id; }).sort().join(',');
  }

  function getPriceForTier(product, tier) {
    if (tier === 'maxi') return product.maxi;
    if (tier === 'combo') return product.combo || product.maxi;
    return product.regular;
  }

  function getTierLabel(tier) {
    return tier === 'regular' ? 'Regular' : tier === 'maxi' ? 'Maxi' : 'Special Combo';
  }

  function getComboBadge(comboLabel) {
    if (!comboLabel) return '';
    var idx = comboLabel.toLowerCase().indexOf('with ');
    if (idx > 0) { return comboLabel.substring(idx); }
    return comboLabel;
  }

  function getCartQtyForCard(productId, tier) {
    var qty = 0;
    state.cart.forEach(function (item) {
      if (item.productId === productId && item.tier === tier && item.extras.length === 0) qty += item.quantity;
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
     CART
  -------------------------------------------- */
  function addToCart(item) {
    var key = cartItemKey(item);
    var existing = state.cart.find(function (c) { return cartItemKey(c) === key; });
    if (existing) { existing.quantity++; } else { state.cart.push(Object.assign({}, item, { quantity: 1 })); }
    renderCartBadge(); renderFAB(); renderMenu();
    if (state.cartOpen) renderCartDrawer();
  }

  function removeFromCart(idx) {
    if (idx >= 0 && idx < state.cart.length) { state.cart.splice(idx, 1); }
    renderCartBadge(); renderFAB(); renderMenu(); renderCartDrawer();
  }

  function updateQuantity(idx, qty) {
    if (qty <= 0) { removeFromCart(idx); return; }
    if (state.cart[idx]) state.cart[idx].quantity = qty;
    renderCartBadge(); renderFAB(); renderMenu();
    if (state.cartOpen) renderCartDrawer();
  }

  function clearCart() {
    state.cart = [];
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
      var extrasTotal = item.extras.reduce(function (s, e) { return s + e.price; }, 0);
      var unitTotal = item.price + extrasTotal;
      var lineTotal = unitTotal * item.quantity;
      var tierBadge = item.tier !== 'regular' && item.tier !== 'drink'
        ? '<span class="cart-item-badge">' + (item.tier === 'combo' && item.comboLabel ? getComboBadge(item.comboLabel) : getTierLabel(item.tier)) + '</span>' : '';
      var extrasText = item.extras.length > 0 ? '<p class="cart-item-extras">+ ' + item.extras.map(function (e) { return e.name; }).join(', ') + '</p>' : '';
      var imgHtml = item.image
        ? '<img src="' + item.image + '" alt="' + item.name + '">'
        : '<span class="placeholder-icon" style="font-size:11px;">' + ICONS.utensils + '</span>';
      html += '<div class="cart-item">' +
        '<div class="cart-item-img">' + imgHtml + '</div>' +
        '<div class="cart-item-body">' +
          '<div class="cart-item-name-row"><span class="cart-item-name">' + item.name + '</span>' + tierBadge + '</div>' +
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
     EXTRAS PICKER SHEET
  -------------------------------------------- */
  function openExtrasPicker(productId) {
    var product = PRODUCTS.find(function (p) { return p.id === productId; });
    if (!product) return;
    var price = product.maxi;
    state.pendingCartItem = {
      productId: product.id, name: product.name, price: price, tier: 'maxi',
      comboLabel: null, extras: [], image: product.images.maxi || '',
    };
    state.selectedExtraIds = {};
    state.extrasPickerOpen = true;
    renderExtrasPicker();
    document.getElementById('extras-picker').classList.add('open');
    document.getElementById('extras-picker-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeExtrasPicker() {
    state.extrasPickerOpen = false;
    state.pendingCartItem = null;
    state.selectedExtraIds = {};
    document.getElementById('extras-picker').classList.remove('open');
    document.getElementById('extras-picker-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  function toggleExtra(extraId) {
    if (state.selectedExtraIds[extraId]) {
      delete state.selectedExtraIds[extraId];
    } else {
      state.selectedExtraIds[extraId] = true;
    }
    renderExtrasPicker();
  }

  function renderExtrasPicker() {
    var pending = state.pendingCartItem;
    if (!pending) return;

    // Pending info
    document.getElementById('extras-picker-pending').innerHTML =
      '<p class="name">' + pending.name + '</p>' +
      '<p class="tier">Maxi \u2014 ' + formatPrice(pending.price) + '</p>';

    // Extras list
    var bodyHtml = '<p class="extras-section-title">Add to select any option</p>';
    EXTRAS.forEach(function (e) {
      var sel = !!state.selectedExtraIds[e.id];
      bodyHtml += '<div class="extras-item' + (sel ? ' selected' : '') + '" onclick="toggleExtra(\'' + e.id + '\')">' +
        '<div class="extras-item-check">' + (sel ? ICONS.check : '') + '</div>' +
        '<span class="extras-item-name">' + e.name + '</span>' +
        '<span class="extras-item-price">' + formatPrice(e.price) + '</span>' +
      '</div>';
    });
    document.getElementById('extras-picker-body').innerHTML = bodyHtml;

    // Footer total
    var extrasTotal = 0;
    for (var eid in state.selectedExtraIds) {
      var ex = EXTRAS.find(function (e) { return e.id === eid; });
      if (ex) extrasTotal += ex.price;
    }
    var grandTotal = pending.price + extrasTotal;
    var extrasStr = extrasTotal > 0 ? ' + Extras: ' + formatPrice(extrasTotal) : '';

    document.getElementById('extras-picker-footer').innerHTML =
      '<div class="extras-total-row"><span class="label">Base: ' + formatPrice(pending.price) + extrasStr + '</span><span class="value">' + formatPrice(grandTotal) + '</span></div>' +
      '<button class="btn btn-primary" style="width:100%;padding:16px;" onclick="confirmExtrasSelection()">Add to Cart \u2014 ' + formatPrice(grandTotal) + '</button>';
  }

  function confirmExtrasSelection() {
    var pending = state.pendingCartItem;
    if (!pending) return;

    var selectedExtras = [];
    for (var eid in state.selectedExtraIds) {
      var ex = EXTRAS.find(function (e) { return e.id === eid; });
      if (ex) selectedExtras.push({ id: ex.id, name: ex.name, price: ex.price });
    }

    pending.extras = selectedExtras;
    addToCart(pending);

    var extrasStr = selectedExtras.length > 0 ? ' with ' + selectedExtras.map(function (e) { return e.name; }).join(', ') : '';
    toast(pending.name + extrasStr + ' added to cart');
    closeExtrasPicker();
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

    // ---- Mains: each tier as standalone card ----
    var mainsHtml = '';
    PRODUCTS.forEach(function (p) {
      var tiers = [
        { key: 'regular', price: p.regular, image: p.images.regular, hasExtras: false },
        { key: 'maxi', price: p.maxi, image: p.images.maxi, hasExtras: p.acceptsExtras },
      ];
      if (p.combo) {
        tiers.push({ key: 'combo', price: p.combo, image: p.images.combo, hasExtras: false });
      }
      tiers.forEach(function (t) {
        var imgUrl = t.image || '';
        var imgHtml = imgUrl
          ? '<img src="' + imgUrl + '" alt="' + p.name + ' ' + getTierLabel(t.key) + '" loading="lazy">'
          : '<span class="placeholder-icon">' + ICONS.utensils + '</span>';

        var comboBadge = t.key === 'combo' && p.comboLabel
          ? ' <span class="combo-badge-inline">' + getComboBadge(p.comboLabel) + '</span>'
          : '';

        var qty = getCartQtyForCard(p.id, t.key);
        var countHtml = qty > 0 ? '<span class="card-add-count">' + qty + '</span>' : '';

        var extrasHint = '';
        if (t.hasExtras) { extrasHint = '<span class="extras-hint">Customisable</span>'; }

        var addAction;
        if (t.hasExtras) {
          addAction = 'onclick="openExtrasPicker(\'' + p.id + '\')"';
        } else {
          addAction = 'onclick="handleAddToCartDirect(\'' + p.id + '\',\'' + t.key + '\')"';
        }

        mainsHtml += '<div class="product-card" data-product-id="' + p.id + '" data-tier="' + t.key + '">' +
          '<div class="product-card-image">' + imgHtml +
            '<span class="tier-badge tier-badge-' + t.key + '">' + getTierLabel(t.key) + '</span>' +
          '</div>' +
          '<div class="product-card-body">' +
            '<span class="card-name">' + p.name + comboBadge + '</span>' +
            '<span class="card-desc">' + p.description + '</span>' +
            extrasHint +
            '<div class="product-card-footer">' +
              '<span class="card-price">' + formatPrice(t.price) + '</span>' +
              '<button class="card-add-btn" ' + addAction + '>' + ICONS.plus + countHtml + '</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      });
    });
    mainsContainer.innerHTML = mainsHtml;

    // ---- Drinks ----
    var drinksHtml = '';
    DRINKS.forEach(function (d) {
      var dImgHtml = d.image
        ? '<img src="' + d.image + '" alt="' + d.name + '" loading="lazy">'
        : '<span class="placeholder-icon">' + ICONS.utensils + '</span>';
      var qty = 0;
      state.cart.forEach(function (item) { if (item.productId === 'drink-' + d.id) qty += item.quantity; });
      var countHtml = qty > 0 ? '<span class="card-add-count">' + qty + '</span>' : '';
      drinksHtml += '<div class="product-card" data-product-id="drink-' + d.id + '">' +
        '<div class="product-card-image">' + dImgHtml +
          '<span class="tier-badge tier-badge-drink">Drink</span>' +
        '</div>' +
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

  /* --------------------------------------------
     ADD TO CART (direct, no extras)
  -------------------------------------------- */
  function handleAddToCartDirect(productId, tier) {
    var product = PRODUCTS.find(function (p) { return p.id === productId; });
    if (!product) return;
    var price = getPriceForTier(product, tier);
    addToCart({
      productId: product.id,
      name: product.name,
      price: price,
      tier: tier,
      comboLabel: tier === 'combo' ? product.comboLabel : null,
      extras: [],
      image: product.images[tier] || '',
    });
    toast(product.name + ' (' + getTierLabel(tier) + ') added to cart');
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
      var extrasTotal = item.extras.reduce(function (s, e) { return s + e.price; }, 0);
      var unitTotal = item.price + extrasTotal;
      var tierStr = item.tier !== 'regular' && item.tier !== 'drink'
        ? ' <span style="color:var(--primary);font-weight:600;">(' + (item.comboLabel || getTierLabel(item.tier)) + ')</span>' : '';
      var extrasStr = item.extras.length > 0 ? '<p class="item-extras">+ ' + item.extras.map(function (e) { return e.name; }).join(', ') + '</p>' : '';
      summaryHtml += '<div class="order-summary-item">' +
        '<div class="item-name">' + item.name + tierStr + ' <span class="item-qty">\u00D7' + item.quantity + '</span>' + extrasStr + '</div>' +
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
      var tierStr = item.tier !== 'regular' && item.tier !== 'drink'
        ? ' (' + (item.comboLabel || getTierLabel(item.tier)) + ')' : '';
      var extrasStr = item.extras.length > 0 ? ' + ' + item.extras.map(function (e) { return e.name; }).join(', ') : '';
      msg += '\u2022 ' + item.name + tierStr + extrasStr + ' \u00D7' + item.quantity + ' = ' + formatPrice((item.price + item.extras.reduce(function (s, e) { return s + e.price; }, 0)) * item.quantity) + '%0A';
    });
    msg += '%0A*Total: ' + formatPrice(total) + '*%0A';
    msg += '%0APayment made to ' + CONFIG.BANK_NAME + ' ' + CONFIG.BANK_ACCOUNT + ' (' + CONFIG.BANK_ACC_NAME + ')';

    // Generate order number FIRST (needed for Supabase + customer)
    var now = new Date();
    var dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    var rand = Math.floor(Math.random() * 9000) + 1000;
    var orderNumber = 'GZ-' + dateStr + '-' + rand;

    // Save to Supabase if configured
    if (CONFIG.SUPABASE_URL && CONFIG.SUPABASE_KEY) {
      saveOrderToSupabase({ orderNumber: orderNumber, name: name, phone: phone, email: email, deliveryType: deliveryType, address: address, area: area, notes: notes, total: total });
    }

    // Clear and show success
    clearCart();
    closeCheckout();
    renderFAB();
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
    } catch (e) { /* silent */ }
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
     Fetches products from Supabase; falls back to hardcoded.
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
      // Map Supabase rows to app format
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
            regular: r.regular_price || 0,
            maxi: r.maxi_price || 0,
            combo: r.combo_price || null,
            comboLabel: r.combo_label || null,
            images: {
              regular: r.image_regular || '',
              maxi: r.image_maxi || '',
              combo: r.image_combo || '',
            },
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
    .catch(function () {
      // Fallback to hardcoded products
      renderMenu();
    });
  }

  /* --------------------------------------------
     INIT
  -------------------------------------------- */
  function init() {
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
        if (state.extrasPickerOpen) closeExtrasPicker();
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
  window.toggleExtra = toggleExtra;
  window.setCategory = setCategory;
  window.handleAddToCartDirect = handleAddToCartDirect;
  window.openExtrasPicker = openExtrasPicker;
  window.closeExtrasPicker = closeExtrasPicker;
  window.confirmExtrasSelection = confirmExtrasSelection;
  window.addDrink = addDrink;
  window.openCheckout = openCheckout;
  window.closeCheckout = closeCheckout;
  window.setDeliveryType = setDeliveryType;
  window.handlePlaceOrder = handlePlaceOrder;
  window.closeSuccessModal = closeSuccessModal;
  window.copyText = copyText;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
