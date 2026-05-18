// lib/mailer.js — reusable Nodemailer transporter
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendOrderConfirmationEmail({ to, name, orderId, items, amount, address, currency = '₹' }) {
    const itemRows = items.map(item =>
        `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${item.name}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center">${item.quantity}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right">${currency}${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    ).join('');

    const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
        <div style="background:#ea580c;padding:28px 32px">
            <h1 style="color:#fff;margin:0;font-size:22px">✅ Order Confirmed!</h1>
            <p style="color:#fed7aa;margin:6px 0 0">Thank you for shopping with NextCart</p>
        </div>
        <div style="padding:28px 32px">
            <p style="color:#374151">Hi <strong>${name}</strong>,</p>
            <p style="color:#6b7280">Your order has been placed successfully. Here's your summary:</p>
            <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0">
                <p style="margin:0 0 4px;color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Order ID</p>
                <p style="margin:0;font-family:monospace;font-size:13px;color:#111827">${orderId}</p>
            </div>
            <table width="100%" style="border-collapse:collapse;margin:16px 0">
                <thead>
                    <tr style="background:#f3f4f6">
                        <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase">Item</th>
                        <th style="padding:10px 12px;text-align:center;font-size:12px;color:#6b7280;text-transform:uppercase">Qty</th>
                        <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6b7280;text-transform:uppercase">Price</th>
                    </tr>
                </thead>
                <tbody>${itemRows}</tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" style="padding:12px;font-weight:bold;color:#111827">Total</td>
                        <td style="padding:12px;font-weight:bold;color:#ea580c;text-align:right">${currency}${amount.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
            <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-top:16px">
                <p style="margin:0 0 4px;color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Delivering to</p>
                <p style="margin:0;color:#374151">${address.fullName}<br/>${address.area}, ${address.city}, ${address.state} - ${address.pincode}<br/>${address.phoneNumber}</p>
            </div>
        </div>
        <div style="background:#f9fafb;padding:16px 32px;text-align:center">
            <p style="color:#9ca3af;font-size:12px;margin:0">© 2025 NextCart. All rights reserved.</p>
        </div>
    </div>`;

    await transporter.sendMail({
        from: `"NextCart" <${process.env.SMTP_USER}>`,
        to,
        subject: `Order Confirmed — #${orderId.slice(-8).toUpperCase()}`,
        html
    });
}

export async function sendStatusUpdateEmail({ to, name, orderId, status, currency = '₹' }) {
    const statusColors = {
        processing: '#3b82f6',
        shipped: '#8b5cf6',
        delivered: '#16a34a',
        cancelled: '#dc2626',
        paid: '#ea580c',
    };
    const color = statusColors[status] || '#ea580c';

    const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
        <div style="background:${color};padding:28px 32px">
            <h1 style="color:#fff;margin:0;font-size:22px">Order Update</h1>
        </div>
        <div style="padding:28px 32px">
            <p style="color:#374151">Hi <strong>${name}</strong>,</p>
            <p style="color:#6b7280">Your order status has been updated.</p>
            <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:16px 0;text-align:center">
                <p style="margin:0 0 8px;color:#9ca3af;font-size:12px">Order #${orderId.slice(-8).toUpperCase()}</p>
                <span style="display:inline-block;background:${color};color:#fff;padding:8px 24px;border-radius:999px;font-weight:bold;font-size:16px;text-transform:capitalize">${status}</span>
            </div>
        </div>
        <div style="background:#f9fafb;padding:16px 32px;text-align:center">
            <p style="color:#9ca3af;font-size:12px;margin:0">© 2025 NextCart. All rights reserved.</p>
        </div>
    </div>`;

    await transporter.sendMail({
        from: `"NextCart" <${process.env.SMTP_USER}>`,
        to,
        subject: `Your order is now: ${status.toUpperCase()} — #${orderId.slice(-8).toUpperCase()}`,
        html
    });
}
