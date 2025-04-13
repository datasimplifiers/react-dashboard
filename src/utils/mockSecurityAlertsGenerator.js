// src/utils/mockSecurityAlertsGenerator.js
// *** CORRECTED IMPORT: Added differenceInMinutes ***
import { subDays, addMinutes, format, setHours, setMinutes, setSeconds, startOfDay, endOfDay, addDays, parseISO, differenceInMinutes } from 'date-fns';
import { getMockStores, getMockCameras, getMockAlertTypes } from './mockDataGenerator';

// --- Helper Functions ---
const getRandom = (min, max) => Math.random() * (max - min) + min;
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const chooseRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generateId = (prefix) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

// --- Generate Mock Security Alert Data ---
export const generateMockSecurityAlerts = (startDate, endDate) => {
    console.log(`Generating security alerts from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
    const alertData = [];
    const stores = getMockStores();
    const cameras = getMockCameras();
    const alertTypes = getMockAlertTypes();
    const statuses = ['New', 'Investigating', 'Resolved', 'False Positive'];
    let alertCounter = 1;

    let currentDate = startOfDay(startDate);
    const finalDate = endOfDay(endDate);

    while (currentDate <= finalDate) {
        stores.forEach(store => {
            const storeCameras = cameras.filter(c => c.locationKey === store.storeKey);
            if (storeCameras.length === 0) return;

            const dailyAlerts = getRandomInt(2, 15);

            for (let i = 0; i < dailyAlerts; i++) {
                try {
                    const alertType = chooseRandom(alertTypes);
                    const camera = chooseRandom(storeCameras);
                    const alertTimestamp = setSeconds(setMinutes(setHours(currentDate, getRandomInt(8, 21)), getRandomInt(0, 59)), getRandomInt(0, 59));

                    let status = 'New';
                    let resolvedTimestamp = null;
                    let resolutionTimeMinutes = null;
                    const statusRoll = Math.random();

                    if (statusRoll > 0.15) {
                        status = chooseRandom(statuses.slice(1));
                        if (status === 'Resolved' || status === 'False Positive') {
                            const resolutionMinutes = getRandomInt(5, 180);
                            resolvedTimestamp = addMinutes(alertTimestamp, resolutionMinutes);
                            // Use the imported differenceInMinutes
                            if (resolvedTimestamp > new Date()) {
                                resolvedTimestamp = addMinutes(alertTimestamp, getRandomInt(1, Math.max(1, differenceInMinutes(new Date(), alertTimestamp))));
                            }
                            // Calculate resolution time *after* determining the final resolvedTimestamp
                            resolutionTimeMinutes = differenceInMinutes(resolvedTimestamp, alertTimestamp);

                        }
                    }

                    const confidenceScore = alertType.sourceSystem.startsWith('AI') ? parseFloat(getRandom(0.65, 0.98).toFixed(2)) : null;

                    alertData.push({
                        alertId: `ALERT_${String(alertCounter++).padStart(6, '0')}`,
                        timestamp: alertTimestamp.toISOString(),
                        dateKey: format(alertTimestamp, 'yyyy-MM-dd'),
                        hourOfDay: parseInt(format(alertTimestamp, 'H')),
                        storeKey: store.storeKey,
                        sensorKey: camera.sensorKey,
                        alertTypeKey: alertType.alertTypeKey,
                        status: status,
                        resolutionTimeMinutes: resolutionTimeMinutes,
                        resolvedTimestamp: resolvedTimestamp ? resolvedTimestamp.toISOString() : null,
                        confidenceScore: confidenceScore,
                        storeName: store.storeName,
                        cameraLocation: camera.zoneName || camera.purpose || 'Unknown Location',
                        alertDescription: alertType.alertDescription,
                        severityLevel: alertType.severityLevel,
                        details: `${alertType.alertDescription} detected at ${camera.sensorId}.`
                    });
                } catch (err) {
                    console.error("Error generating single alert:", err);
                }
            }
        });
        currentDate = addDays(currentDate, 1);
    }

    console.log(`Generated ${alertData.length} mock security alerts.`);
    return alertData.sort((a, b) => parseISO(b.timestamp) - parseISO(a.timestamp));
};