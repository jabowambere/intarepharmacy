import Purchase from "../models/Purchase.js";

export const createPurchase = async (req, res) => {
  try {
    const { medicineId, customerName, customerEmail, customerPhone, customerAddress, quantity, prescription } = req.body;
    
    const purchase = new Purchase({
      medicineName: req.body.medicineName || 'Medicine',
      medicineId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      quantity,
      totalPrice: req.body.totalPrice || 0,
      prescription: prescription || ''
    });
    
    await purchase.save();
    res.status(201).json({ message: "Purchase successful", purchase });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find().sort({ createdAt: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePurchaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const purchase = await Purchase.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }
    
    // Send email notification
    try {
      const nodemailer = await import('nodemailer');
      
      // Use Ethereal for testing (creates test account automatically)
      let transporter;
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.default.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
      } else {
        // Fallback: Log email to console
        console.log('\n=== EMAIL NOTIFICATION ===');
        console.log(`To: ${purchase.customerEmail}`);
        console.log(`Subject: Order ${status.charAt(0).toUpperCase() + status.slice(1)} - Intare Pharmacy`);
        console.log(`Customer: ${purchase.customerName}`);
        console.log(`Medicine: ${purchase.medicineName}`);
        console.log(`Status: ${status}`);
        console.log('========================\n');
        return; // Skip actual email sending
      }
      
      const statusMessages = {
        confirmed: 'Your order has been confirmed and will be delivered soon.',
        delivered: 'Your order has been successfully delivered. Thank you!',
        failed: 'Unfortunately, your order could not be processed. Please contact us.'
      };
      
      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: purchase.customerEmail,
        subject: `Order ${status.charAt(0).toUpperCase() + status.slice(1)} - Intare Pharmacy`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #228B22;">Intare Pharmacy</h2>
            <p>Dear ${purchase.customerName},</p>
            <p>${statusMessages[status]}</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong>Order Details:</strong><br>
              Order ID: #${purchase._id}<br>
              Medicine: ${purchase.medicineName}<br>
              Quantity: ${purchase.quantity}<br>
              Status: ${status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
            <p>Best regards,<br>Intare Pharmacy Team</p>
          </div>
        `
      });
      console.log('Email sent successfully:', info.messageId);
    } catch (emailError) {
      console.log('Email sending failed (non-critical):', emailError.message);
    }
    
    res.json({ message: "Status updated successfully", purchase });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};