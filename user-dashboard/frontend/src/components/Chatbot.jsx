import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaSync } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchItems } from '../services/api';
import '../styles/Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { t, language } = useLanguage();
    const { isAuthenticated } = useAuth();
    const [dbItems, setDbItems] = useState([]);

    // State to track conversation context
    const [chatState, setChatState] = useState(null);

    useEffect(() => {
        fetchItems().then(data => {
            if (data && Array.isArray(data)) {
                setDbItems(data);
            }
        });
    }, []);

    // --- DATA HANDLING ---
    // All item data is now fetched dynamically from the database via fetchItems()
    // for real-time accuracy in stock and pricing.


    // Initial Message
    const initialMessage = {
        text: "Hi! I'm your HeritX AI Assistant. I can help you find products, check live stock, or answer rental questions. Try asking 'Is Chenda in stock?'",
        sender: 'bot',
        options: ["Check Availability", "Top Rentals", "How it works?", "Support"]
    };

    const [messages, setMessages] = useState([initialMessage]);

    // Reset chat when language changes so greeting matches
    useEffect(() => {
        setMessages([{
            text: "Hi! I'm your HeritX AI Assistant. I can help you find products, check live stock, or answer rental questions. Try asking 'Is Chenda in stock?'",
            sender: 'bot',
            options: ["Check Availability", "Top Rentals", "How it works?", "Support"]
        }]);
        setChatState(null);
    }, [language, t]);

    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isTyping]);

    const resetChat = () => {
        setMessages([{
            text: "Chat reset! How can I assist you further with your heritage rental today?",
            sender: 'bot',
            options: ["Check Availability", "Top Rentals", "How it works?", "Support"]
        }]);
        setInputText("");
        setChatState(null);
    };

    // --- FUZZY MATCHING LOGIC ---
    const getLevenshteinDistance = (a, b) => {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    };

    const findMatchingKeyword = (query, keywords) => {
        const words = query.toLowerCase().split(/[^a-z0-9\u0D00-\u0D7F]+/); // Add Malayalam range
        for (let word of words) {
            if (!word) continue;
            for (let keyword of keywords) {
                if (word === keyword) return keyword;
                const distance = getLevenshteinDistance(word, keyword);
                const allowedMistakes = keyword.length > 4 ? 2 : 1;
                if (distance <= allowedMistakes && keyword.length > 3) return keyword;
            }
        }
        return null;
    };

    // --- IMPROVED INTENT IDENTIFICATION ---
    const identifyIntent = (query, currentContext) => {
        const lowerQuery = query.toLowerCase();

        // 1. GREETING CHECK
        if (lowerQuery.match(/hi|hello|hey|namaste|നമസ്കാരം/)) {
            return {
                text: "Hello! I'm your HeritX Assistant. I can help you find traditional items, check stock availability, or guide you through the booking process. What are you looking for today?",
                options: [t('sugg_avail'), t('sugg_book'), "Show cultural items", t('sugg_delivery')],
                newState: null
            };
        }

        // 2. SEARCH FOR ITEM IN DATABASE
        let bestMatch = null;
        let highestScore = 0;

        dbItems.forEach(item => {
            const name = item.name.toLowerCase();
            const words = name.split(/\s+/);
            
            // Exact match
            if (lowerQuery.includes(name)) {
                bestMatch = item;
                highestScore = 100;
            } else {
                // Fuzzy/Partial word match
                words.forEach(word => {
                    if (word.length > 3 && lowerQuery.includes(word) && highestScore < 80) {
                        bestMatch = item;
                        highestScore = 80;
                    }
                });
            }
        });

        // If an item is found in the user's query
        if (bestMatch) {
            const isOutOfStock = parseInt(bestMatch.quantity) <= 0;
            const stockColor = isOutOfStock ? '#ef4444' : '#10b981';
            const imageUrl = bestMatch.image_url ? `/HertiX/${bestMatch.image_url}` : null;

            let responseText = `<div style="margin-bottom: 10px;">I found the <strong>${bestMatch.name}</strong> for you:</div>`;
            
            if (imageUrl) {
                responseText += `<div class="chat-item-image"><img src="${imageUrl}" alt="${bestMatch.name}" onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=No+Image'" /></div>`;
            }

            responseText += `
                <div style="background: #f8f9fa; padding: 12px; border-radius: 10px; border-left: 4px solid #000;">
                    <div style="font-weight: 800; font-size: 1.1rem; margin-bottom: 4px;">${bestMatch.name}</div>
                    <div style="font-size: 0.85rem; color: #666; margin-bottom: 8px;">${bestMatch.description || 'Traditional Kerala cultural piece.'}</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px; font-size: 0.85rem;">
                        <span>💰 <strong>₹${bestMatch.price_per_day}/day</strong></span>
                        <span style="color: ${stockColor};">● <strong>${isOutOfStock ? 'Out of Stock' : `In Stock (${bestMatch.quantity} available)`}</strong></span>
                    </div>
                </div>
            `;

            return {
                text: responseText,
                options: isOutOfStock ? ["Similar items", "How to book?"] : ["Book Now", "Check Availability"],
                action: isAuthenticated 
                    ? { label: "View Details", url: `/item/${bestMatch.id}` }
                    : { label: "Login to Book", url: "/login" },
                newState: { itemId: bestMatch.id, itemName: bestMatch.name }
            };
        }

        // 3. BOOKING / HOW TO RENT (Context Aware)
        if (lowerQuery.match(/book|rent|how|reserve|എങ്ങനെ/)) {
            if (!isAuthenticated) {
                return {
                    text: "To book items, you'll need to **Login** to your account first. This helps us track your orders and deposits securely.",
                    options: ["Login Now", "Browse as Guest"],
                    action: { label: "Go to Login", url: "/login" },
                    newState: null
                };
            }
            if (currentContext && currentContext.itemId) {
                return {
                    text: `Would you like to proceed with booking the <strong>${currentContext.itemName}</strong>? I can take you directly to the booking page.`,
                    options: ["Yes, take me there", "Check another item"],
                    action: { label: `Book ${currentContext.itemName}`, url: `/item/${currentContext.itemId}` },
                    newState: currentContext
                };
            }
            return {
                text: "Rental is easy! <br/>1. Find an item <br/>2. Click <strong>Book Now</strong> <br/>3. Select dates & Pay deposit. <br/><br/>Which item would you like to book?",
                options: ["Browse All Items", "Help with Payment"],
                action: { label: "Browse Collection", url: "/browse" },
                newState: null
            };
        }

        // 4. CONTEXTUAL "YES" / "BOOK NOW" CLICK
        if (lowerQuery.includes("yes") || lowerQuery === "book now") {
            if (currentContext && currentContext.itemId) {
                return {
                    text: `Great choice! Taking you to the booking page for the **${currentContext.itemName}** now...`,
                    action: { label: "Proceed to Booking", url: `/item/${currentContext.itemId}` },
                    newState: currentContext
                };
            }
        }

        // 5. AVAILABILITY / STOCK INTENT
        if (lowerQuery.includes("stock") || lowerQuery.includes("available") || lowerQuery.includes("have") || lowerQuery.includes("ലഭ്യത")) {
            return {
                text: "Our stock is updated in real-time. Please type the name of the item you're looking for (e.g., 'Chenda' or 'Saree').",
                options: ["Chenda", "Saree", "Kathakali"],
                newState: null
            };
        }

        // 6. DELIVERY / CONTACT
        if (lowerQuery.match(/delivery|shipping|ഡെലിവറി/)) {
            return { text: t('bot_delivery_info'), options: ["How to book?"], newState: null };
        }
        if (lowerQuery.match(/owner|contact|call|support|help/)) {
            return {
                text: "For questions about a specific item, use the 'Contact Owner' button on the item page. For general help, chat with us on WhatsApp.",
                options: ["WhatsApp Support"],
                action: { label: "WhatsApp", url: "https://wa.me/919876543210" },
                newState: null
            };
        }

        // 7. FALLBACK
        return {
            text: "I'm here to help with your heritage rentals. You can ask for specific items, how to book, or about delivery. What would you like to do?",
            options: ["Check Availability", "How to rent?", "Browse All"],
            newState: null
        };
    };

    const handleSend = async (text = inputText) => {
        if (!text.trim()) return;
        const userMessage = { text: text, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputText("");
        setIsTyping(true);

        setTimeout(() => {
            const botResponse = identifyIntent(text, chatState);
            const botMessage = {
                text: botResponse.text,
                sender: 'bot',
                options: botResponse.options,
                action: botResponse.action
            };
            setMessages(prev => [...prev, botMessage]);
            setChatState(botResponse.newState);
            setIsTyping(false);
        }, 800);
    };

    const [isOverFooter, setIsOverFooter] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const footer = document.querySelector('.site-footer');
            if (footer) {
                const footerRect = footer.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                // Chatbot bottom is ~30px, height ~60px. Top is windowHeight - 90.
                if (footerRect.top < (windowHeight - 80)) {
                    setIsOverFooter(true);
                } else {
                    setIsOverFooter(false);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Initial check
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <div className={`chatbot-toggle ${isOverFooter ? 'footer-active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <FaTimes className="chatbot-icon" /> : <FaRobot className="chatbot-icon" />}
            </div>

            {isOpen && (
                <div className="chatbot-window fade-in-up">
                    <div className="chatbot-header">
                        <div className="chatbot-title">
                            <FaRobot /> {t('chatbotTitle')}
                        </div>
                        <div className="header-controls">
                            <button className="header-btn" onClick={resetChat} title={t('resetChat')}>
                                <FaSync />
                            </button>
                            <button className="header-btn close-btn" onClick={() => setIsOpen(false)} title={t('closeChat')}>
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
                                <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                                {msg.action && (
                                    msg.action.url.startsWith('http') ? (
                                        <a href={msg.action.url} target="_blank" rel="noopener noreferrer" className="action-btn-link">
                                            {msg.action.label}
                                        </a>
                                    ) : (
                                        <Link to={msg.action.url} className="action-btn-link">
                                            {msg.action.label}
                                        </Link>
                                    )
                                )}
                                {msg.options && (
                                    <div className="options-container">
                                        {msg.options.map((opt, i) => (
                                            <div key={i} className="option-chip" onClick={() => handleSend(opt)}>
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isTyping && <div className="typing-indicator"><span className="dot"></span><span className="dot"></span><span className="dot"></span></div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-input">
                        <input
                            type="text"
                            placeholder={t('typeMessage')}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button className="send-btn" onClick={() => handleSend()}>
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
