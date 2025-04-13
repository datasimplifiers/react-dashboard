// src/utils/mockCustomerBehaviorGenerator.js
import { addSeconds, eachDayOfInterval, format, setHours, setMinutes, setSeconds, startOfDay } from 'date-fns';
import { getMockStores, getMockStoreZones } from './mockDataGenerator'; // Import needed dimensions

// --- Helper Functions ---
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const chooseRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generateId = (prefix) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

// --- Generate Mock Customer Behavior Data ---
export const generateMockCustomerBehaviorData = (startDate, endDate) => {
    console.log(`Generating customer behavior data from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
    const behaviorData = [];
    const stores = getMockStores();
    const zones = getMockStoreZones();
    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
    let eventCounter = 0;

    // Define some plausible paths (sequences of zoneKeys)
    const commonPaths = [
        ['Z01', 'Z02', 'Z03', 'Z06', 'Z09'], // Entrance -> Produce -> Dairy -> Pantry1 -> Checkout
        ['Z01', 'Z08', 'Z07', 'Z09'],       // Entrance -> Beverages -> Pantry2 (Snacks) -> Checkout
        ['Z01', 'Z04', 'Z03', 'Z09'],       // Entrance -> Bakery -> Dairy -> Checkout
        ['Z01', 'Z10', 'Z02', 'Z05', 'Z09'], // Entrance -> Promo -> Produce -> Meat -> Checkout
        ['Z01', 'Z02', 'Z09'],               // Quick trip: Produce -> Checkout
        ['Z01', 'Z07', 'Z09'],               // Quick trip: Snacks -> Checkout
    ];

    dateInterval.forEach(date => {
        const dateKey = format(date, 'yyyy-MM-dd');
        stores.forEach(store => {
            const dailySessions = getRandomInt(150, 400); // Simulate 150-400 customer sessions per store per day

            for (let i = 0; i < dailySessions; i++) {
                const sessionId = generateId(`SESS_${dateKey}_${store.storeKey}`);
                const path = chooseRandom(commonPaths); // Choose a base path
                let currentTime = setSeconds(setMinutes(setHours(date, getRandomInt(8, 21)), getRandomInt(0, 59)), getRandomInt(0, 59)); // Random start time within store hours
                let sequence = 0;

                // Add slight variations to path (e.g., skip a zone, add promo zone)
                const finalPath = [];
                path.forEach(zoneKey => {
                    if (Math.random() > 0.15 || zoneKey === 'Z01' || zoneKey === 'Z09') { // 85% chance to keep zone (always keep entry/exit)
                       finalPath.push(zoneKey);
                       if(zoneKey !== 'Z01' && zoneKey !== 'Z09' && Math.random() < 0.1) {
                           finalPath.push('Z10'); // 10% chance to visit promo endcap after another zone
                       }
                    }
                });
                // Ensure path starts with Z01 and ends with Z09 if possible
                if (finalPath[0] !== 'Z01') finalPath.unshift('Z01');
                if (finalPath[finalPath.length - 1] !== 'Z09') finalPath.push('Z09');
                // Remove consecutive duplicates that might arise from adding Z10
                const uniquePath = finalPath.filter((zone, index, arr) => index === 0 || zone !== arr[index - 1]);

                // Generate events for the path
                for (let j = 0; j < uniquePath.length; j++) {
                    const zoneKey = uniquePath[j];
                    const zoneInfo = zones.find(z => z.zoneKey === zoneKey);
                    if (!zoneInfo) continue; // Skip if zone somehow invalid

                    const entryTime = currentTime;
                    let dwellTimeSeconds = 0;

                    // Simulate dwell time based on zone type and randomness
                    if (zoneInfo.zoneType === 'Aisle') dwellTimeSeconds = getRandomInt(30, 180);
                    else if (zoneInfo.zoneType === 'Service') dwellTimeSeconds = getRandomInt(60, 300);
                    else if (zoneInfo.zoneType === 'Display') dwellTimeSeconds = getRandomInt(15, 90);
                    else if (zoneInfo.zoneType === 'Checkout') dwellTimeSeconds = getRandomInt(45, 240);
                    else dwellTimeSeconds = getRandomInt(5, 30); // Transition zones

                    // Add slight random variation to dwell
                    dwellTimeSeconds = Math.max(5, dwellTimeSeconds + getRandomInt(-dwellTimeSeconds * 0.2, dwellTimeSeconds * 0.2));

                    const exitTime = addSeconds(entryTime, dwellTimeSeconds);

                    behaviorData.push({
                        eventId: eventCounter++,
                        customerSessionId: sessionId,
                        timestamp: entryTime.toISOString(), // Time customer ENTERED the zone
                        dateKey: format(entryTime, 'yyyy-MM-dd'),
                        hourOfDay: parseInt(format(entryTime, 'H')),
                        storeKey: store.storeKey,
                        zoneKey: zoneKey,
                        eventType: 'Dwell', // Representing the time spent in the zone
                        dwellTimeSeconds: Math.round(dwellTimeSeconds),
                        pathSequence: sequence++,
                        // Denormalized
                        zoneName: zoneInfo.zoneName,
                        zoneType: zoneInfo.zoneType,
                        storeName: store.storeName,
                    });

                    // Update current time for the next zone entry
                    currentTime = exitTime;
                }
            }
        });
    });

    console.log(`Generated ${behaviorData.length} customer behavior events.`);
    return behaviorData;
};