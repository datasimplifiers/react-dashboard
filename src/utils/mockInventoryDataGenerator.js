// src/utils/mockInventoryDataGenerator.js
import { subDays, addDays, format, differenceInDays, startOfDay, endOfDay, eachDayOfInterval, parseISO, isValid } from 'date-fns';
// We only need to import the *base* data definitions if they were in a separate file.
// Since products/stores/categories are defined in mockDataGenerator.js,
// let's just define them here or import that whole file's data getters.
// Easiest: Import the functions that return the base arrays.
import { getMockProducts, getMockStores, getMockCategories, generateMockSalesData  } from './mockDataGenerator';

// --- Helper Functions ---
const getRandom = (min, max) => Math.random() * (max - min) + min;
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const chooseRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// --- Generate Mock Inventory Data ---
export const generateMockInventoryData = (currentDate) => {
    const inventoryData = [];
    // *** Get the dimension data by calling the functions ***
    const products = getMockProducts();
    const stores = getMockStores();
    const categories = getMockCategories(); // Get categories data

    if (!products || !stores || !categories) {
        console.error("Failed to get base dimension data (products, stores, or categories).");
        return [];
    }

    // Combine stores and potential warehouses into locations
    const locations = [
        ...stores.map(s => ({ locationKey: `LOC_${s.storeKey}`, locationId: s.storeId, locationName: s.storeName, locationType: 'Store', city: s.city })),
        // Hardcoded mock warehouses
        { locationKey: 'LOC_WH1', locationId: 'WH_CAI_01', locationName: 'Cairo Distribution Center', locationType: 'Warehouse', city: 'Cairo' },
        { locationKey: 'LOC_WH2', locationId: 'WH_ALX_01', locationName: 'Alexandria Hub', locationType: 'Warehouse', city: 'Alexandria' },
    ];

    // Ensure currentDate is set to the start of the day
    const today = startOfDay(currentDate);

    products.forEach(product => {
        // Simulate product being in multiple locations
        const numLocations = getRandomInt(1, Math.min(5, locations.length));
        const productLocations = [];
        while (productLocations.length < numLocations) {
            const loc = chooseRandom(locations);
            if (!productLocations.some(pl => pl.locationKey === loc.locationKey)) {
                productLocations.push(loc);
            }
        }

        productLocations.forEach(location => {
            const numBatches = getRandomInt(1, 4);
            for (let i = 0; i < numBatches; i++) {
                try {
                    // *** Find category details using the fetched categories array ***
                    const categoryData = categories.find(c => c.categoryKey === product.categoryKey);
                    const categoryName = categoryData ? categoryData.name : 'Unknown';

                    // Shelf life calculation based on categoryName
                    const shelfLife = categoryName === 'Fresh Produce' || categoryName === 'Meat & Seafood' ? getRandomInt(5, 20) :
                                    categoryName === 'Dairy & Eggs' || categoryName === 'Bakery' ? getRandomInt(15, 45) :
                                    getRandomInt(60, 365);

                    // Generate production date... (rest of the logic is the same)
                    let daysAgoProduced;
                    const expiryRoll = Math.random();
                    if (expiryRoll < 0.1) { daysAgoProduced = getRandomInt(shelfLife + 1, shelfLife + 30); }
                    else if (expiryRoll < 0.3) { daysAgoProduced = getRandomInt(Math.max(0, shelfLife - 14), shelfLife -1); }
                    else if (expiryRoll < 0.5) { daysAgoProduced = getRandomInt(Math.max(0, shelfLife - 30), Math.max(0, shelfLife - 15)); }
                    else { daysAgoProduced = getRandomInt(1, Math.max(1, shelfLife - 31)); }

                    const productionDate = subDays(today, daysAgoProduced);
                    const expirationDate = addDays(productionDate, shelfLife);
                    const daysToExpiration = differenceInDays(expirationDate, today);
                    const onHandQuantity = getRandomInt(5, 200);
                    const unitCost = product.unitCost || 1;
                    const onHandValue = parseFloat((onHandQuantity * unitCost).toFixed(2));
                    const batchNumber = `B${getRandomInt(1000, 9999)}-${format(productionDate, 'yyMM')}`;

                    inventoryData.push({
                        inventoryKey: `INV-${product.productKey}-${location.locationKey}-${batchNumber}`,
                        productKey: product.productKey, locationKey: location.locationKey, batchNumber,
                        productionDate: productionDate.toISOString(), expirationDate: expirationDate.toISOString(),
                        daysToExpiration, onHandQuantity, unitCost, onHandValue,
                        // Denormalized fields
                        productName: product.name, sku: product.productKey, categoryName: categoryName, // Use looked-up name
                        locationName: location.locationName, locationType: location.locationType, city: location.city,
                    });
                } catch(innerError) {
                    console.error("Error processing batch:", product.productKey, location.locationKey, innerError);
                }
            }
        });
    });

    console.log(`Generated ${inventoryData.length} mock inventory records.`);
    return inventoryData;
};

// --- Generate Mock Inventory Snapshots ---
// Generates *daily* snapshots for a given period
export const generateMockInventorySnapshots = (startDate, endDate, initialStockLevels = {}) => {
    console.log(`Generating inventory snapshots from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
    const snapshots = [];
    const products = getMockProducts();
    const stores = getMockStores();
    const locations = stores.map(s => ({ locationKey: `LOC_${s.storeKey}`, locationId: s.storeId, locationName: s.storeName, locationType: 'Store', city: s.city })); // Focus on stores for now
    const categories = getMockCategories();

    // Get simulated sales data for the period to deplete stock realistically
    // Fetch slightly before start date to have sales for the first day
    const salesStartDate = subDays(startDate, 1);
    const salesDataForPeriod = generateMockSalesData(salesStartDate, endDate);

    // Aggregate daily sales per product/location
    const dailySalesMap = salesDataForPeriod.reduce((map, sale) => {
        const key = `${sale.dateKey}-${sale.productKey}-LOC_${sale.storeKey}`;
        map[key] = (map[key] || 0) + sale.quantitySold;
        return map;
    }, {});

    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
    let currentStock = { ...initialStockLevels }; // Use initial stock or start empty

    // Initialize stock if not provided
    if (Object.keys(currentStock).length === 0) {
         products.forEach(p => {
            locations.forEach(l => {
                 const key = `${p.productKey}-${l.locationKey}`;
                 // Simulate initial stock level based on category/randomness
                 let initialQty = 50;
                 if (['C1', 'C2', 'C3', 'C4'].includes(p.categoryKey)) initialQty = getRandomInt(20, 100); // Fresher items, lower stock?
                 else initialQty = getRandomInt(100, 500); // Pantry/Beverages higher stock
                 currentStock[key] = initialQty * getRandom(0.8, 1.2); // Add variance

                 // Generate initial batch info (can be simplified)
                 const shelfLife = 90; // Simplified initial shelf life
                 const prodDate = subDays(startDate, getRandomInt(15, 60));
                 currentStock[`${key}-exp`] = format(addDays(prodDate, shelfLife), 'yyyy-MM-dd');
                 currentStock[`${key}-cost`] = p.unitCost || 1;
            });
        });
    }

    dateInterval.forEach(date => {
        const dateKey = format(date, 'yyyy-MM-dd');

        products.forEach(p => {
            locations.forEach(l => {
                const stockKey = `${p.productKey}-${l.locationKey}`;
                const salesKey = `${dateKey}-${stockKey}`;
                const todaysSales = dailySalesMap[salesKey] || 0;

                let onHand = Math.max(0, (currentStock[stockKey] || 0) - todaysSales); // Deplete stock

                 // Simulate occasional stock receipts (e.g., 10% chance per day per item)
                 if (Math.random() < 0.1) {
                      onHand += getRandomInt(50, 200);
                      // Update expiration date on receipt? For simplicity, keep initial one
                 }

                 currentStock[stockKey] = onHand; // Update stock for next day

                 // Get other details (simplified batch/expiry)
                 const unitCost = currentStock[`${stockKey}-cost`] || p.unitCost || 1;
                 const expirationDateStr = currentStock[`${stockKey}-exp`] || format(addDays(date, 90), 'yyyy-MM-dd');
                 let expirationDate = parseISO(expirationDateStr);
                 if (!isValid(expirationDate)) expirationDate = addDays(date, 90); // Fallback
                 const daysToExpiration = differenceInDays(expirationDate, startOfDay(date));


                 snapshots.push({
                     snapshotDate: dateKey,
                     productKey: p.productKey,
                     locationKey: l.locationKey,
                     onHandQuantity: Math.round(onHand),
                     unitCost: unitCost,
                     onHandValue: parseFloat((onHand * unitCost).toFixed(2)),
                     expirationDate: format(expirationDate, 'yyyy-MM-dd'),
                     daysToExpiration: daysToExpiration,
                     // Denormalized
                     productName: p.name,
                     categoryKey: p.categoryKey, // For filtering
                     categoryName: categories.find(c => c.categoryKey === p.categoryKey)?.name || 'Unknown',
                     locationName: l.locationName,
                     locationType: l.locationType,
                 });
            });
        });
    });

    console.log(`Generated ${snapshots.length} inventory snapshot records.`);
    return snapshots;
};

// No need to re-export getMockCategories here anymore