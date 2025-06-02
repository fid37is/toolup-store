/* eslint-disable @typescript-eslint/no-unused-vars */
// src/utils/pdfReceiptGenerator.js

export const generatePDFReceipt = async (order, user, logoUrl = null) => {
    try {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        
        // Colors
        const primaryColor = [51, 51, 51];
        const secondaryColor = [102, 102, 102];
        const accentColor = [245, 245, 245];
        const tableHeaderColor = [240, 240, 240];
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 20;
        
        // Header Section
        doc.setFillColor(...accentColor);
        doc.rect(0, 0, pageWidth, 60, 'F');
        
        if (logoUrl) {
            try {
                doc.addImage(logoUrl, 'PNG', 10, 10, 25, 25);
                doc.setTextColor(...primaryColor);
                doc.setFontSize(18);
                doc.setFont(undefined, 'bold');
                doc.text('ToolUp Store', 45, 20);
                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');
                doc.text('Asaba, Delta State', 45, 28);
                doc.text('Phone: +234-808-5952266', 45, 35);
            } catch (error) {
                console.log('Logo could not be loaded, proceeding without logo');
                doc.setTextColor(...primaryColor);
                doc.setFontSize(20);
                doc.setFont(undefined, 'bold');
                doc.text('ToolUp Store', pageWidth / 2, 25, { align: 'center' });
                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');
                doc.text('Asaba, Delta State | Phone: +234-808-5952266', pageWidth / 2, 35, { align: 'center' });
            }
        } else {
            doc.setTextColor(...primaryColor);
            doc.setFontSize(20);
            doc.setFont(undefined, 'bold');
            doc.text('ToolUp Store', pageWidth / 2, 25, { align: 'center' });
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text('Asaba, Delta State | Phone: +234-808-5952266', pageWidth / 2, 35, { align: 'center' });
        }
        
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('RECEIPT', pageWidth / 2, 50, { align: 'center' });
        
        yPosition = 70;
        
        // Order Information Section
        doc.setFillColor(249, 249, 249);
        doc.rect(15, yPosition - 5, pageWidth - 30, 35, 'F');
        
        doc.setTextColor(...primaryColor);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Order Information', 20, yPosition + 5);
        
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...secondaryColor);
        
        const orderDate = new Date(order.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Order details in two columns
        doc.text(`Order #: ${order.orderId}`, 20, yPosition + 15);
        doc.text(`Date: ${orderDate}`, 20, yPosition + 22);
        doc.text(`Customer: ${user.name || user.email}`, 120, yPosition + 15);
        if (user.phone) {
            doc.text(`Phone: ${user.phone}`, 120, yPosition + 22);
        }
        
        yPosition += 45;
        
        // Items Section Header
        doc.setTextColor(...primaryColor);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Order Items', 20, yPosition);
        yPosition += 10;
        
        // Table Header
        doc.setFillColor(...tableHeaderColor);
        doc.rect(15, yPosition - 2, pageWidth - 30, 12, 'F');
        
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...primaryColor);
        
        doc.text('Item Description', 20, yPosition + 6);
        doc.text('Qty', 110, yPosition + 6, { align: 'center' });
        doc.text('Unit Price', 135, yPosition + 6, { align: 'center' });
        doc.text('Total', pageWidth - 25, yPosition + 6, { align: 'right' });
        
        yPosition += 15;
        
        // Table Items
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        
        let subtotal = 0;
        
        if (order.items && order.items.length > 0) {
            order.items.forEach((item, index) => {
                if (yPosition > pageHeight - 60) {
                    doc.addPage();
                    yPosition = 30;
                }
                
                if (index % 2 === 0) {
                    doc.setFillColor(252, 252, 252);
                    doc.rect(15, yPosition - 2, pageWidth - 30, 12, 'F');
                }
                
                doc.setTextColor(...secondaryColor);
                
                const itemName = item.name || 'Unknown Item';
                const wrappedName = doc.splitTextToSize(itemName, 85);
                const displayName = wrappedName.length > 1 ? wrappedName[0].slice(0, -3) + '...' : wrappedName[0];
                doc.text(displayName, 20, yPosition + 6);
                
                const quantity = item.quantity || 1;
                doc.text(String(quantity), 110, yPosition + 6, { align: 'center' });
                
                const unitPrice = Number(item.price || 0);
                // Fixed currency display
                doc.text(`₦${unitPrice.toFixed(2)}`, 135, yPosition + 6, { align: 'center' });
                
                const itemTotal = unitPrice * quantity;
                subtotal += itemTotal;
                // Fixed currency display
                doc.text(`₦${itemTotal.toFixed(2)}`, pageWidth - 25, yPosition + 6, { align: 'right' });
                
                yPosition += 12;
            });
        } else {
            doc.setTextColor(153, 153, 153);
            doc.text('No items available', pageWidth / 2, yPosition + 6, { align: 'center' });
            yPosition += 12;
        }
        
        yPosition += 15;
        
        // Totals Section
        const totalSectionWidth = 120;
        const totalSectionX = pageWidth - totalSectionWidth - 15;
        
        const taxRate = order.taxRate || 0;
        const taxAmount = subtotal * (taxRate / 100);
        const finalTotal = order.total || (subtotal + taxAmount);
        
        let totalSectionHeight = 35;
        if (taxRate > 0) totalSectionHeight += 12;
        
        doc.setDrawColor(200, 200, 200);
        doc.rect(totalSectionX, yPosition - 5, totalSectionWidth, totalSectionHeight, 'S');
        
        doc.setTextColor(...primaryColor);
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        
        // Fixed currency display in totals
        doc.text('Subtotal:', totalSectionX + 10, yPosition + 5);
        doc.text(`₦${subtotal.toFixed(2)}`, totalSectionX + totalSectionWidth - 10, yPosition + 5, { align: 'right' });
        
        if (taxRate > 0) {
            yPosition += 12;
            doc.text(`Tax (${taxRate}%):`, totalSectionX + 10, yPosition + 5);
            doc.text(`₦${taxAmount.toFixed(2)}`, totalSectionX + totalSectionWidth - 10, yPosition + 5, { align: 'right' });
        }
        
        yPosition += 12;
        doc.setFillColor(240, 240, 240);
        doc.rect(totalSectionX + 1, yPosition - 2, totalSectionWidth - 2, 12, 'F');
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('TOTAL:', totalSectionX + 10, yPosition + 6);
        doc.text(`₦${Number(finalTotal).toFixed(2)}`, totalSectionX + totalSectionWidth - 10, yPosition + 6, { align: 'right' });
        
        yPosition += 20;
        
        // Payment Information
        if (order.paymentMethod) {
            doc.setTextColor(...secondaryColor);
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(`Payment Method: ${order.paymentMethod}`, 20, yPosition);
            yPosition += 10;
        }
        
        // Footer
        yPosition = Math.max(yPosition + 15, pageHeight - 40);
        
        doc.setDrawColor(221, 221, 221);
        doc.line(15, yPosition, pageWidth - 15, yPosition);
        
        doc.setTextColor(...secondaryColor);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Thank you for your business!', pageWidth / 2, yPosition + 10, { align: 'center' });
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        const receiptDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        doc.text(`Receipt generated on ${receiptDate}`, pageWidth / 2, yPosition + 20, { align: 'center' });
        doc.text('Terms: All sales are final. Please retain this receipt for reference.', pageWidth / 2, yPosition + 28, { align: 'center' });
        
        doc.save(`receipt-order-${order.orderId}.pdf`);
        
        return { success: true, message: 'PDF receipt downloaded successfully!' };
        
    } catch (error) {
        console.error('Error generating PDF receipt:', error);
        throw error;
    }
};

export const generateHTMLReceipt = (order, user, logoUrl = null) => {
    let subtotal = 0;
    if (order.items && order.items.length > 0) {
        subtotal = order.items.reduce((sum, item) => {
            return sum + ((item.price || 0) * (item.quantity || 1));
        }, 0);
    }
    
    const taxRate = order.taxRate || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const finalTotal = order.total || (subtotal + taxAmount);
    
    const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Receipt - Order #${order.orderId}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 40px; color: #333; line-height: 1.6; background: white; max-width: 800px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; background: #f5f5f5; padding: 20px; border-radius: 8px; }
                .logo-section { display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
                .logo-section img { max-height: 50px; margin-right: 15px; }
                .company-info { text-align: left; }
                .header h1 { margin: 0; font-size: 28px; color: #333; }
                .header h2 { margin: 10px 0 0 0; font-size: 22px; color: #666; }
                .order-info { margin-bottom: 30px; background: #f9f9f9; padding: 25px; border-radius: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .order-info h3 { grid-column: 1 / -1; margin: 0 0 15px 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
                .order-info p { margin: 8px 0; font-size: 14px; }
                .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #ddd; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                .items-table th { background-color: #f0f0f0; font-weight: bold; font-size: 14px; color: #333; }
                .items-table td { font-size: 13px; }
                .items-table .qty-cell, .items-table .price-cell { text-align: right; font-family: 'Courier New', monospace; }
                .items-table tbody tr:nth-child(even) { background-color: #fafafa; }
                .totals-section { margin-top: 20px; padding: 20px; background: #f8f8f8; border-radius: 8px; border: 1px solid #ddd; max-width: 400px; margin-left: auto; }
                .total-row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
                .total-row.final-total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; margin-top: 15px; }
                .footer { margin-top: 40px; text-align: center; color: #666; border-top: 1px solid #ddd; padding-top: 20px; font-size: 12px; }
                @media print { body { margin: 0; padding: 20px; } .header { background: white !important; } }
            </style>
        </head>
        <body>
            <div class="header">
                ${logoUrl ? `
                    <div class="logo-section">
                        <img src="${logoUrl}" alt="Company Logo">
                        <div class="company-info">
                            <h1>ToolUp Store</h1>
                            <p>Asaba<br>Delta State<br>Phone: +234-808-5952266</p>
                        </div>
                    </div>
                ` : `
                    <h1>ToolUp Store</h1>
                    <p>Asaba, Delta State | Phone: +234-8085952266</p>
                `}
                <h2>RECEIPT</h2>
            </div>
            
            <div class="order-info">
                <h3>Order Information</h3>
                <div>
                    <p><strong>Order Number:</strong> ${order.orderId}</p>
                    <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    <p><strong>Status:</strong> ${order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}</p>
                </div>
                <div>
                    <p><strong>Customer:</strong> ${user.name || user.email}</p>
                    ${user.phone ? `<p><strong>Phone:</strong> ${user.phone}</p>` : ''}
                    ${order.paymentMethod ? `<p><strong>Payment Method:</strong> ${order.paymentMethod}</p>` : ''}
                </div>
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 40%;">Item Description</th>
                        <th style="width: 15%;">Quantity</th>
                        <th style="width: 20%;">Unit Price (₦)</th>
                        <th style="width: 25%;">Total (₦)</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items?.map(item => {
                        const itemTotal = (item.price || 0) * (item.quantity || 1);
                        return `
                        <tr>
                            <td>${item.name || 'Unknown Item'}</td>
                            <td class="qty-cell">${item.quantity || 1}</td>
                            <td class="price-cell">${Number(item.price || 0).toFixed(2)}</td>
                            <td class="price-cell">${itemTotal.toFixed(2)}</td>
                        </tr>
                        `;
                    }).join('') || '<tr><td colspan="4" style="text-align: center; color: #999;">No items available</td></tr>'}
                </tbody>
            </table>
            
            <div class="totals-section">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>₦${subtotal.toFixed(2)}</span>
                </div>
                ${taxRate > 0 ? `
                <div class="total-row">
                    <span>Tax (${taxRate}%):</span>
                    <span>₦${taxAmount.toFixed(2)}</span>
                </div>
                ` : ''}
                <div class="total-row final-total">
                    <span>TOTAL:</span>
                    <span>₦${finalTotal.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>Thank you for your business!</strong></p>
                <p>Receipt generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                <p>Terms: All sales are final. Please retain this receipt for your records.</p>
            </div>
        </body>
        </html>
    `;

    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `receipt-order-${order.orderId}.html`;
    downloadLink.style.display = 'none';
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 100);
};