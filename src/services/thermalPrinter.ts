import type { Sale, Business, Branch } from '@/types';

export interface ThermalReceiptOptions {
  paperWidth?: '58mm' | '80mm';
  showQrCode?: boolean;
  cutPaper?: boolean;
}

export function printThermalReceipt(
  sale: Sale,
  business: Business | null,
  branch: Branch | null,
  options: ThermalReceiptOptions = { paperWidth: '80mm' }
) {
  const is58mm = options.paperWidth === '58mm';
  const receiptNumber = sale.receiptNumber;
  const dateFormatted = new Date(sale.createdAt).toLocaleString('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const businessName = business?.name || 'TradeOS Store';
  const businessAddress = business?.address || 'Nigeria';
  const businessPhone = business?.phoneNumber || '';
  const branchName = branch?.name || 'Main Counter';

  const itemsHtml = sale.items.map(item => `
    <tr>
      <td style="padding: 4px 0; vertical-align: top; text-align: left;">
        <div style="font-weight: 700; font-size: 11px; line-height: 1.2;">${item.productNameSnapshot}</div>
        <div style="font-size: 9px; color: #555;">${item.quantity} x ₦${item.unitPrice.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</div>
      </td>
      <td style="padding: 4px 0; vertical-align: top; text-align: right; font-weight: 700; font-size: 11px; white-space: nowrap;">
        ₦${item.lineTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
      </td>
    </tr>
  `).join('');

  const changeDue = Math.max(0, sale.amountPaid - sale.totalAmount);

  const printWindow = window.open('', '_blank', 'width=450,height=650');
  if (!printWindow) {
    window.print();
    return;
  }

  const printDocument = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Receipt - ${receiptNumber}</title>
      <style>
        @page {
          margin: 0;
          size: auto;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        body {
          font-family: 'Courier New', Courier, monospace, -apple-system, BlinkMacSystemFont, sans-serif;
          background-color: #ffffff;
          color: #000000;
          font-size: 11px;
          line-height: 1.3;
          display: flex;
          justify-content: center;
          padding: 10px 0;
        }
        .receipt-container {
          width: ${is58mm ? '54mm' : '76mm'};
          max-width: 100%;
          padding: 4px;
        }
        .header {
          text-align: center;
          margin-bottom: 8px;
          border-bottom: 1px dashed #000;
          padding-bottom: 8px;
        }
        .header h1 {
          font-size: 15px;
          font-weight: 900;
          text-transform: uppercase;
          margin-bottom: 2px;
          letter-spacing: -0.5px;
        }
        .header p {
          font-size: 9.5px;
          color: #222;
          margin: 1px 0;
        }
        .meta {
          margin: 6px 0;
          font-size: 9.5px;
          line-height: 1.4;
          border-bottom: 1px dashed #000;
          padding-bottom: 6px;
        }
        .meta-row {
          display: flex;
          justify-content: space-between;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 6px 0;
        }
        .divider {
          border-top: 1px dashed #000;
          margin: 6px 0;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 2px 0;
          font-size: 10.5px;
        }
        .totals-row.grand {
          font-size: 13px;
          font-weight: 900;
          border-top: 1px solid #000;
          border-bottom: 1px solid #000;
          padding: 4px 0;
          margin-top: 4px;
        }
        .footer {
          text-align: center;
          margin-top: 12px;
          font-size: 9px;
          line-height: 1.4;
          border-top: 1px dashed #000;
          padding-top: 8px;
        }
        .barcode {
          font-family: monospace;
          letter-spacing: 3px;
          font-weight: bold;
          font-size: 12px;
          margin: 6px 0 2px;
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          <h1>${businessName}</h1>
          <p>${branchName}</p>
          <p>${businessAddress}</p>
          ${businessPhone ? `<p>Tel: ${businessPhone}</p>` : ''}
        </div>

        <div class="meta">
          <div class="meta-row">
            <span>Receipt #:</span>
            <span style="font-weight:bold;">${receiptNumber}</span>
          </div>
          <div class="meta-row">
            <span>Date & Time:</span>
            <span>${dateFormatted}</span>
          </div>
          <div class="meta-row">
            <span>Payment:</span>
            <span style="text-transform:uppercase; font-weight:bold;">${sale.paymentMethod.replace('_', ' ')}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr style="border-bottom: 1px solid #000; font-size: 9px; text-transform: uppercase;">
              <th style="text-align: left; padding-bottom: 3px;">Item</th>
              <th style="text-align: right; padding-bottom: 3px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="divider"></div>

        <div class="totals-row">
          <span>Subtotal:</span>
          <span>₦${sale.subtotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
        </div>
        ${sale.discountAmount > 0 ? `
          <div class="totals-row">
            <span>Discount:</span>
            <span>-₦${sale.discountAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
          </div>
        ` : ''}
        <div class="totals-row grand">
          <span>TOTAL PAID:</span>
          <span>₦${sale.totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
        </div>

        <div class="totals-row" style="margin-top: 4px;">
          <span>Amount Tendered:</span>
          <span>₦${sale.amountPaid.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
        </div>
        ${changeDue > 0 ? `
          <div class="totals-row" style="font-weight: bold;">
            <span>Change Returned:</span>
            <span>₦${changeDue.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
          </div>
        ` : ''}

        <div class="footer">
          <div class="barcode">*${receiptNumber}*</div>
          <p style="font-weight: bold;">THANK YOU FOR YOUR PATRONAGE!</p>
          <p>Goods purchased in good condition are not returnable without this receipt.</p>
          <p style="color: #666; font-size: 8px; margin-top: 4px;">Powered by TradeOS • lite360.io</p>
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
