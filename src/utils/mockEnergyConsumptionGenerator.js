// src/utils/mockEnergyConsumptionGenerator.js
import {
    subDays, addDays, format, setHours, setMinutes, setSeconds, startOfDay, endOfDay, eachDayOfInterval, getHours, getDay, parseISO
} from 'date-fns';
import { getMockStores } from './mockDataGenerator'; // Reuse stores as locations

// --- Helper Functions ---
const getRandom = (min, max) => Math.random() * (max - min) + min;
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const chooseRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generateId = (prefix) => `${prefix}_${Math.random().toString(36).substring(2, 9)}`;

// --- Constants ---
const COST_PER_KWH = 1.50; // Example cost in EGP
const WEATHER_CONDITIONS = ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy', 'Stormy'];
// Base loads represent average kWh consumed *per hour* when the device is 'on' or at its baseline state.
const DEVICE_TYPES = {
    HVAC: { baseLoad: 0.8, peakMultiplier: 3.0, tempSensitivity: 0.15, hourSensitivity: { day: 1.5, night: 0.5 } },
    Lighting: { baseLoad: 0.3, peakMultiplier: 1.1, tempSensitivity: 0, hourSensitivity: { day: 1.0, night: 0.1 } }, // Correct Case
    Refrigeration: { baseLoad: 0.6, peakMultiplier: 1.2, tempSensitivity: 0.03, hourSensitivity: { day: 1.0, night: 0.9 } },
    'Plug Loads': { baseLoad: 0.2, peakMultiplier: 1.5, tempSensitivity: 0, hourSensitivity: { day: 1.2, night: 0.3 } },
    SPECIALTY: { baseLoad: 0.5, peakMultiplier: 4.0, tempSensitivity: 0.01, hourSensitivity: { day: 1.8, night: 0.1 } },
};
// Removed AREAS constant as it's implicitly defined in getMockEnergyDeviceAreas

// --- Dimensions ---

// DimEnergyDeviceArea - Define devices/areas within locations
const getMockEnergyDeviceAreas = (locations) => {
    const deviceAreas = [];
    let keyCounter = 1;
    locations.forEach(location => {
        // Ensure Lighting is added reliably
        deviceAreas.push({ deviceAreaKey: `DA${String(keyCounter++).padStart(3, '0')}`, locationKey: location.storeKey, deviceTypeName: 'HVAC', areaName: 'Sales Floor', baseLoad_kWh_hour: DEVICE_TYPES.HVAC.baseLoad * getRandom(1.8, 2.2) });
        deviceAreas.push({ deviceAreaKey: `DA${String(keyCounter++).padStart(3, '0')}`, locationKey: location.storeKey, deviceTypeName: 'Lighting', areaName: 'Sales Floor', baseLoad_kWh_hour: DEVICE_TYPES.Lighting.baseLoad * getRandom(4.5, 5.5) }); // <<-- Make sure 'Lighting' is added
        deviceAreas.push({ deviceAreaKey: `DA${String(keyCounter++).padStart(3, '0')}`, locationKey: location.storeKey, deviceTypeName: 'Refrigeration', areaName: 'Sales Floor', baseLoad_kWh_hour: DEVICE_TYPES.Refrigeration.baseLoad * getRandom(2.8, 3.2) });
        deviceAreas.push({ deviceAreaKey: `DA${String(keyCounter++).padStart(3, '0')}`, locationKey: location.storeKey, deviceTypeName: 'Plug Loads', areaName: 'Sales Floor', baseLoad_kWh_hour: DEVICE_TYPES['Plug Loads'].baseLoad * getRandom(0.8, 1.2) });

        deviceAreas.push({ deviceAreaKey: `DA${String(keyCounter++).padStart(3, '0')}`, locationKey: location.storeKey, deviceTypeName: 'HVAC', areaName: 'Stock Room', baseLoad_kWh_hour: DEVICE_TYPES.HVAC.baseLoad * getRandom(0.9, 1.1) });
        deviceAreas.push({ deviceAreaKey: `DA${String(keyCounter++).padStart(3, '0')}`, locationKey: location.storeKey, deviceTypeName: 'Lighting', areaName: 'Stock Room', baseLoad_kWh_hour: DEVICE_TYPES.Lighting.baseLoad * getRandom(1.8, 2.2) }); // <<-- Make sure 'Lighting' is added
        deviceAreas.push({ deviceAreaKey: `DA${String(keyCounter++).padStart(3, '0')}`, locationKey: location.storeKey, deviceTypeName: 'Refrigeration', areaName: 'Stock Room', baseLoad_kWh_hour: DEVICE_TYPES.Refrigeration.baseLoad * getRandom(1.8, 2.2) });

        deviceAreas.push({ deviceAreaKey: `DA${String(keyCounter++).padStart(3, '0')}`, locationKey: location.storeKey, deviceTypeName: 'HVAC', areaName: 'Office Area', baseLoad_kWh_hour: DEVICE_TYPES.HVAC.baseLoad * getRandom(0.7, 0.9) });
        deviceAreas.push({ deviceAreaKey: `DA${String(keyCounter++).padStart(3, '0')}`, locationKey: location.storeKey, deviceTypeName: 'Lighting', areaName: 'Office Area', baseLoad_kWh_hour: DEVICE_TYPES.Lighting.baseLoad * getRandom(0.9, 1.1) }); // <<-- Make sure 'Lighting' is added
        deviceAreas.push({ deviceAreaKey: `DA${String(keyCounter++).padStart(3, '0')}`, locationKey: location.storeKey, deviceTypeName: 'Plug Loads', areaName: 'Office Area', baseLoad_kWh_hour: DEVICE_TYPES['Plug Loads'].baseLoad * getRandom(2.5, 3.5) });

        // Add Kitchen/Exterior without random check for testing
        const kitchenArea = 'Kitchen/Break Room';
        deviceAreas.push({ deviceAreaKey: `DA${String(keyCounter++).padStart(3, '0')}`, locationKey: location.storeKey, deviceTypeName: 'Refrigeration', areaName: kitchenArea, baseLoad_kWh_hour: DEVICE_TYPES.Refrigeration.baseLoad * getRandom(0.9, 1.1) });
        deviceAreas.push({ deviceAreaKey: `DA${String(keyCounter++).padStart(3, '0')}`, locationKey: location.storeKey, deviceTypeName: 'Plug Loads', areaName: kitchenArea, baseLoad_kWh_hour: DEVICE_TYPES['Plug Loads'].baseLoad * getRandom(1.0, 1.5) });
        deviceAreas.push({ deviceAreaKey: `DA${String(keyCounter++).padStart(3, '0')}`, locationKey: location.storeKey, deviceTypeName: 'SPECIALTY', areaName: kitchenArea, baseLoad_kWh_hour: DEVICE_TYPES.SPECIALTY.baseLoad * getRandom(0.4, 0.6) });

        deviceAreas.push({ deviceAreaKey: `DA${String(keyCounter++).padStart(3, '0')}`, locationKey: location.storeKey, deviceTypeName: 'Lighting', areaName: 'Exterior', baseLoad_kWh_hour: DEVICE_TYPES.Lighting.baseLoad * getRandom(1.3, 1.7) }); // <<-- Make sure 'Lighting' is added
    });
    console.log("Generated Device Areas:", deviceAreas.filter(da => da.deviceTypeName === 'Lighting').length, "Lighting devices created."); // Log how many lighting devices were defined
    return deviceAreas;
};

// --- Fact Data Generator ---
export const generateMockEnergyConsumption = (startDate, endDate) => {
    console.log(`Generating energy consumption data from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
    const consumptionData = [];
    const locations = getMockStores();
    const deviceAreas = getMockEnergyDeviceAreas(locations); // Generate based on stores
    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
    let consumptionCounter = 1;

    // Simple daily weather simulation per location
    const dailyWeather = {};
    locations.forEach(loc => {
        dailyWeather[loc.storeKey] = {};
        let lastTemp = getRandomInt(15, 28); // Starting temp for the period
        dateInterval.forEach(date => {
            const dateKey = format(date, 'yyyy-MM-dd');
            // Simulate slight temp change day-to-day
            lastTemp += getRandom(-1.5, 1.5);
            lastTemp = Math.max(10, Math.min(38, lastTemp)); // Clamp temp
            dailyWeather[loc.storeKey][dateKey] = {
                temperatureCelsius: parseFloat(lastTemp.toFixed(1)),
                weatherCondition: chooseRandom(WEATHER_CONDITIONS),
            };
        });
    });


    dateInterval.forEach(date => {
        const dateKey = format(date, 'yyyy-MM-dd');
        locations.forEach(location => {
            const locationDeviceAreas = deviceAreas.filter(da => da.locationKey === location.storeKey);
            const weather = dailyWeather[location.storeKey][dateKey];

            locationDeviceAreas.forEach(deviceArea => {
                // Ensure device type exists in our configuration
                const deviceConfig = DEVICE_TYPES[deviceArea.deviceTypeName];
                if (!deviceConfig) {
                    console.warn(`Skipping device area due to unknown type: ${deviceArea.deviceTypeName}`);
                    return;
                }

                // Simulate hourly consumption for this device/area on this day
                for (let hour = 0; hour < 24; hour++) {
                    try {
                        const timestamp = setHours(startOfDay(date), hour);
                        const timeKey = format(timestamp, 'HH:00:00'); // Hour granularity
                        const dayOfWeek = getDay(timestamp); // 0=Sun, 6=Sat

                        // Start with the base load for this specific device/area instance
                        let consumption = deviceArea.baseLoad_kWh_hour;
                        if (consumption == null || !isFinite(consumption)) {
                           console.warn(`Invalid base load for ${deviceArea.deviceAreaKey}: ${consumption}. Defaulting to 0.`);
                           consumption = 0;
                        }


                        // --- Apply Modifiers ---

                        // 1. Time of Day Modifier
                        const isDayTime = hour >= 7 && hour < 21; // Store operating hours assumption
                        const hourMultiplier = isDayTime ? deviceConfig.hourSensitivity.day : deviceConfig.hourSensitivity.night;
                        consumption *= hourMultiplier;

                        // Specific logic for exterior lighting
                        if (deviceArea.areaName === 'Exterior' && deviceArea.deviceTypeName === 'Lighting') {
                            consumption = deviceArea.baseLoad_kWh_hour * (isDayTime ? getRandom(0.0, 0.1) : getRandom(0.9, 1.1)); // Mostly off during day, on at night
                        }

                        // Simulate peak hours slightly (e.g., midday for HVAC/Specialty)
                        if (hour >= 11 && hour <= 15 && (deviceArea.deviceTypeName === 'HVAC' || deviceArea.deviceTypeName === 'SPECIALTY')) {
                            consumption *= getRandom(1.0, deviceConfig.peakMultiplier * 0.6 + 0.4); // More pronounced peak effect during these hours
                        }

                        // 2. Temperature Modifier (esp. for HVAC, Refrigeration)
                        const tempDiff = weather.temperatureCelsius - 22; // Assume 22C is baseline comfort temp
                        // Apply sensitivity only if non-zero to avoid issues
                        if (deviceConfig.tempSensitivity !== 0) {
                            consumption *= (1 + (tempDiff * deviceConfig.tempSensitivity));
                        }

                        // 3. Weather Condition Modifier (Simplified)
                        if (weather.weatherCondition === 'Sunny' && deviceArea.deviceTypeName === 'Lighting' && isDayTime && deviceArea.areaName !== 'Exterior') {
                            consumption *= 0.85; // Slightly less interior lighting needed
                        }
                        if ((weather.weatherCondition === 'Rainy' || weather.weatherCondition === 'Stormy') && deviceArea.deviceTypeName === 'HVAC') {
                            consumption *= 1.1; // More HVAC due to humidity/discomfort
                        }

                        // 4. Weekend Modifier (for office/some specialty)
                        if ((dayOfWeek === 0 || dayOfWeek === 6) && (deviceArea.areaName === 'Office Area' || deviceArea.deviceTypeName === 'Plug Loads')) {
                            consumption *= getRandom(0.3, 0.5); // Less usage on weekends
                        }

                        // 5. Add Random Noise
                        consumption *= getRandom(0.9, 1.1); // Reduced noise slightly

                        // Ensure consumption is non-negative and finite
                        consumption = Math.max(0, consumption);
                         if (!isFinite(consumption)) {
                            console.warn(`Calculated non-finite consumption for ${deviceArea.deviceAreaKey} at ${hour}:00. Resetting to 0.`);
                            consumption = 0;
                         }

                        // --- Calculate Cost ---
                        const cost = consumption * COST_PER_KWH;

                        // --- Create Record ---
                        consumptionData.push({
                            consumptionId: `CON_${String(consumptionCounter++).padStart(8, '0')}`,
                            timestamp: timestamp.toISOString(),
                            dateKey: dateKey,
                            timeKey: timeKey,
                            hourOfDay: hour,
                            dayOfWeek: format(timestamp, 'EEEE'), // Full day name
                            locationKey: location.storeKey,
                            deviceAreaKey: deviceArea.deviceAreaKey,

                            energyConsumed_kWh: parseFloat(consumption.toFixed(3)),
                            energyCost: parseFloat(cost.toFixed(2)),

                            // Denormalized fields for convenience
                            locationName: location.storeName,
                            cityName: location.city,
                            deviceTypeName: deviceArea.deviceTypeName,
                            areaName: deviceArea.areaName,

                            // External Factors
                            temperatureCelsius: weather.temperatureCelsius,
                            weatherCondition: weather.weatherCondition,
                        });
                    } catch (err) {
                        console.error(`Error generating record for hour ${hour}, device ${deviceArea.deviceAreaKey}:`, err);
                    }
                } // end hourly loop
            }); // end deviceArea loop
        }); // end location loop
    }); // end date loop

    console.log(`Generated ${consumptionData.length} mock energy consumption records.`);
    // Filter out any potential records with null/NaN values before returning (optional safety net)
    const cleanData = consumptionData.filter(d =>
        d.energyConsumed_kWh != null && isFinite(d.energyConsumed_kWh) &&
        d.energyCost != null && isFinite(d.energyCost)
    );
     if (cleanData.length !== consumptionData.length) {
         console.warn(`Filtered out ${consumptionData.length - cleanData.length} records with invalid numeric values.`);
     }

    return cleanData.sort((a, b) => parseISO(a.timestamp) - parseISO(b.timestamp)); // Sort chronologically
};

// Add an export for the device types if needed elsewhere (e.g., for default filters)
export const getDeviceTypesList = () => Object.keys(DEVICE_TYPES);