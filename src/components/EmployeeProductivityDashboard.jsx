// src/components/EmployeeProductivityDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Select, MenuItem, FormControl, InputLabel, Paper, Divider, CircularProgress, Alert, Chip, Tooltip as MuiTooltip, Button, useTheme, Skeleton, Tabs, Tab, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, TableSortLabel, TablePagination, Autocomplete, TextField, List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { subDays, format, parseISO, isValid, startOfDay, endOfDay, differenceInMinutes, getHours, eachDayOfInterval } from 'date-fns';

// MUI Icons
import GroupIcon from '@mui/icons-material/Group'; // Employee Team
import TaskAltIcon from '@mui/icons-material/TaskAlt'; // Task Completed
import TimerIcon from '@mui/icons-material/Timer'; // Duration
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm'; // Variance/Delay
import SpeedIcon from '@mui/icons-material/Speed'; // Efficiency/Rate
import StorefrontIcon from '@mui/icons-material/Storefront'; // Location
import MyLocationIcon from '@mui/icons-material/MyLocation'; // Zone
import BadgeIcon from '@mui/icons-material/Badge'; // Role
import PersonSearchIcon from '@mui/icons-material/PersonSearch'; // Employee Filter
import CategoryIcon from '@mui/icons-material/Category'; // Task Type
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

// Import data generators and common functions
import { generateMockEmployeeProductivityData, getMockEmployees, getMockEmployeeRoles, getMockTaskTypes } from '../utils/mockEmployeeProductivityGenerator';
import { getMockStores, getMockStoreZones } from '../utils/mockDataGenerator';

// --- Constants ---
const COLORS = ['#1976d2', '#4caf50', '#ff9800', '#ef5350', '#ab47bc', '#7e57c2', '#03a9f4', '#8bc34a', '#ffa726', '#5c6bc0'];
const POSITIVE_COLOR = '#ef5350'; // Red for positive variance (took longer)
const NEGATIVE_COLOR = '#4caf50'; // Green for negative variance (faster)
const REFRESH_INTERVAL_MS = 240000; // Refresh every 4 minutes

// --- Helper Functions ---
const formatDateTime = (isoString) => { try { const d = parseISO(isoString); return isValid(d) ? format(d, 'MMM d, HH:mm') : 'Invalid'; } catch { return 'Invalid'; } };
const formatDate = (isoString) => { try { const d = parseISO(isoString); return isValid(d) ? format(d, 'MMM d, yyyy') : 'Invalid'; } catch { return 'Invalid'; } };
const formatNumber = (value, digits = 0) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }); };
const formatDuration = (minutes) => { if (minutes === null || minutes === undefined || !isFinite(minutes)) return 'N/A'; const mins = Math.round(minutes); const h = Math.floor(mins / 60); const m = mins % 60; return `${h}h ${m}m`; };
const formatDurationMinutes = (minutes, digits = 0) => { if (minutes === null || minutes === undefined || !isFinite(minutes)) return 'N/A'; return `${formatNumber(minutes, digits)} min`; };
const formatDurationVariance = (minutes) => { if (minutes === null || minutes === undefined || !isFinite(minutes)) return 'N/A'; const symbol = minutes >= 0 ? '+' : ''; return `${symbol}${formatDurationMinutes(minutes, 0)}`; };
const formatPercentage = (value) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return `${(value * 100).toFixed(1)}%`; };
const formatTasksPerHour = (value) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return `${formatNumber(value, 1)} tasks/hr`; };

// --- Kpi Card Component ---
const KpiCard = ({ title, value, formatFunc = formatNumber, icon, loading, color = 'text.secondary', valueColor, tooltip, changeValue, changeFormatFunc = formatPercentage }) => (
    <MuiTooltip title={tooltip || ''} placement="top" arrow disableHoverListener={!tooltip}>
        <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                 <Typography sx={{ fontSize: 14, mb: 0.5 }} color="text.secondary" gutterBottom>{title}</Typography>
                 <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, mb: (changeValue !== undefined ? 0.5 : 0) }}>
                     {loading ? (<Skeleton variant="text" width="80%" height={30} />) : (
                         <>
                             {icon && React.cloneElement(icon, { sx: { mr: 1.5, color: color }, fontSize: "medium" })}
                             <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: valueColor || color, lineHeight: 1.2 }}>
                                 {(value !== null && value !== undefined && (typeof value !== 'number' || isFinite(value))) ? formatFunc(value) : 'N/A'}
                             </Typography>
                         </>
                     )}
                 </Box>
                  {/* Optional Change Indicator */}
                  {!loading && changeValue !== undefined && (
                     <Typography variant="caption" color={changeValue >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR} sx={{ alignSelf: 'flex-end' }}>
                         {changeValue >= 0 ? '+' : ''}{changeFormatFunc(changeValue)} vs Prev.
                     </Typography>
                  )}
             </CardContent>
        </Card>
    </MuiTooltip>
);


// --- Main Component ---
const EmployeeProductivityDashboard = () => {
    const theme = useTheme();

    // --- State ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [productivityData, setProductivityData] = useState([]);
    const [dateRange, setDateRange] = useState([startOfDay(subDays(new Date(), 6)), endOfDay(new Date())]); // Default 7 days
    const [selectedLocation, setSelectedLocation] = useState('ALL');
    const [selectedZone, setSelectedZone] = useState('ALL');
    const [selectedRole, setSelectedRole] = useState('ALL');
    const [selectedEmployeeKey, setSelectedEmployeeKey] = useState('ALL'); // Store key for uniqueness
    const [selectedTaskType, setSelectedTaskType] = useState('ALL');
    const [tablePage, setTablePage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [orderBy, setOrderBy] = useState('actualStartTime');
    const [order, setOrder] = useState('desc');
    const [lastRefreshed, setLastRefreshed] = useState(null);

    // --- Dimensions ---
    const locations = useMemo(() => [{ storeKey: 'ALL', storeName: 'All Locations' }, ...getMockStores()], []);
    const zones = useMemo(() => [{ zoneKey: 'ALL', zoneName: 'All Zones' }, ...getMockStoreZones().filter(z => !z.restricted)], []); // Exclude restricted
    const roles = useMemo(() => [{ roleId: 'ALL', roleName: 'All Roles' }, ...getMockEmployeeRoles()], []);
    const taskTypes = useMemo(() => [{ taskTypeKey: 'ALL', taskName: 'All Task Types' }, ...getMockTaskTypes()], []);
    // Employee list depends on selected location
    const employees = useMemo(() => {
        const allEmployees = getMockEmployees();
        const filtered = selectedLocation === 'ALL'
            ? allEmployees
            : allEmployees.filter(e => e.storeKey === selectedLocation);
        return [{ employeeKey: 'ALL', employeeName: 'All Employees' }, ...filtered];
    }, [selectedLocation]);


    // --- Data Fetching ---
    const fetchData = useCallback(async (isInitialLoad = false) => {
        if (!isInitialLoad) console.log(`Refreshing productivity data at ${new Date().toLocaleTimeString()}...`);
        else console.log("Initial productivity data fetch...");
        setError(null); setLoading(true);
        const [start, end] = dateRange;
        if (!isValid(start) || !isValid(end)) { setError("Invalid date range."); setLoading(false); return; }

        let isMounted = true;
        try {
            await new Promise(res => setTimeout(res, 1000)); // Simulate API delay
            const data = generateMockEmployeeProductivityData(start, end);

            if (!isMounted) return;
            if (!Array.isArray(data)) throw new Error("Mock data generation failed.");

            setProductivityData(data);
            setLastRefreshed(new Date());
        } catch (err) {
            if (!isMounted) return;
            console.error("Error loading productivity data:", err);
            setError(`Failed to load data: ${err.message}`);
            setProductivityData([]);
        } finally {
            if (isMounted) setLoading(false);
        }
        return () => { isMounted = false; };
    }, [dateRange]);

    useEffect(() => {
        fetchData(true);
        const intervalId = setInterval(() => fetchData(false), REFRESH_INTERVAL_MS);
        return () => clearInterval(intervalId);
    }, [fetchData]);

    // Reset employee filter if location changes and selected employee is no longer valid
    useEffect(() => {
        const selectedEmployeeExistsInLocation = employees.some(emp => emp.employeeKey === selectedEmployeeKey);
        if (selectedEmployeeKey !== 'ALL' && !selectedEmployeeExistsInLocation) {
            setSelectedEmployeeKey('ALL');
        }
    }, [selectedLocation, employees, selectedEmployeeKey]);


    // --- Filtered Data ---
    const filteredData = useMemo(() => {
        return productivityData.filter(log =>
            (selectedLocation === 'ALL' || log.locationKey === selectedLocation) &&
            (selectedZone === 'ALL' || log.zoneKey === selectedZone) &&
            (selectedRole === 'ALL' || log.employeeRole === roles.find(r=>r.roleId === selectedRole)?.roleName) && // Match by name if roleId filter used
            (selectedEmployeeKey === 'ALL' || log.employeeKey === selectedEmployeeKey) &&
            (selectedTaskType === 'ALL' || log.taskTypeKey === selectedTaskType)
            // Note: We keep non-productive tasks here for the main table log
        );
    }, [productivityData, selectedLocation, selectedZone, selectedRole, selectedEmployeeKey, selectedTaskType, roles]);

     // Data excluding non-productive tasks for specific KPIs/Charts
     const productiveData = useMemo(() => filteredData.filter(d => d.taskCategory !== 'Non-Productive'), [filteredData]);


    // --- KPI Calculations ---
    const kpiData = useMemo(() => {
         if (!productiveData || productiveData.length === 0) {
             return { totalTasks: 0, avgTaskDuration: 0, avgVariance: 0, totalProductiveHours: 0, topTask: 'N/A', bottomTaskVar: 'N/A', topRoleTasks: 'N/A'};
         }

         let totalTasks = productiveData.length;
         let totalActualDuration = 0;
         let totalVariance = 0;
         const taskCounts = {};
         const taskVarianceSum = {};
         const taskVarianceCount = {};
         const roleTaskCounts = {};


         productiveData.forEach(d => {
             totalActualDuration += d.actualDurationMinutes || 0;
             totalVariance += d.varianceMinutes || 0;

             // Count tasks
             taskCounts[d.taskName] = (taskCounts[d.taskName] || 0) + 1;

             // Sum variance per task type
             taskVarianceSum[d.taskName] = (taskVarianceSum[d.taskName] || 0) + (d.varianceMinutes || 0);
             taskVarianceCount[d.taskName] = (taskVarianceCount[d.taskName] || 0) + 1;

             // Count tasks per role
             if (d.employeeRole) { // Ensure role is defined
                roleTaskCounts[d.employeeRole] = (roleTaskCounts[d.employeeRole] || 0) + 1;
             }

         });

         const avgTaskDuration = totalTasks > 0 ? totalActualDuration / totalTasks : 0;
         const avgVariance = totalTasks > 0 ? totalVariance / totalTasks : 0;
         const totalProductiveHours = totalActualDuration / 60;

         const findTop = (counts) => Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
         // Find task with highest *average* positive variance (slowest relative to plan)
         const findBottomTaskVar = () => {
              return Object.entries(taskVarianceSum)
                  .map(([name, sum]) => ({ name, avgVar: taskVarianceCount[name] > 0 ? sum / taskVarianceCount[name] : 0 }))
                  .filter(t => taskVarianceCount[t.name] > 2) // Require a few instances
                  .sort((a, b) => b.avgVar - a.avgVar)[0]?.name || 'N/A'; // Highest average variance first
         }


         return {
             totalTasks: totalTasks,
             avgTaskDuration: isFinite(avgTaskDuration) ? avgTaskDuration : 0,
             avgVariance: isFinite(avgVariance) ? avgVariance : 0, // Overall avg variance
             totalProductiveHours: isFinite(totalProductiveHours) ? totalProductiveHours : 0,
             topTask: findTop(taskCounts), // Most frequent task
             bottomTaskVar: findBottomTaskVar(), // Task type taking longest vs plan
             topRoleTasks: findTop(roleTaskCounts), // Role completing most tasks

         };
     }, [productiveData]);

    // --- Chart Data Aggregations ---

    // Tasks Completed Trend (Daily)
    const tasksTrendData = useMemo(() => {
        if (!productiveData || productiveData.length === 0) return [];
        const groupedByDate = productiveData.reduce((acc, d) => {
            const dateKey = d.dateKey;
            if (!dateKey) return acc;
            acc[dateKey] = (acc[dateKey] || 0) + 1; // Count tasks
            return acc;
        }, {});

        return Object.entries(groupedByDate)
            .map(([date, count]) => ({
                date: date,
                taskCount: count,
                displayDate: formatDate(date)
            }))
            .sort((a, b) => parseISO(a.date) - parseISO(b.date));
    }, [productiveData]);


    // Avg Duration Variance Trend (Daily)
    const varianceTrendData = useMemo(() => {
        if (!productiveData || productiveData.length === 0) return [];
         const grouped = productiveData.reduce((acc, d) => {
             const dateKey = d.dateKey;
             if (!dateKey) return acc;
             if (!acc[dateKey]) {
                 acc[dateKey] = { totalVariance: 0, count: 0 };
             }
             acc[dateKey].totalVariance += d.varianceMinutes || 0;
             acc[dateKey].count++;
             return acc;
         }, {});

         return Object.entries(grouped)
             .map(([date, data]) => ({
                 date: date,
                 avgVariance: data.count > 0 ? parseFloat((data.totalVariance / data.count).toFixed(1)) : 0,
                 displayDate: formatDate(date)
             }))
             .sort((a, b) => parseISO(a.date) - parseISO(b.date));
    }, [productiveData]);


    // Tasks by Type (Count)
    const tasksByTypeData = useMemo(() => {
        if (!productiveData || productiveData.length === 0) return [];
        const grouped = productiveData.reduce((acc, d) => {
            const key = d.taskName || 'Unknown Task';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
         const total = productiveData.length;
         return Object.entries(grouped)
            .map(([name, value]) => ({ name, value, percentage: total > 0 ? value / total : 0 }))
            .sort((a, b) => b.value - a.value);
    }, [productiveData]);

    // Tasks by Role (Count)
    const tasksByRoleData = useMemo(() => {
        if (!productiveData || productiveData.length === 0) return [];
        const grouped = productiveData.reduce((acc, d) => {
            const key = d.employeeRole || 'Unknown Role';
             if(key !== 'Unknown Role') { // Only count if role is known
                acc[key] = (acc[key] || 0) + 1;
             }
            return acc;
        }, {});
        return Object.entries(grouped)
            .map(([name, value]) => ({ name, value }))
            .filter(d => d.value > 0)
            .sort((a, b) => b.value - a.value);
    }, [productiveData]);

    // Avg Variance by Role (Corrected)
    const varianceByRoleData = useMemo(() => {
        if (!productiveData || productiveData.length === 0) return [];
        const grouped = productiveData.reduce((acc, d) => {
             const key = d.employeeRole || 'Unknown Role';
             if (key !== 'Unknown Role') { // Only group if role is known
                 if (!acc[key]) {
                     acc[key] = { totalVariance: 0, count: 0 }; // Keep track of count here
                 }
                 acc[key].totalVariance += d.varianceMinutes || 0;
                 acc[key].count++;
             }
             return acc;
         }, {});

         return Object.entries(grouped)
             .map(([name, data]) => ({
                 name,
                 avgVariance: data.count > 0 ? parseFloat((data.totalVariance / data.count).toFixed(1)) : 0,
                 count: data.count // Keep count for filtering
             }))
             .filter(d => d.count > 0) // Filter out roles with zero tasks *after* mapping
             .sort((a, b) => a.avgVariance - b.avgVariance); // Sort by variance (lowest first)
     }, [productiveData]);


     // Hourly Productivity Pattern (Avg Tasks Completed)
     const hourlyProductivityData = useMemo(() => {
        if (!productiveData || productiveData.length === 0) return Array(24).fill(0).map((_, hour) => ({ hour: `${String(hour).padStart(2, '0')}:00`, avgTasks: 0 }));

         const hourlyAggregates = productiveData.reduce((acc, d) => {
             const hour = d.hourOfDay;
             if (hour != null && hour >= 0 && hour < 24) {
                 if (!acc[hour]) {
                     acc[hour] = { taskCount: 0, daysActive: new Set() }; // Track unique days data exists for this hour
                 }
                 acc[hour].taskCount++;
                 acc[hour].daysActive.add(d.dateKey);
             }
             return acc;
         }, {});

          // Calculate average per active day for the hour
          return Array.from({ length: 24 }, (_, hour) => {
              const aggregate = hourlyAggregates[hour];
              const activeDays = aggregate ? aggregate.daysActive.size : 0;
              return {
                  hour: `${String(hour).padStart(2, '0')}:00`,
                  avgTasks: (aggregate && activeDays > 0) ? parseFloat((aggregate.taskCount / activeDays).toFixed(1)) : 0
              };
          });

     }, [productiveData]);


    // --- Table Logic ---
     const handleRequestSort = useCallback((property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    }, [order, orderBy]);

    const descendingComparator = useCallback((a, b, orderByField) => {
        let valA = a[orderByField]; let valB = b[orderByField];
        if (valA == null && valB == null) return 0; if (valA == null) return 1; if (valB == null) return -1;
        if (orderByField.includes('Time')) { try { valA = parseISO(valA); valB = parseISO(valB); } catch(e){} } // Handle timestamps
        if (typeof valA === 'string' && typeof valB === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
        if (valB < valA) return -1; if (valB > valA) return 1; return 0;
    }, []);

     const getComparator = useCallback((currentOrder, currentOrderBy) => {
        return currentOrder === 'desc'
            ? (a, b) => descendingComparator(a, b, currentOrderBy)
            : (a, b) => -descendingComparator(a, b, currentOrderBy);
    }, [descendingComparator]);

     const stableSort = useCallback((array, comparator) => {
        const stabilizedThis = array.map((el, index) => [el, index]);
        stabilizedThis.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) return order;
            return a[1] - b[1];
        });
        return stabilizedThis.map((el) => el[0]);
    }, []);


    const sortedData = useMemo(() => stableSort(filteredData, getComparator(order, orderBy)),
        [filteredData, order, orderBy, stableSort, getComparator]); // Use filteredData for table (includes non-prod)

    const handleChangePage = (event, newPage) => setTablePage(newPage);
    const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setTablePage(0); };

    const currentTableData = useMemo(() => sortedData.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage), [sortedData, tablePage, rowsPerPage]);
    const emptyRows = useMemo(() => Math.max(0, rowsPerPage - currentTableData.length), [currentTableData.length, rowsPerPage]);


    // --- Filter Reset ---
    const handleClearFilters = () => {
        setSelectedLocation('ALL');
        setSelectedZone('ALL');
        setSelectedRole('ALL');
        setSelectedEmployeeKey('ALL');
        setSelectedTaskType('ALL');
    };

    // --- Render Logic ---
    const chartPaperHeight = '380px';

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
                {/* Header */}
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0 }}>
                        Employee Productivity Analysis
                    </Typography>
                     <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        {loading && <CircularProgress size={16} />}
                        {lastRefreshed && (
                            <MuiTooltip title={`Last refreshed: ${format(lastRefreshed, 'HH:mm:ss')}`}>
                                <Typography variant="caption" color="text.secondary">
                                    <UpdateIcon sx={{ fontSize: '0.9rem', verticalAlign: 'middle', mr: 0.5 }} />
                                     {format(lastRefreshed, 'HH:mm')}
                                 </Typography>
                             </MuiTooltip>
                         )}
                     </Box>
                </Box>

                {/* Filters */}
                 <Paper elevation={2} sx={{ p: { xs: 1, sm: 2 }, mb: 3 }}>
                     <Grid container spacing={2} alignItems="center">
                         {/* Location Filter */}
                         <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth variant="outlined" size="small">
                                <InputLabel>Location</InputLabel>
                                <Select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} label="Location" disabled={loading}>
                                    {locations.map(loc => <MenuItem key={loc.storeKey} value={loc.storeKey}>{loc.storeName}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                         {/* Zone Filter */}
                         <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth variant="outlined" size="small">
                                <InputLabel>Zone</InputLabel>
                                <Select value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)} label="Zone" disabled={loading || zones.length <= 1}>
                                    {zones.map(z => <MenuItem key={z.zoneKey} value={z.zoneKey}>{z.zoneName}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                         {/* Role Filter */}
                         <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth variant="outlined" size="small">
                                <InputLabel>Role</InputLabel>
                                <Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} label="Role" disabled={loading}>
                                    {roles.map(r => <MenuItem key={r.roleId} value={r.roleId}>{r.roleName}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                          {/* Employee Filter (Autocomplete) */}
                         <Grid item xs={12} sm={6} md={2}>
                             <Autocomplete
                                 size="small"
                                 options={employees}
                                 getOptionLabel={(option) => option.employeeName || ""}
                                 value={employees.find(emp => emp.employeeKey === selectedEmployeeKey) || null}
                                 onChange={(event, newValue) => {
                                     setSelectedEmployeeKey(newValue ? newValue.employeeKey : 'ALL');
                                 }}
                                 isOptionEqualToValue={(option, value) => option.employeeKey === value.employeeKey}
                                 renderInput={(params) => <TextField {...params} label="Employee" variant="outlined" />}
                                 disabled={loading || employees.length <= 1}
                            />
                        </Grid>
                         {/* Task Type Filter */}
                         <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth variant="outlined" size="small">
                                <InputLabel>Task Type</InputLabel>
                                <Select value={selectedTaskType} onChange={(e) => setSelectedTaskType(e.target.value)} label="Task Type" disabled={loading}>
                                    {taskTypes.map(t => <MenuItem key={t.taskTypeKey} value={t.taskTypeKey}>{t.taskName}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                         {/* Date Range Filter */}
                         <Grid item xs={12} sm={9} md={1.5}>
                             <DateRangePicker
                                localeText={{ start: "Start Date", end: "End Date" }}
                                value={dateRange}
                                onChange={(r) => { if (r && r.length === 2 && isValid(r[0]) && isValid(r[1])) { setDateRange([startOfDay(r[0]), endOfDay(r[1])]); } }}
                                slotProps={{ textField: { variant: 'outlined', size: 'small', fullWidth: true } }}
                                disabled={loading}
                            />
                        </Grid>
                         {/* Clear Filters Button */}
                         <Grid item xs={12} sm={3} md={0.5} sx={{ textAlign: 'right' }}>
                             <Button
                                 variant="outlined"
                                 size="small"
                                 onClick={handleClearFilters}
                                 startIcon={<FilterListOffIcon />}
                                 disabled={loading || (selectedLocation === 'ALL' && selectedZone === 'ALL' && selectedRole === 'ALL' && selectedEmployeeKey === 'ALL' && selectedTaskType === 'ALL')}
                                 sx={{ height: '40px', minWidth: 'auto', px: 1 }} // Compact clear button
                                 title="Clear Filters"
                             >
                                 {/* Clear */}
                             </Button>
                         </Grid>
                    </Grid>
                </Paper>

                {/* Error Display */}
                {error && !loading && ( <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert> )}

                {/* KPIs */}
                 <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={4} md={1.7}><KpiCard title="Total Tasks" value={kpiData.totalTasks} icon={<TaskAltIcon />} loading={loading} color="primary.main" tooltip="Total productive tasks completed" /></Grid>
                    <Grid item xs={6} sm={4} md={1.7}><KpiCard title="Avg Task Duration" value={kpiData.avgTaskDuration} formatFunc={formatDurationMinutes} icon={<TimerIcon />} loading={loading} color="info.main" tooltip="Average actual time spent per task" /></Grid>
                    <Grid item xs={6} sm={4} md={1.7}><KpiCard title="Avg Duration Var." value={kpiData.avgVariance} formatFunc={formatDurationVariance} icon={<AccessAlarmIcon />} loading={loading} color={kpiData.avgVariance > 2 ? POSITIVE_COLOR : (kpiData.avgVariance < -2 ? NEGATIVE_COLOR : 'text.secondary')} tooltip="Average difference: Actual vs Planned duration (+ means longer)" /></Grid>
                    <Grid item xs={6} sm={4} md={1.7}><KpiCard title="Total Prod. Hours" value={kpiData.totalProductiveHours} formatFunc={(v)=> `${formatNumber(v,1)} hrs`} icon={<GroupIcon />} loading={loading} color="success.dark" tooltip="Sum of actual duration for all productive tasks" /></Grid>
                    <Grid item xs={6} sm={4} md={1.7}><KpiCard title="Most Frequent Task" value={kpiData.topTask} formatFunc={(v) => v} icon={<CategoryIcon />} loading={loading} color="secondary.main" tooltip="Task type completed most often" /></Grid>
                    <Grid item xs={6} sm={4} md={1.7}><KpiCard title="Slowest Task (Avg Var)" value={kpiData.bottomTaskVar} formatFunc={(v) => v} icon={<TrendingUpIcon />} loading={loading} color={POSITIVE_COLOR} tooltip="Task type with highest positive avg variance (Actual - Planned)" /></Grid>
                    {/* UNCOMMENTED KPI */}
                    <Grid item xs={6} sm={4} md={1.7}><KpiCard title="Top Role (Tasks)" value={kpiData.topRoleTasks} formatFunc={(v) => v} icon={<BadgeIcon />} loading={loading} color="purple" tooltip="Employee role completing the most tasks" /></Grid>
                 </Grid>

                {/* Charts */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    {/* Tasks Completed Trend */}
                    <Grid item xs={12} md={6}>
                         <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Daily Tasks Completed</Typography>
                            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    {loading ? <Skeleton variant="rectangular" height="100%" /> : tasksTrendData.length > 0 ? (
                                        <BarChart data={tasksTrendData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                            <XAxis dataKey="displayDate" fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                            <YAxis fontSize={10} tick={{ fill: theme.palette.text.secondary }}/>
                                            <Tooltip formatter={(value) => [formatNumber(value,0), "Tasks"]}/>
                                            <Bar dataKey="taskCount" name="Tasks" fill={theme.palette.primary.light} />
                                        </BarChart>
                                    ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No task data.</Typography></Box>)}
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>
                     {/* Avg Duration Variance Trend */}
                    <Grid item xs={12} md={6}>
                         <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                             <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Avg. Daily Duration Variance (Actual - Plan)</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                 <ResponsiveContainer width="100%" height="100%">
                                     {loading ? <Skeleton variant="rectangular" height="100%" /> : varianceTrendData.length > 0 ? (
                                         <LineChart data={varianceTrendData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                                             <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                             <XAxis dataKey="displayDate" fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                             <YAxis fontSize={10} tick={{ fill: theme.palette.text.secondary }} unit="m" />
                                             <Tooltip formatter={(value) => [formatDurationVariance(value), "Avg Variance"]}/>
                                             <Legend />
                                             <Line type="monotone" dataKey="avgVariance" name="Avg Variance" stroke={theme.palette.warning.main} strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                                             {/* Add reference line at y=0 */}
                                             <Line type="monotone" dataKey="zero" stroke={theme.palette.text.disabled} strokeDasharray="5 5" dot={false} name="Planned" legendType="none" />
                                         </LineChart>
                                     ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No variance data.</Typography></Box>)}
                                 </ResponsiveContainer>
                             </Box>
                         </Paper>
                     </Grid>

                     {/* Tasks by Type */}
                     <Grid item xs={12} md={4}>
                        <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Tasks by Type</Typography>
                            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                     {loading ? <Skeleton variant="rectangular" height="100%" /> : tasksByTypeData.length > 0 ? (
                                        <PieChart>
                                            <Pie data={tasksByTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" labelLine={false} label={({ name, percentage }) => percentage > 0.03 ? `${name}: ${formatPercentage(percentage)}` : ''}>
                                                 {tasksByTypeData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                            </Pie>
                                            <Tooltip formatter={(value, name, props) => [`${formatNumber(value, 0)} tasks (${formatPercentage(props.payload.percentage)})`, name]} />
                                            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: '10px' }} />
                                        </PieChart>
                                     ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No task type data.</Typography></Box>)}
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>

                     {/* Tasks by Role */}
                     <Grid item xs={12} md={4}>
                         <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Tasks Completed by Role</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    {loading ? <Skeleton variant="rectangular" height="100%" /> : tasksByRoleData.length > 0 ? (
                                        <BarChart data={tasksByRoleData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider}/>
                                            <XAxis type="number" fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                            <YAxis dataKey="name" type="category" width={80} interval={0} fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                            <Tooltip formatter={(value) => [formatNumber(value, 0), "Tasks Completed"]}/>
                                            <Bar dataKey="value" name="Tasks Completed" >
                                                 {tasksByRoleData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />)}
                                            </Bar>
                                        </BarChart>
                                    ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No role data.</Typography></Box>)}
                                </ResponsiveContainer>
                            </Box>
                         </Paper>
                     </Grid>

                      {/* Avg Variance by Role */}
                      <Grid item xs={12} md={4}>
                         <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Avg. Duration Variance by Role</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    {loading ? <Skeleton variant="rectangular" height="100%" /> : varianceByRoleData.length > 0 ? (
                                        <BarChart data={varianceByRoleData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider}/>
                                            <XAxis type="number" fontSize={10} tick={{ fill: theme.palette.text.secondary }} unit="m" domain={['dataMin - 2', 'dataMax + 2']}/>
                                            <YAxis dataKey="name" type="category" width={80} interval={0} fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                            <Tooltip formatter={(value) => [formatDurationVariance(value), "Avg Variance"]}/>
                                            <Bar dataKey="avgVariance" name="Avg Variance">
                                                {varianceByRoleData.map((entry, index) => (
                                                     <Cell key={`cell-${index}`} fill={entry.avgVariance > 2 ? POSITIVE_COLOR : (entry.avgVariance < -2 ? NEGATIVE_COLOR : theme.palette.info.light)} />
                                                 ))}
                                            </Bar>
                                        </BarChart>
                                    ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No variance data.</Typography></Box>)}
                                </ResponsiveContainer>
                            </Box>
                         </Paper>
                     </Grid>
                </Grid>

                {/* Details Table */}
                <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }, overflow: 'hidden' }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>Productivity Log Details</Typography>
                     <TableContainer sx={{ maxHeight: 600 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                     {[
                                        { id: 'actualStartTime', label: 'Time Start', minWidth: 100 },
                                        { id: 'employeeName', label: 'Employee', minWidth: 110 },
                                        { id: 'employeeRole', label: 'Role', minWidth: 80 },
                                        { id: 'locationName', label: 'Location', minWidth: 100 },
                                        { id: 'zoneName', label: 'Zone', minWidth: 90 },
                                        { id: 'taskName', label: 'Task', minWidth: 130 },
                                        { id: 'plannedDurationMinutes', label: 'Plan Dur.', minWidth: 60, align: 'right' },
                                        { id: 'actualDurationMinutes', label: 'Actual Dur.', minWidth: 60, align: 'right' },
                                        { id: 'varianceMinutes', label: 'Variance', minWidth: 60, align: 'right' },
                                        { id: 'taskUnitsCompleted', label: 'Units', minWidth: 50, align: 'right'},
                                        { id: 'taskUnitName', label: 'Unit Name', minWidth: 60},
                                        { id: 'qualityScore', label: 'Quality', minWidth: 50, align: 'center'}, // Optional
                                     ].map((headCell) => (
                                        <TableCell key={headCell.id} align={headCell.align || 'left'} sortDirection={orderBy === headCell.id ? order : false} sx={{ py: 0.8, minWidth: headCell.minWidth, backgroundColor: 'grey.100', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                            <TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : 'asc'} onClick={() => handleRequestSort(headCell.id)}>
                                                {headCell.label}
                                            </TableSortLabel>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                             <TableBody>
                                {loading ? (
                                     Array.from(new Array(rowsPerPage)).map((_, index) => (
                                         <TableRow key={`skel-${index}`}><TableCell colSpan={12}><Skeleton animation="wave" /></TableCell></TableRow>
                                     ))
                                ) : sortedData.length === 0 ? (
                                    <TableRow><TableCell colSpan={12} align="center" sx={{ py: 3 }}>No productivity data matches filters.</TableCell></TableRow>
                                ) : (
                                    currentTableData.map((row) => (
                                        <TableRow hover key={row.productivityLogId} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '& td': { fontSize: '0.75rem', py: 0.4 } }}>
                                            <TableCell>{formatDateTime(row.actualStartTime)}</TableCell>
                                            <TableCell>{row.employeeName}</TableCell>
                                            <TableCell>{row.employeeRole}</TableCell>
                                            <TableCell>{row.storeName}</TableCell>
                                            <TableCell>{row.zoneName}</TableCell>
                                            <TableCell>{row.taskName}</TableCell>
                                            <TableCell align="right">{formatDurationMinutes(row.plannedDurationMinutes)}</TableCell>
                                            <TableCell align="right">{formatDurationMinutes(row.actualDurationMinutes)}</TableCell>
                                             <TableCell align="right" sx={{ color: row.varianceMinutes > 2 ? POSITIVE_COLOR : (row.varianceMinutes < -2 ? NEGATIVE_COLOR : 'inherit'), fontWeight: Math.abs(row.varianceMinutes) > 10 ? 'bold' : 'normal' }}>
                                                 {formatDurationVariance(row.varianceMinutes)}
                                             </TableCell>
                                            <TableCell align="right">{formatNumber(row.taskUnitsCompleted, 0)}</TableCell>
                                            <TableCell>{row.taskUnitName}</TableCell>
                                            <TableCell align="center">{row.qualityScore || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                                {/* Empty rows */}
                                {!loading && sortedData.length > 0 && emptyRows > 0 && (
                                    <TableRow style={{ height: 29 * emptyRows }}><TableCell colSpan={12} /></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                     {/* Pagination */}
                    {!loading && sortedData.length > 0 && (
                        <TablePagination
                            rowsPerPageOptions={[15, 30, 50]}
                            component="div"
                            count={sortedData.length}
                            rowsPerPage={rowsPerPage}
                            page={tablePage}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                             sx={{ '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows, .MuiTablePagination-actions': { mb: 0, fontSize: '0.8rem' } }}
                        />
                    )}
                </Paper>

            </Box>
        </LocalizationProvider>
    );
};

export default EmployeeProductivityDashboard;