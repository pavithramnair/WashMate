/**
 * GINGER CARWASH SERVICES - Simple Booking Status & Service Workflow Engine
 *
 * Streamlined lifecycle:
 * Booking Confirmed -> Vehicle Checked In -> Service In Progress -> Quality Check -> Ready for Pickup -> Completed (and Cancelled)
 */

const WorkflowEngine = {
  // 6 Standard Workflow Stages
  stages: [
    { id: 1, key: "Confirmed", label: "Confirmed", desc: "Booking Confirmed" },
    { id: 2, key: "Checked In", label: "Checked In", desc: "Vehicle Checked In" },
    { id: 3, key: "In Service", label: "In Service", desc: "Service In Progress" },
    { id: 4, key: "Quality Check", label: "Quality Check", desc: "Quality Check" },
    { id: 5, key: "Ready for Pickup", label: "Ready for Pickup", desc: "Ready for Pickup" },
    { id: 6, key: "Completed", label: "Completed", desc: "Completed" }
  ],

  getStageIndex: function(status) {
    switch ((status || '').toLowerCase()) {
      case 'confirmed':
      case 'booking confirmed':
      case 'booking received':
      case 'pending':
        return 1;
      case 'checked in':
      case 'vehicle checked in':
      case 'vehicle check-in':
      case 'vehicle inspection':
        return 2;
      case 'in service':
      case 'service in progress':
      case 'service started':
        return 3;
      case 'quality check':
      case 'quality inspection':
        return 4;
      case 'ready for pickup':
      case 'vehicle ready for pickup':
      case 'customer notification':
        return 5;
      case 'completed':
      case 'service completed':
      case 'vehicle handed over':
      case 'booking closed':
        return 6;
      case 'cancelled':
        return -1;
      default:
        return 1;
    }
  },

  getBadgeClass: function(statusOrIdx) {
    if (typeof statusOrIdx === 'number') {
      if (statusOrIdx === 1) return 'badge-confirmed';
      if (statusOrIdx === 2) return 'badge-checked-in';
      if (statusOrIdx === 3) return 'badge-in-service';
      if (statusOrIdx === 4) return 'badge-quality-check';
      if (statusOrIdx === 5) return 'badge-ready';
      if (statusOrIdx === 6) return 'badge-completed';
      return 'badge-confirmed';
    }

    const s = (statusOrIdx || '').toLowerCase();
    if (s.includes('cancel')) return 'badge-unpaid';
    if (s.includes('ready')) return 'badge-ready';
    if (s.includes('quality') || s.includes('qc')) return 'badge-quality-check';
    if (s.includes('service') || s.includes('progress')) return 'badge-in-service';
    if (s.includes('check')) return 'badge-checked-in';
    if (s.includes('complete') || s.includes('closed') || s.includes('paid')) return 'badge-completed';
    return 'badge-confirmed';
  },

  // Open detailed Booking Modal with Timeline and Quick Status Change
  openBookingDetails: function(bookingId) {
    const b = window.GingerApp.data.bookings.find(item => item.id === bookingId);
    if (!b) return;

    window.GingerApp.activeBookingDetailsId = bookingId;

    const modalEl = document.getElementById('booking-details-modal');
    if (!modalEl) return;

    const curStageIdx = this.getStageIndex(b.bookingStatus);

    // Render 6-Stage Timeline Stepper
    const stepperContainer = document.getElementById('booking-status-timeline-track');
    if (stepperContainer) {
      if (b.bookingStatus === 'Cancelled') {
        stepperContainer.innerHTML = `
          <div style="width: 100%; text-align: center; padding: 10px; background: rgba(239, 68, 68, 0.1); border-radius: var(--radius-md); color: #f87171; font-weight: 700;">
            ✕ This booking was cancelled.
          </div>
        `;
      } else {
        stepperContainer.innerHTML = this.stages.map((stg) => {
          const isDone = stg.id < curStageIdx;
          const isCurrent = stg.id === curStageIdx;
          return `
            <div class="status-track-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}" 
                 onclick="WorkflowEngine.updateBookingStatus('${b.id}', '${stg.label}', 'Advanced to ${stg.label} via timeline track')"
                 title="Click to set status to ${stg.label}">
              <div class="status-step-circle">
                ${isDone ? '✓' : stg.id}
              </div>
              <div class="status-step-label">${stg.label}</div>
            </div>
          `;
        }).join('');
      }
    }

    // Set Header info
    const idTitle = document.getElementById('modal-booking-id-title');
    if (idTitle) idTitle.textContent = b.id;

    const badgeWrap = document.getElementById('modal-booking-status-badge');
    if (badgeWrap) {
      badgeWrap.innerHTML = `
        <span class="badge ${this.getBadgeClass(b.bookingStatus)}" style="font-size: 12px; padding: 4px 10px;">
          ${b.bookingStatus}
        </span>
      `;
    }

    // Quick Status select dropdown in header
    const quickSelect = document.getElementById('bd-quick-status-select');
    if (quickSelect) {
      quickSelect.value = b.bookingStatus;
    }

    // Customer & Vehicle Metadata
    const custNameEl = document.getElementById('bd-customer-name');
    if (custNameEl) custNameEl.textContent = b.customerName;

    const custPhoneEl = document.getElementById('bd-customer-phone');
    if (custPhoneEl) custPhoneEl.textContent = b.customerPhone || 'N/A';

    const vehPlateEl = document.getElementById('bd-vehicle-plate');
    if (vehPlateEl) vehPlateEl.textContent = b.vehiclePlate;

    const vehModelEl = document.getElementById('bd-vehicle-model');
    if (vehModelEl) vehModelEl.textContent = b.vehicleModel;

    const srvNameEl = document.getElementById('bd-service-name');
    if (srvNameEl) srvNameEl.textContent = b.serviceName;

    const staffEl = document.getElementById('bd-assigned-staff');
    if (staffEl) staffEl.textContent = b.assignedStaff || 'Tariq Mansoor';

    const totEl = document.getElementById('bd-total-amount');
    if (totEl) totEl.textContent = `${window.GingerApp.data.settings.currency} ${Number(b.totalAmount).toLocaleString()}`;

    const payStatusEl = document.getElementById('bd-payment-status');
    if (payStatusEl) {
      payStatusEl.innerHTML = `
        <span class="badge ${b.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-unpaid'}">${b.paymentStatus}</span>
      `;
    }

    // Render Timeline history
    const timelineEl = document.getElementById('bd-timeline-steps');
    if (timelineEl) {
      const historyList = b.timeline || [
        { stage: "Booking Confirmed", time: b.time, actor: "Front Desk", note: "Booking recorded" }
      ];

      timelineEl.innerHTML = historyList.map((step) => `
        <div class="timeline-step-item completed">
          <div class="timeline-marker">✓</div>
          <div class="timeline-title-row">
            <span class="timeline-title">${step.stage}</span>
            <span class="timeline-time">${step.time}</span>
          </div>
          <div class="timeline-desc">${step.note || 'Service milestone logged by operations team.'}</div>
          <div class="timeline-actor">Logged by: ${step.actor || 'Operations'}</div>
        </div>
      `).join('');
    }

    // Inspection Photos
    const beforePhotoEl = document.getElementById('bd-photo-before');
    const afterPhotoEl = document.getElementById('bd-photo-after');
    if (beforePhotoEl) beforePhotoEl.src = b.beforePhoto || 'assets/images/vehicle_before.jpg';
    if (afterPhotoEl) afterPhotoEl.src = b.afterPhoto || 'assets/images/vehicle_after.jpg';

    // View invoice button
    const viewInvBtn = document.getElementById('bd-btn-view-invoice');
    if (viewInvBtn) {
      viewInvBtn.onclick = function() {
        const inv = window.GingerApp.data.invoices.find(i => i.bookingId === b.id);
        if (inv) {
          window.GingerApp.closeModal('booking-details-modal');
          InvoiceEngine.renderModal(inv.invoiceNumber);
        } else {
          const newInv = InvoiceEngine.createFromBooking(b);
          window.GingerApp.closeModal('booking-details-modal');
          InvoiceEngine.renderModal(newInv.invoiceNumber);
        }
      };
    }

    window.GingerApp.openModal('booking-details-modal');
  },

  // Update Booking Status with note and history logging
  updateBookingStatus: function(bookingId, newStatus, note) {
    const b = window.GingerApp.data.bookings.find(item => item.id === bookingId);
    if (!b) return;

    const oldStatus = b.bookingStatus;
    b.bookingStatus = newStatus;
    b.currentStageIndex = this.getStageIndex(newStatus);
    b.stageTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    b.stageActor = window.GingerApp.currentUser ? window.GingerApp.currentUser.name : "Staff";

    if (!b.timeline) b.timeline = [];
    b.timeline.push({
      stage: newStatus,
      time: b.stageTimestamp,
      actor: b.stageActor,
      note: note || `Status updated from ${oldStatus} to ${newStatus}`
    });

    // Sync vehicle status and individual service history for all vehicles in booking
    const vehiclesToSync = (b.vehicleServices && b.vehicleServices.length > 0)
      ? b.vehicleServices.map(vs => ({ plate: vs.vehiclePlate || vs.plate, service: vs.serviceName, amount: vs.vehicleTotal || vs.finalPrice }))
      : [{ plate: b.vehiclePlate, service: b.serviceName, amount: b.totalAmount }];

    vehiclesToSync.forEach(item => {
      const v = window.GingerApp.data.vehicles.find(veh => veh.plateNumber === item.plate);
      if (v) {
        if (newStatus === 'Completed') {
          v.status = 'Completed';
          v.lastService = new Date().toISOString().split('T')[0];
          v.totalServices = (v.totalServices || 0) + 1;
          if (!v.serviceHistory) v.serviceHistory = [];
          const existingEntry = v.serviceHistory.find(h => h.bookingId === b.id);
          if (existingEntry) {
            existingEntry.status = 'Completed';
          } else {
            v.serviceHistory.unshift({
              date: b.date,
              service: item.service || b.serviceName,
              amount: item.amount || b.totalAmount,
              staff: b.assignedStaff,
              status: 'Completed',
              bookingId: b.id
            });
          }
        } else {
          v.status = newStatus;
        }
      }
    });

    window.GingerApp.saveState();
    window.GingerApp.showToast(`Booking ${bookingId} status updated to "${newStatus}"`, 'success');

    // Re-render relevant tables & dashboards
    window.GingerApp.renderBookingsTable();
    window.GingerApp.renderDashboard();

    // If booking details modal is open, refresh it
    const detailsModal = document.getElementById('booking-details-modal');
    if (detailsModal && detailsModal.classList.contains('active')) {
      this.openBookingDetails(bookingId);
    }
  },

  // Fallback board renderer (no-op or redirects to booking status)
  renderBoard: function() {
    window.GingerApp.navigateTo('bookings');
  }
};

window.WorkflowEngine = WorkflowEngine;
