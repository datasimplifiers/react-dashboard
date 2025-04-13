// src/utils/mockSupportDataGenerator.js
import { subDays, addMinutes, addSeconds, format, setHours, setMinutes, setSeconds, startOfDay, endOfDay, addDays, parseISO, differenceInMinutes, eachDayOfInterval } from 'date-fns';
import { getMockCustomers, getMockProducts, getMockStores } from './mockDataGenerator'; // Import base dimension getters

// --- Helper Functions ---
const getRandom = (min, max) => Math.random() * (max - min) + min;
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const chooseRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generateId = (prefix) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

// --- Generate Mock Web Interactions ---
export const generateMockWebInteractions = (startDate, endDate, customers, products) => {
    console.log(`Generating web interactions from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
    const interactions = [];
    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
    const channels = ['WebApp', 'MobileApp'];
    const deviceTypes = ['Desktop', 'Mobile', 'Tablet'];
    const searchTerms = ['milk', 'bread', 'tomato', 'chicken', 'rice', 'pasta', 'diapers', 'shampoo', 'offer', 'discount', 'cheese', 'water bottle', 'nescafe', 'laundry detergent'];

    dateInterval.forEach(date => {
        const dailySessions = getRandomInt(500, 1500); // More sessions than store visits typically
        for (let i = 0; i < dailySessions; i++) {
            try {
                const sessionId = generateId(`WEB_${format(date, 'yyMMdd')}`);
                const channel = chooseRandom(channels);
                const deviceType = chooseRandom(deviceTypes);
                const customer = Math.random() < 0.6 ? chooseRandom(customers) : null; // 60% logged in
                const customerKey = customer?.customerKey || null;
                const segment = customer?.segment || null;
                let currentTime = setSeconds(setMinutes(setHours(date, getRandomInt(0, 23)), getRandomInt(0, 59)), getRandomInt(0, 59)); // Any time of day

                // Simulate session events
                const numEvents = getRandomInt(3, 15);
                let viewedProduct = null;
                let searched = false;
                let clickedRecommendation = false;
                let purchased = false;

                // Add session start event
                interactions.push({
                    interactionId: generateId('INT'), timestamp: currentTime.toISOString(), sessionId, eventType: 'session_start', customerKey, channel, deviceType, segment,
                });
                currentTime = addSeconds(currentTime, getRandomInt(1, 5)); // Small gap

                for (let j = 0; j < numEvents; j++) {
                    const eventTypeRoll = Math.random();
                    let event = { interactionId: generateId('INT'), timestamp: currentTime.toISOString(), sessionId, customerKey, channel, deviceType, segment };

                    if (eventTypeRoll < 0.4) { // View Product
                        event.eventType = 'view_product';
                        viewedProduct = chooseRandom(products);
                        event.productId = viewedProduct.productKey;
                        event.productName = viewedProduct.name; // Denormalize
                    } else if (eventTypeRoll < 0.6) { // Search
                        event.eventType = 'search';
                        searched = true;
                        const query = chooseRandom(searchTerms);
                        event.searchQuery = query;
                        // Simulate search success (longer query = less chance? simplified)
                        event.isSearchSuccess = query.length < 6 || Math.random() > 0.2;
                    } else if (eventTypeRoll < 0.75 && viewedProduct) { // Add to Cart (requires prior view)
                        event.eventType = 'add_to_cart';
                        event.productId = viewedProduct.productKey;
                        event.productName = viewedProduct.name;
                    } else if (eventTypeRoll < 0.85) { // Click Recommendation
                        event.eventType = 'click_recommendation';
                        clickedRecommendation = true;
                        const recommendedProduct = chooseRandom(products);
                        event.productId = recommendedProduct.productKey; // Product clicked
                        event.recommendationType = chooseRandom(['Similar Products', 'Frequently Bought Together', 'Featured']); // Type of rec clicked
                        event.productName = recommendedProduct.name;
                    } else if (eventTypeRoll < 0.90 && Math.random() < 0.4) { // Purchase (lower chance)
                        event.eventType = 'purchase_complete';
                        purchased = true;
                        event.transactionValue = parseFloat(getRandom(50, 500).toFixed(2));
                        interactions.push(event); // Push purchase
                        break; // End session after purchase
                    } else {
                         event.eventType = 'page_view'; // Generic page view
                         event.pageName = chooseRandom(['Homepage', 'Category Page', 'Cart', 'Profile']);
                    }

                    interactions.push(event);
                    currentTime = addSeconds(currentTime, getRandomInt(5, 45)); // Time between actions
                }

                // Optionally add session end event (though less critical for analysis)
                // interactions.push({ eventId: generateId('INT'), timestamp: currentTime.toISOString(), sessionId, eventType: 'session_end', customerKey, channel, deviceType });

            } catch (err) { console.error("Error generating web session:", err); }
        }
    });
    console.log(`Generated ${interactions.length} web interaction events.`);
    return interactions;
};


// --- Generate Mock Support Tickets ---
export const generateMockSupportTickets = (startDate, endDate, customers) => {
    console.log(`Generating support tickets from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
    const tickets = [];
    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
    const channels = ['Phone', 'Chat', 'Email', 'In-App'];
    const categories = ['Order Issue', 'Technical Support', 'Product Question', 'Account Help', 'Feedback', 'Delivery Problem'];
    const statuses = ['Open', 'In Progress', 'Resolved', 'Closed']; // 'Closed' implies resolved maybe? Let's keep both for demo
    let ticketCounter = 1;

    dateInterval.forEach(date => {
        const dailyTickets = getRandomInt(10, 50);
        for (let i = 0; i < dailyTickets; i++) {
            try {
                const customer = chooseRandom(customers); // Assume tickets are from known customers
                const createdTimestamp = setSeconds(setMinutes(setHours(date, getRandomInt(8, 20)), getRandomInt(0, 59)), getRandomInt(0, 59));
                let status = chooseRandom(statuses);
                let resolvedTimestamp = null;
                let resolutionTimeMinutes = null;
                let csatScore = null;

                if (status === 'Resolved' || status === 'Closed') {
                    // More realistic resolution time (longer for tech/delivery)
                    const baseMins = ['Technical Support', 'Delivery Problem'].includes(categories[i % categories.length]) ? getRandomInt(60, 6 * 60) : getRandomInt(15, 120);
                    resolutionTimeMinutes = baseMins + getRandomInt(-baseMins * 0.2, baseMins * 0.5);
                    resolutionTimeMinutes = Math.max(5, Math.round(resolutionTimeMinutes)); // Min 5 mins
                    resolvedTimestamp = addMinutes(createdTimestamp, resolutionTimeMinutes);
                    // Assign CSAT for a portion of resolved/closed tickets
                    if (Math.random() < 0.6) { // 60% chance of CSAT score
                        csatScore = getRandomInt(1, 5); // Score 1-5
                    }
                }

                tickets.push({
                    ticketId: `TKT_${String(ticketCounter++).padStart(7, '0')}`,
                    customerKey: customer.customerKey,
                    createdTimestamp: createdTimestamp.toISOString(),
                    resolvedTimestamp: resolvedTimestamp ? resolvedTimestamp.toISOString() : null,
                    channel: chooseRandom(channels),
                    category: chooseRandom(categories),
                    status: status,
                    resolutionTimeMinutes: resolutionTimeMinutes,
                    csatScore: csatScore,
                    // Denormalized
                    customerName: customer.customerName,
                    customerSegment: customer.segment,
                });

            } catch (err) { console.error("Error generating support ticket:", err); }
        }
    });

    console.log(`Generated ${tickets.length} support tickets.`);
    return tickets.sort((a, b) => parseISO(b.createdTimestamp) - parseISO(a.createdTimestamp)); // Sort descending
};