// src/utils/mockAnalysisGenerator.js
import { getMockProducts } from './mockDataGenerator'; // Need products for rule names

// --- Helper ---
const chooseRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const formatCurrency = (value) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return `EGP ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; };
const formatNumber = (value, digits = 0) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return value.toLocaleString('en-US', { maximumFractionDigits: digits }); };
const formatPercent = (value, digits = 1) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return `${value.toFixed(digits)}%`; };


// --- Simulate Market Basket Analysis (Association Rules) ---
// In reality, this would come from an Apriori or similar algorithm run on transaction data.
// We'll simulate common pairings.
export const generateMockAssociationRules = (products) => {
    console.log("Generating mock association rules...");
    const rules = [];
    const productMap = new Map(products.map(p => [p.productKey, p]));

    // Define some plausible rules (Antecedent => Consequent)
    // Rules format: { ruleId: string, antecedent: [productKey], consequent: [productKey], support: %, confidence: %, lift: N }
    const plausibleRules = [
        { ruleId: 'MBA001', antecedent: ['P501'], consequent: ['P503'], support: 0.08, confidence: 0.65, lift: 3.1 }, // Pasta (500g) => Pasta Sauce
        { ruleId: 'MBA002', antecedent: ['P602'], consequent: ['P603'], support: 0.12, confidence: 0.72, lift: 2.5 }, // Cola Can => Chips Large Bag
        { ruleId: 'MBA003', antecedent: ['P301'], consequent: ['P203'], support: 0.06, confidence: 0.41, lift: 1.8 }, // White Bread Loaf => Cheese Block
        { ruleId: 'MBA004', antecedent: ['P201'], consequent: ['P301'], support: 0.07, confidence: 0.35, lift: 1.5 }, // Milk (1L) => White Bread Loaf
        { ruleId: 'MBA005', antecedent: ['P101'], consequent: ['P104'], support: 0.03, confidence: 0.28, lift: 1.3 }, // Tomatoes (kg) => Cucumber (kg) - Assuming P104 exists or adjust
        { ruleId: 'MBA006', antecedent: ['P401'], consequent: ['P502'], support: 0.09, confidence: 0.55, lift: 2.1 }, // Chicken Breast (kg) => Rice (1kg)
        { ruleId: 'MBA007', antecedent: ['P302'], consequent: ['P201'], support: 0.04, confidence: 0.48, lift: 1.9 }, // Croissants (Pack) => Milk (1L)
        { ruleId: 'MBA008', antecedent: ['P202'], consequent: ['P102'], support: 0.05, confidence: 0.40, lift: 1.6 }, // Yogurt (Pack) => Bananas (kg)
    ];

    plausibleRules.forEach(rule => {
        const antecedentNames = rule.antecedent.map(key => productMap.get(key)?.name || key).filter(Boolean);
        const consequentNames = rule.consequent.map(key => productMap.get(key)?.name || key).filter(Boolean);

        // Only add rule if all product names were found
        if (antecedentNames.length === rule.antecedent.length && consequentNames.length === rule.consequent.length) {
            rules.push({
                ruleId: rule.ruleId,
                antecedentKeys: rule.antecedent,
                consequentKeys: rule.consequent,
                antecedentNames: antecedentNames.join(', '),
                consequentNames: consequentNames.join(', '),
                support: rule.support,
                confidence: rule.confidence,
                lift: rule.lift,
            });
        } else {
            console.warn(`Skipping rule ${rule.ruleId} due to missing product names.`);
        }
    });

    console.log(`Generated ${rules.length} mock association rules.`);
    return rules.sort((a, b) => b.lift - a.lift); // Sort by lift initially
};


// --- Simulate Customer Segmentation Results ---
// This would typically involve RFM analysis or clustering based on purchase history.
// We'll aggregate some metrics based on the predefined customer segments.
export const generateMockCustomerSegmentMetrics = (customers, salesData) => {
    console.log("Generating mock customer segment metrics...");
    const segmentMetrics = {};

    // Ensure salesData is valid
    if (!salesData || !Array.isArray(salesData)) {
        console.error("Invalid salesData provided to generateMockCustomerSegmentMetrics");
        return [];
    }

    // Initialize metrics object using the customer list
    customers.forEach(c => {
        if (c && c.segment) { // Check if customer and segment exist
             if (!segmentMetrics[c.segment]) {
                segmentMetrics[c.segment] = {
                    segmentName: c.segment,
                    customerCount: 0,
                    totalSpent: 0,
                    totalVisits: 0, // Approximated by unique transaction days per customer within segment
                    avgBasketSize: 0,
                    topCategories: {}, // { categoryName: count } -> used to calculate topCategoriesList
                    customerKeys: new Set(), // Store customer keys for visit counting
                };
            }
            // Increment count here - ensures all segments from customer list are included
            segmentMetrics[c.segment].customerCount++;
            segmentMetrics[c.segment].customerKeys.add(c.customerKey);
        }
    });

    // Aggregate sales data per customer first
    const salesByCustomer = {}; // { customerKey: { spent: N, visits: Set<date>, categories: {} } }
    salesData.forEach(sale => {
        if (sale && sale.customerKey && typeof sale.netSalesAmount === 'number' && isFinite(sale.netSalesAmount)) { // Check validity
            if (!salesByCustomer[sale.customerKey]) {
                salesByCustomer[sale.customerKey] = { spent: 0, visits: new Set(), categories: {} };
            }
            salesByCustomer[sale.customerKey].spent += sale.netSalesAmount;
            if (sale.dateKey) salesByCustomer[sale.customerKey].visits.add(sale.dateKey);
            const cat = sale.categoryName || 'Unknown';
            salesByCustomer[sale.customerKey].categories[cat] = (salesByCustomer[sale.customerKey].categories[cat] || 0) + 1; // Count item occurrences per category
        }
    });

    // Aggregate customer data into segments
    Object.values(segmentMetrics).forEach(segment => {
        let segmentTotalVisits = 0;
        segment.customerKeys.forEach(customerKey => {
            const custData = salesByCustomer[customerKey];
            if (custData) {
                segment.totalSpent += custData.spent;
                segmentTotalVisits += custData.visits.size; // Sum unique visit days per customer
                // Aggregate top categories across customers in the segment
                Object.entries(custData.categories).forEach(([catName, count]) => {
                    segment.topCategories[catName] = (segment.topCategories[catName] || 0) + count;
                });
            }
        });
        segment.totalVisits = segmentTotalVisits; // Assign summed visits
        delete segment.customerKeys; // Remove temporary set
    });


    // Calculate averages and finalize top categories
    Object.values(segmentMetrics).forEach(segment => {
        if (segment.totalVisits > 0) {
            segment.avgBasketSize = segment.totalSpent / segment.totalVisits;
        }
        // Get top 3 categories
        // segment.topCategoriesList = Object.entries(segment.topCategories)
        //                             .sort(([, countA], [, countB]) => countB - countA)
        //                             .slice(0, 3)
        //                             .map(([name]) => name);
        // delete segment.topCategories; // Remove intermediate object
    });

    console.log("Generated metrics for segments:", Object.keys(segmentMetrics).length);
    return Object.values(segmentMetrics).sort((a, b) => b.totalSpent - a.totalSpent); // Sort by total spending
};