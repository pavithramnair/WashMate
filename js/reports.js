/**
 * GINGER WASHMATE - Comprehensive Reports & Analytics Engine
 * Provides dual Graphical (SVG Charts) and Tabular (Interactive Tables) views
 * for Bookings, Revenue, Services, and Staff Performance with live filtering and CSV exports.
 */

const ReportsEngine = {
  activeTab: 'bookings', // 'bookings' | 'revenue' | 'services' | 'staff'
  viewMode: 'chart',     // 'chart' | 'table'
  filters: {
    period: 'all',
    status: 'all',
    payment: 'all',
    category: 'all',
    staff: 'all',
    search: ''
  },

  // Initialize or re-render
  init: function () {
    this.render();
  },

  render: function () {
    this.renderTabsUI();
    this.renderContextualFilters();
    this.renderKPIs();
    if (this.viewMode === 'chart') {
      this.renderCharts();
      document.getElementById('reports-chart-container')?.style.setProperty('display', 'block');
      document.getElementById('reports-table-container')?.style.setProperty('display', 'none');
    } else {
      this.renderTable();
      document.getElementById('reports-chart-container')?.style.setProperty('display', 'none');
      document.getElementById('reports-table-container')?.style.setProperty('display', 'block');
    }
  },

  // Switch between Graphical and Tabular views
  switchView: function (mode) {
    this.viewMode = mode;
    const btnChart = document.getElementById('btn-reports-view-chart');
    const btnTable = document.getElementById('btn-reports-view-table');

    if (btnChart && btnTable) {
      if (mode === 'chart') {
        btnChart.classList.add('active');
        btnTable.classList.remove('active');
      } else {
        btnChart.classList.remove('active');
        btnTable.classList.add('active');
      }
    }
    this.render();
  },

  // Switch between the 4 report tabs
  switchTab: function (tab) {
    this.activeTab = tab;
    // reset tab-specific filters
    this.filters.status = 'all';
    this.filters.payment = 'all';
    this.filters.category = 'all';
    this.filters.staff = 'all';
    this.filters.search = '';
    const searchInput = document.getElementById('reports-search-input');
    if (searchInput) searchInput.value = '';

    this.renderTabsUI();
    this.render();
  },

  renderTabsUI: function () {
    const tabs = ['bookings', 'revenue', 'services', 'staff'];
    tabs.forEach(t => {
      const btn = document.getElementById(`tab-rep-${t}`);
      if (btn) {
        if (t === this.activeTab) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });
  },

  onFilterChange: function (key, val) {
    this.filters[key] = val;
    this.render();
  },

  // Render contextual filters based on active tab
  renderContextualFilters: function () {
    const container = document.getElementById('reports-contextual-filters');
    if (!container) return;

    if (this.activeTab === 'bookings') {
      container.innerHTML = `
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 12px; color: var(--text-tertiary); font-weight: 600;">Status:</span>
          <select class="form-control" style="font-size: 12.5px; padding: 6px 12px; width: auto;" onchange="ReportsEngine.onFilterChange('status', this.value)">
            <option value="all" ${this.filters.status === 'all' ? 'selected' : ''}>All Statuses</option>
            <option value="Completed" ${this.filters.status === 'Completed' ? 'selected' : ''}>Completed</option>
            <option value="In Progress" ${this.filters.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Scheduled" ${this.filters.status === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
            <option value="Pending" ${this.filters.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Cancelled" ${this.filters.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </div>
      `;
    } else if (this.activeTab === 'revenue') {
      container.innerHTML = `
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 12px; color: var(--text-tertiary); font-weight: 600;">Payment:</span>
          <select class="form-control" style="font-size: 12.5px; padding: 6px 12px; width: auto;" onchange="ReportsEngine.onFilterChange('payment', this.value)">
            <option value="all" ${this.filters.payment === 'all' ? 'selected' : ''}>All Payment Types</option>
            <option value="Card" ${this.filters.payment === 'Card' ? 'selected' : ''}>Card</option>
            <option value="Cash" ${this.filters.payment === 'Cash' ? 'selected' : ''}>Cash</option>
            <option value="Online / UPI" ${this.filters.payment === 'Online / UPI' ? 'selected' : ''}>Online / UPI</option>
            <option value="Package Wash" ${this.filters.payment === 'Package Wash' ? 'selected' : ''}>Package Balance</option>
          </select>
        </div>
      `;
    } else if (this.activeTab === 'services') {
      const categories = ["Wash", "Detailing", "Coating", "Interior"];
      container.innerHTML = `
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 12px; color: var(--text-tertiary); font-weight: 600;">Category:</span>
          <select class="form-control" style="font-size: 12.5px; padding: 6px 12px; width: auto;" onchange="ReportsEngine.onFilterChange('category', this.value)">
            <option value="all" ${this.filters.category === 'all' ? 'selected' : ''}>All Categories</option>
            ${categories.map(c => `<option value="${c}" ${this.filters.category === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
      `;
    } else if (this.activeTab === 'staff') {
      const staffList = (window.GingerApp?.data?.staff || []).map(s => s.name);
      container.innerHTML = `
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 12px; color: var(--text-tertiary); font-weight: 600;">Staff Member:</span>
          <select class="form-control" style="font-size: 12.5px; padding: 6px 12px; width: auto;" onchange="ReportsEngine.onFilterChange('staff', this.value)">
            <option value="all" ${this.filters.staff === 'all' ? 'selected' : ''}>All Technicians & Staff</option>
            ${staffList.map(name => `<option value="${name}" ${this.filters.staff === name ? 'selected' : ''}>${name}</option>`).join('')}
          </select>
        </div>
      `;
    }
  },

  // Helper to filter data by date range period
  isDateInPeriod: function (dateStr, period) {
    if (period === 'all' || !dateStr) return true;
    const now = new Date();
    const itemDate = new Date(dateStr);
    if (isNaN(itemDate.getTime())) return true;
    const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);

    if (period === '7days') return diffDays <= 7;
    if (period === '30days') return diffDays <= 30;
    if (period === 'month') return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    return true;
  },

  // Get filtered datasets
  getFilteredBookings: function () {
    const list = window.GingerApp?.data?.bookings || [];
    return list.filter(b => {
      if (!this.isDateInPeriod(b.date, this.filters.period)) return false;
      if (this.filters.status !== 'all' && b.bookingStatus !== this.filters.status) return false;
      if (this.filters.search) {
        const q = this.filters.search.toLowerCase();
        const match = (b.id && b.id.toLowerCase().includes(q)) ||
          (b.customerName && b.customerName.toLowerCase().includes(q)) ||
          (b.vehiclePlate && b.vehiclePlate.toLowerCase().includes(q)) ||
          (b.serviceName && b.serviceName.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  },

  getFilteredInvoices: function () {
    const list = window.GingerApp?.data?.invoices || [];
    return list.filter(inv => {
      if (!this.isDateInPeriod(inv.date, this.filters.period)) return false;
      if (this.filters.payment !== 'all' && inv.paymentMethod !== this.filters.payment) return false;
      if (this.filters.search) {
        const q = this.filters.search.toLowerCase();
        const match = (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(q)) ||
          (inv.customerName && inv.customerName.toLowerCase().includes(q)) ||
          (inv.vehiclePlate && inv.vehiclePlate.toLowerCase().includes(q)) ||
          (inv.serviceName && inv.serviceName.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  },

  getFilteredServices: function () {
    const services = window.GingerApp?.data?.services || [];
    const bookings = this.getFilteredBookings();
    const serviceCounts = {};
    const serviceRevenue = {};

    bookings.forEach(b => {
      const sName = b.serviceName || "Other";
      serviceCounts[sName] = (serviceCounts[sName] || 0) + 1;
      serviceRevenue[sName] = (serviceRevenue[sName] || 0) + (Number(b.totalAmount) || 0);
    });

    return services.filter(s => {
      if (this.filters.category !== 'all' && s.category !== this.filters.category) return false;
      if (this.filters.search) {
        const q = this.filters.search.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.category.toLowerCase().includes(q)) return false;
      }
      return true;
    }).map(s => ({
      ...s,
      bookingsCount: serviceCounts[s.name] || 0,
      totalRevenue: serviceRevenue[s.name] || 0
    })).sort((a, b) => b.bookingsCount - a.bookingsCount);
  },

  getFilteredStaff: function () {
    const staffList = window.GingerApp?.data?.staff || [];
    const bookings = this.getFilteredBookings();
    const staffJobs = {};
    const staffRev = {};

    bookings.forEach(b => {
      if (b.assignedStaff) {
        staffJobs[b.assignedStaff] = (staffJobs[b.assignedStaff] || 0) + 1;
        staffRev[b.assignedStaff] = (staffRev[b.assignedStaff] || 0) + (Number(b.totalAmount) || 0);
      }
    });

    return staffList.filter(s => {
      if (this.filters.staff !== 'all' && s.name !== this.filters.staff) return false;
      if (this.filters.search) {
        const q = this.filters.search.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.role.toLowerCase().includes(q)) return false;
      }
      return true;
    }).map(s => ({
      ...s,
      completedJobs: staffJobs[s.name] || 0,
      revenueGenerated: staffRev[s.name] || 0
    })).sort((a, b) => b.completedJobs - a.completedJobs);
  },

  // Render 4 summary KPI cards
  renderKPIs: function () {
    const container = document.getElementById('reports-kpis-container');
    if (!container) return;

    if (this.activeTab === 'bookings') {
      const data = this.getFilteredBookings();
      const total = data.length;
      const completed = data.filter(b => b.bookingStatus === 'Completed').length;
      const active = data.filter(b => b.bookingStatus === 'In Progress' || b.bookingStatus === 'Scheduled').length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      container.innerHTML = `
        <div class="kpi-card">
          <div class="kpi-label">Total Bookings</div>
          <div class="kpi-value">${total}</div>
          <div class="kpi-trend positive">Filtered volume</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Completed Washes</div>
          <div class="kpi-value" style="color: #10b981;">${completed}</div>
          <div class="kpi-trend positive">Passed QA</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">In Service / Scheduled</div>
          <div class="kpi-value" style="color: #3b82f6;">${active}</div>
          <div class="kpi-trend neutral">Active queue</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Completion Rate</div>
          <div class="kpi-value">${rate}%</div>
          <div class="kpi-trend positive">Overall operational efficiency</div>
        </div>
      `;
    } else if (this.activeTab === 'revenue') {
      const data = this.getFilteredInvoices();
      const gross = data.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
      const paidCount = data.filter(inv => inv.paymentStatus === 'paid' || inv.paymentStatus === 'completed').length;
      const avgTicket = data.length > 0 ? Math.round(gross / data.length) : 0;
      const discounts = data.reduce((sum, inv) => sum + (Number(inv.discount) || 0), 0);

      container.innerHTML = `
        <div class="kpi-card">
          <div class="kpi-label">Gross Revenue</div>
          <div class="kpi-value" style="color: #10b981;">â‚¹${gross.toLocaleString()}</div>
          <div class="kpi-trend positive">Direct sales total</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Average Ticket Size</div>
          <div class="kpi-value">â‚¹${avgTicket.toLocaleString()}</div>
          <div class="kpi-trend neutral">Per customer visit</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Settled Invoices</div>
          <div class="kpi-value" style="color: #3b82f6;">${paidCount} / ${data.length}</div>
          <div class="kpi-trend positive">Paid transactions</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Total Discounts Given</div>
          <div class="kpi-value" style="color: #f59e0b;">â‚¹${discounts.toLocaleString()}</div>
          <div class="kpi-trend neutral">Promotional & package savings</div>
        </div>
      `;
    } else if (this.activeTab === 'services') {
      const data = this.getFilteredServices();
      const totalBooked = data.reduce((sum, s) => sum + s.bookingsCount, 0);
      const totalRev = data.reduce((sum, s) => sum + s.totalRevenue, 0);
      const topService = data.length > 0 ? data[0] : { name: "N/A", bookingsCount: 0 };
      const avgDuration = data.length > 0 ? Math.round(data.reduce((sum, s) => sum + (parseInt(s.duration) || 45), 0) / data.length) : 45;

      container.innerHTML = `
        <div class="kpi-card">
          <div class="kpi-label">Services Performed</div>
          <div class="kpi-value">${totalBooked}</div>
          <div class="kpi-trend positive">Total washes & details</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Top Performed Service</div>
          <div class="kpi-value" style="font-size: 18px; color: #3b82f6;">${topService.name}</div>
          <div class="kpi-trend positive">${topService.bookingsCount} bookings recorded</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Service Revenue</div>
          <div class="kpi-value" style="color: #10b981;">â‚¹${totalRev.toLocaleString()}</div>
          <div class="kpi-trend positive">Service catalog turnover</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Avg Service Duration</div>
          <div class="kpi-value">${avgDuration} mins</div>
          <div class="kpi-trend neutral">Standard bay cycle</div>
        </div>
      `;
    } else if (this.activeTab === 'staff') {
      const data = this.getFilteredStaff();
      const totalStaff = data.length;
      const totalWashes = data.reduce((sum, s) => sum + s.completedJobs, 0);
      const topStaff = data.length > 0 ? data[0] : { name: "N/A", completedJobs: 0 };
      const avgJobs = totalStaff > 0 ? Math.round(totalWashes / totalStaff) : 0;

      container.innerHTML = `
        <div class="kpi-card">
          <div class="kpi-label">Active Staff</div>
          <div class="kpi-value">${totalStaff}</div>
          <div class="kpi-trend positive">Technicians & Detailers</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Washes Handled</div>
          <div class="kpi-value" style="color: #10b981;">${totalWashes}</div>
          <div class="kpi-trend positive">Total technician throughput</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Top Detailer</div>
          <div class="kpi-value" style="font-size: 18px; color: #3b82f6;">${topStaff.name}</div>
          <div class="kpi-trend positive">${topStaff.completedJobs} jobs completed</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Avg Jobs Per Staff</div>
          <div class="kpi-value">${avgJobs}</div>
          <div class="kpi-trend neutral">Average technician quota</div>
        </div>
      `;
    }
  },

  // Render Charts for Graphical View
  renderCharts: function () {
    const grid = document.getElementById('reports-charts-grid');
    if (!grid) return;

    if (this.activeTab === 'bookings') {
      grid.innerHTML = `
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">Weekly Wash Throughput & Volume Trends</div>
            <span style="font-size: 11px; color: var(--text-tertiary);">Completed vs Pending by Day</span>
          </div>
          <div class="svg-chart-container" id="chart-bookings-primary-svg"></div>
        </div>
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">Booking Status Distribution</div>
            <span style="font-size: 11px; color: var(--text-tertiary);">Proportion by Workflow Stage</span>
          </div>
          <div class="svg-chart-container" id="chart-bookings-secondary-svg"></div>
        </div>
      `;
      this.renderBookingChart('chart-bookings-primary-svg');
      this.renderBookingStatusChart('chart-bookings-secondary-svg');
    } else if (this.activeTab === 'revenue') {
      grid.innerHTML = `
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">Revenue Trajectory Breakdown</div>
            <span style="font-size: 11px; color: var(--text-tertiary);">Gross Sales (â‚¹ Thousands)</span>
          </div>
          <div class="svg-chart-container" id="chart-revenue-primary-svg"></div>
        </div>
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">Payment Method Share</div>
            <span style="font-size: 11px; color: var(--text-tertiary);">Revenue Split by Payment Gateway</span>
          </div>
          <div class="svg-chart-container" id="chart-revenue-secondary-svg"></div>
        </div>
      `;
      this.renderRevenueChart('chart-revenue-primary-svg');
      this.renderPaymentMethodChart('chart-revenue-secondary-svg');
    } else if (this.activeTab === 'services') {
      grid.innerHTML = `
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">Top Services by Booked Volume</div>
            <span style="font-size: 11px; color: var(--text-tertiary);">Most in-demand catalog items</span>
          </div>
          <div class="svg-chart-container" id="chart-services-primary-svg"></div>
        </div>
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">Service Revenue Contribution</div>
            <span style="font-size: 11px; color: var(--text-tertiary);">Gross turnover generated by service</span>
          </div>
          <div class="svg-chart-container" id="chart-services-secondary-svg"></div>
        </div>
      `;
      this.renderServicesBarChart('chart-services-primary-svg', 'bookingsCount');
      this.renderServicesBarChart('chart-services-secondary-svg', 'totalRevenue');
    } else if (this.activeTab === 'staff') {
      grid.innerHTML = `
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">Technician Jobs Completed</div>
            <span style="font-size: 11px; color: var(--text-tertiary);">Total service checkouts per staff</span>
          </div>
          <div class="svg-chart-container" id="chart-staff-primary-svg"></div>
        </div>
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">Revenue Generated by Detailer</div>
            <span style="font-size: 11px; color: var(--text-tertiary);">Gross invoice turnover attribution</span>
          </div>
          <div class="svg-chart-container" id="chart-staff-secondary-svg"></div>
        </div>
      `;
      this.renderStaffBarChart('chart-staff-primary-svg', 'completedJobs');
      this.renderStaffBarChart('chart-staff-secondary-svg', 'revenueGenerated');
    }
  },

  // 1. Booking Volume Bar Chart
  renderBookingChart: function (containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    const completed = [12, 15, 14, 18, 22, 28, 19];
    const pending = [2, 3, 1, 4, 3, 5, 4];
    const maxVal = 35;

    const width = 540;
    const height = 180;
    const padding = { top: 20, right: 20, bottom: 30, left: 35 };
    const colWidth = (width - padding.left - padding.right) / days.length;

    let barsSvg = '';
    let labelsSvg = '';

    days.forEach((day, i) => {
      const x = padding.left + i * colWidth + (colWidth - 28) / 2;
      const hCompleted = (completed[i] / maxVal) * (height - padding.top - padding.bottom);
      const yCompleted = height - padding.bottom - hCompleted;
      const hPending = (pending[i] / maxVal) * (height - padding.top - padding.bottom);
      const yPending = yCompleted - hPending;

      barsSvg += `
        <g class="chart-bar-group" data-day="${day}" style="cursor: pointer;">
          <rect x="${x}" y="${yCompleted}" width="24" height="${hCompleted}" rx="4" fill="#2563eb">
            <title>${day}: ${completed[i]} Completed Washes</title>
          </rect>
          <rect x="${x}" y="${yPending}" width="24" height="${hPending}" rx="3" fill="#f59e0b" opacity="0.85">
            <title>${day}: ${pending[i]} In Service / Pending</title>
          </rect>
        </g>
      `;

      labelsSvg += `
        <text x="${x + 12}" y="${height - 8}" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.7" font-weight="600">
          ${day}
        </text>
      `;
    });

    let gridLinesSvg = '';
    [0, 10, 20, 30].forEach(val => {
      const y = height - padding.bottom - (val / maxVal) * (height - padding.top - padding.bottom);
      gridLinesSvg += `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="currentColor" opacity="0.1" stroke-dasharray="3 3" />
        <text x="${padding.left - 8}" y="${y + 3}" text-anchor="end" font-size="10" fill="currentColor" opacity="0.6" font-family="monospace">${val}</text>
      `;
    });

    el.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" class="chart-svg">
        ${gridLinesSvg}
        ${barsSvg}
        ${labelsSvg}
      </svg>
    `;
  },

  // 2. Booking Status Distribution Chart
  renderBookingStatusChart: function (containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const bookings = this.getFilteredBookings();
    const counts = {
      Completed: bookings.filter(b => b.bookingStatus === 'Completed').length,
      'In Progress': bookings.filter(b => b.bookingStatus === 'In Progress').length,
      Scheduled: bookings.filter(b => b.bookingStatus === 'Scheduled').length,
      Pending: bookings.filter(b => b.bookingStatus === 'Pending').length,
      Cancelled: bookings.filter(b => b.bookingStatus === 'Cancelled').length
    };
    const colors = {
      Completed: '#10b981',
      'In Progress': '#3b82f6',
      Scheduled: '#8b5cf6',
      Pending: '#f59e0b',
      Cancelled: '#ef4444'
    };

    const width = 460;
    const height = 180;
    const items = Object.entries(counts).filter(([_, v]) => v > 0);
    const maxVal = Math.max(...items.map(([_, v]) => v), 1);

    let rowsSvg = '';
    const rowH = 26;
    const startY = 18;

    items.forEach(([status, count], i) => {
      const y = startY + i * rowH;
      const barW = Math.max((count / maxVal) * 220, 8);
      const color = colors[status] || '#64748b';

      rowsSvg += `
        <text x="12" y="${y + 14}" font-size="11.5" fill="currentColor" font-weight="600" opacity="0.85">${status}</text>
        <rect x="130" y="${y + 2}" width="${barW}" height="14" rx="4" fill="${color}" opacity="0.9">
          <title>${status}: ${count} bookings</title>
        </rect>
        <text x="${140 + barW}" y="${y + 13}" font-size="11" fill="currentColor" opacity="0.75" font-family="monospace">${count} (${Math.round((count / (bookings.length || 1)) * 100)}%)</text>
      `;
    });

    el.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" class="chart-svg">
        ${rowsSvg}
      </svg>
    `;
  },

  // 3. Revenue Trajectory Spline Chart
  renderRevenueChart: function (containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const points = [48, 62, 55, 78, 92, 110, 84.2];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    const maxRev = 120;

    const width = 480;
    const height = 180;
    const padding = { top: 20, right: 20, bottom: 30, left: 45 };
    const stepX = (width - padding.left - padding.right) / (points.length - 1);

    const coords = points.map((p, idx) => {
      const x = padding.left + idx * stepX;
      const y = height - padding.bottom - (p / maxRev) * (height - padding.top - padding.bottom);
      return { x, y, val: p, day: days[idx] };
    });

    const pathD = coords.reduce((acc, pt, idx, arr) => {
      if (idx === 0) return `M ${pt.x} ${pt.y}`;
      const prev = arr[idx - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
    }, "");

    const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height - padding.bottom} L ${coords[0].x} ${height - padding.bottom} Z`;

    let dotsSvg = '';
    let labelsSvg = '';
    coords.forEach(pt => {
      dotsSvg += `
        <circle cx="${pt.x}" cy="${pt.y}" r="4.5" fill="#10b981" stroke="#ffffff" stroke-width="2" style="cursor: pointer;">
          <title>${pt.day}: â‚¹${(pt.val * 1000).toLocaleString()}</title>
        </circle>
      `;
      labelsSvg += `
        <text x="${pt.x}" y="${height - 8}" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.7" font-weight="600">${pt.day}</text>
      `;
    });

    let gridLinesSvg = '';
    [0, 40, 80, 120].forEach(val => {
      const y = height - padding.bottom - (val / maxRev) * (height - padding.top - padding.bottom);
      gridLinesSvg += `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="currentColor" opacity="0.1" stroke-dasharray="3 3" />
        <text x="${padding.left - 6}" y="${y + 3}" text-anchor="end" font-size="10" fill="currentColor" opacity="0.6" font-family="monospace">${val}k</text>
      `;
    });

    el.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" class="chart-svg">
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        ${gridLinesSvg}
        <path d="${areaD}" fill="url(#revenueGrad)" />
        <path d="${pathD}" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" />
        ${dotsSvg}
        ${labelsSvg}
      </svg>
    `;
  },

  // 4. Payment Method Share Chart
  renderPaymentMethodChart: function (containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const invoices = this.getFilteredInvoices();
    const payments = {};
    invoices.forEach(inv => {
      const m = inv.paymentMethod || "Other";
      payments[m] = (payments[m] || 0) + (Number(inv.totalAmount) || 0);
    });

    const colors = {
      Card: '#3b82f6',
      Cash: '#10b981',
      'Online / UPI': '#f59e0b',
      'Package Wash': '#8b5cf6',
      Other: '#64748b'
    };

    const width = 460;
    const height = 180;
    const items = Object.entries(payments);
    const totalRev = items.reduce((sum, [_, v]) => sum + v, 0) || 1;

    let rowsSvg = '';
    const rowH = 30;
    const startY = 20;

    items.forEach(([method, amt], i) => {
      const y = startY + i * rowH;
      const pct = Math.round((amt / totalRev) * 100);
      const barW = Math.max((amt / totalRev) * 200, 10);
      const color = colors[method] || '#64748b';

      rowsSvg += `
        <text x="12" y="${y + 14}" font-size="11.5" fill="currentColor" font-weight="600" opacity="0.85">${method}</text>
        <rect x="130" y="${y + 2}" width="${barW}" height="14" rx="4" fill="${color}" opacity="0.9">
          <title>${method}: â‚¹${amt.toLocaleString()} (${pct}%)</title>
        </rect>
        <text x="${140 + barW}" y="${y + 13}" font-size="11" fill="currentColor" opacity="0.75" font-family="monospace">â‚¹${amt.toLocaleString()} (${pct}%)</text>
      `;
    });

    el.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" class="chart-svg">
        ${rowsSvg}
      </svg>
    `;
  },

  // 5. Services Bar Chart
  renderServicesBarChart: function (containerId, metricKey) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const services = this.getFilteredServices().slice(0, 5);
    const maxVal = Math.max(...services.map(s => s[metricKey]), 1);

    const width = 480;
    const height = 180;
    const rowH = 30;
    const startY = 16;
    let rowsSvg = '';

    services.forEach((s, i) => {
      const y = startY + i * rowH;
      const val = s[metricKey];
      const barW = Math.max((val / maxVal) * 200, 8);
      const displayVal = metricKey === 'totalRevenue' ? `â‚¹${val.toLocaleString()}` : `${val} washes`;

      rowsSvg += `
        <text x="12" y="${y + 14}" font-size="11" fill="currentColor" font-weight="600" opacity="0.9">${s.name.substring(0, 18)}</text>
        <rect x="145" y="${y + 2}" width="${barW}" height="14" rx="4" fill="${metricKey === 'totalRevenue' ? '#10b981' : '#3b82f6'}" opacity="0.85">
          <title>${s.name}: ${displayVal}</title>
        </rect>
        <text x="${155 + barW}" y="${y + 13}" font-size="11" fill="currentColor" opacity="0.75" font-family="monospace">${displayVal}</text>
      `;
    });

    el.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" class="chart-svg">
        ${rowsSvg}
      </svg>
    `;
  },

  // 6. Staff Bar Chart
  renderStaffBarChart: function (containerId, metricKey) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const staff = this.getFilteredStaff().slice(0, 5);
    const maxVal = Math.max(...staff.map(s => s[metricKey]), 1);

    const width = 480;
    const height = 180;
    const rowH = 30;
    const startY = 16;
    let rowsSvg = '';

    staff.forEach((s, i) => {
      const y = startY + i * rowH;
      const val = s[metricKey];
      const barW = Math.max((val / maxVal) * 200, 8);
      const displayVal = metricKey === 'revenueGenerated' ? `â‚¹${val.toLocaleString()}` : `${val} jobs`;

      rowsSvg += `
        <text x="12" y="${y + 14}" font-size="11" fill="currentColor" font-weight="600" opacity="0.9">${s.name.substring(0, 16)}</text>
        <rect x="135" y="${y + 2}" width="${barW}" height="14" rx="4" fill="${metricKey === 'revenueGenerated' ? '#10b981' : '#f59e0b'}" opacity="0.85">
          <title>${s.name}: ${displayVal}</title>
        </rect>
        <text x="${145 + barW}" y="${y + 13}" font-size="11" fill="currentColor" opacity="0.75" font-family="monospace">${displayVal}</text>
      `;
    });

    el.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" class="chart-svg">
        ${rowsSvg}
      </svg>
    `;
  },

  // Render Table for Tabular View
  renderTable: function () {
    const thead = document.getElementById('reports-table-head');
    const tbody = document.getElementById('reports-table-body');
    const titleEl = document.getElementById('reports-table-title');
    const countEl = document.getElementById('reports-table-count');

    if (!thead || !tbody) return;

    if (this.activeTab === 'bookings') {
      const data = this.getFilteredBookings();
      if (titleEl) titleEl.textContent = 'Detailed Booking Operations Report';
      if (countEl) countEl.textContent = `Showing ${data.length} records`;

      thead.innerHTML = `
        <tr>
          <th>Booking ID</th>
          <th>Date & Time</th>
          <th>Customer</th>
          <th>Vehicle Plate</th>
          <th>Package / Service</th>
          <th>Assigned Staff</th>
          <th>Amount</th>
          <th>Payment</th>
          <th>Status</th>
        </tr>
      `;

      tbody.innerHTML = data.map(b => `
        <tr>
          <td><strong style="font-family: var(--font-mono); color: var(--primary-400);">${b.id}</strong></td>
          <td>${b.date} <span style="color: var(--text-tertiary); font-size: 11px;">${b.time}</span></td>
          <td><strong>${b.customerName}</strong></td>
          <td><span style="font-family: var(--font-mono); font-weight: 600;">${b.vehiclePlate}</span></td>
          <td>${b.serviceName}</td>
          <td>${b.assignedStaff || 'Unassigned'}</td>
          <td><strong>â‚¹${Number(b.totalAmount || 0).toLocaleString()}</strong></td>
          <td><span class="badge ${b.paymentStatus === 'paid' ? 'badge-paid' : 'badge-unpaid'}">${(b.paymentStatus || 'unpaid').toUpperCase()}</span></td>
          <td><span class="badge ${b.bookingStatus === 'Completed' ? 'badge-completed' : 'badge-progress'}">${b.bookingStatus}</span></td>
        </tr>
      `).join('');
    } else if (this.activeTab === 'revenue') {
      const data = this.getFilteredInvoices();
      if (titleEl) titleEl.textContent = 'Financial Invoices & Revenue Trajectory Report';
      if (countEl) countEl.textContent = `Showing ${data.length} records`;

      thead.innerHTML = `
        <tr>
          <th>Invoice #</th>
          <th>Date</th>
          <th>Customer</th>
          <th>Vehicle Plate</th>
          <th>Service / Package</th>
          <th>Subtotal</th>
          <th>Discount</th>
          <th>Net Amount</th>
          <th>Payment Mode</th>
          <th>Status</th>
        </tr>
      `;

      tbody.innerHTML = data.map(inv => `
        <tr>
          <td><strong style="font-family: var(--font-mono); color: var(--primary-400);">${inv.invoiceNumber}</strong></td>
          <td>${inv.date}</td>
          <td><strong>${inv.customerName}</strong></td>
          <td><span style="font-family: var(--font-mono); font-weight: 600;">${inv.vehiclePlate}</span></td>
          <td>${inv.serviceName}</td>
          <td>â‚¹${Number(inv.subtotal || 0).toLocaleString()}</td>
          <td style="color: #f59e0b;">${inv.discount ? '-â‚¹' + Number(inv.discount).toLocaleString() : 'â‚¹0'}</td>
          <td><strong style="color: #10b981;">â‚¹${Number(inv.totalAmount || 0).toLocaleString()}</strong></td>
          <td><span class="badge badge-paid">${inv.paymentMethod}</span></td>
          <td><span class="badge ${inv.paymentStatus === 'paid' ? 'badge-paid' : 'badge-unpaid'}">${(inv.invoiceStatus || inv.paymentStatus || 'PAID').toUpperCase()}</span></td>
        </tr>
      `).join('');
    } else if (this.activeTab === 'services') {
      const data = this.getFilteredServices();
      if (titleEl) titleEl.textContent = 'Service Catalog Popularity & Turnover Report';
      if (countEl) countEl.textContent = `Showing ${data.length} services`;

      thead.innerHTML = `
        <tr>
          <th>Service Name</th>
          <th>Category</th>
          <th>Target Vehicle</th>
          <th>Duration</th>
          <th>Standard Price</th>
          <th>Bookings Count</th>
          <th>Total Revenue</th>
        </tr>
      `;

      tbody.innerHTML = data.map(s => `
        <tr>
          <td><strong>${s.name}</strong></td>
          <td><span class="badge badge-paid">${s.category}</span></td>
          <td>${s.targetVehicle || 'All Types'}</td>
          <td>${s.duration}</td>
          <td>â‚¹${Number(s.price || 0).toLocaleString()}</td>
          <td><strong style="font-size: 13px; color: var(--primary-400);">${s.bookingsCount} washes</strong></td>
          <td><strong style="color: #10b981;">â‚¹${s.totalRevenue.toLocaleString()}</strong></td>
        </tr>
      `).join('');
    } else if (this.activeTab === 'staff') {
      const data = this.getFilteredStaff();
      if (titleEl) titleEl.textContent = 'Technician & Staff Performance Report';
      if (countEl) countEl.textContent = `Showing ${data.length} staff members`;

      thead.innerHTML = `
        <tr>
          <th>Staff Name</th>
          <th>Assigned Role</th>
          <th>Phone Contact</th>
          <th>Bay Assignment</th>
          <th>Washes Handled</th>
          <th>Revenue Attribution</th>
          <th>Status</th>
        </tr>
      `;

      tbody.innerHTML = data.map(s => `
        <tr>
          <td><strong>${s.name}</strong></td>
          <td><span class="badge badge-paid">${s.role}</span></td>
          <td>${s.phone || 'N/A'}</td>
          <td>${s.assignedBay || 'Bay 1 / Main Area'}</td>
          <td><strong style="font-size: 13px; color: #f59e0b;">${s.completedJobs} jobs</strong></td>
          <td><strong style="color: #10b981;">â‚¹${s.revenueGenerated.toLocaleString()}</strong></td>
          <td><span class="badge ${s.status === 'Active' ? 'badge-paid' : 'badge-unpaid'}">${s.status || 'Active'}</span></td>
        </tr>
      `).join('');
    }
  },

  // Export Active Report to CSV
  exportActiveReport: function () {
    let headers = [];
    let rows = [];
    const dateStamp = new Date().toISOString().split('T')[0];
    let filename = `Ginger_${this.activeTab.toUpperCase()}_Report_${dateStamp}.csv`;

    if (this.activeTab === 'bookings') {
      const data = this.getFilteredBookings();
      headers = ["Booking ID", "Date", "Time", "Customer Name", "Vehicle Plate", "Service/Package", "Staff", "Total Amount", "Payment Status", "Booking Status"];
      rows = data.map(b => [
        b.id,
        b.date,
        b.time,
        `"${b.customerName}"`,
        `"${b.vehiclePlate}"`,
        `"${b.serviceName}"`,
        `"${b.assignedStaff || 'Unassigned'}"`,
        b.totalAmount,
        b.paymentStatus,
        b.bookingStatus
      ]);
    } else if (this.activeTab === 'revenue') {
      const data = this.getFilteredInvoices();
      headers = ["Invoice #", "Date", "Customer Name", "Vehicle Plate", "Service Name", "Subtotal", "Discount", "Total Amount", "Payment Method", "Status"];
      rows = data.map(inv => [
        inv.invoiceNumber,
        inv.date,
        `"${inv.customerName}"`,
        `"${inv.vehiclePlate}"`,
        `"${inv.serviceName}"`,
        inv.subtotal,
        inv.discount || 0,
        inv.totalAmount,
        `"${inv.paymentMethod}"`,
        inv.paymentStatus
      ]);
    } else if (this.activeTab === 'services') {
      const data = this.getFilteredServices();
      headers = ["Service Name", "Category", "Target Vehicle", "Duration", "Standard Price", "Bookings Count", "Total Revenue"];
      rows = data.map(s => [
        `"${s.name}"`,
        `"${s.category}"`,
        `"${s.targetVehicle || 'All'}"`,
        s.duration,
        s.price,
        s.bookingsCount,
        s.totalRevenue
      ]);
    } else if (this.activeTab === 'staff') {
      const data = this.getFilteredStaff();
      headers = ["Staff Name", "Role", "Phone", "Station Bay", "Completed Jobs", "Revenue Generated", "Status"];
      rows = data.map(s => [
        `"${s.name}"`,
        `"${s.role}"`,
        `"${s.phone || ''}"`,
        `"${s.assignedBay || ''}"`,
        s.completedJobs,
        s.revenueGenerated,
        s.status || 'Active'
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.GingerApp?.showToast(`Exported ${this.activeTab} report to CSV successfully!`, 'success');
  },

  // Legacy CSV export helper compatibility
  exportToCsv: function (type) {
    if (type === 'bookings' || type === 'revenue' || type === 'services' || type === 'staff') {
      this.activeTab = type;
      this.exportActiveReport();
    } else if (type === 'packages') {
      let headers = ["Package ID", "Name", "Category", "Vehicle Type", "Total Washes", "Validity", "Price", "Status"];
      let rows = (window.GingerApp?.data?.packages || []).map(p => [
        p.id, `"${p.name}"`, `"${p.packageType}"`, `"${p.vehicleType}"`, p.totalWashes || 5, `"${p.validityDuration || '30 Days'}"`, p.packagePrice, p.status
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Ginger_Packages_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.GingerApp?.showToast('Exported packages report to CSV!', 'success');
    } else if (type === 'billing') {
      this.activeTab = 'revenue';
      this.exportActiveReport();
    }
  },

  // =========================================================================
  // DASHBOARD CHARTS RENDERER
  // =========================================================================
  renderDashboardCharts: function (bookingContainerId = 'chart-bookings-overview-svg', revenueContainerId = 'chart-revenue-overview-svg') {
    this.renderBookingChart(bookingContainerId);
    this.renderRevenueChart(revenueContainerId);
  },

  // Interactive Booking Overview SVG Chart for Dashboard
  renderBookingChart: function (containerId = 'chart-bookings-overview-svg') {
    const el = document.getElementById(containerId);
    if (!el) return;

    // 7-day data simulation matching active bookings distribution
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    const completed = [12, 15, 14, 18, 22, 28, 19];
    const pending = [2, 3, 1, 4, 3, 5, 4];
    const maxVal = 35;

    const width = 540;
    const height = 180;
    const padding = { top: 20, right: 20, bottom: 30, left: 35 };

    const colWidth = (width - padding.left - padding.right) / days.length;

    let barsSvg = '';
    let labelsSvg = '';

    days.forEach((day, i) => {
      const x = padding.left + i * colWidth + (colWidth - 28) / 2;
      const hCompleted = (completed[i] / maxVal) * (height - padding.top - padding.bottom);
      const yCompleted = height - padding.bottom - hCompleted;

      const hPending = (pending[i] / maxVal) * (height - padding.top - padding.bottom);
      const yPending = yCompleted - hPending;

      barsSvg += `
        <g class="chart-bar-group" data-day="${day}" style="cursor: pointer;">
          <!-- Completed Bar -->
          <rect x="${x}" y="${yCompleted}" width="24" height="${hCompleted}" rx="4" fill="#2563eb">
            <title>${day}: ${completed[i]} Completed Washes</title>
          </rect>
          <!-- In Service / Pending Bar -->
          <rect x="${x}" y="${yPending}" width="24" height="${hPending}" rx="3" fill="#f59e0b" opacity="0.88">
            <title>${day}: ${pending[i]} In Bay / Pending</title>
          </rect>
        </g>
      `;

      labelsSvg += `
        <text x="${x + 12}" y="${height - 8}" text-anchor="middle" font-size="11" fill="var(--text-tertiary, #64748b)" font-weight="600">
          ${day}
        </text>
      `;
    });

    // Horizontal grid lines
    let gridLinesSvg = '';
    [0, 10, 20, 30].forEach(val => {
      const y = height - padding.bottom - (val / maxVal) * (height - padding.top - padding.bottom);
      gridLinesSvg += `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="currentColor" stroke-opacity="0.08" stroke-dasharray="3 3" />
        <text x="${padding.left - 8}" y="${y + 3}" text-anchor="end" font-size="10" fill="var(--text-tertiary, #64748b)" font-family="monospace">${val}</text>
      `;
    });

    el.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" class="chart-svg" style="width: 100%; height: 100%; overflow: visible;">
        ${gridLinesSvg}
        ${barsSvg}
        ${labelsSvg}
      </svg>
    `;
  },

  // Interactive Revenue Overview SVG Chart for Dashboard
  renderRevenueChart: function (containerId = 'chart-revenue-overview-svg') {
    const el = document.getElementById(containerId);
    if (!el) return;

    // Daily revenue points (in thousands)
    const points = [48, 62, 55, 78, 92, 110, 84.2];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    const maxRev = 120;

    const width = 420;
    const height = 180;
    const padding = { top: 20, right: 20, bottom: 30, left: 45 };

    const stepX = (width - padding.left - padding.right) / (points.length - 1);

    const coords = points.map((p, idx) => {
      const x = padding.left + idx * stepX;
      const y = height - padding.bottom - (p / maxRev) * (height - padding.top - padding.bottom);
      return { x, y, val: p, day: days[idx] };
    });

    // Generate smooth cubic bezier line path and area path
    const pathD = coords.reduce((acc, pt, idx, arr) => {
      if (idx === 0) return `M ${pt.x} ${pt.y}`;
      const prev = arr[idx - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
    }, "");

    const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height - padding.bottom} L ${coords[0].x} ${height - padding.bottom} Z`;

    let dotsSvg = '';
    let labelsSvg = '';
    coords.forEach(pt => {
      dotsSvg += `
        <circle cx="${pt.x}" cy="${pt.y}" r="4.5" fill="#10b981" stroke="var(--bg-surface-elevated, #090d16)" stroke-width="2" style="cursor: pointer;">
          <title>${pt.day}: â‚¹${(pt.val * 1000).toLocaleString()}</title>
        </circle>
      `;
      labelsSvg += `
        <text x="${pt.x}" y="${height - 8}" text-anchor="middle" font-size="11" fill="var(--text-tertiary, #64748b)" font-weight="600">${pt.day}</text>
      `;
    });

    let gridLinesSvg = '';
    [0, 40, 80, 120].forEach(val => {
      const y = height - padding.bottom - (val / maxRev) * (height - padding.top - padding.bottom);
      gridLinesSvg += `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="currentColor" stroke-opacity="0.08" stroke-dasharray="3 3" />
        <text x="${padding.left - 6}" y="${y + 3}" text-anchor="end" font-size="10" fill="var(--text-tertiary, #64748b)" font-family="monospace">${val}k</text>
      `;
    });

    el.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" class="chart-svg" style="width: 100%; height: 100%; overflow: visible;">
        <defs>
          <linearGradient id="revenueGradDashboard" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        ${gridLinesSvg}
        <path d="${areaD}" fill="url(#revenueGradDashboard)" />
        <path d="${pathD}" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" />
        ${dotsSvg}
        ${labelsSvg}
      </svg>
    `;
  }
};

window.ReportsEngine = ReportsEngine;
