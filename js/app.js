/**
 * Ginger WashMate - Master Application Controller
 * Handles SPA navigation, theme switching (Light/Dark), full CRUD operations,
 * Packages module, and interactive state management.
 */

const GingerApp = {
  data: INITIAL_DATA,
  currentModule: 'dashboard',
  currentTheme: 'light',
  filters: {
    bookings: { search: '', status: 'all', payment: 'all' },
    packages: { search: '', type: 'all', vehicle: 'all', status: 'all', priceRange: 'all' },
    customers: { search: '' },
    vehicles: { search: '', type: 'all' },
    inventory: { search: '', category: 'all' }
  },

  init: function () {
    this.initTheme();
    this.initAuth();
    this.updateCurrentUserUI();
    this.setupNavigation();
    this.setupGlobalSearch();
    this.setupModalListeners();
    this.setupBookingFormCalculation();
    this.renderAll();
    this.updateNotificationCounter();
    console.log("Ginger WashMate Initialized Successfully");
  },

  // State Persistence Helper
  saveState: function () {
    StateManager.save(this.data);
  },

  // =========================================================================
  // THEME MANAGEMENT (LIGHT / DARK MODE)
  // =========================================================================
  initTheme: function () {
    let savedTheme = 'light';
    if (localStorage.getItem('ginger_theme_user_set') === 'true') {
      savedTheme = localStorage.getItem('ginger_theme') || 'light';
    } else {
      localStorage.setItem('ginger_theme', 'light');
    }
    this.setTheme(savedTheme);
  },

  setTheme: function (theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('ginger_theme', theme);

    // Update Theme Toggle Button Icons in Topbar
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      if (theme === 'light') {
        toggleBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        `;
        toggleBtn.title = "Switch to Dark Mode";
      } else {
        toggleBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        `;
        toggleBtn.title = "Switch to Light Mode";
      }
    }
  },

  toggleTheme: function () {
    const nextTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('ginger_theme_user_set', 'true');
    this.setTheme(nextTheme);
    this.showToast(`Switched to ${nextTheme === 'light' ? 'Light' : 'Dark'} Mode`, 'info');
    // Refresh SVG charts to match theme contrast
    if (this.currentModule === 'dashboard' || this.currentModule === 'reports') {
      ReportsEngine.renderDashboardCharts();
      ReportsEngine.renderBookingChart('reports-booking-chart-svg');
      ReportsEngine.renderRevenueChart('reports-revenue-chart-svg');
    }
  },

  // =========================================================================
  // SPA NAVIGATION CONTROLLER
  // =========================================================================
  navigateTo: function (moduleName) {
    this.currentModule = moduleName;

    // Update Sidebar Active state
    document.querySelectorAll('.nav-item').forEach(el => {
      if (el.dataset.module === moduleName) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Reveal page module
    document.querySelectorAll('.page-module').forEach(page => {
      page.classList.remove('active-module');
    });

    const targetPage = document.getElementById(`page-${moduleName}`);
    if (targetPage) {
      targetPage.classList.add('active-module');
    }

    // Update Breadcrumbs
    const bcCurrent = document.getElementById('topbar-breadcrumb-current');
    if (bcCurrent) {
      const labels = {
        dashboard: "Operational Dashboard",
        bookings: "Bookings & Appointments",
        workflow: "Service Workflow & Quality Check",
        packages: "Packages Management",
        customers: "Customer Directory",
        'customer-profile': "Customer Profile",
        vehicles: "Vehicle Master",
        services: "Services Catalog",
        staff: "Staff Management",
        billing: "Billing & Invoices",
        inventory: "Inventory & Consumables",
        notifications: "Notification Center",
        reports: "Reports & Analytics",
        roles: "User Roles & Permissions",
        settings: "Business & System Settings"
      };
      bcCurrent.textContent = labels[moduleName] || moduleName;
    }

    // Trigger target renderers
    if (moduleName === 'dashboard') this.renderDashboard();
    else if (moduleName === 'bookings') this.renderBookingsTable();
    else if (moduleName === 'workflow') window.WorkflowEngine.renderBoard();
    else if (moduleName === 'packages') this.renderPackagesTable();
    else if (moduleName === 'customers') this.renderCustomersTable();
    else if (moduleName === 'customer-profile') this.renderCustomerProfilePage(this.activeProfileCustomerId);
    else if (moduleName === 'vehicles') this.renderVehiclesTable();
    else if (moduleName === 'services') this.renderServicesCatalog();
    else if (moduleName === 'staff') this.renderStaffModule();
    else if (moduleName === 'billing') this.renderBillingTable();
    else if (moduleName === 'inventory') this.renderInventoryModule();
    else if (moduleName === 'notifications') this.renderNotificationsModule();
    else if (moduleName === 'reports') this.renderReportsModule();
    else if (moduleName === 'roles') {
      this.renderUsersTable();
      this.renderRolesCards();
      this.renderRolesMatrix();
    }
    else if (moduleName === 'settings') {
      this.renderSettingsModule();
    }
    // Close mobile sidebar after navigation
    this.closeMobileSidebar();
  },


  setupNavigation: function () {
    const self = this;
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const mod = this.dataset.module;
        if (mod) self.navigateTo(mod);
      });
    });

    // Sidebar collapse toggle
    const collapseBtn = document.getElementById('sidebar-toggle-btn');
    const sidebar = document.getElementById('main-sidebar');
    if (collapseBtn && sidebar) {
      collapseBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });
    }

    // Quick action trigger
    const quickActionBtn = document.getElementById('btn-quick-action');
    const quickActionMenu = document.getElementById('quick-action-menu');
    if (quickActionBtn && quickActionMenu) {
      quickActionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        quickActionMenu.classList.toggle('active');
      });
    }

    // Notification dropdown toggle
    const notifBtn = document.getElementById('topbar-notif-btn');
    const notifMenu = document.getElementById('topbar-notif-dropdown');
    if (notifBtn && notifMenu) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifMenu.classList.toggle('active');
        self.renderNotificationsDropdown();
      });
    }

    // Close popovers and action dropdowns on outer click
    document.addEventListener('click', () => {
      if (quickActionMenu) quickActionMenu.classList.remove('active');
      if (notifMenu) notifMenu.classList.remove('active');
      const userMenu = document.getElementById('user-profile-menu');
      if (userMenu) userMenu.classList.remove('active');
      document.querySelectorAll('.actions-dropdown-wrap.open').forEach(el => el.classList.remove('open'));
    });

    // User profile menu
    const userWidget = document.getElementById('topbar-user-widget');
    const userMenu = document.getElementById('user-profile-menu');
    if (userWidget && userMenu) {
      userWidget.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenu.classList.toggle('active');
      });
    }
  },

  // Toggle Action Menu Dropdowns across all tables
  toggleActionMenu: function (menuId, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const target = document.getElementById(menuId);
    const isOpen = target && target.classList.contains('open');
    document.querySelectorAll('.actions-dropdown-wrap.open').forEach(el => el.classList.remove('open'));
    if (target && !isOpen) {
      target.classList.add('open');
    }
  },

  // =========================================================================
  // CONFIRMATION DIALOG MODAL HELPER
  // =========================================================================
  confirmAction: function (options) {
    const modalEl = document.getElementById('confirmation-dialog-modal');
    if (!modalEl) {
      if (confirm(options.message)) {
        options.onConfirm();
      }
      return;
    }

    document.getElementById('confirm-dialog-title').textContent = options.title || "Confirm Action";
    document.getElementById('confirm-dialog-msg').textContent = options.message || "Are you sure you want to proceed?";

    const confirmBtn = document.getElementById('confirm-dialog-btn-action');
    confirmBtn.textContent = options.confirmText || "Confirm";
    if (options.isDanger) {
      confirmBtn.className = "btn-danger";
    } else {
      confirmBtn.className = "btn-primary";
    }

    confirmBtn.onclick = () => {
      this.closeModal('confirmation-dialog-modal');
      if (options.onConfirm) options.onConfirm();
    };

    this.openModal('confirmation-dialog-modal');
  },

  // Setup Global Search with Keyboard shortcut (Ctrl+K or /)
  setupGlobalSearch: function () {
    const self = this;
    const searchInputs = document.querySelectorAll('.global-search-input');
    const palette = document.getElementById('global-search-modal');
    const paletteInput = document.getElementById('palette-search-input');

    const openPalette = () => {
      self.openModal('global-search-modal');
      if (paletteInput) {
        paletteInput.value = '';
        paletteInput.focus();
        self.executeGlobalSearch('');
      }
    };

    searchInputs.forEach(input => {
      input.addEventListener('click', openPalette);
      input.addEventListener('focus', openPalette);
    });

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openPalette();
      } else if (e.key === 'Escape') {
        self.closeAllModals();
      }
    });

    if (paletteInput) {
      paletteInput.addEventListener('input', (e) => {
        self.executeGlobalSearch(e.target.value);
      });
    }
  },

  executeGlobalSearch: function (query) {
    const q = (query || '').toLowerCase().trim();
    const resultsContainer = document.getElementById('palette-search-results');
    if (!resultsContainer) return;

    if (!q) {
      resultsContainer.innerHTML = `
        <div style="padding: 16px; text-align: center; color: var(--text-tertiary); font-size: 12px;">
          Type to search packages, customers, plates, booking IDs (BK-), or invoices (INV-)...
        </div>
      `;
      return;
    }

    const matchedPackages = this.data.packages.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.packageType.toLowerCase().includes(q)
    );

    const matchedBookings = this.data.bookings.filter(b =>
      b.id.toLowerCase().includes(q) ||
      b.customerName.toLowerCase().includes(q) ||
      b.vehiclePlate.toLowerCase().includes(q)
    );

    const matchedCustomers = this.data.customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q)
    );

    const matchedVehicles = this.data.vehicles.filter(v =>
      v.plateNumber.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.customerName.toLowerCase().includes(q)
    );

    const matchedInvoices = this.data.invoices.filter(i =>
      i.invoiceNumber.toLowerCase().includes(q) ||
      i.customerName.toLowerCase().includes(q) ||
      i.vehiclePlate.toLowerCase().includes(q)
    );

    let html = '';

    if (matchedPackages.length > 0) {
      html += `<div class="search-result-group-title">Car Wash Packages</div>`;
      matchedPackages.forEach(p => {
        html += `
          <div class="search-result-row" onclick="GingerApp.closeModal('global-search-modal'); GingerApp.openPackageDetails('${p.id}')">
            <div class="search-result-left">
              <span class="mono-tag" style="color: #60a5fa;">${p.packageType}</span>
              <div>
                <div style="font-weight: 600; color: var(--text-primary);">${p.name} - ${GingerApp.data.settings.currency} ${p.packagePrice.toLocaleString()}</div>
                <div style="font-size: 11px; color: var(--text-tertiary);">${p.duration} • ${p.vehicleType}</div>
              </div>
            </div>
            <span class="badge ${p.status === 'Active' ? 'badge-paid' : 'badge-unpaid'}">${p.status}</span>
          </div>
        `;
      });
    }

    if (matchedBookings.length > 0) {
      html += `<div class="search-result-group-title">Bookings & Jobs</div>`;
      matchedBookings.forEach(b => {
        html += `
          <div class="search-result-row" onclick="GingerApp.closeModal('global-search-modal'); WorkflowEngine.openBookingDetails('${b.id}')">
            <div class="search-result-left">
              <span class="mono-tag" style="color: #60a5fa;">${b.id}</span>
              <div>
                <div style="font-weight: 600; color: var(--text-primary);">${b.customerName} - ${b.vehicleModel}</div>
                <div style="font-size: 11px; color: var(--text-tertiary);">${b.serviceName} • ${b.bay}</div>
              </div>
            </div>
            <span class="badge ${WorkflowEngine.getBadgeClass(b.currentStageIndex)}">${b.bookingStatus}</span>
          </div>
        `;
      });
    }

    if (matchedCustomers.length > 0) {
      html += `<div class="search-result-group-title">Customers</div>`;
      matchedCustomers.forEach(c => {
        html += `
          <div class="search-result-row" onclick="GingerApp.closeModal('global-search-modal'); GingerApp.openCustomerDetails('${c.id}')">
            <div class="search-result-left">
              <span class="staff-micro-avatar">${c.name.split(' ').map(n => n[0]).join('')}</span>
              <div>
                <div style="font-weight: 600; color: var(--text-primary);">${c.name}</div>
                <div style="font-size: 11px; color: var(--text-tertiary);">${c.phone} • ${c.email}</div>
              </div>
            </div>
            <span class="badge badge-paid">${c.status}</span>
          </div>
        `;
      });
    }

    if (matchedVehicles.length > 0) {
      html += `<div class="search-result-group-title">Vehicles</div>`;
      matchedVehicles.forEach(v => {
        html += `
          <div class="search-result-row" onclick="GingerApp.closeModal('global-search-modal'); GingerApp.openVehicleDetails('${v.plateNumber}')">
            <div class="search-result-left">
              <span class="mono-tag">${v.plateNumber}</span>
              <div>
                <div style="font-weight: 600; color: var(--text-primary);">${v.make} ${v.model} (${v.year})</div>
                <div style="font-size: 11px; color: var(--text-tertiary);">Owner: ${v.customerName}</div>
              </div>
            </div>
            <span class="badge badge-in-service">${v.status}</span>
          </div>
        `;
      });
    }

    if (matchedInvoices.length > 0) {
      html += `<div class="search-result-group-title">Invoices</div>`;
      matchedInvoices.forEach(i => {
        html += `
          <div class="search-result-row" onclick="GingerApp.closeModal('global-search-modal'); InvoiceEngine.renderModal('${i.invoiceNumber}')">
            <div class="search-result-left">
              <span class="mono-tag" style="color: #34d399;">${i.invoiceNumber}</span>
              <div>
                <div style="font-weight: 600; color: var(--text-primary);">${i.customerName} - ${GingerApp.data.settings.currency} ${i.totalAmount.toLocaleString()}</div>
                <div style="font-size: 11px; color: var(--text-tertiary);">${i.date} • ${i.paymentMethod}</div>
              </div>
            </div>
            <span class="badge ${InvoiceEngine.getStatusBadgeClass(i.invoiceStatus || i.paymentStatus)}">${i.invoiceStatus || i.paymentStatus}</span>
          </div>
        `;
      });
    }

    if (!html) {
      resultsContainer.innerHTML = `
        <div class="empty-state-box" style="padding: 24px;">
          <div class="empty-state-title" style="font-size: 14px;">No records match "${query}"</div>
          <div class="empty-state-desc">Try searching for a package name, license plate like "QTR", or customer name.</div>
        </div>
      `;
    } else {
      resultsContainer.innerHTML = html;
    }
  },

  // Modal Management
  openModal: function (modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('active');
    if (modalId === 'add-booking-modal') {
      this.populateBookingCustomerDropdown();
      const custSelect = document.getElementById('form-booking-customer');
      if (custSelect && !custSelect.value) {
        this.onBookingCustomerChange('');
      }
    }
  },

  closeModal: function (modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
  },

  closeAllModals: function () {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
  },

  setupModalListeners: function () {
    const self = this;
    document.querySelectorAll('.modal-close-trigger').forEach(btn => {
      btn.addEventListener('click', function () {
        const modal = this.closest('.modal-backdrop');
        if (modal) modal.classList.remove('active');
      });
    });

    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', function (e) {
        if (e.target === this) {
          this.classList.remove('active');
        }
      });
    });
  },

  // Toast Notification System
  showToast: function (message, type = 'info', title = null) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const titles = {
      success: title || "Success",
      error: title || "Error Encountered",
      warning: title || "Notice",
      info: title || "System Update"
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">
        ${type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'}
      </div>
      <div class="toast-content">
        <div class="toast-title">${titles[type]}</div>
        <div class="toast-msg">${message}</div>
      </div>
      <button class="toast-close-btn" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 250);
    }, 4000);
  },

  updateNotificationCounter: function () {
    const unreadCount = this.data.notifications.filter(n => !n.read).length;
    const badgeEl = document.getElementById('topbar-notif-count');
    if (badgeEl) {
      badgeEl.textContent = unreadCount;
      badgeEl.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
  },

  renderNotificationsDropdown: function () {
    const container = document.getElementById('topbar-notif-list');
    if (!container) return;

    const notifs = this.data.notifications.slice(0, 4);
    container.innerHTML = notifs.map(n => `
      <div class="notification-card ${n.read ? '' : 'unread'}" style="margin-bottom: 6px; cursor: pointer;"
           onclick="GingerApp.navigateTo('notifications'); GingerApp.markNotificationRead('${n.id}')">
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 12px; color: var(--text-primary);">${n.title}</div>
          <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 2px;">${n.message}</div>
          <div style="font-size: 10px; color: var(--text-tertiary); margin-top: 4px;">${n.timestamp}</div>
        </div>
      </div>
    `).join('');
  },

  markNotificationRead: function (notifId) {
    const n = this.data.notifications.find(item => item.id === notifId);
    if (n) {
      n.read = true;
      this.saveState();
    }
    this.updateNotificationCounter();
  },

  // =========================================================================
  // =========================================================================
  // DEDICATED PACKAGES MODULE (FULL CRUD + CARDS VIEW)
  // =========================================================================
  packagesViewMode: 'cards',

  togglePackagesView: function (mode) {
    this.packagesViewMode = mode;
    const cardsBtn = document.getElementById('btn-packages-view-cards');
    const tableBtn = document.getElementById('btn-packages-view-table');
    const cardsContainer = document.getElementById('packages-cards-container');
    const tableContainer = document.getElementById('packages-table-container');

    if (mode === 'cards') {
      if (cardsBtn) cardsBtn.classList.add('active');
      if (tableBtn) tableBtn.classList.remove('active');
      if (cardsContainer) cardsContainer.style.display = 'block';
      if (tableContainer) tableContainer.style.display = 'none';
    } else {
      if (cardsBtn) cardsBtn.classList.remove('active');
      if (tableBtn) tableBtn.classList.add('active');
      if (cardsContainer) cardsContainer.style.display = 'none';
      if (tableContainer) tableContainer.style.display = 'block';
    }
  },

  renderPackagesTable: function () {
    const tbody = document.getElementById('packages-table-body');
    const search = (this.filters.packages.search || '').toLowerCase();
    const typeFilter = this.filters.packages.type;
    const vehicleFilter = this.filters.packages.vehicle;
    const statusFilter = this.filters.packages.status;
    const priceFilter = this.filters.packages.priceRange || 'all';

    const filtered = this.data.packages.filter(p => {
      const matchSearch = !search ||
        p.name.toLowerCase().includes(search) ||
        p.packageType.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search);
      const matchType = typeFilter === 'all' || p.packageType === typeFilter;
      const matchVehicle = vehicleFilter === 'all' || p.vehicleType.toLowerCase().includes(vehicleFilter.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status.toLowerCase() === statusFilter.toLowerCase();

      let matchPrice = true;
      if (priceFilter === 'under-1500') matchPrice = p.packagePrice < 1500;
      else if (priceFilter === '1500-3000') matchPrice = p.packagePrice >= 1500 && p.packagePrice <= 3000;
      else if (priceFilter === '3000-6000') matchPrice = p.packagePrice >= 3000 && p.packagePrice <= 6000;
      else if (priceFilter === 'above-6000') matchPrice = p.packagePrice > 6000;

      return matchSearch && matchType && matchVehicle && matchStatus && matchPrice;
    });

    // Render Package Cards
    this.renderPackagesCards(filtered);

    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10">
            <div class="empty-state-box">
              <div class="empty-state-icon">📦</div>
              <div class="empty-state-title">No packages found</div>
              <div class="empty-state-desc">Try clearing your search terms or filters.</div>
              <button class="btn-secondary btn-sm" onclick="GingerApp.resetPackageFilters()">Reset Filters</button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(p => `
      <tr>
        <td>
          <div class="table-primary-text" style="cursor: pointer; color: var(--primary-500); font-weight: 700;" onclick="GingerApp.openPackageDetails('${p.id}')">
            ★ ${p.name}
          </div>
          <div class="table-secondary-text" style="max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${p.description}
          </div>
        </td>
        <td>
          <span class="mono-tag" style="font-size: 11px;">${p.packageType}</span>
        </td>
        <td><span class="badge" style="background: rgba(255,255,255,0.06);">${p.vehicleType}</span></td>
        <td>
          <span class="badge" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; font-weight: 700;">
            🚿 ${p.totalWashes || 5} Washes
          </span>
        </td>
        <td>
          <span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; font-weight: 600;">
            📅 ${p.validityDuration || (p.validityDays ? p.validityDays + ' Days' : '30 Days')}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 4px; flex-wrap: wrap; max-width: 180px;">
            ${p.includedServices.slice(0, 2).map(s => `<span class="badge badge-confirmed" style="font-size: 10px;">${s}</span>`).join('')}
            ${p.includedServices.length > 2 ? `<span class="badge" style="font-size: 10px; background: var(--bg-surface-elevated);">+${p.includedServices.length - 2} more</span>` : ''}
          </div>
        </td>
        <td><span style="font-family: var(--font-mono);">${p.duration}</span></td>
        <td>
          <div style="display: flex; flex-direction: column;">
            <strong style="font-family: var(--font-mono); color: #34d399; font-size: 13.5px;">${this.data.settings.currency} ${p.packagePrice.toLocaleString()}</strong>
            <span style="font-size: 10.5px; text-decoration: line-through; color: var(--text-tertiary);">Reg: ${this.data.settings.currency} ${p.regularPrice.toLocaleString()}</span>
          </div>
        </td>
        <td>
          <span class="badge ${p.status === 'Active' ? 'badge-paid' : 'badge-unpaid'}">${p.status}</span>
        </td>
        <td>
          <div class="table-actions-cell">
            <button class="table-icon-btn" title="Purchase & Assign to Customer Vehicle" onclick="GingerApp.openPurchasePackageModal('', '', '${p.id}')">💳</button>
            <button class="table-icon-btn" title="View Package Details" onclick="GingerApp.openPackageDetails('${p.id}')">👁</button>
            <button class="table-icon-btn" title="Edit Package" onclick="GingerApp.openEditPackageModal('${p.id}')">✏</button>
            <button class="table-icon-btn" title="Duplicate Package" onclick="GingerApp.duplicatePackage('${p.id}')">📋</button>
            <button class="table-icon-btn" title="Enable / Disable Status" onclick="GingerApp.togglePackageStatus('${p.id}')">⚡</button>
            <button class="table-icon-btn danger-action" title="Delete Package" onclick="GingerApp.deletePackage('${p.id}')">✕</button>
          </div>
        </td>
      </tr>
    `).join('');

    const countLabel = document.getElementById('packages-count-label');
    if (countLabel) countLabel.textContent = `Showing ${filtered.length} of ${this.data.packages.length} packages`;
  },

  // Display Package Cards with Number of Washes, Validity Period, and Price (Requirement)
  renderPackagesCards: function (packagesList) {
    const grid = document.getElementById('packages-cards-grid');
    if (!grid) return;

    if (!packagesList || packagesList.length === 0) {
      grid.innerHTML = `
        <div class="empty-state-box" style="grid-column: 1 / -1; padding: 40px;">
          <div class="empty-state-icon">📦</div>
          <div class="empty-state-title">No packages match your search criteria</div>
          <div class="empty-state-desc">Try clearing your filters or search keywords.</div>
          <button class="btn-secondary btn-sm" onclick="GingerApp.resetPackageFilters()">Reset Filters</button>
        </div>
      `;
      return;
    }

    const curr = this.data.settings.currency || '₹';

    grid.innerHTML = packagesList.map(p => {
      const isDiscounted = (p.discount && p.discount > 0) || (p.regularPrice > p.packagePrice);
      const discountPct = p.discountPercent || (p.regularPrice > 0 ? Math.round(((p.regularPrice - p.packagePrice) / p.regularPrice) * 100) : 0);
      const validityDisplay = p.validityDuration || (p.validityDays ? `${p.validityDays} Days` : '30 Days');
      const washesDisplay = p.totalWashes || 5;

      return `
        <div class="package-card ${p.status !== 'Active' ? 'inactive' : ''}">
          <div>
            <div class="package-card-header">
              <div>
                <span class="mono-tag" style="font-size: 11px; margin-bottom: 6px; display: inline-block;">${p.packageType}</span>
                <div class="package-card-title">${p.name}</div>
              </div>
              <span class="badge ${p.status === 'Active' ? 'badge-paid' : 'badge-unpaid'}" style="font-size: 11px;">
                ${p.status}
              </span>
            </div>

            <div class="package-card-desc">
              ${p.description || "Comprehensive detailing package tailored for optimum vehicle hygiene and paint preservation."}
            </div>

            <!-- Price with Regular Price and Savings -->
            <div class="package-card-price-section">
              <span class="package-card-price">${curr} ${p.packagePrice.toLocaleString()}</span>
              ${isDiscounted ? `
                <span class="package-card-reg-price">${curr} ${p.regularPrice.toLocaleString()}</span>
                <span class="package-savings-badge">${discountPct}% OFF</span>
              ` : ''}
            </div>

            <!-- Prominent Package Metrics: Washes, Validity Period & Vehicle Type -->
            <div class="package-card-badges-row">
              <div class="package-card-metric-box">
                <span class="package-card-metric-label">Included Washes</span>
                <span class="package-card-metric-val highlight-washes">🚿 ${washesDisplay} Washes</span>
              </div>
              <div class="package-card-metric-box">
                <span class="package-card-metric-label">Validity Period</span>
                <span class="package-card-metric-val highlight-validity">📅 ${validityDisplay}</span>
              </div>
              <div class="package-card-metric-box">
                <span class="package-card-metric-label">Vehicle Type</span>
                <span class="package-card-metric-val" style="font-size: 11.5px;">🚗 ${p.vehicleType}</span>
              </div>
            </div>

            <!-- Included Services -->
            <div style="margin-top: 12px;">
              <div style="font-size: 11px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; margin-bottom: 6px;">
                Included Services:
              </div>
              <ul class="package-card-services-list">
                ${(p.includedServices || []).slice(0, 3).map(s => `
                  <li class="package-card-service-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>${s}</span>
                  </li>
                `).join('')}
                ${(p.includedServices || []).length > 3 ? `
                  <li style="font-size: 11px; color: var(--text-tertiary); margin-left: 21px;">
                    + ${(p.includedServices || []).length - 3} more detailing treatments
                  </li>
                ` : ''}
              </ul>
            </div>
          </div>

          <!-- Card Footer Actions -->
          <div class="package-card-footer">
            <button type="button" class="btn-secondary btn-sm" onclick="GingerApp.openPurchasePackageModal('', '', '${p.id}')" style="border-color: #3b82f6; color: #60a5fa; font-weight: 700;">
              + Purchase / Assign
            </button>
            <div style="display: flex; gap: 4px;">
              <button class="table-icon-btn" title="View Full Package Details" onclick="GingerApp.openPackageDetails('${p.id}')">👁</button>
              <button class="table-icon-btn" title="Edit Package" onclick="GingerApp.openEditPackageModal('${p.id}')">✏</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  resetPackageFilters: function () {
    this.filters.packages = { search: '', type: 'all', vehicle: 'all', status: 'all', priceRange: 'all' };
    const sInput = document.getElementById('filter-packages-search');
    if (sInput) sInput.value = '';
    const tSel = document.getElementById('filter-packages-type');
    if (tSel) tSel.value = 'all';
    const vSel = document.getElementById('filter-packages-vehicle');
    if (vSel) vSel.value = 'all';
    const stSel = document.getElementById('filter-packages-status');
    if (stSel) stSel.value = 'all';
    const pSel = document.getElementById('filter-packages-price');
    if (pSel) pSel.value = 'all';
    this.renderPackagesTable();
  },

  openCreatePackageModal: function () {
    document.getElementById('form-package-title').textContent = "Create Car Wash Package";
    document.getElementById('pkg-id-hidden').value = "";
    document.getElementById('pkg-name-input').value = "";
    document.getElementById('pkg-type-select').value = "Premium Wash";
    document.getElementById('pkg-vehicle-type').value = "All Types";
    document.getElementById('pkg-desc-input').value = "";
    document.getElementById('pkg-duration-input').value = "60 mins";
    document.getElementById('pkg-washes-input').value = "5";
    document.getElementById('pkg-validity-value').value = "90";
    document.getElementById('pkg-validity-unit').value = "Days";
    document.getElementById('pkg-reg-price-input').value = "2500";
    document.getElementById('pkg-offer-type-select').value = "none";
    document.getElementById('pkg-discount-pct-input').value = "10";
    document.getElementById('pkg-offer-price-input').value = "2250";
    document.getElementById('pkg-status-select').value = "Active";

    this.renderPackageServicesCheckboxes([]);
    this.onPackagePricingChange();
    this.openModal('package-form-modal');
  },

  openEditPackageModal: function (pkgId) {
    const p = this.data.packages.find(item => item.id === pkgId);
    if (!p) return;

    this.closeModal('package-details-modal');

    document.getElementById('form-package-title').textContent = `Edit Package: ${p.name}`;
    document.getElementById('pkg-id-hidden').value = p.id;
    document.getElementById('pkg-name-input').value = p.name;
    document.getElementById('pkg-type-select').value = p.packageType;
    document.getElementById('pkg-vehicle-type').value = p.vehicleType;
    document.getElementById('pkg-desc-input').value = p.description;
    document.getElementById('pkg-duration-input').value = p.duration;

    // Number of Washes & Validity Duration
    document.getElementById('pkg-washes-input').value = p.totalWashes || 5;

    let valVal = p.validityDays || 90;
    let valUnit = "Days";
    if (p.validityDuration) {
      const parts = p.validityDuration.split(' ');
      if (parts.length >= 2) {
        valVal = parseInt(parts[0]) || valVal;
        valUnit = parts[1];
      }
    }
    document.getElementById('pkg-validity-value').value = valVal;
    document.getElementById('pkg-validity-unit').value = valUnit;

    document.getElementById('pkg-reg-price-input').value = p.regularPrice || p.packagePrice || 0;
    document.getElementById('pkg-offer-type-select').value = p.offerType || "none";
    document.getElementById('pkg-discount-pct-input').value = p.discountPercent || 0;
    document.getElementById('pkg-offer-price-input').value = p.offerPrice || p.finalPrice || p.packagePrice || 0;
    document.getElementById('pkg-status-select').value = p.status;

    this.renderPackageServicesCheckboxes(p.includedServices || []);
    this.onPackagePricingChange();
    this.openModal('package-form-modal');
  },

  renderPackageServicesCheckboxes: function (selectedServices) {
    const container = document.getElementById('pkg-services-checklist');
    if (!container) return;

    container.innerHTML = this.data.services.map(s => {
      const isChecked = selectedServices.includes(s.name);
      return `
        <label style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); cursor: pointer; font-size: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" class="pkg-service-check" value="${s.name}" data-price="${s.finalPrice || s.price}" ${isChecked ? 'checked' : ''} onchange="GingerApp.onPackagePricingChange()">
            <span style="font-weight: 500; color: var(--text-primary);">${s.name}</span>
          </div>
          <span style="font-family: var(--font-mono); color: var(--text-tertiary);">${this.data.settings.currency} ${(s.finalPrice || s.price).toLocaleString()}</span>
        </label>
      `;
    }).join('');
  },

  onPackagePricingChange: function () {
    const regInput = document.getElementById('pkg-reg-price-input');
    const typeSelect = document.getElementById('pkg-offer-type-select');
    const pctGroup = document.getElementById('pkg-discount-pct-group');
    const pctInput = document.getElementById('pkg-discount-pct-input');
    const offerGroup = document.getElementById('pkg-offer-price-group');
    const offerInput = document.getElementById('pkg-offer-price-input');
    const summaryEl = document.getElementById('pkg-calc-summary');

    if (!regInput || !typeSelect) return;

    const regPrice = parseFloat(regInput.value) || 0;
    const offerType = typeSelect.value;
    let discountPercent = parseFloat(pctInput?.value) || 0;
    let offerPrice = parseFloat(offerInput?.value) || regPrice;
    let finalPrice = regPrice;
    let discountAmount = 0;

    if (offerType === 'none') {
      if (pctGroup) pctGroup.style.display = 'none';
      if (offerGroup) offerGroup.style.display = 'none';
      finalPrice = regPrice;
      discountPercent = 0;
      discountAmount = 0;
    } else if (offerType === 'percentage') {
      if (pctGroup) pctGroup.style.display = 'block';
      if (offerGroup) offerGroup.style.display = 'none';
      discountPercent = Math.min(100, Math.max(0, discountPercent));
      discountAmount = Math.round(regPrice * (discountPercent / 100));
      finalPrice = Math.max(0, regPrice - discountAmount);
      if (offerInput) offerInput.value = finalPrice;
    } else if (offerType === 'fixed') {
      if (pctGroup) pctGroup.style.display = 'none';
      if (offerGroup) offerGroup.style.display = 'block';
      finalPrice = offerPrice;
      discountAmount = Math.max(0, regPrice - offerPrice);
      discountPercent = regPrice > 0 ? Math.round((discountAmount / regPrice) * 100) : 0;
      if (pctInput) pctInput.value = discountPercent;
    }

    const curr = this.data.settings.currency || '₹';
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
          <span>Regular Value:</span> <strong>${curr} ${regPrice.toLocaleString()}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px; color: #10b981;">
          <span>Offer Savings:</span> <strong>${discountAmount > 0 ? `- ${curr} ${discountAmount.toLocaleString()} (${discountPercent}% OFF)` : 'No Discount'}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 4px; font-size: 14px; font-weight: 700; color: #38bdf8;">
          <span>Final Client Price:</span> <strong>${curr} ${finalPrice.toLocaleString()}</strong>
        </div>
      `;
    }
  },

  savePackage: function (e, andContinue = false) {
    if (e) e.preventDefault();

    const name = document.getElementById('pkg-name-input').value.trim();
    if (!name) {
      this.showToast("Package Name is required.", "error");
      return;
    }

    const selectedServices = [];
    document.querySelectorAll('.pkg-service-check:checked').forEach(cb => {
      selectedServices.push(cb.value);
    });

    if (selectedServices.length === 0) {
      this.showToast("Please select at least one included service for this package.", "error");
      return;
    }

    const id = document.getElementById('pkg-id-hidden').value;
    const pkgType = document.getElementById('pkg-type-select').value;
    const vehicleType = document.getElementById('pkg-vehicle-type').value;
    const desc = document.getElementById('pkg-desc-input').value.trim();
    const duration = document.getElementById('pkg-duration-input').value.trim() || "60 mins";
    const totalWashes = parseInt(document.getElementById('pkg-washes-input').value) || 5;
    const valVal = parseInt(document.getElementById('pkg-validity-value').value) || 90;
    const valUnit = document.getElementById('pkg-validity-unit').value || "Days";
    const validityDuration = `${valVal} ${valUnit}`;
    const validityDays = valUnit === 'Months' ? valVal * 30 : (valUnit === 'Years' ? valVal * 365 : valVal);

    const regPrice = parseFloat(document.getElementById('pkg-reg-price-input').value) || 0;
    const offerType = document.getElementById('pkg-offer-type-select').value;
    const discountPercent = parseFloat(document.getElementById('pkg-discount-pct-input').value) || 0;
    let offerPrice = parseFloat(document.getElementById('pkg-offer-price-input').value) || regPrice;
    const status = document.getElementById('pkg-status-select').value;

    let finalPrice = regPrice;
    let discount = 0;
    if (offerType === 'percentage') {
      discount = Math.round(regPrice * (discountPercent / 100));
      finalPrice = Math.max(0, regPrice - discount);
      offerPrice = finalPrice;
    } else if (offerType === 'fixed') {
      finalPrice = offerPrice;
      discount = Math.max(0, regPrice - offerPrice);
    }

    if (id) {
      // Edit existing
      const existing = this.data.packages.find(p => p.id === id);
      if (existing) {
        existing.name = name;
        existing.packageType = pkgType;
        existing.vehicleType = vehicleType;
        existing.description = desc;
        existing.duration = duration;
        existing.totalWashes = totalWashes;
        existing.validityDays = validityDays;
        existing.validityDuration = validityDuration;
        existing.includedServices = selectedServices;
        existing.regularPrice = regPrice;
        existing.offerType = offerType;
        existing.discountPercent = discountPercent;
        existing.offerPrice = offerPrice;
        existing.finalPrice = finalPrice;
        existing.packagePrice = finalPrice;
        existing.discount = discount;
        existing.status = status;
      }
      this.showToast(`Package ${name} updated successfully!`, 'success');
    } else {
      // Create new
      const newId = `PKG-0${this.data.packages.length + 1}`;
      const newPkg = {
        id: newId,
        name: name,
        packageType: pkgType,
        vehicleType: vehicleType,
        description: desc,
        includedServices: selectedServices,
        duration: duration,
        totalWashes: totalWashes,
        validityDays: validityDays,
        validityDuration: validityDuration,
        regularPrice: regPrice,
        offerType: offerType,
        discountPercent: discountPercent,
        offerPrice: offerPrice,
        finalPrice: finalPrice,
        packagePrice: finalPrice,
        discount: discount,
        status: status,
        createdAt: new Date().toISOString().split('T')[0]
      };
      this.data.packages.unshift(newPkg);
      this.showToast(`Package ${name} created successfully!`, 'success');
    }

    this.saveState();
    this.renderPackagesTable();
    this.populateBookingCustomerDropdown();

    if (andContinue) {
      this.openCreatePackageModal();
    } else {
      this.closeModal('package-form-modal');
    }
  },

  duplicatePackage: function (pkgId) {
    const orig = this.data.packages.find(p => p.id === pkgId);
    if (!orig) return;

    const copy = JSON.parse(JSON.stringify(orig));
    copy.id = `PKG-0${this.data.packages.length + 1}`;
    copy.name = `${orig.name} (Copy)`;
    copy.createdAt = new Date().toISOString().split('T')[0];
    this.data.packages.unshift(copy);
    this.saveState();
    this.showToast(`Duplicated package as ${copy.name}!`, 'success');
    this.renderPackagesTable();
    this.populateBookingCustomerDropdown();
  },

  togglePackageStatus: function (pkgId) {
    const p = this.data.packages.find(item => item.id === pkgId);
    if (!p) return;

    p.status = p.status === 'Active' ? 'Inactive' : 'Active';
    this.saveState();
    this.showToast(`Package ${p.name} is now ${p.status}`, 'info');
    this.renderPackagesTable();
  },

  deletePackage: function (pkgId) {
    const p = this.data.packages.find(item => item.id === pkgId);
    if (!p) return;

    this.confirmAction({
      title: "Delete Package",
      message: `Are you sure you want to permanently delete the package "${p.name}"? This action cannot be undone.`,
      confirmText: "Delete Package",
      isDanger: true,
      onConfirm: () => {
        this.data.packages = this.data.packages.filter(item => item.id !== pkgId);
        this.saveState();
        this.showToast(`Package ${p.name} deleted`, 'warning');
        this.renderPackagesTable();
        this.populateBookingCustomerDropdown();
      }
    });
  },

  openPackageDetails: function (pkgId) {
    const p = this.data.packages.find(item => item.id === pkgId);
    if (!p) return;

    const curr = this.data.settings.currency;
    document.getElementById('pd-title').textContent = p.name;
    document.getElementById('pd-type-badge').textContent = p.packageType;
    document.getElementById('pd-status-badge').innerHTML = `<span class="badge ${p.status === 'Active' ? 'badge-paid' : 'badge-unpaid'}">${p.status}</span>`;
    document.getElementById('pd-desc').textContent = p.description || "Comprehensive service bundle.";
    document.getElementById('pd-vehicle-type').textContent = p.vehicleType;
    document.getElementById('pd-duration').textContent = p.duration;

    const washesEl = document.getElementById('pd-washes');
    if (washesEl) washesEl.textContent = `🚿 ${p.totalWashes || 5} Washes`;

    const validityEl = document.getElementById('pd-validity');
    if (validityEl) validityEl.textContent = `📅 ${p.validityDuration || (p.validityDays ? p.validityDays + ' Days' : '30 Days')}`;

    document.getElementById('pd-reg-price').textContent = `${curr} ${p.regularPrice.toLocaleString()}`;
    document.getElementById('pd-pkg-price').textContent = `${curr} ${p.packagePrice.toLocaleString()}`;
    document.getElementById('pd-savings').textContent = `${curr} ${p.discount.toLocaleString()}`;
    document.getElementById('pd-final-price').textContent = `${curr} ${p.finalPrice.toLocaleString()}`;

    const incList = document.getElementById('pd-included-services');
    if (incList) {
      incList.innerHTML = p.includedServices.map(s => `
        <li style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="color: #10b981; font-weight: 700;">✓</span>
          <span style="color: var(--text-primary); font-weight: 500;">${s}</span>
        </li>
      `).join('');
    }

    // Set actions
    document.getElementById('pd-btn-edit').onclick = () => this.openEditPackageModal(p.id);
    document.getElementById('pd-btn-duplicate').onclick = () => { this.closeModal('package-details-modal'); this.duplicatePackage(p.id); };
    document.getElementById('pd-btn-toggle').onclick = () => { this.togglePackageStatus(p.id); this.openPackageDetails(p.id); };
    const purchaseBtn = document.getElementById('pd-btn-purchase');
    if (purchaseBtn) {
      purchaseBtn.onclick = () => {
        this.closeModal('package-details-modal');
        this.openPurchasePackageModal('', '', p.id);
      };
    }
    document.getElementById('pd-btn-delete').onclick = () => { this.closeModal('package-details-modal'); this.deletePackage(p.id); };
    document.getElementById('pd-btn-book').onclick = () => {
      this.closeModal('package-details-modal');
      this.openBookingWithPackage(p.id);
    };

    this.openModal('package-details-modal');
  },

  openBookingWithPackage: function (pkgId) {
    this.openModal('add-booking-modal');
    const radioPkg = document.getElementById('booking-mode-package');
    if (radioPkg) {
      radioPkg.checked = true;
      this.toggleBookingItemType('package');
    }
    const pkgSelect = document.getElementById('form-booking-package-select');
    if (pkgSelect) {
      pkgSelect.value = pkgId;
      pkgSelect.dispatchEvent(new Event('change'));
    }
  },

  // =========================================================================
  // DASHBOARD MODULE RENDERER
  // =========================================================================
  renderDashboard: function () {
    const bookings = this.data.bookings;
    const totalBookings = bookings.length;
    const todayBookings = bookings.filter(b => b.date === '2026-09-28').length;
    const completedServices = bookings.filter(b => b.bookingStatus === 'Completed').length;
    const pendingServices = bookings.filter(b => b.bookingStatus !== 'Completed' && b.bookingStatus !== 'Cancelled').length;
    const totalRevenue = this.data.invoices.filter(i => i.paymentStatus === 'Paid').reduce((acc, i) => acc + i.totalAmount, 0);
    const pendingPayments = this.data.invoices.filter(i => i.paymentStatus === 'Pending').reduce((acc, i) => acc + i.totalAmount, 0);
    const lowStockCount = this.data.inventory.filter(i => i.currentStock <= i.minStock).length;

    const elTotalBookings = document.getElementById('kpi-total-bookings');
    if (elTotalBookings) elTotalBookings.textContent = totalBookings;
    const elTodayBookings = document.getElementById('kpi-today-bookings');
    if (elTodayBookings) elTodayBookings.textContent = todayBookings;
    const elCompletedServices = document.getElementById('kpi-completed-services');
    if (elCompletedServices) elCompletedServices.textContent = completedServices;
    const elPendingServices = document.getElementById('kpi-pending-services');
    if (elPendingServices) elPendingServices.textContent = pendingServices;
    const elTotalCustomers = document.getElementById('kpi-total-customers');
    if (elTotalCustomers) elTotalCustomers.textContent = this.data.customers.length;
    const elTotalRevenue = document.getElementById('kpi-total-revenue');
    if (elTotalRevenue) elTotalRevenue.textContent = `${this.data.settings.currency} ${totalRevenue.toLocaleString()}`;
    const elPendingPayments = document.getElementById('kpi-pending-payments');
    if (elPendingPayments) elPendingPayments.textContent = `${this.data.settings.currency} ${pendingPayments.toLocaleString()}`;
    const elLowStock = document.getElementById('kpi-low-stock');
    if (elLowStock) elLowStock.textContent = lowStockCount;

    this.renderStatusSummaryGrid();

    try {
      if (window.ReportsEngine && typeof window.ReportsEngine.renderDashboardCharts === 'function') {
        window.ReportsEngine.renderDashboardCharts();
      }
    } catch (e) {
      console.warn("Chart render error:", e);
    }

    this.renderTodayAppointmentsTable();
    this.renderDashboardLowStock();
  },

  renderStatusSummaryGrid: function () {
    const container = document.getElementById('dashboard-status-summary-grid');
    if (!container) return;

    const stages = [
      { status: "Confirmed", icon: "📅", color: "#38bdf8", badgeClass: "badge-confirmed" },
      { status: "Checked In", icon: "📥", color: "#818cf8", badgeClass: "badge-checked-in" },
      { status: "In Service", icon: "⚡", color: "#f59e0b", badgeClass: "badge-in-service" },
      { status: "Quality Check", icon: "🔍", color: "#a855f7", badgeClass: "badge-quality-check" },
      { status: "Ready for Pickup", icon: "🚗", color: "#10b981", badgeClass: "badge-ready" },
      { status: "Completed", icon: "✅", color: "#059669", badgeClass: "badge-completed" },
      { status: "Cancelled", icon: "✕", color: "#ef4444", badgeClass: "badge-unpaid" }
    ];

    const bookings = this.data.bookings;
    container.innerHTML = stages.map(s => {
      const count = bookings.filter(b => (b.bookingStatus || '').toLowerCase() === s.status.toLowerCase()).length;
      return `
        <div class="bay-slot" style="cursor: pointer; padding: 12px 14px; display: flex; flex-direction: column; justify-content: space-between; border-left: 3px solid ${s.color};"
             onclick="GingerApp.filterBookingsByStatus('${s.status}')" title="Filter bookings by ${s.status}">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 16px;">${s.icon}</span>
            <span class="badge ${s.badgeClass}" style="font-size: 11px; padding: 2px 7px;">${count}</span>
          </div>
          <div style="margin-top: 8px;">
            <div style="font-size: 10.5px; color: var(--text-tertiary); text-transform: uppercase; font-weight: 600;">Status</div>
            <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-top: 1px;">${s.status}</div>
          </div>
        </div>
      `;
    }).join('');
  },

  filterBookingsByStatus: function (status) {
    this.filters.bookings.status = status;
    const sel = document.getElementById('filter-bookings-status');
    if (sel) sel.value = status;
    this.navigateTo('bookings');
  },

  renderTodayAppointmentsTable: function () {
    const tbody = document.getElementById('dashboard-today-table-body');
    if (!tbody) return;

    const bookings = this.data.bookings.slice(0, 5);
    tbody.innerHTML = bookings.map(b => `
      <tr>
        <td><span class="mono-tag" style="color: #60a5fa; cursor: pointer;" onclick="WorkflowEngine.openBookingDetails('${b.id}')">${b.id}</span></td>
        <td>
          <div class="table-primary-text">${b.customerName}</div>
          <div class="table-secondary-text">${b.customerPhone}</div>
        </td>
        <td>
          <div class="table-primary-text">${b.vehiclePlate}</div>
          <div class="table-secondary-text">${b.vehicleModel}</div>
        </td>
        <td>
          <div class="table-primary-text">${b.serviceName}</div>
          <div class="table-secondary-text">${b.bookingType === 'Package' ? '★ Package Bundle' : 'Single Service'}</div>
        </td>
        <td>
          <div class="table-primary-text">${b.assignedStaff}</div>
        </td>
        <td>
          <span style="font-family: var(--font-mono); font-weight: 600;">${b.time}</span>
        </td>
        <td>
          <span class="badge ${WorkflowEngine.getBadgeClass(b.bookingStatus)}">${b.bookingStatus}</span>
        </td>
        <td>
          <span class="badge ${b.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-unpaid'}">${b.paymentStatus}</span>
        </td>
        <td>
          <div class="table-actions-cell" style="display: flex; align-items: center; gap: 4px;">
            <button class="btn-action btn-sm" title="View Booking Details & Timeline" onclick="WorkflowEngine.openBookingDetails('${b.id}')">👁 View</button>
            <button class="btn-action btn-action-status btn-sm" title="Update Status" onclick="GingerApp.openUpdateStatusModal('${b.id}')">🔄 Status</button>
            <button class="btn-action btn-sm" title="View / Print Invoice" onclick="InvoiceEngine.renderModal('${b.id.replace('BK-2026-00', 'INV-2026-00')}')">📄 Invoice</button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  renderDashboardLowStock: function () {
    const tbody = document.getElementById('dashboard-low-stock-body');
    if (!tbody) return;

    const lowItems = this.data.inventory.filter(i => i.currentStock <= i.minStock);
    if (lowItems.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-tertiary);">All inventory items are currently above safety thresholds.</td></tr>`;
      return;
    }

    tbody.innerHTML = lowItems.map(item => `
      <tr>
        <td class="table-primary-text">${item.name}</td>
        <td><span class="mono-tag" style="color: #f87171;">${item.currentStock} ${item.unit}</span></td>
        <td><span class="mono-tag">${item.minStock} ${item.unit}</span></td>
        <td>${item.supplier}</td>
        <td><span class="badge badge-unpaid">${item.status}</span></td>
        <td>
          <button class="btn-primary btn-sm" onclick="GingerApp.openStockModal('${item.id}', 'in')">
            + Stock In
          </button>
        </td>
      </tr>
    `).join('');
  },

  renderDashboardCharts: function (bookingContainerId = 'chart-bookings-overview-svg', revenueContainerId = 'chart-revenue-overview-svg') {
    if (window.ReportsEngine && typeof window.ReportsEngine.renderDashboardCharts === 'function') {
      window.ReportsEngine.renderDashboardCharts(bookingContainerId, revenueContainerId);
    }
  },

  // =========================================================================
  // BOOKINGS MODULE & INTEGRATED PACKAGES
  // =========================================================================
  renderBookingsTable: function () {
    const tbody = document.getElementById('bookings-table-body');
    if (!tbody) return;

    const search = (this.filters.bookings.search || '').toLowerCase();
    const statusFilter = this.filters.bookings.status;
    const paymentFilter = this.filters.bookings.payment;

    const filtered = this.data.bookings.filter(b => {
      const matchSearch = !search ||
        b.id.toLowerCase().includes(search) ||
        b.customerName.toLowerCase().includes(search) ||
        b.vehiclePlate.toLowerCase().includes(search) ||
        b.serviceName.toLowerCase().includes(search);

      const matchStatus = statusFilter === 'all' || b.bookingStatus.toLowerCase() === statusFilter.toLowerCase();
      const matchPayment = paymentFilter === 'all' || b.paymentStatus.toLowerCase() === paymentFilter.toLowerCase();

      return matchSearch && matchStatus && matchPayment;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="12">
            <div class="empty-state-box">
              <div class="empty-state-icon">🔍</div>
              <div class="empty-state-title">No bookings match the selected criteria</div>
              <div class="empty-state-desc">Try adjusting your search terms or clearing status filters.</div>
              <button class="btn-secondary btn-sm" onclick="GingerApp.resetBookingFilters()">Reset Filters</button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(b => `
      <tr>
        <td>
          <span class="mono-tag" style="color: #60a5fa; cursor: pointer;" onclick="WorkflowEngine.openBookingDetails('${b.id}')">${b.id}</span>
        </td>
        <td>${b.date}</td>
        <td><span style="font-family: var(--font-mono);">${b.time}</span></td>
        <td>
          <div class="table-primary-text" style="cursor: pointer;" onclick="GingerApp.openCustomerDetails('${b.customerId}')">${b.customerName}</div>
          <div class="table-secondary-text">${b.customerPhone}</div>
        </td>
        <td>
          <div class="table-primary-text" style="cursor: pointer;" onclick="GingerApp.openVehicleDetails('${b.vehiclePlate}')">${b.vehicleModel}</div>
          <div class="table-secondary-text">${b.vehicleType}</div>
        </td>
        <td><span class="mono-tag" style="cursor: pointer;" onclick="GingerApp.openVehicleDetails('${b.vehiclePlate}')">${b.vehiclePlate}</span></td>
        <td>
          <div class="table-primary-text">
            ${b.bookingType === 'Package' ? '★ ' : ''}${b.serviceName}
          </div>
          <div class="table-secondary-text">
            ${b.bookingType === 'Package' ? 'Package Bundle' : 'Single Service'}
            ${b.addons && b.addons.length > 0 ? ` • +${b.addons.length} add-ons` : ''}
          </div>
        </td>
        <td>${b.assignedStaff}</td>
        <td>
          <strong style="font-family: var(--font-mono);">${this.data.settings.currency} ${Number(b.totalAmount).toLocaleString()}</strong>
        </td>
        <td><span class="badge ${b.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-unpaid'}">${b.paymentStatus}</span></td>
        <td><span class="badge ${WorkflowEngine.getBadgeClass(b.bookingStatus)}">${b.bookingStatus}</span></td>
        <td>
          <div class="table-actions-cell" style="display: flex; align-items: center; gap: 4px;">
            <button class="btn-action btn-sm" title="View Booking Details & Timeline" onclick="WorkflowEngine.openBookingDetails('${b.id}')">
              👁 View
            </button>
            <button class="btn-action btn-action-status btn-sm" title="Update Status" onclick="GingerApp.openUpdateStatusModal('${b.id}')">
              🔄 Status
            </button>
            <div class="actions-dropdown-wrap" id="b-act-${b.id}">
              <button type="button" class="actions-dropdown-btn" onclick="GingerApp.toggleActionMenu('b-act-${b.id}', event)">
                Actions ▼
              </button>
              <div class="actions-dropdown-menu">
                <button class="actions-dropdown-item" onclick="WorkflowEngine.openBookingDetails('${b.id}')">
                  👁 View Details & Timeline
                </button>
                <button class="actions-dropdown-item" onclick="GingerApp.openUpdateStatusModal('${b.id}')">
                  🔄 Update Status
                </button>
                <button class="actions-dropdown-item" onclick="GingerApp.openEditBookingModal('${b.id}')">
                  ✏ Edit Booking
                </button>
                <button class="actions-dropdown-item" onclick="GingerApp.openPaymentModalForBooking('${b.id}')">
                  💳 Record Payment
                </button>
                <button class="actions-dropdown-item" onclick="InvoiceEngine.renderModal('${b.id.replace('BK-2026-00', 'INV-2026-00')}')">
                  📄 Print Invoice
                </button>
                <div class="actions-dropdown-divider"></div>
                <button class="actions-dropdown-item danger-item" onclick="GingerApp.confirmCancelBooking('${b.id}')">
                  ❌ Cancel Booking
                </button>
              </div>
            </div>
          </div>
        </td>
      </tr>
    `).join('');

    const footerCount = document.getElementById('bookings-count-label');
    if (footerCount) {
      footerCount.textContent = `Showing ${filtered.length} of ${this.data.bookings.length} bookings`;
    }
  },

  resetBookingFilters: function () {
    this.filters.bookings = { search: '', status: 'all', payment: 'all' };
    const searchInput = document.getElementById('filter-bookings-search');
    if (searchInput) searchInput.value = '';
    const statusSelect = document.getElementById('filter-bookings-status');
    if (statusSelect) statusSelect.value = 'all';
    const paySelect = document.getElementById('filter-bookings-payment');
    if (paySelect) paySelect.value = 'all';
    this.renderBookingsTable();
  },

  confirmCancelBooking: function (bookingId) {
    this.confirmAction({
      title: "Cancel Service Booking",
      message: `Are you sure you want to cancel booking ${bookingId}? The booking will be marked Cancelled and slot released.`,
      confirmText: "Cancel Booking",
      isDanger: true,
      onConfirm: () => {
        const b = this.data.bookings.find(item => item.id === bookingId);
        if (b) {
          b.bookingStatus = 'Cancelled';
          b.currentStageIndex = -1;
          if (!b.timeline) b.timeline = [];
          b.timeline.push({
            stage: "Cancelled",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actor: this.data.currentUser.name,
            note: "Booking cancelled by staff."
          });
          this.saveState();
          this.showToast(`Booking ${bookingId} cancelled`, 'warning');
          this.renderBookingsTable();
          this.renderDashboard();
        }
      }
    });
  },

  openPaymentModalForBooking: function (bookingId) {
    const inv = this.data.invoices.find(i => i.bookingId === bookingId) ||
      this.data.invoices.find(i => i.invoiceNumber === bookingId.replace('BK-2026-00', 'INV-2026-00'));
    if (inv) {
      InvoiceEngine.openPaymentModal(inv.invoiceNumber);
    } else {
      const b = this.data.bookings.find(item => item.id === bookingId);
      if (b) {
        const newInv = InvoiceEngine.createFromBooking(b);
        InvoiceEngine.openPaymentModal(newInv.invoiceNumber);
      }
    }
  },

  bookingSelectedVehicles: [],
  bookingVehicleConfigs: {},

  // Booking Form Setup
  setupBookingFormCalculation: function () {
    const custSelect = document.getElementById('form-booking-customer');
    const discountInput = document.getElementById('form-booking-discount');
    const dateInput = document.getElementById('form-booking-date');
    const timeInput = document.getElementById('form-booking-time');
    const staffSelect = document.getElementById('form-booking-staff');

    if (custSelect) {
      custSelect.addEventListener('change', () => {
        this.onBookingCustomerChange(custSelect.value);
      });
    }

    if (discountInput) discountInput.addEventListener('input', () => this.recalculateBookingForm());
    if (dateInput) dateInput.addEventListener('change', () => this.recalculateBookingForm());
    if (timeInput) timeInput.addEventListener('change', () => this.recalculateBookingForm());
    if (staffSelect) staffSelect.addEventListener('change', () => this.recalculateBookingForm());

    const form = document.getElementById('form-create-booking');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitNewBooking();
      });
    }
  },

  populateBookingCustomerDropdown: function () {
    const custSelect = document.getElementById('form-booking-customer');
    if (!custSelect) return;

    custSelect.innerHTML = `<option value="">Select Existing Customer...</option>` +
      this.data.customers.map(c => `
        <option value="${c.id}">${c.name} (${c.phone})</option>
      `).join('');
  },

  // Customer vehicles with multi-selection checkboxes (Requirement 2)
  onBookingCustomerChange: function (custId) {
    const listContainer = document.getElementById('booking-vehicles-selection-list');
    if (!listContainer) return;

    this.bookingSelectedVehicles = [];
    this.bookingVehicleConfigs = {};

    if (!custId) {
      listContainer.innerHTML = `<div style="font-size: 12.5px; color: var(--text-tertiary); padding: 8px;">Please select a customer above to view their fleet.</div>`;
      this.renderBookingVehicleServicesConfig();
      this.recalculateBookingForm();
      return;
    }

    const cust = this.data.customers.find(c => c.id === custId);
    if (!cust) {
      listContainer.innerHTML = `<div style="font-size: 12.5px; color: var(--text-tertiary); padding: 8px;">Customer not found.</div>`;
      this.renderBookingVehicleServicesConfig();
      this.recalculateBookingForm();
      return;
    }

    // Filter vehicles belonging to this customer
    const customerVehicles = this.data.vehicles.filter(v =>
      v.customerId === custId || (cust.vehicles && cust.vehicles.includes(v.plateNumber))
    );

    if (customerVehicles.length === 0) {
      listContainer.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 12px; background: rgba(245, 158, 11, 0.08); border-radius: var(--radius-md); border: 1px dashed var(--warning); display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12.5px; color: var(--warning); font-weight: 500;">No registered vehicles for ${cust.name}.</span>
          <button type="button" class="btn-action btn-sm" onclick="GingerApp.openAddVehicleFromBooking()">+ Register Vehicle Now</button>
        </div>
      `;
    } else {
      // By default, select the first vehicle so staff immediately sees service options
      const firstPlate = customerVehicles[0].plateNumber;
      this.bookingSelectedVehicles = [firstPlate];
      const defaultKey = (this.data.packages && this.data.packages.length > 0)
        ? `pkg:${this.data.packages[0].id}`
        : `srv:${this.data.services[0].id}`;
      this.bookingVehicleConfigs[firstPlate] = {
        serviceKey: defaultKey,
        addons: []
      };

      listContainer.innerHTML = customerVehicles.map(v => {
        const isChecked = this.bookingSelectedVehicles.includes(v.plateNumber);
        const safePlateId = v.plateNumber.replace(/\s+/g, '-');
        return `
          <div class="booking-vehicle-select-card ${isChecked ? 'selected' : ''}" id="veh-card-${safePlateId}" onclick="GingerApp.toggleVehicleFromCard('${v.plateNumber}', event)">
            <input type="checkbox" class="booking-veh-checkbox" id="veh-chk-${safePlateId}" value="${v.plateNumber}" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation()" onchange="GingerApp.onBookingVehicleToggle('${v.plateNumber}', this.checked)">
            <div style="flex: 1; min-width: 0;">
              <div style="font-weight: 700; font-size: 13px; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${v.make || ''} ${v.model}
              </div>
              <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                <span class="mono-tag" style="font-size: 11px;">${v.plateNumber}</span>
                <span class="badge badge-confirmed" style="font-size: 9.5px; padding: 1px 5px;">${v.type || 'SUV'}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    this.renderBookingVehicleServicesConfig();
    this.recalculateBookingForm();
  },

  toggleVehicleFromCard: function (plate, event) {
    if (event.target.tagName === 'INPUT') return;
    const safePlateId = plate.replace(/\s+/g, '-');
    const chk = document.getElementById(`veh-chk-${safePlateId}`);
    if (chk) {
      chk.checked = !chk.checked;
      this.onBookingVehicleToggle(plate, chk.checked);
    }
  },

  onBookingVehicleToggle: function (plate, isChecked) {
    const safePlateId = plate.replace(/\s+/g, '-');
    const cardEl = document.getElementById(`veh-card-${safePlateId}`);
    if (isChecked) {
      if (!this.bookingSelectedVehicles.includes(plate)) {
        this.bookingSelectedVehicles.push(plate);
      }
      if (!this.bookingVehicleConfigs[plate]) {
        const defaultKey = (this.data.packages && this.data.packages.length > 0)
          ? `pkg:${this.data.packages[0].id}`
          : `srv:${this.data.services[0].id}`;
        this.bookingVehicleConfigs[plate] = {
          serviceKey: defaultKey,
          addons: []
        };
      }
      if (cardEl) cardEl.classList.add('selected');
    } else {
      this.bookingSelectedVehicles = this.bookingSelectedVehicles.filter(p => p !== plate);
      if (cardEl) cardEl.classList.remove('selected');
    }

    this.renderBookingVehicleServicesConfig();
    this.recalculateBookingForm();
  },

  // Render per-vehicle service & add-ons selector (Requirement 3)
  renderBookingVehicleServicesConfig: function () {
    const container = document.getElementById('booking-vehicle-services-list');
    if (!container) return;

    if (!this.bookingSelectedVehicles || this.bookingSelectedVehicles.length === 0) {
      container.innerHTML = `
        <div style="font-size: 12.5px; color: var(--text-tertiary); padding: 12px; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm); border: 1px dashed var(--border-subtle);">
          No vehicle selected yet. Please check one or more vehicles above.
        </div>
      `;
      return;
    }

    const curr = this.data.settings.currency || '₹';

    container.innerHTML = this.bookingSelectedVehicles.map(plate => {
      const v = this.data.vehicles.find(veh => veh.plateNumber === plate) || {
        plateNumber: plate,
        model: "Vehicle",
        make: "",
        type: "Car"
      };

      const cfg = this.bookingVehicleConfigs[plate] || {
        serviceKey: (this.data.packages && this.data.packages.length > 0) ? `pkg:${this.data.packages[0].id}` : `srv:${this.data.services[0].id}`,
        addons: []
      };

      // Generate package options
      const pkgOptions = (this.data.packages || []).filter(p => p.status === 'Active').map(p => {
        const finalP = p.finalPrice || p.packagePrice || p.regularPrice;
        const regP = p.regularPrice || p.packagePrice;
        const offerBadge = (p.discountPercent > 0)
          ? ` [${p.discountPercent}% OFF • Save ${curr}${regP - finalP}]`
          : (p.offerType === 'fixed' && regP > finalP ? ` [Save ${curr}${regP - finalP}]` : '');
        return `<option value="pkg:${p.id}" ${cfg.serviceKey === `pkg:${p.id}` ? 'selected' : ''}>★ ${p.name} - ${curr} ${finalP.toLocaleString()}${offerBadge} (${p.duration || '60m'})</option>`;
      }).join('');

      // Generate service options
      const srvOptions = (this.data.services || []).filter(s => s.status === 'Active').map(s => {
        const finalP = s.finalPrice || s.price || s.regularPrice;
        const regP = s.regularPrice || s.price;
        const offerBadge = (s.discountPercent > 0)
          ? ` [${s.discountPercent}% OFF • Save ${curr}${regP - finalP}]`
          : (s.offerType === 'fixed' && regP > finalP ? ` [Save ${curr}${regP - finalP}]` : '');
        return `<option value="srv:${s.id}" ${cfg.serviceKey === `srv:${s.id}` ? 'selected' : ''}>${s.name} - ${curr} ${finalP.toLocaleString()}${offerBadge} (${s.duration || '35m'})</option>`;
      }).join('');

      // Add-ons checkboxes
      const addonsHtml = (this.data.addons || []).map(a => {
        const isAddChecked = cfg.addons && cfg.addons.includes(a.name);
        return `
          <label style="display: flex; align-items: center; gap: 6px; font-size: 11px; padding: 4px 8px; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); cursor: pointer;">
            <input type="checkbox" ${isAddChecked ? 'checked' : ''} onchange="GingerApp.onVehicleAddonToggle('${plate}', '${a.name}', this.checked)">
            <span>${a.name} (+${curr}${a.price})</span>
          </label>
        `;
      }).join('');

      return `
        <div class="booking-vehicle-service-card" style="background: var(--bg-surface); border: 1px solid var(--border-medium); border-radius: var(--radius-md); padding: 12px 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid var(--border-subtle);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 700; font-size: 13.5px; color: var(--text-primary);">🚗 ${v.make || ''} ${v.model}</span>
              <span class="mono-tag" style="font-size: 11px;">${v.plateNumber}</span>
              <span class="badge badge-confirmed" style="font-size: 10px;">${v.type || 'SUV'}</span>
            </div>
            <button type="button" class="table-icon-btn danger-action" title="Remove this vehicle from booking" onclick="GingerApp.onBookingVehicleToggle('${plate}', false); const chk = document.getElementById('veh-chk-${plate.replace(/\s+/g, '-')}'); if (chk) chk.checked = false;">✕</button>
          </div>
          <div style="margin-bottom: 8px;">
            <label class="form-label" style="font-size: 11.5px; margin-bottom: 4px;">Assigned Service / Package for this Vehicle <span class="required">*</span></label>
            <select class="form-control form-control-sm" onchange="GingerApp.onVehicleServiceChange('${plate}', this.value)">
              <optgroup label="Car Wash Packages & Detailing Bundles">
                ${pkgOptions}
              </optgroup>
              <optgroup label="Individual Services">
                ${srvOptions}
              </optgroup>
            </select>
          </div>
          <div>
            <label class="form-label" style="font-size: 11.5px; margin-bottom: 4px;">Optional Add-ons for this Vehicle</label>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${addonsHtml}
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  onVehicleServiceChange: function (plate, serviceKey) {
    if (!this.bookingVehicleConfigs[plate]) {
      this.bookingVehicleConfigs[plate] = { serviceKey: serviceKey, addons: [] };
    } else {
      this.bookingVehicleConfigs[plate].serviceKey = serviceKey;
    }
    this.recalculateBookingForm();
  },

  onVehicleAddonToggle: function (plate, addonName, isChecked) {
    if (!this.bookingVehicleConfigs[plate]) {
      this.bookingVehicleConfigs[plate] = { serviceKey: '', addons: [] };
    }
    if (isChecked) {
      if (!this.bookingVehicleConfigs[plate].addons.includes(addonName)) {
        this.bookingVehicleConfigs[plate].addons.push(addonName);
      }
    } else {
      this.bookingVehicleConfigs[plate].addons = this.bookingVehicleConfigs[plate].addons.filter(a => a !== addonName);
    }
    this.recalculateBookingForm();
  },

  // Recalculate multi-vehicle booking costs and update Live Summary Card (Requirement 3, 5, 6, 7)
  recalculateBookingForm: function () {
    const curr = this.data.settings.currency || '₹';
    const settings = this.data.settings;

    let grossSubtotal = 0;
    let netSubtotal = 0;
    const vehicleBreakdownRows = [];

    (this.bookingSelectedVehicles || []).forEach(plate => {
      const v = this.data.vehicles.find(veh => veh.plateNumber === plate) || {
        plateNumber: plate,
        model: "Vehicle",
        make: ""
      };
      const cfg = this.bookingVehicleConfigs[plate] || { serviceKey: '', addons: [] };

      let itemName = "Standard Wash";
      let regPrice = 0;
      let finalPrice = 0;

      if (cfg.serviceKey && cfg.serviceKey.startsWith('pkg:')) {
        const pkgId = cfg.serviceKey.replace('pkg:', '');
        const p = this.data.packages.find(pkg => pkg.id === pkgId);
        if (p) {
          itemName = `★ ${p.name}`;
          regPrice = p.regularPrice || p.packagePrice || 0;
          finalPrice = p.finalPrice || p.packagePrice || p.regularPrice || 0;
        }
      } else if (cfg.serviceKey && cfg.serviceKey.startsWith('srv:')) {
        const srvId = cfg.serviceKey.replace('srv:', '');
        const s = this.data.services.find(srv => srv.id === srvId);
        if (s) {
          itemName = s.name;
          regPrice = s.regularPrice || s.price || 0;
          finalPrice = s.finalPrice || s.price || s.regularPrice || 0;
        }
      }

      let addonsSum = 0;
      (cfg.addons || []).forEach(addName => {
        const found = (this.data.addons || []).find(a => a.name === addName);
        addonsSum += found ? found.price : 400;
      });

      const vehRegular = regPrice + addonsSum;
      const vehFinal = finalPrice + addonsSum;

      grossSubtotal += vehRegular;
      netSubtotal += vehFinal;

      vehicleBreakdownRows.push({
        plate: plate,
        model: `${v.make || ''} ${v.model}`.trim(),
        serviceName: itemName,
        addons: cfg.addons || [],
        vehicleTotal: vehFinal
      });
    });

    const offerDiscount = Math.max(0, grossSubtotal - netSubtotal);
    const manualDiscount = parseFloat(document.getElementById('form-booking-discount')?.value || 0);
    const totalDiscount = offerDiscount + manualDiscount;
    const grandTotal = Math.max(0, grossSubtotal - totalDiscount);

    // Update UI elements
    const countBadge = document.getElementById('bs-items-count-badge');
    if (countBadge) {
      countBadge.textContent = `${this.bookingSelectedVehicles.length} vehicle(s) selected`;
    }

    const breakdownContainer = document.getElementById('booking-summary-vehicles-breakdown');
    if (breakdownContainer) {
      if (vehicleBreakdownRows.length === 0) {
        breakdownContainer.innerHTML = `<div style="font-size: 12px; color: var(--text-tertiary); font-style: italic;">No vehicles selected yet.</div>`;
      } else {
        breakdownContainer.innerHTML = vehicleBreakdownRows.map(row => `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 4px 0; border-bottom: 1px dashed var(--border-subtle);">
            <div>
              <span style="font-weight: 700; color: var(--text-primary); font-size: 13px;">${row.model}</span>
              <span class="mono-tag" style="font-size: 11px; margin-left: 4px;">${row.plate}</span><br>
              <span style="font-size: 12px; color: var(--text-secondary);">${row.serviceName}</span>
              ${row.addons.length > 0 ? `<span style="font-size: 11px; color: #38bdf8;"> + [${row.addons.join(', ')}]</span>` : ''}
            </div>
            <div style="font-family: var(--font-mono); font-weight: 700; color: var(--text-primary); font-size: 13px;">
              ${curr} ${row.vehicleTotal.toLocaleString()}
            </div>
          </div>
        `).join('');
      }
    }

    const elSub = document.getElementById('bf-calc-subtotal');
    const elDisc = document.getElementById('bf-calc-discount');
    const elTaxable = document.getElementById('bf-calc-taxable');
    const elTaxLabel = document.getElementById('bf-calc-tax-label');
    const elTax = document.getElementById('bf-calc-tax');
    const elGrand = document.getElementById('bf-calc-grandtotal');

    if (elSub) elSub.textContent = `${curr} ${grossSubtotal.toLocaleString()}`;
    if (elDisc) elDisc.textContent = (totalDiscount > 0) ? `- ${curr} ${totalDiscount.toLocaleString()}` : `${curr} 0`;
    if (elTaxable) elTaxable.textContent = `${curr} 0`;
    if (elTaxLabel) elTaxLabel.textContent = `Tax:`;
    if (elTax) elTax.textContent = `${curr} 0`;
    if (elGrand) elGrand.textContent = `${curr} ${grandTotal.toLocaleString()}`;
  },

  // Open inline Add Customer directly from booking modal
  openAddCustomerFromBooking: function () {
    this.returnToBooking = true;
    this.closeModal('add-booking-modal');
    this.openCreateCustomerModal();
  },

  // Open inline Add Vehicle directly from booking modal
  openAddVehicleFromBooking: function () {
    const custSelect = document.getElementById('form-booking-customer');
    const custId = custSelect ? custSelect.value : null;

    if (!custId) {
      this.showToast('Please select a customer first before adding a vehicle.', 'warning');
      return;
    }

    const cust = this.data.customers.find(c => c.id === custId);
    if (!cust) return;

    const custNameEl = document.getElementById('bqv-customer-name');
    if (custNameEl) custNameEl.textContent = `${cust.name} (${cust.phone})`;

    const masterSelect = document.getElementById('bqv-master-select');
    if (masterSelect) {
      const vmList = this.data.vehicleMaster || [];
      masterSelect.innerHTML = vmList.map(vm => `
        <option value="${vm.id}">${vm.make} ${vm.model} (${vm.type})</option>
      `).join('');
    }

    const plateInput = document.getElementById('bqv-plate-input');
    if (plateInput) plateInput.value = '';
    const colorInput = document.getElementById('bqv-color-input');
    if (colorInput) colorInput.value = '';

    this.openModal('booking-quick-vehicle-modal');
  },

  saveQuickVehicleForBooking: function (e) {
    if (e) e.preventDefault();
    const custSelect = document.getElementById('form-booking-customer');
    const custId = custSelect ? custSelect.value : null;
    const plateInput = document.getElementById('bqv-plate-input');
    const plate = plateInput ? plateInput.value.trim().toUpperCase() : '';

    if (!custId) {
      this.showToast('Please select a customer first', 'error');
      return;
    }
    if (!plate) {
      this.showToast('Vehicle registration number is required', 'error');
      return;
    }

    const customer = this.data.customers.find(c => c.id === custId);
    if (!customer) return;

    const masterId = document.getElementById('bqv-master-select')?.value;
    const vm = (this.data.vehicleMaster || []).find(m => m.id === masterId) || {
      make: "Toyota",
      model: "Land Cruiser 300",
      type: "SUV"
    };

    const color = (document.getElementById('bqv-color-input')?.value || '').trim() || 'Standard';

    // Find or create vehicle
    let v = this.data.vehicles.find(item => item.plateNumber === plate);
    if (v) {
      v.customerId = customer.id;
      v.customerName = customer.name;
      v.make = vm.make;
      v.model = vm.model;
      v.type = vm.type;
    } else {
      v = {
        plateNumber: plate,
        customerId: customer.id,
        customerName: customer.name,
        make: vm.make,
        model: vm.model,
        year: 2024,
        type: vm.type,
        color: color,
        vin: `VIN-${Date.now().toString().slice(-6)}`,
        lastService: "None",
        totalServices: 0,
        status: "Completed",
        serviceHistory: []
      };
      this.data.vehicles.unshift(v);
    }

    if (!customer.vehicles) customer.vehicles = [];
    if (!customer.vehicles.includes(plate)) {
      customer.vehicles.push(plate);
    }

    this.saveState();
    this.closeModal('booking-quick-vehicle-modal');

    // Automatically refresh customer vehicles list and check/select this newly added vehicle
    this.onBookingCustomerChange(customer.id);
    if (!this.bookingSelectedVehicles.includes(plate)) {
      this.bookingSelectedVehicles.push(plate);
    }
    const safePlateId = plate.replace(/\s+/g, '-');
    const cardEl = document.getElementById(`veh-card-${safePlateId}`);
    if (cardEl) cardEl.classList.add('selected');
    const chk = document.getElementById(`veh-chk-${safePlateId}`);
    if (chk) chk.checked = true;

    const defaultKey = (this.data.packages && this.data.packages.length > 0)
      ? `pkg:${this.data.packages[0].id}`
      : `srv:${this.data.services[0].id}`;
    this.bookingVehicleConfigs[plate] = {
      serviceKey: defaultKey,
      addons: []
    };

    this.renderBookingVehicleServicesConfig();
    this.recalculateBookingForm();
    this.showToast(`Vehicle ${plate} (${vm.make} ${vm.model}) linked to ${customer.name} and selected for booking!`, 'success');
  },

  // Submit multi-vehicle booking (Requirement 2, 3, 7, 11)
  submitNewBooking: function () {
    const custSelect = document.getElementById('form-booking-customer');
    const dateInput = document.getElementById('form-booking-date');
    const timeInput = document.getElementById('form-booking-time');
    const staffSelect = document.getElementById('form-booking-staff');
    const paymentMethodSelect = document.getElementById('form-booking-payment-method');
    const paymentStatusSelect = document.getElementById('form-booking-payment-status');
    const notesInput = document.getElementById('form-booking-notes');
    const discountInput = document.getElementById('form-booking-discount');

    if (!custSelect || !custSelect.value) {
      this.showToast('Please select a customer', 'error');
      return;
    }

    if (!this.bookingSelectedVehicles || this.bookingSelectedVehicles.length === 0) {
      this.showToast('Please select at least one vehicle to book services for.', 'error');
      return;
    }

    const customer = this.data.customers.find(c => c.id === custSelect.value);
    if (!customer) {
      this.showToast('Invalid customer selected', 'error');
      return;
    }

    // Build vehicleServices array
    const vehicleServices = [];
    let grossSubtotal = 0;
    let netSubtotal = 0;

    this.bookingSelectedVehicles.forEach(plate => {
      const v = this.data.vehicles.find(veh => veh.plateNumber === plate) || {
        plateNumber: plate,
        model: "Vehicle",
        make: "",
        type: "SUV"
      };
      const cfg = this.bookingVehicleConfigs[plate] || { serviceKey: '', addons: [] };

      let serviceType = "Service";
      let serviceId = "SRV-01";
      let serviceName = "Foam Pressure Wash";
      let regularPrice = 650;
      let finalPrice = 650;

      if (cfg.serviceKey && cfg.serviceKey.startsWith('pkg:')) {
        serviceType = "Package";
        serviceId = cfg.serviceKey.replace('pkg:', '');
        const p = this.data.packages.find(pkg => pkg.id === serviceId);
        if (p) {
          serviceName = p.name;
          regularPrice = p.regularPrice || p.packagePrice || 0;
          finalPrice = p.finalPrice || p.packagePrice || p.regularPrice || 0;
        }
      } else if (cfg.serviceKey && cfg.serviceKey.startsWith('srv:')) {
        serviceType = "Service";
        serviceId = cfg.serviceKey.replace('srv:', '');
        const s = this.data.services.find(srv => srv.id === serviceId);
        if (s) {
          serviceName = s.name;
          regularPrice = s.regularPrice || s.price || 0;
          finalPrice = s.finalPrice || s.price || s.regularPrice || 0;
        }
      }

      let addonsSum = 0;
      (cfg.addons || []).forEach(addName => {
        const found = (this.data.addons || []).find(a => a.name === addName);
        addonsSum += found ? found.price : 400;
      });

      const vehTotal = finalPrice + addonsSum;
      grossSubtotal += (regularPrice + addonsSum);
      netSubtotal += vehTotal;

      vehicleServices.push({
        vehiclePlate: plate,
        vehicleModel: `${v.make || ''} ${v.model}`.trim(),
        vehicleType: v.type || 'SUV',
        serviceType: serviceType,
        serviceId: serviceId,
        serviceName: serviceName,
        regularPrice: regularPrice,
        offerPrice: finalPrice,
        finalPrice: finalPrice,
        addons: cfg.addons || [],
        addonsTotal: addonsSum,
        vehicleTotal: vehTotal
      });
    });

    const offerDiscount = Math.max(0, grossSubtotal - netSubtotal);
    const manualDiscount = parseFloat(discountInput?.value || 0);
    const totalDiscount = offerDiscount + manualDiscount;
    const grandTotal = Math.max(0, netSubtotal - manualDiscount);

    const newBookingId = `BK-2026-00${488 + this.data.bookings.length}`;

    const newBooking = {
      id: newBookingId,
      date: dateInput.value || new Date().toISOString().split('T')[0],
      time: timeInput.value || "02:00 PM",
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      vehiclesCount: vehicleServices.length,
      vehiclePlate: vehicleServices.map(vs => vs.vehiclePlate).join(', '),
      vehicleModel: vehicleServices.map(vs => `${vs.vehiclePlate}: ${vs.vehicleModel}`).join(' | '),
      vehicleType: vehicleServices[0].vehicleType || 'SUV',
      bookingType: vehicleServices.some(vs => vs.serviceType === 'Package') ? 'Package' : 'Service',
      serviceName: vehicleServices.map(vs => `${vs.vehiclePlate} (${vs.serviceName})`).join('; '),
      vehicleServices: vehicleServices,
      assignedStaff: staffSelect.value || "Tariq Mansoor",
      amount: netSubtotal,
      discount: totalDiscount,
      tax: 0,
      totalAmount: grandTotal,
      paymentStatus: paymentStatusSelect ? paymentStatusSelect.value : "Pending",
      paymentMethod: paymentMethodSelect ? paymentMethodSelect.value : "Online UPI",
      bookingStatus: "Confirmed",
      currentStageIndex: 1,
      stageTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stageActor: this.data.currentUser.name,
      notes: notesInput.value || "Multi-vehicle booking",
      addons: vehicleServices.flatMap(vs => vs.addons),
      timeline: [
        { stage: "Confirmed", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), actor: this.data.currentUser.name, note: `Confirmed booking for ${vehicleServices.length} vehicle(s).` }
      ]
    };

    this.data.bookings.unshift(newBooking);

    // Update each vehicle's dedicated service history (Requirement 11)
    vehicleServices.forEach(vs => {
      const v = this.data.vehicles.find(veh => veh.plateNumber === vs.vehiclePlate);
      if (v) {
        if (!v.serviceHistory) v.serviceHistory = [];
        v.serviceHistory.unshift({
          date: newBooking.date,
          service: vs.serviceName,
          amount: vs.vehicleTotal,
          staff: newBooking.assignedStaff,
          status: 'Confirmed',
          bookingId: newBooking.id
        });
        v.totalServices = (v.totalServices || 0) + 1;
        v.lastService = newBooking.date;
        v.status = 'Confirmed';
      }

      // Automatically track wash usage and decrement package washes if vehicle has active package
      const activePkg = (this.data.customerPackages || []).find(cp =>
        cp.vehiclePlate === vs.vehiclePlate && cp.status === 'Active' && cp.remainingWashes > 0
      );
      if (activePkg) {
        activePkg.usedWashes = (activePkg.usedWashes || 0) + 1;
        activePkg.remainingWashes = Math.max(0, (activePkg.remainingWashes || 1) - 1);
        if (!activePkg.usageHistory) activePkg.usageHistory = [];
        activePkg.usageHistory.unshift({
          date: newBooking.date,
          bookingId: newBooking.id,
          serviceName: vs.serviceName,
          staff: newBooking.assignedStaff,
          vehiclePlate: vs.vehiclePlate
        });
        if (activePkg.remainingWashes <= 0) {
          activePkg.status = 'Completed';
        }
      }
    });

    // Update customer lifetime stats
    customer.totalBookings = (customer.totalBookings || 0) + 1;
    customer.lastService = newBooking.date;
    customer.totalSpend = (customer.totalSpend || 0) + newBooking.totalAmount;

    // Auto-create invoice itemized by vehicle
    InvoiceEngine.createFromBooking(newBooking);

    this.saveState();
    this.showToast(`Booking ${newBookingId} created successfully for ${vehicleServices.length} vehicle(s)!`, 'success');
    this.closeModal('add-booking-modal');
    this.renderBookingsTable();
    this.renderDashboard();
    this.renderCustomersTable();
    this.renderVehiclesTable();
    this.renderBillingTable();
    if (this.currentModule === 'customer-profile') {
      this.renderCustomerProfilePage(this.activeProfileCustomerId);
    }
  },

  // Status Update Modal Controls (Requirement 2 & 10)
  openUpdateStatusModal: function (bookingId) {
    const b = this.data.bookings.find(item => item.id === bookingId);
    if (!b) return;

    document.getElementById('status-update-booking-id').value = b.id;
    document.getElementById('status-update-booking-info').textContent = `${b.id} – ${b.customerName} (${b.vehiclePlate})`;

    const badgeContainer = document.getElementById('status-update-current-badge');
    if (badgeContainer) {
      badgeContainer.innerHTML = `<span class="badge ${WorkflowEngine.getBadgeClass(b.bookingStatus)}">Current: ${b.bookingStatus}</span>`;
    }

    const select = document.getElementById('status-update-select');
    if (select) select.value = b.bookingStatus;

    const note = document.getElementById('status-update-note');
    if (note) note.value = "";

    this.openModal('update-booking-status-modal');
  },

  openUpdateStatusModalFromCurrentBooking: function () {
    if (!this.activeBookingDetailsId) return;
    this.openUpdateStatusModal(this.activeBookingDetailsId);
  },

  changeBookingStatusFromSelect: function (newStatus) {
    if (!this.activeBookingDetailsId) return;
    WorkflowEngine.updateBookingStatus(this.activeBookingDetailsId, newStatus, `Updated to ${newStatus} via details header`);
    WorkflowEngine.openBookingDetails(this.activeBookingDetailsId);
    this.renderBookingsTable();
    this.renderDashboard();
    this.showToast(`Status updated to ${newStatus}`, 'success');
  },

  submitBookingStatusUpdate: function (e) {
    if (e) e.preventDefault();
    const bookingId = document.getElementById('status-update-booking-id').value;
    const newStatus = document.getElementById('status-update-select').value;
    const note = document.getElementById('status-update-note').value.trim();

    WorkflowEngine.updateBookingStatus(bookingId, newStatus, note);
    this.closeModal('update-booking-status-modal');
    this.showToast(`Booking ${bookingId} status updated to ${newStatus}`, 'success');
    this.renderBookingsTable();
    this.renderDashboard();

    // If booking details modal is open for this booking, refresh it
    if (this.activeBookingDetailsId === bookingId) {
      WorkflowEngine.openBookingDetails(bookingId);
    }
    // If customer profile is open, refresh history
    if (this.activeProfileCustomerId) {
      const c = this.data.customers.find(item => item.id === this.activeProfileCustomerId);
      if (c) this.renderCustomerServiceHistoryTab(c);
    }
  },

  openEditBookingModal: function (bookingId) {
    const b = this.data.bookings.find(item => item.id === bookingId);
    if (!b) return;

    document.getElementById('edit-booking-id-title').textContent = b.id;
    document.getElementById('edit-booking-id-hidden').value = b.id;
    document.getElementById('edit-booking-date').value = b.date;
    document.getElementById('edit-booking-time').value = b.time;
    document.getElementById('edit-booking-staff').value = b.assignedStaff;
    if (document.getElementById('edit-booking-bay')) {
      document.getElementById('edit-booking-bay').value = b.bay || "Bay 1";
    }
    document.getElementById('edit-booking-status').value = b.bookingStatus;
    document.getElementById('edit-booking-notes').value = b.notes || "";

    this.openModal('edit-booking-modal');
  },

  saveEditedBooking: function (e) {
    if (e) e.preventDefault();
    const id = document.getElementById('edit-booking-id-hidden').value;
    const b = this.data.bookings.find(item => item.id === id);
    if (!b) return;

    b.date = document.getElementById('edit-booking-date').value;
    b.time = document.getElementById('edit-booking-time').value;
    b.assignedStaff = document.getElementById('edit-booking-staff').value;
    b.bookingStatus = document.getElementById('edit-booking-status').value;
    b.currentStageIndex = WorkflowEngine.getStageIndex(b.bookingStatus);
    b.notes = document.getElementById('edit-booking-notes').value;

    this.saveState();
    this.showToast(`Booking ${b.id} updated!`, 'success');
    this.closeModal('edit-booking-modal');
    this.renderBookingsTable();
    this.renderDashboard();
  },

  // =========================================================================
  // SERVICES MODULE (FULL CRUD)
  // =========================================================================
  renderServicesCatalog: function () {
    const container = document.getElementById('services-grid-container');
    if (!container) return;

    container.innerHTML = this.data.services.map(s => {
      const finalPrice = s.finalPrice || s.price;
      const regularPrice = s.regularPrice || s.price;
      const hasOffer = (s.offerType && s.offerType !== 'none') || (regularPrice > finalPrice);

      return `
        <div class="service-card">
          <div class="service-card-top">
            <div>
              <div class="service-category-tag">${s.category}</div>
              <div class="service-title">${s.name}</div>
            </div>
            <span class="badge ${s.status === 'Active' ? 'badge-paid' : 'badge-unpaid'}">${s.status}</span>
          </div>
          <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">${s.description}</p>
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 10px;">
            <div class="service-duration-pill">
              ⏱ ${s.duration} • ${s.vehicleType}
            </div>
            <div style="text-align: right;">
              <div class="service-price-tag" style="color: ${hasOffer ? '#10b981' : 'var(--primary-500)'};">${this.data.settings.currency} ${finalPrice.toLocaleString()}</div>
              ${hasOffer ? `
                <div style="font-size: 11px; color: var(--text-tertiary);">
                  <span style="text-decoration: line-through;">${this.data.settings.currency} ${regularPrice.toLocaleString()}</span>
                  ${s.discountPercent > 0 ? `<span class="badge badge-paid" style="font-size: 9.5px; padding: 1px 4px; margin-left: 3px;">${s.discountPercent}% OFF</span>` : ''}
                </div>
              ` : ''}
            </div>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
            <button class="btn-action btn-sm" onclick="GingerApp.openEditServiceModal('${s.id}')">✏ Edit</button>
            <button class="btn-action btn-sm" onclick="GingerApp.toggleServiceStatus('${s.id}')">${s.status === 'Active' ? '⏸ Disable' : '▶ Enable'}</button>
            <button class="btn-action btn-action-danger btn-sm" onclick="GingerApp.deleteService('${s.id}')" title="Delete Service">✕ Delete</button>
          </div>
        </div>
      `;
    }).join('');
  },

  openCreateServiceModal: function () {
    document.getElementById('form-service-title').textContent = "Add New Wash Service";
    document.getElementById('srv-id-hidden').value = "";
    document.getElementById('srv-name-input').value = "";
    document.getElementById('srv-cat-select').value = "Exterior Wash";
    document.getElementById('srv-vehicle-type').value = "All Types";
    document.getElementById('srv-duration-input').value = "45 mins";
    document.getElementById('srv-reg-price-input').value = "1000";
    document.getElementById('srv-offer-type-select').value = "none";
    document.getElementById('srv-discount-pct-input').value = "10";
    document.getElementById('srv-offer-price-input').value = "900";
    document.getElementById('srv-desc-input').value = "";
    document.getElementById('srv-status-select').value = "Active";

    this.onServicePricingChange();
    this.openModal('service-form-modal');
  },

  openEditServiceModal: function (srvId) {
    const s = this.data.services.find(item => item.id === srvId);
    if (!s) return;

    document.getElementById('form-service-title').textContent = `Edit Service: ${s.name}`;
    document.getElementById('srv-id-hidden').value = s.id;
    document.getElementById('srv-name-input').value = s.name;
    document.getElementById('srv-cat-select').value = s.category;
    document.getElementById('srv-vehicle-type').value = s.vehicleType;
    document.getElementById('srv-duration-input').value = s.duration;
    document.getElementById('srv-reg-price-input').value = s.regularPrice || s.price || 0;
    document.getElementById('srv-offer-type-select').value = s.offerType || "none";
    document.getElementById('srv-discount-pct-input').value = s.discountPercent || 0;
    document.getElementById('srv-offer-price-input').value = s.offerPrice || s.finalPrice || s.price || 0;
    document.getElementById('srv-desc-input').value = s.description;
    document.getElementById('srv-status-select').value = s.status;

    this.onServicePricingChange();
    this.openModal('service-form-modal');
  },

  onServicePricingChange: function () {
    const regInput = document.getElementById('srv-reg-price-input');
    const typeSelect = document.getElementById('srv-offer-type-select');
    const pctGroup = document.getElementById('srv-discount-pct-group');
    const pctInput = document.getElementById('srv-discount-pct-input');
    const offerGroup = document.getElementById('srv-offer-price-group');
    const offerInput = document.getElementById('srv-offer-price-input');
    const previewEl = document.getElementById('srv-pricing-calc-preview');

    if (!regInput || !typeSelect) return;

    const regPrice = parseFloat(regInput.value) || 0;
    const offerType = typeSelect.value;
    let discountPercent = parseFloat(pctInput?.value) || 0;
    let offerPrice = parseFloat(offerInput?.value) || regPrice;
    let finalPrice = regPrice;
    let discountAmount = 0;

    if (offerType === 'none') {
      if (pctGroup) pctGroup.style.display = 'none';
      if (offerGroup) offerGroup.style.display = 'none';
      finalPrice = regPrice;
      discountPercent = 0;
      discountAmount = 0;
    } else if (offerType === 'percentage') {
      if (pctGroup) pctGroup.style.display = 'block';
      if (offerGroup) offerGroup.style.display = 'none';
      discountPercent = Math.min(100, Math.max(0, discountPercent));
      discountAmount = Math.round(regPrice * (discountPercent / 100));
      finalPrice = Math.max(0, regPrice - discountAmount);
      if (offerInput) offerInput.value = finalPrice;
    } else if (offerType === 'fixed') {
      if (pctGroup) pctGroup.style.display = 'none';
      if (offerGroup) offerGroup.style.display = 'block';
      finalPrice = offerPrice;
      discountAmount = Math.max(0, regPrice - offerPrice);
      discountPercent = regPrice > 0 ? Math.round((discountAmount / regPrice) * 100) : 0;
      if (pctInput) pctInput.value = discountPercent;
    }

    const curr = this.data.settings.currency || '₹';
    if (previewEl) {
      if (offerType === 'none') {
        previewEl.innerHTML = `Final Price: <strong>${curr} ${finalPrice.toLocaleString()}</strong> (Regular Price)`;
      } else {
        previewEl.innerHTML = `Final Price: <strong>${curr} ${finalPrice.toLocaleString()}</strong> <span style="font-size: 11.5px; color: var(--text-tertiary); text-decoration: line-through; margin-left: 6px;">${curr} ${regPrice.toLocaleString()}</span> <span class="badge badge-paid" style="margin-left: 6px;">${discountPercent}% OFF (Save ${curr} ${discountAmount.toLocaleString()})</span>`;
      }
    }
  },

  saveService: function (e) {
    if (e) e.preventDefault();
    const name = document.getElementById('srv-name-input').value.trim();
    if (!name) return;

    const id = document.getElementById('srv-id-hidden').value;
    const cat = document.getElementById('srv-cat-select').value;
    const vType = document.getElementById('srv-vehicle-type').value;
    const duration = document.getElementById('srv-duration-input').value.trim();
    const regPrice = parseFloat(document.getElementById('srv-reg-price-input').value) || 0;
    const offerType = document.getElementById('srv-offer-type-select').value;
    const discountPercent = parseFloat(document.getElementById('srv-discount-pct-input').value) || 0;
    let offerPrice = parseFloat(document.getElementById('srv-offer-price-input').value) || regPrice;
    const desc = document.getElementById('srv-desc-input').value.trim();
    const status = document.getElementById('srv-status-select').value;

    let finalPrice = regPrice;
    if (offerType === 'percentage') {
      const discount = Math.round(regPrice * (discountPercent / 100));
      finalPrice = Math.max(0, regPrice - discount);
      offerPrice = finalPrice;
    } else if (offerType === 'fixed') {
      finalPrice = offerPrice;
    }

    if (id) {
      const s = this.data.services.find(item => item.id === id);
      if (s) {
        s.name = name;
        s.category = cat;
        s.vehicleType = vType;
        s.duration = duration;
        s.regularPrice = regPrice;
        s.offerType = offerType;
        s.discountPercent = discountPercent;
        s.offerPrice = offerPrice;
        s.finalPrice = finalPrice;
        s.price = finalPrice;
        s.description = desc;
        s.status = status;
      }
      this.showToast(`Service ${name} updated!`, 'success');
    } else {
      const newId = `SRV-0${this.data.services.length + 1}`;
      this.data.services.push({
        id: newId,
        name: name,
        category: cat,
        vehicleType: vType,
        duration: duration,
        regularPrice: regPrice,
        offerType: offerType,
        discountPercent: discountPercent,
        offerPrice: offerPrice,
        finalPrice: finalPrice,
        price: finalPrice,
        description: desc,
        status: status
      });
      this.showToast(`Service ${name} created!`, 'success');
    }

    this.saveState();
    this.closeModal('service-form-modal');
    this.renderServicesCatalog();
    this.populateBookingCustomerDropdown();
  },

  toggleServiceStatus: function (srvId) {
    const s = this.data.services.find(item => item.id === srvId);
    if (!s) return;
    s.status = s.status === 'Active' ? 'Inactive' : 'Active';
    this.saveState();
    this.showToast(`Service ${s.name} is now ${s.status}`, 'info');
    this.renderServicesCatalog();
  },

  deleteService: function (srvId) {
    const s = this.data.services.find(item => item.id === srvId);
    if (!s) return;

    this.confirmAction({
      title: "Delete Service",
      message: `Are you sure you want to delete service "${s.name}"?`,
      confirmText: "Delete",
      isDanger: true,
      onConfirm: () => {
        this.data.services = this.data.services.filter(item => item.id !== srvId);
        this.saveState();
        this.showToast(`Service ${s.name} deleted`, 'warning');
        this.renderServicesCatalog();
      }
    });
  },

  // =========================================================================
  // CUSTOMERS MODULE (FULL CRUD & MULTI-VEHICLE PROFILE)
  // =========================================================================
  renderCustomersTable: function () {
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;

    const search = (this.filters.customers.search || '').toLowerCase();

    const filtered = this.data.customers.filter(c => {
      return !search ||
        c.name.toLowerCase().includes(search) ||
        c.phone.includes(search) ||
        c.email.toLowerCase().includes(search);
    });

    tbody.innerHTML = filtered.map(c => {
      const vehCount = (c.vehicles && c.vehicles.length) ? c.vehicles.length :
        this.data.vehicles.filter(v => v.customerId === c.id).length;

      return `
        <tr>
          <td><span class="mono-tag" style="color: #60a5fa; cursor: pointer;" onclick="GingerApp.openCustomerDetails('${c.id}')">${c.id}</span></td>
          <td>
            <div class="table-primary-text" style="cursor: pointer;" onclick="GingerApp.openCustomerDetails('${c.id}')">${c.name}</div>
            <div class="table-secondary-text">Member since ${c.createdAt}</div>
          </td>
          <td>${c.phone}</td>
          <td>${c.email}</td>
          <td>
            <span class="badge" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; cursor: pointer;" onclick="GingerApp.openCustomerDetails('${c.id}')" title="View all ${vehCount} vehicles">
              🚗 ${vehCount} Vehicle${vehCount === 1 ? '' : 's'}
            </span>
          </td>
          <td><strong style="font-family: var(--font-mono);">${c.totalBookings || 0}</strong></td>
          <td>${c.lastService || 'None'}</td>
          <td>
            <strong style="font-family: var(--font-mono);">${this.data.settings.currency} ${(c.totalSpend || 0).toLocaleString()}</strong>
          </td>
          <td>
            <div class="table-actions-cell" style="display: flex; align-items: center; gap: 4px;">
              <button class="btn-action btn-sm" title="View Customer Profile & Vehicles" onclick="GingerApp.openCustomerDetails('${c.id}')">
                👁 Profile
              </button>
              <button class="btn-action btn-sm" title="Register New Vehicle for this Customer" onclick="GingerApp.openAddVehicleForSpecificCustomer('${c.id}')">
                🚗 + Vehicle
              </button>
              <div class="actions-dropdown-wrap" id="cust-act-${c.id}">
                <button type="button" class="actions-dropdown-btn" onclick="GingerApp.toggleActionMenu('cust-act-${c.id}', event)">
                  Actions ▼
                </button>
                <div class="actions-dropdown-menu">
                  <button class="actions-dropdown-item" onclick="GingerApp.openCustomerDetails('${c.id}')">
                    👁 View Profile & Vehicles
                  </button>
                  <button class="actions-dropdown-item" onclick="GingerApp.openAddVehicleForSpecificCustomer('${c.id}')">
                    🚗 + Add Vehicle
                  </button>
                  <button class="actions-dropdown-item" onclick="GingerApp.openAddBookingForCustomer('${c.id}')">
                    ＋ New Booking
                  </button>
                  <button class="actions-dropdown-item" onclick="GingerApp.openEditCustomerModal('${c.id}')">
                    ✏ Edit Customer
                  </button>
                  <div class="actions-dropdown-divider"></div>
                  <button class="actions-dropdown-item danger-item" onclick="GingerApp.deleteCustomer('${c.id}')">
                    🗑 Delete Customer
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    const countLabel = document.getElementById('customers-count-label');
    if (countLabel) countLabel.textContent = `Showing ${filtered.length} customers`;
  },

  addCustomerVehicleRow: function (existingVeh) {
    const container = document.getElementById('cust-vehicles-input-container');
    if (!container) return;

    const vmList = this.data.vehicleMaster || [];
    const masterOptions = vmList.map(vm => {
      const isSel = existingVeh && (
        existingVeh.masterId === vm.id || 
        (existingVeh.make && existingVeh.make.toLowerCase() === vm.make.toLowerCase() && 
         existingVeh.model && existingVeh.model.toLowerCase() === vm.model.toLowerCase())
      );
      return `<option value="${vm.id}" ${isSel ? 'selected' : ''}>${vm.make} ${vm.model} (${vm.type})</option>`;
    }).join('');

    const row = document.createElement('div');
    row.className = 'cust-vehicle-row';
    row.style.cssText = 'display: flex; gap: 8px; align-items: center; background: var(--bg-surface); padding: 8px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);';
    row.innerHTML = `
      <div style="flex: 2; min-width: 0;">
        <select class="form-control form-control-sm cust-veh-master-select">
          ${masterOptions}
        </select>
      </div>
      <div style="flex: 1.5; min-width: 0;">
        <input type="text" class="form-control form-control-sm cust-veh-plate" placeholder="Plate (e.g. DXB 99012)" value="${existingVeh?.plateNumber || ''}" style="text-transform: uppercase;">
      </div>
      <button type="button" class="table-icon-btn danger-action" title="Remove Vehicle" onclick="this.closest('.cust-vehicle-row').remove()" style="padding: 4px 8px; color: var(--danger); font-size: 13px;">✕</button>
    `;
    container.appendChild(row);
  },

  openCreateCustomerModal: function () {
    document.getElementById('form-cust-modal-title').textContent = "Register New Customer";
    document.getElementById('cust-id-hidden').value = "";
    document.getElementById('cust-name-input').value = "";
    document.getElementById('cust-phone-input').value = "";
    document.getElementById('cust-email-input').value = "";
    document.getElementById('cust-notes-input').value = "";

    const vContainer = document.getElementById('cust-vehicles-input-container');
    if (vContainer) {
      vContainer.innerHTML = "";
      this.addCustomerVehicleRow();
    }

    this.openModal('customer-form-modal');
  },

  openEditCustomerModal: function (custId) {
    const c = this.data.customers.find(item => item.id === custId);
    if (!c) return;

    this.closeModal('customer-profile-modal');

    document.getElementById('form-cust-modal-title').textContent = `Edit Customer: ${c.name}`;
    document.getElementById('cust-id-hidden').value = c.id;
    document.getElementById('cust-name-input').value = c.name;
    document.getElementById('cust-phone-input').value = c.phone;
    document.getElementById('cust-email-input').value = c.email;
    document.getElementById('cust-notes-input').value = c.notes || "";

    const vContainer = document.getElementById('cust-vehicles-input-container');
    if (vContainer) {
      vContainer.innerHTML = "";
      const custVehicles = this.data.vehicles.filter(v => v.customerId === c.id || (c.vehicles && c.vehicles.includes(v.plateNumber)));
      if (custVehicles.length > 0) {
        custVehicles.forEach(v => this.addCustomerVehicleRow(v));
      } else {
        this.addCustomerVehicleRow();
      }
    }

    this.openModal('customer-form-modal');
  },

  saveCustomer: function (e) {
    if (e) e.preventDefault();
    const name = document.getElementById('cust-name-input').value.trim();
    const phone = document.getElementById('cust-phone-input').value.trim();
    if (!name || !phone) {
      this.showToast('Name and phone are required', 'error');
      return;
    }

    const id = document.getElementById('cust-id-hidden').value;
    const email = document.getElementById('cust-email-input').value.trim() || "customer@gingerwashmate.com";
    const notes = document.getElementById('cust-notes-input').value.trim();

    let savedCustId = id;
    let customerObj = null;

    if (id) {
      customerObj = this.data.customers.find(item => item.id === id);
      if (customerObj) {
        customerObj.name = name;
        customerObj.phone = phone;
        customerObj.email = email;
        customerObj.notes = notes;
      }
      this.showToast(`Customer ${name} updated!`, 'success');
    } else {
      const newId = `CUST-${1000 + this.data.customers.length + 1}`;
      savedCustId = newId;
      customerObj = {
        id: newId,
        name: name,
        phone: phone,
        email: email,
        createdAt: new Date().toISOString().split('T')[0],
        lastService: "None yet",
        totalBookings: 0,
        totalSpend: 0,
        notes: notes,
        vehicles: []
      };
      this.data.customers.unshift(customerObj);
      this.showToast(`Customer ${name} registered!`, 'success');
    }

    // Process dynamic vehicle rows from Vehicle Master (Optional)
    const rows = document.querySelectorAll('.cust-vehicle-row');
    const updatedPlates = [];

    rows.forEach(r => {
      const plateInput = r.querySelector('.cust-veh-plate');
      const masterSelect = r.querySelector('.cust-veh-master-select');
      const plate = plateInput ? plateInput.value.trim().toUpperCase() : '';
      const masterId = masterSelect ? masterSelect.value : '';

      if (plate) {
        const vm = (this.data.vehicleMaster || []).find(m => m.id === masterId) || {
          make: "Toyota",
          model: "Model",
          type: "SUV"
        };

        let existingVeh = this.data.vehicles.find(v => v.plateNumber === plate);
        if (existingVeh) {
          existingVeh.customerId = savedCustId;
          existingVeh.customerName = name;
          existingVeh.make = vm.make;
          existingVeh.model = vm.model;
          existingVeh.type = vm.type;
        } else {
          this.data.vehicles.unshift({
            plateNumber: plate,
            customerId: savedCustId,
            customerName: name,
            make: vm.make,
            model: vm.model,
            year: 2024,
            type: vm.type,
            color: "Standard",
            lastService: "None",
            totalServices: 0,
            status: "Completed",
            serviceHistory: []
          });
        }

        if (!updatedPlates.includes(plate)) {
          updatedPlates.push(plate);
        }
      }
    });

    customerObj.vehicles = updatedPlates;

    this.saveState();
    this.closeModal('customer-form-modal');
    this.renderCustomersTable();
    this.populateBookingCustomerDropdown();

    // If initiated from booking form, auto-select newly added customer
    if (this.returnToBooking) {
      this.returnToBooking = false;
      const bCustSelect = document.getElementById('form-booking-customer');
      if (bCustSelect) {
        bCustSelect.value = savedCustId;
        this.onBookingCustomerChange(savedCustId);
      }
      this.openModal('add-booking-modal');
    }
  },

  deleteCustomer: function (custId) {
    const c = this.data.customers.find(item => item.id === custId);
    if (!c) return;

    this.confirmAction({
      title: "Delete Customer",
      message: `Are you sure you want to delete customer ${c.name}? All vehicle records and bookings will remain in system archives.`,
      confirmText: "Delete",
      isDanger: true,
      onConfirm: () => {
        this.data.customers = this.data.customers.filter(item => item.id !== custId);
        this.saveState();
        this.showToast(`Customer ${c.name} deleted`, 'warning');
        this.renderCustomersTable();
        this.populateBookingCustomerDropdown();
      }
    });
  },

  // Open 360 Dedicated Customer Profile Page (Requirement)
  openCustomerDetails: function (custId) {
    this.openCustomerProfile(custId);
  },

  openCustomerProfile: function (custId) {
    const cust = this.data.customers.find(c => c.id === custId) || this.data.customers[0];
    if (!cust) return;

    this.activeProfileCustomerId = cust.id;
    this.navigateTo('customer-profile');
  },

  switchCustomerProfilePageTab: function (tabName) {
    const tabs = ['vehicles', 'packages', 'bookings', 'payments'];
    tabs.forEach(t => {
      const btn = document.getElementById(`cptab-btn-${t}`);
      const pane = document.getElementById(`cptab-pane-${t}`);
      if (btn) btn.classList.toggle('active', t === tabName);
      if (pane) pane.style.display = t === tabName ? 'block' : 'none';
    });
  },

  // Dedicated Customer Profile Page Renderer (Requirement)
  renderCustomerProfilePage: function (custId) {
    const cust = this.data.customers.find(c => c.id === (custId || this.activeProfileCustomerId)) || this.data.customers[0];
    if (!cust) return;

    this.activeProfileCustomerId = cust.id;

    // Header / Hero details
    const initials = cust.name ? cust.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'CU';
    const avatarEl = document.getElementById('cp-avatar');
    if (avatarEl) avatarEl.textContent = initials;

    const nameEl = document.getElementById('cp-name');
    if (nameEl) nameEl.textContent = cust.name;

    const idEl = document.getElementById('cp-id');
    if (idEl) idEl.textContent = cust.id;

    const phoneEl = document.getElementById('cp-phone');
    if (phoneEl) phoneEl.textContent = cust.phone || '--';

    const emailEl = document.getElementById('cp-email');
    if (emailEl) emailEl.textContent = cust.email || '--';

    const notesEl = document.getElementById('cp-notes');
    if (notesEl) notesEl.textContent = cust.notes || "No special preferences.";

    // Customer Vehicles
    const vehicles = this.data.vehicles.filter(v =>
      v.customerId === cust.id || (cust.vehicles && cust.vehicles.includes(v.plateNumber))
    );

    // Customer Packages
    const custPackages = (this.data.customerPackages || []).filter(cp => cp.customerId === cust.id);
    const activePackages = custPackages.filter(cp => cp.status === 'Active' && cp.remainingWashes > 0);
    const totalRemainingWashes = activePackages.reduce((sum, cp) => sum + (cp.remainingWashes || 0), 0);

    // Customer Bookings
    const custBookings = (this.data.bookings || []).filter(b => b.customerId === cust.id);

    // Customer Payments & Invoices
    const custInvoices = (this.data.invoices || []).filter(inv =>
      inv.customerId === cust.id || (inv.customerName && inv.customerName.toLowerCase().includes(cust.name.toLowerCase()))
    );

    // Compute Metrics Stats
    const totalVisits = custBookings.length || cust.totalBookings || 0;
    const lifetimeSpend = cust.totalSpend || custInvoices.reduce((sum, inv) => sum + (inv.total || inv.grandTotal || 0), 0);

    const curr = this.data.settings.currency || '₹';
    const statVisits = document.getElementById('cp-stat-visits');
    if (statVisits) statVisits.textContent = totalVisits;

    const statSpend = document.getElementById('cp-stat-spend');
    if (statSpend) statSpend.textContent = `${curr} ${lifetimeSpend.toLocaleString()}`;

    const statPackages = document.getElementById('cp-stat-packages');
    if (statPackages) statPackages.textContent = activePackages.length;

    const statWashes = document.getElementById('cp-stat-washes');
    if (statWashes) statWashes.textContent = `${totalRemainingWashes} Washes`;

    const statVehicles = document.getElementById('cp-stat-vehicles');
    if (statVehicles) statVehicles.textContent = vehicles.length;

    // Update Tab Count Badges
    const badgeVeh = document.getElementById('cptab-badge-vehicles');
    if (badgeVeh) badgeVeh.textContent = vehicles.length;

    const badgePkg = document.getElementById('cptab-badge-packages');
    if (badgePkg) badgePkg.textContent = custPackages.length;

    const badgeBk = document.getElementById('cptab-badge-bookings');
    if (badgeBk) badgeBk.textContent = custBookings.length;

    const badgePay = document.getElementById('cptab-badge-payments');
    if (badgePay) badgePay.textContent = custInvoices.length;

    // -------------------------------------------------------------
    // RENDER TAB 1: Registered Vehicles & Assigned Packages
    // -------------------------------------------------------------
    const vehGrid = document.getElementById('cp-vehicles-grid');
    if (vehGrid) {
      if (vehicles.length === 0) {
        vehGrid.innerHTML = `
          <div class="empty-state-box" style="grid-column: 1 / -1; padding: 32px;">
            <div class="empty-state-icon">🚗</div>
            <div class="empty-state-title">No vehicles registered for ${cust.name}</div>
            <div class="empty-state-desc">Click below to link a vehicle from Vehicle Master.</div>
            <button type="button" class="btn-primary btn-sm" onclick="GingerApp.openAddVehicleForCustomer('${cust.id}')">+ Add Vehicle</button>
          </div>
        `;
      } else {
        vehGrid.innerHTML = vehicles.map(v => {
          const pkgInfo = this.getVehiclePackageStatus(v.plateNumber);

          let pkgBoxHtml = '';
          if (pkgInfo.hasPackage) {
            const p = pkgInfo.packageRecord || pkgInfo;
            const isCompleted = pkgInfo.status === 'Completed' || p.remainingWashes <= 0;
            const isExpired = pkgInfo.status === 'Expired';
            const isActive = pkgInfo.status === 'Active' && !isCompleted && !isExpired;

            const badgeHtml = isActive
              ? `<span class="badge badge-paid" style="font-size: 11px;">Active</span>`
              : (isExpired
                ? `<span class="badge badge-unpaid" style="font-size: 11px;">Expired</span>`
                : `<span class="badge" style="font-size: 11px; background: rgba(148, 163, 184, 0.2); color: #94a3b8;">Completed</span>`);

            const totalW = p.totalWashes || 5;
            const remW = Math.max(0, p.remainingWashes != null ? p.remainingWashes : 0);
            const usedW = p.usedWashes != null ? p.usedWashes : (totalW - remW);
            const pct = Math.round((remW / totalW) * 100);

            const progressClass = remW <= 1 && remW > 0 ? 'warning' : (remW === 0 ? 'depleted' : '');

            pkgBoxHtml = `
              <div class="vehicle-card-package-box ${isActive ? 'has-active-pkg' : (isExpired ? 'has-expired-pkg' : '')}">
                <div class="vehicle-pkg-header">
                  <div class="vehicle-pkg-name">
                    <span>📦</span>
                    <strong style="color: var(--text-primary); font-size: 13px;">${p.packageName || 'Wash Package'}</strong>
                  </div>
                  ${badgeHtml}
                </div>

                <div class="washes-balance-wrapper">
                  <div class="washes-balance-labels">
                    <span style="font-weight: 600; font-size: 12px; color: var(--text-secondary);">Balance Washes:</span>
                    <span class="washes-balance-count" style="${remW === 0 ? 'color: #94a3b8;' : ''}">${remW} of ${totalW} Left (${usedW} Used)</span>
                  </div>
                  <div class="washes-progress-track">
                    <div class="washes-progress-fill ${progressClass}" style="width: ${pct}%;"></div>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-tertiary); margin-top: 2px;">
                    <span>Expires: <strong style="color: ${isExpired ? '#ef4444' : '#fbbf24'};">${p.expiryDate || 'N/A'}</strong></span>
                    <span>${isActive ? `${remW} washes available` : (isExpired ? 'Expired' : 'All Washes Used')}</span>
                  </div>
                </div>
              </div>
            `;
          } else {
            pkgBoxHtml = `
              <div class="vehicle-card-package-box no-pkg" style="text-align: center; padding: 16px;">
                <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 8px;">No wash package assigned to this vehicle</div>
                <button type="button" class="btn-secondary btn-sm" onclick="GingerApp.openPurchasePackageModal('${cust.id}', '${v.plateNumber}')" style="border-color: #3b82f6; color: #60a5fa; font-size: 11.5px;">
                  + Purchase / Assign Package
                </button>
              </div>
            `;
          }

          return `
            <div class="vehicle-package-card">
              <div class="vehicle-card-top-row">
                <div class="vehicle-card-main-info">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="vehicle-card-plate">${v.plateNumber}</span>
                    <span class="badge" style="background: rgba(255,255,255,0.06); font-size: 11px;">${v.type || 'SUV'}</span>
                  </div>
                  <div class="vehicle-card-model">${v.make} ${v.model} (${v.year || 2024})</div>
                  <div class="vehicle-card-meta">Color: ${v.color || 'Standard'} • VIN: ${v.vin || 'N/A'}</div>
                </div>
              </div>

              <!-- Package Status & Remaining Balance Washes -->
              ${pkgBoxHtml}

              <!-- Vehicle Card Quick Actions -->
              <div class="vehicle-card-actions">
                ${pkgInfo.hasPackage ? `
                  <button type="button" class="btn-secondary btn-sm" title="View wash redemption log" onclick="GingerApp.openVehiclePackageUsageModal('${v.plateNumber}')">
                    👁 View Usage
                  </button>
                ` : ''}
                <button type="button" class="btn-secondary btn-sm" title="Assign or renew wash package" onclick="GingerApp.openPurchasePackageModal('${cust.id}', '${v.plateNumber}')" style="border-color: #3b82f6; color: #60a5fa;">
                  + Assign Package
                </button>
                <button type="button" class="btn-primary btn-sm" title="Create new booking for this vehicle" onclick="GingerApp.openBookingModalForCustomerVehicle('${cust.id}', '${v.plateNumber}')">
                  + Book Wash
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // -------------------------------------------------------------
    // RENDER TAB 2: Package Purchase History
    // -------------------------------------------------------------
    const pkgTbody = document.getElementById('cp-packages-table-body');
    if (pkgTbody) {
      if (custPackages.length === 0) {
        pkgTbody.innerHTML = `
          <tr>
            <td colspan="8">
              <div class="empty-state-box" style="padding: 24px;">
                <div class="empty-state-icon">📦</div>
                <div class="empty-state-title">No package purchase history</div>
                <div class="empty-state-desc">Customer has not purchased any wash packages yet.</div>
                <button type="button" class="btn-primary btn-sm" onclick="GingerApp.openPurchasePackageModal('${cust.id}')">+ Purchase Package</button>
              </div>
            </td>
          </tr>
        `;
      } else {
        pkgTbody.innerHTML = custPackages.map(cp => {
          const isCompleted = cp.status === 'Completed' || cp.remainingWashes <= 0;
          const isExpired = cp.status === 'Expired';
          const isActive = cp.status === 'Active' && !isCompleted && !isExpired;

          const badgeHtml = isActive
            ? `<span class="badge badge-paid">Active</span>`
            : (isExpired ? `<span class="badge badge-unpaid">Expired</span>` : `<span class="badge" style="background: rgba(148, 163, 184, 0.2); color: #94a3b8;">Completed</span>`);

          return `
            <tr>
              <td>
                <div style="font-weight: 700; color: var(--text-primary);">${cp.packageName}</div>
                <div style="font-size: 11px; color: var(--text-tertiary);">${cp.id} • ${cp.validityDuration || ''}</div>
              </td>
              <td>
                <span class="mono-tag" style="color: #60a5fa; font-weight: 700;">${cp.vehiclePlate}</span>
                <div style="font-size: 11px; color: var(--text-tertiary);">${cp.vehicleModel || ''}</div>
              </td>
              <td><span style="font-family: var(--font-mono); font-size: 12px;">${cp.purchaseDate}</span></td>
              <td><span style="font-family: var(--font-mono); font-size: 12px; color: ${isExpired ? '#ef4444' : '#fbbf24'}; font-weight: 600;">${cp.expiryDate}</span></td>
              <td>
                <div style="display: flex; flex-direction: column; gap: 3px;">
                  <strong style="color: ${isActive ? '#10b981' : '#94a3b8'}; font-size: 13px;">${cp.remainingWashes} of ${cp.totalWashes} Washes Left</strong>
                  <span style="font-size: 11px; color: var(--text-tertiary);">${cp.usedWashes || 0} washes redeemed</span>
                </div>
              </td>
              <td>
                <strong style="font-family: var(--font-mono); color: #34d399;">${curr} ${(cp.pricePaid || 0).toLocaleString()}</strong>
              </td>
              <td>${badgeHtml}</td>
              <td>
                <div class="table-actions-cell" style="display: flex; gap: 6px;">
                  <button class="btn-action btn-sm" title="View Wash Redemption Log" onclick="GingerApp.openPackageUsageModal('${cp.id}')">
                    👁 Usage Log
                  </button>
                  ${isActive ? `
                    <button class="btn-action btn-action-primary btn-sm" title="Book Next Wash" onclick="GingerApp.openBookingModalForCustomerVehicle('${cust.id}', '${cp.vehiclePlate}')">
                      ＋ Book Wash
                    </button>
                  ` : ''}
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // -------------------------------------------------------------
    // RENDER TAB 3: Service Booking History
    // -------------------------------------------------------------
    const bkTbody = document.getElementById('cp-bookings-table-body');
    if (bkTbody) {
      if (custBookings.length === 0) {
        bkTbody.innerHTML = `
          <tr>
            <td colspan="9">
              <div class="empty-state-box" style="padding: 24px;">
                <div class="empty-state-icon">🗓</div>
                <div class="empty-state-title">No service bookings recorded</div>
                <div class="empty-state-desc">Create the customer's first service booking.</div>
                <button type="button" class="btn-primary btn-sm" onclick="GingerApp.openBookingModalForCustomer('${cust.id}')">+ Create Booking</button>
              </div>
            </td>
          </tr>
        `;
      } else {
        bkTbody.innerHTML = custBookings.map(b => {
          const isPkgBooking = b.bookingType === 'Package' || (b.serviceName && b.serviceName.toLowerCase().includes('package'));
          return `
            <tr>
              <td>
                <span class="mono-tag" style="color: #60a5fa; font-weight: 700; cursor: pointer;" onclick="GingerApp.openBookingDetailsModal('${b.id}')">${b.id}</span>
              </td>
              <td>
                <div style="font-size: 12px; font-weight: 600;">${b.date}</div>
                <div style="font-size: 11px; color: var(--text-tertiary);">${b.time || ''}</div>
              </td>
              <td>
                <span class="mono-tag">${b.vehiclePlate || 'Multiple'}</span>
              </td>
              <td>
                <div style="font-weight: 600; color: var(--text-primary);">${b.serviceName}</div>
              </td>
              <td>
                <span class="badge" style="${isPkgBooking ? 'background: rgba(59, 130, 246, 0.15); color: #60a5fa;' : 'background: rgba(16, 185, 129, 0.15); color: #10b981;'} font-size: 10.5px;">
                  ${isPkgBooking ? '📦 Package Wash' : '✨ Individual Service'}
                </span>
              </td>
              <td><span style="font-size: 12px;">${b.assignedStaff || 'Technician'}</span></td>
              <td><strong style="font-family: var(--font-mono); color: #34d399;">${curr} ${(b.totalAmount || b.amount || 0).toLocaleString()}</strong></td>
              <td>
                <span class="badge ${WorkflowEngine ? WorkflowEngine.getBadgeClass(b.bookingStatus) : 'badge-paid'}">${b.bookingStatus}</span>
              </td>
              <td>
                <span class="badge ${b.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-unpaid'}">${b.paymentStatus || 'Pending'}</span>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // -------------------------------------------------------------
    // RENDER TAB 4: Payment History
    // -------------------------------------------------------------
    const payTbody = document.getElementById('cp-payments-table-body');
    if (payTbody) {
      if (custInvoices.length === 0) {
        payTbody.innerHTML = `
          <tr>
            <td colspan="7">
              <div class="empty-state-box" style="padding: 24px;">
                <div class="empty-state-icon">💳</div>
                <div class="empty-state-title">No billing invoices found</div>
                <div class="empty-state-desc">Completed bookings and package purchases generate automatic POS receipts.</div>
              </div>
            </td>
          </tr>
        `;
      } else {
        payTbody.innerHTML = custInvoices.map(inv => {
          const itemsDesc = inv.items ? inv.items.map(i => i.name || i.description).join(', ') : (inv.serviceName || 'Carwash Service');
          const amt = inv.total || inv.grandTotal || inv.amount || 0;
          return `
            <tr>
              <td><span class="mono-tag" style="color: #60a5fa; font-weight: 700;">${inv.id}</span></td>
              <td><span style="font-family: var(--font-mono); font-size: 12px;">${inv.date}</span></td>
              <td>
                <div style="font-weight: 600; color: var(--text-primary); max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${itemsDesc}
                </div>
              </td>
              <td><strong style="font-family: var(--font-mono); color: #34d399;">${curr} ${amt.toLocaleString()}</strong></td>
              <td><span class="badge" style="background: rgba(255,255,255,0.06); font-size: 11px;">${inv.paymentMethod || 'POS Credit Card'}</span></td>
              <td><span class="badge badge-paid">${inv.status || 'Paid'}</span></td>
              <td>
                <button type="button" class="btn-action btn-sm" onclick="InvoiceEngine.openPosModal('${inv.id}')">
                  🖨 View POS
                </button>
              </td>
            </tr>
          `;
        }).join('');
      }
    }
  },

  // Vehicle Package Status Resolver (Requirement: Track Status, Expiry, Washes)
  getVehiclePackageStatus: function (plateNumber) {
    if (!plateNumber) return { hasPackage: false };

    const today = new Date().toISOString().split('T')[0];
    const pkgs = (this.data.customerPackages || []).filter(cp => cp.vehiclePlate === plateNumber);
    if (pkgs.length === 0) return { hasPackage: false };

    // 1. Look for active package first
    const active = pkgs.find(cp => cp.status === 'Active' && cp.remainingWashes > 0 && cp.expiryDate >= today);
    if (active) {
      return {
        hasPackage: true,
        packageRecord: active,
        status: 'Active',
        packageName: active.packageName,
        remainingWashes: active.remainingWashes,
        totalWashes: active.totalWashes,
        expiryDate: active.expiryDate,
        purchaseDate: active.purchaseDate
      };
    }

    // 2. Look for expired package
    const expired = pkgs.find(cp => cp.expiryDate < today && cp.remainingWashes > 0);
    if (expired) {
      return {
        hasPackage: true,
        packageRecord: expired,
        status: 'Expired',
        packageName: expired.packageName,
        remainingWashes: expired.remainingWashes,
        totalWashes: expired.totalWashes,
        expiryDate: expired.expiryDate,
        purchaseDate: expired.purchaseDate
      };
    }

    // 3. Completed (washes depleted)
    const latest = pkgs[0];
    return {
      hasPackage: true,
      packageRecord: latest,
      status: latest.status || 'Completed',
      packageName: latest.packageName,
      remainingWashes: latest.remainingWashes || 0,
      totalWashes: latest.totalWashes,
      expiryDate: latest.expiryDate,
      purchaseDate: latest.purchaseDate
    };
  },

  // Open Purchase Package Modal (Requirement: Automatically track Purchase Date, Expiry Date, Remaining Washes)
  openPurchasePackageModal: function (custId, vehiclePlate, pkgId) {
    const custSelect = document.getElementById('pp-customer-select');
    const vehSelect = document.getElementById('pp-vehicle-select');
    const pkgSelect = document.getElementById('pp-package-select');
    const purchaseDateInput = document.getElementById('pp-purchase-date');

    if (!custSelect || !vehSelect || !pkgSelect) return;

    // Populate Customer Dropdown
    custSelect.innerHTML = this.data.customers.map(c => `
      <option value="${c.id}" ${c.id === custId ? 'selected' : ''}>${c.name} (${c.phone || c.id})</option>
    `).join('');

    if (custId) custSelect.value = custId;

    // Populate Vehicle Dropdown
    this.onPurchaseCustomerChange(vehiclePlate);

    // Populate Packages Dropdown
    pkgSelect.innerHTML = this.data.packages.filter(p => p.status === 'Active').map(p => `
      <option value="${p.id}" ${p.id === pkgId ? 'selected' : ''}>${p.name} - ${this.data.settings.currency} ${p.packagePrice.toLocaleString()} (${p.totalWashes || 5} Washes)</option>
    `).join('');

    if (pkgId) pkgSelect.value = pkgId;

    // Set Default Purchase Date = Today
    const today = new Date().toISOString().split('T')[0];
    purchaseDateInput.value = today;

    // Recalculate package fields
    this.onPurchasePackageSelectChange();

    this.openModal('purchase-package-modal');
  },

  onPurchaseCustomerChange: function (preferredPlate) {
    const custId = document.getElementById('pp-customer-select').value;
    const vehSelect = document.getElementById('pp-vehicle-select');
    if (!vehSelect) return;

    const cust = this.data.customers.find(c => c.id === custId);
    const vehicles = this.data.vehicles.filter(v =>
      v.customerId === custId || (cust && cust.vehicles && cust.vehicles.includes(v.plateNumber))
    );

    if (vehicles.length === 0) {
      vehSelect.innerHTML = `<option value="">No vehicles found for customer</option>`;
      return;
    }

    vehSelect.innerHTML = vehicles.map(v => `
      <option value="${v.plateNumber}" ${v.plateNumber === preferredPlate ? 'selected' : ''}>
        ${v.plateNumber} – ${v.make} ${v.model} (${v.type})
      </option>
    `).join('');
  },

  onPurchasePackageSelectChange: function () {
    const pkgSelect = document.getElementById('pp-package-select');
    const validityInput = document.getElementById('pp-validity-duration');
    const washesInput = document.getElementById('pp-total-washes');
    const priceInput = document.getElementById('pp-price-paid');
    const summaryWashes = document.getElementById('pp-summary-washes');

    if (!pkgSelect || !pkgSelect.value) return;

    const pkg = this.data.packages.find(p => p.id === pkgSelect.value);
    if (!pkg) return;

    const validityDuration = pkg.validityDuration || (pkg.validityDays ? `${pkg.validityDays} Days` : '90 Days');
    const washes = pkg.totalWashes || 5;
    const price = pkg.packagePrice || pkg.finalPrice || pkg.regularPrice || 0;

    if (validityInput) validityInput.value = validityDuration;
    if (washesInput) washesInput.value = washes;
    if (priceInput) priceInput.value = price;
    if (summaryWashes) summaryWashes.textContent = washes;

    this.recalcPurchaseExpiry();
  },

  recalcPurchaseExpiry: function () {
    const purchaseDateVal = document.getElementById('pp-purchase-date').value;
    const pkgSelect = document.getElementById('pp-package-select');
    const expiryDateInput = document.getElementById('pp-expiry-date');
    const summaryExpiry = document.getElementById('pp-summary-expiry');

    if (!purchaseDateVal) return;

    let validityDays = 90;
    if (pkgSelect && pkgSelect.value) {
      const pkg = this.data.packages.find(p => p.id === pkgSelect.value);
      if (pkg) {
        validityDays = pkg.validityDays || 90;
      }
    }

    const pDate = new Date(purchaseDateVal);
    const expiryDate = new Date(pDate.getTime() + validityDays * 24 * 60 * 60 * 1000);
    const expiryStr = expiryDate.toISOString().split('T')[0];

    if (expiryDateInput) expiryDateInput.value = expiryStr;
    if (summaryExpiry) summaryExpiry.textContent = expiryStr;
  },

  savePackagePurchase: function (e) {
    if (e) e.preventDefault();

    const custId = document.getElementById('pp-customer-select').value;
    const vehiclePlate = document.getElementById('pp-vehicle-select').value;
    const pkgId = document.getElementById('pp-package-select').value;
    const purchaseDate = document.getElementById('pp-purchase-date').value;
    const expiryDate = document.getElementById('pp-expiry-date').value;
    const totalWashes = parseInt(document.getElementById('pp-total-washes').value) || 5;
    const pricePaid = parseFloat(document.getElementById('pp-price-paid').value) || 0;
    const paymentMethod = document.getElementById('pp-payment-method').value;

    if (!custId || !vehiclePlate || !pkgId) {
      this.showToast("Please fill all required package purchase fields.", "error");
      return;
    }

    const cust = this.data.customers.find(c => c.id === custId);
    const pkg = this.data.packages.find(p => p.id === pkgId);
    const veh = this.data.vehicles.find(v => v.plateNumber === vehiclePlate) || { model: vehiclePlate };

    if (!cust || !pkg) return;

    if (!this.data.customerPackages) this.data.customerPackages = [];

    const newPackageRecord = {
      id: `CPKG-${100 + this.data.customerPackages.length + 1}`,
      customerId: cust.id,
      customerName: cust.name,
      packageId: pkg.id,
      packageName: pkg.name,
      vehiclePlate: vehiclePlate,
      vehicleModel: `${veh.make || ''} ${veh.model || ''}`.trim(),
      purchaseDate: purchaseDate,
      validityDays: pkg.validityDays || 90,
      validityDuration: pkg.validityDuration || `${pkg.validityDays || 90} Days`,
      expiryDate: expiryDate,
      totalWashes: totalWashes,
      usedWashes: 0,
      remainingWashes: totalWashes,
      pricePaid: pricePaid,
      paymentMethod: paymentMethod,
      status: "Active",
      usageHistory: []
    };

    this.data.customerPackages.unshift(newPackageRecord);

    // Update customer spend
    cust.totalSpend = (cust.totalSpend || 0) + pricePaid;

    // Create POS billing record
    const invoiceId = `INV-2026-${500 + (this.data.invoices ? this.data.invoices.length : 1)}`;
    if (this.data.invoices) {
      this.data.invoices.unshift({
        id: invoiceId,
        date: purchaseDate,
        customerId: cust.id,
        customerName: cust.name,
        vehiclePlate: vehiclePlate,
        items: [{ name: `Package: ${pkg.name} (${totalWashes} Washes)`, qty: 1, unitPrice: pricePaid, total: pricePaid }],
        subtotal: pricePaid,
        tax: 0,
        total: pricePaid,
        amount: pricePaid,
        grandTotal: pricePaid,
        paymentMethod: paymentMethod,
        status: "Paid"
      });
    }

    this.saveState();
    this.closeModal('purchase-package-modal');
    this.showToast(`Package "${pkg.name}" assigned to ${vehiclePlate} with ${totalWashes} balance washes!`, 'success');

    // Re-render current page
    if (this.currentModule === 'customer-profile') {
      this.renderCustomerProfilePage(cust.id);
    } else if (this.currentModule === 'packages') {
      this.renderPackagesTable();
    }
  },

  // Open Package Usage History Log Modal (Requirement)
  openPackageUsageModal: function (packageRecordId) {
    const cp = (this.data.customerPackages || []).find(p => p.id === packageRecordId);
    if (!cp) return;

    document.getElementById('pu-pkg-name').textContent = cp.packageName;
    document.getElementById('pu-cust-name').textContent = cp.customerName;
    document.getElementById('pu-vehicle-plate').textContent = cp.vehiclePlate;
    document.getElementById('pu-expiry-date').textContent = cp.expiryDate;
    document.getElementById('pu-purchase-date').textContent = cp.purchaseDate;

    const statusBadge = document.getElementById('pu-status-badge');
    if (statusBadge) {
      statusBadge.textContent = cp.status;
      statusBadge.className = `mono-tag ${cp.status === 'Active' ? 'badge-paid' : (cp.status === 'Expired' ? 'badge-unpaid' : '')}`;
    }

    const totalW = cp.totalWashes || 5;
    const remW = cp.remainingWashes != null ? cp.remainingWashes : 0;
    const usedW = cp.usedWashes != null ? cp.usedWashes : (totalW - remW);
    const pct = Math.round((remW / totalW) * 100);

    document.getElementById('pu-washes-count').textContent = `${remW} of ${totalW} Washes Left (${usedW} Used)`;
    const progressFill = document.getElementById('pu-progress-fill');
    if (progressFill) {
      progressFill.style.width = `${pct}%`;
      progressFill.className = `washes-progress-fill ${remW <= 1 && remW > 0 ? 'warning' : (remW === 0 ? 'depleted' : '')}`;
    }

    const daysLeftLabel = document.getElementById('pu-days-left-label');
    if (daysLeftLabel) {
      const today = new Date();
      const exp = new Date(cp.expiryDate);
      const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        daysLeftLabel.textContent = `${diffDays} days remaining`;
      } else {
        daysLeftLabel.textContent = 'Expired';
      }
    }

    const tbody = document.getElementById('pu-usage-tbody');
    const usageList = cp.usageHistory || [];
    document.getElementById('pu-usage-count').textContent = `${usageList.length} wash redemptions recorded`;

    if (tbody) {
      if (usageList.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align: center; color: var(--text-tertiary); padding: 18px;">
              No washes redeemed yet. Full ${remW} washes available!
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = usageList.map(u => `
          <tr>
            <td><span style="font-family: var(--font-mono); font-size: 12px;">${u.date}</span></td>
            <td><span class="mono-tag" style="color: #60a5fa;">${u.bookingId}</span></td>
            <td><strong>${u.serviceName}</strong></td>
            <td><span style="font-size: 12px;">${u.staff || 'Specialist Detailer'}</span></td>
          </tr>
        `).join('');
      }
    }

    const bookBtn = document.getElementById('pu-btn-book-wash');
    if (bookBtn) {
      bookBtn.onclick = () => {
        this.closeModal('package-usage-modal');
        this.openBookingModalForCustomerVehicle(cp.customerId, cp.vehiclePlate);
      };
    }

    this.openModal('package-usage-modal');
  },

  openVehiclePackageUsageModal: function (plateNumber) {
    const pkgs = (this.data.customerPackages || []).filter(cp => cp.vehiclePlate === plateNumber);
    if (pkgs.length > 0) {
      this.openPackageUsageModal(pkgs[0].id);
    } else {
      this.showToast(`No package found for vehicle ${plateNumber}`, 'info');
    }
  },

  // Open booking modal pre-filled with customer and vehicle
  openBookingModalForCustomerVehicle: function (custId, vehiclePlate) {
    this.openModal('add-booking-modal');
    if (custId) {
      const custSelect = document.getElementById('form-booking-customer');
      if (custSelect) {
        custSelect.value = custId;
        this.onBookingCustomerChange(custId);
      }
    }
    if (vehiclePlate) {
      setTimeout(() => {
        const vehCheck = document.querySelector(`.booking-veh-check[value="${vehiclePlate}"]`);
        if (vehCheck && !vehCheck.checked) {
          vehCheck.checked = true;
          this.toggleBookingVehicle(vehiclePlate, true);
        }
      }, 60);
    }
  },

  openBookingModalForCustomer: function (custId) {
    const id = custId || this.activeProfileCustomerId;
    this.openBookingModalForCustomerVehicle(id, '');
  },

  switchCustomerProfileTab: function (tabName) {
    const btnVeh = document.getElementById('cust-tab-btn-vehicles');
    const btnHist = document.getElementById('cust-tab-btn-history');
    const btnInv = document.getElementById('cust-tab-btn-invoices');

    const paneVeh = document.getElementById('cust-tab-pane-vehicles');
    const paneHist = document.getElementById('cust-tab-pane-history');
    const paneInv = document.getElementById('cust-tab-pane-invoices');

    if (btnVeh) btnVeh.classList.toggle('active', tabName === 'vehicles');
    if (btnHist) btnHist.classList.toggle('active', tabName === 'history');
    if (btnInv) btnInv.classList.toggle('active', tabName === 'invoices');

    if (paneVeh) paneVeh.style.display = tabName === 'vehicles' ? 'block' : 'none';
    if (paneHist) paneHist.style.display = tabName === 'history' ? 'block' : 'none';
    if (paneInv) paneInv.style.display = tabName === 'invoices' ? 'block' : 'none';
  },

  // Tab 1: Render Customer's Dedicated Vehicles Table (Requirement 4)
  renderCustomerVehiclesTab: function (cust) {
    const tbody = document.getElementById('cust-vehicles-table-body');
    const countBadge = document.getElementById('cust-profile-vehicles-count');
    if (!tbody) return;

    // Find all vehicles belonging to this customer
    const vehicles = this.data.vehicles.filter(v =>
      v.customerId === cust.id || (cust.vehicles && cust.vehicles.includes(v.plateNumber))
    );

    if (countBadge) countBadge.textContent = vehicles.length;

    if (vehicles.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8">
            <div class="empty-state-box" style="padding: 24px;">
              <div class="empty-state-icon">🚗</div>
              <div class="empty-state-title">No vehicles registered for this customer</div>
              <div class="empty-state-desc">Click "+ Add Vehicle" above to link a vehicle to ${cust.name}.</div>
              <button type="button" class="btn-primary btn-sm" onclick="GingerApp.openAddVehicleForCustomer()">+ Add Vehicle</button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = vehicles.map(v => {
      const totalServices = v.totalServices || (v.serviceHistory ? v.serviceHistory.length : 0);
      return `
        <tr>
          <td>
            <span class="mono-tag" style="color: #60a5fa; cursor: pointer; font-weight: 700;" onclick="GingerApp.openVehicleDetails('${v.plateNumber}')">
              ${v.plateNumber}
            </span>
          </td>
          <td><strong>${v.make}</strong></td>
          <td>${v.model}</td>
          <td>${v.year}</td>
          <td><span class="badge" style="background: rgba(255,255,255,0.06);">${v.type}</span></td>
          <td>${v.lastService || 'None'}</td>
          <td><strong style="font-family: var(--font-mono);">${totalServices} washes</strong></td>
          <td>
            <div class="table-actions-cell" style="display: flex; align-items: center; gap: 4px;">
              <button class="btn-action btn-sm" title="View Vehicle Details & Dedicated Service History" onclick="GingerApp.openVehicleDetails('${v.plateNumber}')">
                👁 History
              </button>
              <button class="btn-action btn-action-primary btn-sm" title="Book Wash for this Vehicle" onclick="GingerApp.openAddBookingForVehicle('${v.plateNumber}', '${cust.id}')">
                ＋ Book
              </button>
              <button class="btn-action btn-sm" title="Edit Vehicle" onclick="GingerApp.openEditVehicleModal('${v.plateNumber}')">
                ✏ Edit
              </button>
              <button class="btn-action btn-action-danger btn-sm" title="Delete Vehicle" onclick="GingerApp.deleteVehicle('${v.plateNumber}')">
                🗑 Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // Tab 2: Render Customer Service History with Vehicle Clearly Indicated (Requirement 8)
  renderCustomerServiceHistoryTab: function (cust) {
    const tbody = document.getElementById('cust-history-table-body');
    const countBadge = document.getElementById('cust-profile-history-count');
    if (!tbody) return;

    const bookings = this.data.bookings.filter(b => b.customerId === cust.id);
    if (countBadge) countBadge.textContent = bookings.length;

    if (bookings.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state-box" style="padding: 24px;">
              <div class="empty-state-icon">📋</div>
              <div class="empty-state-title">No service bookings found for this customer</div>
              <div class="empty-state-desc">Service bookings created for this customer will appear here with the specific vehicle serviced.</div>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = bookings.map(b => `
      <tr>
        <td><strong>${b.date}</strong><div style="font-size: 11px; color: var(--text-tertiary);">${b.time}</div></td>
        <td>
          <div style="display: flex; flex-direction: column;">
            <span class="mono-tag" style="color: #60a5fa; cursor: pointer; display: inline-block; width: fit-content;" onclick="GingerApp.closeModal('customer-profile-modal'); GingerApp.openVehicleDetails('${b.vehiclePlate}')">
              ${b.vehiclePlate}
            </span>
            <span style="font-size: 12px; font-weight: 600; color: var(--text-primary); margin-top: 2px;">
              ${b.vehicleModel}
            </span>
          </div>
        </td>
        <td>
          <div class="table-primary-text">${b.bookingType === 'Package' ? '★ ' : ''}${b.serviceName}</div>
          <div class="table-secondary-text">${b.bookingType === 'Package' ? 'Package Bundle' : 'Single Service'}</div>
        </td>
        <td><strong style="font-family: var(--font-mono); color: #34d399;">${this.data.settings.currency} ${Number(b.totalAmount).toLocaleString()}</strong></td>
        <td>${b.assignedStaff}</td>
        <td><span class="badge ${WorkflowEngine.getBadgeClass(b.bookingStatus)}">${b.bookingStatus}</span></td>
        <td>
          <div class="table-actions-cell" style="display: flex; align-items: center; gap: 4px;">
            <button class="btn-action btn-sm" title="View Booking Details & Timeline" onclick="GingerApp.closeModal('customer-profile-modal'); WorkflowEngine.openBookingDetails('${b.id}')">
              👁 View
            </button>
            <button class="btn-action btn-sm" title="View Printable Invoice" onclick="InvoiceEngine.renderModal('${b.id.replace('BK-2026-00', 'INV-2026-00')}')">
              📄 Invoice
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  // Tab 3: Render Customer Invoices
  renderCustomerInvoicesTab: function (cust) {
    const tbody = document.getElementById('cust-invoices-table-body');
    const countBadge = document.getElementById('cust-profile-invoices-count');
    if (!tbody) return;

    const invoices = this.data.invoices.filter(i => i.customerId === cust.id);
    if (countBadge) countBadge.textContent = invoices.length;

    if (invoices.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state-box" style="padding: 24px;">
              <div class="empty-state-icon">📄</div>
              <div class="empty-state-title">No invoices issued for this customer</div>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = invoices.map(inv => `
      <tr>
        <td>
          <span class="mono-tag" style="color: #34d399; cursor: pointer;" onclick="InvoiceEngine.renderModal('${inv.invoiceNumber}')">
            ${inv.invoiceNumber}
          </span>
        </td>
        <td>${inv.date}</td>
        <td><span class="mono-tag">${inv.vehiclePlate}</span></td>
        <td>${inv.serviceName}</td>
        <td><strong style="font-family: var(--font-mono);">${this.data.settings.currency} ${inv.totalAmount.toLocaleString()}</strong></td>
        <td><span class="badge ${InvoiceEngine.getStatusBadgeClass(inv.invoiceStatus || inv.paymentStatus)}">${inv.invoiceStatus || inv.paymentStatus}</span></td>
        <td>
          <button class="btn-action btn-sm" onclick="InvoiceEngine.renderModal('${inv.invoiceNumber}')">
            👁 View Invoice
          </button>
        </td>
      </tr>
    `).join('');
  },

  // Open Customer modal to add/manage vehicles for the active customer profile
  openAddVehicleForCustomer: function () {
    if (!this.activeProfileCustomerId) return;
    this.openEditCustomerModal(this.activeProfileCustomerId);
  },

  openAddVehicleForSpecificCustomer: function (custId) {
    this.openEditCustomerModal(custId);
  },

  openAddBookingForCustomer: function (custId) {
    this.closeModal('customer-profile-modal');
    this.populateBookingCustomerDropdown();
    const custSelect = document.getElementById('form-booking-customer');
    if (custSelect) {
      custSelect.value = custId;
      this.onBookingCustomerChange(custId);
    }
    this.openModal('add-booking-modal');
  },

  // =========================================================================
  // VEHICLE MASTER MODULE (INDEPENDENT OF CUSTOMERS)
  // =========================================================================
  renderVehiclesTable: function () {
    const tbody = document.getElementById('vehicles-table-body');
    if (!tbody) return;

    const search = (this.filters.vehicles.search || '').toLowerCase();
    const typeFilter = this.filters.vehicles.type || 'all';

    const vmList = this.data.vehicleMaster || [];

    const filtered = vmList.filter(vm => {
      const matchSearch = !search ||
        (vm.make || '').toLowerCase().includes(search) ||
        (vm.model || '').toLowerCase().includes(search) ||
        (vm.type || '').toLowerCase().includes(search);
      const matchType = typeFilter === 'all' || (vm.type || '').toLowerCase() === typeFilter.toLowerCase();
      return matchSearch && matchType;
    });

    tbody.innerHTML = filtered.map(vm => {
      const inFleetCount = (this.data.vehicles || []).filter(v =>
        v.make && v.make.toLowerCase() === vm.make.toLowerCase() &&
        v.model && v.model.toLowerCase() === vm.model.toLowerCase()
      ).length;

      return `
        <tr>
          <td><span class="mono-tag" style="color: #60a5fa; font-weight: 700;">${vm.id}</span></td>
          <td>
            <div class="table-primary-text" style="font-weight: 600;">${vm.make}</div>
          </td>
          <td>
            <div class="table-primary-text" style="font-weight: 600;">${vm.model}</div>
          </td>
          <td>
            <span class="badge" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; font-weight: 600;">${vm.type}</span>
          </td>
          <td>
            <span style="font-family: var(--font-mono); font-size: 12.5px; color: var(--text-secondary);">${inFleetCount} in fleet</span>
          </td>
          <td>
            <div class="table-actions-cell" style="display: flex; align-items: center; gap: 6px;">
              <button class="btn-action btn-sm" onclick="GingerApp.openVehicleMasterModal('${vm.id}')">
                ✏ Edit
              </button>
              <button class="btn-action btn-action-danger btn-sm" onclick="GingerApp.deleteVehicleMaster('${vm.id}')">
                🗑 Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    const countLabel = document.getElementById('vehicles-count-label');
    if (countLabel) {
      countLabel.textContent = `Showing ${filtered.length} of ${vmList.length} models in Vehicle Master`;
    }
  },

  openVehicleMasterModal: function (vmId) {
    const titleEl = document.getElementById('form-vm-modal-title');
    const idInput = document.getElementById('vm-id-hidden');
    const makeInput = document.getElementById('vm-make-input');
    const modelInput = document.getElementById('vm-model-input');
    const typeSelect = document.getElementById('vm-type-select');

    if (vmId) {
      const vm = (this.data.vehicleMaster || []).find(m => m.id === vmId);
      if (vm) {
        if (titleEl) titleEl.textContent = `Edit Vehicle Master: ${vm.make} ${vm.model}`;
        if (idInput) idInput.value = vm.id;
        if (makeInput) makeInput.value = vm.make;
        if (modelInput) modelInput.value = vm.model;
        if (typeSelect) typeSelect.value = vm.type;
      }
    } else {
      if (titleEl) titleEl.textContent = "Add Vehicle to Master";
      if (idInput) idInput.value = "";
      if (makeInput) makeInput.value = "";
      if (modelInput) modelInput.value = "";
      if (typeSelect) typeSelect.value = "SUV";
    }

    this.openModal('vehicle-master-modal');
  },

  openCreateVehicleModal: function () {
    this.openVehicleMasterModal();
  },

  openEditVehicleModal: function (plate) {
    const v = this.data.vehicles.find(item => item.plateNumber === plate);
    if (v) {
      const vm = (this.data.vehicleMaster || []).find(m => m.make.toLowerCase() === v.make.toLowerCase() && m.model.toLowerCase() === v.model.toLowerCase());
      if (vm) {
        this.openVehicleMasterModal(vm.id);
        return;
      }
    }
    this.openVehicleMasterModal();
  },

  saveVehicleMaster: function (e) {
    if (e) e.preventDefault();
    const id = document.getElementById('vm-id-hidden')?.value;
    const make = document.getElementById('vm-make-input')?.value.trim();
    const model = document.getElementById('vm-model-input')?.value.trim();
    const type = document.getElementById('vm-type-select')?.value || 'SUV';

    if (!make || !model) {
      this.showToast('Vehicle make and model are required', 'error');
      return;
    }

    if (!this.data.vehicleMaster) this.data.vehicleMaster = [];

    if (id) {
      const vm = this.data.vehicleMaster.find(m => m.id === id);
      if (vm) {
        vm.make = make;
        vm.model = model;
        vm.type = type;
        this.showToast(`Vehicle Master ${make} ${model} updated!`, 'success');
      }
    } else {
      const newId = `VM-${String(this.data.vehicleMaster.length + 1).padStart(2, '0')}`;
      this.data.vehicleMaster.push({
        id: newId,
        make: make,
        model: model,
        type: type
      });
      this.showToast(`Added ${make} ${model} (${type}) to Vehicle Master!`, 'success');
    }

    this.saveState();
    this.closeModal('vehicle-master-modal');
    this.renderVehiclesTable();
  },

  deleteVehicleMaster: function (id) {
    const vm = (this.data.vehicleMaster || []).find(m => m.id === id);
    if (!vm) return;

    this.confirmAction({
      title: "Delete from Vehicle Master",
      message: `Are you sure you want to remove ${vm.make} ${vm.model} from the Vehicle Master catalog?`,
      confirmText: "Delete",
      isDanger: true,
      onConfirm: () => {
        this.data.vehicleMaster = this.data.vehicleMaster.filter(m => m.id !== id);
        this.saveState();
        this.showToast(`${vm.make} ${vm.model} removed from Vehicle Master`, 'warning');
        this.renderVehiclesTable();
      }
    });
  },

  // Save vehicle with automatic customer linkage and instant refresh (Requirement 5)
  saveVehicle: function (e) {
    if (e) e.preventDefault();
    const plate = document.getElementById('veh-plate-input').value.trim().toUpperCase();
    if (!plate) {
      this.showToast('Vehicle registration number is required', 'error');
      return;
    }

    const existingPlate = document.getElementById('veh-plate-hidden').value;
    const custId = document.getElementById('veh-owner-select').value;
    const customer = this.data.customers.find(c => c.id === custId) || { name: "Ahmed Al Mansoori", id: custId };
    const make = document.getElementById('veh-make-input').value.trim() || "Toyota";
    const model = document.getElementById('veh-model-input').value.trim() || "Land Cruiser";
    const year = parseInt(document.getElementById('veh-year-input').value, 10) || 2024;
    const vType = document.getElementById('veh-type-select').value;
    const color = document.getElementById('veh-color-input').value.trim() || "Black Metallic";
    const vin = document.getElementById('veh-vin-input').value.trim() || "GCS-VIN-482019";
    const notes = document.getElementById('veh-condition-input').value.trim();

    if (existingPlate) {
      const v = this.data.vehicles.find(item => item.plateNumber === existingPlate);
      if (v) {
        v.plateNumber = plate;
        v.customerId = custId;
        v.customerName = customer.name;
        v.make = make;
        v.model = model;
        v.year = year;
        v.type = vType;
        v.color = color;
        v.vin = vin;
        v.conditionNotes = notes;
      }
      this.showToast(`Vehicle ${plate} updated!`, 'success');
    } else {
      const newVeh = {
        plateNumber: plate,
        customerId: custId,
        customerName: customer.name,
        make: make,
        model: model,
        year: year,
        type: vType,
        color: color,
        vin: vin,
        lastService: "None",
        totalServices: 0,
        status: "Completed",
        conditionNotes: notes,
        beforePhoto: "assets/images/vehicle_before.jpg",
        afterPhoto: "assets/images/vehicle_after.jpg",
        serviceHistory: []
      };
      this.data.vehicles.unshift(newVeh);

      // Link to customer's vehicles list
      if (!customer.vehicles) customer.vehicles = [];
      if (!customer.vehicles.includes(plate)) {
        customer.vehicles.push(plate);
      }

      this.showToast(`Vehicle ${plate} registered for ${customer.name}!`, 'success');
    }

    this.saveState();
    this.closeModal('vehicle-form-modal');
    this.renderVehiclesTable();
    this.renderCustomersTable();
    this.populateBookingCustomerDropdown();

    // If customer profile is open, immediately update Customer -> Vehicles tab (Requirement 5)
    if (this.activeProfileCustomerId) {
      const activeCust = this.data.customers.find(c => c.id === this.activeProfileCustomerId);
      if (activeCust) {
        this.renderCustomerVehiclesTab(activeCust);
      }
    }

    // If initiated from booking form, update customer vehicles list, automatically check and select newly added vehicle (Requirement 2)
    if (this.returnToBookingCustId) {
      const targetCustId = this.returnToBookingCustId;
      this.returnToBookingCustId = null;
      this.onBookingCustomerChange(targetCustId);

      // Auto-check and make selectable in booking form
      if (!this.bookingSelectedVehicles.includes(plate)) {
        this.bookingSelectedVehicles.push(plate);
      }
      const safePlateId = plate.replace(/\s+/g, '-');
      const cardEl = document.getElementById(`veh-card-${safePlateId}`);
      if (cardEl) cardEl.classList.add('selected');
      const chk = document.getElementById(`veh-chk-${safePlateId}`);
      if (chk) chk.checked = true;

      const defaultKey = (this.data.packages && this.data.packages.length > 0)
        ? `pkg:${this.data.packages[0].id}`
        : `srv:${this.data.services[0].id}`;
      this.bookingVehicleConfigs[plate] = {
        serviceKey: defaultKey,
        addons: []
      };

      this.renderBookingVehicleServicesConfig();
      this.recalculateBookingForm();
      this.openModal('add-booking-modal');
      this.showToast(`Vehicle ${plate} linked and selected for booking!`, 'success');
    }
  },

  deleteVehicle: function (plate) {
    this.confirmAction({
      title: "Delete Vehicle",
      message: `Are you sure you want to remove vehicle ${plate} from the fleet registry?`,
      confirmText: "Delete",
      isDanger: true,
      onConfirm: () => {
        const v = this.data.vehicles.find(item => item.plateNumber === plate);
        if (v && v.customerId) {
          const c = this.data.customers.find(item => item.id === v.customerId);
          if (c && c.vehicles) {
            c.vehicles = c.vehicles.filter(p => p !== plate);
          }
        }

        this.data.vehicles = this.data.vehicles.filter(item => item.plateNumber !== plate);
        this.saveState();
        this.showToast(`Vehicle ${plate} removed`, 'warning');
        this.renderVehiclesTable();
        this.renderCustomersTable();

        if (this.activeProfileCustomerId) {
          const activeCust = this.data.customers.find(c => c.id === this.activeProfileCustomerId);
          if (activeCust) {
            this.renderCustomerVehiclesTab(activeCust);
          }
        }
      }
    });
  },

  // Open Vehicle Details & Dedicated Service History (Requirement 7)
  openVehicleDetails: function (plateNumber) {
    const v = this.data.vehicles.find(item => item.plateNumber === plateNumber);
    if (!v) return;

    this.activeVehiclePlate = v.plateNumber;

    document.getElementById('vd-plate').textContent = v.plateNumber;
    document.getElementById('vd-title').textContent = `${v.make} ${v.model} (${v.year})`;
    document.getElementById('vd-owner').textContent = v.customerName;
    document.getElementById('vd-vin').textContent = v.vin || "JTMBR05J8P4019283";
    document.getElementById('vd-type').textContent = v.type;
    document.getElementById('vd-color').textContent = v.color;
    document.getElementById('vd-year').textContent = v.year;
    document.getElementById('vd-total-services').textContent = v.totalServices || (v.serviceHistory ? v.serviceHistory.length : 0);
    document.getElementById('vd-condition').textContent = v.conditionNotes || "Standard condition. No major body damage.";

    // Wire buttons in modal
    const editBtn = document.getElementById('vd-btn-edit');
    if (editBtn) editBtn.onclick = () => this.openEditVehicleModal(v.plateNumber);

    const bookBtn = document.getElementById('vd-btn-book');
    if (bookBtn) bookBtn.onclick = () => this.openAddBookingForVehicle(v.plateNumber, v.customerId);

    // Photos
    const beforePhoto = document.getElementById('vd-photo-before');
    const afterPhoto = document.getElementById('vd-photo-after');
    if (beforePhoto) beforePhoto.src = v.beforePhoto || 'assets/images/vehicle_before.jpg';
    if (afterPhoto) afterPhoto.src = v.afterPhoto || 'assets/images/vehicle_after.jpg';

    // Render Dedicated Vehicle Service History Table (Requirement 7)
    const historyTbody = document.getElementById('vd-history-table-body');
    if (historyTbody) {
      // Collect vehicle-specific history entries (from v.serviceHistory or bookings matching this plate)
      // Collect vehicle-specific history entries (from v.serviceHistory or bookings matching this plate)
      const vehicleHistory = (v.serviceHistory && v.serviceHistory.length > 0)
        ? v.serviceHistory
        : this.data.bookings.filter(b => (b.vehiclePlate && b.vehiclePlate.includes(v.plateNumber)) || (b.vehicleServices && b.vehicleServices.some(vs => vs.vehiclePlate === v.plateNumber))).map(b => {
          const vsItem = b.vehicleServices ? b.vehicleServices.find(vs => vs.vehiclePlate === v.plateNumber) : null;
          return {
            date: b.date,
            service: vsItem ? vsItem.serviceName : b.serviceName,
            amount: vsItem ? (vsItem.vehicleTotal || vsItem.finalPrice) : b.totalAmount,
            staff: b.assignedStaff,
            status: b.bookingStatus,
            bookingId: b.id
          };
        });

      if (vehicleHistory.length === 0) {
        historyTbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; color: var(--text-tertiary); padding: 18px;">
              No service records found for vehicle <strong>${v.plateNumber}</strong> yet.
            </td>
          </tr>
        `;
      } else {
        historyTbody.innerHTML = vehicleHistory.map(h => `
          <tr>
            <td><strong>${h.date}</strong></td>
            <td>
              <span style="font-weight: 600; color: var(--text-primary);">${h.service}</span>
            </td>
            <td><strong style="font-family: var(--font-mono); color: #34d399;">${this.data.settings.currency} ${Number(h.amount).toLocaleString()}</strong></td>
            <td>${h.staff || 'Tariq Mansoor'}</td>
            <td><span class="badge ${WorkflowEngine.getBadgeClass(h.status)}">${h.status}</span></td>
            <td>
              <div class="table-actions-cell" style="display: flex; align-items: center; gap: 4px;">
                <button class="btn-action btn-sm" title="View Booking Details" onclick="GingerApp.closeModal('vehicle-details-modal'); WorkflowEngine.openBookingDetails('${h.bookingId || ''}')">
                  👁 View
                </button>
                <button class="btn-action btn-sm" title="Print Invoice" onclick="InvoiceEngine.renderModal('${(h.bookingId || '').replace('BK-2026-00', 'INV-2026-00')}')">
                  📄 Invoice
                </button>
              </div>
            </td>
          </tr>
        `).join('');
      }
    }

    this.openModal('vehicle-details-modal');
  },

  // Open booking modal with specific vehicle and owner pre-selected (Requirement 6 & 16)
  openAddBookingForVehicle: function (plateNumber, custId) {
    this.closeModal('vehicle-details-modal');
    this.closeModal('customer-profile-modal');
    this.populateBookingCustomerDropdown();

    const custSelect = document.getElementById('form-booking-customer');
    if (custSelect) {
      custSelect.value = custId;
      this.onBookingCustomerChange(custId);
    }

    if (!this.bookingSelectedVehicles.includes(plateNumber)) {
      this.bookingSelectedVehicles.push(plateNumber);
    }
    const safePlateId = plateNumber.replace(/\s+/g, '-');
    const chk = document.getElementById(`veh-chk-${safePlateId}`);
    if (chk) chk.checked = true;
    const cardEl = document.getElementById(`veh-card-${safePlateId}`);
    if (cardEl) cardEl.classList.add('selected');

    this.renderBookingVehicleServicesConfig();
    this.recalculateBookingForm();
    this.openModal('add-booking-modal');
  },

  // =========================================================================
  // STAFF MODULE (FULL CRUD)
  // =========================================================================
  renderStaffModule: function () {
    const container = document.getElementById('staff-grid-container');
    if (!container) return;

    container.innerHTML = this.data.staff.map(st => `
      <div class="kpi-card" style="gap: 12px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="user-avatar-wrap" style="width: 44px; height: 44px; font-size: 14px;">
              <div class="user-avatar-img">${st.avatar || 'ST'}</div>
            </div>
            <div>
              <div style="font-weight: 700; font-size: 14px; color: var(--text-primary);">${st.name}</div>
              <div style="font-size: 11.5px; color: var(--primary-500); font-weight: 600;">${st.role}</div>
              <div style="font-size: 11px; color: var(--text-tertiary);">${st.phone}</div>
            </div>
          </div>
          <span class="badge ${st.status === 'Active' ? 'badge-paid' : 'badge-unpaid'}">${st.status || 'Active'}</span>
        </div>

        <div style="background: var(--bg-surface-elevated); padding: 10px; border-radius: var(--radius-md); font-size: 12px; display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-tertiary);">Specialization:</span>
            <span style="font-weight: 600; color: var(--text-primary);">${st.specialization || st.assignedBay || 'Car Detailing & Wash'}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-tertiary);">Completed Today:</span>
            <span style="font-weight: 700; font-family: var(--font-mono); color: var(--success);">${st.completedToday || 0} washes</span>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
          <span class="badge ${st.availability === 'Available' ? 'badge-paid' : 'badge-in-service'}">${st.availability}</span>
          <div style="display: flex; gap: 6px;">
            <button class="btn-secondary btn-sm" onclick="GingerApp.openEditStaffModal('${st.id}')">Edit</button>
            <button class="btn-secondary btn-sm" onclick="GingerApp.toggleStaffStatus('${st.id}')">${st.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
          </div>
        </div>
      </div>
    `).join('');
  },

  openCreateStaffModal: function () {
    document.getElementById('form-staff-modal-title').textContent = "Add Technician / Staff Member";
    document.getElementById('stf-id-hidden').value = "";
    document.getElementById('stf-name-input').value = "";
    document.getElementById('stf-role-select').value = "Lead Master Detailer";
    document.getElementById('stf-phone-input').value = "";
    if (document.getElementById('stf-bay-input')) {
      document.getElementById('stf-bay-input').value = "Paint Correction & Ceramic";
    }
    document.getElementById('stf-avail-select').value = "Available";

    this.openModal('staff-form-modal');
  },

  openEditStaffModal: function (staffId) {
    const st = this.data.staff.find(item => item.id === staffId);
    if (!st) return;

    document.getElementById('form-staff-modal-title').textContent = `Edit Staff: ${st.name}`;
    document.getElementById('stf-id-hidden').value = st.id;
    document.getElementById('stf-name-input').value = st.name;
    document.getElementById('stf-role-select').value = st.role;
    document.getElementById('stf-phone-input').value = st.phone;
    if (document.getElementById('stf-bay-input')) {
      document.getElementById('stf-bay-input').value = st.specialization || st.assignedBay || "Master Detailing";
    }
    document.getElementById('stf-avail-select').value = st.availability;

    this.openModal('staff-form-modal');
  },

  saveStaff: function (e) {
    if (e) e.preventDefault();
    const name = document.getElementById('stf-name-input').value.trim();
    if (!name) return;

    const id = document.getElementById('stf-id-hidden').value;
    const role = document.getElementById('stf-role-select').value;
    const phone = document.getElementById('stf-phone-input').value.trim();
    const specialization = document.getElementById('stf-bay-input') ? document.getElementById('stf-bay-input').value.trim() : "Wash Specialist";
    const avail = document.getElementById('stf-avail-select').value;

    if (id) {
      const st = this.data.staff.find(item => item.id === id);
      if (st) {
        st.name = name;
        st.role = role;
        st.phone = phone;
        st.specialization = specialization;
        st.assignedBay = specialization;
        st.availability = avail;
      }
      this.showToast(`Staff member ${name} updated!`, 'success');
    } else {
      const newId = `STF-${101 + this.data.staff.length}`;
      this.data.staff.push({
        id: newId,
        name: name,
        role: role,
        phone: phone,
        assignedBay: specialization,
        specialization: specialization,
        availability: avail,
        activeBookings: 0,
        completedToday: 0,
        avatar: name.split(' ').map(n => n[0]).join(''),
        status: "Active"
      });
      this.showToast(`Staff member ${name} added!`, 'success');
    }

    this.saveState();
    this.closeModal('staff-form-modal');
    this.renderStaffModule();
  },

  toggleStaffStatus: function (staffId) {
    const st = this.data.staff.find(s => s.id === staffId);
    if (!st) return;
    st.status = st.status === 'Active' ? 'Inactive' : 'Active';
    st.availability = st.status === 'Active' ? 'Available' : 'Off Duty';
    this.saveState();
    this.showToast(`Updated ${st.name} to ${st.status}`, 'info');
    this.renderStaffModule();
  },

  // =========================================================================
  // BILLING & INVOICES MODULE
  // =========================================================================
  renderBillingTable: function () {
    const tbody = document.getElementById('billing-table-body');
    if (!tbody) return;

    tbody.innerHTML = this.data.invoices.map(inv => `
      <tr>
        <td>
          <span class="mono-tag" style="color: #34d399; cursor: pointer;" onclick="InvoiceEngine.renderModal('${inv.invoiceNumber}')">${inv.invoiceNumber}</span>
        </td>
        <td><span class="mono-tag">${inv.bookingId}</span></td>
        <td>
          <div class="table-primary-text">${inv.customerName}</div>
          <div class="table-secondary-text">${inv.vehiclePlate}</div>
        </td>
        <td>${inv.date}</td>
        <td>
          <strong style="font-family: var(--font-mono);">${this.data.settings.currency} ${Number(inv.totalAmount).toLocaleString()}</strong>
        </td>
        <td>${inv.paymentMethod}</td>
        <td>
          <span class="badge ${InvoiceEngine.getStatusBadgeClass(inv.invoiceStatus || inv.paymentStatus)}">
            ${inv.invoiceStatus || inv.paymentStatus}
          </span>
        </td>
        <td>
          <div class="table-actions-cell">
            <button class="table-icon-btn" title="View Invoice" onclick="InvoiceEngine.renderModal('${inv.invoiceNumber}')">👁</button>
            <button class="table-icon-btn" title="Edit Invoice" onclick="InvoiceEngine.openEditModal('${inv.invoiceNumber}')">✏</button>
            <button class="table-icon-btn" title="Print Invoice (A4)" onclick="InvoiceEngine.printDirect('${inv.invoiceNumber}')">🖨</button>
            <button class="table-icon-btn" title="Download Text Receipt" onclick="InvoiceEngine.downloadInvoice('${inv.invoiceNumber}')">⬇</button>
            <button class="table-icon-btn" title="Send WhatsApp/Email" onclick="InvoiceEngine.sendInvoice('${inv.invoiceNumber}')">✉</button>
            ${inv.paymentStatus !== 'Paid' ? `
              <button class="table-icon-btn" title="Record Payment" onclick="InvoiceEngine.openPaymentModal('${inv.invoiceNumber}')">💰</button>
            ` : ''}
            <button class="table-icon-btn danger-action" title="Cancel Invoice" onclick="InvoiceEngine.cancelInvoice('${inv.invoiceNumber}')">✕</button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  // =========================================================================
  // INVENTORY MODULE (PRODUCTS & SUPPLIERS CRUD)
  // =========================================================================
  renderInventoryModule: function () {
    const tbody = document.getElementById('inventory-table-body');
    if (!tbody) return;

    tbody.innerHTML = this.data.inventory.map(item => `
      <tr>
        <td class="table-primary-text">${item.name}</td>
        <td>${item.category}</td>
        <td><span class="mono-tag">${item.sku}</span></td>
        <td>
          <span class="mono-tag" style="color: ${item.currentStock <= item.minStock ? '#f87171' : '#34d399'}; font-weight: 700;">
            ${item.currentStock} ${item.unit}
          </span>
        </td>
        <td><span class="mono-tag">${item.minStock} ${item.unit}</span></td>
        <td>${item.supplier}</td>
        <td><span class="badge ${item.status === 'In Stock' ? 'badge-paid' : 'badge-unpaid'}">${item.status}</span></td>
        <td>
          <div class="table-actions-cell">
            <button class="btn-secondary btn-sm" onclick="GingerApp.openStockModal('${item.id}', 'in')">+ In</button>
            <button class="btn-secondary btn-sm" onclick="GingerApp.openStockModal('${item.id}', 'out')">- Out</button>
            <button class="table-icon-btn" title="Edit Product" onclick="GingerApp.openEditProductModal('${item.id}')">✏</button>
            <button class="table-icon-btn danger-action" title="Delete Product" onclick="GingerApp.deleteProduct('${item.id}')">✕</button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  openCreateProductModal: function () {
    document.getElementById('form-product-modal-title').textContent = "Add Inventory Item";
    document.getElementById('prod-id-hidden').value = "";
    document.getElementById('prod-name-input').value = "";
    document.getElementById('prod-cat-select').value = "Shampoos & Chemicals";
    document.getElementById('prod-sku-input').value = "";
    document.getElementById('prod-stock-input').value = "10";
    document.getElementById('prod-min-input').value = "5";
    document.getElementById('prod-unit-input').value = "Bottles (1L)";
    document.getElementById('prod-cost-input').value = "1200";

    const supSel = document.getElementById('prod-sup-select');
    if (supSel) {
      supSel.innerHTML = this.data.suppliers.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
    }

    this.openModal('product-form-modal');
  },

  openEditProductModal: function (prodId) {
    const p = this.data.inventory.find(i => i.id === prodId);
    if (!p) return;

    document.getElementById('form-product-modal-title').textContent = `Edit Product: ${p.name}`;
    document.getElementById('prod-id-hidden').value = p.id;
    document.getElementById('prod-name-input').value = p.name;
    document.getElementById('prod-cat-select').value = p.category;
    document.getElementById('prod-sku-input').value = p.sku;
    document.getElementById('prod-stock-input').value = p.currentStock;
    document.getElementById('prod-min-input').value = p.minStock;
    document.getElementById('prod-unit-input').value = p.unit;
    document.getElementById('prod-cost-input').value = p.costPrice;

    const supSel = document.getElementById('prod-sup-select');
    if (supSel) {
      supSel.innerHTML = this.data.suppliers.map(s => `<option value="${s.name}" ${s.name === p.supplier ? 'selected' : ''}>${s.name}</option>`).join('');
    }

    this.openModal('product-form-modal');
  },

  saveProduct: function (e) {
    if (e) e.preventDefault();
    const name = document.getElementById('prod-name-input').value.trim();
    if (!name) return;

    const id = document.getElementById('prod-id-hidden').value;
    const cat = document.getElementById('prod-cat-select').value;
    const sku = document.getElementById('prod-sku-input').value.trim() || `SKU-${Date.now().toString().slice(-4)}`;
    const stock = parseInt(document.getElementById('prod-stock-input').value, 10) || 0;
    const minStock = parseInt(document.getElementById('prod-min-input').value, 10) || 5;
    const unit = document.getElementById('prod-unit-input').value.trim();
    const cost = parseFloat(document.getElementById('prod-cost-input').value) || 0;
    const sup = document.getElementById('prod-sup-select').value;
    const status = stock <= 0 ? "Out of Stock" : (stock <= minStock ? "Low Stock" : "In Stock");

    if (id) {
      const p = this.data.inventory.find(i => i.id === id);
      if (p) {
        p.name = name;
        p.category = cat;
        p.sku = sku;
        p.currentStock = stock;
        p.minStock = minStock;
        p.unit = unit;
        p.costPrice = cost;
        p.supplier = sup;
        p.status = status;
      }
      this.showToast(`Product ${name} updated!`, 'success');
    } else {
      const newId = `INV-PROD-0${this.data.inventory.length + 1}`;
      this.data.inventory.unshift({
        id: newId,
        name: name,
        category: cat,
        sku: sku,
        currentStock: stock,
        minStock: minStock,
        unit: unit,
        costPrice: cost,
        supplier: sup,
        status: status
      });
      this.showToast(`Product ${name} registered!`, 'success');
    }

    this.saveState();
    this.closeModal('product-form-modal');
    this.renderInventoryModule();
    this.renderDashboard();
  },

  deleteProduct: function (prodId) {
    const p = this.data.inventory.find(i => i.id === prodId);
    if (!p) return;

    this.confirmAction({
      title: "Delete Inventory Product",
      message: `Are you sure you want to remove "${p.name}" from inventory catalog?`,
      confirmText: "Delete",
      isDanger: true,
      onConfirm: () => {
        this.data.inventory = this.data.inventory.filter(i => i.id !== prodId);
        this.saveState();
        this.showToast(`Product ${p.name} removed`, 'warning');
        this.renderInventoryModule();
        this.renderDashboard();
      }
    });
  },

  openStockModal: function (prodId, type) {
    const p = this.data.inventory.find(i => i.id === prodId);
    if (!p) return;

    document.getElementById('stock-adj-prod-id').value = p.id;
    document.getElementById('stock-adj-prod-name').textContent = p.name;
    document.getElementById('stock-adj-current').textContent = `${p.currentStock} ${p.unit}`;
    document.getElementById('stock-adj-type').value = type;
    document.getElementById('stock-adj-qty').value = "5";
    document.getElementById('stock-adj-reason').value = type === 'in' ? "Routine replenishment" : "Service bay usage";

    this.openModal('stock-adjustment-modal');
  },

  saveStockAdjustment: function (e) {
    if (e) e.preventDefault();
    const id = document.getElementById('stock-adj-prod-id').value;
    const p = this.data.inventory.find(i => i.id === id);
    if (!p) return;

    const type = document.getElementById('stock-adj-type').value;
    const qty = parseInt(document.getElementById('stock-adj-qty').value, 10) || 0;
    const reason = document.getElementById('stock-adj-reason').value.trim();

    if (type === 'in') {
      p.currentStock += qty;
    } else {
      p.currentStock = Math.max(0, p.currentStock - qty);
    }

    p.status = p.currentStock <= 0 ? "Out of Stock" : (p.currentStock <= p.minStock ? "Low Stock" : "In Stock");

    this.saveState();
    this.showToast(`Stock updated: ${p.name} now at ${p.currentStock} ${p.unit}`, 'success');
    this.closeModal('stock-adjustment-modal');
    this.renderInventoryModule();
    this.renderDashboard();
  },

  openCreateSupplierModal: function () {
    this.openModal('supplier-form-modal');
  },

  saveSupplier: function (e) {
    if (e) e.preventDefault();
    const name = document.getElementById('sup-name-input').value.trim();
    if (!name) return;

    const contact = document.getElementById('sup-contact-input').value.trim();
    const phone = document.getElementById('sup-phone-input').value.trim();
    const email = document.getElementById('sup-email-input').value.trim();
    const cat = document.getElementById('sup-cat-input').value.trim() || "Consumables";

    this.data.suppliers.push({
      id: `SUP-0${this.data.suppliers.length + 1}`,
      name: name,
      contactPerson: contact,
      phone: phone,
      email: email,
      category: cat,
      status: "Active"
    });

    this.saveState();
    this.showToast(`Supplier ${name} added!`, 'success');
    this.closeModal('supplier-form-modal');
  },

  // =========================================================================
  // NOTIFICATIONS MODULE
  // =========================================================================
  renderNotificationsModule: function () {
    const listEl = document.getElementById('notifications-full-list');
    if (!listEl) return;

    listEl.innerHTML = this.data.notifications.map(n => `
      <div class="notification-card ${n.read ? '' : 'unread'}" style="margin-bottom: 10px;">
        <div style="font-size: 20px;">
          ${n.type === 'service' ? '🚗' : n.type === 'inventory' ? '📦' : n.type === 'payment' ? '💳' : '📅'}
        </div>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="font-weight: 700; color: var(--text-primary); font-size: 13.5px;">${n.title}</div>
            <span style="font-size: 11px; color: var(--text-tertiary);">${n.timestamp}</span>
          </div>
          <div style="font-size: 12.5px; color: var(--text-secondary); margin-top: 4px;">${n.message}</div>
        </div>
        <div>
          ${!n.read ? `
            <button class="btn-secondary btn-sm" onclick="GingerApp.markNotificationRead('${n.id}'); GingerApp.renderNotificationsModule();">
              Mark Read
            </button>
          ` : `<span style="font-size: 11px; color: var(--text-tertiary);">Read ✓</span>`}
        </div>
      </div>
    `).join('');
  },

  // =========================================================================
  // REPORTS MODULE
  // =========================================================================
  renderReportsModule: function () {
    if (window.ReportsEngine) {
      window.ReportsEngine.init();
    }
  },

  // =========================================================================
  // ROLES & PERMISSIONS MODULE
  // =========================================================================
  systemModules: [
    { key: "bookings", label: "Bookings & Appointments", icon: "📅" },
    { key: "packages", label: "Packages Management", icon: "📦" },
    { key: "customers", label: "Customer Management", icon: "👥" },
    { key: "vehicles", label: "Vehicle Master", icon: "🚗" },
    { key: "services", label: "Services & Pricing", icon: "🏷️" },
    { key: "billing", label: "Billing & Invoices", icon: "💳" },
    { key: "inventory", label: "Inventory & Consumables", icon: "📊" },
    { key: "staff", label: "Staff Management", icon: "👔" },
    { key: "reports", label: "Reports & Analytics", icon: "📈" },
    { key: "settings", label: "System Configuration", icon: "⚙️" }
  ],

  permissionActions: [
    { key: "view", label: "View" },
    { key: "create", label: "Create" },
    { key: "edit", label: "Edit" },
    { key: "delete", label: "Delete" },
    { key: "approve", label: "Approve" },
    { key: "manage", label: "Manage" }
  ],

  activeMatrixRole: "Super Admin",

  onMatrixRoleChange: function (roleName) {
    this.activeMatrixRole = roleName;
    this.renderRolesMatrix();
  },

  renderRolesMatrix: function () {
    const matrixBody = document.getElementById('roles-matrix-body');
    const roleSelect = document.getElementById('matrix-role-select');
    if (!matrixBody) return;

    if (!this.data.roles || this.data.roles.length === 0) return;

    // Populate role selector if present
    if (roleSelect) {
      roleSelect.innerHTML = this.data.roles.map(r => `
        <option value="${r.role}" ${r.role === this.activeMatrixRole ? 'selected' : ''}>${r.role}</option>
      `).join('');
    }

    const currentRole = this.data.roles.find(r => r.role === this.activeMatrixRole) || this.data.roles[0];
    if (!currentRole.permissions) currentRole.permissions = {};

    matrixBody.innerHTML = this.systemModules.map(mod => {
      const perms = currentRole.permissions[mod.key] || {};
      const allChecked = this.permissionActions.every(a => !!perms[a.key]);

      const actionTds = this.permissionActions.map(act => {
        const isChecked = !!perms[act.key] || (act.key === 'manage' && !!perms.export);
        return `
          <td style="text-align: center;">
            <input type="checkbox" class="permission-toggle-check" ${isChecked ? 'checked' : ''}
              onchange="GingerApp.onMatrixPermissionToggle('${currentRole.role.replace(/'/g, "\\'")}', '${mod.key}', '${act.key}', this.checked)">
          </td>
        `;
      }).join('');

      return `
        <tr>
          <td style="font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
            <span>${mod.icon}</span>
            <span>${mod.label}</span>
          </td>
          ${actionTds}
          <td style="text-align: center;">
            <input type="checkbox" title="Toggle all for ${mod.label}" ${allChecked ? 'checked' : ''}
              onchange="GingerApp.onMatrixRowToggle('${currentRole.role.replace(/'/g, "\\'")}', '${mod.key}', this.checked)">
          </td>
        </tr>
      `;
    }).join('');
  },

  onMatrixPermissionToggle: function (roleName, modKey, actionKey, isChecked) {
    const role = this.data.roles.find(r => r.role === roleName);
    if (!role) return;
    if (!role.permissions) role.permissions = {};
    if (!role.permissions[modKey]) role.permissions[modKey] = {};

    role.permissions[modKey][actionKey] = isChecked;
    if (modKey === 'billing' && actionKey === 'edit') {
      role.canEditInvoices = isChecked;
    }

    this.saveState();
    this.showToast(`Updated ${actionKey.toUpperCase()} on ${modKey} for ${roleName}`, 'info');
    this.renderRolesCards();
  },

  onMatrixRowToggle: function (roleName, modKey, isChecked) {
    const role = this.data.roles.find(r => r.role === roleName);
    if (!role) return;
    if (!role.permissions) role.permissions = {};
    if (!role.permissions[modKey]) role.permissions[modKey] = {};

    this.permissionActions.forEach(a => {
      role.permissions[modKey][a.key] = isChecked;
    });

    if (modKey === 'billing') {
      role.canEditInvoices = isChecked;
    }

    this.saveState();
    this.showToast(`All permissions for ${modKey} set to ${isChecked ? 'Granted' : 'Revoked'} on ${roleName}`, 'info');
    this.renderRolesMatrix();
    this.renderRolesCards();
  },

  renderRoleModalPermissionsTable: function (existingPerms) {
    const tbody = document.getElementById('role-modal-permissions-tbody');
    if (!tbody) return;

    tbody.innerHTML = this.systemModules.map(mod => {
      const perms = (existingPerms && existingPerms[mod.key]) || {};
      const allChecked = this.permissionActions.every(a => !!perms[a.key]);

      const actionTds = this.permissionActions.map(act => {
        const isChecked = !!perms[act.key] || (act.key === 'manage' && !!perms.export);
        return `
          <td style="text-align: center;">
            <input type="checkbox" class="role-modal-perm-check" id="perm-${mod.key}-${act.key}"
              data-module="${mod.key}" data-action="${act.key}" ${isChecked ? 'checked' : ''}>
          </td>
        `;
      }).join('');

      return `
        <tr>
          <td style="font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
            <span>${mod.icon}</span>
            <span>${mod.label}</span>
          </td>
          ${actionTds}
          <td style="text-align: center;">
            <input type="checkbox" class="role-modal-row-toggle" data-module="${mod.key}"
              title="Toggle all for ${mod.label}" ${allChecked ? 'checked' : ''}
              onchange="GingerApp.toggleRowPermissions('${mod.key}', this.checked)">
          </td>
        </tr>
      `;
    }).join('');
  },

  setAllRoleModalPermissions: function (shouldCheck) {
    document.querySelectorAll('.role-modal-perm-check').forEach(cb => {
      cb.checked = shouldCheck;
    });
    document.querySelectorAll('.role-modal-row-toggle').forEach(cb => {
      cb.checked = shouldCheck;
    });
    const canEditInv = document.getElementById('role-can-edit-inv');
    if (canEditInv) canEditInv.checked = shouldCheck;
  },

  setReadOnlyRoleModalPermissions: function () {
    document.querySelectorAll('.role-modal-perm-check').forEach(cb => {
      cb.checked = (cb.dataset.action === 'view');
    });
    document.querySelectorAll('.role-modal-row-toggle').forEach(cb => {
      cb.checked = false;
    });
    const canEditInv = document.getElementById('role-can-edit-inv');
    if (canEditInv) canEditInv.checked = false;
  },

  toggleRowPermissions: function (modKey, shouldCheck) {
    document.querySelectorAll(`.role-modal-perm-check[data-module="${modKey}"]`).forEach(cb => {
      cb.checked = shouldCheck;
    });
    if (modKey === 'billing') {
      const canEditInv = document.getElementById('role-can-edit-inv');
      if (canEditInv) canEditInv.checked = shouldCheck;
    }
  },

  openCreateRoleModal: function () {
    const titleEl = document.getElementById('role-modal-title');
    const submitBtn = document.getElementById('role-modal-submit-btn');
    const origInput = document.getElementById('role-edit-original-name');
    const nameInput = document.getElementById('role-name-input');
    const descInput = document.getElementById('role-desc-input');
    const canEditInv = document.getElementById('role-can-edit-inv');

    if (titleEl) titleEl.textContent = 'Create Security Role';
    if (submitBtn) submitBtn.textContent = 'Create Role';
    if (origInput) origInput.value = '';
    if (nameInput) {
      nameInput.value = '';
      nameInput.readOnly = false;
    }
    if (descInput) descInput.value = '';
    if (canEditInv) canEditInv.checked = false;

    // Default template: view permission on all, create on operations
    const defaultPerms = {};
    this.systemModules.forEach(m => {
      defaultPerms[m.key] = {
        view: true,
        create: (m.key === 'bookings' || m.key === 'customers'),
        edit: false,
        delete: false,
        approve: false,
        manage: false
      };
    });

    this.renderRoleModalPermissionsTable(defaultPerms);
    this.openModal('role-form-modal');
  },

  openEditRoleModal: function (roleName) {
    const role = this.data.roles.find(r => r.role === roleName);
    if (!role) {
      this.showToast(`Role "${roleName}" not found!`, 'error');
      return;
    }

    const titleEl = document.getElementById('role-modal-title');
    const submitBtn = document.getElementById('role-modal-submit-btn');
    const origInput = document.getElementById('role-edit-original-name');
    const nameInput = document.getElementById('role-name-input');
    const descInput = document.getElementById('role-desc-input');
    const canEditInv = document.getElementById('role-can-edit-inv');

    if (titleEl) titleEl.textContent = `Edit Security Role: ${role.role}`;
    if (submitBtn) submitBtn.textContent = 'Save Changes';
    if (origInput) origInput.value = role.role;
    if (nameInput) {
      nameInput.value = role.role;
      // Do not allow renaming default Super Admin to avoid lockouts
      nameInput.readOnly = (role.role === 'Super Admin');
    }
    if (descInput) descInput.value = role.description || '';
    if (canEditInv) canEditInv.checked = !!role.canEditInvoices;

    this.renderRoleModalPermissionsTable(role.permissions || {});
    this.openModal('role-form-modal');
  },

  saveRole: function (e) {
    if (e) e.preventDefault();
    const roleName = document.getElementById('role-name-input').value.trim();
    if (!roleName) return;

    const originalName = document.getElementById('role-edit-original-name').value;
    const desc = document.getElementById('role-desc-input').value.trim();
    const canEditInv = document.getElementById('role-can-edit-inv').checked;

    // Build permissions object from modal checkboxes
    const permissions = {};
    this.systemModules.forEach(m => {
      permissions[m.key] = {};
      this.permissionActions.forEach(a => {
        const cb = document.querySelector(`.role-modal-perm-check[data-module="${m.key}"][data-action="${a.key}"]`);
        permissions[m.key][a.key] = cb ? cb.checked : false;
      });
      if (m.key === 'billing') {
        permissions.billing.edit = canEditInv;
      }
    });

    if (originalName) {
      // Update existing role
      const existing = this.data.roles.find(r => r.role === originalName);
      if (existing) {
        existing.role = roleName;
        existing.description = desc;
        existing.canEditInvoices = canEditInv;
        existing.permissions = permissions;
      }
      // If role name changed, update all assigned users
      if (originalName !== roleName) {
        this.data.users.forEach(u => {
          if (u.role === originalName) u.role = roleName;
        });
        this.renderUsersTable();
      }
      this.showToast(`Role "${roleName}" permissions and details updated!`, 'success');
    } else {
      // Create new role
      if (this.data.roles.some(r => r.role.toLowerCase() === roleName.toLowerCase())) {
        this.showToast(`A role named "${roleName}" already exists!`, 'error');
        return;
      }
      this.data.roles.push({
        role: roleName,
        description: desc,
        usersCount: 0,
        canEditInvoices: canEditInv,
        permissions: permissions
      });
      this.showToast(`Role "${roleName}" created with assigned permissions!`, 'success');
    }

    this.saveState();
    this.closeModal('role-form-modal');
    this.renderRolesCards();
    this.renderRolesMatrix();
  },

  openCreateUserModal: function () {
    this.openModal('user-form-modal');
  },

  saveUser: function (e) {
    if (e) e.preventDefault();
    const name = document.getElementById('usr-name-input').value.trim();
    if (!name) return;

    const email = document.getElementById('usr-email-input').value.trim();
    const role = document.getElementById('usr-role-select').value;
    const phone = document.getElementById('usr-phone-input').value.trim();

    this.data.users.push({
      id: `USR-00${this.data.users.length + 1}`,
      name: name,
      email: email,
      role: role,
      phone: phone,
      status: "Active",
      lastLogin: "Never"
    });

    this.saveState();
    this.showToast(`User ${name} added with role ${role}!`, 'success');
    this.closeModal('user-form-modal');
    this.renderUsersTable();
  },

  // =========================================================================
  // SETTINGS MODULE & BRAND LOGO MANAGEMENT
  // =========================================================================
  defaultLogoSvg: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 22px; height: 22px;">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
      <circle cx="7" cy="17" r="2"></circle>
      <path d="M9 17h6"></path>
      <circle cx="17" cy="17" r="2"></circle>
    </svg>
  `,

  updateBrandLogoUI: function () {
    const logoUrl = this.data && this.data.settings && this.data.settings.logoUrl;
    const brandIcons = document.querySelectorAll('.brand-icon, #sidebar-brand-icon');
    brandIcons.forEach(el => {
      if (logoUrl && logoUrl.trim() !== '') {
        el.innerHTML = `<img src="${logoUrl}" alt="Brand Logo" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit; display: block;">`;
      } else {
        el.innerHTML = this.defaultLogoSvg;
      }
    });
  },

  renderLogoPreview: function () {
    const previewEl = document.getElementById('set-logo-preview');
    const urlInput = document.getElementById('set-logo-url');
    const logoUrl = this.data && this.data.settings && this.data.settings.logoUrl;
    if (urlInput && document.activeElement !== urlInput) {
      urlInput.value = logoUrl || '';
    }
    if (previewEl) {
      if (logoUrl && logoUrl.trim() !== '') {
        previewEl.innerHTML = `<img src="${logoUrl}" alt="Logo Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit; display: block;" onerror="this.onerror=null; this.parentElement.innerHTML='<span style=\\'font-size: 10px; color: #fff; text-align: center; line-height: 1.2; padding: 4px;\\'>Invalid Image</span>';">`;
      } else {
        previewEl.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 34px; height: 34px; color: white;">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
            <circle cx="7" cy="17" r="2"></circle>
            <path d="M9 17h6"></path>
            <circle cx="17" cy="17" r="2"></circle>
          </svg>
        `;
      }
    }
  },

  onLogoFileSelected: function (event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.showToast('Please select a valid image file (PNG, JPG, SVG, WebP)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      if (!this.data.settings) this.data.settings = {};
      this.data.settings.logoUrl = dataUrl;
      const urlInput = document.getElementById('set-logo-url');
      if (urlInput) urlInput.value = dataUrl;
      this.renderLogoPreview();
      this.updateBrandLogoUI();
      this.showToast('Logo updated! Click "Save Changes" to persist.', 'info');
    };
    reader.readAsDataURL(file);
  },

  onLogoUrlInput: function (val) {
    if (!this.data.settings) this.data.settings = {};
    this.data.settings.logoUrl = val ? val.trim() : '';
    this.renderLogoPreview();
    this.updateBrandLogoUI();
  },

  resetBrandLogo: function () {
    if (!this.data.settings) this.data.settings = {};
    this.data.settings.logoUrl = '';
    const fileInput = document.getElementById('set-logo-file');
    if (fileInput) fileInput.value = '';
    const urlInput = document.getElementById('set-logo-url');
    if (urlInput) urlInput.value = '';
    this.renderLogoPreview();
    this.updateBrandLogoUI();
    this.showToast('Logo reset to default. Click "Save Changes" to persist.', 'info');
  },

  renderSettingsModule: function () {
    const s = this.data.settings || {};
    const formName = document.getElementById('set-business-name');
    const formBranch = document.getElementById('set-branch-name');
    const formPhone = document.getElementById('set-phone');
    const formEmail = document.getElementById('set-email');

    if (formName) formName.value = s.businessName || '';
    if (formBranch) formBranch.value = s.branchName || '';
    if (formPhone) formPhone.value = s.phone || '';
    if (formEmail) formEmail.value = s.email || '';

    this.renderLogoPreview();
  },

  saveSettings: function (e) {
    if (e) e.preventDefault();
    if (!this.data.settings) this.data.settings = {};
    const s = this.data.settings;
    const formName = document.getElementById('set-business-name');
    const formBranch = document.getElementById('set-branch-name');
    const formPhone = document.getElementById('set-phone');
    const formEmail = document.getElementById('set-email');
    const formLogoUrl = document.getElementById('set-logo-url');

    if (formName) s.businessName = formName.value.trim();
    if (formBranch) s.branchName = formBranch.value.trim();
    if (formPhone) s.phone = formPhone.value.trim();
    if (formEmail) s.email = formEmail.value.trim();
    if (formLogoUrl && formLogoUrl.value !== undefined) {
      s.logoUrl = formLogoUrl.value.trim();
    }

    this.saveState();
    this.updateBrandLogoUI();
    this.showToast('Ginger WashMate settings saved successfully!', 'success');
  },

  // =========================================================================
  // USER PROFILE & LOGIN / TERMINAL ACCESS
  // =========================================================================
  updateCurrentUserUI: function () {
    const user = this.data.currentUser || {
      name: "Rashid Al-Kuwari",
      role: "Super Admin",
      title: "Operations Director",
      avatar: "RK"
    };

    const topName = document.getElementById('topbar-user-name');
    if (topName) topName.textContent = user.name;
    const topRole = document.getElementById('topbar-user-role');
    if (topRole) topRole.textContent = `${user.role} (${user.title || user.role})`;
    const topAvatars = document.querySelectorAll('#topbar-user-widget .user-avatar-img');
    topAvatars.forEach(el => el.textContent = user.avatar || user.name.split(' ').map(n => n[0]).join(''));

    const sideAvatar = document.getElementById('sidebar-user-avatar');
    if (sideAvatar) sideAvatar.textContent = user.avatar || user.name.split(' ').map(n => n[0]).join('');
    const sideName = document.getElementById('sidebar-user-name');
    if (sideName) sideName.textContent = user.name;
    const sideRole = document.getElementById('sidebar-user-role');
    if (sideRole) sideRole.textContent = user.title || user.role;

    const rbacAvatar = document.getElementById('rbac-current-avatar');
    if (rbacAvatar) rbacAvatar.textContent = user.avatar || user.name.split(' ').map(n => n[0]).join('');
    const rbacName = document.getElementById('rbac-current-name');
    if (rbacName) rbacName.textContent = user.name;
    const rbacRole = document.getElementById('rbac-current-role');
    if (rbacRole) rbacRole.textContent = user.role;

    const privLabel = document.getElementById('rbac-invoice-privilege-label');
    if (privLabel) {
      const canEdit = window.InvoiceEngine ? window.InvoiceEngine.canUserEditInvoice() : true;
      if (canEdit) {
        privLabel.textContent = "Full Invoice Modification Permitted";
        privLabel.style.color = "#34d399";
      } else {
        privLabel.textContent = "Read-Only (Invoice Edits Restricted for Role)";
        privLabel.style.color = "#f87171";
      }
    }
  },

  openLoginScreen: function () {
    const emailInput = document.getElementById('login-email-input');
    if (emailInput && this.data.currentUser) {
      const u = this.data.users.find(usr => usr.name === this.data.currentUser.name);
      if (u) emailInput.value = u.email;
    }
    this.openModal('login-screen-modal');
  },

  switchUser: function (userEmail) {
    const user = this.data.users.find(u => u.email.toLowerCase() === (userEmail || '').toLowerCase());
    if (!user) {
      this.showToast(`User account ${userEmail} not found`, 'error');
      return;
    }

    this.data.currentUser = {
      name: user.name,
      role: user.role,
      title: user.role,
      avatar: user.name.split(' ').map(n => n[0]).join(''),
      status: 'active'
    };

    user.lastLogin = "Just now";
    this.saveState();
    this.updateCurrentUserUI();
    this.closeModal('login-screen-modal');
    this.showToast(`Logged in as ${user.name} (${user.role})`, 'success');

    if (this.currentModule === 'roles') {
      this.renderUsersTable();
      this.renderRolesCards();
    } else if (this.currentModule === 'billing') {
      this.renderBillingTable();
    }
  },

  initAuth: function () {
    const isAuth = sessionStorage.getItem('washmate_auth') === 'true';
    const overlay = document.getElementById('washmate-login-screen');
    const appRoot = document.getElementById('app-root');

    if (isAuth) {
      document.documentElement.classList.remove('washmate-unauthenticated');
      if (overlay) {
        overlay.style.display = 'none';
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
      }
      if (appRoot) {
        appRoot.style.display = 'flex';
        appRoot.style.opacity = '1';
      }
    } else {
      document.documentElement.classList.add('washmate-unauthenticated');
      if (overlay) {
        overlay.style.display = 'flex';
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'all';
      }
      if (appRoot) {
        appRoot.style.display = 'none';
      }
    }
  },

  handleAdminLogin: function (e) {
    if (e) e.preventDefault();
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    const errorAlert = document.getElementById('login-error-alert');
    const errorText = document.getElementById('login-error-text');
    const card = document.getElementById('washmate-login-card');
    const submitBtn = document.getElementById('login-submit-button');

    const username = (usernameInput ? usernameInput.value : '').trim().toLowerCase();
    const password = (passwordInput ? passwordInput.value : '').trim();

    const validUsername = 'washmate@ginger.com';
    const validPassword = 'ginger123@';

    const isMatch = (username === validUsername && password === validPassword) ||
                    (username === 'test' && (password === 'test' || password === 'ginger123@')) ||
                    (username === 'test@ginger.com' && password === 'ginger123@');

    if (isMatch) {
      // Successful credentials match
      if (errorAlert) errorAlert.style.display = 'none';
      if (usernameInput) usernameInput.classList.remove('input-error');
      if (passwordInput) passwordInput.classList.remove('input-error');

      if (submitBtn) {
        submitBtn.disabled = true;
        const btnText = submitBtn.querySelector('.btn-text');
        const btnSpinner = submitBtn.querySelector('.btn-spinner');
        const btnIcon = submitBtn.querySelector('.btn-icon');
        if (btnText) btnText.textContent = 'Verifying & Opening...';
        if (btnSpinner) btnSpinner.style.display = 'inline-block';
        if (btnIcon) btnIcon.style.display = 'none';
      }

      // Configure current user as WashMate Admin
      this.data.currentUser = {
        name: "WashMate Admin",
        role: "Super Admin",
        title: "Operations Director",
        email: "washmate@ginger.com",
        avatar: "WM",
        status: "active"
      };
      this.saveState();
      sessionStorage.setItem('washmate_auth', 'true');

      setTimeout(() => {
        const overlay = document.getElementById('washmate-login-screen');
        const appRoot = document.getElementById('app-root');

        if (overlay) {
          overlay.style.opacity = '0';
          overlay.style.pointerEvents = 'none';
        }

        document.documentElement.classList.remove('washmate-unauthenticated');
        if (appRoot) {
          appRoot.style.display = 'flex';
          appRoot.style.opacity = '1';
        }

        this.updateCurrentUserUI();
        this.navigateTo('dashboard');
        this.showToast('Welcome, WashMate Administrator! Access Granted.', 'success');

        setTimeout(() => {
          if (overlay) overlay.style.display = 'none';
          if (submitBtn) {
            submitBtn.disabled = false;
            const btnText = submitBtn.querySelector('.btn-text');
            const btnSpinner = submitBtn.querySelector('.btn-spinner');
            const btnIcon = submitBtn.querySelector('.btn-icon');
            if (btnText) btnText.textContent = 'Sign In to Admin Portal';
            if (btnSpinner) btnSpinner.style.display = 'none';
            if (btnIcon) btnIcon.style.display = 'inline-block';
          }
        }, 400);
      }, 350);

    } else {
      // Invalid credentials
      if (errorAlert) {
        errorAlert.style.display = 'flex';
        if (errorText) {
          errorText.textContent = 'Invalid credentials. Required: washmate@ginger.com / ginger123@';
        }
      }
      if (card) {
        card.classList.remove('shake');
        void card.offsetWidth; // trigger DOM reflow for re-animation
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 500);
      }
      if (passwordInput) {
        passwordInput.classList.add('input-error');
        passwordInput.focus();
        passwordInput.select();
      }
      if (usernameInput) {
        usernameInput.classList.add('input-error');
      }
    }
  },

  fillDemoCredentials: function () {
    const u = document.getElementById('login-username');
    const p = document.getElementById('login-password');
    const err = document.getElementById('login-error-alert');
    if (u) {
      u.value = 'washmate@ginger.com';
      u.classList.remove('input-error');
    }
    if (p) {
      p.value = 'ginger123@';
      p.classList.remove('input-error');
    }
    if (err) err.style.display = 'none';
    this.showToast('Demo admin credentials populated: washmate@ginger.com', 'info');
  },

  toggleLoginPasswordVisibility: function () {
    const pass = document.getElementById('login-password');
    const eye = document.getElementById('toggle-eye-icon');
    if (!pass) return;
    if (pass.type === 'password') {
      pass.type = 'text';
      if (eye) {
        eye.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
      }
    } else {
      pass.type = 'password';
      if (eye) {
        eye.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
      }
    }
  },

  signOut: function () {
    sessionStorage.removeItem('washmate_auth');
    document.documentElement.classList.add('washmate-unauthenticated');

    const overlay = document.getElementById('washmate-login-screen');
    const appRoot = document.getElementById('app-root');
    const passInput = document.getElementById('login-password');
    const errAlert = document.getElementById('login-error-alert');

    if (passInput) passInput.value = '';
    if (errAlert) errAlert.style.display = 'none';

    if (appRoot) {
      appRoot.style.display = 'none';
    }

    if (overlay) {
      overlay.style.display = 'flex';
      overlay.style.pointerEvents = 'all';
      overlay.style.opacity = '0';
      void overlay.offsetWidth;
      overlay.style.opacity = '1';
    }

    this.showToast('You have signed out of the Admin Portal.', 'info');
  },

  submitLogin: function (e) {
    if (e) e.preventDefault();
    const email = document.getElementById('login-email-input')?.value.trim();
    if (!email) return;
    this.switchUser(email);
  },

  // =========================================================================
  // ROLES & USERS ENHANCEMENTS
  // =========================================================================
  renderUsersTable: function () {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    tbody.innerHTML = this.data.users.map(u => {
      const isCurrent = this.data.currentUser && this.data.currentUser.name === u.name;
      return `
        <tr style="${isCurrent ? 'background: rgba(37, 99, 235, 0.08);' : ''}">
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="user-avatar-wrap" style="width: 28px; height: 28px; font-size: 11px;">
                <span class="user-avatar-img">${u.name.split(' ').map(n => n[0]).join('')}</span>
              </span>
              <strong style="color: var(--text-primary);">${u.name}</strong>
              ${isCurrent ? '<span class="badge badge-paid" style="font-size: 10px;">Current</span>' : ''}
            </div>
          </td>
          <td><span style="font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary);">${u.email}</span></td>
          <td><span class="mono-tag" style="font-size: 11px;">${u.role}</span></td>
          <td>${u.phone || 'N/A'}</td>
          <td><span class="badge ${u.status === 'Active' ? 'badge-paid' : 'badge-unpaid'}">${u.status}</span></td>
          <td><span style="font-size: 11px; color: var(--text-tertiary);">${u.lastLogin || 'Recent'}</span></td>
          <td>
            <div class="table-actions-cell">
              ${!isCurrent ? `
                <button class="btn-secondary btn-sm" onclick="GingerApp.switchUser('${u.email}')">Switch Session</button>
              ` : `
                <span style="font-size: 11px; color: var(--success); font-weight: 700;">Active ✓</span>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderRolesCards: function () {
    const container = document.getElementById('roles-cards-container');
    if (!container) return;

    container.innerHTML = this.data.roles.map(r => {
      // Calculate permission stats
      let activeModules = 0;
      let totalGranted = 0;
      if (r.permissions) {
        Object.keys(r.permissions).forEach(k => {
          const mod = r.permissions[k];
          let hasAny = false;
          Object.keys(mod).forEach(act => {
            if (mod[act]) {
              totalGranted++;
              hasAny = true;
            }
          });
          if (hasAny) activeModules++;
        });
      }

      return `
        <div class="kpi-card" style="padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <div>
                <div style="font-weight: 800; font-size: 14.5px; color: var(--text-primary);">${r.role}</div>
                <div style="font-size: 11px; color: var(--text-tertiary);">${r.usersCount || 1} User(s) Assigned</div>
              </div>
              <span class="badge ${r.canEditInvoices ? 'badge-paid' : 'badge-unpaid'}">
                ${r.canEditInvoices ? 'Can Edit Invoices' : 'View Only Invoices'}
              </span>
            </div>
            <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 12px;">
              ${r.description || 'Custom administrative security profile.'}
            </p>
            <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 12px; flex-wrap: wrap;">
              <span class="badge badge-paid" style="font-size: 10.5px; padding: 2px 7px;">
                ${activeModules}/10 Modules
              </span>
              <span class="badge" style="font-size: 10.5px; padding: 2px 7px; background: rgba(255,255,255,0.06); color: var(--text-secondary);">
                ${totalGranted} Actions Granted
              </span>
            </div>
          </div>
          <div style="border-top: 1px solid var(--border-subtle); padding-top: 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer; color: var(--text-primary); font-weight: 600;">
              <input type="checkbox" ${r.canEditInvoices ? 'checked' : ''} onchange="GingerApp.toggleRoleInvoicePermission('${r.role.replace(/'/g, "\\'")}', this.checked)">
              <span>Invoice Edits</span>
            </label>
            <button type="button" class="btn-primary btn-sm" onclick="GingerApp.openEditRoleModal('${r.role.replace(/'/g, "\\'")}')" style="display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; font-size: 12px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Edit Role
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  toggleRoleInvoicePermission: function (roleName, canEdit) {
    const r = this.data.roles.find(item => item.role === roleName);
    if (r) {
      r.canEditInvoices = canEdit;
      if (r.permissions && r.permissions.billing) {
        r.permissions.billing.edit = canEdit;
      }
      this.saveState();
      this.showToast(`Invoice editing permission for ${roleName}: ${canEdit ? 'Granted' : 'Revoked'}`, 'info');
      this.updateCurrentUserUI();
      this.renderRolesCards();
      if (this.currentModule === 'billing') {
        this.renderBillingTable();
      }
    }
  },

  // =========================================================================
  // Legacy stubs (Tax and VAT removed from application)
  renderTaxVatSettings: function () {},
  onVatToggleChange: function () {},
  updateTaxVatPreview: function () {},
  saveTaxVatSettings: function (e) { if (e) e.preventDefault(); },

  // =========================================================================
  // MOBILE RESPONSIVE: SIDEBAR & SEARCH OVERLAY
  // =========================================================================
  openMobileSidebar: function () {
    const sidebar = document.getElementById('main-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.add('mobile-open');
    if (overlay) {
      overlay.classList.add('active');
      overlay.style.display = 'block';
    }
    document.body.style.overflow = 'hidden';
  },

  closeMobileSidebar: function () {
    const sidebar = document.getElementById('main-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => { overlay.style.display = 'none'; }, 300);
    }
    document.body.style.overflow = '';
  },

  toggleMobileSidebar: function () {
    const sidebar = document.getElementById('main-sidebar');
    if (sidebar && sidebar.classList.contains('mobile-open')) {
      this.closeMobileSidebar();
    } else {
      this.openMobileSidebar();
    }
  },

  openMobileSearch: function () {
    const overlay = document.getElementById('mobile-search-overlay');
    if (overlay) {
      overlay.classList.add('active');
      const input = document.getElementById('mobile-search-input');
      if (input) setTimeout(() => input.focus(), 100);
    }
  },

  closeMobileSearch: function () {
    const overlay = document.getElementById('mobile-search-overlay');
    if (overlay) overlay.classList.remove('active');
  },

  updateBrandLogoUI: function () {
    // Brand and logo synchronization
  },

  renderAll: function () {
    this.updateCurrentUserUI();
    this.populateBookingCustomerDropdown();
    this.renderDashboard();
    this.renderBookingsTable();
    window.WorkflowEngine.renderBoard();
    this.renderPackagesTable();
    this.renderCustomersTable();
    this.renderVehiclesTable();
    this.renderServicesCatalog();
    this.renderStaffModule();
    this.renderBillingTable();
    this.renderInventoryModule();
    this.renderUsersTable();
    this.renderRolesCards();
    this.renderRolesMatrix();
    this.renderTaxVatSettings();
    this.renderSettingsModule();
    this.updateBrandLogoUI();
  }
};

window.GingerApp = GingerApp;

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.GingerApp.init();
});
