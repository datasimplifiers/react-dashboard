// src/utils/mockFinancialDataGenerator.js
import {
    subDays, format, eachDayOfInterval, parseISO, startOfDay, getMonth, getYear
} from 'date-fns';
import { getMockStores } from './mockDataGenerator'; // Reuse stores

// --- Helper Functions ---
const getRandom = (min, max) => Math.random() * (max - min) + min;
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const generateId = (prefix) => `${prefix}_${Math.random().toString(36).substring(2, 11)}`;

// --- Financial Dimensions ---

// DimAccount (Simplified Chart of Accounts Hierarchy)
const accounts = [
    // Level 1
    { accountKey: 'AC_REV', accountName: 'Total Revenue', accountType: 'Revenue', parentAccountKey: null, rollupSign: 1 },
    { accountKey: 'AC_COS', accountName: 'Cost of Sales (COGS)', accountType: 'Expense', parentAccountKey: null, rollupSign: -1 },
    { accountKey: 'AC_GP', accountName: 'Gross Profit', accountType: 'Profit', parentAccountKey: null, rollupSign: 1, isCalculated: true }, // Calculated
    { accountKey: 'AC_OPEX', accountName: 'Operating Expenses', accountType: 'Expense', parentAccountKey: null, rollupSign: -1 },
    { accountKey: 'AC_NP', accountName: 'Net Profit', accountType: 'Profit', parentAccountKey: null, rollupSign: 1, isCalculated: true }, // Calculated

    // Level 2 - OPEX Breakdown
    { accountKey: 'AC_SAL', accountName: 'Salaries & Wages', accountType: 'Expense', parentAccountKey: 'AC_OPEX', rollupSign: -1 },
    { accountKey: 'AC_RENT', accountName: 'Rent & Lease', accountType: 'Expense', parentAccountKey: 'AC_OPEX', rollupSign: -1 },
    { accountKey: 'AC_UTIL', accountName: 'Utilities', accountType: 'Expense', parentAccountKey: 'AC_OPEX', rollupSign: -1 },
    { accountKey: 'AC_MKT', accountName: 'Marketing & Advertising', accountType: 'Expense', parentAccountKey: 'AC_OPEX', rollupSign: -1 },
    { accountKey: 'AC_SUP', accountName: 'Supplies & Maintenance', accountType: 'Expense', parentAccountKey: 'AC_OPEX', rollupSign: -1 },
    { accountKey: 'AC_OTH', accountName: 'Other Operating Expenses', accountType: 'Expense', parentAccountKey: 'AC_OPEX', rollupSign: -1 },
];
const accountMap = new Map(accounts.map(a => [a.accountKey, a]));

// DimScenario
const scenarios = [
    { scenarioKey: 'SC_ACT', scenarioName: 'Actual' },
    { scenarioKey: 'SC_BUD', scenarioName: 'Budget' },
    // { scenarioKey: 'SC_FOR', scenarioName: 'Forecast' }, // Could add forecast later
];

// --- Getters for Dimensions ---
export const getMockAccounts = () => accounts;
export const getMockScenarios = () => scenarios;

// --- FactFinancialSummary Generator ---
export const generateMockFinancialSummary = (startDate, endDate) => {
    console.log(`Generating financial summary data from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
    const summaryData = [];
    const locations = getMockStores();
    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
    let entryCounter = 1;

    // Base daily values per store (adjust these based on perceived store size/traffic)
    const storeBaseFactors = {
        'S1': { revenue: 18000, cogsRate: 0.65, salaries: 1500, rent: 800, utilBase: 300, marketBase: 200, supplyBase: 150, otherBase: 100 },
        'S2': { revenue: 14000, cogsRate: 0.68, salaries: 1200, rent: 650, utilBase: 250, marketBase: 150, supplyBase: 120, otherBase: 80 },
        'S3': { revenue: 11000, cogsRate: 0.70, salaries: 1000, rent: 500, utilBase: 200, marketBase: 100, supplyBase: 100, otherBase: 60 },
    };

    for (const date of dateInterval) {
        const dateKey = format(date, 'yyyy-MM-dd');
        const month = getMonth(date);
        const year = getYear(date);
        const dayOfMonth = parseInt(format(date, 'd'));

        for (const store of locations) {
            const factors = storeBaseFactors[store.storeKey] || storeBaseFactors['S2']; // Default if store not found

            for (const scenario of scenarios) {
                let dailyRevenue = 0;
                let dailyCogs = 0;
                const dailyOpex = {};

                if (scenario.scenarioKey === 'SC_ACT') {
                    // --- Generate Actuals ---
                    // Revenue: Base + daily noise + slight weekend bump
                    dailyRevenue = factors.revenue * getRandom(0.85, 1.15) * (format(date, 'EEEE') === 'Friday' || format(date, 'EEEE') === 'Saturday' ? 1.1 : 1.0);
                    // COGS: Based on revenue and COGS rate + noise
                    dailyCogs = dailyRevenue * factors.cogsRate * getRandom(0.97, 1.03);
                    // OPEX: Base + noise, some seasonality for utilities
                    dailyOpex['AC_SAL'] = factors.salaries * getRandom(0.98, 1.02);
                    dailyOpex['AC_RENT'] = factors.rent; // Rent is fixed
                    dailyOpex['AC_UTIL'] = factors.utilBase * getRandom(0.8, 1.2) * (month >= 5 && month <= 8 ? 1.3 : 1.0); // Higher utils in summer
                    dailyOpex['AC_MKT'] = factors.marketBase * (Math.random() < 0.1 ? getRandom(1.5, 5.0) : getRandom(0.5, 1.0)); // Occasional marketing spikes
                    dailyOpex['AC_SUP'] = factors.supplyBase * getRandom(0.9, 1.1);
                    dailyOpex['AC_OTH'] = factors.otherBase * getRandom(0.7, 1.3);

                } else if (scenario.scenarioKey === 'SC_BUD') {
                    // --- Generate Budget --- (Simpler, smoother)
                    // Budget often set monthly, allocate daily for simplicity here
                    const daysInMonth = parseInt(format(new Date(year, month + 1, 0), 'd'));
                    const budgetRevMonth = factors.revenue * daysInMonth * 1.05; // e.g., budget 5% higher than base avg
                    dailyRevenue = budgetRevMonth / daysInMonth;
                    // Budget COGS based on budget revenue and target margin (slightly better than actual avg)
                    dailyCogs = dailyRevenue * (factors.cogsRate * 0.98);
                    // Budget OPEX often fixed or slightly increasing
                    dailyOpex['AC_SAL'] = factors.salaries * 1.01;
                    dailyOpex['AC_RENT'] = factors.rent;
                    dailyOpex['AC_UTIL'] = factors.utilBase * 1.1; // Budget slightly higher utility cost
                    dailyOpex['AC_MKT'] = factors.marketBase; // Flat marketing budget per day
                    dailyOpex['AC_SUP'] = factors.supplyBase;
                    dailyOpex['AC_OTH'] = factors.otherBase;
                }

                // --- Create Records for each account ---
                const addRecord = (accKey, amount) => {
                    if (amount == null || !isFinite(amount)) {
                       // console.warn(`Skipping record for ${accKey} on ${dateKey} due to invalid amount: ${amount}`);
                       return; // Skip if amount is invalid
                    }
                    const account = accountMap.get(accKey);
                    if (!account) return; // Should not happen if keys are correct
                    summaryData.push({
                        summaryId: `FS_${String(entryCounter++).padStart(10, '0')}`,
                        dateKey: dateKey,
                        locationKey: store.storeKey,
                        accountKey: accKey,
                        scenarioKey: scenario.scenarioKey,
                        amount: parseFloat(amount.toFixed(2)),
                        // Denormalized
                        storeName: store.storeName,
                        cityName: store.city,
                        accountName: account.accountName,
                        accountType: account.accountType,
                        parentAccountKey: account.parentAccountKey,
                        scenarioName: scenario.scenarioName,
                        rollupSign: account.rollupSign, // Include sign for easier aggregation
                    });
                };

                addRecord('AC_REV', dailyRevenue);
                addRecord('AC_COS', dailyCogs); // Store COGS as positive, rollupSign handles P&L view

                let totalOpex = 0;
                Object.entries(dailyOpex).forEach(([key, value]) => {
                     addRecord(key, value); // Store expenses as positive
                     totalOpex += value;
                 });
                 addRecord('AC_OPEX', totalOpex); // Add rolled-up OPEX total


                // NOTE: Gross Profit and Net Profit rows are NOT added here.
                // They will be calculated dynamically in the dashboard based on the raw revenue/expense records.

            } // end scenario loop
        } // end store loop
    } // end date loop

    console.log(`Generated ${summaryData.length} mock financial summary records.`);
    // Filter out invalid amounts just in case
     const cleanData = summaryData.filter(d => d.amount != null && isFinite(d.amount));
     if (cleanData.length !== summaryData.length) {
         console.warn(`Filtered out ${summaryData.length - cleanData.length} summary records with invalid numeric values.`);
     }
    return cleanData.sort((a, b) => parseISO(a.dateKey).getTime() - parseISO(b.dateKey).getTime() || a.locationKey.localeCompare(b.locationKey) || a.accountKey.localeCompare(b.accountKey));
};