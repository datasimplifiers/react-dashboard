// src/utils/mockRoutePlanningGenerator.js
import {
    subDays, format, addDays, eachDayOfInterval, setHours, setMinutes, setSeconds, parseISO, startOfDay, endOfDay, differenceInMinutes, addMinutes
} from 'date-fns';
import { getMockStores } from './mockDataGenerator'; // Reuse stores as destinations

// --- Helper Functions ---
const getRandom = (min, max) => Math.random() * (max - min) + min;
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const chooseRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generateId = (prefix) => `${prefix}_${Math.random().toString(36).substring(2, 9)}`;

// --- NEW: Route Planning Dimensions ---

const distributionCenters = [
    { dcKey: 'DC_CAI_01', dcName: 'Cairo Central DC', city: 'Cairo' },
    { dcKey: 'DC_GIZ_01', dcName: 'Giza West DC', city: 'Giza' },
    // { dcKey: 'DC_ALX_01', dcName: 'Alexandria Port DC', city: 'Alexandria' }, // Add if stores exist there
];

const vehicles = [
    { vehicleKey: 'V001', vehicleId: 'TRUCK_101', vehicleType: 'Refrigerated Truck', fuelType: 'Diesel', capacityKg: 5000, avgKmPerLiter: 4.5 },
    { vehicleKey: 'V002', vehicleId: 'TRUCK_102', vehicleType: 'Refrigerated Truck', fuelType: 'Diesel', capacityKg: 5000, avgKmPerLiter: 4.2 },
    { vehicleKey: 'V003', vehicleId: 'VAN_201', vehicleType: 'Delivery Van', fuelType: 'Petrol', capacityKg: 1500, avgKmPerLiter: 8.0 },
    { vehicleKey: 'V004', vehicleId: 'VAN_202', vehicleType: 'Delivery Van', fuelType: 'Diesel', capacityKg: 1500, avgKmPerLiter: 10.5 },
    { vehicleKey: 'V005', vehicleId: 'TRUCK_103', vehicleType: 'Dry Goods Truck', fuelType: 'Diesel', capacityKg: 8000, avgKmPerLiter: 4.0 },
    { vehicleKey: 'V006', vehicleId: 'VAN_203', vehicleType: 'Delivery Van', fuelType: 'Petrol', capacityKg: 1500, avgKmPerLiter: 7.5 },
];

const drivers = Array.from({ length: 15 }, (_, i) => ({
    driverKey: `DRV_${String(101 + i).padStart(3, '0')}`,
    driverId: `EMP${700 + i}`,
    driverName: `Driver ${String.fromCharCode(65 + i)}${String.fromCharCode(70 + i)}`, // e.g., Driver AF
    experienceYears: getRandomInt(1, 15),
    efficiencyFactor: getRandom(0.9, 1.1), // Driver skill/speed modifier
}));

// Simple distance lookup (replace with actual API/calculation in real world)
const distanceMatrix = {
    'DC_CAI_01': { 'S1': 15, 'S2': 45, 'S3': 220 },
    'DC_GIZ_01': { 'S1': 40, 'S2': 10, 'S3': 250 },
    //'DC_ALX_01': { 'S1': 215, 'S2': 245, 'S3': 5 },
};

const AVG_SPEED_KMPH = 45;
const FUEL_PRICE_PER_LITER = { 'Diesel': 10.0, 'Petrol': 11.5 }; // Example EGP
const LATE_THRESHOLD_MINUTES = 15; // Deliveries later than this are marked 'Late'

// --- Dimensions Getters ---
export const getMockDistributionCenters = () => distributionCenters;
export const getMockVehicles = () => vehicles;
export const getMockDrivers = () => drivers;

// --- Fact Data Generator ---
export const generateMockRouteData = (startDate, endDate) => {
    console.log(`Generating route data from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
    const routeData = [];
    const stores = getMockStores();
    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
    let tripCounter = 1;

    for (const date of dateInterval) {
        const dateKey = format(date, 'yyyy-MM-dd');

        // Simulate trips originating from DCs to stores
        for (const dc of distributionCenters) {
            // Determine stores reachable from this DC based on matrix
            const reachableStoreKeys = Object.keys(distanceMatrix[dc.dcKey] || {});
            if (reachableStoreKeys.length === 0) continue;

            const dailyTripsFromDC = getRandomInt(5, 15); // Number of trips originating from this DC per day

            for (let i = 0; i < dailyTripsFromDC; i++) {
                try {
                    const destinationStoreKey = chooseRandom(reachableStoreKeys);
                    const destinationStore = stores.find(s => s.storeKey === destinationStoreKey);
                    if (!destinationStore) continue;

                    const vehicle = chooseRandom(vehicles);
                    const driver = chooseRandom(drivers);

                    // --- Planning ---
                    const plannedDepartureHour = getRandomInt(5, 10); // Morning departures
                    const plannedDepartureTimestamp = setSeconds(setMinutes(setHours(startOfDay(date), plannedDepartureHour), getRandomInt(0, 59)), 0);

                    const plannedDistanceKm = distanceMatrix[dc.dcKey][destinationStoreKey] + getRandom(-3, 3); // Add slight variance
                    if (plannedDistanceKm <= 0) continue; // Skip impossible routes

                    // Estimate duration based on distance, avg speed, and a buffer
                    const estimatedTravelMinutes = (plannedDistanceKm / AVG_SPEED_KMPH) * 60;
                    const loadingUnloadingBuffer = getRandomInt(30, 90);
                    const plannedDurationMinutes = Math.round(estimatedTravelMinutes + loadingUnloadingBuffer);

                    const plannedArrivalTimestamp = addMinutes(plannedDepartureTimestamp, plannedDurationMinutes);

                    // --- Actuals Simulation ---
                    // Actual Departure: slightly deviates from planned
                    const actualDepartureTimestamp = addMinutes(plannedDepartureTimestamp, getRandomInt(-10, 25));

                    // Actual Distance: slight variation
                    const actualDistanceKm = Math.max(plannedDistanceKm * 0.95, plannedDistanceKm + getRandom(-5, 15)); // Usually not shorter, can be longer

                    // Actual Duration: base on planned, modify by driver eff, traffic noise
                    let actualDurationMinutes = plannedDurationMinutes * (1 / driver.efficiencyFactor); // Base on driver
                    // Add traffic/delay noise - more variance for longer trips
                    const delayNoiseFactor = 1 + (getRandom(-0.05, 0.15) * (plannedDurationMinutes / 120)); // More potential delay % for longer trips
                    actualDurationMinutes *= delayNoiseFactor;
                    // Simulate occasional significant delays
                    if (Math.random() < 0.08) { // 8% chance of significant delay
                        actualDurationMinutes += getRandomInt(30, 120);
                    }
                    actualDurationMinutes = Math.max(30, Math.round(actualDurationMinutes)); // Ensure minimum duration

                    const actualArrivalTimestamp = addMinutes(actualDepartureTimestamp, actualDurationMinutes);

                    // Fuel Consumption
                    const baseFuelNeeded = actualDistanceKm / vehicle.avgKmPerLiter;
                    const fuelConsumedLiters = baseFuelNeeded * getRandom(0.95, 1.2); // Factor in driving style, traffic

                    // --- Derived Metrics ---
                    const durationVarianceMinutes = actualDurationMinutes - plannedDurationMinutes;
                    const delayMinutes = Math.max(0, differenceInMinutes(actualArrivalTimestamp, plannedArrivalTimestamp));

                    let deliveryStatus = 'On-Time';
                    if (delayMinutes > LATE_THRESHOLD_MINUTES) {
                        deliveryStatus = 'Late';
                    } else if (differenceInMinutes(plannedArrivalTimestamp, actualArrivalTimestamp) > 30) { // Arrived more than 30 mins early
                       // deliveryStatus = 'Early'; // Optional: Track early arrivals distinctly
                       deliveryStatus = 'On-Time'; // Treat early as On-Time for simplicity here
                    }

                    const fuelCost = fuelConsumedLiters * (FUEL_PRICE_PER_LITER[vehicle.fuelType] || FUEL_PRICE_PER_LITER['Diesel']); // Default to Diesel if type unknown

                    // --- Create Record ---
                    routeData.push({
                        tripId: `TRIP_${String(tripCounter++).padStart(7, '0')}`,
                        dateKey: dateKey, // Date of departure
                        // Dimension Keys
                        sourceLocationKey: dc.dcKey,
                        destinationLocationKey: destinationStore.storeKey,
                        vehicleKey: vehicle.vehicleKey,
                        driverKey: driver.driverKey,
                        // Planned Metrics
                        plannedDepartureTimestamp: plannedDepartureTimestamp.toISOString(),
                        plannedArrivalTimestamp: plannedArrivalTimestamp.toISOString(),
                        plannedDurationMinutes: plannedDurationMinutes,
                        plannedDistanceKm: parseFloat(plannedDistanceKm.toFixed(1)),
                        // Actual Metrics
                        actualDepartureTimestamp: actualDepartureTimestamp.toISOString(),
                        actualArrivalTimestamp: actualArrivalTimestamp.toISOString(),
                        actualDurationMinutes: actualDurationMinutes,
                        actualDistanceKm: parseFloat(actualDistanceKm.toFixed(1)),
                        fuelConsumedLiters: parseFloat(fuelConsumedLiters.toFixed(2)),
                        // Derived Metrics
                        durationVarianceMinutes: durationVarianceMinutes,
                        delayMinutes: delayMinutes, // Only positive delay is stored here
                        deliveryStatus: deliveryStatus, // 'On-Time', 'Late'
                        fuelCost: parseFloat(fuelCost.toFixed(2)),
                        // Denormalized Fields
                        sourceName: dc.dcName,
                        destinationName: destinationStore.storeName,
                        destinationCity: destinationStore.city,
                        vehicleId: vehicle.vehicleId,
                        vehicleType: vehicle.vehicleType,
                        driverName: driver.driverName,
                    });

                } catch (loopError) {
                    console.error("Error generating route data loop:", loopError);
                }
            } // End daily trips loop
        } // End DC loop
    } // End date loop

    console.log(`Generated ${routeData.length} mock route/trip records.`);
     // Filter out any potential records with null/NaN values before returning
     const cleanData = routeData.filter(d =>
         d.plannedDurationMinutes != null && isFinite(d.plannedDurationMinutes) &&
         d.actualDurationMinutes != null && isFinite(d.actualDurationMinutes) &&
         d.plannedDistanceKm != null && isFinite(d.plannedDistanceKm) &&
         d.actualDistanceKm != null && isFinite(d.actualDistanceKm) &&
         d.fuelConsumedLiters != null && isFinite(d.fuelConsumedLiters) &&
         d.fuelCost != null && isFinite(d.fuelCost)
     );
      if (cleanData.length !== routeData.length) {
          console.warn(`Filtered out ${routeData.length - cleanData.length} route records with invalid numeric values.`);
      }

    return cleanData.sort((a, b) => parseISO(a.actualDepartureTimestamp) - parseISO(b.actualDepartureTimestamp)); // Sort chronologically
};