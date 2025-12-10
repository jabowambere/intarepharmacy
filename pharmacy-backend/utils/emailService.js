import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'jabogabiro1@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

export const sendOrderStatusEmail = async (customerEmail, customerName, medicineName, status, orderId) => {
  const statusMessages = {
    confirmed: {
      subject: 'Order Confirmed - Intare Pharmacy',
      message: `Your order for ${medicineName} has been confirmed and will be delivered soon.`
    },
    delivered: {
      subject: 'Order Delivered - Intare Pharmacy', 
      message: `Your order for ${medicineName} has been successfully delivered. Thank you for choosing Intare Pharmacy!`
    },
    failed: {
      subject: 'Order Update - Intare Pharmacy',
      message: `Unfortunately, your order for ${medicineName} could not be processed. Please contact us for assistance.`
    }
  };

  const emailContent = statusMessages[status];
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'intarepharmacy@gmail.com',
    to: customerEmail,
    subject: emailContent.subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #228B22;">Intare Pharmacy</h2>
        <p>Dear ${customerName},</p>
        <p>${emailContent.message}</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>Order Details:</strong><br>
          Order ID: #${orderId}<br>
          Medicine: ${medicineName}<br>
          Status: ${status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
        <p>Best regards,<br>Intare Pharmacy Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${customerEmail} for order ${orderId}`);
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};