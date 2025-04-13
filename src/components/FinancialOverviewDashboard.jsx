// src/components/FinancialOverviewDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Select, MenuItem, FormControl, InputLabel, Paper, Divider, CircularProgress, Alert, Chip, Tooltip as MuiTooltip, Button, useTheme, Skeleton, Tabs, Tab, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, TableSortLabel, TablePagination, Autocomplete, TextField, List, ListItem, ListItemText, Icon
} from '@mui/material';
// Ensure you have @mui/x-date-pickers-pro installed or replace with community version if not licensed
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { subDays, format, parseISO, isValid, startOfDay, endOfDay, differenceInDays, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';

// MUI Icons
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import InfoIcon from '@mui/icons-material/Info';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Import data generators and common functions
import { generateMockFinancialSummary, getMockAccounts, getMockScenarios } from '../utils/mockFinancialDataGenerator'; // Ensure path is correct
import { getMockStores } from '../utils/mockDataGenerator'; // Ensure path is correct

// --- Constants ---
const COLORS = ['#1976d2', '#4caf50', '#ff9800', '#ef5350', '#ab47bc', '#7e57c2'];
const OPEX_COLORS = ['#ef5350', '#ab47bc', '#7e57c2', '#26a69a', '#ffa726', '#ec407a'];
const REFRESH_INTERVAL_MS = 180000;
const PNL_ORDER = ['AC_REV', 'AC_COS', 'AC_GP', 'AC_OPEX', 'AC_NP'];

// --- Helper Functions ---
const formatCurrency = (value, compact = false) => {
    if (value === null || value === undefined || !isFinite(value)) return 'N/A';
    const absValue = Math.abs(value);
    if (compact) {
        if (absValue >= 1_000_000) return `EGP ${(value / 1_000_000).toFixed(1)}M`;
        if (absValue >= 1_000) return `EGP ${(value / 1_000).toFixed(1)}K`;
    }
    return `EGP ${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};
const formatPercentage = (value, decimals = 1) => {
    if (value === null || value === undefined || !isFinite(value) || value === Infinity || value === -Infinity) return 'N/A';
    return `${(value * 100).toFixed(decimals)}%`;
};
const formatNumber = (value, digits = 0) => {
    if (value === null || value === undefined || !isFinite(value)) return 'N/A';
    return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
};
const formatDate = (isoString) => { try { const d = parseISO(isoString); return isValid(d) ? format(d, 'MMM d, yyyy') : 'Invalid'; } catch { return 'Invalid'; } };
const formatMonth = (isoString) => { try { const d = parseISO(isoString); return isValid(d) ? format(d, 'MMM yyyy') : 'Invalid'; } catch { return 'Invalid'; } };

const calcVariance = (actual, budget) => {
    if (budget === 0) { return actual !== 0 ? Infinity : 0; }
    return (actual - budget) / Math.abs(budget);
};

const safeDivide = (numerator, denominator) => {
    if (denominator === null || denominator === undefined || !isFinite(denominator) || denominator === 0) { return 0; }
    if (numerator === null || numerator === undefined || !isFinite(numerator)) { return 0; }
    return numerator / denominator;
 };

// --- Kpi Card Component --- (Keep as before with Infinity check)
const KpiCard = ({ title, value, formatFunc = formatNumber, icon, loading, color = 'text.secondary', valueColor, tooltip, changeValue, changeFormatFunc = formatPercentage }) => (
    <MuiTooltip title={tooltip || ''} placement="top" arrow disableHoverListener={!tooltip}>
        <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <Box>
                    <Typography sx={{ fontSize: 14, mb: 0.5 }} color="text.secondary" gutterBottom>{title}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 36, mb: 0.5 }}>
                        {loading ? (<Skeleton variant="text" width="80%" />) : (
                            <>
                                {icon && React.cloneElement(icon, { sx: { mr: 1.5, color: color }, fontSize: "medium" })}
                                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: valueColor || color, lineHeight: 1.2 }}>
                                    {(value !== null && value !== undefined && (typeof value !== 'number' || isFinite(value))) ? formatFunc(value) : 'N/A'}
                                </Typography>
                            </>
                        )}
                    </Box>
                </Box>
                {!loading && changeValue !== undefined && changeValue !== null && isFinite(changeValue) && changeValue !== Infinity && changeValue !== -Infinity && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                         <Icon component={changeValue >= 0 ? TrendingUpIcon : TrendingDownIcon}
                               sx={{ fontSize: '1rem', mr: 0.5, color: changeValue >= 0 ? 'success.main' : 'error.main' }} />
                         <Typography variant="caption" sx={{ color: changeValue >= 0 ? 'success.main' : 'error.main', fontWeight: 'medium' }}>
                            {changeValue >= 0 ? '+' : ''}{changeFormatFunc(changeValue)}
                         </Typography>
                         <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}> vs Budget</Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    </MuiTooltip>
);

// --- Main Component ---
const FinancialOverviewDashboard = () => {
    const theme = useTheme();
    // --- State ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [summaryData, setSummaryData] = useState([]);
    const [dateRange, setDateRange] = useState([startOfMonth(subDays(new Date(), 35)), endOfMonth(subDays(new Date(), 5))]);
    const [selectedLocation, setSelectedLocation] = useState('ALL');
    const [lastRefreshed, setLastRefreshed] = useState(null);

    // --- Dimensions ---
    const locations = useMemo(() => [{ storeKey: 'ALL', storeName: 'All Locations' }, ...getMockStores()], []);
    const accounts = useMemo(() => getMockAccounts(), []);
    const accountMap = useMemo(() => new Map(accounts.map(a => [a.accountKey, a])), [accounts]);

    // --- Data Fetching ---
    const fetchData = useCallback(async (isInitialLoad = false) => {
        if (!isInitialLoad) console.log(`Refreshing financial data at ${new Date().toLocaleTimeString()}...`);
        else console.log("Initial financial data fetch...");
        setError(null); setLoading(true);
        const [start, end] = dateRange;
        if (!isValid(start) || !isValid(end)) { setError("Invalid date range."); setLoading(false); return; }
        let isMounted = true;
        try {
            await new Promise(res => setTimeout(res, 1100));
            const data = generateMockFinancialSummary(start, end);
            if (!isMounted) return;
            if (!Array.isArray(data)) throw new Error("Mock data generation failed.");
            setSummaryData(data);
            setLastRefreshed(new Date());
        } catch (err) {
            if (!isMounted) return;
            console.error("Error loading financial data:", err);
            setError(`Failed to load data: ${err.message}`);
            setSummaryData([]);
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

    // --- Filtered Data ---
    const filteredData = useMemo(() => {
        const locationFiltered = summaryData.filter(item =>
            (selectedLocation === 'ALL' || item.locationKey === selectedLocation)
        );
        const actualData = locationFiltered.filter(d => d.scenarioKey === 'SC_ACT');
        const budgetData = locationFiltered.filter(d => d.scenarioKey === 'SC_BUD');
        return { actualData, budgetData };
    }, [summaryData, selectedLocation]);

    // --- Aggregate Calculations ---
    const aggregatedTotals = useMemo(() => {
        const calculateTotals = (data) => {
            const totals = { AC_REV: 0, AC_COS: 0, AC_GP: 0, AC_OPEX: 0, AC_NP: 0, AC_SAL: 0, AC_RENT: 0, AC_UTIL: 0, AC_MKT: 0, AC_SUP: 0, AC_OTH: 0, };
            if (!data || data.length === 0) return totals;
            data.forEach(d => { if (totals.hasOwnProperty(d.accountKey)) { totals[d.accountKey] += d.amount; } });
            totals.AC_GP = totals.AC_REV - totals.AC_COS;
            totals.AC_NP = totals.AC_GP - totals.AC_OPEX;
            return totals;
        };
        const actualTotals = calculateTotals(filteredData.actualData);
        const budgetTotals = calculateTotals(filteredData.budgetData);
        return { actualTotals, budgetTotals };
    }, [filteredData]);

    // --- KPI Calculations ---
    const kpiData = useMemo(() => {
        const { actualTotals = {}, budgetTotals = {} } = aggregatedTotals || {};
        const kpis = {
            revenue: actualTotals.AC_REV ?? 0,
            grossProfit: actualTotals.AC_GP ?? 0,
            netProfit: actualTotals.AC_NP ?? 0,
            grossMargin: safeDivide(actualTotals.AC_GP ?? 0, actualTotals.AC_REV ?? 0),
            netMargin: safeDivide(actualTotals.AC_NP ?? 0, actualTotals.AC_REV ?? 0),
            totalOpex: actualTotals.AC_OPEX ?? 0,
            revenueVariance: calcVariance(actualTotals.AC_REV ?? 0, budgetTotals.AC_REV ?? 0),
            netProfitVariance: calcVariance(actualTotals.AC_NP ?? 0, budgetTotals.AC_NP ?? 0),
            opexVariance: calcVariance(actualTotals.AC_OPEX ?? 0, budgetTotals.AC_OPEX ?? 0),
        };
         Object.keys(kpis).forEach(key => {
             if (kpis[key] === null || kpis[key] === undefined || !isFinite(kpis[key])) { kpis[key] = 0; }
         });
        return kpis;
    }, [aggregatedTotals]);

    // --- Chart Data Aggregations ---
    const pnlSummaryChartData = useMemo(() => {
        const { actualTotals = {}, budgetTotals = {} } = aggregatedTotals || {};
        const accountOrder = PNL_ORDER.filter(key => key !== 'AC_COS' && key !== 'AC_OPEX');
        return accountOrder.map(key => {
             const account = accountMap.get(key);
             const actualValue = actualTotals[key] ?? 0;
             const budgetValue = budgetTotals[key] ?? 0;
             const variance = calcVariance(actualValue, budgetValue);
             return { name: account?.accountName || key, Actual: actualValue, Budget: budgetValue, varianceValue: variance, Variance: isFinite(variance) ? formatPercentage(variance) : (variance > 0 ? '+∞' : '-∞'), };
        });
    }, [aggregatedTotals, accountMap]);

    const trendData = useMemo(() => {
        if (!filteredData.actualData || filteredData.actualData.length === 0) return [];
        const groupedByMonth = filteredData.actualData.reduce((acc, d) => {
            const monthKey = format(parseISO(d.dateKey), 'yyyy-MM');
            if (!acc[monthKey]) { acc[monthKey] = { month: monthKey, AC_REV: 0, AC_COS: 0, AC_OPEX: 0 }; }
            if (d.accountKey === 'AC_REV') acc[monthKey].AC_REV += d.amount;
            if (d.accountKey === 'AC_COS') acc[monthKey].AC_COS += d.amount;
            if (d.parentAccountKey === 'AC_OPEX') acc[monthKey].AC_OPEX += d.amount;
            return acc;
        }, {});
        return Object.values(groupedByMonth).map(m => {
             const grossProfit = m.AC_REV - m.AC_COS;
             const netProfit = grossProfit - m.AC_OPEX;
             return { displayMonth: formatMonth(m.month), month: m.month, Revenue: parseFloat(m.AC_REV.toFixed(0)), 'Gross Profit': parseFloat(grossProfit.toFixed(0)), 'Net Profit': parseFloat(netProfit.toFixed(0)), };
            }).sort((a, b) => a.month.localeCompare(b.month));
    }, [filteredData.actualData]);

    const opexBreakdownData = useMemo(() => {
        const { actualTotals = {} } = aggregatedTotals || {};
        const opexAccounts = accounts.filter(a => a.parentAccountKey === 'AC_OPEX');
        return opexAccounts.map((acc, index) => ({
            name: acc.accountName, value: actualTotals[acc.accountKey] ?? 0, fill: OPEX_COLORS[index % OPEX_COLORS.length]
        })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
    }, [aggregatedTotals, accounts]);

    const storeProfitabilityData = useMemo(() => {
         if (!filteredData.actualData || filteredData.actualData.length === 0) return [];
         const groupedByStore = filteredData.actualData.reduce((acc, d) => {
             const storeKey = d.locationKey;
             if (!acc[storeKey]) { acc[storeKey] = { storeName: d.storeName, AC_REV: 0, AC_COS: 0, AC_OPEX: 0 }; }
             if (d.accountKey === 'AC_REV') acc[storeKey].AC_REV += d.amount;
             if (d.accountKey === 'AC_COS') acc[storeKey].AC_COS += d.amount;
             if (d.parentAccountKey === 'AC_OPEX') acc[storeKey].AC_OPEX += d.amount;
             return acc;
         }, {});
         return Object.values(groupedByStore).map(s => {
             const grossProfit = s.AC_REV - s.AC_COS;
             const netProfit = grossProfit - s.AC_OPEX;
             const netMargin = safeDivide(netProfit, s.AC_REV);
             return { name: s.storeName, 'Net Profit': parseFloat(netProfit.toFixed(0)), 'Net Margin': netMargin };
            }).sort((a, b) => b['Net Profit'] - a['Net Profit']);
    }, [filteredData.actualData]);

    // --- Filter Reset ---
    const handleClearFilters = () => { setSelectedLocation('ALL'); };

    // --- Render Logic ---
    const chartPaperHeight = '400px';

    // --- Corrected Tooltip Formatters ---
    const currencyValueFormatter = (value) => formatCurrency(value);
    const amountValueFormatter = (value) => formatCurrency(value);
    const marginValueFormatter = (value, name) => (name === 'Net Margin' ? formatPercentage(value) : formatCurrency(value));

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
                {/* Header */}
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0 }}>
                        Financial Overview
                    </Typography>
                     <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        {loading && <CircularProgress size={16} />}
                        {lastRefreshed && ( <MuiTooltip title={`Last refreshed: ${format(lastRefreshed, 'HH:mm:ss')}`}> <Typography variant="caption" color="text.secondary"> <UpdateIcon sx={{ fontSize: '0.9rem', verticalAlign: 'middle', mr: 0.5 }} /> {format(lastRefreshed, 'HH:mm')} </Typography> </MuiTooltip> )}
                     </Box>
                </Box>

                {/* Filters */}
                 <Paper elevation={2} sx={{ p: { xs: 1, sm: 2 }, mb: 3 }}>
                     <Grid container spacing={2} alignItems="center">
                         <Grid item xs={12} sm={6} md={4}> <FormControl fullWidth variant="outlined" size="small"> <InputLabel>Location</InputLabel> <Select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} label="Location" disabled={loading}> {locations.map(loc => <MenuItem key={loc.storeKey} value={loc.storeKey}>{loc.storeName}</MenuItem>)} </Select> </FormControl> </Grid>
                         <Grid item xs={12} sm={6} md={6}> <DateRangePicker /* licenseKey="YOUR_PREMIUM_LICENSE_KEY" */ localeText={{ start: "Start Date", end: "End Date" }} value={dateRange} onChange={(r) => { if (r && r.length === 2 && isValid(r[0]) && isValid(r[1])) { setDateRange([startOfDay(r[0]), endOfDay(r[1])]); } }} slotProps={{ textField: { variant: 'outlined', size: 'small', fullWidth: true } }} disabled={loading} /> </Grid>
                         <Grid item xs={12} sm={6} md={2} sx={{ textAlign: 'right' }}> <Button variant="outlined" size="small" onClick={handleClearFilters} startIcon={<FilterListOffIcon />} disabled={loading || (selectedLocation === 'ALL')} sx={{ height: '40px' }} > Clear Loc. </Button> </Grid>
                     </Grid>
                 </Paper>

                {/* Error Display */}
                {error && !loading && ( <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert> )}

                {/* KPIs */}
                 <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={4} lg={2}> <KpiCard title="Total Revenue" value={kpiData.revenue} formatFunc={(v)=>formatCurrency(v, true)} icon={<MonetizationOnIcon />} loading={loading} color="success.dark" tooltip="Total sales revenue" changeValue={kpiData.revenueVariance} /> </Grid>
                    <Grid item xs={6} sm={4} lg={2}> <KpiCard title="Gross Profit" value={kpiData.grossProfit} formatFunc={(v)=>formatCurrency(v, true)} icon={<TrendingUpIcon />} loading={loading} color="primary.main" tooltip="Revenue minus Cost of Goods Sold (COGS)" /> </Grid>
                    <Grid item xs={6} sm={4} lg={2}> <KpiCard title="Gross Margin" value={kpiData.grossMargin} formatFunc={formatPercentage} icon={<TrendingUpIcon />} loading={loading} color="primary.light" tooltip="Gross Profit as a percentage of Revenue" /> </Grid>
                    <Grid item xs={6} sm={4} lg={2}> <KpiCard title="Operating Expenses" value={kpiData.totalOpex} formatFunc={(v)=>formatCurrency(v, true)} icon={<ReceiptLongIcon />} loading={loading} color="warning.dark" tooltip="Total costs of running the business (salaries, rent, etc.)" changeValue={kpiData.opexVariance * -1} /> </Grid>
                    <Grid item xs={6} sm={4} lg={2}> <KpiCard title="Net Profit" value={kpiData.netProfit} formatFunc={(v)=>formatCurrency(v, true)} icon={<AccountBalanceIcon />} loading={loading} color={kpiData.netProfit >= 0 ? "success.main" : "error.main"} valueColor={kpiData.netProfit >= 0 ? "success.main" : "error.main"} tooltip="Gross Profit minus Operating Expenses" changeValue={kpiData.netProfitVariance}/> </Grid>
                    <Grid item xs={6} sm={4} lg={2}> <KpiCard title="Net Margin" value={kpiData.netMargin} formatFunc={formatPercentage} icon={<AccountBalanceIcon />} loading={loading} color={kpiData.netMargin >= 0 ? "success.light" : "error.light"} tooltip="Net Profit as a percentage of Revenue" /> </Grid>
                 </Grid>

                {/* Charts */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    {/* P&L Summary Chart */}
                    <Grid item xs={12} lg={6}>
                         <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>P&L Summary (vs Budget)</Typography>
                            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    {loading ? <Skeleton variant="rectangular" height="100%" /> : pnlSummaryChartData.length > 0 ? (
                                         <ComposedChart data={pnlSummaryChartData} layout="vertical" margin={{ top: 5, right: 40, left: 80, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider}/>
                                            <XAxis type="number" fontSize={10} tick={{ fill: theme.palette.text.secondary }} tickFormatter={(v) => formatCurrency(v, true)} />
                                            <YAxis dataKey="name" type="category" width={80} interval={0} fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                            <Tooltip formatter={currencyValueFormatter} /> {/* Corrected */}
                                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                            <Bar dataKey="Budget" name="Budget" fill={theme.palette.grey[400]} barSize={15}>
                                                 <LabelList dataKey="Variance" position="right" offset={5} fontSize={9}
                                                    fill={(entry) => {
                                                        const varianceVal = entry.varianceValue;
                                                        if (!isFinite(varianceVal)) return theme.palette.text.secondary;
                                                        const account = accounts.find(a => a.accountName === entry.name);
                                                        const isFavorable = (account?.accountType === 'Revenue' || account?.accountType === 'Profit') ? varianceVal >= 0 : varianceVal <= 0;
                                                        return isFavorable ? theme.palette.success.main : theme.palette.error.main;
                                                    }} />
                                            </Bar>
                                            <Bar dataKey="Actual" name="Actual" fill={theme.palette.primary.main} barSize={15} />
                                        </ComposedChart>
                                    ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No P&L data.</Typography></Box>)}
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>

                     {/* Financial Trend Chart */}
                     <Grid item xs={12} lg={6}>
                         <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Monthly Financial Trends (Actual)</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                 <ResponsiveContainer width="100%" height="100%">
                                     {loading ? <Skeleton variant="rectangular" height="100%" /> : trendData.length > 0 ? (
                                         <ComposedChart data={trendData} margin={{ top: 5, right: 5, left: 15, bottom: 5 }}>
                                             <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                             <XAxis dataKey="displayMonth" fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                             <YAxis fontSize={10} tick={{ fill: theme.palette.text.secondary }} tickFormatter={(v) => formatCurrency(v, true)} />
                                             <Tooltip formatter={currencyValueFormatter}/> {/* Corrected */}
                                             <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                             <Area type="monotone" dataKey="Revenue" name="Revenue" stroke={theme.palette.success.main} fill={theme.palette.success.light} fillOpacity={0.3} strokeWidth={2}/>
                                             <Line type="monotone" dataKey="Gross Profit" name="Gross Profit" stroke={theme.palette.primary.main} strokeWidth={2} dot={false} />
                                             <Line type="monotone" dataKey="Net Profit" name="Net Profit" stroke={theme.palette.secondary.main} strokeWidth={2} dot={false} />
                                         </ComposedChart>
                                     ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No trend data.</Typography></Box>)}
                                 </ResponsiveContainer>
                             </Box>
                         </Paper>
                     </Grid>

                     {/* Operating Expense Breakdown */}
                     <Grid item xs={12} md={6} lg={4}>
                        <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Operating Expense Breakdown (Actual)</Typography>
                            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                     {loading ? <Skeleton variant="rectangular" height="100%" /> : opexBreakdownData.length > 0 ? (
                                        <PieChart>
                                            <Pie data={opexBreakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" paddingAngle={2} labelLine={false} label={({ name, percent }) => percent > 0.04 ? `${(percent * 100).toFixed(0)}%` : ''}>
                                                 {opexBreakdownData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                                            </Pie>
                                            <Tooltip formatter={currencyValueFormatter} /> {/* Corrected */}
                                            <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: "11px", lineHeight: '1.5' }} />
                                        </PieChart>
                                     ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No OpEx data.</Typography></Box>)}
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Store Profitability */}
                     <Grid item xs={12} md={6} lg={8}>
                         <Paper elevation={3} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                             <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Store Profitability (Actual Net Profit & Margin)</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    {loading ? <Skeleton variant="rectangular" height="100%" /> : storeProfitabilityData.length > 0 ? (
                                        <ComposedChart data={storeProfitabilityData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider}/>
                                            <XAxis type="number" xAxisId="profitAxis" fontSize={10} tick={{ fill: theme.palette.text.secondary }} tickFormatter={(v) => formatCurrency(v, true)} />
                                            <XAxis type="number" xAxisId="marginAxis" orientation="top" fontSize={10} tick={{ fill: theme.palette.text.secondary }} tickFormatter={(v) => formatPercentage(v,0)} domain={[0, 'dataMax + 0.05']} />
                                            <YAxis dataKey="name" type="category" yAxisId="storeAxis" width={80} interval={0} fontSize={10} tick={{ fill: theme.palette.text.secondary }} />
                                            <Tooltip formatter={marginValueFormatter}/> {/* Corrected */}
                                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                            <Bar yAxisId="storeAxis" xAxisId="profitAxis" dataKey="Net Profit" name="Net Profit" fill={theme.palette.success.main} barSize={20} />
                                            <Line yAxisId="storeAxis" xAxisId="marginAxis" type="monotone" dataKey="Net Margin" name="Net Margin" stroke={theme.palette.secondary.main} strokeWidth={2} dot={{r:3}}/>
                                        </ComposedChart>
                                    ) : (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No store data.</Typography></Box>)}
                                </ResponsiveContainer>
                            </Box>
                         </Paper>
                     </Grid>
                </Grid>
            </Box>
        </LocalizationProvider>
    );
};

export default FinancialOverviewDashboard;