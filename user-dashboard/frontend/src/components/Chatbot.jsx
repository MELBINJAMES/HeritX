import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaSync } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { fetchItems } from '../services/api';
import '../styles/Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { t, language } = useLanguage();
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

    // --- KNOWLEDGE BASE ---
    const ITEM_DATA = {
        chenda: {
            name: "Chenda Drum",
            status: "In Stock",
            quantity: 4,
            description: "A traditional cylindrical percussion instrument used in festivals.",
            url: "/browse?q=chenda"
        },
        kathakali: {
            name: "Kathakali Full Set",
            status: "In Stock",
            quantity: 2,
            description: "Complete costume set for Kathakali performance, including headgear.",
            url: "/browse?q=kathakali"
        },
        nilavilakku: {
            name: "Nilavilakku (Traditional Lamp)",
            status: "In Stock",
            quantity: 12,
            description: "Bronze traditional lamp used for auspicious occasions.",
            url: "/browse?q=nilavilakku"
        },
        nettipattam: {
            name: "Nettipattam (Elephant Ornament)",
            status: "Low Stock",
            quantity: 1,
            description: "Gold-plated caparison used to decorate elephants.",
            url: "/browse?q=nettipattam"
        },
        idakka: {
            name: "Idakka",
            status: "In Stock",
            quantity: 5,
            description: "Hourglass-shaped pressure drum.",
            url: "/browse?q=idakka"
        },
        aranmula: {
            name: "Aranmula Kannadi",
            status: "Limited Stock",
            quantity: 2,
            description: "Handmade metal-alloy mirror from Aranmula.",
            url: "/browse?q=aranmula"
        },
        kasavu: {
            name: "Kasavu Saree",
            status: "In Stock",
            quantity: 15,
            description: "Traditional Kerala saree with golden border.",
            url: "/browse?q=kasavu"
        },
        jewellery: {
            name: "Traditional Jewellery",
            status: "In Stock",
            quantity: 20,
            description: "Antique Kerala style ornaments and necklaces.",
            url: "/browse?q=jewellery"
        },
        decor: {
            name: "Festival Decorations",
            status: "In Stock",
            quantity: 50,
            description: "Items to decorate your home for Onam or Vishu.",
            url: "/browse?q=decorations"
        }
    };

    // Initial Message
    const initialMessage = {
        text: t('greeting'),
        sender: 'bot',
        options: [t('sugg_avail'), t('sugg_book'), t('sugg_cultural'), t('sugg_delivery')]
    };

    const [messages, setMessages] = useState([initialMessage]);

    // Reset chat when language changes so greeting matches
    useEffect(() => {
        setMessages([{
            text: t('greeting'),
            sender: 'bot',
            options: [t('sugg_avail'), t('sugg_book'), t('sugg_cultural'), t('sugg_delivery')]
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
            text: t('greeting'),
            sender: 'bot',
            options: [t('sugg_avail'), t('sugg_book'), t('sugg_cultural'), t('sugg_delivery')]
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

    // --- INTENT IDENTIFICATION ---
    const identifyIntent = (query) => {
        const lowerQuery = query.toLowerCase();

        // Keywords (Mixed EN/ML)
        const intents = {
            booking: ["book", "rent", "reserve", "buy", "get", "select", "choose", "view", "browse", "catalog", "see", "show", "എങ്ങനെ ബുക്ക് ചെയ്യാം?", "ബുക്ക്"],
            cancellation: ["cancel", "return", "refund", "reject"],
            availability: ["available", "stock", "when", "date", "check", "ലഭ്യത പരിശോധിക്കുക", "ലഭ്യത"],
            wishlist: ["wishlist", "save", "heart", "favorite"],
            delivery: ["delivery", "shipping", "pickup", "ഡെലിവറി ലഭ്യമാണോ?", "ഡെലിവറി"],
            contact: ["owner", "contact", "call", "message"],
            greeting: ["hi", "hello", "namaste", "നമസ്കാരം"],
            comingSoon: ["pay", "money", "card", "upi"],
            categories: ["jewellery", "attire", "musical instruments", "ritual items", "decorations", "traditional lamps", "costumes", "headgear", "accessories", "art", "props", "festival"],
            occasions: ["onam", "vishu", "wedding", "housewarming", "temple", "kathakali", "mohiniyattam", "cultural", "ritual", "utsavam"],
            // Note: Keeping item names in English for mapping ease, but fuzzy match handles minor variations
            items: Object.keys(ITEM_DATA).concat([
                "mask", "lamp", "mirror", "aranmula", "saree", "kasavu", "mundu",
                "ornament", "necklace", "bangles", "painting", "mural",
                "boat", "vallam", "artifact", "samskarika"
            ]).concat(dbItems.map(it => it.name.toLowerCase()))
        };

        // Helper to get translated generic item prompt
        const getGenericItemResponse = (itemName, itemKey) => {
            return {
                text: `${t('view')} **${itemName}**...`,
                options: [`${t('check_avail')} ${itemName}`, t('view')],
                action: { label: `${t('view')} ${itemName}`, url: `/browse?q=${itemKey}` }
            };
        };

        // --- CONTEXT HANDLING ---
        if (chatState === 'awaiting_item_for_availability') {
            const matchedItemKey = findMatchingKeyword(query, intents.items);
            if (matchedItemKey) {
                setChatState(null);

                // 1. Check Database Items
                const dbItem = dbItems.find(it =>
                    it.name.toLowerCase().includes(matchedItemKey.toLowerCase()) ||
                    matchedItemKey.toLowerCase().includes(it.name.toLowerCase())
                );

                // 2. Check Static Knowledge Base for better metadata even if out of stock
                const staticData = ITEM_DATA[matchedItemKey.toLowerCase()];

                if (dbItem) {
                    const isOutOfStock = parseInt(dbItem.quantity) <= 0;
                    return {
                        text: `<strong>${dbItem.name}</strong><br/>Status: <strong>${isOutOfStock ? '<span style="color: #ef4444;">Out of Stock</span>' : 'In Stock'}</strong>${!isOutOfStock ? `<br/>Qty: ${dbItem.quantity}` : ''}<br/>${dbItem.description}`,
                        options: isOutOfStock ? [t('sugg_avail'), t('sugg_book')] : [t('book_now'), t('check_avail')],
                        action: { label: t('view'), url: `/item/${dbItem.id}` }
                    };
                }

                if (staticData) {
                    return {
                        text: `<strong>${staticData.name}</strong><br/>Status: <span style="color: #ef4444; font-weight: bold;">Out of Stock</span><br/>${staticData.description}`,
                        options: [t('sugg_avail'), t('sugg_book')],
                        action: { label: t('browse'), url: "/browse" }
                    };
                }

                // 3. Fallback: Generic Out of Stock
                return {
                    text: `Sorry, the **${matchedItemKey}** is currently **Out of Stock** in our shop. Would you like to check other available items?`,
                    options: [t('sugg_avail'), t('sugg_book')],
                    action: { label: t('browse'), url: "/browse" }
                };
            }
            if (lowerQuery.match(/cancel|stop|no/)) {
                setChatState(null);
                return { text: "Cancelled.", options: [t('sugg_avail')] };
            }
        }

        // --- ENTITY HANDLING ---
        // 1. Direct DB Item Search (Best for "Urumi", "Chenda", etc.)
        let matchedDbItem = null;
        for (const item of dbItems) {
            const nameLower = item.name.toLowerCase();
            // Check exact name match in query
            if (lowerQuery.includes(nameLower)) {
                matchedDbItem = item;
                break;
            }
            // Check significant word match (e.g. "Urumi" in "Urumi Sword")
            const words = nameLower.split(' ');
            for (const w of words) {
                if (w.length > 3 && lowerQuery.includes(w)) {
                    matchedDbItem = item;
                    break;
                }
            }
            if (matchedDbItem) break;
        }

        const matchedItemKey = !matchedDbItem ? findMatchingKeyword(query, intents.items) : null;
        const isAvailabilityIntent = findMatchingKeyword(query, intents.availability);
        const isBookingIntent = findMatchingKeyword(query, intents.booking);

        if (matchedDbItem) {
            const isOutOfStock = parseInt(matchedDbItem.quantity) <= 0;
            const imageUrl = matchedDbItem.image_url ? `http://localhost/HertiX/uploads/${matchedDbItem.image_url}` : null;

            let responseText = '';
            if (imageUrl) {
                responseText += `<div class="chat-item-image"><img src="${imageUrl}" alt="${matchedDbItem.name}" onerror="this.style.display='none'" /></div>`;
            }
            responseText += `<strong>${matchedDbItem.name}</strong><br/>`;
            if (isOutOfStock) {
                responseText += '<span style="color: #ef4444; font-weight: bold;">Out of Stock</span><br/>';
            }
            responseText += `<div class="chat-item-desc">${matchedDbItem.description}</div>`;

            return {
                text: responseText,
                options: isOutOfStock ? [t('sugg_avail'), t('sugg_book')] : [t('book_now'), t('check_avail')],
                action: { label: t('view'), url: `/item/${matchedDbItem.id}` }
            };
        }

        if (matchedItemKey) {
            // Check Static K-Base if DB didn't match
            // (Note: dbItems check above should have caught it if it was in DB, so this is mostly for hardcoded fallbacks)

            // Re-check DB just in case fuzzy match caught something the loop didn't (unlikely but safe)
            const dbItem = dbItems.find(it =>
                it.name.toLowerCase().includes(matchedItemKey.toLowerCase()) ||
                matchedItemKey.toLowerCase().includes(it.name.toLowerCase())
            );

            if (dbItem) {
                const isOutOfStock = parseInt(dbItem.quantity) <= 0;
                return {
                    text: `<strong>${dbItem.name}</strong><br/>${isOutOfStock ? '<span style="color: #ef4444; font-weight: bold;">Out of Stock</span><br/>' : ''}${dbItem.description}`,
                    options: isOutOfStock ? [t('sugg_avail'), t('sugg_book')] : [t('book_now'), t('check_avail')],
                    action: { label: t('view'), url: `/item/${dbItem.id}` }
                };
            }

            const staticData = ITEM_DATA[matchedItemKey.toLowerCase()];

            if (staticData) {
                return {
                    text: `<strong>${staticData.name}</strong><br/><span style="color: #ef4444; font-weight: bold;">Out of Stock</span><br/>${staticData.description}`,
                    options: [t('sugg_avail'), t('sugg_book')],
                    action: { label: t('browse'), url: "/browse" }
                };
            } else {
                // Return Out of Stock if keyword matched but no data exists in known inventory
                return {
                    text: `The **${matchedItemKey}** is currently **Out of Stock**. Feel free to browse our other traditional collections!`,
                    options: [t('sugg_avail'), t('sugg_book')],
                    action: { label: t('browse'), url: "/browse" }
                };
            }
        }

        // --- GENERAL INTENTS ---
        if (isAvailabilityIntent) {
            setChatState('awaiting_item_for_availability');
            return {
                text: t('bot_avail_ask'),
                options: ["Chenda", "Kathakali", "Nilavilakku", "Aranmula Kannadi", "Kasavu Saree", "Jewellery"]
            };
        }

        if (isBookingIntent) {
            return {
                text: t('bot_book_info'),
                options: [t('sugg_cultural'), t('sugg_avail')],
                action: { label: t('browse'), url: "/browse" }
            };
        }

        if (findMatchingKeyword(query, intents.contact) || lowerQuery.includes('help') || lowerQuery.includes('support')) {
            return {
                text: "You can contact our support team directly via WhatsApp for personalized assistance.",
                options: [t('sugg_avail'), t('sugg_book')],
                action: { label: "Chat on WhatsApp", url: "https://wa.me/919876543210" } // Replace with actual number
            };
        }

        if (findMatchingKeyword(query, intents.delivery)) {
            return { text: t('bot_delivery_info'), options: [t('sugg_book')] };
        }

        const matchedCategory = findMatchingKeyword(query, intents.categories);
        const matchedOccasion = findMatchingKeyword(query, intents.occasions);

        if (matchedCategory) {
            return {
                text: `You can find various items in the **${matchedCategory}** category. Would you like to browse them?`,
                options: [t('view'), t('sugg_avail')],
                action: { label: `Browse ${matchedCategory}`, url: `/browse?q=${matchedCategory}` }
            };
        }

        if (matchedOccasion) {
            return {
                text: `Looking for items for **${matchedOccasion}**? We have a great collection for traditional festivals and ceremonies.`,
                options: [t('view'), t('sugg_avail')],
                action: { label: `View ${matchedOccasion} items`, url: `/browse?q=${matchedOccasion}` }
            };
        }

        if (lowerQuery.includes("cultural") || lowerQuery.includes("samskarika") || lowerQuery.includes("items")) {
            return {
                text: "We have a wide range of cultural items like Chenda, Kathakali sets, Nilavilakku, and more.",
                options: ["Chenda", "Kathakali", "Jewellery", "Aranmula Kannadi"],
                action: { label: t('browse'), url: "/browse" }
            };
        }

        // Fallback
        return {
            text: t('bot_fallback'),
            options: [t('sugg_avail'), t('sugg_book')]
        };
    };

    const handleSend = async (text = inputText) => {
        if (!text.trim()) return;
        const userMessage = { text: text, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputText("");
        setIsTyping(true);

        setTimeout(() => {
            const botResponse = identifyIntent(text);
            const botMessage = {
                text: botResponse.text,
                sender: 'bot',
                options: botResponse.options,
                action: botResponse.action
            };
            setMessages(prev => [...prev, botMessage]);
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
