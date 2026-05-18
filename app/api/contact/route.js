import connectDB from "@/config/db";
import Contact from "@/models/Contact";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request) {
    try {
        const { name, email, subject, message } = await request.json();

        if (!name || !email || !message) {
            return NextResponse.json({ success: false, message: "Missing required fields" });
        }

        await connectDB();

        // 1. Save to MongoDB for Seller Panel Dashboard log
        const newContact = await Contact.create({
            name,
            email,
            subject: subject || "Inquiry",
            message,
            date: Date.now()
        });

        // 2. Silently send email in the background if SMTP credentials are configured
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;

        if (smtpUser && smtpPass) {
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST || "smtp.gmail.com",
                    port: parseInt(process.env.SMTP_PORT || "587"),
                    secure: process.env.SMTP_SECURE === "true", // true for port 465, false for 587
                    auth: {
                        user: smtpUser,
                        pass: smtpPass
                    }
                });

                const recipientEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "Vittalgb2005@gmail.com";

                const mailOptions = {
                    from: `"${name}" <${smtpUser}>`, // Send via authenticated email
                    replyTo: email,                  // Customer's email for easy direct replies
                    to: recipientEmail,
                    subject: `[NextCart Support] ${subject || "New Customer Message"}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 24px; color: #374151; max-width: 600px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff; margin: 0 auto;">
                            <h2 style="color: #ea580c; border-bottom: 2px solid #ea580c; padding-bottom: 12px; margin-top: 0;">📬 New Inquiry Received</h2>
                            <p style="margin: 6px 0;"><strong>Customer Name:</strong> ${name}</p>
                            <p style="margin: 6px 0;"><strong>Customer Email:</strong> <a href="mailto:${email}" style="color: #ea580c; text-decoration: none;">${email}</a></p>
                            <p style="margin: 6px 0;"><strong>Subject:</strong> ${subject || "General Inquiry"}</p>
                            
                            <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin-top: 20px; border: 1px solid #f3f4f6;">
                                <p style="margin: 0; white-space: pre-wrap; line-height: 1.6; font-size: 14px; color: #4b5563;">${message}</p>
                            </div>
                            
                            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                            <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 0;">Sent via NextCart Customer Support Portal</p>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
            } catch (mailError) {
                console.error("Nodemailer background mail failed:", mailError);
                // We do not fail the request if just the email notification failed but the db save succeeded
            }
        } else {
            console.warn("SMTP_USER and SMTP_PASS are not configured in .env. Automated email notification skipped.");
        }

        return NextResponse.json({ success: true, message: "Inquiry saved successfully!" });

    } catch (error) {
        console.error("Error in contact POST API:", error);
        return NextResponse.json({ success: false, message: error.message });
    }
}

export async function GET(request) {
    try {
        await connectDB();

        // Fetch all customer messages, sorted by latest date first
        const messages = await Contact.find({}).sort({ date: -1 });

        return NextResponse.json({ success: true, messages });

    } catch (error) {
        console.error("Error in contact GET API:", error);
        return NextResponse.json({ success: false, message: error.message });
    }
}
