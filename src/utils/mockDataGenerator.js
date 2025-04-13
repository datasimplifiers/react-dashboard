// src/utils/mockDataGenerator.js
import { subDays, format, addDays, eachDayOfInterval, setHours, setMinutes, setSeconds, parseISO, differenceInDays, startOfDay, endOfDay } from 'date-fns';

// --- Helper Functions ---
const getRandom = (min, max) => Math.random() * (max - min) + min;
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const chooseRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generateId = (prefix) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

// --- Mock Dimensions Data ---
const stores = [
    { storeKey: 'S1', storeId: 'METRO_CAI_01', storeName: 'Metro Cairo Downtown', city: 'Cairo' },
    { storeKey: 'S2', storeId: 'METRO_GIZ_01', storeName: 'Metro Giza Pyramids View', city: 'Giza' },
    { storeKey: 'S3', storeId: 'METRO_ALX_01', storeName: 'Metro Alexandria Corniche', city: 'Alexandria' },
];

const categories = [
    { categoryKey: 'C1', name: 'Fresh Produce' }, { categoryKey: 'C2', name: 'Dairy & Eggs' }, { categoryKey: 'C3', name: 'Bakery' }, { categoryKey: 'C4', name: 'Meat & Seafood' }, { categoryKey: 'C5', name: 'Pantry Staples' }, { categoryKey: 'C6', name: 'Beverages' },
];

// Added 'tags' and more items for potential association rule simulation
const products = [
    { productKey: 'P101', name: 'Tomatoes (kg)', categoryKey: 'C1', unitCost: 5, unitPrice: 8, tags: ['veg', 'salad'] },
    { productKey: 'P102', name: 'Bananas (kg)', categoryKey: 'C1', unitCost: 10, unitPrice: 15, tags: ['fruit', 'snack'] },
    { productKey: 'P103', name: 'Apples (kg)', categoryKey: 'C1', unitCost: 15, unitPrice: 25, tags: ['fruit', 'snack'] },
    { productKey: 'P104', name: 'Cucumber (kg)', categoryKey: 'C1', unitCost: 4, unitPrice: 7, tags: ['veg', 'salad'] }, // Added for pairing
    { productKey: 'P201', name: 'Milk (1L)', categoryKey: 'C2', unitCost: 12, unitPrice: 18, tags: ['dairy', 'breakfast'] },
    { productKey: 'P202', name: 'Yogurt (Pack)', categoryKey: 'C2', unitCost: 20, unitPrice: 30, tags: ['dairy', 'snack', 'breakfast'] },
    { productKey: 'P203', name: 'Cheese Block', categoryKey: 'C2', unitCost: 40, unitPrice: 65, tags: ['dairy', 'sandwich'] },
    { productKey: 'P301', name: 'White Bread Loaf', categoryKey: 'C3', unitCost: 6, unitPrice: 10, tags: ['bakery', 'sandwich', 'breakfast'] },
    { productKey: 'P302', name: 'Croissants (Pack)', categoryKey: 'C3', unitCost: 18, unitPrice: 28, tags: ['bakery', 'snack', 'breakfast'] },
    { productKey: 'P401', name: 'Chicken Breast (kg)', categoryKey: 'C4', unitCost: 60, unitPrice: 90, tags: ['meat', 'dinner'] },
    { productKey: 'P501', name: 'Pasta (500g)', categoryKey: 'C5', unitCost: 8, unitPrice: 14, tags: ['pantry', 'dinner', 'italian'] },
    { productKey: 'P502', name: 'Rice (1kg)', categoryKey: 'C5', unitCost: 15, unitPrice: 22, tags: ['pantry', 'dinner'] },
    { productKey: 'P503', name: 'Pasta Sauce', categoryKey: 'C5', unitCost: 18, unitPrice: 28, tags: ['pantry', 'dinner', 'italian'] },
    { productKey: 'P601', name: 'Water Bottle (1.5L)', categoryKey: 'C6', unitCost: 3, unitPrice: 5, tags: ['beverage', 'essentials'] },
    { productKey: 'P602', name: 'Cola Can', categoryKey: 'C6', unitCost: 4, unitPrice: 7, tags: ['beverage', 'snack'] },
    { productKey: 'P603', name: 'Chips Large Bag', categoryKey: 'C5', unitCost: 10, unitPrice: 15, tags: ['pantry', 'snack'] },
];

const competitors = [
    { competitorKey: 'CMPT_A', competitorName: 'HyperMart One', strategyFactor: 0.95 },
    { competitorKey: 'CMPT_B', competitorName: 'CarreFour Express', strategyFactor: 1.02 },
    { competitorKey: 'CMPT_C', competitorName: 'Local Grocer Plus', strategyFactor: 1.0 },
    { competitorKey: 'CMPT_D', competitorName: 'Lulu Hypermarket', strategyFactor: 0.88 },
    { competitorKey: 'CMPT_E', competitorName: 'Kheir Zaman', strategyFactor: 1.01 },
    { competitorKey: 'CMPT_F', competitorName: 'Kazyon', strategyFactor: 1.03 },
    { competitorKey: 'CMPT_G', competitorName: 'Gourmet Egypt', strategyFactor: 1.06 },
];

// --- Customers ---
const customerSegments = ['Family Shopper', 'Budget Conscious', 'Premium Buyer', 'Health Focused', 'New Member', 'Occasional Visitor'];
const customers = Array.from({ length: 200 }, (_, i) => {
    const joinDate = subDays(new Date(), getRandomInt(30, 730));
    const segment = chooseRandom(customerSegments);
    let valueSegment = 'Medium';
    if (segment === 'Premium Buyer' || segment === 'Family Shopper') valueSegment = Math.random() < 0.6 ? 'High' : 'Medium';
    if (segment === 'Budget Conscious' || segment === 'Occasional Visitor' || segment === 'New Member') valueSegment = Math.random() < 0.6 ? 'Low' : 'Medium';
    return { customerKey: `CUST_${1001 + i}`, customerName: `Customer ${1001 + i}`, segment: segment, valueSegment: valueSegment, joinDate: joinDate.toISOString(), city: chooseRandom(['Cairo', 'Giza', 'Alexandria']), };
});

// --- Promotions ---
const promotions = [
    { promotionKey: 'PROMO_10OFF_DAIRY', name: '10% Off Dairy', type: 'Percentage', discountPercent: 10, categoryKey: 'C2', startDate: subDays(new Date(), 60), endDate: addDays(new Date(), 30) },
    { promotionKey: 'PROMO_BOGO_BREAD', name: 'BOGO White Bread', type: 'BOGO', productKey: 'P301', startDate: subDays(new Date(), 30), endDate: addDays(new Date(), 10) },
    { promotionKey: 'PROMO_5EGP_PASTA', name: 'Save 5 EGP on Pasta', type: 'Amount', discountAmount: 5, productKey: 'P501', startDate: subDays(new Date(), 15), endDate: addDays(new Date(), 15) },
    { promotionKey: 'PROMO_BUNDLE_ITALIAN', name: 'Pasta + Sauce Bundle Discount', type: 'Bundle', discountAmount: 8, relatedKeys: ['P501', 'P503'], startDate: subDays(new Date(), 45), endDate: addDays(new Date(), 45) },
    { promotionKey: 'PROMO_15PCT_FAMSEG', name: '15% Off For Families', type: 'Percentage', discountPercent: 15, segment: 'Family Shopper', startDate: subDays(new Date(), 20), endDate: addDays(new Date(), 10) }, // Segment specific
    { promotionKey: 'PROMO_SPEND200', name: '10% off EGP 200+ Spend', type: 'Basket Value', discountPercent: 10, minValue: 200, startDate: subDays(new Date(), 90), endDate: addDays(new Date(), 60) },
];

// --- NEW: Store Layout Zones ---
// Simple mapping for demonstration. Real system would use planograms.
// --- Store Layout Zones (Ensure some are marked restricted) ---
const storeZones = [
    { zoneKey: 'Z01', zoneName: 'Entrance/Exit', zoneType: 'Transition', categoryKeys: [], restricted: false },
    { zoneKey: 'Z02', zoneName: 'Fresh Produce', zoneType: 'Aisle', categoryKeys: ['C1'], restricted: false },
    { zoneKey: 'Z03', zoneName: 'Dairy & Chilled', zoneType: 'Aisle', categoryKeys: ['C2'], restricted: false },
    { zoneKey: 'Z04', zoneName: 'Bakery Corner', zoneType: 'Service', categoryKeys: ['C3'], restricted: false },
    { zoneKey: 'Z05', zoneName: 'Meat & Seafood', zoneType: 'Service', categoryKeys: ['C4'], restricted: false },
    { zoneKey: 'Z06', zoneName: 'Pantry Aisles 1', zoneType: 'Aisle', categoryKeys: ['C5'], restricted: false },
    { zoneKey: 'Z07', zoneName: 'Pantry Aisles 2', zoneType: 'Aisle', categoryKeys: ['C5'], restricted: false },
    { zoneKey: 'Z08', zoneName: 'Beverages', zoneType: 'Aisle', categoryKeys: ['C6'], restricted: false },
    { zoneKey: 'Z09', zoneName: 'Checkout Area', zoneType: 'Checkout', categoryKeys: [], restricted: false },
    { zoneKey: 'Z10', zoneName: 'Promotional Endcap', zoneType: 'Display', categoryKeys: [], restricted: false },
    // --- Add Restricted Zones ---
    { zoneKey: 'Z98', zoneName: 'Stock Room A', zoneType: 'Restricted', categoryKeys: [], restricted: true },
    { zoneKey: 'Z99', zoneName: 'Manager Office', zoneType: 'Restricted', categoryKeys: [], restricted: true },
];

// --- NEW: Cameras (DimCamera) ---
const cameras = [];
stores.forEach(store => {
    // Add 5-10 cameras per store
    const numCameras = getRandomInt(5, 10);
    for (let i = 1; i <= numCameras; i++) {
        // Assign camera to a random zone (excluding Entrance/Exit potentially)
        let zone = chooseRandom(storeZones.filter(z => z.zoneKey !== 'Z01'));
        // Sometimes assign to checkout specifically
        if (i > numCameras - 2) zone = storeZones.find(z => z.zoneKey === 'Z09'); // Last 1 or 2 cameras at checkout

        cameras.push({
            sensorKey: `CAM_${store.storeKey}_${String(i).padStart(2, '0')}`,
            sensorId: `CAM_${store.storeKey}_${String(i).padStart(2, '0')}`, // Use same as key for simplicity
            sensorType: 'Camera',
            locationKey: store.storeKey, // Simplified: Using storeKey as locationKey
            zoneKey: zone?.zoneKey || null, // Assign zoneKey
            zoneName: zone?.zoneName || 'Unknown Zone', // Denormalize zone name
            purpose: zone?.zoneKey === 'Z09' ? 'Checkout Monitoring' : 'General Surveillance',
            installationDate: format(subDays(new Date(), getRandomInt(180, 1000)), 'yyyy-MM-dd'),
            storeName: store.storeName, // Denormalize store name
        });
    }
});

// --- NEW: Security Alert Types (DimSecurityAlertType) ---
const alertTypes = [
    { alertTypeKey: 'ALERT_NS', alertTypeCode: 'NONSCAN', alertDescription: 'Potential Item Not Scanned', severityLevel: 'High', sourceSystem: 'AI POS Analysis' },
    { alertTypeKey: 'ALERT_SW', alertTypeCode: 'SWEETHEART', alertDescription: 'Potential Sweethearting', severityLevel: 'High', sourceSystem: 'AI POS Analysis' },
    { alertTypeKey: 'ALERT_LEAVE', alertTypeCode: 'CART_ABANDON', alertDescription: 'Cart Abandonment at Checkout', severityLevel: 'Medium', sourceSystem: 'AI Checkout Cam' },
    { alertTypeKey: 'ALERT_LOITER', alertTypeCode: 'LOITER', alertDescription: 'Suspicious Loitering Detected', severityLevel: 'Medium', sourceSystem: 'AI General Cam' },
    { alertTypeKey: 'ALERT_SPILL', alertTypeCode: 'SPILL', alertDescription: 'Spill/Hazard Detected', severityLevel: 'Low', sourceSystem: 'AI Hazard Detection' },
    { alertTypeKey: 'ALERT_TAMPER', alertTypeCode: 'TAMPER', alertDescription: 'Product Tampering Suspected', severityLevel: 'High', sourceSystem: 'AI Shelf Cam' },
    { alertTypeKey: 'ALERT_ENTRY', alertTypeCode: 'ENTRY_DENIED', alertDescription: 'Unauthorized Area Entry Attempt', severityLevel: 'Medium', sourceSystem: 'Access Control' },
    { alertTypeKey: 'ALERT_OTHER', alertTypeCode: 'OTHER', alertDescription: 'Other Anomaly Detected', severityLevel: 'Low', sourceSystem: 'AI General Cam' },
    
];

// --- NEW: Suppliers ---
const suppliers = [
    { supplierKey: 'SUP_001', supplierName: 'Fresh Farms Inc.', leadTimeDays: 3, reliabilityScore: 0.95 },
    { supplierKey: 'SUP_002', supplierName: 'Global Goods Co.', leadTimeDays: 10, reliabilityScore: 0.88 },
    { supplierKey: 'SUP_003', supplierName: 'Cairo Distribution LLC', leadTimeDays: 1, reliabilityScore: 0.98 },
    { supplierKey: 'SUP_004', supplierName: 'Pantry Provisions Ltd.', leadTimeDays: 7, reliabilityScore: 0.90 },
    { supplierKey: 'SUP_005', supplierName: 'Beverage Masters', leadTimeDays: 5, reliabilityScore: 0.92 },
];

// Add supplierKey to products (simple assignment for demo)
products.forEach((p, index) => {
    if (['C1', 'C4'].includes(p.categoryKey)) p.supplierKey = 'SUP_001';
    else if (['C2', 'C3'].includes(p.categoryKey)) p.supplierKey = 'SUP_003';
    else if (['C6'].includes(p.categoryKey)) p.supplierKey = 'SUP_005';
    else p.supplierKey = index % 2 === 0 ? 'SUP_002' : 'SUP_004';
});


// --- ENHANCED: generateMockSalesData ---
export const generateMockSalesData = (startDate, endDate) => {
    console.log(`Generating sales data from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
    const salesData = [];
    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
    const today = startOfDay(new Date());

    // Pre-calculate active promotions for better performance
    const activePromotions = promotions.filter(p => {
        // Ensure dates are parsed correctly
        const promoStart = startOfDay(p.startDate instanceof Date ? p.startDate : parseISO(p.startDate || '1970-01-01'));
        const promoEnd = endOfDay(p.endDate instanceof Date ? p.endDate : parseISO(p.endDate || '2999-12-31'));
        // Check for overlap with the generation range
        return promoStart <= endOfDay(endDate) && promoEnd >= startOfDay(startDate);
    });
    // console.log("Active Promotions for period:", activePromotions.length);

    // Simple pairing rules for market basket simulation
    const pairings = {
        'P501': { pairedKey: 'P503', chance: 0.6 }, // Pasta -> Sauce
        'P301': { pairedKey: 'P203', chance: 0.4 }, // Bread -> Cheese
        'P602': { pairedKey: 'P603', chance: 0.7 }, // Cola -> Chips
        'P101': { pairedKey: 'P104', chance: 0.5 }, // Tomato -> Cucumber
    };

    for (const date of dateInterval) {
        const dateKey = format(date, 'yyyy-MM-dd');
        for (const store of stores) {
            const baseTransactions = store.storeKey === 'S1' ? 120 : (store.storeKey === 'S3' ? 80 : 100);
            const dailyTransactions = getRandomInt(baseTransactions * 0.7, baseTransactions * 1.3);

            for (let i = 0; i < dailyTransactions; i++) {
                try {
                    const transactionId = `T-${dateKey}-${store.storeKey}-${i}`;
                    const itemsForTransaction = []; // Store {product, quantity} pairs first
                    let transactionGrossValue = 0; // Track basket value for potential promos
                    const transactionTimestamp = setSeconds(setMinutes(setHours(date, getRandomInt(8, 21)), getRandomInt(0, 59)), getRandomInt(0, 59));

                    // Assign customer (75% chance)
                    let customer = null;
                    if (Math.random() < 0.75) { customer = chooseRandom(customers); }
                    const customerKey = customer ? customer.customerKey : null;
                    const customerSegment = customer ? customer.segment : null;

                    const numItemsToTry = getRandomInt(1, 8);
                    const productKeysInBasket = new Set();

                    // Build the basket first
                    for (let j = 0; j < numItemsToTry; j++) {
                        let product = chooseRandom(products);
                        while (productKeysInBasket.has(product.productKey) && productKeysInBasket.size < products.length / 2) {
                             product = chooseRandom(products); // Avoid duplicates
                        }
                        if (productKeysInBasket.has(product.productKey)) continue;
                        productKeysInBasket.add(product.productKey);
                        itemsForTransaction.push({ product: product, quantity: getRandomInt(1, 5) });

                        // Check for pairings
                        const pairingRule = pairings[product.productKey];
                        if (pairingRule && !productKeysInBasket.has(pairingRule.pairedKey) && Math.random() < pairingRule.chance) {
                            const pairedProduct = products.find(p => p.productKey === pairingRule.pairedKey);
                            if (pairedProduct) {
                                itemsForTransaction.push({ product: pairedProduct, quantity: getRandomInt(1, 3) }); // Add paired item
                                productKeysInBasket.add(pairedProduct.productKey);
                            }
                        }
                    }

                    // Calculate transaction gross value
                    itemsForTransaction.forEach(itemDetail => {
                        const { product, quantity } = itemDetail;
                        const priceVariance = getRandom(-0.5, 1.0);
                        const baseUnitPrice = Math.max(product.unitCost + 0.5, product.unitPrice + priceVariance);
                        transactionGrossValue += baseUnitPrice * quantity;
                    });

                    // Process each item in the final basket, applying promotions
                    itemsForTransaction.forEach(itemDetail => {
                        const { product, quantity } = itemDetail;
                        const priceVariance = getRandom(-0.5, 1.0);
                        const baseUnitPrice = Math.max(product.unitCost + 0.5, product.unitPrice + priceVariance);
                        const grossSalesAmount = quantity * baseUnitPrice;
                        const costOfGoodsSold = quantity * product.unitCost;

                        // Find best applicable promotion for this item/basket/customer
                        let appliedPromotion = null;
                        let discountAmount = 0;
                        let discountPercentage = 0;
                        let unitPrice = baseUnitPrice;

                        // Simplified Promotion Logic: Check specific item/cat/segment first, then basket value
                        const possiblePromos = activePromotions.filter(promo => {
                            const promoStart = startOfDay(promo.startDate instanceof Date ? promo.startDate : parseISO(promo.startDate || '1970-01-01'));
                            const promoEnd = endOfDay(promo.endDate instanceof Date ? promo.endDate : parseISO(promo.endDate || '2999-12-31'));
                            const transactionDate = startOfDay(transactionTimestamp); // Compare dates only
                            if(!(transactionDate >= promoStart && transactionDate <= promoEnd)) return false; // Is promo active today?

                            if (promo.productKey === product.productKey) return true;
                            if (promo.categoryKey === product.categoryKey) return true;
                            if (promo.segment && promo.segment === customerSegment) return true;
                            if (promo.type === 'Bundle' && promo.relatedKeys?.includes(product.productKey) && promo.relatedKeys.every(key => productKeysInBasket.has(key))) return true;
                            if (promo.type === 'Basket Value' && transactionGrossValue >= promo.minValue) return true;
                            return false;
                        });

                        if (possiblePromos.length > 0) {
                            // Prioritize: Product > Category > Segment > Bundle > Basket Value (simple priority)
                            appliedPromotion = possiblePromos.sort((a, b) => {
                                const priority = { 'Product': 1, 'Category': 2, 'Segment': 3, 'Bundle': 4, 'Basket Value': 5 };
                                return (priority[a.type] || 99) - (priority[b.type] || 99);
                            })[0];

                            if (appliedPromotion.type === 'Percentage') {
                                discountPercentage = appliedPromotion.discountPercent || 0;
                                discountAmount = grossSalesAmount * (discountPercentage / 100);
                            } else if (appliedPromotion.type === 'Amount') {
                                discountAmount = Math.min(grossSalesAmount - costOfGoodsSold, appliedPromotion.discountAmount || 0); // Ensure profit
                                if (grossSalesAmount > 0) discountPercentage = (discountAmount / grossSalesAmount) * 100;
                            } else if (appliedPromotion.type === 'BOGO' && quantity >= 2) {
                                discountAmount = Math.min(baseUnitPrice, grossSalesAmount); // Discount one item's base price
                                if (grossSalesAmount > 0) discountPercentage = (discountAmount / grossSalesAmount) * 100;
                            } else if (appliedPromotion.type === 'Bundle') {
                                // Distribute bundle discount based on item's share of bundle value in basket
                                const bundleItemsInBasket = itemsForTransaction.filter(item => appliedPromotion.relatedKeys.includes(item.product.productKey));
                                const bundleValueInBasket = bundleItemsInBasket.reduce((sum, item) => sum + (item.product.unitPrice * item.quantity), 0); // Approx value
                                const itemShare = (baseUnitPrice * quantity) / (bundleValueInBasket || 1);
                                discountAmount = Math.min((appliedPromotion.discountAmount || 0) * itemShare, grossSalesAmount);
                                if (grossSalesAmount > 0) discountPercentage = (discountAmount / grossSalesAmount) * 100;
                            } else if (appliedPromotion.type === 'Basket Value') {
                                // Apply percentage discount proportionally to this item's value share
                                const itemShareOfBasket = grossSalesAmount / (transactionGrossValue || 1);
                                discountPercentage = appliedPromotion.discountPercent || 0;
                                discountAmount = transactionGrossValue * (discountPercentage / 100) * itemShareOfBasket;
                                discountAmount = Math.min(discountAmount, grossSalesAmount - costOfGoodsSold); // Ensure profit
                            }

                             discountAmount = Math.max(0, discountAmount); // Ensure non-negative
                             discountPercentage = isFinite(discountPercentage) ? Math.max(0, discountPercentage) : 0;
                             unitPrice = (grossSalesAmount - discountAmount) / quantity;

                        }

                        const netSalesAmount = grossSalesAmount - discountAmount;
                        const grossProfit = netSalesAmount - costOfGoodsSold;

                        salesData.push({
                            transactionId, customerKey, timestamp: transactionTimestamp.toISOString(), dateKey, hourOfDay: parseInt(format(transactionTimestamp, 'H')), dayOfWeek: format(transactionTimestamp, 'EEEE'), storeKey: store.storeKey, productKey: product.productKey, categoryKey: product.categoryKey, promotionKey: appliedPromotion ? appliedPromotion.promotionKey : null, quantitySold: quantity, unitPrice: parseFloat(unitPrice.toFixed(2)), grossSalesAmount: parseFloat(grossSalesAmount.toFixed(2)), discountAmount: parseFloat(discountAmount.toFixed(2)), discountPercentage: parseFloat(discountPercentage.toFixed(2)), netSalesAmount: parseFloat(netSalesAmount.toFixed(2)), costOfGoodsSold: parseFloat(costOfGoodsSold.toFixed(2)), grossProfit: parseFloat(grossProfit.toFixed(2)),
                            // Denormalized
                            productName: product.name, categoryName: categories.find(c => c.categoryKey === product.categoryKey)?.name || 'Unknown', storeName: store.storeName, customerSegment: customerSegment || 'Unknown', // Use Unknown if no customer
                        });
                    }); // End forEach item

                } catch (loopError) { console.error("Error in sales generation loop:", loopError); }
            } // End transaction loop
        } // End store loop
    } // End date loop
    console.log(`Generated ${salesData.length} enhanced sales records.`);
    return salesData;
};

// --- Mock Market Basket Analysis Results ---
export const getMockMBARules = () => {
    // Use the products array defined above for names
    const productMap = new Map(products.map(p => [p.productKey, p]));
    const plausibleRules = [
         { ruleId: 'MBA001', antecedent: ['P501'], consequent: ['P503'], support: 0.08, confidence: 0.65, lift: 3.1 }, // Pasta (500g) => Pasta Sauce
         { ruleId: 'MBA002', antecedent: ['P602'], consequent: ['P603'], support: 0.12, confidence: 0.72, lift: 2.5 }, // Cola Can => Chips Large Bag
         { ruleId: 'MBA003', antecedent: ['P301'], consequent: ['P203'], support: 0.06, confidence: 0.41, lift: 1.8 }, // White Bread Loaf => Cheese Block
         { ruleId: 'MBA004', antecedent: ['P201'], consequent: ['P301'], support: 0.07, confidence: 0.35, lift: 1.5 }, // Milk (1L) => White Bread Loaf
         { ruleId: 'MBA005', antecedent: ['P101'], consequent: ['P104'], support: 0.03, confidence: 0.28, lift: 1.3 }, // Tomatoes (kg) => Cucumber (kg)
         { ruleId: 'MBA006', antecedent: ['P401'], consequent: ['P502'], support: 0.09, confidence: 0.55, lift: 2.1 }, // Chicken Breast (kg) => Rice (1kg)
         { ruleId: 'MBA007', antecedent: ['P302'], consequent: ['P201'], support: 0.04, confidence: 0.48, lift: 1.9 }, // Croissants (Pack) => Milk (1L)
         { ruleId: 'MBA008', antecedent: ['P202'], consequent: ['P102'], support: 0.05, confidence: 0.40, lift: 1.6 }, // Yogurt (Pack) => Bananas (kg)
    ];

    const rules = [];
     plausibleRules.forEach(rule => {
        const antecedentNames = rule.antecedent.map(key => productMap.get(key)?.name || key).filter(Boolean);
        const consequentNames = rule.consequent.map(key => productMap.get(key)?.name || key).filter(Boolean);
        if (antecedentNames.length === rule.antecedent.length && consequentNames.length === rule.consequent.length) {
            rules.push({ ...rule, antecedentNames: antecedentNames.join(', '), consequentNames: consequentNames.join(', ') });
        }
    });
    return rules.sort((a, b) => b.lift - a.lift);
};


// --- Export Base Dimensions ---
export const getMockStores = () => stores;
export const getMockCategories = () => categories;
export const getMockProducts = () => products;
export const getMockCompetitors = () => competitors;
export const getMockCustomers = () => customers;
export const getMockPromotions = () => promotions.map(p => ({ // Return copies with Date objects parsed for easier use
    ...p,
    startDate: p.startDate instanceof Date ? p.startDate : parseISO(p.startDate || '1970-01-01'),
    endDate: p.endDate instanceof Date ? p.endDate : parseISO(p.endDate || '2999-12-31'),
}));
export const getMockStoreZones = () => storeZones;

export const getMockCameras = () => cameras; // NEW
export const getMockAlertTypes = () => alertTypes; // NEW
export const getMockSuppliers = () => suppliers;
