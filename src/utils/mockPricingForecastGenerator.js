// src/utils/mockPricingForecastGenerator.js
import { addDays, eachDayOfInterval, format, subDays } from 'date-fns';
import { getMockProducts, getMockStores, getMockCompetitors } from './mockDataGenerator'; // Import base dimension getters

// --- Helper Functions ---
const getRandom = (min, max) => Math.random() * (max - min) + min;
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- Generate Mock Pricing Data ---
export const generateMockPricingData = (startDate, endDate) => {
    console.log(`Generating pricing data from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
    const pricingData = [];
    const products = getMockProducts();
    const stores = getMockStores();
    const competitors = getMockCompetitors();
    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });

    // Store last price to simulate gradual changes
    const lastPrices = {}; // key: `${productKey}-${storeKey}-${competitorKey || 'SELF'}`

    products.forEach(product => {
        stores.forEach(store => {
            dateInterval.forEach(date => {
                const dateKey = format(date, 'yyyy-MM-dd');

                // Metro's Price (Self)
                const selfKey = `${product.productKey}-${store.storeKey}-SELF`;
                let lastMetroPrice = lastPrices[selfKey] || product.unitPrice;
                // Simulate occasional price adjustments (+/- 5% change, 10% of the time)
                let metroPrice = (Math.random() < 0.1)
                    ? lastMetroPrice * getRandom(0.95, 1.05)
                    : lastMetroPrice + getRandom(-0.2, 0.2); // Minor daily fluctuation
                metroPrice = Math.max(product.unitCost + 0.5, metroPrice); // Ensure above cost
                metroPrice = parseFloat(metroPrice.toFixed(2));
                lastPrices[selfKey] = metroPrice;

                pricingData.push({
                    dateKey,
                    productKey: product.productKey,
                    storeKey: store.storeKey, // Metro's store
                    competitorKey: null, // Or use a specific key like 'METRO'
                    competitorName: 'Metro Market', // Self
                    price: metroPrice,
                    productName: product.name, // Denormalize
                    storeName: store.storeName, // Denormalize
                });

                // Competitor Prices
                competitors.forEach(competitor => {
                     const compKey = `${product.productKey}-${store.storeKey}-${competitor.competitorKey}`; // Key includes Metro store for context if needed, though pricing is competitor's
                     let lastCompPrice = lastPrices[compKey] || (metroPrice * competitor.strategyFactor);
                     // Simulate competitor adjustments (similar logic to Metro but based on their strategy)
                     let compPrice = (Math.random() < 0.15) // Slightly more frequent adjustments?
                        ? lastCompPrice * getRandom(0.93, 1.07)
                        : lastCompPrice + getRandom(-0.3, 0.3);
                     // Apply general strategy factor again with slight variation
                     compPrice = compPrice * competitor.strategyFactor * getRandom(0.98, 1.02);
                     compPrice = Math.max(product.unitCost * 0.9, compPrice); // Competitor might undercut cost slightly sometimes?
                     compPrice = parseFloat(compPrice.toFixed(2));
                     lastPrices[compKey] = compPrice;

                     pricingData.push({
                        dateKey,
                        productKey: product.productKey,
                        storeKey: store.storeKey, // Metro store context (could be null if only competitor focused)
                        competitorKey: competitor.competitorKey,
                        competitorName: competitor.competitorName,
                        price: compPrice,
                        productName: product.name, // Denormalize
                        storeName: store.storeName, // Denormalize
                     });
                });
            });
        });
    });

    console.log(`Generated ${pricingData.length} pricing records.`);
    return pricingData;
};


// --- Generate Mock Forecast Data ---
// Note: This is a VERY simplistic forecast based on random average sales
export const generateMockForecastData = (startDate, endDate, historicalSalesData) => {
    console.log(`Generating forecast data from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
    const forecastData = [];
    const products = getMockProducts();
    const stores = getMockStores();
    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });

    // Calculate simple average daily sales per product/store from historical data
    const avgSales = {}; // key: `${productKey}-${storeKey}`
    if (historicalSalesData && historicalSalesData.length > 0) {
        const salesCounts = {}; // { key: { totalQty: N, numDays: M } }
        const historicalDates = new Set(historicalSalesData.map(s => s.dateKey));

        historicalSalesData.forEach(sale => {
            const key = `${sale.productKey}-${sale.storeKey}`;
            if (!salesCounts[key]) {
                salesCounts[key] = { totalQty: 0, numDays: historicalDates.size || 1 }; // Use size of date range
            }
            salesCounts[key].totalQty += sale.quantitySold;
        });

        for (const key in salesCounts) {
            avgSales[key] = salesCounts[key].totalQty / (salesCounts[key].numDays || 1);
        }
        // console.log("Calculated Avg Sales:", avgSales);
    }


    products.forEach(product => {
        stores.forEach(store => {
            const baseAvg = avgSales[`${product.productKey}-${store.storeKey}`] || getRandom(1, 10); // Default random avg if no history

            dateInterval.forEach(date => {
                const forecastDateKey = format(date, 'yyyy-MM-dd');

                // Simulate some basic seasonality/trend/noise
                const dayOfWeekFactor = [0.8, 1.0, 1.0, 1.1, 1.2, 1.3, 1.1][date.getDay()]; // Weekend boost
                const noise = getRandom(0.85, 1.15);
                let forecastedQuantity = baseAvg * dayOfWeekFactor * noise;
                forecastedQuantity = Math.max(0, Math.round(forecastedQuantity)); // Ensure non-negative integer

                forecastData.push({
                    forecastDateKey,
                    productKey: product.productKey,
                    locationKey: store.storeKey, // Assuming forecast is at store level
                    forecastedQuantity,
                    // Denormalize
                    productName: product.name,
                    storeName: store.storeName,
                });
            });
        });
    });
    console.log(`Generated ${forecastData.length} forecast records.`);
    return forecastData;
};