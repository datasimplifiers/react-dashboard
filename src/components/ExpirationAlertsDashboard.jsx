import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Select, MenuItem, FormControl, InputLabel, Paper, Divider, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TableSortLabel, TablePagination, CircularProgress, Alert, Chip, Tooltip as MuiTooltip, Button, useTheme, Autocomplete, TextField, Slider
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO, isValid, startOfDay, addDays } from 'date-fns';

// MUI Icons
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import CategoryIcon from '@mui/icons-material/Category';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'; // For Expired
import ScheduleIcon from '@mui/icons-material/Schedule'; // For Nearing Expiry

// Import mock data generator
import { generateMockInventoryData } from '../utils/mockInventoryDataGenerator'; // Adjust path

const COLORS = ['#FF8042', '#FFBB28', '#00C49F', '#0088FE', '#8884D8']; // Colors for pie chart/risk levels
const EXPIRY_THRESHOLDS = [
    { value: -1, label: 'Already Expired (< 0 days)', color: '#d32f2f', icon: <ErrorOutlineIcon fontSize="small"/> }, // Error color
    { value: 7, label: 'Within 7 Days', color: '#ed6c02', icon: <WarningAmberIcon fontSize="small"/> }, // Warning color
    { value: 14, label: 'Within 14 Days', color: '#ff9800', icon: <ScheduleIcon fontSize="small"/> }, // Orange
    { value: 30, label: 'Within 30 Days', color: '#ffc107', icon: <ScheduleIcon fontSize="small"/> }, // Amber
];

// --- Helper Functions ---
const formatCurrency = (value) => `EGP ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatDate = (isoString) => { try { const d = parseISO(isoString); return isValid(d) ? format(d, 'MMM d, yyyy') : 'Invalid Date'; } catch { return 'Error Date'; } };

// Get styling based on days to expiration
const getExpiryRiskStyle = (days, theme) => {
    if (days < 0) return { backgroundColor: theme.palette.error.light + '40', color: theme.palette.error.dark, icon: <ErrorOutlineIcon fontSize="inherit" color="error"/>, label: 'Expired' };
    if (days <= 7) return { backgroundColor: theme.palette.warning.light + '40', color: theme.palette.warning.dark, icon: <WarningAmberIcon fontSize="inherit" color="warning"/>, label: '<= 7 Days' };
    if (days <= 14) return { backgroundColor: theme.palette.info.light + '40', color: theme.palette.info.dark, icon: <ScheduleIcon fontSize="inherit" color="info"/>, label: '<= 14 Days' };
    if (days <= 30) return { backgroundColor: theme.palette.grey[200], color: theme.palette.text.secondary, icon: <ScheduleIcon fontSize="inherit" color="disabled"/>, label: '<= 30 Days' };
    return { backgroundColor: 'transparent', color: theme.palette.text.primary, icon: null, label: '> 30 Days' }; // Default/Fresh
};

// Component for displaying KPI (Simplified for this dashboard)
const InfoCard = ({ title, value, formatFunc = (v) => v.toLocaleString(), icon, bgColor = '#f3f6f9', borderColor = '#607d8b' }) => (
    <Card elevation={2} sx={{ backgroundColor: bgColor, borderLeft: `4px solid ${borderColor}`, height: '100%' }}>
        <CardContent sx={{p: {xs: 1, sm: 1.5}}}>
            <Typography color="textSecondary" sx={{ fontSize: '0.8rem', mb: 0.5 }}>{title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {icon && React.cloneElement(icon, { sx: { mr: 1, color: borderColor, fontSize: '1.5rem' } })}
                <Typography variant="h6" component="div">{formatFunc(value)}</Typography>
            </Box>
        </CardContent>
    </Card>
);

// --- Main Component ---
const ExpirationAlertsDashboard = () => {
    const theme = useTheme();

    // State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [allInventoryData, setAllInventoryData] = useState([]);
    const [currentDate] = useState(startOfDay(new Date())); // Use today's date as reference

    // Filters
    const [selectedLocations, setSelectedLocations] = useState([]); // Array for multi-select
    const [selectedCategories, setSelectedCategories] = useState([]); // Array for multi-select
    const [selectedThreshold, setSelectedThreshold] = useState(14); // Default to show <= 14 days

    // Table State
    const [tablePage, setTablePage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [orderBy, setOrderBy] = useState('daysToExpiration'); // Default sort by urgency
    const [order, setOrder] = useState('asc'); // Ascending days (most urgent first)

    // Dimension Data for Filters
    const locations = useMemo(() => {
        if (!allInventoryData.length) return [];
        const uniqueLocs = [...new Map(allInventoryData.map(item => [item.locationKey, { locationKey: item.locationKey, locationName: item.locationName }])).values()];
        return uniqueLocs.sort((a, b) => a.locationName.localeCompare(b.locationName));
    }, [allInventoryData]);

    const categories = useMemo(() => {
         if (!allInventoryData.length) return [];
        const uniqueCats = [...new Set(allInventoryData.map(item => item.categoryName || 'Unknown'))];
        return uniqueCats.sort();
    }, [allInventoryData]);


    // --- Data Fetching Simulation ---
    useEffect(() => {
        setLoading(true);
        setError(null);
        console.log("Initiating inventory data fetch effect...");
        setTimeout(() => {
            try {
                const data = generateMockInventoryData(currentDate);
                if (!Array.isArray(data)) throw new Error("Inventory data generation failed.");
                setAllInventoryData(data);
                setLoading(false);
            } catch (err) {
                console.error("Error generating inventory data:", err);
                setError(`Failed to load inventory data: ${err.message}`);
                setAllInventoryData([]);
                setLoading(false);
            }
        }, 800); // Slightly shorter delay maybe
    }, [currentDate]); // Refetch if currentDate were dynamic (it's fixed here)

    // --- Filtering Logic ---
    const filteredInventoryData = useMemo(() => {
        console.log(`Filtering inventory. Threshold: <= ${selectedThreshold} days`);
        if (!allInventoryData.length) return [];

        const filtered = allInventoryData.filter(item => {
            if (!item || item.daysToExpiration === undefined || item.daysToExpiration === null) return false;

            // Apply Expiry Threshold Filter (<= selected value)
            const expiryMatch = item.daysToExpiration <= selectedThreshold;

            // Apply Location Filter (if any selected)
            const locationMatch = selectedLocations.length === 0 || selectedLocations.some(loc => loc.locationKey === item.locationKey);

            // Apply Category Filter (if any selected)
            const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(item.categoryName);

            return expiryMatch && locationMatch && categoryMatch;
        });
        console.log(`Finished filtering. ${filtered.length} items match.`);
        return filtered;
    }, [allInventoryData, selectedLocations, selectedCategories, selectedThreshold]);

    // --- KPI Calculations ---
    const kpiData = useMemo(() => {
        if (!filteredInventoryData.length) return { qtyAtRisk: 0, valueAtRisk: 0, skusAtRisk: 0, locationsAffected: 0 };

        let qtyAtRisk = 0;
        let valueAtRisk = 0;
        const skus = new Set();
        const locs = new Set();

        filteredInventoryData.forEach(item => {
             if (typeof item.onHandQuantity === 'number' && isFinite(item.onHandQuantity)) qtyAtRisk += item.onHandQuantity;
             if (typeof item.onHandValue === 'number' && isFinite(item.onHandValue)) valueAtRisk += item.onHandValue;
             if (item.sku) skus.add(item.sku);
             if (item.locationKey) locs.add(item.locationKey);
        });

        return {
            qtyAtRisk,
            valueAtRisk,
            skusAtRisk: skus.size,
            locationsAffected: locs.size
        };
    }, [filteredInventoryData]);


    // --- Chart Data --- (Example: Value at Risk by Category)
    const valueRiskByCategory = useMemo(() => {
        if (!filteredInventoryData.length) return [];
        const valueByCategory = filteredInventoryData.reduce((acc, item) => {
            if (item && item.categoryName && typeof item.onHandValue === 'number' && isFinite(item.onHandValue)) {
                 const catName = item.categoryName || 'Unknown';
                 acc[catName] = (acc[catName] || 0) + item.onHandValue;
             }
            return acc;
        }, {});
        return Object.entries(valueByCategory)
            .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
            .sort((a, b) => b.value - a.value) // Sort descending by value
            .slice(0, 7); // Take top 7 categories for chart
    }, [filteredInventoryData]);


    // --- Table Sorting & Pagination Logic --- (Similar to Sales Dashboard)
    const handleRequestSort = useCallback((property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    }, [order, orderBy]);

    const stableSort = useCallback((array, comparator) => { /* ... keep stableSort ... */ const sT = array.map((e, i) => [e, i]); sT.sort((x, y) => { const o = comparator(x[0], y[0]); if (o !== 0) return o; return x[1] - y[1]; }); return sT.map((e) => e[0]); }, []);
    const descendingComparator = useCallback((a, b, oB) => { /* ... keep descendingComparator ... */ let vA=a[oB]; let vB=b[oB]; if(vA==null&&vB==null)return 0; if(vA==null)return 1; if(vB==null)return -1; if(typeof vA==='string'&&typeof vB==='string'){vA=vA.toLowerCase(); vB=vB.toLowerCase();} if(vB<vA)return -1; if(vB>vA)return 1; return 0; }, []);
    const getComparator = useCallback((o, oB) => { /* ... keep getComparator ... */ return o === 'desc' ? (a, b) => descendingComparator(a, b, oB) : (a, b) => -descendingComparator(a, b, oB); }, [descendingComparator]);

    const sortedInventoryData = useMemo(() => {
        if (!filteredInventoryData || filteredInventoryData.length === 0) return [];
        return stableSort(filteredInventoryData, getComparator(order, orderBy));
    }, [filteredInventoryData, order, orderBy, stableSort, getComparator]);

    const handleChangePage = (event, newPage) => setTablePage(newPage);
    const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setTablePage(0); };
    const emptyRows = useMemo(() => { const count = sortedInventoryData.length; return count > 0 ? Math.max(0, rowsPerPage - (count - tablePage * rowsPerPage)) : 0; }, [sortedInventoryData, tablePage, rowsPerPage]);

    // --- Render Logic ---
    if (loading) { return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>; }
    if (error) { return <Box sx={{ padding: 3 }}><Alert severity="error" sx={{ mt: 2 }}>{error}</Alert></Box>; }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}> {/* Needed if we add date pickers later */}
            <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
                    Inventory Expiration Analysis
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
                    As of: {format(currentDate, 'EEEE, MMM d, yyyy')}
                </Typography>

                {/* Filters */}
                <Paper elevation={2} sx={{ p: {xs: 1, sm: 2}, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={4}>
                            <Autocomplete
                                multiple
                                size="small"
                                limitTags={1}
                                options={locations}
                                getOptionLabel={(option) => option.locationName}
                                value={selectedLocations}
                                onChange={(event, newValue) => {
                                    setSelectedLocations(newValue);
                                    setTablePage(0); // Reset page on filter change
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} variant="outlined" label="Locations" placeholder="All Locations" />
                                )}
                                isOptionEqualToValue={(option, value) => option.locationKey === value.locationKey}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                             <Autocomplete
                                multiple
                                size="small"
                                limitTags={1}
                                options={categories}
                                value={selectedCategories}
                                onChange={(event, newValue) => {
                                    setSelectedCategories(newValue);
                                    setTablePage(0);
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} variant="outlined" label="Categories" placeholder="All Categories" />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                             <FormControl fullWidth variant="outlined" size="small">
                                <InputLabel id="threshold-select-label">Show Items Expiring Within</InputLabel>
                                <Select
                                    labelId="threshold-select-label"
                                    value={selectedThreshold}
                                    onChange={(e) => {
                                        setSelectedThreshold(e.target.value);
                                        setTablePage(0);
                                    }}
                                    label="Show Items Expiring Within"
                                >
                                    {EXPIRY_THRESHOLDS.map(opt => (
                                        <MenuItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </MenuItem>
                                    ))}
                                     <MenuItem value={9999}>All (Including Fresh)</MenuItem> {/* Option to see everything */}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Paper>

                {/* KPIs */}
                <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={3}><InfoCard title="Quantity at Risk" value={kpiData.qtyAtRisk} icon={<InventoryIcon />} borderColor='error.main' /></Grid>
                    <Grid item xs={6} sm={3}><InfoCard title="Value at Risk" value={kpiData.valueAtRisk} formatFunc={formatCurrency} icon={<AttachMoneyIcon />} borderColor='error.main'/></Grid>
                    <Grid item xs={6} sm={3}><InfoCard title="Unique SKUs at Risk" value={kpiData.skusAtRisk} icon={<CategoryIcon />} borderColor='warning.main'/></Grid>
                    <Grid item xs={6} sm={3}><InfoCard title="Locations Affected" value={kpiData.locationsAffected} icon={<LocationCityIcon />} borderColor='warning.main'/></Grid>
                </Grid>

                {/* Main Content: Table and Optional Chart */}
                <Grid container spacing={3}>
                    {/* Inventory Detail Table */}
                    <Grid item xs={12} lg={9}>
                        <Paper elevation={3} sx={{ p: {xs: 1, sm: 2}, overflow: 'hidden' }}>
                            <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>Expiration Details</Typography>
                            <TableContainer sx={{ maxHeight: 600 }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>{/* Header Row */}
                                            {[
                                                { id: 'productName', label: 'Product', minWidth: 150 },
                                                { id: 'categoryName', label: 'Category', minWidth: 100 },
                                                { id: 'locationName', label: 'Location', minWidth: 120 },
                                                { id: 'batchNumber', label: 'Batch', minWidth: 90, sortable: false },
                                                { id: 'expirationDate', label: 'Expires On', minWidth: 90, align: 'center' },
                                                { id: 'daysToExpiration', label: 'Days Left', minWidth: 60, align: 'center' },
                                                { id: 'onHandQuantity', label: 'Qty', minWidth: 60, align: 'right' },
                                                { id: 'onHandValue', label: 'Value (EGP)', minWidth: 90, align: 'right' },
                                            ].map((h) => (
                                                <TableCell key={h.id} align={h.align || 'left'} sortDirection={orderBy === h.id ? order : false} sx={{ py: 1, minWidth: h.minWidth, backgroundColor: 'grey.100', fontWeight: 'bold' }}>
                                                    {(h.sortable !== false) ? (
                                                        <TableSortLabel active={orderBy === h.id} direction={orderBy === h.id ? order : 'asc'} onClick={() => handleRequestSort(h.id)}>
                                                            {h.label}
                                                        </TableSortLabel>
                                                    ) : h.label}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>{/* Table Body */}
                                        {sortedInventoryData.length === 0 ? (
                                            <TableRow><TableCell colSpan={8} align="center" sx={{ py: 3 }}>No inventory data matches the current filters.</TableCell></TableRow>
                                        ) : (
                                            sortedInventoryData.slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage).map((item) => {
                                                const riskStyle = getExpiryRiskStyle(item.daysToExpiration, theme);
                                                return (
                                                    <TableRow hover key={item.inventoryKey} sx={{ '&:last-child td, &:last-child th': { border: 0 }, backgroundColor: riskStyle.backgroundColor }}>
                                                        <TableCell sx={{ color: riskStyle.color }}>{item.productName}</TableCell>
                                                        <TableCell sx={{ color: riskStyle.color }}>{item.categoryName}</TableCell>
                                                        <TableCell sx={{ color: riskStyle.color }}>{item.locationName}</TableCell>
                                                        <TableCell sx={{ color: riskStyle.color }}>{item.batchNumber}</TableCell>
                                                        <TableCell align="center" sx={{ color: riskStyle.color }}>{formatDate(item.expirationDate)}</TableCell>
                                                        <TableCell align="center" sx={{ color: riskStyle.color, fontWeight: item.daysToExpiration <= 7 ? 'bold' : 'normal' }}>
                                                            <Chip icon={riskStyle.icon} label={item.daysToExpiration} size="small" variant='outlined' sx={{ color: riskStyle.color, borderColor: riskStyle.color + '90', backgroundColor: 'transparent' }}/>
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ color: riskStyle.color }}>{item.onHandQuantity.toLocaleString()}</TableCell>
                                                        <TableCell align="right" sx={{ color: riskStyle.color }}>{formatCurrency(item.onHandValue)}</TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                        {sortedInventoryData.length > 0 && emptyRows > 0 && (<TableRow style={{ height: 33 * emptyRows }}><TableCell colSpan={8} /></TableRow>)}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {sortedInventoryData.length > 0 && (
                                <TablePagination rowsPerPageOptions={[5, 10, 25, 50]} component="div" count={sortedInventoryData.length} rowsPerPage={rowsPerPage} page={tablePage} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} sx={{'.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows, .MuiTablePagination-actions': { mb: 0, fontSize: '0.8rem' } }} />
                            )}
                        </Paper>
                    </Grid>

                     {/* Value at Risk by Category Chart */}
                     <Grid item xs={12} lg={3}>
                         <Paper elevation={3} sx={{ p: 2, height: 'auto', minHeight: '300px' }}> {/* Adjust height */}
                             <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>Value at Risk by Category</Typography>
                             <Box sx={{height: '300px'}}> {/* Fixed height box for chart */}
                                 <ResponsiveContainer width="100%" height="100%">
                                     {valueRiskByCategory.length > 0 ? (
                                         <BarChart data={valueRiskByCategory} layout="vertical" margin={{ top: 0, right: 25, left: 65, bottom: 0 }}>
                                             <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                             <XAxis type="number" tickFormatter={(v) => `${v / 1000}k`} fontSize={10} tick={{ fill: theme.palette.text.secondary }}/>
                                             <YAxis dataKey="name" type="category" width={65} interval={0} fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                             <Tooltip formatter={(v) => [formatCurrency(v), "Value at Risk"]}/>
                                             <Bar dataKey="value" name="Value at Risk">
                                                 {valueRiskByCategory.map((entry, index) => (
                                                     <Cell key={`cell-${index}`} fill={theme.palette.warning.main} /> // Use warning color for risk
                                                 ))}
                                             </Bar>
                                         </BarChart>
                                     ) : ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No risk data for selected filters.</Typography></Box> )}
                                 </ResponsiveContainer>
                             </Box>
                         </Paper>
                     </Grid>
                </Grid>

            </Box>
        </LocalizationProvider>
    );
};

export default ExpirationAlertsDashboard;