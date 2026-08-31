/* ============================================
   GIZDODOSPECIALS — Admin Dashboard Logic
   SHA-256 auth · Supabase orders · Image uploads
   ============================================ */
(function () {
  'use strict';

  var SUPABASE_URL = '';
  var SUPABASE_KEY = '';
  var ADMIN_HASH = '';

  if (window.ENV) {
    SUPABASE_URL = window.ENV.SUPABASE_URL || '';
    SUPABASE_KEY = window.ENV.SUPABASE_ANON_KEY || '';
    ADMIN_HASH = window.ENV.ADMIN_PASSWORD_HASH || '';
  }

  /* --------------------------------------------
     AUTH
  -------------------------------------------- */
  async function sha256(str) {
    var buf = new TextEncoder().encode(str);
    var hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }

  async function handleLogin() {
    var pw = document.getElementById('login-password').value;
    if (!pw) { document.getElementById('login-error').textContent = 'Enter password'; return; }
    var hash = await sha256(pw);
    if (hash === ADMIN_HASH) {
      sessionStorage.setItem('gizdodo_admin', '1');
      showDashboard();
    } else {
      document.getElementById('login-error').textContent = 'Incorrect password';
    }
  }

  function logout() {
    sessionStorage.removeItem('gizdodo_admin');
    document.getElementById('login-screen').style.display = 'flex';
    document.querySelector('.dashboard').classList.remove('active');
  }

  function showDashboard() {
    document.getElementById('login-screen').style.display = 'none';
    document.querySelector('.dashboard').classList.add('active');
    loadOrders();
    loadImages();
  }

  /* --------------------------------------------
     TABS
  -------------------------------------------- */
  function switchTab(tab) {
    document.querySelectorAll('.dash-tab').forEach(function (t) { t.classList.remove('active'); });
    document.querySelectorAll('.dash-panel').forEach(function (p) { p.classList.remove('active'); });
    document.querySelector('[data-tab="' + tab + '"]').classList.add('active');
    document.getElementById('panel-' + tab).classList.add('active');
    if (tab === 'orders') loadOrders();
    if (tab === 'images') loadImages();
  }

  /* --------------------------------------------
     ORDERS
  -------------------------------------------- */
  var STATUS_CYCLE = ['payment_pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

  function nextStatus(current) {
    var idx = STATUS_CYCLE.indexOf(current);
    if (idx < 0 || idx >= STATUS_CYCLE.length - 1) return current;
    return STATUS_CYCLE[idx + 1];
  }

  async function loadOrders() {
    var container = document.getElementById('orders-body');
    container.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted);">Loading orders...</td></tr>';

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      container.innerHTML = '<tr><td colspan="6" class="empty-state">Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in Netlify env vars.</td></tr>';
      return;
    }

    try {
      var res = await fetch(SUPABASE_URL + '/rest/v1/orders?select=*&order=created_at.desc', {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
      });
      var orders = await res.json();
      if (!orders || orders.length === 0) {
        container.innerHTML = '<tr><td colspan="6" class="empty-state">No orders yet</td></tr>';
        return;
      }
      renderOrders(orders);
    } catch (e) {
      container.innerHTML = '<tr><td colspan="6" class="empty-state">Failed to load orders: ' + e.message + '</td></tr>';
    }
  }

  function renderOrders(orders) {
    var html = '';
    orders.forEach(function (o) {
      var statusLabel = (o.status || '').replace(/_/g, ' ').toUpperCase();
      var items = [];
      try { items = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []); } catch (e) { items = []; }
      var itemsText = items.map(function (i) { return i.name + ' x' + i.quantity; }).join(', ');
      var next = nextStatus(o.status);
      var date = o.created_at ? new Date(o.created_at).toLocaleString() : '';

      html += '<tr>' +
        '<td><strong>' + (o.order_number || 'N/A') + '</strong></td>' +
        '<td>' + (o.customer_name || '') + '<br><span style="font-size:12px;color:var(--text-muted);">' + (o.customer_phone || '') + '</span></td>' +
        '<td><span style="font-size:13px;">' + itemsText + '</span></td>' +
        '<td style="font-weight:700;">\u20A6' + (o.total || 0).toLocaleString() + '</td>' +
        '<td><span class="status-badge ' + (o.status || '') + '">' + statusLabel + '</span><br><span style="font-size:11px;color:var(--text-muted);">' + date + '</span></td>' +
        '<td>' +
          (next !== o.status ? '<button class="status-cycle-btn" onclick="cycleStatus(\'' + o.id + '\',\'' + next + '\')">Advance</button>' : '<span style="font-size:12px;color:var(--success);">Complete</span>') +
        '</td>' +
      '</tr>';
    });
    document.getElementById('orders-body').innerHTML = html;
  }

  async function cycleStatus(orderId, newStatus) {
    try {
      await fetch(SUPABASE_URL + '/rest/v1/orders?id=eq.' + orderId, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      loadOrders();
    } catch (e) {
      alert('Failed to update: ' + e.message);
    }
  }

  /* --------------------------------------------
     IMAGE UPLOADS
  -------------------------------------------- */
  var PRODUCTS = [
    { id: 'gizdodo', name: 'Gizdodo' },
    { id: 'chickendodo', name: 'Chickendodo' },
    { id: 'turkeydodo', name: 'Turkeydodo' },
    { id: 'beefdodo', name: 'Beefdodo' },
    { id: 'snaildodo', name: 'Snaildodo' },
    { id: 'chickenfeet', name: 'Chicken Feet Mix' },
  ];
  var TIERS = ['regular', 'maxi', 'combo'];

  function loadImages() {
    var grid = document.getElementById('upload-grid');
    var html = '';
    PRODUCTS.forEach(function (p) {
      html += '<div class="upload-card"><div class="upload-card-header">' + p.name + '</div><div class="upload-card-body">';
      TIERS.forEach(function (t) {
        var key = p.id + '-' + t;
        html += '<div class="upload-row" id="img-' + key + '">' +
          '<label>' + t.charAt(0).toUpperCase() + t.slice(1) + '</label>' +
          '<div class="placeholder">No image</div>' +
          '<button class="upload-file-btn" onclick="uploadImage(\'' + p.id + '\',\'' + t + '\')">Upload</button>' +
          '<span class="upload-status"></span>' +
        '</div>';
      });
      html += '</div></div>';
    });
    grid.innerHTML = html;

    // Load existing images from Supabase storage
    if (SUPABASE_URL && SUPABASE_KEY) {
      PRODUCTS.forEach(function (p) {
        TIERS.forEach(function (t) {
          checkExistingImage(p.id, t);
        });
      });
    }
  }

  function checkExistingImage(productId, tier) {
    var path = 'product-images/' + productId + '/' + tier + '.jpg';
    var url = SUPABASE_URL + '/storage/v1/object/public/images/' + path;
    // Try loading the image; if it exists, show it
    var img = new Image();
    img.onload = function () {
      var row = document.getElementById('img-' + productId + '-' + tier);
      if (row) {
        var ph = row.querySelector('.placeholder');
        if (ph) {
          var newImg = document.createElement('img');
          newImg.src = url;
          newImg.alt = productId + ' ' + tier;
          ph.replaceWith(newImg);
        }
      }
    };
    img.onerror = function () { /* no image yet */ };
    img.src = url;
  }

  async function uploadImage(productId, tier) {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async function () {
      var file = input.files[0];
      if (!file) return;
      var row = document.getElementById('img-' + productId + '-' + tier);
      var status = row.querySelector('.upload-status');
      status.textContent = 'Uploading...';
      status.className = 'upload-status';

      if (!SUPABASE_URL || !SUPABASE_KEY) {
        status.textContent = 'Supabase not configured';
        status.className = 'upload-status err';
        return;
      }

      try {
        var path = 'product-images/' + productId + '/' + tier + '.jpg';
        var res = await fetch(SUPABASE_URL + '/storage/v1/object/images/' + path, {
          method: 'POST',
          headers: {
            'Content-Type': file.type,
            'apikey': SUPABASE_KEY,
            'Authorization': 'Bearer ' + SUPABASE_KEY,
          },
          body: file,
        });
        if (res.ok) {
          status.textContent = 'Uploaded';
          status.className = 'upload-status ok';
          checkExistingImage(productId, tier);
        } else {
          var err = await res.json().catch(function () { return {}; });
          status.textContent = 'Failed: ' + (err.message || res.statusText);
          status.className = 'upload-status err';
        }
      } catch (e) {
        status.textContent = 'Error: ' + e.message;
        status.className = 'upload-status err';
      }
    };
    input.click();
  }

  /* --------------------------------------------
     SETTINGS
  -------------------------------------------- */
  async function changePassword() {
    var newPw = document.getElementById('new-password').value;
    if (!newPw) { alert('Enter a new password'); return; }
    var hash = await sha256(newPw);
    document.getElementById('new-hash-output').value = hash;
    document.getElementById('new-hash-output').select();
    alert('Password hash generated. Copy this hash and set it as ADMIN_PASSWORD_HASH in your Netlify environment variables.');
  }

  /* --------------------------------------------
     INIT
  -------------------------------------------- */
  function init() {
    // Check session
    if (sessionStorage.getItem('gizdodo_admin') === '1') {
      showDashboard();
    }

    // Login form
    document.getElementById('login-password').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handleLogin();
    });
  }

  // Expose
  window.handleLogin = handleLogin;
  window.logout = logout;
  window.switchTab = switchTab;
  window.cycleStatus = cycleStatus;
  window.uploadImage = uploadImage;
  window.changePassword = changePassword;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
