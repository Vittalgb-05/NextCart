import connectDB from "@/config/db";
import Product from "@/models/Product";

/**
 * Searches the product catalog for relevant products based on a query.
 * This is used by the AI assistant to provide real-time recommendations.
 */
export async function searchProducts(query) {
    try {
        await connectDB();
        
        const lowerText = query.toLowerCase().trim();
        
        // Strip common conversational filler words
        const fillerWords = new Set([
            'i', 'need', 'want', 'please', 'give', 'show', 'find', 'search', 'get',
            'me', 'for', 'buy', 'looking', 'a', 'an', 'the', 'some', 'any', 'with', 
            'under', 'can', 'you', 'help', 'to', 'recommend', 'suggest'
        ]);

        const keywords = lowerText
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 1 && !fillerWords.has(word));

        console.log("Extracted search keywords for query:", keywords);

        let searchCriteria = {};
        if (keywords.length > 0) {
            const orConditions = [];
            keywords.forEach(keyword => {
                orConditions.push({ name: { $regex: keyword, $options: 'i' } });
                orConditions.push({ description: { $regex: keyword, $options: 'i' } });
                orConditions.push({ category: { $regex: keyword, $options: 'i' } });
            });
            searchCriteria = { $or: orConditions };
        } else {
            searchCriteria = {
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { category: { $regex: query, $options: 'i' } }
                ]
            };
        }
        
        const products = await Product.find(searchCriteria).limit(5).lean();

        return products.map(p => ({
            id: p._id.toString(),
            name: p.name,
            price: p.offerPrice,
            category: p.category,
            description: p.description,
            image: p.image[0],
            rating: p.averageRating,
            stock: p.stock > 0 ? 'In Stock' : 'Out of Stock'
        }));
    } catch (error) {
        console.error("AI Product Search Error:", error);
        return [];
    }
}

/**
 * Gets a summary of the store's categories to help the AI understand the catalog.
 */
export async function getCategorySummary() {
    try {
        await connectDB();
        const categories = await Product.distinct("category");
        return categories;
    } catch (error) {
        return [];
    }
}
