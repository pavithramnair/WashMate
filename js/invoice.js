/**
 * Ginger WashMate - Billing, Editable Invoice & Audit History Engine
 */

const InvoiceEngine = {
  // Check if current user has permission to edit invoices
  canUserEditInvoice: function() {
    const userRoleName = window.GingerApp?.data?.currentUser?.role || "Super Admin";
    const roleObj = window.GingerApp?.data?.roles?.find(r => r.role === userRoleName);
    if (roleObj && typeof roleObj.canEditInvoices !== 'undefined') {
      return roleObj.canEditInvoices;
    }
    // Default fallback: Super Admin and Admin can edit
    return ["Super Admin", "Admin", "Branch Manager"].includes(userRoleName);
  },

  getStatusBadgeClass: function(status) {
    const s = (status || "").toLowerCase();
    if (s === "paid") return "badge-paid";
    if (s.includes("partially")) return "badge-partial";
    if (s.includes("pending")) return "badge-unpaid";
    if (s === "draft") return "badge-pending";
    if (s === "generated") return "badge-confirmed";
    if (s === "cancelled") return "badge-cancelled";
    if (s === "refunded") return "badge-cancelled";
    return "badge-pending";
  },

  // Render an invoice modal given an invoice record
  renderModal: function(invId) {
    const inv = window.GingerApp.data.invoices.find(i => i.invoiceNumber === invId);
    if (!inv) {
      window.GingerApp.showToast("Invoice not found", "error");
      return;
    }

    const settings = window.GingerApp.data.settings;
    const modalEl = document.getElementById('printable-invoice-modal');
    if (!modalEl) return;

    const container = document.getElementById('invoice-render-sheet');
    if (!container) return;

    const itemsRowsHtml = inv.items.map((item, idx) => `
      <tr>
        <td style="font-weight: 500;">${item.description}</td>
        <td style="text-align: center;">${item.qty}</td>
        <td style="text-align: right; font-family: var(--font-mono);">${settings.currency} ${Number(item.unitPrice).toLocaleString()}</td>
        <td style="text-align: right; font-weight: 600; font-family: var(--font-mono);">${settings.currency} ${(item.qty * item.unitPrice).toLocaleString()}</td>
      </tr>
    `).join('');

    // Audit History HTML
    const auditHtml = (inv.auditHistory && inv.auditHistory.length > 0) ? `
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px dashed #cbd5e1; font-size: 11.5px;">
        <div style="font-weight: 700; color: #0f172a; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
          Invoice Modification Audit Trail
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${inv.auditHistory.map(entry => `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 10px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-weight: 600; color: #2563eb;">${entry.modifiedBy}</span>: 
                <span style="color: #475569;">${entry.reason || 'Record updated.'}</span>
              </div>
              <div style="font-family: var(--font-mono); font-size: 10.5px; color: #64748b;">
                ${entry.date} ${entry.time || ''} • Total: ${settings.currency} ${Number(entry.updatedAmount || inv.totalAmount).toLocaleString()}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    container.innerHTML = `
      <div class="invoice-sheet">
        <div class="invoice-header-row">
          <div class="invoice-brand">
            <div class="invoice-brand-title">${settings.businessName}</div>
            <div class="invoice-company-details">
              ${settings.branchName}<br>
              ${settings.address}<br>
              Phone: ${settings.phone} | Email: ${settings.email}
            </div>
          </div>
          <div class="invoice-meta-block">
            <div class="invoice-big-number">${inv.invoiceNumber}</div>
            <div class="invoice-meta-line"><strong>Date:</strong> ${inv.date}</div>
            <div class="invoice-meta-line"><strong>Booking Ref:</strong> <span style="font-family: var(--font-mono);">${inv.bookingId}</span></div>
            <div class="invoice-meta-line" style="margin-top: 6px;">
              <span class="badge ${InvoiceEngine.getStatusBadgeClass(inv.invoiceStatus || inv.paymentStatus)}">
                ${(inv.invoiceStatus || inv.paymentStatus).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div class="invoice-billing-cols">
          <div class="invoice-info-card">
            <div class="invoice-card-heading">Billed To (Customer)</div>
            <div class="invoice-customer-name">${inv.customerName}</div>
            <div class="invoice-card-text">Customer ID: ${inv.customerId}</div>
            <div class="invoice-card-text">Payment Mode: ${inv.paymentMethod}</div>
          </div>
          <div class="invoice-info-card">
            <div class="invoice-card-heading">Vehicle Details</div>
            <div class="invoice-customer-name" style="font-family: var(--font-mono);">${inv.vehiclePlate}</div>
            <div class="invoice-card-text">${inv.vehicleModel}</div>
            <div class="invoice-card-text">Service / Package: ${inv.serviceName}</div>
          </div>
        </div>

        <table class="invoice-table">
          <thead>
            <tr>
              <th>Description (Service / Package / Add-on)</th>
              <th style="text-align: center; width: 60px;">Qty</th>
              <th style="text-align: right; width: 120px;">Unit Rate</th>
              <th style="text-align: right; width: 130px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRowsHtml}
          </tbody>
        </table>

        <div class="invoice-totals-area">
          <div class="invoice-totals-box">
            <div class="invoice-total-line">
              <span>Subtotal:</span>
              <span style="font-family: var(--font-mono);">${settings.currency} ${Number(inv.subtotal).toLocaleString()}</span>
            </div>
            ${inv.discount > 0 ? `
              <div class="invoice-total-line" style="color: #10b981;">
                <span>Offer / Discount:</span>
                <span style="font-family: var(--font-mono);">- ${settings.currency} ${Number(inv.discount).toLocaleString()}</span>
              </div>
            ` : ''}
            <div class="invoice-total-line grand-total">
              <span>Grand Total:</span>
              <span style="font-family: var(--font-mono); color: #2563eb;">${settings.currency} ${Number(inv.totalAmount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        ${inv.notes ? `
          <div style="font-size: 11.5px; color: #64748b; margin-bottom: 16px; background: #f8fafc; padding: 8px 12px; border-radius: 4px; border-left: 3px solid #3b82f6;">
            <strong>Special Invoice Notes:</strong> ${inv.notes}
          </div>
        ` : ''}

        <div class="invoice-footer-notes">
          <div>
            <strong>Terms & Conditions:</strong><br>
            All services backed by Ginger WashMate 100% Quality Guarantee.<br>
            Thank you for choosing Ginger WashMate!
          </div>
          <div style="text-align: right;">
            <div style="border-bottom: 1px solid #94a3b8; width: 160px; height: 35px; margin-bottom: 4px;"></div>
            <strong>Authorized Signatory</strong>
          </div>
        </div>

        ${auditHtml}
      </div>
    `;

    // Setup action buttons in modal
    const printBtn = document.getElementById('btn-print-invoice-action');
    if (printBtn) {
      printBtn.onclick = function() {
        modalEl.classList.add('printing');
        window.print();
        setTimeout(() => modalEl.classList.remove('printing'), 800);
      };
    }

    const editBtn = document.getElementById('btn-edit-invoice-action');
    if (editBtn) {
      if (this.canUserEditInvoice()) {
        editBtn.style.display = 'inline-flex';
        editBtn.onclick = function() {
          InvoiceEngine.openEditModal(inv.invoiceNumber);
        };
      } else {
        editBtn.style.display = 'none';
      }
    }

    const payBtn = document.getElementById('btn-record-payment-from-inv');
    if (payBtn) {
      if (inv.paymentStatus === 'Paid' || inv.invoiceStatus === 'Paid') {
        payBtn.style.display = 'none';
      } else {
        payBtn.style.display = 'inline-flex';
        payBtn.onclick = function() {
          InvoiceEngine.openPaymentModal(inv.invoiceNumber);
        };
      }
    }

    const sendBtn = document.getElementById('btn-send-invoice-action');
    if (sendBtn) {
      sendBtn.onclick = function() {
        InvoiceEngine.sendInvoice(inv.invoiceNumber);
      };
    }

    const downloadBtn = document.getElementById('btn-download-invoice-action');
    if (downloadBtn) {
      downloadBtn.onclick = function() {
        InvoiceEngine.downloadInvoice(inv.invoiceNumber);
      };
    }

    window.GingerApp.openModal('printable-invoice-modal');
  },

  // Open Edit Invoice Modal (Editable items, prices, discount, and audit reason)
  openEditModal: function(invId) {
    if (!this.canUserEditInvoice()) {
      window.GingerApp.showToast("Access Denied: Your role does not permit editing invoices.", "error");
      return;
    }

    const inv = window.GingerApp.data.invoices.find(i => i.invoiceNumber === invId);
    if (!inv) return;

    window.GingerApp.closeModal('printable-invoice-modal');

    document.getElementById('edit-inv-number-badge').textContent = inv.invoiceNumber;
    document.getElementById('edit-inv-id-hidden').value = inv.invoiceNumber;
    document.getElementById('edit-inv-customer').value = inv.customerName;
    document.getElementById('edit-inv-vehicle').value = `${inv.vehiclePlate} (${inv.vehicleModel})`;
    document.getElementById('edit-inv-discount').value = inv.discount || 0;
    document.getElementById('edit-inv-status').value = inv.invoiceStatus || inv.paymentStatus || "Generated";
    document.getElementById('edit-inv-notes').value = inv.notes || "";
    document.getElementById('edit-inv-reason').value = "";

    // Render Editable Line Items Table
    this.renderEditLineItems(inv.items);
    this.recalculateEditInvoice();

    window.GingerApp.openModal('edit-invoice-modal');
  },

  renderEditLineItems: function(items) {
    const tbody = document.getElementById('edit-inv-items-body');
    if (!tbody) return;

    tbody.innerHTML = items.map((item, idx) => `
      <tr data-index="${idx}">
        <td>
          <input type="text" class="form-control form-control-sm edit-item-desc" value="${item.description}" required>
        </td>
        <td style="width: 80px;">
          <input type="number" class="form-control form-control-sm edit-item-qty" value="${item.qty}" min="1" oninput="InvoiceEngine.recalculateEditInvoice()" required>
        </td>
        <td style="width: 130px;">
          <input type="number" class="form-control form-control-sm edit-item-price" value="${item.unitPrice}" min="0" oninput="InvoiceEngine.recalculateEditInvoice()" required>
        </td>
        <td style="width: 120px; text-align: right; font-weight: 700; font-family: var(--font-mono); vertical-align: middle;">
          <span class="edit-item-row-total">${(item.qty * item.unitPrice).toLocaleString()}</span>
        </td>
        <td style="width: 40px; text-align: center; vertical-align: middle;">
          <button type="button" class="table-icon-btn danger-action" onclick="InvoiceEngine.removeEditLineItem(${idx})" title="Remove item">✕</button>
        </td>
      </tr>
    `).join('');
  },

  addEditLineItem: function() {
    const tbody = document.getElementById('edit-inv-items-body');
    if (!tbody) return;

    const row = document.createElement('tr');
    const idx = tbody.children.length;
    row.dataset.index = idx;
    row.innerHTML = `
      <td>
        <input type="text" class="form-control form-control-sm edit-item-desc" placeholder="Service / Add-on description" required>
      </td>
      <td style="width: 80px;">
        <input type="number" class="form-control form-control-sm edit-item-qty" value="1" min="1" oninput="InvoiceEngine.recalculateEditInvoice()" required>
      </td>
      <td style="width: 130px;">
        <input type="number" class="form-control form-control-sm edit-item-price" value="500" min="0" oninput="InvoiceEngine.recalculateEditInvoice()" required>
      </td>
      <td style="width: 120px; text-align: right; font-weight: 700; font-family: var(--font-mono); vertical-align: middle;">
        <span class="edit-item-row-total">500</span>
      </td>
      <td style="width: 40px; text-align: center; vertical-align: middle;">
        <button type="button" class="table-icon-btn danger-action" onclick="this.closest('tr').remove(); InvoiceEngine.recalculateEditInvoice();" title="Remove item">✕</button>
      </td>
    `;
    tbody.appendChild(row);
    this.recalculateEditInvoice();
  },

  removeEditLineItem: function(idx) {
    const tbody = document.getElementById('edit-inv-items-body');
    if (!tbody) return;
    if (tbody.children.length <= 1) {
      window.GingerApp.showToast("An invoice must contain at least one line item.", "warning");
      return;
    }
    const row = tbody.querySelector(`tr[data-index="${idx}"]`);
    if (row) row.remove();
    this.recalculateEditInvoice();
  },

  recalculateEditInvoice: function() {
    const tbody = document.getElementById('edit-inv-items-body');
    if (!tbody) return;

    let subtotal = 0;
    Array.from(tbody.querySelectorAll('tr')).forEach(row => {
      const qty = parseFloat(row.querySelector('.edit-item-qty')?.value || 0);
      const price = parseFloat(row.querySelector('.edit-item-price')?.value || 0);
      const lineTotal = qty * price;
      const totalSpan = row.querySelector('.edit-item-row-total');
      if (totalSpan) totalSpan.textContent = lineTotal.toLocaleString();
      subtotal += lineTotal;
    });

    const discount = parseFloat(document.getElementById('edit-inv-discount')?.value || 0);
    const grandTotal = Math.max(0, subtotal - discount);

    const curr = window.GingerApp.data.settings.currency;
    document.getElementById('edit-inv-calc-subtotal').textContent = `${curr} ${subtotal.toLocaleString()}`;
    const elTax = document.getElementById('edit-inv-calc-tax');
    if (elTax) elTax.textContent = `${curr} 0`;
    document.getElementById('edit-inv-calc-grandtotal').textContent = `${curr} ${grandTotal.toLocaleString()}`;
  },

  saveEditedInvoice: function(e) {
    if (e) e.preventDefault();
    const invId = document.getElementById('edit-inv-id-hidden').value;
    const inv = window.GingerApp.data.invoices.find(i => i.invoiceNumber === invId);
    if (!inv) return;

    const reason = document.getElementById('edit-inv-reason').value.trim();
    if (!reason) {
      window.GingerApp.showToast("Please enter a reason for modifying this invoice (Audit requirement).", "error");
      return;
    }

    const tbody = document.getElementById('edit-inv-items-body');
    const newItems = [];
    let subtotal = 0;

    Array.from(tbody.querySelectorAll('tr')).forEach(row => {
      const desc = row.querySelector('.edit-item-desc').value.trim();
      const qty = parseInt(row.querySelector('.edit-item-qty').value, 10) || 1;
      const unitPrice = parseFloat(row.querySelector('.edit-item-price').value) || 0;
      newItems.push({
        description: desc,
        qty: qty,
        unitPrice: unitPrice,
        amount: qty * unitPrice
      });
      subtotal += qty * unitPrice;
    });

    if (newItems.length === 0) {
      window.GingerApp.showToast("At least one line item is required.", "error");
      return;
    }

    const discount = parseFloat(document.getElementById('edit-inv-discount').value) || 0;
    const grandTotal = Math.max(0, subtotal - discount);

    const previousAmount = inv.totalAmount;
    inv.items = newItems;
    inv.subtotal = subtotal;
    inv.discount = discount;
    inv.tax = 0;
    inv.totalAmount = grandTotal;
    inv.invoiceStatus = document.getElementById('edit-inv-status').value;
    inv.paymentStatus = (inv.invoiceStatus === "Paid") ? "Paid" : (inv.invoiceStatus === "Partially Paid" ? "Partially Paid" : "Pending");
    inv.notes = document.getElementById('edit-inv-notes').value.trim();

    // Log in Audit Trail
    if (!inv.auditHistory) inv.auditHistory = [];
    inv.auditHistory.unshift({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modifiedBy: `${window.GingerApp.data.currentUser.name} (${window.GingerApp.data.currentUser.role})`,
      previousAmount: previousAmount,
      updatedAmount: grandTotal,
      reason: reason
    });

    // Update corresponding booking if amount changed
    const b = window.GingerApp.data.bookings.find(bk => bk.id === inv.bookingId);
    if (b) {
      b.totalAmount = grandTotal;
      b.paymentStatus = inv.paymentStatus;
    }

    window.GingerApp.saveState();
    window.GingerApp.showToast(`Invoice ${inv.invoiceNumber} updated successfully! (Audit logged)`, 'success');
    window.GingerApp.closeModal('edit-invoice-modal');

    // Reopen printable modal to show updated state
    this.renderModal(inv.invoiceNumber);
    window.GingerApp.renderBillingTable();
    window.GingerApp.renderDashboard();
    window.GingerApp.renderBookingsTable();
  },

  // Open Record Payment Modal
  openPaymentModal: function(invId) {
    const inv = window.GingerApp.data.invoices.find(i => i.invoiceNumber === invId);
    if (!inv) return;

    window.GingerApp.closeModal('printable-invoice-modal');

    document.getElementById('pay-inv-id-hidden').value = inv.invoiceNumber;
    document.getElementById('pay-inv-num-label').textContent = inv.invoiceNumber;
    document.getElementById('pay-customer-label').textContent = inv.customerName;
    document.getElementById('pay-total-label').textContent = `${window.GingerApp.data.settings.currency} ${Number(inv.totalAmount).toLocaleString()}`;
    document.getElementById('pay-amount-input').value = inv.totalAmount;
    document.getElementById('pay-amount-input').max = inv.totalAmount;

    window.GingerApp.openModal('record-payment-modal');
  },

  submitPayment: function(e) {
    if (e) e.preventDefault();
    const invId = document.getElementById('pay-inv-id-hidden').value;
    const inv = window.GingerApp.data.invoices.find(i => i.invoiceNumber === invId);
    if (!inv) return;

    const method = document.getElementById('pay-method-select').value;
    const amount = parseFloat(document.getElementById('pay-amount-input').value) || inv.totalAmount;
    const refNotes = document.getElementById('pay-ref-input').value;

    const isFull = amount >= inv.totalAmount;
    inv.paymentMethod = method;
    inv.paymentStatus = isFull ? "Paid" : "Partially Paid";
    inv.invoiceStatus = isFull ? "Paid" : "Partially Paid";

    if (!inv.auditHistory) inv.auditHistory = [];
    inv.auditHistory.unshift({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modifiedBy: `${window.GingerApp.data.currentUser.name} (${window.GingerApp.data.currentUser.role})`,
      previousAmount: inv.totalAmount,
      updatedAmount: inv.totalAmount,
      reason: `Payment of ${window.GingerApp.data.settings.currency} ${amount.toLocaleString()} received via ${method}. ${refNotes ? 'Ref: ' + refNotes : ''}`
    });

    const b = window.GingerApp.data.bookings.find(bk => bk.id === inv.bookingId);
    if (b) {
      b.paymentStatus = inv.paymentStatus;
      b.paymentMethod = method;
    }

    window.GingerApp.saveState();
    window.GingerApp.showToast(`Payment of ${window.GingerApp.data.settings.currency} ${amount.toLocaleString()} recorded for ${inv.invoiceNumber}!`, 'success');
    window.GingerApp.closeModal('record-payment-modal');
    window.GingerApp.renderBillingTable();
    window.GingerApp.renderDashboard();
    window.GingerApp.renderBookingsTable();
  },

  // Download Invoice as clean text/receipt format
  downloadInvoice: function(invId) {
    const inv = window.GingerApp.data.invoices.find(i => i.invoiceNumber === invId);
    if (!inv) return;

    const settings = window.GingerApp.data.settings;
    let txt = `====================================================\n`;
    txt += `          ${settings.businessName.toUpperCase()}\n`;
    txt += `          ${settings.branchName}\n`;
    txt += `  Phone: ${settings.phone} | Email: ${settings.email}\n`;
    txt += `====================================================\n\n`;
    txt += `INVOICE NUMBER: ${inv.invoiceNumber}\n`;
    txt += `DATE: ${inv.date} | BOOKING REF: ${inv.bookingId}\n`;
    txt += `STATUS: ${inv.invoiceStatus || inv.paymentStatus}\n\n`;
    txt += `CUSTOMER: ${inv.customerName} (${inv.customerId})\n`;
    txt += `VEHICLE: ${inv.vehiclePlate} - ${inv.vehicleModel}\n\n`;
    txt += `----------------------------------------------------\n`;
    txt += `ITEMS:\n`;
    inv.items.forEach(it => {
      txt += `- ${it.description} x${it.qty} @ ${settings.currency}${it.unitPrice} = ${settings.currency}${it.qty * it.unitPrice}\n`;
    });
    txt += `----------------------------------------------------\n`;
    txt += `SUBTOTAL:   ${settings.currency}${inv.subtotal}\n`;
    if (inv.discount > 0) {
      txt += `OFFER/DISC: -${settings.currency}${inv.discount}\n`;
    }
    txt += `GRAND TOTAL: ${settings.currency}${inv.totalAmount}\n`;
    txt += `PAYMENT:    ${inv.paymentMethod} (${inv.paymentStatus})\n`;
    txt += `====================================================\n`;
    txt += `Thank you for choosing Ginger WashMate!\n`;

    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${inv.invoiceNumber}_GingerCarwash.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.GingerApp.showToast(`Invoice ${inv.invoiceNumber} downloaded!`, 'success');
  },

  // Direct Print trigger
  printDirect: function(invId) {
    this.renderModal(invId);
    setTimeout(() => {
      window.print();
    }, 300);
  },

  // Simulated email/SMS dispatch
  sendInvoice: function(invId) {
    const inv = window.GingerApp.data.invoices.find(i => i.invoiceNumber === invId);
    if (!inv) return;

    window.GingerApp.showToast(`Invoice ${inv.invoiceNumber} sent via WhatsApp & Email to ${inv.customerName}!`, 'success');
  },

  // Cancel Invoice
  cancelInvoice: function(invId) {
    window.GingerApp.confirmAction({
      title: "Cancel Invoice",
      message: `Are you sure you want to cancel invoice ${invId}? This will mark it as Cancelled in all records.`,
      confirmText: "Cancel Invoice",
      isDanger: true,
      onConfirm: function() {
        const inv = window.GingerApp.data.invoices.find(i => i.invoiceNumber === invId);
        if (inv) {
          inv.invoiceStatus = "Cancelled";
          inv.paymentStatus = "Cancelled";
          if (!inv.auditHistory) inv.auditHistory = [];
          inv.auditHistory.unshift({
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            modifiedBy: window.GingerApp.data.currentUser.name,
            previousAmount: inv.totalAmount,
            updatedAmount: 0,
            reason: "Invoice voided and cancelled by administrator."
          });
          window.GingerApp.saveState();
          window.GingerApp.showToast(`Invoice ${invId} cancelled`, 'warning');
          window.GingerApp.renderBillingTable();
          window.GingerApp.renderDashboard();
        }
      }
    });
  },

  // Generate a new invoice automatically from a booking
  createFromBooking: function(booking) {
    const invoiceNum = `INV-2026-00${395 + window.GingerApp.data.invoices.length}`;
    const settings = window.GingerApp.data.settings || {};
    
    let items = [];
    let vehiclePlate = booking.vehiclePlate;
    let vehicleModel = booking.vehicleModel;
    let serviceName = booking.serviceName;

    if (booking.vehicleServices && booking.vehicleServices.length > 0) {
      vehiclePlate = booking.vehicleServices.map(vs => vs.vehiclePlate).join(', ');
      vehicleModel = booking.vehicleServices.map(vs => `${vs.vehiclePlate}: ${vs.vehicleModel}`).join(' | ');
      serviceName = booking.vehicleServices.map(vs => `${vs.vehiclePlate} (${vs.serviceName})`).join('; ');
      
      booking.vehicleServices.forEach(vs => {
        items.push({
          description: `${vs.vehiclePlate} (${vs.vehicleModel}) – ${vs.serviceName}`,
          qty: 1,
          unitPrice: vs.finalPrice || vs.offerPrice || vs.regularPrice || 0,
          amount: vs.finalPrice || vs.offerPrice || vs.regularPrice || 0
        });
        if (vs.addons && vs.addons.length > 0) {
          vs.addons.forEach(addName => {
            const foundAdd = window.GingerApp.data.addons ? window.GingerApp.data.addons.find(a => a.name === addName) : null;
            const price = foundAdd ? foundAdd.price : 400;
            items.push({
              description: `[${vs.vehiclePlate}] Add-on: ${addName}`,
              qty: 1,
              unitPrice: price,
              amount: price
            });
          });
        }
      });
    } else {
      items.push({
        description: `${booking.serviceName} (${booking.vehicleType || 'Vehicle'})`,
        qty: 1,
        unitPrice: booking.amount,
        amount: booking.amount
      });
      if (booking.addons && booking.addons.length > 0) {
        booking.addons.forEach(addName => {
          const foundAdd = window.GingerApp.data.addons ? window.GingerApp.data.addons.find(a => a.name === addName) : null;
          const price = foundAdd ? foundAdd.price : 400;
          items.push({
            description: `Add-on: ${addName}`,
            qty: 1,
            unitPrice: price,
            amount: price
          });
        });
      }
    }

    const newInv = {
      invoiceNumber: invoiceNum,
      bookingId: booking.id,
      customerName: booking.customerName,
      customerId: booking.customerId,
      date: booking.date || new Date().toISOString().split('T')[0],
      subtotal: booking.amount || booking.subtotal,
      discount: booking.discount || 0,
      tax: 0,
      totalAmount: booking.totalAmount,
      paymentMethod: booking.paymentMethod || 'Online UPI',
      paymentStatus: booking.paymentStatus || 'Pending',
      invoiceStatus: (booking.paymentStatus === 'Paid') ? 'Paid' : 'Generated',
      vehiclePlate: vehiclePlate,
      vehicleModel: vehicleModel,
      serviceName: serviceName,
      items: items,
      auditHistory: [
        {
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modifiedBy: "System (Auto-generated)",
          previousAmount: booking.totalAmount,
          updatedAmount: booking.totalAmount,
          reason: `Auto-generated upon booking ${booking.id} creation with multi-vehicle itemization.`
        }
      ]
    };

    window.GingerApp.data.invoices.unshift(newInv);
    window.GingerApp.saveState();
    return newInv;
  }
};

window.InvoiceEngine = InvoiceEngine;
