// src/utils/mockPurchaseOrderGenerator.js
import { subDays, addDays, format, parseISO, isValid, differenceInDays, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';
import { getMockProducts, getMockStores, getMockSuppliers } from './mockDataGenerator';

// --- Helper Functions ---
const getRandom = (min, max) => Math.random() * (max - min) + min;
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const chooseRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generateId = (prefix) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

// --- Generate Mock Purchase Order Data ---
// This is simplified - real POs depend on actual need, not just random generation
export const generateMockPurchaseOrderData = (startDate, endDate) => {
    console.log(`Generating purchase orders from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
    const purchaseOrders = [];
    const products = getMockProducts();
    const suppliers = getMockSuppliers();
    const locations = getMockStores().map(s => ({ locationKey: `LOC_${s.storeKey}`, locationName: s.storeName })); // POs typically go to stores/DCs
    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
    let poCounter = 1;

    dateInterval.forEach(orderDate => {
        // Simulate placing a few orders each day
        const numOrdersToday = getRandomInt(2, 8);
        for (let i = 0; i < numOrdersToday; i++) {
            try {
                const product = chooseRandom(products);
                const supplier = suppliers.find(s => s.supplierKey === product.supplierKey);
                const location = chooseRandom(locations);
                if (!supplier) continue; // Skip if product has no valid supplier

                const poId = `PO_${format(orderDate, 'yyMMdd')}_${String(poCounter++).padStart(4, '0')}`;
                const orderedQty = getRandomInt(50, 300);
                const leadTime = supplier.leadTimeDays || 7;
                const expectedReceiptDate = addDays(orderDate, leadTime);

                // Simulate status and actual receipt
                let status = 'Ordered';
                let actualReceiptDate = null;
                let receivedQty = null;
                const today = startOfDay(new Date());
                const expectedReceiptDay = startOfDay(expectedReceiptDate);

                if (expectedReceiptDay < today) { // If expected receipt date is in the past
                    const reliability = supplier.reliabilityScore || 0.9;
                    if (Math.random() < reliability * 0.9) { // 90% of reliable chance = received
                        status = 'Received';
                        // Simulate receipt date (could be early, on time, or slightly late)
                        const receiptDayOffset = getRandomInt(-Math.floor(leadTime * 0.1), Math.ceil(leadTime * 0.2)); // -10% early to +20% late
                        actualReceiptDate = addDays(expectedReceiptDate, receiptDayOffset);
                        // Simulate received quantity (usually full, sometimes partial)
                        receivedQty = Math.random() < 0.95 ? orderedQty : Math.round(orderedQty * getRandom(0.8, 0.98));
                        if(receivedQty < orderedQty && receivedQty > 0) status = 'Partially Received';
                        if(receivedQty === 0) status = 'Cancelled'; // Or handle zero received?
                    } else { // Not received / Cancelled / Still Pending?
                       if (differenceInDays(today, expectedReceiptDay) > 14) { // If very late, maybe cancelled
                           status = 'Cancelled';
                       } else {
                           status = 'Pending Receipt'; // Still waiting
                       }
                    }
                } else {
                    status = 'Ordered'; // Not expected yet
                }


                purchaseOrders.push({
                    purchaseOrderId: poId,
                    orderDate: format(orderDate, 'yyyy-MM-dd'),
                    expectedReceiptDate: format(expectedReceiptDate, 'yyyy-MM-dd'),
                    actualReceiptDate: actualReceiptDate ? format(actualReceiptDate, 'yyyy-MM-dd') : null,
                    productKey: product.productKey,
                    supplierKey: supplier.supplierKey,
                    destinationLocationKey: location.locationKey,
                    orderedQuantity: orderedQty,
                    receivedQuantity: receivedQty,
                    unitCost: product.unitCost, // Assuming PO uses standard cost
                    totalOrderLineAmount: parseFloat((orderedQty * product.unitCost).toFixed(2)),
                    status: status,
                    // Denormalized
                    productName: product.name,
                    supplierName: supplier.supplierName,
                    locationName: location.locationName,
                });

            } catch(err) { console.error("Error generating PO:", err); }
        }
    });

    console.log(`Generated ${purchaseOrders.length} PO line items.`);
    // Sort by most recent order date
    return purchaseOrders.sort((a, b) => parseISO(b.orderDate) - parseISO(a.orderDate));
};