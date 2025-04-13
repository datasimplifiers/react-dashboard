// src/utils/mockPurchaseOptimizationGenerator.js
import {
    subDays, format, addDays, eachDayOfInterval, setHours, setMinutes, setSeconds, parseISO, startOfDay, endOfDay, differenceInDays, isValid
} from 'date-fns';
import { getMockStores, getMockProducts, getMockSuppliers, getMockCategories } from './mockDataGenerator'; // Reuse common data

// --- Helper Functions ---
const getRandom = (min, max) => Math.random() * (max - min) + min;
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const chooseRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generateId = (prefix) => `${prefix}_${Math.random().toString(36).substring(2, 9)}`;

// --- Constants ---
const ON_TIME_THRESHOLD_DAYS = 1; // Receipt within +/- 1 day of expected is 'On-Time'
const PARTIAL_RECEIPT_CHANCE = 0.05; // 5% chance of partial receipt
const PRICE_FLUCTUATION_FACTOR = 0.15; // Max 15% fluctuation around base cost for PO price

// --- Dimensions (Reused from common generator) ---
// getMockStores() -> Receiving Locations
// getMockProducts()
// getMockSuppliers()
// getMockCategories()

// --- Fact Data Generator ---
export const generateMockPurchaseOrderData = (startDate, endDate) => {
    console.log(`Generating purchase order data from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
    const purchaseOrderData = [];
    const stores = getMockStores();
    const products = getMockProducts();
    const suppliers = getMockSuppliers();
    const categories = getMockCategories(); // For denormalization
    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });

    const productMap = new Map(products.map(p => [p.productKey, p]));
    const supplierMap = new Map(suppliers.map(s => [s.supplierKey, s]));
    const categoryMap = new Map(categories.map(c => [c.categoryKey, c]));

    let poCounter = 10001; // Start PO numbers

    for (const date of dateInterval) {
        const orderDateKey = format(date, 'yyyy-MM-dd');
        const orderTimestamp = setSeconds(setMinutes(setHours(startOfDay(date), getRandomInt(9, 16)), getRandomInt(0, 59)), getRandomInt(0, 59));

        // Generate a random number of POs per day
        const dailyPOs = getRandomInt(8, 25);

        for (let i = 0; i < dailyPOs; i++) {
            try {
                const product = chooseRandom(products);
                const supplier = supplierMap.get(product.supplierKey);
                const receivingStore = chooseRandom(stores); // Assume any store can receive any product for simplicity
                const category = categoryMap.get(product.categoryKey);

                if (!product || !supplier || !receivingStore || !category) {
                     console.warn("Skipping PO due to missing dimension data", {product, supplier, receivingStore, category});
                     continue;
                }

                const poNumber = `PO-${poCounter++}`;
                const purchaseOrderKey = `POK_${poNumber}`;

                // --- Quantities ---
                let orderedQuantity;
                // Adjust order quantity based on category (higher for staples)
                if (['C5', 'C6'].includes(product.categoryKey)) { // Pantry, Beverages
                    orderedQuantity = getRandomInt(50, 300);
                } else if (['C1', 'C2', 'C3', 'C4'].includes(product.categoryKey)) { // Fresh, Dairy, Bakery, Meat
                    orderedQuantity = getRandomInt(10, 100);
                } else {
                    orderedQuantity = getRandomInt(20, 150);
                }

                let receivedQuantity = orderedQuantity;
                let isPartialReceipt = false;
                if (Math.random() < PARTIAL_RECEIPT_CHANCE) {
                     isPartialReceipt = true;
                    receivedQuantity = Math.max(0, orderedQuantity - getRandomInt(1, Math.max(2, Math.floor(orderedQuantity * 0.1)))); // Receive slightly less
                }

                // --- Pricing ---
                const baseCost = product.unitCost;
                const unitPrice = parseFloat((baseCost * getRandom(1 - PRICE_FLUCTUATION_FACTOR, 1 + PRICE_FLUCTUATION_FACTOR)).toFixed(2));
                const totalCost = parseFloat((orderedQuantity * unitPrice).toFixed(2));

                // Simulate a simple 'market price' (using product's base unitPrice + noise)
                const simulatedMarketPrice = parseFloat((product.unitPrice * getRandom(0.9, 1.1)).toFixed(2));
                const priceVarianceVsMarket = unitPrice - simulatedMarketPrice;
                const priceVarianceVsCost = unitPrice - baseCost;

                // --- Timing ---
                const leadTimePlannedDays = supplier.leadTimeDays || 7; // Default if not specified
                const expectedReceiptDate = addDays(orderTimestamp, leadTimePlannedDays + getRandomInt(-1, 1)); // Add slight variance to expected date
                const expectedReceiptDateKey = format(expectedReceiptDate, 'yyyy-MM-dd');

                // Simulate Actual Receipt Date based on expected date and supplier reliability
                let actualReceiptDelayDays = 0;
                const reliabilityFactor = supplier.reliabilityScore || 0.9; // Default reliability
                if (Math.random() > reliabilityFactor) { // Chance of delay increases with lower reliability
                    actualReceiptDelayDays = getRandomInt(1, leadTimePlannedDays * 0.5 + 2); // Delay can be significant
                } else if (Math.random() < 0.1) { // Small chance of being early
                     actualReceiptDelayDays = getRandomInt(-2, 0);
                }
                 // Add small random noise regardless
                 actualReceiptDelayDays += getRandomInt(-1, 1);


                const actualReceiptDate = addDays(expectedReceiptDate, actualReceiptDelayDays);
                const actualReceiptDateKey = format(actualReceiptDate, 'yyyy-MM-dd');

                const leadTimeActualDays = differenceInDays(actualReceiptDate, orderTimestamp);

                 // --- Status ---
                 let receiptStatus = 'Unknown';
                 const dateDifference = differenceInDays(actualReceiptDate, expectedReceiptDate);

                 if (isPartialReceipt) {
                    receiptStatus = 'Partially Received';
                 } else if (dateDifference > ON_TIME_THRESHOLD_DAYS) {
                     receiptStatus = 'Late';
                 } else if (dateDifference < -ON_TIME_THRESHOLD_DAYS) {
                     receiptStatus = 'Early';
                 } else {
                     receiptStatus = 'On-Time';
                 }


                 // --- Create Record ---
                purchaseOrderData.push({
                    purchaseOrderKey,
                    poNumber,
                    orderDateKey,
                    orderTimestamp: orderTimestamp.toISOString(),
                    // Dimension Keys
                    supplierKey: supplier.supplierKey,
                    productKey: product.productKey,
                    categoryKey: product.categoryKey, // Included for filtering/analysis
                    locationKey: receivingStore.storeKey, // Receiving Store
                    // Order Details
                    orderedQuantity,
                    receivedQuantity,
                    unitPrice,
                    totalCost,
                    // Pricing Analysis
                    baseUnitCost: baseCost, // Store base cost for reference
                    marketUnitPrice: simulatedMarketPrice, // Simulated market price
                    priceVarianceVsCost: parseFloat(priceVarianceVsCost.toFixed(2)),
                    priceVarianceVsMarket: parseFloat(priceVarianceVsMarket.toFixed(2)),
                    // Timing
                    expectedReceiptDateKey,
                    actualReceiptDateKey,
                    leadTimePlannedDays,
                    leadTimeActualDays,
                    // Status & Derived Metrics
                    receiptStatus, // 'On-Time', 'Late', 'Early', 'Partially Received'
                    onTimeFlag: (receiptStatus === 'On-Time' && !isPartialReceipt) ? 1 : 0,
                    leadTimeVarianceDays: leadTimeActualDays - leadTimePlannedDays,
                    // Denormalized Fields
                    supplierName: supplier.supplierName,
                    productName: product.name,
                    categoryName: category.name,
                    storeName: receivingStore.storeName, // Receiving Store Name
                });

            } catch (loopError) {
                 console.error("Error generating PO data loop:", loopError, {product, supplier, receivingStore});
            }
        } // End daily PO loop
    } // End date loop

    console.log(`Generated ${purchaseOrderData.length} mock purchase order records.`);
    // Data Cleaning
    const cleanData = purchaseOrderData.filter(d =>
        d.orderedQuantity != null && isFinite(d.orderedQuantity) &&
        d.receivedQuantity != null && isFinite(d.receivedQuantity) &&
        d.unitPrice != null && isFinite(d.unitPrice) &&
        d.totalCost != null && isFinite(d.totalCost) &&
        d.leadTimePlannedDays != null && isFinite(d.leadTimePlannedDays) &&
        d.leadTimeActualDays != null && isFinite(d.leadTimeActualDays) &&
        isValid(parseISO(d.orderTimestamp)) && // Check date validity
        isValid(parseISO(d.expectedReceiptDateKey)) &&
        isValid(parseISO(d.actualReceiptDateKey))
    );
     if (cleanData.length !== purchaseOrderData.length) {
          console.warn(`Filtered out ${purchaseOrderData.length - cleanData.length} PO records with invalid numeric or date values.`);
      }

    return cleanData.sort((a, b) => parseISO(a.orderTimestamp) - parseISO(b.orderTimestamp)); // Sort by order date
};