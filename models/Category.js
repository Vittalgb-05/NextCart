import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    date: { type: Number, required: true }
});

const Category = mongoose.models.category || mongoose.model('category', categorySchema);

export default Category;
