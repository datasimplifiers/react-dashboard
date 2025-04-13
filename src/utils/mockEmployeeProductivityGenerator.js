// src/utils/mockEmployeeProductivityGenerator.js
import {
    subDays, format, addDays, eachDayOfInterval, setHours, setMinutes, setSeconds, parseISO, startOfDay, endOfDay, differenceInMinutes, addMinutes, getDay
} from 'date-fns';
import { getMockStores, getMockStoreZones } from './mockDataGenerator'; // Reuse common data

// --- Helper Functions ---
const getRandom = (min, max) => Math.random() * (max - min) + min;
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const chooseRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generateId = (prefix) => `${prefix}_${Math.random().toString(36).substring(2, 9)}`;

// --- NEW: Employee Productivity Dimensions ---

const employeeRoles = [
    { roleId: 'R01', roleName: 'Cashier', defaultTasks: ['T01', 'T06'] },
    { roleId: 'R02', roleName: 'Stocker', defaultTasks: ['T02', 'T03', 'T04'] },
    { roleId: 'R03', roleName: 'Floor Staff', defaultTasks: ['T05', 'T03', 'T06'] },
    { roleId: 'R04', roleName: 'Shift Manager', defaultTasks: ['T07', 'T08'] },
];

const experienceLevels = ['Trainee', 'Junior', 'Senior'];
const shifts = ['Day Shift (8-16)', 'Evening Shift (14-22)', 'Night Shift (22-6)']; // Added Night Shift

const employees = [];
const stores = getMockStores();
let empCounter = 1;
stores.forEach(store => {
    // Add ~10-20 employees per store
    const numEmployees = getRandomInt(10, 20);
    for (let i = 0; i < numEmployees; i++) {
        const role = chooseRandom(employeeRoles);
        const experience = chooseRandom(experienceLevels);
        const shift = chooseRandom(shifts);
        let efficiencyFactor = 1.0; // Baseline
        if (experience === 'Trainee') efficiencyFactor = getRandom(0.7, 0.9);
        if (experience === 'Senior') efficiencyFactor = getRandom(1.0, 1.2);
        // Adjust efficiency slightly by role (e.g., managers might be slightly slower at operational tasks if included)
        if(role.roleName === 'Shift Manager') efficiencyFactor *= 0.95;

        employees.push({
            employeeKey: `EMP_${String(empCounter++).padStart(4, '0')}`,
            employeeId: `E${7000 + empCounter}`,
            employeeName: `Employee ${String.fromCharCode(65 + (empCounter % 26))}${empCounter}`,
            roleId: role.roleId,
            roleName: role.roleName, // Denormalized
            storeKey: store.storeKey,
            storeName: store.storeName, // Denormalized
            hireDate: subDays(new Date(), getRandomInt(60, 1500)),
            experienceLevel: experience,
            shift: shift,
            efficiencyFactor: parseFloat(efficiencyFactor.toFixed(2)), // Affects actual task duration
            performanceRating: getRandomInt(3, 5), // Simple 1-5 rating for potential future use
        });
    }
});

const taskTypes = [
    { taskTypeKey: 'T01', taskName: 'Checkout Scanning', category: 'Checkout', standardTimeMinutes: 1.5, unitName: 'Items' }, // Time per item assumption
    { taskTypeKey: 'T02', taskName: 'Stocking Shelves', category: 'Stocking', standardTimeMinutes: 45, unitName: 'Cases' }, // Time per case/pallet
    { taskTypeKey: 'T03', taskName: 'Shelf Facing/Organizing', category: 'Merchandising', standardTimeMinutes: 30, unitName: 'Aisles' },
    { taskTypeKey: 'T04', taskName: 'Receiving Goods', category: 'Stocking', standardTimeMinutes: 60, unitName: 'Pallets' },
    { taskTypeKey: 'T05', taskName: 'Customer Assistance', category: 'Customer Service', standardTimeMinutes: 5, unitName: 'Interactions' },
    { taskTypeKey: 'T06', taskName: 'Cleaning Assigned Area', category: 'Maintenance', standardTimeMinutes: 20, unitName: 'Areas' },
    { taskTypeKey: 'T07', taskName: 'Opening/Closing Procedures', category: 'Admin', standardTimeMinutes: 40, unitName: 'Procedures' },
    { taskTypeKey: 'T08', taskName: 'Inventory Count/Check', category: 'Admin', standardTimeMinutes: 50, unitName: 'Sections' },
    { taskTypeKey: 'T09', taskName: 'Break/Idle', category: 'Non-Productive', standardTimeMinutes: 15, unitName: 'Periods' }, // Explicit break/idle type
];
const taskTypeMap = new Map(taskTypes.map(t => [t.taskTypeKey, t]));

// --- Dimensions Getters ---
export const getMockEmployees = () => employees;
export const getMockEmployeeRoles = () => employeeRoles;
export const getMockTaskTypes = () => taskTypes;

// --- Fact Data Generator ---
export const generateMockEmployeeProductivityData = (startDate, endDate) => {
    console.log(`Generating employee productivity data from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
    const productivityData = [];
    const storeZones = getMockStoreZones();
    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
    let logCounter = 1;

    const getShiftHours = (shiftName) => {
        if (shiftName.includes('8-16')) return { start: 8, end: 16 };
        if (shiftName.includes('14-22')) return { start: 14, end: 22 };
        if (shiftName.includes('22-6')) return { start: 22, end: 6 }; // overnight
        return { start: 8, end: 16 }; // Default
    };

    for (const date of dateInterval) {
        const dateKey = format(date, 'yyyy-MM-dd');
        const dayOfWeek = getDay(date); // 0=Sun, 6=Sat

        // Filter employees working on this day (based on shift - simplified, assumes everyone works)
        const activeEmployees = employees; // In real-world, filter by schedule

        for (const employee of activeEmployees) {
            try {
                const store = stores.find(s => s.storeKey === employee.storeKey);
                if (!store) continue;

                const shiftTimes = getShiftHours(employee.shift);
                let currentTimestamp = setMinutes(setHours(startOfDay(date), shiftTimes.start), getRandomInt(0,15)); // Start time with slight variation

                // Handle overnight shift crossing midnight
                 const endHour = shiftTimes.end < shiftTimes.start ? shiftTimes.end + 24 : shiftTimes.end;
                 const shiftEndTime = setHours(startOfDay(date), endHour); // May be >24 hours from start of 'date'

                 let tasksDone = 0;
                 const maxTasksPerShift = getRandomInt(10, 25); // Limit tasks per shift

                 while (currentTimestamp < shiftEndTime && tasksDone < maxTasksPerShift) {
                     // Choose a task based on role, or sometimes a generic task like cleaning/break
                     let task;
                     const roleInfo = employeeRoles.find(r => r.roleId === employee.roleId);
                     const possibleTaskKeys = roleInfo ? [...roleInfo.defaultTasks] : [];
                     // Add break/cleaning occasionally
                     if(Math.random() < 0.1) possibleTaskKeys.push('T09'); // 10% chance of break/idle slot
                     else if (Math.random() < 0.08) possibleTaskKeys.push('T06'); // 8% chance of cleaning

                     const taskKey = chooseRandom(possibleTaskKeys.length > 0 ? possibleTaskKeys : ['T09']); // Default to break if no tasks defined
                     task = taskTypeMap.get(taskKey);
                     if (!task) continue; // Skip if task not found

                     // --- Planning ---
                     const plannedStartTime = currentTimestamp; // Assume planned start is when the previous task ended
                     let plannedDurationMinutes = task.standardTimeMinutes;
                     // Adjust planned time slightly based on experience? (e.g., trainees planned longer)
                     if(employee.experienceLevel === 'Trainee') plannedDurationMinutes *= getRandom(1.1, 1.3);

                     plannedDurationMinutes = Math.max(5, Math.round(plannedDurationMinutes * getRandom(0.9, 1.1))); // Add some planning variance

                     // --- Actuals ---
                     const actualStartTime = addMinutes(plannedStartTime, getRandomInt(-2, 5)); // Task might start slightly early/late

                     let actualDurationMinutes = plannedDurationMinutes;
                     // Adjust actual duration based on employee efficiency
                     actualDurationMinutes /= (employee.efficiencyFactor || 1.0);
                     // Add random variance/complexity factor
                     actualDurationMinutes *= getRandom(0.85, 1.25);
                     // Specific adjustments
                     if(task.category === 'Customer Service') actualDurationMinutes = getRandomInt(2, 15); // Highly variable
                     if(task.category === 'Checkout') actualDurationMinutes *= getRandom(0.9, 1.1); // Less variable per item

                      actualDurationMinutes = Math.max(3, Math.round(actualDurationMinutes)); // Min duration 3 mins

                     const actualEndTime = addMinutes(actualStartTime, actualDurationMinutes);

                     // --- Units & Quality ---
                     let taskUnitsCompleted = 1; // Default
                     if (task.taskTypeKey === 'T01') taskUnitsCompleted = getRandomInt(5, 30); // Items scanned
                     else if (task.taskTypeKey === 'T02') taskUnitsCompleted = getRandomInt(1, 3); // Cases stocked
                     else if (task.taskTypeKey === 'T05') taskUnitsCompleted = getRandomInt(1, 4); // Customer interactions

                      // Simple quality score - trainees might score lower initially
                      let qualityScore = getRandomInt(3, 5);
                      if (employee.experienceLevel === 'Trainee' && Math.random() < 0.2) qualityScore = getRandomInt(2, 4);

                     // --- Zone --- (Assign plausible zone based on task)
                     let zoneKey = null; let zoneName = null;
                     const storeZoneOptions = storeZones.filter(z => !z.restricted);
                     if (task.category === 'Checkout') zoneKey = 'Z09';
                     else if (task.category === 'Stocking') zoneKey = Math.random() < 0.7 ? 'Z98' : 'Z02'; // Stock room or Fresh Produce area
                     else if (task.category === 'Merchandising') zoneKey = chooseRandom(['Z02', 'Z03', 'Z06', 'Z07', 'Z08']); // Aisles
                     else if (task.category === 'Customer Service') zoneKey = chooseRandom(['Z02', 'Z03', 'Z04', 'Z05', 'Z06', 'Z07', 'Z08']); // Public areas
                     else if (task.category === 'Maintenance') zoneKey = chooseRandom(storeZoneOptions.map(z => z.zoneKey));
                     else if (task.category === 'Admin') zoneKey = 'Z99'; // Manager office (or other if appropriate)
                     else zoneKey = 'Z01'; // Default to entrance/transition for break/idle?

                     const assignedZone = storeZones.find(z => z.zoneKey === zoneKey);
                     zoneName = assignedZone?.zoneName || 'Unknown Zone';


                      // --- Variance ---
                      const varianceMinutes = actualDurationMinutes - plannedDurationMinutes;

                     // --- Create Record ---
                     productivityData.push({
                        productivityLogId: `PLOG_${String(logCounter++).padStart(9, '0')}`,
                        dateKey: dateKey,
                        timeKey: format(actualStartTime, 'HH:mm:ss'), // Record actual start time key
                        hourOfDay: parseInt(format(actualStartTime, 'H')),
                        dayOfWeek: format(actualStartTime, 'EEEE'),
                        // Dimension Keys
                        employeeKey: employee.employeeKey,
                        locationKey: store.storeKey,
                        zoneKey: zoneKey,
                        taskTypeKey: task.taskTypeKey,
                        // Timestamps & Durations
                        plannedStartTime: plannedStartTime.toISOString(),
                        actualStartTime: actualStartTime.toISOString(),
                        plannedDurationMinutes: plannedDurationMinutes,
                        actualDurationMinutes: actualDurationMinutes,
                        actualEndTime: actualEndTime.toISOString(), // Added for potential analysis
                        // Measures
                        taskUnitsCompleted: taskUnitsCompleted,
                        qualityScore: qualityScore, // Optional: 1-5
                        varianceMinutes: varianceMinutes,
                        // Denormalized Fields
                        employeeName: employee.employeeName,
                        employeeRole: employee.roleName,
                        employeeExperience: employee.experienceLevel,
                        storeName: store.storeName,
                        zoneName: zoneName,
                        taskName: task.taskName,
                        taskCategory: task.category,
                        taskUnitName: task.unitName
                     });

                     // Move to the end of the current task for the next iteration
                     currentTimestamp = actualEndTime;
                     tasksDone++;

                 } // End while loop for shift

            } catch (loopError) {
                console.error(`Error generating productivity data for employee ${employee?.employeeKey}:`, loopError);
            }
        } // End employee loop
    } // End date loop

    console.log(`Generated ${productivityData.length} mock employee productivity records.`);
    // Data Cleaning
    const cleanData = productivityData.filter(d =>
        d.plannedDurationMinutes != null && isFinite(d.plannedDurationMinutes) &&
        d.actualDurationMinutes != null && isFinite(d.actualDurationMinutes) &&
        d.taskUnitsCompleted != null && isFinite(d.taskUnitsCompleted) &&
        d.varianceMinutes != null && isFinite(d.varianceMinutes)
    );
     if (cleanData.length !== productivityData.length) {
          console.warn(`Filtered out ${productivityData.length - cleanData.length} productivity records with invalid numeric values.`);
      }

    return cleanData.sort((a, b) => parseISO(a.actualStartTime) - parseISO(b.actualStartTime)); // Sort by actual start time
};