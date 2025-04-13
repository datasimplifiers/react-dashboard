// src/utils/mockAccessControlLogGenerator.js
import { subDays, addSeconds, format, setHours, setMinutes, setSeconds, eachDayOfInterval, parseISO, isValid } from 'date-fns';
import { getMockStores, getMockStoreZones, getMockCustomers } from './mockDataGenerator'; // Customers might attempt access

// --- Helper Functions ---
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const chooseRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generateId = (prefix) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

// --- Generate Mock Access Control Logs ---
export const generateMockAccessControlLogs = (startDate, endDate) => {
    console.log(`Generating access control logs from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
    const logs = [];
    const stores = getMockStores();
    const zones = getMockStoreZones();
    const restrictedZones = zones.filter(z => z.restricted);
    const publicZones = zones.filter(z => !z.restricted); // For simulating accidental attempts
    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
    let logCounter = 1;
    // Simulate some anonymized employee/visitor IDs
    const personIds = Array.from({ length: 50 }, (_, i) => `EMP_${100 + i}`).concat(['VISITOR_UNKNOWN']);

    if (restrictedZones.length === 0) {
        console.warn("No restricted zones defined for access control logs.");
        return [];
    }

    dateInterval.forEach(date => {
        stores.forEach(store => {
            // Simulate fewer access attempts compared to alerts or sales
            const dailyAttempts = getRandomInt(2, 15);

            for (let i = 0; i < dailyAttempts; i++) {
                try {
                    const timestamp = setSeconds(setMinutes(setHours(date, getRandomInt(8, 20)), getRandomInt(0, 59)), getRandomInt(0, 59));
                    const personId = chooseRandom(personIds);
                    let targetZone;
                    let accessGranted = false;
                    let denialReason = null;

                    // Simulate attempts on restricted zones mostly, occasionally public (error?)
                    if (Math.random() < 0.85) { // 85% attempt restricted
                        targetZone = chooseRandom(restrictedZones);
                        // Simulate success rate (lower for unknown visitor)
                        if (personId !== 'VISITOR_UNKNOWN' && Math.random() < 0.7) { // 70% success for known IDs
                            accessGranted = true;
                        } else { // Failed attempt
                            accessGranted = false;
                            denialReason = personId === 'VISITOR_UNKNOWN' ? 'Unknown User' : 'Invalid Credentials';
                        }
                    } else { // 15% attempt public zone (should usually succeed, maybe a door malfunction?)
                        targetZone = chooseRandom(publicZones);
                        if (Math.random() < 0.98) { // 98% success for public
                           accessGranted = true;
                        } else {
                            accessGranted = false;
                            denialReason = 'Door Malfunction';
                        }
                    }

                    logs.push({
                        logId: `AC_${String(logCounter++).padStart(6, '0')}`,
                        timestamp: timestamp.toISOString(),
                        dateKey: format(timestamp, 'yyyy-MM-dd'),
                        storeKey: store.storeKey,
                        zoneKey: targetZone.zoneKey,
                        personId: personId, // Anonymized ID
                        accessGranted: accessGranted,
                        denialReason: denialReason,
                        // Denormalized
                        storeName: store.storeName,
                        zoneName: targetZone.zoneName,
                    });

                } catch (err) { console.error("Error generating access log:", err); }
            }
        });
    });

    console.log(`Generated ${logs.length} access control logs.`);
    return logs.sort((a, b) => parseISO(b.timestamp) - parseISO(a.timestamp));
};