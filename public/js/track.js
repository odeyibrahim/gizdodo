/* ============================================
   GIZDODOSPECIALS — Track Order Page Logic
   Supabase fetch · Timeline rendering
   ============================================ */
(function () {
  'use strict';

  var CONFIG = {
    SUPABASE_URL: '__VITE_SUPABASE_URL__',
    SUPABASE_KEY: '__VITE_SUPABASE_ANON_KEY__',
  };

  /* --------------------------------------------
     SVG ICONS
  -------------------------------------------- */
  var ICONS = {
    checkCircle: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    clock: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    package: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    truck: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    x: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  };

  /* --------------------------------------------
     STATUS CONFIG
  -------------------------------------------- */
  var STATUS_STEPS = [
    { key: 'payment_pending', label: 'Payment Pending', icon: 'clock' },
    { key: 'confirmed',       label: 'Order Confirmed', icon: 'checkCircle' },
    { key: 'preparing',       label: 'Preparing',       icon: 'package' },
    { key: 'ready',           label: 'Ready',           icon: 'checkCircle' },
    { key: 'out_for_delivery',label: 'Out for Delivery', icon: 'truck' },
    { key: 'delivered',       label: 'Delivered',       icon: 'checkCircle' },
  ];

  var STATUS_ORDER = {};
  STATUS_STEPS.forEach(function (s, i) { STATUS_ORDER[s.key] = i; });

  function formatPrice(amount) {
    return '\u20A6' + amount.toLocaleString();
  }

  /* --------------------------------------------
     MOBILE NAV
  -------------------------------------------- */
  function openMobileNav() {
    document.getElementById('mobile-nav').classList.add('open');
    document.getElementById('mobile-nav-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileNav() {
    document.getElementById('mobile-nav').classList.remove('open');
    document.getElementById('mobile-nav-overlay').classList.remove('open');
    document.body.style.overflow = '';
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

  /* --------------------------------------------
     TRACK ORDER
  -------------------------------------------- */
  function trackOrder() {
    var input = document.getElementById('track-input');
    var orderNum = (input ? input.value.trim() : '').toUpperCase();
    var errorEl = document.getElementById('track-error');
    var resultEl = document.getElementById('track-result');

    errorEl.style.display = 'none';
    resultEl.innerHTML = '';

    if (!orderNum) {
      errorEl.textContent = 'Please enter your order number.';
      errorEl.style.display = 'block';
      return;
    }

    // Show loading skeleton
    resultEl.innerHTML = '<div class="skeleton" style="height:200px;border-radius:12px;"></div>';

    if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_KEY) {
      errorEl.textContent = 'Order tracking is not configured. Please contact us on WhatsApp.';
      errorEl.style.display = 'block';
      resultEl.innerHTML = '';
      return;
    }

    fetch(CONFIG.SUPABASE_URL + '/rest/v1/orders?order_number=eq.' + orderNum, {
      headers: {
        'apikey': CONFIG.SUPABASE_KEY,
        'Authorization': 'Bearer ' + CONFIG.SUPABASE_KEY,
      },
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (!data || data.length === 0) {
        errorEl.textContent = 'No order found with number "' + orderNum + '". Please check and try again.';
        errorEl.style.display = 'block';
        resultEl.innerHTML = '';
        return;
      }
      renderTrackResult(data[0]);
    })
    .catch(function () {
      errorEl.textContent = 'Something went wrong. Please try again or contact us on WhatsApp.';
      errorEl.style.display = 'block';
      resultEl.innerHTML = '';
    });
  }

  function renderTrackResult(order) {
    var resultEl = document.getElementById('track-result');
    var status = order.status || 'payment_pending';
    var statusLabel = status.replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    var currentIdx = STATUS_ORDER[status] !== undefined ? STATUS_ORDER[status] : 0;
    var items = [];
    try { items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []); } catch (e) { items = []; }

    // Header
    var html = '<div class="track-card">' +
      '<div class="track-card-header">' +
        '<div class="track-order-num">Order Number<strong>' + (order.order_number || 'N/A') + '</strong></div>' +
        '<span class="status-badge ' + status + '">' + statusLabel + '</span>' +
      '</div>' +
      '<div class="track-details-grid">' +
        '<div><div class="track-detail-label">Name</div><div class="track-detail-value">' + (order.customer_name || '-') + '</div></div>' +
        '<div><div class="track-detail-label">Phone</div><div class="track-detail-value">' + (order.customer_phone || '-') + '</div></div>' +
        '<div><div class="track-detail-label">Type</div><div class="track-detail-value">' + ((order.delivery_type || 'delivery') === 'delivery' ? 'Delivery' : 'Pickup') + '</div></div>' +
        '<div><div class="track-detail-label">Total</div><div class="track-detail-value total">' + formatPrice(order.total || 0) + '</div></div>' +
      '</div>' +
    '</div>';

    // Items
    if (items.length > 0) {
      html += '<div class="track-items">';
      items.forEach(function (item) {
        var extrasTotal = (item.extras || []).reduce(function (s, e) { return s + (e.price || 0); }, 0);
        var unitTotal = (item.price || 0) + extrasTotal;
        html += '<div class="track-item-row">' +
          '<span>' + (item.name || 'Item') + (item.tier && item.tier !== 'regular' && item.tier !== 'drink' ? ' (' + (item.comboLabel || item.tier) + ')' : '') + (item.quantity > 1 ? ' &times;' + item.quantity : '') + '</span>' +
          '<span>' + formatPrice(unitTotal * (item.quantity || 1)) + '</span>' +
        '</div>';
      });
      html += '</div>';
    }

    // Timeline
    html += '<div class="timeline">';
    STATUS_STEPS.forEach(function (step, i) {
      var isCompleted = i < currentIdx;
      var isCurrent = i === currentIdx && status !== 'delivered' && status !== 'cancelled';
      var cls = isCompleted ? 'completed' : (isCurrent ? 'current' : '');
      var lineCls = isCompleted ? 'completed' : '';
      var lineHtml = (i < STATUS_STEPS.length - 1) ? '<div class="timeline-line ' + lineCls + '"></div>' : '';
      var currentLabel = isCurrent ? '<p class="current-label">Current status</p>' : '';

      html += '<div class="timeline-step ' + cls + '">' +
        '<div class="timeline-icon">' + (ICONS[step.icon] || ICONS.clock) + '</div>' +
        '<div class="timeline-content"><p class="label">' + step.label + '</p>' + currentLabel + '</div>' +
      '</div>' + lineHtml;
    });
    html += '</div>';

    resultEl.innerHTML = html;
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
     INIT
  -------------------------------------------- */
  function init() {
    initBackToTop();

    // Check URL params for order number
    var params = new URLSearchParams(window.location.search);
    var orderParam = params.get('order');
    if (orderParam) {
      var input = document.getElementById('track-input');
      if (input) input.value = orderParam;
      trackOrder();
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMobileNav();
    });
  }

  // Expose to global scope
  window.openMobileNav = openMobileNav;
  window.closeMobileNav = closeMobileNav;
  window.trackOrder = trackOrder;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();