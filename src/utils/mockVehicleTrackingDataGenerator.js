// src/utils/mockVehicleTrackingDataGenerator.js
import { subMinutes, subHours, addMinutes, formatISO, parseISO, differenceInMinutes } from 'date-fns';
import L from 'leaflet'; // Import leaflet for LatLng calculations if needed
import { getMockStores } from './mockDataGenerator';

// --- Helper Functions ---
const getRandom = (min, max) => Math.random() * (max - min) + min;
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const chooseRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generateId = (prefix) => `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
const lerp = (a, b, t) => a + (b - a) * t; // Linear interpolation

// --- Dimensions ---

// DimVehicleType & DimVehicle
const vehicleTypes = [
    { typeKey: 'VT_TRUCK_L', name: 'Large Truck', capacityTonnes: 10, icon: '🚚' },
    { typeKey: 'VT_TRUCK_M', name: 'Medium Truck', capacityTonnes: 5, icon: '🚛' },
    { typeKey: 'VT_VAN', name: 'Delivery Van', capacityTonnes: 1.5, icon: '🚐' },
    { typeKey: 'VT_MOTO', name: 'Motorcycle', capacityTonnes: 0.1, icon: '🛵' },
];

const vehicleStatuses = ['Idle', 'En Route', 'Delivering', 'Maintenance', 'Off Duty'];

const vehicles = Array.from({ length: 30 }, (_, i) => {
    const type = chooseRandom(vehicleTypes);
    const status = chooseRandom(vehicleStatuses);
    return {
        vehicleKey: `V${String(101 + i).padStart(3, '0')}`,
        vehicleId: `PLATE_${getRandomInt(1000, 9999)}${String.fromCharCode(65 + getRandomInt(0, 25))}${String.fromCharCode(65 + getRandomInt(0, 25))}`,
        typeKey: type.typeKey,
        typeName: type.name,
        description: `${type.name} ${101 + i}`,
        capacityTonnes: type.capacityTonnes,
        icon: type.icon,
        currentStatus: status, // This will be updated by the 'live' data
        // Initial location (will be updated) - Centered around Cairo for demo
        currentLat: getRandom(29.95, 30.15),
        currentLng: getRandom(31.15, 31.35),
        lastUpdateTime: subMinutes(new Date(), getRandomInt(1, 60)).toISOString()
    };
});

// DimDriver
const drivers = Array.from({ length: 35 }, (_, i) => ({
    driverKey: `DRV_${String(1001 + i)}`,
    driverName: `Driver ${String.fromCharCode(65 + Math.floor(i / 10))}${i % 10 + 1}`, // Driver A1, A2... B1...
}));

// DimWarehouse (Add warehouse locations)
const warehouses = [
    { warehouseKey: 'W1', warehouseName: 'Main Warehouse (6th Oct)', city: 'Giza', lat: 29.96, lng: 30.95 },
    { warehouseKey: 'W2', warehouseName: 'North Hub (Obour)', city: 'Cairo', lat: 30.19, lng: 31.47 },
    // Add more if needed
];

// DimRouteType
const routeTypes = [
    { typeKey: 'W2S', name: 'Warehouse to Store' },
    { typeKey: 'S2C', name: 'Store to Customer Area' },
    { typeKey: 'W2C', name: 'Warehouse to Customer Area' },
    { typeKey: 'RETURN', name: 'Return Trip' },
];

// Combine Stores and Warehouses for locations
const allLocations = [
    ...getMockStores().map(s => ({ key: s.storeKey, name: s.storeName, type: 'Store', lat: getRandom(29.9, 30.2), lng: getRandom(31.1, 31.4) })), // Add mock coords if missing
    ...warehouses.map(w => ({ key: w.warehouseKey, name: w.warehouseName, type: 'Warehouse', lat: w.lat, lng: w.lng }))
];
const locationMap = new Map(allLocations.map(l => [l.key, l]));

// --- Simulation State (In-memory for demo) ---
// This would normally come from a real-time database/API
let liveVehicleData = vehicles.map(v => ({ ...v })); // Start with initial state

// --- FactTrip --- (Generate some representative trips)
// For simplicity, we won't generate a full historical Fact table,
// but rather assign 'current' trips to vehicles that are 'En Route' or 'Delivering'
const assignCurrentTrips = () => {
    liveVehicleData.forEach(vehicle => {
        if (vehicle.currentStatus === 'En Route' || vehicle.currentStatus === 'Delivering') {
            const routeType = chooseRandom(routeTypes.filter(rt => rt.typeKey !== 'RETURN'));
            let originLoc, destLoc;

            if (routeType.typeKey === 'W2S') {
                originLoc = chooseRandom(warehouses);
                destLoc = chooseRandom(getMockStores());
            } else if (routeType.typeKey === 'S2C') {
                originLoc = chooseRandom(getMockStores());
                // Simulate customer area destination nearby
                destLoc = { name: `${originLoc.city} District ${getRandomInt(1, 5)}`, lat: originLoc.lat + getRandom(-0.05, 0.05), lng: originLoc.lng + getRandom(-0.05, 0.05) };
            } else { // W2C
                originLoc = chooseRandom(warehouses);
                 destLoc = { name: `Customer Area ${getRandomInt(10, 99)}`, lat: getRandom(29.9, 30.2), lng: getRandom(31.1, 31.4) };
            }

            vehicle.currentTrip = {
                tripId: generateId(`T_${routeType.typeKey}`),
                routeTypeName: routeType.name,
                originName: originLoc.name || originLoc.storeName || originLoc.warehouseName,
                destinationName: destLoc.name || destLoc.storeName || destLoc.warehouseName,
                originCoords: { lat: originLoc.lat, lng: originLoc.lng },
                destinationCoords: { lat: destLoc.lat, lng: destLoc.lng },
                startTime: subMinutes(new Date(), getRandomInt(15, 120)).toISOString(), // Started sometime in last 2 hrs
                estimatedDurationMinutes: getRandomInt(30, 180),
            };
            vehicle.driverKey = chooseRandom(drivers).driverKey; // Assign a driver
            // Set initial position near origin for simulation start
            vehicle.currentLat = lerp(originLoc.lat, destLoc.lat, 0.05); // Start 5% along path
            vehicle.currentLng = lerp(originLoc.lng, destLoc.lng, 0.05);

        } else {
            vehicle.currentTrip = null; // No trip if Idle, Maintenance, Off Duty
             // Assign idle vehicles to a fixed location (store/warehouse)
             if (vehicle.currentStatus === 'Idle' || vehicle.currentStatus === 'Maintenance') {
                 const loc = chooseRandom(allLocations);
                 vehicle.currentLat = loc.lat + getRandom(-0.001, 0.001); // Slight jitter
                 vehicle.currentLng = loc.lng + getRandom(-0.001, 0.001);
             }
        }
    });
};

// Assign initial trips
assignCurrentTrips();

// --- FactVehiclePing Generator (Simulates fetching *latest* data) ---
export const generateMockVehiclePings = (simulatedTime = new Date()) => {
    // console.log("Simulating pings around:", simulatedTime.toISOString());
    const pings = [];
    const updateIntervalSeconds = 30; // How often we simulate an update

    liveVehicleData = liveVehicleData.map(vehicle => {
        const newVehicleState = { ...vehicle };
        const lastUpdate = parseISO(newVehicleState.lastUpdateTime);
        const minutesSinceLastUpdate = differenceInMinutes(simulatedTime, lastUpdate);

        // Only update vehicles that haven't been updated very recently
        // and are not Off Duty (or sometimes Maintenance)
        if (minutesSinceLastUpdate < 1 && Math.random() > 0.1) { // Small chance to update anyway
            return newVehicleState; // Skip update for this cycle
        }
        if (vehicle.currentStatus === 'Off Duty') {
            return newVehicleState; // No updates needed
        }
        if (vehicle.currentStatus === 'Maintenance' && Math.random() > 0.05) {
            return newVehicleState; // Rarely update maintenance vehicles
        }


        let currentLat = newVehicleState.currentLat;
        let currentLng = newVehicleState.currentLng;
        let speed = 0;
        let heading = newVehicleState.heading || 0; // Keep previous heading if available

        if ((vehicle.currentStatus === 'En Route' || vehicle.currentStatus === 'Delivering') && vehicle.currentTrip) {
            const trip = vehicle.currentTrip;
            const origin = trip.originCoords;
            const dest = trip.destinationCoords;
            const totalTripMinutes = differenceInMinutes(simulatedTime, parseISO(trip.startTime));
            const progress = Math.min(1, Math.max(0, totalTripMinutes / (trip.estimatedDurationMinutes * getRandom(0.8, 1.2)))); // Simulate variable trip time

            // Simple linear interpolation for position
            currentLat = lerp(origin.lat, dest.lat, progress);
            currentLng = lerp(origin.lng, dest.lng, progress);

             // Add some minor random deviation from the straight path
            currentLat += getRandom(-0.0005, 0.0005);
            currentLng += getRandom(-0.0005, 0.0005);

            speed = getRandomInt(30, 70); // Simulate speed in km/h
             // Simulate occasional stops
             if (Math.random() < 0.05) {
                 speed = 0;
                 newVehicleState.currentStatus = 'Delivering'; // Assume stop means delivering
             } else {
                 newVehicleState.currentStatus = 'En Route'; // Otherwise, en route
             }

            // Calculate heading (basic)
            const dy = dest.lat - currentLat;
            const dx = dest.lng - currentLng;
            heading = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360; // Basic heading

            // Check if trip is completed
            if (progress >= 1 || (currentLat === dest.lat && currentLng === dest.lng)) {
                newVehicleState.currentStatus = 'Idle';
                newVehicleState.currentLat = dest.lat;
                newVehicleState.currentLng = dest.lng;
                newVehicleState.currentTrip = null; // Clear completed trip
                speed = 0;
                // Maybe assign a return trip or new trip later
            }

        } else if (vehicle.currentStatus === 'Idle') {
            speed = 0;
             // Slight location jitter
             currentLat += getRandom(-0.0001, 0.0001);
             currentLng += getRandom(-0.0001, 0.0001);
        } else { // Maintenance / Other parked status
             speed = 0;
        }

        // Update state for next iteration
        newVehicleState.currentLat = parseFloat(currentLat.toFixed(6));
        newVehicleState.currentLng = parseFloat(currentLng.toFixed(6));
        newVehicleState.speed = speed;
        newVehicleState.heading = parseFloat(heading.toFixed(1));
        newVehicleState.lastUpdateTime = simulatedTime.toISOString();

        // Create the 'ping' record for this update cycle
        pings.push({
            pingId: generateId('PNG'),
            timestamp: newVehicleState.lastUpdateTime,
            vehicleKey: newVehicleState.vehicleKey,
            latitude: newVehicleState.currentLat,
            longitude: newVehicleState.currentLng,
            speedKmh: newVehicleState.speed,
            heading: newVehicleState.heading,
            status: newVehicleState.currentStatus,
            // Denormalized for convenience
            vehicleId: newVehicleState.vehicleId,
            typeName: newVehicleState.typeName,
            icon: newVehicleState.icon,
            driverKey: newVehicleState.driverKey, // Add driver key if available
        });

        return newVehicleState; // Return updated state
    });

    // console.log(`Generated ${pings.length} pings for this cycle.`);
    return pings; // Return only the pings generated in *this* cycle
};

// Function to get the *current* state of all vehicles
export const getCurrentVehicleStates = () => {
    // Return a deep copy to prevent direct modification
    return liveVehicleData.map(v => ({ ...v, currentTrip: v.currentTrip ? { ...v.currentTrip } : null }));
};

// Export dimensions getters
export const getMockVehicles = () => vehicles; // Initial definition
export const getMockDrivers = () => drivers;
export const getMockWarehouses = () => warehouses;
export const getMockRouteTypes = () => routeTypes;