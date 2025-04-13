// src/utils/mockWasteDataGenerator.js
import {
    subDays, format, addDays, eachDayOfInterval, setHours, setMinutes, setSeconds, parseISO, startOfDay
} from 'date-fns';
import { getMockStores, getMockProducts, getMockCategories } from './mockDataGenerator'; // Reuse common data

// --- Helper Functions (assuming these are available or redefine if not globally accessible) ---
const getRandom = (min, max) => Math.random() * (max - min) + min;
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const chooseRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generateId = (prefix) => `${prefix}_${Math.random().toString(36).substring(2, 9)}`;

// --- NEW: Waste-Specific Dimensions ---

// DimWasteType
const wasteTypes = [
    { wasteTypeKey: 'WT_SP', name: 'Spoilage', description: 'Product spoiled due to natural decay', category: 'Organic' },
    { wasteTypeKey: 'WT_EX', name: 'Expiration', description: 'Product reached its expiration date', category: 'Organic/Packaging' },
    { wasteTypeKey: 'WT_DM', name: 'Damage', description: 'Product damaged during handling, storage, or on shelf', category: 'Varies' },
    { wasteTypeKey: 'WT_UN', name: 'Unsold/Overstock', description: 'Excess inventory not sold (e.g., seasonal, slow-moving)', category: 'Varies' },
    { wasteTypeKey: 'WT_PS', name: 'Preparation Scrap', description: 'Waste generated during in-store preparation (e.g., bakery, deli trim)', category: 'Organic' },
    { wasteTypeKey: 'WT_QC', name: 'Quality Control', description: 'Removed due to not meeting quality standards (supplier issue, etc.)', category: 'Varies' },
    { wasteTypeKey: 'WT_RT', name: 'Customer Return', description: 'Product returned by customer and deemed unsellable', category: 'Varies' },
    { wasteTypeKey: 'WT_TH', name: 'Theft/Shrinkage', description: 'Product lost due to theft or unaccounted shrinkage (categorized as waste)', category: 'Shrinkage' }, // Can be inferred
    { wasteTypeKey: 'WT_OT', name: 'Other', description: 'Other miscellaneous reasons for waste', category: 'Other' },
];

// DimWasteReason
const wasteReasons = [
    // Spoilage/Expiration Reasons
    { reasonKey: 'WR_NATURAL', reasonDescription: 'Natural Decay/Spoilage', sourceArea: 'Shelf/Stock', relatedTypes: ['WT_SP'] },
    { reasonKey: 'WR_EXPIRED_SHELF', reasonDescription: 'Expired On Shelf', sourceArea: 'Shelf', relatedTypes: ['WT_EX'] },
    { reasonKey: 'WR_EXPIRED_STOCK', reasonDescription: 'Expired In Stock', sourceArea: 'Stock Room', relatedTypes: ['WT_EX'] },
    { reasonKey: 'WR_TEMP_ABUSE', reasonDescription: 'Temperature Abuse', sourceArea: 'Storage/Transport', relatedTypes: ['WT_SP', 'WT_QC'] },
    // Damage Reasons
    { reasonKey: 'WR_HANDLING', reasonDescription: 'Handling Error (Staff)', sourceArea: 'Store Operations', relatedTypes: ['WT_DM'] },
    { reasonKey: 'WR_PACKAGING', reasonDescription: 'Damaged Packaging', sourceArea: 'Shelf/Stock', relatedTypes: ['WT_DM'] },
    { reasonKey: 'WR_SUPPLIER_DMG', reasonDescription: 'Damaged on Arrival (Supplier)', sourceArea: 'Receiving', relatedTypes: ['WT_DM', 'WT_QC'] },
    { reasonKey: 'WR_CUSTOMER_DMG', reasonDescription: 'Customer Mishandling', sourceArea: 'Shelf', relatedTypes: ['WT_DM', 'WT_RT'] },
    // Overstock/Unsold Reasons
    { reasonKey: 'WR_OVER_ORDER', reasonDescription: 'Over-ordering', sourceArea: 'Planning', relatedTypes: ['WT_UN'] },
    { reasonKey: 'WR_SLOW_MOVE', reasonDescription: 'Slow Moving Item', sourceArea: 'Shelf', relatedTypes: ['WT_UN'] },
    { reasonKey: 'WR_SEASONAL', reasonDescription: 'End of Season/Promotion', sourceArea: 'Shelf', relatedTypes: ['WT_UN'] },
    // Prep Scrap Reasons
    { reasonKey: 'WR_PREP_TRIM', reasonDescription: 'Trimming/Cutting Waste', sourceArea: 'Preparation Area', relatedTypes: ['WT_PS'] },
    { reasonKey: 'WR_COOKING_LOSS', reasonDescription: 'Cooking/Baking Loss', sourceArea: 'Preparation Area', relatedTypes: ['WT_PS'] },
    // Other Reasons
    { reasonKey: 'WR_RETURN_UNSELL', reasonDescription: 'Returned - Unsellable', sourceArea: 'Customer Service', relatedTypes: ['WT_RT', 'WT_DM'] },
    { reasonKey: 'WR_QUALITY_ISSUE', reasonDescription: 'Poor Initial Quality', sourceArea: 'Receiving/Shelf', relatedTypes: ['WT_QC'] },
    { reasonKey: 'WR_THEFT_INF', reasonDescription: 'Inferred Theft/Shrink', sourceArea: 'Inventory Audit', relatedTypes: ['WT_TH'] },
    { reasonKey: 'WR_MISC', reasonDescription: 'Miscellaneous', sourceArea: 'Various', relatedTypes: ['WT_OT'] },
];

// --- Dimensions Getters ---
export const getMockWasteTypes = () => wasteTypes;
export const getMockWasteReasons = () => wasteReasons;

// --- FactWaste Generator ---
export const generateMockWasteData = (startDate, endDate) => {
    console.log(`Generating waste data from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
    const wasteData = [];
    const locations = getMockStores();
    const products = getMockProducts();
    const categories = getMockCategories(); // Get categories for denormalization
    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
    let wasteEntryCounter = 1;

    const productMap = new Map(products.map(p => [p.productKey, p]));
    const categoryMap = new Map(categories.map(c => [c.categoryKey, c]));

    for (const date of dateInterval) {
        const dateKey = format(date, 'yyyy-MM-dd');
        for (const store of locations) {
            // Simulate variable number of waste events per day per store
            const dailyWasteEvents = getRandomInt(
                store.storeKey === 'S1' ? 10 : 5, // Higher traffic store might have more events
                store.storeKey === 'S1' ? 35 : 25
            );

            for (let i = 0; i < dailyWasteEvents; i++) {
                try {
                    const product = chooseRandom(products);
                    if (!product || !product.unitCost) continue; // Skip if product or cost is invalid

                    // --- Determine Waste Type & Reason (with some plausible links) ---
                    let wasteType;
                    let reason;

                    const productCategory = categoryMap.get(product.categoryKey);
                    const isFresh = ['C1', 'C3', 'C4'].includes(product.categoryKey); // Fresh Produce, Bakery, Meat/Seafood
                    const isDairy = product.categoryKey === 'C2';

                    // Bias towards more common waste types based on category
                    const typeRoll = Math.random();
                    if (isFresh && typeRoll < 0.4) wasteType = chooseRandom(wasteTypes.filter(wt => wt.wasteTypeKey === 'WT_SP' || wt.wasteTypeKey === 'WT_EX'));
                    else if (isDairy && typeRoll < 0.3) wasteType = chooseRandom(wasteTypes.filter(wt => wt.wasteTypeKey === 'WT_EX' || wt.wasteTypeKey === 'WT_SP'));
                    else if (typeRoll < 0.15) wasteType = wasteTypes.find(wt => wt.wasteTypeKey === 'WT_DM'); // Damage is relatively common
                    else if (typeRoll < 0.25 && !isFresh) wasteType = wasteTypes.find(wt => wt.wasteTypeKey === 'WT_UN'); // Unsold more likely for non-fresh
                    else if (product.categoryKey === 'C3' && typeRoll < 0.35) wasteType = wasteTypes.find(wt => wt.wasteTypeKey === 'WT_PS'); // Prep scrap for bakery
                    else wasteType = chooseRandom(wasteTypes.filter(wt => !['WT_TH'].includes(wt.wasteTypeKey))); // Default random (excluding inferred theft)

                    // Choose a reason related to the chosen type
                    const possibleReasons = wasteReasons.filter(r => r.relatedTypes.includes(wasteType.wasteTypeKey));
                    reason = possibleReasons.length > 0 ? chooseRandom(possibleReasons) : chooseRandom(wasteReasons.filter(r => r.reasonKey === 'WR_MISC')); // Fallback to misc


                    // --- Determine Waste Quantity & Unit ---
                    let wasteQuantity;
                    let unitOfMeasure = 'units'; // Default

                    // Assign UoM based on product name characteristics (simple heuristic)
                    if (product.name.toLowerCase().includes('(kg)')) {
                         unitOfMeasure = 'kg';
                         // More realistic waste quantities for kg items
                         wasteQuantity = getRandom(0.1, 2.5); // e.g., 0.1 to 2.5 kg
                    } else if (product.name.toLowerCase().includes('(pack)')) {
                        unitOfMeasure = 'packs';
                        wasteQuantity = getRandomInt(1, 4); // e.g., 1 to 4 packs
                    } else if (product.name.toLowerCase().includes('(1l)') || product.name.toLowerCase().includes('(500g)') || product.name.toLowerCase().includes('(1.5l)')) {
                        unitOfMeasure = 'units'; // Treat these as single units
                        wasteQuantity = getRandomInt(1, 6); // e.g., 1 to 6 units
                    } else {
                        // Generic units
                        unitOfMeasure = 'units';
                         wasteQuantity = getRandomInt(1, 8);
                    }

                     // Adjust quantity based on reason/type (e.g., less quantity for single damage vs. expired stock)
                    if (wasteType.wasteTypeKey === 'WT_DM' && unitOfMeasure !== 'kg') {
                        wasteQuantity = getRandomInt(1, 2); // Usually single item damage
                    } else if (reason.reasonKey === 'WR_EXPIRED_STOCK') {
                         wasteQuantity *= getRandom(1.5, 3.0); // Larger quantities for stock expiration
                    }

                    wasteQuantity = parseFloat(wasteQuantity.toFixed(2)); // Ensure numeric with precision

                    // --- Calculate Waste Value ---
                    const wasteValue = wasteQuantity * product.unitCost;

                    // --- Timestamp ---
                    const timestamp = setSeconds(setMinutes(setHours(startOfDay(date), getRandomInt(6, 20)), getRandomInt(0, 59)), getRandomInt(0, 59));

                    // --- Create Record ---
                    wasteData.push({
                        wasteEntryId: `WST_${String(wasteEntryCounter++).padStart(9, '0')}`,
                        timestamp: timestamp.toISOString(),
                        dateKey: dateKey,
                        hourOfDay: parseInt(format(timestamp, 'H')),
                        dayOfWeek: format(timestamp, 'EEEE'),

                        // Dimension Keys
                        locationKey: store.storeKey,
                        productKey: product.productKey,
                        categoryKey: product.categoryKey, // Include category key
                        wasteTypeKey: wasteType.wasteTypeKey,
                        reasonKey: reason.reasonKey,

                        // Measures
                        wasteQuantity: wasteQuantity,
                        unitOfMeasure: unitOfMeasure,
                        wasteValue: parseFloat(wasteValue.toFixed(2)),

                        // Denormalized Fields (for convenience in dashboard)
                        storeName: store.storeName,
                        cityName: store.city,
                        productName: product.name,
                        unitCost: product.unitCost,
                        categoryName: productCategory?.name || 'Unknown',
                        wasteTypeName: wasteType.name,
                        wasteTypeCategory: wasteType.category,
                        reasonDescription: reason.reasonDescription,
                        reasonSourceArea: reason.sourceArea,
                    });

                } catch (loopError) {
                    console.error("Error in waste generation loop:", loopError);
                }
            } // End waste event loop
        } // End store loop
    } // End date loop

    console.log(`Generated ${wasteData.length} mock waste records.`);
     // Filter out any potential records with null/NaN values before returning
     const cleanData = wasteData.filter(d =>
         d.wasteQuantity != null && isFinite(d.wasteQuantity) &&
         d.wasteValue != null && isFinite(d.wasteValue) &&
         d.unitCost != null && isFinite(d.unitCost)
     );
      if (cleanData.length !== wasteData.length) {
          console.warn(`Filtered out ${wasteData.length - cleanData.length} waste records with invalid numeric values.`);
      }
    return cleanData.sort((a, b) => parseISO(a.timestamp) - parseISO(b.timestamp)); // Sort chronologically
};