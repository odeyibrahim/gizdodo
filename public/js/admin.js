/* ============================================
   GIZDODOSPECIALS — Admin Dashboard Logic
   Auth · Orders · Products · Drinks · Settings
   ============================================ */
var Admin = (function () {
  'use strict';

  /* --------------------------------------------
     CONFIG
  -------------------------------------------- */
  var CONFIG = {
    ADMIN_PASSWORD_HASH: '__VITE_ADMIN_PASSWORD_HASH__',
    SUPABASE_URL: '__VITE_SUPABASE_URL__',
    SUPABASE_KEY: '__VITE_SUPABASE_ANON_KEY__',
    STORAGE_BUCKET: 'product-images',
    VAPID_PUBLIC_KEY: '__VITE_VAPID_PUBLIC_KEY__',
    EDGE_FUNCTION_URL: '__VITE_SUPABASE_URL__',
  };

  /* --------------------------------------------
     STATE
  -------------------------------------------- */
  var state = {
    loggedIn: false,
    currentPage: 'dashboard',
    products: [],
    orders: [],
    pendingConfirmFn: null,
    editFiles: {},
  };

  var STATUS_MAP = {
    payment_pending: { label: 'Payment Pending', badge: 'badge-yellow' },
    confirmed: { label: 'Confirmed', badge: 'badge-blue' },
    preparing: { label: 'Preparing', badge: 'badge-orange' },
    ready: { label: 'Ready', badge: 'badge-green' },
    out_for_delivery: { label: 'Out for Delivery', badge: 'badge-blue' },
    delivered: { label: 'Delivered', badge: 'badge-green' },
    cancelled: { label: 'Cancelled', badge: 'badge-red' },
  };

  var STATUS_OPTIONS = ['payment_pending','confirmed','preparing','ready','out_for_delivery','delivered','cancelled'];

  /* --------------------------------------------
     HELPERS
  -------------------------------------------- */
  function sha256(str) {
    var buffer = new TextEncoder('utf-8').encode(str);
    return crypto.subtle.digest('SHA-256', buffer).then(function (buf) {
      return Array.from(new Uint8Array(buf)).map(function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    });
  }

  function formatPrice(n) { return '\u20A6' + (n || 0).toLocaleString(); }

  function formatDate(iso) {
    if (!iso) return '-';
    var d = new Date(iso);
    return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
           d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
  }

  function escHtml(s) {
    var div = document.createElement('div');
    div.textContent = s || '';
    return div.innerHTML;
  }

  function supabaseHeaders() {
    return {
      'Content-Type': 'application/json',
      'apikey': CONFIG.SUPABASE_KEY,
      'Authorization': 'Bearer ' + CONFIG.SUPABASE_KEY,
      'Prefer': 'return=representation',
    };
  }

  function isConfigured() {
    return CONFIG.SUPABASE_URL && CONFIG.SUPABASE_KEY &&
           CONFIG.SUPABASE_URL.indexOf('__VITE_') !== 0;
  }

  function apiGet(table, query) {
    return fetch(CONFIG.SUPABASE_URL + '/rest/v1/' + table + (query || ''), {
      headers: supabaseHeaders(),
    }).then(function (r) { return r.json(); });
  }

  function apiPost(table, data) {
    return fetch(CONFIG.SUPABASE_URL + '/rest/v1/' + table, {
      method: 'POST', headers: supabaseHeaders(), body: JSON.stringify(data),
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error(t); });
      return r.json();
    });
  }

  function apiPatch(table, id, data) {
    return fetch(CONFIG.SUPABASE_URL + '/rest/v1/' + table + '?id=eq.' + id, {
      method: 'PATCH', headers: supabaseHeaders(), body: JSON.stringify(data),
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error(t); });
      return r.json();
    });
  }

  function apiDelete(table, id) {
    return fetch(CONFIG.SUPABASE_URL + '/rest/v1/' + table + '?id=eq.' + id, {
      method: 'DELETE', headers: supabaseHeaders(),
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error(t); });
      return { ok: true };
    });
  }

  /* --------------------------------------------
     TOAST
  -------------------------------------------- */
  function toast(msg, type) {
    type = type || 'success';
    var container = document.getElementById('toast-container');
    var el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(function () {
      el.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(function () { el.remove(); }, 300);
    }, 3000);
  }

  /* --------------------------------------------
     AUTH
  -------------------------------------------- */
  function login() {
    var pw = document.getElementById('login-password').value;
    if (!pw) return;
    sha256(pw).then(function (hash) {
      // Check local hash first, then Supabase
      var localHash = CONFIG.ADMIN_PASSWORD_HASH;
      if (localHash && hash === localHash) {
        doLogin(); return;
      }
      if (isConfigured()) {
        apiGet('admin_settings', '?key=eq.password_hash').then(function (rows) {
          if (rows && rows.length > 0 && rows[0].value === hash) {
            doLogin();
          } else {
            document.getElementById('login-error').classList.add('show');
          }
        }).catch(function () {
          document.getElementById('login-error').classList.add('show');
        });
      } else {
        document.getElementById('login-error').classList.add('show');
      }
    });
  }

  function doLogin() {
    state.loggedIn = true;
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-app').classList.add('logged-in');
    sessionStorage.setItem('admin_auth', '1');
    unlockAudio();
    startOrderPolling();
    subscribeToPushNotifications();
    loadDashboard();
  }

  function logout() {
    state.loggedIn = false;
    sessionStorage.removeItem('admin_auth');
    stopOrderPolling();
    unsubscribeFromPushNotifications();
    document.getElementById('login-screen').style.display = '';
    document.getElementById('admin-app').classList.remove('logged-in');
    document.getElementById('login-password').value = '';
    document.getElementById('login-error').classList.remove('show');
  }

  function checkSession() {
    if (sessionStorage.getItem('admin_auth') === '1') {
      doLogin();
    }
  }

  /* --------------------------------------------
     NAVIGATION
  -------------------------------------------- */
  function navigate(page) {
    state.currentPage = page;
    // Hide all pages
    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) pages[i].style.display = 'none';
    document.getElementById('page-' + page).style.display = 'block';
    // Sidebar active
    var links = document.querySelectorAll('.sidebar-link[data-page]');
    for (var j = 0; j < links.length; j++) {
      links[j].classList.toggle('active', links[j].getAttribute('data-page') === page);
    }
    // Mobile title
    var titles = { dashboard: 'Dashboard', orders: 'Orders', products: 'Products', drinks: 'Drinks', settings: 'Settings' };
    document.getElementById('mobile-page-title').textContent = titles[page] || page;
    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('show');
    // Load data
    if (page === 'dashboard') loadDashboard();
    else if (page === 'orders') loadOrders();
    else if (page === 'products') loadProducts();
    else if (page === 'drinks') loadDrinks();
  }

  function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('show');
  }

  /* --------------------------------------------
     DASHBOARD
  -------------------------------------------- */
  function loadDashboard() {
    if (!isConfigured()) {
      document.getElementById('stats-grid').innerHTML =
        '<div class="stat-card"><div class="stat-label">Status</div><div class="stat-value" style="font-size:16px;color:var(--red);">Not Configured</div><div class="stat-sub">Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify env vars.</div></div>';
      return;
    }
    apiGet('orders', '?order=created_at.desc&limit=5').then(function (orders) {
      state.orders = orders || [];
      renderStats(orders);
      renderRecentOrders(orders);
    });
  }

  function renderStats(orders) {
    var total = orders.length;
    var revenue = orders.reduce(function (s, o) { return s + (o.total || 0); }, 0);
    var pending = orders.filter(function (o) { return o.status === 'payment_pending' || o.status === 'confirmed'; }).length;
    document.getElementById('stat-total-orders').textContent = total > 999 ? (total / 1000).toFixed(1) + 'k' : total;
    document.getElementById('stat-revenue').textContent = formatPrice(revenue);
    document.getElementById('stat-pending').textContent = pending;
    // Products count
    apiGet('products', '?is_active=eq.true&category=eq.mains').then(function (prods) {
      document.getElementById('stat-products').textContent = (prods || []).length;
    });
  }

  function renderRecentOrders(orders) {
    var tbody = document.getElementById('recent-orders-body');
    if (!orders || orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-muted);">No orders yet.</td></tr>';
      return;
    }
    var html = '';
    orders.slice(0, 5).forEach(function (o) {
      var st = STATUS_MAP[o.status] || STATUS_MAP.payment_pending;
      html += '<tr>' +
        '<td data-label="Order"><strong>' + escHtml(o.order_number) + '</strong></td>' +
        '<td data-label="Customer">' + escHtml(o.customer_name) + '</td>' +
        '<td data-label="Total"><strong>' + formatPrice(o.total) + '</strong></td>' +
        '<td data-label="Status"><span class="badge ' + st.badge + '">' + st.label + '</span></td>' +
        '<td data-label="Date" class="hide-mobile" style="color:var(--text-muted);font-size:12px;">' + formatDate(o.created_at) + '</td>' +
        '</tr>';
    });
    tbody.innerHTML = html;
  }

  /* --------------------------------------------
     ORDERS
  -------------------------------------------- */
  function loadOrders() {
    if (!isConfigured()) return;
    var tbody = document.getElementById('orders-body');
    tbody.innerHTML = '<tr><td colspan="7"><div class="skeleton" style="height:300px;"></div></td></tr>';
    apiGet('orders', '?order=created_at.desc&limit=100').then(function (orders) {
      state.orders = orders || [];
      if (state.orders.length > 0) state._lastOrderId = state.orders[0].id;
      renderOrders();
    });
  }

  function renderOrders() {
    var tbody = document.getElementById('orders-body');
    var orders = state.orders;

    // Sort bar
    var sortBar = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:12px;">' +
      '<div style="font-weight:600;color:var(--text);">Orders (' + (orders ? orders.length : 0) + ')</div>' +
      '<select id="order-sort-select" onchange="Admin.sortOrders(this.value)" style="padding:8px 12px;border-radius:8px;border:1px solid var(--gray-300);background:var(--card-bg);font-size:13px;font-weight:600;color:var(--text);">' +
        '<option value="created_at.desc">Newest First</option>' +
        '<option value="created_at.asc">Oldest First</option>' +
        '<option value="total.desc">Highest Amount</option>' +
        '<option value="total.asc">Lowest Amount</option>' +
        '<option value="customer_name.asc">Name A-Z</option>' +
        '<option value="status.asc">Status A-Z</option>' +
      '</select></div>';
    var tableEl = tbody.parentElement;
    var existingBar = document.getElementById('order-sort-bar');
    if (!existingBar) {
      var barDiv = document.createElement('div');
      barDiv.id = 'order-sort-bar';
      tableEl.parentElement.insertBefore(barDiv, tableEl);
    }
    document.getElementById('order-sort-bar').innerHTML = sortBar;

    if (!orders || orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted);">No orders found.</td></tr>';
      return;
    }
    var html = '';
    orders.forEach(function (o, idx) {
      var st = STATUS_MAP[o.status] || STATUS_MAP.payment_pending;
      var statusOptions = '';
      STATUS_OPTIONS.forEach(function (s) {
        var sLabel = STATUS_MAP[s].label;
        statusOptions += '<option value="' + s + '"' + (s === o.status ? ' selected' : '') + '>' + sLabel + '</option>';
      });
      html += '<tr>' +
        '<td data-label="Order"><strong>' + escHtml(o.order_number) + '</strong></td>' +
        '<td data-label="Customer">' + escHtml(o.customer_name) + '</td>' +
        '<td data-label="Phone" class="hide-mobile" style="color:var(--text-muted);">' + escHtml(o.customer_phone) + '</td>' +
        '<td data-label="Total"><strong>' + formatPrice(o.total) + '</strong></td>' +
        '<td data-label="Status"><select class="status-select" onchange="Admin.updateOrderStatus(' + o.id + ', this.value)">' + statusOptions + '</select></td>' +
        '<td data-label="Date" class="hide-mobile" style="color:var(--text-muted);font-size:12px;">' + formatDate(o.created_at) + '</td>' +
        '<td data-label="Actions" style="white-space:nowrap;"><button class="btn btn-outline btn-sm" onclick="Admin.viewOrder(' + idx + ')">View</button> <button class="btn btn-danger btn-sm" onclick="Admin.deleteOrder(' + idx + ')">Delete</button></td>' +
        '</tr>';
    });
    tbody.innerHTML = html;
  }

  function updateOrderStatus(orderId, newStatus) {
    apiPatch('orders', orderId, { status: newStatus }).then(function () {
      toast('Order status updated to ' + STATUS_MAP[newStatus].label);
      // Refresh
      if (state.currentPage === 'orders') loadOrders();
      else loadDashboard();
    }).catch(function (e) { toast('Failed to update: ' + e.message, 'error'); });
  }

  function deleteOrder(idx) {
    var o = state.orders[idx];
    if (!o) return;
    showConfirm(
      'Delete Order ' + escHtml(o.order_number) + '?',
      'This will permanently remove this order and it will no longer be counted in totals. This cannot be undone.',
      function () {
        apiDelete('orders', o.id).then(function () {
          toast('Order ' + o.order_number + ' deleted');
          // Remove from local state
          state.orders.splice(idx, 1);
          // Remove from known IDs so polling doesn't re-count it
          delete _knownOrderIds[o.id];
          // Refresh current view
          if (state.currentPage === 'orders') renderOrders();
          else loadDashboard();
        }).catch(function (e) { toast('Error deleting order: ' + e.message, 'error'); });
      }
    );
  }

  function viewOrder(idx) {
    var o = state.orders[idx];
    if (!o) return;
    var st = STATUS_MAP[o.status] || STATUS_MAP.payment_pending;
    var items = [];
    try { items = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []); } catch (e) { items = []; }

    var html = '<div class="order-detail-grid">' +
      '<div class="detail-item"><label>Order Number</label><span>' + escHtml(o.order_number) + '</span></div>' +
      '<div class="detail-item"><label>Status</label><span class="badge ' + st.badge + '">' + st.label + '</span></div>' +
      '<div class="detail-item"><label>Customer</label><span>' + escHtml(o.customer_name) + '</span></div>' +
      '<div class="detail-item"><label>Phone</label><span>' + escHtml(o.customer_phone) + '</span></div>' +
      (o.customer_email ? '<div class="detail-item"><label>Email</label><span>' + escHtml(o.customer_email) + '</span></div>' : '') +
      '<div class="detail-item"><label>Type</label><span>' + (o.delivery_type === 'delivery' ? 'Delivery' : 'Pickup') + '</span></div>' +
      (o.delivery_address ? '<div class="detail-item"><label>Address</label><span>' + escHtml(o.delivery_address) + '</span></div>' : '') +
      (o.delivery_area ? '<div class="detail-item"><label>Area</label><span>' + escHtml(o.delivery_area) + '</span></div>' : '') +
      (o.order_notes ? '<div class="detail-item" style="grid-column:1/-1;"><label>Notes</label><span>' + escHtml(o.order_notes) + '</span></div>' : '') +
      '</div>';

    if (items.length > 0) {
      html += '<div style="margin-bottom:16px;"><div style="font-weight:700;font-size:13px;margin-bottom:8px;">Items</div><div class="order-items-list">';
      items.forEach(function (item) {
        var extrasTotal = (item.extras || []).reduce(function (s, e) { return s + (e.price || 0); }, 0);
        var unitTotal = (item.price || 0) + extrasTotal;
        var name = escHtml(item.name || 'Item');
        if (item.extras && item.extras.length > 0) {
          name += ' <span style="color:var(--text-muted);">+ ' + escHtml(item.extras.map(function (e) { return e.name; }).join(', ')) + '</span>';
        }
        html += '<div class="order-item-row"><span>' + name + ' &times;' + (item.quantity || 1) + '</span><strong>' + formatPrice(unitTotal * (item.quantity || 1)) + '</strong></div>';
      });
      html += '</div></div>';
    }

    html += '<div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:2px solid var(--gray-200);"><span style="font-weight:700;font-size:15px;">Total</span><span style="font-weight:700;font-size:18px;">' + formatPrice(o.total) + '</span></div>';

    // Store index for delete button
    var modalFooter = document.getElementById('order-modal').querySelector('.modal-footer');
    modalFooter.innerHTML = '<button class="btn btn-outline" onclick="Admin.closeOrderModal()">Close</button>' +
      '<button class="btn btn-danger" onclick="Admin.deleteOrder(' + idx + '); Admin.closeOrderModal();">Delete Order</button>';

    document.getElementById('order-modal-body').innerHTML = html;
    document.getElementById('order-modal').classList.add('open');
  }

  function closeOrderModal() {
    document.getElementById('order-modal').classList.remove('open');
    // Reset footer
    var modalFooter = document.getElementById('order-modal').querySelector('.modal-footer');
    if (modalFooter) modalFooter.innerHTML = '<button class="btn btn-outline" onclick="Admin.closeOrderModal()">Close</button>';
  }

  /* --------------------------------------------
     PRODUCTS
  -------------------------------------------- */
  function loadProducts() {
    if (!isConfigured()) {
      document.getElementById('products-container').innerHTML = '<div class="empty-state"><p>Supabase not configured. Set env vars in Netlify.</p></div>';
      return;
    }
    document.getElementById('products-container').innerHTML = '<div class="products-grid"><div class="product-admin-card"><div class="card-img"><div class="skeleton" style="width:100%;height:100%;"></div></div></div><div class="product-admin-card"><div class="card-img"><div class="skeleton" style="width:100%;height:100%;"></div></div></div></div>';
    apiGet('products', '?category=eq.mains&order=sort_order.asc').then(function (prods) {
      state.products = prods || [];
      renderProducts();
    });
  }

  function renderProducts() {
    var container = document.getElementById('products-container');
    var prods = state.products;
    if (!prods || prods.length === 0) {
      container.innerHTML = '<div class="empty-state"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10z"/></svg><p>No products yet. Add your first product.</p></div>';
      return;
    }
    var html = '<div class="products-grid">';
    prods.forEach(function (p, idx) {
      var imgSrc = p.image_regular || '';
      var imgHtml = imgSrc
        ? '<img src="' + escHtml(imgSrc) + '" alt="' + escHtml(p.name) + '" onerror="this.parentElement.innerHTML=\'<span class=placeholder>No image</span>\'">'
        : '<span class="placeholder">No image</span>';
      var activeClass = p.is_active ? '' : ' inactive-card';
      html += '<div class="product-admin-card' + activeClass + '">' +
        '<div class="card-img">' + imgHtml + '</div>' +
        '<div class="card-body">' +
          '<h4>' + escHtml(p.name) + '</h4>' +
          '<p class="card-desc">' + escHtml(p.description) + '</p>' +
          '<div class="card-prices"><span class="price-chip">' + formatPrice(p.regular_price) + '</span></div>' +
          '<div class="card-actions">' +
            '<button class="btn btn-outline btn-sm" onclick="Admin.editProduct(' + idx + ')">Edit</button>' +
            '<button class="btn btn-outline btn-sm" onclick="Admin.toggleProductActive(' + p.id + ',' + !p.is_active + ')">' + (p.is_active ? 'Deactivate' : 'Activate') + '</button>' +
            '<button class="btn btn-danger btn-sm" onclick="Admin.deleteProduct(' + idx + ')">Delete</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
  }

  /* Product Modal */
  function openProductModal(editIdx) {
    state.editFiles = {};
    var isEdit = typeof editIdx === 'number';
    document.getElementById('product-modal-title').textContent = isEdit ? 'Edit Product' : 'Add Product';
    document.getElementById('pm-save-btn').textContent = isEdit ? 'Update Product' : 'Save Product';

    if (isEdit) {
      var p = state.products[editIdx];
      document.getElementById('pm-edit-id').value = p.id;
      document.getElementById('pm-product-id').value = p.product_id;
      document.getElementById('pm-product-id').disabled = true;
      document.getElementById('pm-name').value = p.name;
      document.getElementById('pm-description').value = p.description || '';
      document.getElementById('pm-regular-price').value = p.regular_price || '';
      document.getElementById('pm-sort-order').value = p.sort_order || 0;
      document.getElementById('pm-accepts-extras').value = p.accepts_extras ? 'true' : 'false';
      // Show current image
      setImgPreview('pm-preview-regular', p.image_regular);
      document.getElementById('pm-img-regular-current').value = p.image_regular || '';
    } else {
      document.getElementById('pm-edit-id').value = '';
      document.getElementById('pm-product-id').value = '';
      document.getElementById('pm-product-id').disabled = false;
      document.getElementById('pm-name').value = '';
      document.getElementById('pm-description').value = '';
      document.getElementById('pm-regular-price').value = '';
      document.getElementById('pm-sort-order').value = state.products.length + 1;
      document.getElementById('pm-accepts-extras').value = 'false';
      clearImgPreview('pm-preview-regular');
      document.getElementById('pm-img-regular-current').value = '';
    }
    document.getElementById('product-modal').classList.add('open');
  }

  function closeProductModal() {
    document.getElementById('product-modal').classList.remove('open');
    state.editFiles = {};
  }

  function editProduct(idx) { openProductModal(idx); }

  function setImgPreview(elId, src) {
    var el = document.getElementById(elId);
    if (src) { el.src = src; el.classList.add('show'); } else { el.classList.remove('show'); }
  }

  function clearImgPreview(elId) {
    var el = document.getElementById(elId);
    el.src = ''; el.classList.remove('show');
  }

  function previewImage(input, previewId) {
    var file = input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      var el = document.getElementById(previewId);
      el.src = e.target.result;
      el.classList.add('show');
      state.editFiles[previewId] = file;
    };
    reader.readAsDataURL(file);
  }

  function saveProduct() {
    var editId = document.getElementById('pm-edit-id').value;
    var productId = document.getElementById('pm-product-id').value.trim();
    var name = document.getElementById('pm-name').value.trim();
    var description = document.getElementById('pm-description').value.trim();
    var regularPrice = parseInt(document.getElementById('pm-regular-price').value) || 0;
    var sortOrder = parseInt(document.getElementById('pm-sort-order').value) || 0;
    var acceptsExtras = document.getElementById('pm-accepts-extras').value === 'true';

    if (!productId) { toast('Product ID is required', 'error'); return; }
    if (!name) { toast('Product name is required', 'error'); return; }
    if (!regularPrice) { toast('Regular price is required', 'error'); return; }

    var data = {
      product_id: productId, name: name, description: description,
      category: 'mains', accepts_extras: acceptsExtras,
      regular_price: regularPrice, maxi_price: 0,
      combo_price: null, combo_label: null,
      sort_order: sortOrder, is_active: true,
    };

    // Handle image upload
    uploadProductImages(productId, editId).then(function (urls) {
      if (urls.regular !== undefined) data.image_regular = urls.regular;

      if (editId) {
        delete data.product_id;
        delete data.category;
        apiPatch('products', editId, data).then(function () {
          toast('Product updated');
          closeProductModal();
          loadProducts();
        }).catch(function (e) { toast('Error: ' + e.message, 'error'); });
      } else {
        apiPost('products', data).then(function () {
          toast('Product added');
          closeProductModal();
          loadProducts();
        }).catch(function (e) { toast('Error: ' + e.message, 'error'); });
      }
    });
  }

  function uploadProductImages(productId, editId) {
    var file = state.editFiles['pm-preview-regular'];
    var currentUrl = document.getElementById('pm-img-regular-current').value;
    var results = {};

    if (file) {
      var ext = file.name.split('.').pop();
      var storagePath = productId + '/regular-' + Date.now() + '.' + ext;
      return uploadToStorage(storagePath, file).then(function (url) {
        results.regular = url;
        return results;
      }).catch(function () {
        results.regular = currentUrl || '';
        return results;
      });
    } else {
      if (editId) results.regular = currentUrl || '';
      return Promise.resolve(results);
    }
  }

  function uploadToStorage(path, file) {
    var formData = new FormData();
    formData.append('file', file);
    return fetch(
      CONFIG.SUPABASE_URL + '/storage/v1/object/' + CONFIG.STORAGE_BUCKET + '/' + path,
      {
        method: 'POST',
        headers: {
          'apikey': CONFIG.SUPABASE_KEY,
          'Authorization': 'Bearer ' + CONFIG.SUPABASE_KEY,
        },
        body: formData,
      }
    ).then(function (r) {
      if (!r.ok) throw new Error('Upload failed');
      // Return public URL
      var publicUrl = CONFIG.SUPABASE_URL.replace('/rest/v1', '') +
        '/storage/v1/object/public/' + CONFIG.STORAGE_BUCKET + '/' + path;
      return publicUrl;
    });
  }

  function toggleProductActive(id, active) {
    apiPatch('products', id, { is_active: active }).then(function () {
      toast(active ? 'Product activated' : 'Product deactivated');
      loadProducts();
    }).catch(function (e) { toast('Error: ' + e.message, 'error'); });
  }

  function deleteProduct(idx) {
    var p = state.products[idx];
    if (!p) return;
    showConfirm('Delete Product?', 'Are you sure you want to delete "' + p.name + '"? This cannot be undone.', function () {
      apiDelete('products', p.id).then(function () {
        toast('Product deleted');
        loadProducts();
      }).catch(function (e) { toast('Error: ' + e.message, 'error'); });
    });
  }

  /* --------------------------------------------
     DRINKS
  -------------------------------------------- */
  function loadDrinks() {
    if (!isConfigured()) {
      document.getElementById('drinks-container').innerHTML = '<div class="empty-state"><p>Supabase not configured.</p></div>';
      return;
    }
    document.getElementById('drinks-container').innerHTML = '<div class="skeleton" style="height:200px;"></div>';
    apiGet('products', '?category=eq.drinks&order=sort_order.asc').then(function (prods) {
      state.drinks = prods || [];
      renderDrinks();
    });
  }

  function renderDrinks() {
    var container = document.getElementById('drinks-container');
    var drinks = state.drinks || [];
    if (drinks.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No drinks yet. Add your first drink.</p></div>';
      return;
    }
    var html = '<div class="data-card"><div class="table-wrap"><table class="data-table">' +
      '<thead><tr><th>Image</th><th>Name</th><th>Price</th><th>Sort</th><th>Active</th><th>Actions</th></tr></thead><tbody>';
    drinks.forEach(function (d, idx) {
      var imgHtml = d.image_single
        ? '<img src="' + escHtml(d.image_single) + '" style="width:48px;height:48px;object-fit:cover;border-radius:4px;" onerror="this.style.display=\'none\'">'
        : '<span style="color:var(--text-muted);font-size:12px;">No img</span>';
      html += '<tr>' +
        '<td data-label="Image">' + imgHtml + '</td>' +
        '<td data-label="Name"><strong>' + escHtml(d.name) + '</strong></td>' +
        '<td data-label="Price"><strong>' + formatPrice(d.regular_price) + '</strong></td>' +
        '<td data-label="Sort" class="hide-mobile">' + d.sort_order + '</td>' +
        '<td data-label="Active"><span class="badge ' + (d.is_active ? 'badge-green' : 'badge-gray') + '">' + (d.is_active ? 'Active' : 'Inactive') + '</span></td>' +
        '<td data-label="Actions">' +
          '<button class="btn btn-outline btn-sm" onclick="Admin.editDrink(' + idx + ')">Edit</button> ' +
          '<button class="btn btn-danger btn-sm" onclick="Admin.deleteDrink(' + idx + ')">Delete</button>' +
        '</td></tr>';
    });
    html += '</tbody></table></div></div>';
    container.innerHTML = html;
  }

  /* Drink Modal */
  function openDrinkModal(editIdx) {
    state.editFiles = {};
    var isEdit = typeof editIdx === 'number';
    document.getElementById('drink-modal-title').textContent = isEdit ? 'Edit Drink' : 'Add Drink';
    document.getElementById('dm-save-btn').textContent = isEdit ? 'Update Drink' : 'Save Drink';

    if (isEdit) {
      var d = state.drinks[editIdx];
      document.getElementById('dm-edit-id').value = d.id;
      document.getElementById('dm-product-id').value = d.product_id;
      document.getElementById('dm-product-id').disabled = true;
      document.getElementById('dm-name').value = d.name;
      document.getElementById('dm-price').value = d.regular_price || '';
      document.getElementById('dm-sort-order').value = d.sort_order || 0;
      setImgPreview('dm-preview', d.image_single);
      document.getElementById('dm-img-current').value = d.image_single || '';
    } else {
      document.getElementById('dm-edit-id').value = '';
      document.getElementById('dm-product-id').value = '';
      document.getElementById('dm-product-id').disabled = false;
      document.getElementById('dm-name').value = '';
      document.getElementById('dm-price').value = '';
      document.getElementById('dm-sort-order').value = (state.drinks || []).length + 7;
      clearImgPreview('dm-preview');
      document.getElementById('dm-img-current').value = '';
    }
    document.getElementById('drink-modal').classList.add('open');
  }

  function closeDrinkModal() {
    document.getElementById('drink-modal').classList.remove('open');
    state.editFiles = {};
  }

  function editDrink(idx) { openDrinkModal(idx); }

  function saveDrink() {
    var editId = document.getElementById('dm-edit-id').value;
    var productId = document.getElementById('dm-product-id').value.trim();
    var name = document.getElementById('dm-name').value.trim();
    var price = parseInt(document.getElementById('dm-price').value) || 0;
    var sortOrder = parseInt(document.getElementById('dm-sort-order').value) || 0;

    if (!productId) { toast('Drink ID is required', 'error'); return; }
    if (!name) { toast('Drink name is required', 'error'); return; }
    if (!price) { toast('Price is required', 'error'); return; }

    var data = {
      product_id: productId, name: name, description: '',
      category: 'drinks', accepts_extras: false,
      regular_price: price, maxi_price: 0,
      combo_price: null, combo_label: null,
      sort_order: sortOrder, is_active: true,
    };

    // Handle image upload
    var file = state.editFiles['dm-preview'];
    var currentUrl = document.getElementById('dm-img-current').value;

    var uploadPromise;
    if (file) {
      var ext = file.name.split('.').pop();
      var storagePath = productId + '/' + Date.now() + '.' + ext;
      uploadPromise = uploadToStorage(storagePath, file).then(function (url) {
        data.image_single = url;
      }).catch(function () {
        data.image_single = currentUrl || '';
      });
    } else {
      uploadPromise = Promise.resolve();
      if (editId) data.image_single = currentUrl || '';
    }

    uploadPromise.then(function () {
      if (editId) {
        delete data.product_id;
        delete data.category;
        apiPatch('products', editId, data).then(function () {
          toast('Drink updated'); closeDrinkModal(); loadDrinks();
        }).catch(function (e) { toast('Error: ' + e.message, 'error'); });
      } else {
        apiPost('products', data).then(function () {
          toast('Drink added'); closeDrinkModal(); loadDrinks();
        }).catch(function (e) { toast('Error: ' + e.message, 'error'); });
      }
    });
  }

  function deleteDrink(idx) {
    var d = state.drinks[idx];
    if (!d) return;
    showConfirm('Delete Drink?', 'Are you sure you want to delete "' + d.name + '"?', function () {
      apiDelete('products', d.id).then(function () {
        toast('Drink deleted'); loadDrinks();
      }).catch(function (e) { toast('Error: ' + e.message, 'error'); });
    });
  }

  /* --------------------------------------------
     NOTIFICATION: Sound + Badge + Counter
  -------------------------------------------- */
  var _audioCtx = null;
  var _audioUnlocked = false;
  var _newOrderCount = 0;
  var _knownOrderIds = {};  // track all seen order IDs
  var _pollRunning = false;

  function getAudioContext() {
    if (!_audioCtx) {
      try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }
    return _audioCtx;
  }

  function unlockAudio() {
    if (_audioUnlocked) return;
    _audioUnlocked = true;
    var ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(function () {});
    }
  }

  function playNotificationSound() {
    // Try Web Audio API first (most reliable on mobile)
    var ctx = getAudioContext();
    if (ctx) {
      try {
        if (ctx.state === 'suspended') ctx.resume();
        // Play a pleasant two-tone chime
        var now = ctx.currentTime;
        [880, 1108.73].forEach(function (freq, i) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.value = freq;
          var start = now + i * 0.18;
          gain.gain.setValueAtTime(0.5, start);
          gain.gain.exponentialRampToValueAtTime(0.01, start + 0.35);
          osc.start(start);
          osc.stop(start + 0.35);
        });
        // Vibrate on supported devices
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        return;
      } catch (e) {}
    }
    // Fallback: WAV data URI
    try {
      var wavUrl = generateBeepDataUri();
      if (wavUrl) {
        var audio = new Audio(wavUrl);
        audio.volume = 0.7;
        audio.play().catch(function () {});
      }
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    } catch (e) {}
  }

  function generateBeepDataUri() {
    try {
      var sampleRate = 44100, duration = 0.5, frequency = 880;
      var numSamples = Math.floor(sampleRate * duration);
      var dataLength = numSamples * 2;
      var buffer = new ArrayBuffer(44 + dataLength);
      var view = new DataView(buffer);
      function writeString(offset, str) { for (var i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); }
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + dataLength, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, dataLength, true);
      for (var i = 0; i < numSamples; i++) {
        var t = i / sampleRate;
        var envelope = Math.max(0, 1 - t / duration);
        var sample = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.7;
        var intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
        view.setInt16(44 + i * 2, intSample, true);
      }
      return 'data:audio/wav;base64,' + btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
    } catch (e) { return null; }
  }

  function updateNotifBadge(count) {
    _newOrderCount = count;
    // 1. PWA home screen badge
    if (navigator.setAppBadge) {
      if (count > 0) navigator.setAppBadge(count).catch(function () {});
      else navigator.clearAppBadge().catch(function () {});
    }
    // 2. Document title
    var baseTitle = 'Admin - GIZDODOSPECIALS';
    document.title = count > 0 ? '(' + count + ') ' + baseTitle : baseTitle;
    // 3. Sidebar orders link badge
    var sidebarOrdersLink = document.querySelector('.sidebar-link[data-page="orders"]');
    if (sidebarOrdersLink) {
      var existingBadge = sidebarOrdersLink.querySelector('.order-notif-badge');
      if (count > 0) {
        if (!existingBadge) {
          existingBadge = document.createElement('span');
          existingBadge.className = 'order-notif-badge';
          sidebarOrdersLink.style.position = 'relative';
          sidebarOrdersLink.appendChild(existingBadge);
        }
        existingBadge.textContent = count > 99 ? '99+' : count;
      } else if (existingBadge) {
        existingBadge.remove();
      }
    }
    // 4. Mobile header notification badge
    var mobileNotif = document.getElementById('mobile-notif-badge');
    if (mobileNotif) {
      mobileNotif.textContent = count > 0 ? (count > 99 ? '99+' : count) : '';
    }
  }

  function injectMobileNotifElements() {
    // Inject bell icon + badge into mobile header
    var mobileHeader = document.querySelector('.mobile-header');
    if (!mobileHeader || document.getElementById('mobile-notif-badge')) return;
    // Wrap existing children in a header-left div
    var children = Array.prototype.slice.call(mobileHeader.children);
    var leftDiv = document.createElement('div');
    leftDiv.className = 'header-left';
    children.forEach(function (child) { leftDiv.appendChild(child); });
    mobileHeader.appendChild(leftDiv);
    // Create right side with bell
    var rightDiv = document.createElement('div');
    rightDiv.className = 'header-right';
    rightDiv.innerHTML = '<button class="notif-bell" onclick="Admin.navigate(\'orders\')" aria-label="View orders"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><span id="mobile-notif-badge" class="order-notif-badge mobile-notif-badge"></span></button>';
    mobileHeader.appendChild(rightDiv);
  }

  function clearNotifOnView() {
    if (_newOrderCount > 0) {
      _newOrderCount = 0;
      updateNotifBadge(0);
    }
  }

  /* --------------------------------------------
     SETTINGS - PASSWORD CHANGE
  -------------------------------------------- */
  function changePassword() {
    var currentPw = document.getElementById('settings-current-pw').value;
    var newPw = document.getElementById('settings-new-pw').value;
    var confirmPw = document.getElementById('settings-confirm-pw').value;
    var msgEl = document.getElementById('settings-pw-msg');
    var btn = document.getElementById('settings-pw-btn');

    if (!currentPw || !newPw || !confirmPw) { toast('All fields are required', 'error'); return; }
    if (newPw !== confirmPw) { toast('New passwords do not match', 'error'); return; }
    if (newPw.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }

    if (!isConfigured()) { toast('Supabase not configured. Cannot change password.', 'error'); return; }

    btn.disabled = true;
    btn.textContent = 'Changing...';

    sha256(currentPw).then(function (currentHash) {
      // Check env hash first
      var localHash = CONFIG.ADMIN_PASSWORD_HASH;
      if (localHash && currentHash === localHash) {
        // Current password matches env var, proceed to change
        return sha256(newPw);
      }
      // Then check Supabase
      return apiGet('admin_settings', '?key=eq.password_hash&select=value').then(function (rows) {
        var dbHash = (rows && rows.length > 0) ? rows[0].value : null;
        if (currentHash !== dbHash) {
          throw new Error('Current password is incorrect');
        }
        return sha256(newPw);
      });
    }).then(function (newHash) {
      if (!newHash) return;
      return apiGet('admin_settings', '?key=eq.password_hash&select=id').then(function (rows) {
        if (rows && rows.length > 0) {
          return apiPatch('admin_settings', rows[0].id, { value: newHash, updated_at: new Date().toISOString() });
        } else {
          return apiPost('admin_settings', { key: 'password_hash', value: newHash });
        }
      });
    }).then(function () {
      toast('Password changed successfully');
      document.getElementById('settings-current-pw').value = '';
      document.getElementById('settings-new-pw').value = '';
      document.getElementById('settings-confirm-pw').value = '';
    }).catch(function (e) {
      toast('Error: ' + (e.message || e), 'error');
    }).then(function () {
      btn.disabled = false;
      btn.textContent = 'Change Password';
    });
  }

  /* --------------------------------------------
     CONFIRM DIALOG
  -------------------------------------------- */
  function showConfirm(title, message, fn) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    state.pendingConfirmFn = fn;
    document.getElementById('confirm-dialog').classList.add('open');
  }

  function confirmAction() {
    if (state.pendingConfirmFn) state.pendingConfirmFn();
    closeConfirm();
  }

  function closeConfirm() {
    document.getElementById('confirm-dialog').classList.remove('open');
    state.pendingConfirmFn = null;
  }

  /* --------------------------------------------
     ORDER POLLING (background new-order notification)
  -------------------------------------------- */
  var orderPollInterval = null;

  function startOrderPolling() {
    stopOrderPolling();
    injectMobileNotifElements();
    if (!isConfigured()) return;

    // Seed known order IDs (don't count existing orders as "new")
    apiGet('orders', '?select=id&order=created_at.desc&limit=50').then(function (rows) {
      _knownOrderIds = {};
      (rows || []).forEach(function (r) { _knownOrderIds[r.id] = true; });
      updateNotifBadge(0);
    });

    // Poll every 15 seconds for new orders
    orderPollInterval = setInterval(function () {
      if (!isConfigured() || !state.loggedIn) { stopOrderPolling(); return; }
      if (_pollRunning) return; // prevent overlapping requests
      _pollRunning = true;
      apiGet('orders', '?select=id,status,created_at&order=created_at.desc&limit=50').then(function (rows) {
        _pollRunning = false;
        var newCount = 0;
        (rows || []).forEach(function (r) {
          if (!_knownOrderIds[r.id]) {
            _knownOrderIds[r.id] = true;
            newCount++;
          }
        });
        if (newCount > 0) {
          _newOrderCount += newCount;
          updateNotifBadge(_newOrderCount);
          playNotificationSound();
          // Auto-refresh if currently viewing orders or dashboard
          if (state.currentPage === 'orders') loadOrders();
          else if (state.currentPage === 'dashboard') loadDashboard();
        }
      }).catch(function () { _pollRunning = false; });
    }, 15000);
  }

  function stopOrderPolling() {
    if (orderPollInterval) { clearInterval(orderPollInterval); orderPollInterval = null; }
    _pollRunning = false;
  }

  /* --------------------------------------------
     PUSH NOTIFICATIONS
  -------------------------------------------- */
  var _pushSubscription = null;

  function subscribeToPushNotifications() {
    if (!CONFIG.VAPID_PUBLIC_KEY || CONFIG.VAPID_PUBLIC_KEY.indexOf('__') === 0) {
      // VAPID key not configured — skip push setup silently
      return;
    }
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    // Request notification permission
    Notification.requestPermission().then(function (permission) {
      if (permission !== 'granted') {
        console.log('Push notification permission denied');
        return;
      }
      // Get service worker registration, then subscribe
      navigator.serviceWorker.ready.then(function (registration) {
        return registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
        });
      }).then(function (subscription) {
        _pushSubscription = subscription;
        // Send subscription to Edge Function (saved in Supabase)
        return sendPushSubscriptionToServer(subscription);
      }).then(function (res) {
        if (res && res.ok) {
          toast('Push notifications enabled');
        }
      }).catch(function (err) {
        console.log('Push subscribe error:', err.message || err);
      });
    });
  }

  function unsubscribeFromPushNotifications() {
    if (!_pushSubscription) return;
    var sub = _pushSubscription;
    _pushSubscription = null;
    sub.unsubscribe().catch(function () {});
    // Tell server to remove
    if (CONFIG.EDGE_FUNCTION_URL && CONFIG.EDGE_FUNCTION_URL.indexOf('__') !== 0) {
      fetch(CONFIG.EDGE_FUNCTION_URL + '/functions/v1/send-push', {
        method: 'DELETE',
        headers: {
          'x-push-endpoint': sub.endpoint,
        },
      }).catch(function () {});
    }
  }

  function sendPushSubscriptionToServer(subscription) {
    if (!CONFIG.EDGE_FUNCTION_URL || CONFIG.EDGE_FUNCTION_URL.indexOf('__') === 0) {
      return Promise.resolve(null);
    }
    var keys = subscription.toJSON().keys;
    return fetch(CONFIG.EDGE_FUNCTION_URL + '/functions/v1/send-push', {
      method: 'POST',
      headers: {
        'x-push-endpoint': subscription.endpoint,
        'x-push-auth': keys.auth,
        'x-push-p256dh': keys.p256dh,
      },
    });
  }

  function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);
    for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /* --------------------------------------------
     ORDER SORTING
  -------------------------------------------- */
  function sortOrders(sortKey) {
    if (!state.orders || state.orders.length === 0) return;
    var parts = sortKey.split('.');
    var field = parts[0];
    var dir = parts[1] || 'asc';
    state.orders.sort(function (a, b) {
      var va = a[field];
      var vb = b[field];
      if (va == null) va = '';
      if (vb == null) vb = '';
      if (va < vb) return dir === 'asc' ? -1 : 1;
      if (va > vb) return dir === 'asc' ? 1 : -1;
      return 0;
    });
    renderOrders();
  }

  /* --------------------------------------------
     INIT
  -------------------------------------------- */
  function init() {
    // Enter key on login
    document.getElementById('login-password').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') login();
    });
    // Check session
    checkSession();
    // Re-focus audio on visibility change (mobile wake-up)
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && _audioUnlocked) {
        var ctx = getAudioContext();
        if (ctx && ctx.state === 'suspended') ctx.resume().catch(function () {});
      }
    });
  }

  // Public API
  return {
    login: login,
    logout: logout,
    clearNotifOnView: clearNotifOnView,
    navigate: function (page) { clearNotifOnView(); navigate(page); },
    toggleSidebar: toggleSidebar,
    loadOrders: loadOrders,
    updateOrderStatus: updateOrderStatus,
    deleteOrder: deleteOrder,
    viewOrder: viewOrder,
    closeOrderModal: closeOrderModal,
    openProductModal: openProductModal,
    closeProductModal: closeProductModal,
    editProduct: editProduct,
    saveProduct: saveProduct,
    toggleProductActive: toggleProductActive,
    deleteProduct: deleteProduct,
    openDrinkModal: openDrinkModal,
    closeDrinkModal: closeDrinkModal,
    editDrink: editDrink,
    saveDrink: saveDrink,
    deleteDrink: deleteDrink,
    changePassword: changePassword,
    previewImage: previewImage,
    showConfirm: showConfirm,
    confirmAction: confirmAction,
    closeConfirm: closeConfirm,
    sortOrders: sortOrders,
    startOrderPolling: startOrderPolling,
    stopOrderPolling: stopOrderPolling,
  };

})();

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', Admin.init);
else Admin.init();
