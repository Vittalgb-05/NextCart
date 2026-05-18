import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'product' },
    name: { type: String, required: true },      // snapshot at order time
    image: { type: String, required: true },      // snapshot
    price: { type: Number, required: true },      // snapshot
    quantity: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    userId:    { type: String, required: true, ref: 'user' },
    items:     [orderItemSchema],
    amount:    { type: Number, required: true },
    address:   { type: mongoose.Schema.Types.ObjectId, ref: 'address', required: true },

    // Payment
    paymentMethod:  { type: String, enum: ['COD', 'Razorpay'], default: 'COD' },
    paymentStatus:  { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    razorpayOrderId:   { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },

    // Order status
    status: {
        type: String,
        enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },

    // Timeline
    statusHistory: [{
        status:    { type: String },
        note:      { type: String },
        updatedAt: { type: Date, default: Date.now }
    }],

    date: { type: Number, required: true }
}, { timestamps: true });

const Order = mongoose.models.order || mongoose.model('order', orderSchema);
export default Order;