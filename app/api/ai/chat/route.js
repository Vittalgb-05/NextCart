import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool, createUIMessageStream, createUIMessageStreamResponse, generateId } from 'ai';
import { searchProducts, getCategorySummary } from '@/lib/ai-helpers';
import { z } from 'zod';

const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY || 'dummy_key',
});

export const maxDuration = 30;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const isDemoModeKey = (key) => {
    return !key || key.startsWith('gsk_...') || key.includes('...');
};

const getMessageText = (message) => {
    if (!message) return '';
    if (message.content) return message.content;
    if (message.parts && Array.isArray(message.parts)) {
        return message.parts
            .filter(part => part.type === 'text')
            .map(part => part.text)
            .filter(Boolean)
            .join('');
    }
    return '';
};

const generateConversationalResponse = (query, products, originalQuery) => {
    const lowerQuery = (originalQuery || query || '').toLowerCase().trim();
    const currency = process.env.NEXT_PUBLIC_CURRENCY || '₹';

    // 1. GREETINGS INTENT
    const isGreeting = ['hi', 'hello', 'hey', 'greetings', 'yo', 'sup'].some(k => {
        const words = lowerQuery.split(/\s+/);
        return words.includes(k);
    });
    if (isGreeting) {
        return `Hello there! 👋 I am your NextCart AI Shopping Assistant.\n\nI can help you find the perfect products from our catalog! Tell me what you're looking for, e.g., 'headphones', 'smartphones', 'laptops', 'earphones', or 'watches'. 🛍️`;
    }

    // 2. APPRECIATION INTENT
    const isThanks = ['thanks', 'thank you', 'ty', 'awesome', 'great', 'perfect', 'cool', 'nice'].some(k => lowerQuery.includes(k));
    if (isThanks) {
        return `You're very welcome! I'm thrilled to help you discover the best tech. Let me know if there's anything else you'd like to search for or compare! 😊✨`;
    }

    // 3. NEUTRAL / NEGATIVE / TRANSITION / GIBBERISH INTENT
    const isTransition = ['she it not', 'no', 'not really', 'nothing', 'stop', 'clear', 'okay', 'ok', 'still'].some(k => lowerQuery === k || lowerQuery.includes(k));
    if (isTransition) {
        return `Understood! If you want to explore something else or check out our premium categories (like **Smartphones**, **Laptops**, or **Watches**), just type it here and I'll find it for you! 🌟`;
    }

    // 4. PURCHASE / ADD TO CART INTENT
    const isPurchase = ['buy', 'purchase', 'cart', 'checkout', 'order', 'add'].some(k => {
        const words = lowerQuery.split(/\s+/);
        return words.includes(k);
    });
    if (isPurchase) {
        if (products.length > 0) {
            const p = products[0];
            return `Great choice! 🛍️ I've loaded the **${p.name}** card for you below.\n\nYou can click the **'Buy'** button directly on the card to add it to your cart, or click **'Details'** to view the full product page. Let me know if you would like to compare it or look at other products! 🛒`;
        } else {
            return `I'd love to help you buy! What product or category are you interested in today? Tell me, and I'll find it in our catalog instantly! 🛒`;
        }
    }

    // 5. Handle completely empty or no matched products case
    if (products.length === 0) {
        return `I searched our catalog for "${query}" but couldn't find any exact matches. 🔍\n\nWhat are you shopping for? You can ask me for recommendations like:\n\n🎧 "I want wireless headphones with active noise cancellation"\n💻 "Show me the best gaming laptops for multitasking"\n⌚ "Tell me about water-resistant smartwatches"\n\nTell me your preferences, and I'll find the perfect match! 🛍️`;
    }

    // Limit to top 2 products for high utility and focused advice
    const activeProducts = products.slice(0, 2);
    
    // Check user intent
    const isCompare = ['compare', 'versus', 'vs', 'difference', 'which is better'].some(k => lowerQuery.includes(k));
    const isCheap = ['cheap', 'budget', 'cheapest', 'low price', 'sale', 'under'].some(k => lowerQuery.includes(k));
    const isRating = ['best', 'top', 'highest', 'popular', 'recommend', 'star'].some(k => lowerQuery.includes(k));

    // 6. COMPARISON INTENT
    if (isCompare && activeProducts.length > 1) {
        const p1 = activeProducts[0];
        const p2 = activeProducts[1];
        return `🤖 NextCart Expert Product Comparison:\n\n⚖️ Comparing "${p1.name}" vs "${p2.name}":\n\n1. **${p1.name}**\n   🏷️ Category: ${p1.category}\n   💰 Price: ${currency}${p1.price}\n   ⭐ Rating: ${p1.rating || 5}/5\n   📝 Key Feature: ${p1.description || "Excellent build and reliability."}\n\n2. **${p2.name}**\n   🏷️ Category: ${p2.category}\n   💰 Price: ${currency}${p2.price}\n   ⭐ Rating: ${p2.rating || 5}/5\n   📝 Key Feature: ${p2.description || "Excellent build and reliability."}\n\n💡 **Shopping Recommendation**:\n${p1.price < p2.price ? `   👉 Choose "${p1.name}" if you are looking for the absolute best value and budget savings (${currency}${p1.price}).\n   👉 Choose "${p2.name}" if you prioritize its premium specs and advanced features.\n` : `   👉 Choose "${p2.name}" if you want a great deal on price (${currency}${p2.price}).\n   👉 Choose "${p1.name}" if you want the highest-rated product in this category.\n`}\nWhich of these fits your needs best? Let me know! 🛒`;
    }

    // 7. BUDGET/CHEAP INTENT
    if (isCheap) {
        let response = `💸 Best Budget-Friendly Deals Found:\n\n`;
        activeProducts.forEach((p, idx) => {
            const saving = Math.round(p.price * 0.25); // simulated savings
            response += `${idx + 1}. **${p.name}**\n   💰 Special Price: ${currency}${p.price} (Save ${currency}${saving}!)\n   ⭐ Rating: ${p.rating || 5}/5\n   📦 Status: ${p.stock}\n   💡 Why it's a great value: ${p.description || "High-end specs at an affordable entry price point."}\n\n`;
        });
        response += `These special offers are currently active! Let me know if you want to add any to your cart. 🛒`;
        return response;
    }

    // 8. BEST RATING INTENT
    if (isRating) {
        let response = `🏆 Highest-Rated Recommendations:\n\n`;
        activeProducts.forEach((p, idx) => {
            const stars = "⭐".repeat(Math.round(p.rating || 5));
            response += `${idx + 1}. **${p.name}** (Top Rated)\n   ⭐ Score: ${p.rating || 5}/5 (${stars})\n   💰 Price: ${currency}${p.price}\n   💡 Description: ${p.description || "Highly praised by shoppers for daily use."}\n\n`;
        });
        response += `These products have received stellar ratings! Would you like more details on any of these? 🛒`;
        return response;
    }

    // 9. STANDARD SEARCH INTENT (Highly focused, human-like & conversational!)
    const firstProduct = activeProducts[0];
    if (activeProducts.length === 1) {
        return `I found the **${firstProduct.name}** in our catalog! 🌟\n\nIt is currently **${firstProduct.stock}** at **${currency}${firstProduct.price}** with a stellar rating of **${firstProduct.rating || 5}/5**. It is highly recommended: "${firstProduct.description}"\n\nI've rendered its card below so you can easily click **'Details'** or **'Buy'** to add it to your cart! Let me know if you want to check out other items! 🛒`;
    }

    // Multiple products conversational match
    let response = `I found some excellent matches for your search! Here are the top recommendations: 🔍\n\n`;
    activeProducts.forEach((p) => {
        response += `✨ **${p.name}** (${currency}${p.price} - ${p.stock})\n`;
        response += `   ⭐ Rated ${p.rating || 5}/5: ${p.description}\n\n`;
    });
    response += `I've loaded the interactive cards for these products below! You can click **'Buy'** to add them to your cart, or **'Details'** to explore further. What features are most important to you? 🛒`;
    return response;
};

async function handleDemoMode(messages) {
    const stream = createUIMessageStream({
        async execute({ writer }) {
            const lastUserMessage = messages[messages.length - 1];
            const text = getMessageText(lastUserMessage);
            
            console.log("AI Chat [DEMO MODE]: Handling query:", text);
            
            const msgId = "msg_" + generateId();
            
            writer.write({
                type: 'text-start',
                id: msgId,
            });

            // Parse query
            const lowerText = text.toLowerCase().trim();
            const isGreeting = ['hi', 'hello', 'hey', 'hola', 'greetings', 'sup'].some(g => lowerText.startsWith(g) || lowerText === g);
            
            if (isGreeting) {
                const response = "Hello! I am NextCart's premium AI Shopping Assistant 🤖.\n\nI can help you find the perfect products from our catalog! Tell me what you're looking for, e.g., 'headphones', 'smartphones', 'laptops', 'earphones', or 'watches'.";
                const words = response.split(" ");
                for (const word of words) {
                    writer.write({
                        type: 'text-delta',
                        id: msgId,
                        delta: word + " ",
                    });
                    await sleep(25);
                }
                writer.write({
                    type: 'text-end',
                    id: msgId,
                });
                return;
            }

            const isCategories = ['categories', 'category', 'what do you have', 'what products'].some(k => lowerText.includes(k));
            if (isCategories) {
                const response = "We have a great selection of products across these categories: \n- 🎧 Headphone\n- 📱 Smartphone\n- ⌚ Watch\n- 🎒 Accessories\n- 📷 Camera\n- 💻 Laptop\n- 🔌 Earphone\n\nTell me what you are interested in, and I will search our store! 🛍️";
                const words = response.split(" ");
                for (const word of words) {
                    writer.write({
                        type: 'text-delta',
                        id: msgId,
                        delta: word + " ",
                    });
                    await sleep(25);
                }
                writer.write({
                    type: 'text-end',
                    id: msgId,
                });
                return;
            }

            // Extract cleaner search term and keywords
            const fillerWords = new Set([
                'i', 'need', 'want', 'please', 'give', 'show', 'find', 'search', 'get',
                'me', 'for', 'buy', 'looking', 'a', 'an', 'the', 'some', 'any', 'with', 
                'under', 'can', 'you', 'help', 'to', 'recommend', 'suggest', 'tell',
                'about', 'more', 'what', 'who', 'how', 'why', 'when', 'where', 'is',
                'it', 'its', 'they', 'them', 'their', 'our', 'us', 'we', 'he', 'she',
                'him', 'her', 'this', 'that', 'these', 'those', 'here', 'there', 'and',
                'or', 'but', 'if', 'then', 'else', 'on', 'in', 'at', 'by', 'of', 'from',
                'to', 'with', 'about', 'like', 'good', 'better', 'best', 'bad', 'worst',
                'great', 'awesome', 'amazing', 'perfect', 'ideal', 'ok', 'okay', 'yes', 'no',
                'not', 'now', 'still', 'only', 'just', 'neither', 'nor', 'never', 'none'
            ]);

            const getKeywords = (str) => {
                return str.toLowerCase()
                    .replace(/[^\w\s]/g, ' ')
                    .split(/\s+/)
                    .filter(word => word.length > 1 && !fillerWords.has(word));
            };

            let activeKeywords = getKeywords(lowerText);
            let query = lowerText;

            // Context Rollback Fallback!
            // If the current query contains NO active product keywords, scan backwards in history
            if (activeKeywords.length === 0 && messages.length > 1) {
                console.log("[DEMO MODE] Current query has no product keywords. Scanning message history for context...");
                for (let i = messages.length - 2; i >= 0; i--) {
                    if (messages[i].role === 'user') {
                        const prevText = getMessageText(messages[i]);
                        const prevKeywords = getKeywords(prevText);
                        if (prevKeywords.length > 0) {
                            activeKeywords = prevKeywords;
                            query = prevKeywords.join(" ");
                            console.log(`[DEMO MODE] Found historical context keywords: ${activeKeywords} from message: "${prevText}"`);
                            break;
                        }
                    }
                }
            }

            // Perform DB lookup using extracted keywords via the safe helper function
            let products = [];
            try {
                if (activeKeywords.length > 0) {
                    const searchQuery = activeKeywords.join(" ");
                    products = await searchProducts(searchQuery);
                }
            } catch (err) {
                console.error("Error searching products in Demo Mode:", err);
            }
            console.log(`[DEMO MODE] Found ${products.length} products for query keywords: [${activeKeywords.join(', ')}]`);

            // Intent analysis
            const isCheapSearch = ['cheap', 'cheapest', 'low price', 'budget', 'under'].some(k => lowerText.includes(k));
            const isBestSearch = ['best', 'top', 'highest', 'popular', 'star'].some(k => lowerText.includes(k));

            if (isCheapSearch && products.length > 0) {
                products.sort((a, b) => a.price - b.price);
            } else if (isBestSearch && products.length > 0) {
                products.sort((a, b) => b.rating - a.rating);
            }

            // Generate conversational ChatGPT-style response
            const responseText = generateConversationalResponse(query, products, lowerText);

            // Yield Tool Call & Output for the client cards to render
            const toolCallId = "call_" + generateId();
            writer.write({
                type: 'tool-input-available',
                toolCallId,
                toolName: 'searchCatalog',
                input: { query }
            });

            writer.write({
                type: 'tool-output-available',
                toolCallId,
                output: { products }
            });

            // Stream the ChatGPT-style response word by word
            const responseWords = responseText.split(" ");
            for (const word of responseWords) {
                writer.write({
                    type: 'text-delta',
                    id: msgId,
                    delta: word + " ",
                });
                await sleep(25);
            }

            // Append the custom product payload so frontend renders cards!
            if (products.length > 0) {
                const payload = `\n\n|||PRODUCTS_DATA|||${JSON.stringify(products)}|||`;
                writer.write({
                    type: 'text-delta',
                    id: msgId,
                    delta: payload,
                });
            }

            writer.write({
                type: 'text-end',
                id: msgId,
            });
        }
    });

    return createUIMessageStreamResponse({ 
        stream,
        headers: {
            'x-demo-mode': 'true',
        }
    });
}

export async function POST(req) {
    let messages = [];
    try {
        console.log("AI Chat Request received");

        const body = await req.json();
        messages = body.messages || [];
        console.log("Messages count:", messages.length);

        if (isDemoModeKey(process.env.GROQ_API_KEY)) {
            console.log("GROQ_API_KEY is placeholder or missing. Switching to Demo Mode fallback.");
            return handleDemoMode(messages);
        }

        const categories = await getCategorySummary();
        console.log("Categories fetched:", categories.length);

        console.log("Starting streamText with model: llama3-70b-8192");

        const result = streamText({
            model: groq('llama3-70b-8192'), 
            system: `You are the NextCart AI Shopping Assistant, a helpful and stylish expert.
            Your goal is to help users discover products, get recommendations, and find what they need.
            
            Available Categories in the store: ${categories.join(', ')}.
            
            Guidelines:
            - Be friendly, concise, and helpful.
            - If a user asks for recommendations, use the 'searchCatalog' tool to find real products.
            - Always recommend products from the actual store catalog using the tool.
            - If you find products, mention them naturally and describe why they fit the user's request.
            - You can also suggest categories if they aren't sure what they want.
            - If the user's style description matches a category, suggest products from that category.
            - Use emojis to keep it engaging! 🛍️✨`,
            messages,
            maxSteps: 5,
            tools: {
                searchCatalog: tool({
                    description: 'Search the product catalog for products matching a query (e.g., "wireless headphones", "laptops under 1000", "smartphones")',
                    parameters: z.object({
                        query: z.string().describe('The search query or keywords to find products'),
                    }),
                    execute: async ({ query }) => {
                        console.log("AI searching catalog for:", query);
                        const products = await searchProducts(query);
                        console.log("AI found products count:", products.length);
                        return { products };
                    },
                }),
            },
            onFinish: ({ text, toolCalls, toolResults }) => {
                console.log("AI Chat finished. Text length:", text?.length);
                if (toolCalls?.length) console.log("Tools called:", toolCalls.length);
            }
        });

        console.log("Returning DataStreamResponse");
        return result.toDataStreamResponse();
    } catch (error) {
        console.error("AI Chat Error (Groq Failed):", error);
        console.log("Attempting switch to Demo Mode fallback due to API failure.");
        try {
            return handleDemoMode(messages);
        } catch (fallbackError) {
            console.error("Fallback failed:", fallbackError);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    }
}
