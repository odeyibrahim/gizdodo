91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
152
153
154
155
156
157
158
159
160
⌄
⌄
⌄
⌄
⌄
⌄
⌄
/* ============================================
    var resultEl = document.getElementById('track-result');
    var status = order.status || 'payment_pending';
    var statusLabel = status.replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    var currentIdx = STATUS_ORDER[status] !== undefined ? STATUS_ORDER[status] : 0;
    var items = [];
    try { items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []); } catch (e) { items = []; }

    var html = '<div class="track-card"><div class="track-card-header"><div class="track-order-num">Order Number<strong>' + (order.order_number || 'N/A') + '</strong></div><span class="status-badge ' + status + '">' + statusLabel + '</span></div><div class="track-details-grid"><div><div class="track-detail-label">Name</div><div class="track-detail-value">' + (order.customer_name || '-') + '</div></div><div><div class="track-detail-label">Phone</div><div class="track-detail-value">' + (order.customer_phone || '-') + '</div></div><div><div class="track-detail-label">Type</div><div class="track-detail-value">' + ((order.delivery_type || 'delivery') === 'delivery' ? 'Delivery' : 'Pickup') + '</div></div><div><div class="track-detail-label">Total</div><div class="track-detail-value total">' + formatPrice(order.total || 0) + '</div></div></div></div>';

    if (items.length > 0) {
      html += '<div class="track-items">';
      items.forEach(function (item) {
        var extrasTotal = (item.extras || []).reduce(function (s, e) { return s + (e.price || 0); }, 0);
        var unitTotal = (item.price || 0) + extrasTotal;
        html += '<div class="track-item-row"><span>' + (item.name || 'Item') + (item.quantity > 1 ? ' &times;' + item.quantity : '') + '</span><span>' + formatPrice(unitTotal * (item.quantity || 1)) + '</span></div>';
      });
      html += '</div>';
    }

    html += '<div class="timeline">';
    STATUS_STEPS.forEach(function (step, i) {
      var isCompleted = i < currentIdx;
      var isCurrent = i === currentIdx && status !== 'delivered' && status !== 'cancelled';
      var cls = isCompleted ? 'completed' : (isCurrent ? 'current' : '');
      var lineHtml = (i < STATUS_STEPS.length - 1) ? '<div class="timeline-line ' + (isCompleted ? 'completed' : '') + '"></div>' : '';
      var currentLabel = isCurrent ? '<p class="current-label">Current status</p>' : '';
      html += '<div class="timeline-step ' + cls + '"><div class="timeline-icon">' + (ICONS[step.icon] || ICONS.clock) + '</div><div class="timeline-content"><p class="label">' + step.label + '</p>' + currentLabel + '</div></div>' + lineHtml;
    });
    html += '</div>';
    resultEl.innerHTML = html;
  }

  function initFAB() {
    try {
      var stored = localStorage.getItem('gizdodo_cart');
      if (!stored) return;
      var cart = JSON.parse(stored);
      if (!Array.isArray(cart) || cart.length === 0) return;
      var count = cart.reduce(function (s, item) { return s + item.quantity; }, 0);
      var total = cart.reduce(function (s, item) {
        var extrasTotal = item.extras.reduce(function (es, e) { return es + e.price * e.qty; }, 0);
        return s + (item.price + extrasTotal) * item.quantity;
      }, 0);
      var fab = document.getElementById('cart-fab');
      if (!fab) return;
      fab.style.display = 'flex';
      document.getElementById('fab-count').textContent = count > 99 ? '99+' : count;
      document.getElementById('fab-text').textContent = count + ' item' + (count !== 1 ? 's' : '');
      document.getElementById('fab-total').textContent = '\u20A6' + total.toLocaleString();
    } catch (e) {}
  }

  function init() {
    var btn = document.getElementById('back-to-top');
    if (btn) window.addEventListener('scroll', function () { btn.classList.toggle('visible', window.scrollY > 400); });
    var params = new URLSearchParams(window.location.search);
    var orderParam = params.get('order');
    if (orderParam) { var input = document.getElementById('track-input'); if (input) input.value = orderParam; trackOrder(); }
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMobileNav(); });
    initFAB();
  }

  window.openMobileNav = openMobileNav;
  window.closeMobileNav = closeMobileNav;
  window.trackOrder = trackOrder;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();