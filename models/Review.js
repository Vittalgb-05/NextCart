import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: "user" },
    productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "product" },
    userName: { type: String, required: true },
    userImage: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now }
})

const Review = mongoose.models.review || mongoose.model('review', reviewSchema)

export default Review