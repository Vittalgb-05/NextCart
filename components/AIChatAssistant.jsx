'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';
import toast from 'react-hot-toast';

// Helper to get text content from Vercel AI SDK v5/v6 messages
const getMessageText = (message) => {
    if (message.content) return message.content;
    if (message.parts && Array.isArray(message.parts)) {
        return message.parts
            .filter(part => part.type === 'text' || part.type === 'reasoning')
            .map(part => part.text)
            .filter(Boolean)
            .join('');
    }
    return '';
};

// Parser to extract dynamic product payload from messages
const parseMessageContent = (msgText) => {
    if (!msgText) return { cleanText: "", products: [] };
    const marker = "|||PRODUCTS_DATA|||";
    const parts = msgText.split(marker);
    
    if (parts.length < 2) {
        return { cleanText: msgText, products: [] };
    }
    
    const cleanText = parts[0].trim();
    let products = [];
    try {
        const jsonStr = parts[1].split("|||")[0];
        products = JSON.parse(jsonStr);
    } catch (err) {
        console.error("Error parsing products payload from message:", err);
    }
    
    return { cleanText, products };
};

export default function AIChatAssistant() {
    const context = useAppContext();
    const currency = context?.currency || '$';
    const router = context?.router;
    const addToCart = context?.addToCart;
    
    const [isOpen, setIsOpen] = useState(false);
    const [localInput, setLocalInput] = useState('');
    const [isDemoMode, setIsDemoMode] = useState(false);
    const scrollRef = useRef(null);

    const { messages, sendMessage, status } = useChat({
        transport: new DefaultChatTransport({ api: '/api/ai/chat' }),
        onError: (err) => {
            console.error("AI Chat Error (Frontend):", err);
            toast.error("AI connection issue. Check console.");
        },
        onResponse: (res) => {
            console.log("AI Response received. Status:", res.status);
            if (res.headers.get('x-demo-mode') === 'true') {
                setIsDemoMode(true);
            } else {
                setIsDemoMode(false);
            }
        }
    });

    const isLoading = status === 'submitted' || status === 'streaming';

    const handleFormSubmit = async (e) => {
        if (e) e.preventDefault();
        
        const text = localInput.trim();
        if (!text || isLoading) return;

        try {
            console.log("Sending:", text);
            setLocalInput('');
            
            // Cleanest way to send with useChat and custom input
            await sendMessage({
                text: text
            });
            
            console.log("sendMessage call completed");
        } catch (error) {
            console.error("Send error:", error);
            toast.error("Failed to send message");
            setLocalInput(text);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition duration-300 hover:scale-110 active:scale-95 bg-orange-600 text-white relative"
                >
                    <span className="text-2xl">🤖</span>
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500"></span>
                    </span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <div className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
                {/* Header */}
                <div className="p-4 bg-orange-600 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg">
                            🤖
                        </div>
                        <div>
                            <h3 className="text-sm font-bold leading-none">NextCart AI</h3>
                            <p className="text-[10px] opacity-80 mt-1">
                                Premium Shopping Assistant
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-black/10 rounded-lg transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                {/* Messages */}
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800"
                >
                    {(!messages || messages.length === 0) && (
                        <div className="text-center py-10 px-6">
                            <span className="text-4xl mb-4 block">👋</span>
                            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">Hi! I'm your Shopping Assistant.</h4>
                            <p className="text-xs text-gray-500 mt-2">Ask me for recommendations or find products!</p>
                        </div>
                    )}

                    {messages?.map((m) => {
                        const rawText = getMessageText(m);
                        const { cleanText, products: chatProducts } = parseMessageContent(rawText);

                        return (
                            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                    m.role === 'user' 
                                        ? 'bg-orange-600 text-white rounded-tr-none font-medium' 
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none'
                                }`}>
                                    {cleanText ? (
                                        <p className="whitespace-pre-wrap leading-relaxed">{cleanText}</p>
                                    ) : null}

                                    {/* Render Custom High-Fidelity Product Cards directly inside the message bubble! */}
                                    {m.role !== 'user' && chatProducts.length > 0 && (
                                        <div className="mt-3 space-y-3">
                                            {chatProducts.map((product) => (
                                                <div 
                                                    key={product.id}
                                                    className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-gray-900/90 p-3 rounded-xl border border-gray-200/50 dark:border-gray-700 shadow-md hover:shadow-lg hover:border-orange-500/30 transition-all duration-300 text-left text-gray-800 dark:text-gray-100 overflow-hidden group w-full"
                                                >
                                                    {/* Left: Thumbnail */}
                                                    <div className="w-16 h-16 relative flex-shrink-0 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100 dark:border-gray-800 mx-auto sm:mx-0">
                                                        {product.image ? (
                                                            <Image 
                                                                src={product.image} 
                                                                alt={product.name || 'Product'} 
                                                                fill 
                                                                className="object-contain p-1 group-hover:scale-110 transition duration-300"
                                                            />
                                                        ) : (
                                                            <span className="text-xs text-gray-400">No Image</span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Middle: Specs */}
                                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="text-[9px] bg-orange-600/10 text-orange-600 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                                    {product.category}
                                                                </span>
                                                                <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                                                                    ● {product.stock}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] font-bold truncate mt-1 text-gray-900 dark:text-gray-100">
                                                                {product.name}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <p className="text-xs font-black text-orange-600">{currency}{product.price}</p>
                                                            <span className="text-[10px] text-gray-400">
                                                                {"⭐".repeat(Math.round(product.rating))}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Right: Actions */}
                                                    <div className="flex sm:flex-col justify-end gap-1.5 flex-wrap w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
                                                        <button 
                                                            onClick={() => router.push(`/product/${product.id}`)}
                                                            className="flex-1 sm:flex-none text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition text-center"
                                                        >
                                                            Details
                                                        </button>
                                                        <button 
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                try {
                                                                    await addToCart(product.id);
                                                                    toast.success(`${product.name} added to cart! 🛒`);
                                                                } catch (err) {
                                                                    console.error(err);
                                                                    toast.error("Failed to add to cart");
                                                                }
                                                            }}
                                                            className="flex-1 sm:flex-none text-[10px] font-bold bg-orange-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-orange-700 active:scale-95 transition text-center shadow-sm shadow-orange-500/20"
                                                        >
                                                            Buy
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input form */}
                <form onSubmit={handleFormSubmit} className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111111] flex gap-2">
                    <input
                        value={localInput}
                        onChange={(e) => setLocalInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-orange-500 transition text-gray-800 dark:text-gray-100"
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !localInput.trim()} 
                        className="p-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20 active:scale-95"
                    >
                        <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}
