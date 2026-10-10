import type { Invoice, Business, Branch } from '@/types';

export function printA4Invoice(
  invoice: Invoice,
  business: Business | null,
  branch: Branch | null
) {
  const businessName = business?.name || 'TradeOS Business';
  const businessAddress = business?.address || 'Nigeria';
  const businessPhone = business?.phoneNumber || '';
  const branchName = branch?.name || '';

  const itemsHtml = invoice.items.map((item, idx) => `
    <tr style="border-bottom: 1px solid #f1f5f9;">
      <td style="padding: 12px 14px; color: #64748b; font-size: 11px;">${idx + 1}</td>
      <td style="padding: 12px 14px; font-weight: 600; color: #0f172a; font-size: 12px;">${item.description}</td>
      <td style="padding: 12px 14px; text-align: right; color: #334155; font-size: 12px;">₦${item.unitPrice.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
      <td style="padding: 12px 14px; text-align: center; font-weight: 600; color: #0f172a; font-size: 12px;">${item.quantity}</td>
      <td style="padding: 12px 14px; text-align: right; font-weight: 700; color: #0f2a1d; font-size: 12px;">₦${item.lineTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
    </tr>
  `).join('');

  const statusBg = invoice.status === 'paid' ? '#ecfdf5' : invoice.status === 'issued' ? '#f0fdf4' : '#fffbeb';
  const statusColor = invoice.status === 'paid' ? '#047857' : invoice.status === 'issued' ? '#059669' : '#b45309';

  const printWindow = window.open('', '_blank', 'width=850,height=1100');
  if (!printWindow) {
    window.print();
    return;
  }

  const printDocument = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Invoice - ${invoice.invoiceNumber}</title>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&display=swap" rel="stylesheet">
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        body {
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #ffffff;
          color: #0f172a;
          line-height: 1.4;
          padding: 24px;
        }
        .invoice-card {
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 24px;
          border-bottom: 2px solid #059669;
        }
        .brand-title {
          font-size: 24px;
          font-weight: 800;
          color: #0f2a1d;
          letter-spacing: -0.5px;
        }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          background: ${statusBg};
          color: ${statusColor};
          margin-top: 6px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin: 24px 0;
        }
        .info-block {
          background: #f8fafc;
          padding: 16px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }
        .info-title {
          font-size: 10px;
          text-transform: uppercase;
          font-weight: 800;
          letter-spacing: 0.5px;
          color: #64748b;
          margin-bottom: 6px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        thead th {
          background: #f1f5f9;
          padding: 10px 14px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #475569;
          font-weight: 700;
        }
        .totals-section {
          display: flex;
          justify-content: flex-end;
          margin-top: 16px;
        }
        .totals-table {
          width: 320px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 13px;
        }
        .totals-row.grand {
          font-size: 16px;
          font-weight: 800;
          color: #059669;
          border-top: 2px solid #cbd5e1;
          padding-top: 10px;
          margin-top: 6px;
        }
        .banking-details {
          margin-top: 32px;
          padding: 16px;
          border-radius: 10px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
        }
        .banking-details h4 {
          font-size: 12px;
          font-weight: 800;
          color: #166534;
          margin-bottom: 6px;
          text-transform: uppercase;
        }
        .footer {
          margin-top: 36px;
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
          padding-top: 16px;
        }
      </style>
    </head>
    <body>
      <div class="invoice-card">
        <div class="header">
          <div>
            <h1 class="brand-title">${businessName}</h1>
            <p style="font-size: 12px; color: #475569; margin-top: 2px;">${branchName ? branchName + ' • ' : ''}${businessAddress}</p>
            ${businessPhone ? `<p style="font-size: 12px; color: #475569;">Tel: ${businessPhone}</p>` : ''}
          </div>
          <div style="text-align: right;">
            <div style="font-size: 26px; font-weight: 800; color: #059669; letter-spacing: -0.5px;">INVOICE</div>
            <div style="font-family: monospace; font-weight: 700; font-size: 13px; color: #0f172a;">${invoice.invoiceNumber}</div>
            <div class="badge">${invoice.status}</div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-block">
            <div class="info-title">Billed To</div>
            <div style="font-size: 14px; font-weight: 700; color: #0f172a;">${invoice.customerName}</div>
            ${invoice.customerPhone ? `<div style="font-size: 12px; color: #64748b; margin-top: 2px;">Phone: ${invoice.customerPhone}</div>` : ''}
          </div>
          <div class="info-block" style="text-align: right;">
            <div class="info-title">Invoice Schedule</div>
            <div style="font-size: 12px; color: #334155;"><strong>Issue Date:</strong> ${invoice.issueDate}</div>
            <div style="font-size: 12px; color: #334155; margin-top: 3px;"><strong>Due Date:</strong> ${invoice.dueDate}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th style="text-align: left;">Item Description</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: center; width: 60px;">Qty</th>
              <th style="text-align: right;">Line Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals-section">
          <div class="totals-table">
            <div class="totals-row">
              <span style="color: #64748b;">Subtotal:</span>
              <span style="font-weight: 600;">₦${invoice.subtotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
            </div>
            ${invoice.discountAmount > 0 ? `
              <div class="totals-row" style="color: #059669;">
                <span>Discount:</span>
                <span>-₦${invoice.discountAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
              </div>
            ` : ''}
            <div class="totals-row grand">
              <span>Amount Due:</span>
              <span>₦${invoice.totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <div class="banking-details">
          <h4>Payment Instructions / Direct Bank Transfer</h4>
          <p style="font-size: 12px; color: #15803d; line-height: 1.5;">
            Please make direct settlement for <strong>${invoice.invoiceNumber}</strong> using your Invoice Number as transfer narration.
          </p>
        </div>

        <div class="footer">
          <p style="font-weight: 600; color: #475569;">Thank you for your business!</p>
          <p style="margin-top: 4px;">Powered by TradeOS • Enterprise Operating System</p>
        </div>
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(printDocument);
  printWindow.document.close();
}

export function generateWhatsAppInvoiceShareUrl(
  invoice: Invoice,
  business: Business | null
): string {
  const businessName = business?.name || 'Our Store';
  const cleanPhone = (invoice.customerPhone || '').replace(/[^0-9]/g, '');
  
  // Format international number (Nigerian +234 default)
  let recipientPhone = cleanPhone;
  if (recipientPhone.startsWith('0') && recipientPhone.length === 11) {
    recipientPhone = '234' + recipientPhone.substring(1);
  }

  const message = `Hello *${invoice.customerName}*,\n\nHere is your invoice from *${businessName}*:\n` +
    `• Invoice No: *${invoice.invoiceNumber}*\n` +
    `• Due Date: *${invoice.dueDate}*\n` +
    `• Total Payable: *₦${invoice.totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}*\n\n` +
    `Please arrange settlement before the due date. Thank you for your business!\n\n_Powered by TradeOS_`;

  const encodedMsg = encodeURIComponent(message);
  
  if (recipientPhone) {
    return `https://wa.me/${recipientPhone}?text=${encodedMsg}`;
  }
  return `https://wa.me/?text=${encodedMsg}`;
}
