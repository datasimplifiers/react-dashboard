import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Select, MenuItem, FormControl, InputLabel, Paper, Divider, CircularProgress, Alert, Chip, Tooltip as MuiTooltip, Button, useTheme, Autocomplete, TextField, Skeleton
} from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
    ComposedChart, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { subDays, format, parseISO, isValid, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';

// MUI Icons
import StorefrontIcon from '@mui/icons-material/Storefront';
import CategoryIcon from '@mui/icons-material/Category';
import SellIcon from '@mui/icons-material/Sell';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import InsightsIcon from '@mui/icons-material/Insights';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';

// Import base dimension getters and sales data generator
import { getMockStores, getMockProducts, getMockCompetitors, generateMockSalesData } from '../utils/mockDataGenerator';
// Import new generators
import { generateMockPricingData, generateMockForecastData } from '../utils/mockPricingForecastGenerator';

// --- Constants ---
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF5722', '#607D8B'];

// --- Helper Functions ---
const formatCurrency = (value) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return `EGP ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; };
const formatNumber = (value, digits = 1) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return value.toLocaleString('en-US', { maximumFractionDigits: digits }); };
const formatPercent = (value, digits = 1) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return `${value.toFixed(digits)}%`; };
const formatDateForAxis = (dateString) => { try { const p = parseISO(dateString); return isValid(p) ? format(p, 'MMM d') : ''; } catch { return ''; } };
const formatDateForDisplay = (date) => format(date, 'MMM d, yyyy');
const getPreviousPeriod = (startDate, endDate) => { if (!isValid(startDate) || !isValid(endDate)) return [null, null]; const diff = differenceInDays(endDate, startDate); if (diff < 0) return [null, null]; const prevEnd = subDays(startOfDay(startDate), 1); const prevStart = subDays(prevEnd, diff); return [startOfDay(prevStart), endOfDay(prevEnd)]; };
const calculatePopChange = (current, previous) => { if (previous === 0 || previous === null || current === null || !isFinite(current) || !isFinite(previous)) return null; if (current === previous) return 0.0; return ((current - previous) / previous) * 100; };

// --- KpiDisplay Component ---
const KpiDisplay = ({ title, value, formatFunc = formatNumber, icon, loading, color = 'text.secondary', valueColor = 'text.primary', tooltip = '' }) => ( <MuiTooltip title={tooltip} placement="top" arrow disableHoverListener={!tooltip}> <Card elevation={2} sx={{ height: '100%' }}><CardContent><Typography sx={{ fontSize: 14, mb: 1 }} color="text.secondary" gutterBottom>{title}</Typography><Box sx={{ display: 'flex', alignItems: 'center', minHeight: 36 }}>{loading ? (<Skeleton variant="text" width="80%" />) : (<>{icon && React.cloneElement(icon, { sx: { mr: 1.5, color: color }, fontSize: "medium" })}<Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: valueColor }}>{(value !== null && value !== undefined && (typeof value !== 'number' || isFinite(value))) ? formatFunc(value) : 'N/A'}</Typography></>)}</Box></CardContent></Card> </MuiTooltip> );

// --- Main Component ---
const DynamicPricingDashboard = () => {
    const theme = useTheme();

    // State Hooks
    const [loading, setLoading] = useState(true); const [error, setError] = useState(null); const [allSalesData, setAllSalesData] = useState([]); const [allPricingData, setAllPricingData] = useState([]); const [allForecastData, setAllForecastData] = useState([]); const [dateRange, setDateRange] = useState([startOfDay(subDays(new Date(), 14)), endOfDay(new Date())]); const [selectedProduct, setSelectedProduct] = useState(null); const [selectedStore, setSelectedStore] = useState(''); const [selectedCompetitors, setSelectedCompetitors] = useState([]);

    // Dimensions for Filters
    const products = useMemo(() => getMockProducts().map(p => ({ productKey: p.productKey, productName: p.name })).sort((a,b)=> a.productName.localeCompare(b.productName)), []);
    const stores = useMemo(() => getMockStores().sort((a,b)=> a.storeName.localeCompare(b.storeName)), []);
    const competitors = useMemo(() => getMockCompetitors().sort((a,b)=> a.competitorName.localeCompare(b.competitorName)), []);

    // Initialize first store and product
    useEffect(() => { if (!selectedStore && stores.length > 0) { setSelectedStore(stores[0].storeKey); } if (!selectedProduct && products.length > 0) { setSelectedProduct(products[0]); } }, [stores, products, selectedStore, selectedProduct]);

    // --- Data Fetching ---
    useEffect(() => {
        setLoading(true); setError(null); // console.log("Initiating dynamic pricing data fetch...");
        const [start, end] = dateRange; if (!isValid(start) || !isValid(end)) { setError("Invalid date range."); setLoading(false); return; }
        const historyStart = subDays(start, 30);
        Promise.all([
            new Promise(res => setTimeout(() => res(generateMockSalesData(historyStart, end)), 500)),
            new Promise(res => setTimeout(() => res(generateMockPricingData(start, end)), 600)),
            new Promise(res => setTimeout(() => { const sales = generateMockSalesData(historyStart, start); res(generateMockForecastData(start, end, sales)); }, 700)),
        ]).then(([sales, pricing, forecast]) => {
            if (!Array.isArray(sales) || !Array.isArray(pricing) || !Array.isArray(forecast)) { throw new Error("Data generation failed."); }
            setAllSalesData(sales); setAllPricingData(pricing); setAllForecastData(forecast); setLoading(false); // console.log("Data fetch complete.");
        }).catch(err => { console.error("Error fetching data:", err); setError(`Failed to load data: ${err.message}`); setLoading(false); });
    }, [dateRange]);

    // --- Filtered Data ---
    const filteredPricingData = useMemo(() => { if (loading || !selectedProduct || !selectedStore) return []; const [start, end] = dateRange; return allPricingData.filter(p => p.productKey === selectedProduct.productKey && p.storeKey === selectedStore && isValid(parseISO(p.dateKey)) && parseISO(p.dateKey) >= start && parseISO(p.dateKey) <= end); }, [loading, allPricingData, selectedProduct, selectedStore, dateRange]);
    const filteredSalesData = useMemo(() => { if (loading || !selectedProduct || !selectedStore) return []; const [start, end] = dateRange; return allSalesData.filter(s => s.productKey === selectedProduct.productKey && s.storeKey === selectedStore && isValid(parseISO(s.dateKey)) && parseISO(s.dateKey) >= start && parseISO(s.dateKey) <= end); }, [loading, allSalesData, selectedProduct, selectedStore, dateRange]);
    const filteredForecastData = useMemo(() => { if (loading || !selectedProduct || !selectedStore) return []; const [start, end] = dateRange; return allForecastData.filter(f => f.productKey === selectedProduct.productKey && f.locationKey === selectedStore && isValid(parseISO(f.forecastDateKey)) && parseISO(f.forecastDateKey) >= start && parseISO(f.forecastDateKey) <= end); }, [loading, allForecastData, selectedProduct, selectedStore, dateRange]);

    // --- KPI Calculations (Re-added Avg Low/High Comp Price) ---
    const kpiData = useMemo(() => {
        const defaultKpis = { avgMetroPrice: null, avgLowestCompPrice: null, avgHighestCompPrice: null, avgCompPrice: null, priceIndex: null, totalSold: 0, totalProfit: 0, avgForecast: null };
        if (loading || !selectedProduct || !filteredPricingData.length) return defaultKpis;

        let mTot=0, mCnt=0;
        const competitorPricesByDate = {}; // { date: [compPrice1, compPrice2,...] }
        const allCompPrices = []; // For overall average
        const sCK = selectedCompetitors.map(c => c.competitorKey);

        filteredPricingData.forEach(p => {
            if (p.competitorKey === null && typeof p.price === 'number' && isFinite(p.price)) {
                mTot += p.price; mCnt++;
            } else if (sCK.includes(p.competitorKey) && typeof p.price === 'number' && isFinite(p.price)) {
                if (!competitorPricesByDate[p.dateKey]) competitorPricesByDate[p.dateKey] = [];
                competitorPricesByDate[p.dateKey].push(p.price);
                allCompPrices.push(p.price); // Collect all for overall average
            }
        });

        const avgMetroPrice = mCnt > 0 ? mTot / mCnt : null;
        const avgCompPrice = allCompPrices.length > 0 ? allCompPrices.reduce((a, b) => a + b, 0) / allCompPrices.length : null;
        const priceIndex = (avgMetroPrice !== null && avgCompPrice !== null && avgCompPrice !== 0) ? (avgMetroPrice / avgCompPrice) * 100 : null;

        // Calculate Avg Low and High from daily min/max
        let sumMinCompPrice = 0, sumMaxCompPrice = 0, compDateCount = 0;
        Object.values(competitorPricesByDate).forEach(prices => {
            if (prices.length > 0) {
                sumMinCompPrice += Math.min(...prices);
                sumMaxCompPrice += Math.max(...prices);
                compDateCount++;
            }
        });
        const avgLowestCompPrice = compDateCount > 0 ? sumMinCompPrice / compDateCount : null;
        const avgHighestCompPrice = compDateCount > 0 ? sumMaxCompPrice / compDateCount : null;


        const totalSold = filteredSalesData.reduce((s, i) => s + (i.quantitySold || 0), 0);
        const totalProfit = filteredSalesData.reduce((s, i) => s + (i.grossProfit || 0), 0);
        const tFor = filteredForecastData.reduce((s, i) => s + (i.forecastedQuantity || 0), 0);
        const numForecastDays = filteredForecastData.length;

        return {
            avgMetroPrice,
            avgLowestCompPrice, // Added back
            avgHighestCompPrice, // Added back
            avgCompPrice, // Kept for index calculation
            priceIndex,
            totalSold,
            totalProfit,
            avgForecast: numForecastDays > 0 ? tFor / numForecastDays : null
        };
    }, [loading, selectedProduct, filteredPricingData, filteredSalesData, filteredForecastData, selectedCompetitors]);

    // --- Chart Data Preparation --- (No changes needed here)
    const priceTrendChartData = useMemo(() => { if (loading || !filteredPricingData.length) return []; const [start, end] = dateRange; const cDM={}; const dI = eachDayOfInterval({ start, end }); dI.forEach(d => { cDM[format(d,'yyyy-MM-dd')] = { date: format(d,'yyyy-MM-dd')}; }); filteredPricingData.forEach(p => { const dt=p.dateKey; if (cDM[dt]) { if (p.competitorKey === null) { cDM[dt]['Metro'] = p.price; } else if (selectedCompetitors.some(c => c.competitorKey === p.competitorKey)) { cDM[dt][p.competitorName] = p.price; } } }); return Object.values(cDM).map(d => ({...d, displayDate: formatDateForAxis(d.date)})).sort((a, b) => parseISO(a.date) - parseISO(b.date)); }, [loading, filteredPricingData, selectedCompetitors, dateRange]);
    const correlationChartData = useMemo(() => { if (loading || !selectedProduct || !selectedStore) return []; const [start, end] = dateRange; const cM={}; const dI=eachDayOfInterval({ start, end }); dI.forEach(d => { cM[format(d,'yyyy-MM-dd')] = { date: format(d,'yyyy-MM-dd'), metroPrice: null, quantitySold: 0, forecastedQuantity: null, grossProfit: 0 }; }); filteredPricingData.forEach(p => { if (p.competitorKey === null && cM[p.dateKey]) { cM[p.dateKey].metroPrice = p.price; } }); filteredSalesData.forEach(s => { if (cM[s.dateKey]) { if(typeof s.quantitySold === 'number' && isFinite(s.quantitySold)) cM[s.dateKey].quantitySold += s.quantitySold; if(typeof s.grossProfit === 'number' && isFinite(s.grossProfit)) cM[s.dateKey].grossProfit += s.grossProfit; } }); filteredForecastData.forEach(f => { if (cM[f.forecastDateKey] && typeof f.forecastedQuantity === 'number' && isFinite(f.forecastedQuantity)) { cM[f.forecastDateKey].forecastedQuantity = f.forecastedQuantity; } }); return Object.values(cM).map(d => ({...d, displayDate: formatDateForAxis(d.date)})).sort((a, b) => parseISO(a.date) - parseISO(b.date)); }, [loading, selectedProduct, selectedStore, filteredPricingData, filteredSalesData, filteredForecastData, dateRange]);
    const priceGapChartData = useMemo(() => { if (loading || !filteredPricingData.length || selectedCompetitors.length === 0) return []; const [start, end] = dateRange; const gM={}; const dI = eachDayOfInterval({ start, end }); const sCK = selectedCompetitors.map(c => c.competitorKey); dI.forEach(d => { gM[format(d,'yyyy-MM-dd')] = { date: format(d,'yyyy-MM-dd'), metroPrice: null, avgCompPrice: null, priceGapPercent: null }; }); const pBD={}; filteredPricingData.forEach(p => { const dt = p.dateKey; if (!pBD[dt]) pBD[dt] = { metro: null, comps: [] }; if (p.competitorKey === null && typeof p.price==='number' && isFinite(p.price)) { pBD[dt].metro = p.price; } else if (sCK.includes(p.competitorKey) && typeof p.price==='number' && isFinite(p.price)) { pBD[dt].comps.push(p.price); } }); Object.keys(gM).forEach(dt => { if (pBD[dt]) { const mP=pBD[dt].metro; const cPs=pBD[dt].comps; gM[dt].metroPrice = mP; if (cPs.length > 0) { const aCP = cPs.reduce((a, b) => a + b, 0) / cPs.length; gM[dt].avgCompPrice = aCP; if (mP !== null && aCP !== 0) { gM[dt].priceGapPercent = parseFloat((((mP - aCP) / aCP) * 100).toFixed(1)); } } } }); return Object.values(gM).map(d => ({...d, displayDate: formatDateForAxis(d.date)})).sort((a, b) => parseISO(a.date) - parseISO(b.date)); }, [loading, filteredPricingData, selectedCompetitors, dateRange]);
    const scatterPlotData = useMemo(() => { if (loading || !selectedProduct || !selectedStore) return []; const sM={}; filteredPricingData.forEach(p => { if (p.competitorKey === null && typeof p.price==='number' && isFinite(p.price)) { if (!sM[p.dateKey]) sM[p.dateKey] = { date: p.dateKey, metroPrice: null, quantitySold: 0 }; sM[p.dateKey].metroPrice = p.price; } }); filteredSalesData.forEach(s => { if (typeof s.quantitySold === 'number' && isFinite(s.quantitySold)) { if (!sM[s.dateKey]) sM[s.dateKey] = { date: s.dateKey, metroPrice: null, quantitySold: 0 }; sM[s.dateKey].quantitySold += s.quantitySold; } }); return Object.values(sM).filter(d => d.metroPrice !== null && d.quantitySold > 0); }, [loading, selectedProduct, selectedStore, filteredPricingData, filteredSalesData]);

    // --- Render Logic ---
    if (error) { return <Box sx={{ padding: 3 }}><Alert severity="error" sx={{ mt: 2 }}>{error}</Alert></Box>; }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>Dynamic Pricing Analysis</Typography>

                 {/* Filters */}
                <Paper elevation={2} sx={{ p: {xs: 1, sm: 2}, mb: 3 }}>
                     {/* ... Filter Grid Content ... */}
                     <Grid container spacing={2} alignItems="center">
                         <Grid item xs={12} md={4}> <Autocomplete size="small" options={products} getOptionLabel={(o) => o.productName || ''} value={selectedProduct} onChange={(e, nv) => { setSelectedProduct(nv); }} isOptionEqualToValue={(o, v) => o && v && o.productKey === v.productKey} renderInput={(p) => <TextField {...p} label="Select Product" variant="outlined" />} loading={loading && products.length === 0} disabled={!products || products.length === 0}/> </Grid>
                         <Grid item xs={12} sm={6} md={2}> <FormControl fullWidth variant="outlined" size="small"> <InputLabel>Store</InputLabel> <Select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)} label="Store" disabled={loading && stores.length === 0}> {stores.map(s => <MenuItem key={s.storeKey} value={s.storeKey}>{s.storeName}</MenuItem>)} </Select> </FormControl> </Grid>
                         <Grid item xs={12} sm={6} md={3}> <Autocomplete multiple size="small" limitTags={1} options={competitors} getOptionLabel={(o) => o.competitorName} value={selectedCompetitors} onChange={(e, nv) => { setSelectedCompetitors(nv); }} isOptionEqualToValue={(o, v) => o.competitorKey === v.competitorKey} renderInput={(p) => ( <TextField {...p} variant="outlined" label="Compare Competitors" placeholder="Select..." /> )} disabled={loading && competitors.length === 0} /> </Grid>
                         <Grid item xs={12} md={3}> <DateRangePicker localeText={{ start: "Start Date", end: "End Date" }} value={dateRange} onChange={(r) => { if (r && r.length === 2 && isValid(r[0]) && isValid(r[1])) { setDateRange([startOfDay(r[0]), endOfDay(r[1])]); } }} slotProps={{ textField: { variant: 'outlined', size: 'small', fullWidth: true } }} /> </Grid>
                    </Grid>
                </Paper>

                {/* KPIs - Adjusted Grid Layout for 7 items (4+3) */}
                <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 3 }}>
                     <Grid item xs={6} sm={4} md={3}> <KpiDisplay title="Avg. Metro Price" value={kpiData.avgMetroPrice} formatFunc={formatCurrency} icon={<SellIcon />} loading={loading} valueColor='primary.main' tooltip="Average Metro selling price in period"/> </Grid>
                     <Grid item xs={6} sm={4} md={3}> <KpiDisplay title="Avg. Lowest Comp." value={kpiData.avgLowestCompPrice} formatFunc={formatCurrency} icon={<TrendingDownIcon />} loading={loading} valueColor={kpiData.avgLowestCompPrice !== null && kpiData.avgMetroPrice > kpiData.avgLowestCompPrice ? 'success.main' : 'text.primary'} tooltip="Average of daily lowest competitor prices"/> </Grid>
                     <Grid item xs={6} sm={4} md={3}> <KpiDisplay title="Avg. Highest Comp." value={kpiData.avgHighestCompPrice} formatFunc={formatCurrency} icon={<TrendingUpIcon />} loading={loading} valueColor={kpiData.avgHighestCompPrice !== null && kpiData.avgMetroPrice < kpiData.avgHighestCompPrice ? 'error.main' : 'text.primary'} tooltip="Average of daily highest competitor prices"/> </Grid>
                     <Grid item xs={6} sm={4} md={3}> <KpiDisplay title="Price Index" value={kpiData.priceIndex} formatFunc={v => v?.toFixed(0)} icon={<CompareArrowsIcon />} loading={loading} valueColor={kpiData.priceIndex === null ? 'text.primary' : kpiData.priceIndex < 100 ? 'success.main' : kpiData.priceIndex > 105 ? 'error.main' : 'text.primary'} tooltip="Metro Avg Price / Avg Competitor Price * 100"/> </Grid>
                     {/* Second Row */}
                     <Grid item xs={6} sm={4} md={4}> <KpiDisplay title="Total Units Sold" value={kpiData.totalSold} formatFunc={formatNumber} icon={<ShoppingCartIcon />} loading={loading}  tooltip="Total Items Sold"/> </Grid>
                     <Grid item xs={6} sm={4} md={4}> <KpiDisplay title="Total Gross Profit" value={kpiData.totalProfit} formatFunc={formatCurrency} icon={<InsightsIcon />} loading={loading} valueColor={kpiData.totalProfit < 0 ? 'error.main' : 'success.main'}/> </Grid>
                     <Grid item xs={12} sm={4} md={4}> <KpiDisplay title="Avg. Daily Forecast" value={kpiData.avgForecast} formatFunc={formatNumber} icon={<QueryStatsIcon />} loading={loading} /> </Grid>
                </Grid>

                {/* Charts - 2x2 Layout */}
                 <Grid container spacing={3}>
                     <Grid item xs={12} md={6}> {/* Price Trend Chart */}
                        {/* ... Chart Code as Before ... */}
                         <Paper elevation={3} sx={{ p: 2, height: '350px', display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="h6" sx={{ mb: 1, flexShrink: 0, color: 'text.primary' }}>Price Trend vs Competitors</Typography>
                              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                 <ResponsiveContainer width="100%" height="100%">
                                     {priceTrendChartData.length > 0 ? ( <LineChart data={priceTrendChartData} margin={{ top: 5, right: 5, left: 20, bottom: 5 }}> <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider}/> <XAxis dataKey="displayDate" fontSize={10} tick={{ fill: theme.palette.text.secondary }} interval="preserveStartEnd" /> <YAxis domain={['dataMin - 1', 'dataMax + 1']} tickFormatter={(v) => formatCurrency(v)} fontSize={10} tick={{ fill: theme.palette.text.secondary }} allowDataOverflow={false}/> <Tooltip formatter={(value, name) => [formatCurrency(value), name]}/> <Legend wrapperStyle={{fontSize: "11px"}}/> <Line type="monotone" dataKey="Metro" stroke={theme.palette.primary.main} strokeWidth={2} dot={false} activeDot={{ r: 5 }} connectNulls={false} /> {selectedCompetitors.map((comp, index) => (<Line key={comp.competitorKey} type="monotone" dataKey={comp.competitorName} stroke={COLORS[index % COLORS.length]} strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} strokeDasharray="4 2" connectNulls={false}/>))} </LineChart> ) : ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">{loading ? 'Loading...' : 'No pricing data.'}</Typography></Box> )}
                                 </ResponsiveContainer>
                              </Box>
                         </Paper>
                     </Grid>
                     <Grid item xs={12} md={6}> {/* Correlation Chart */}
                        {/* ... Chart Code as Before ... */}
                         <Paper elevation={3} sx={{ p: 2, height: '350px', display: 'flex', flexDirection: 'column' }}>
                             <Typography variant="h6" sx={{ mb: 1, flexShrink: 0, color: 'text.primary' }}>Price, Sales, Profit & Forecast</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                 <ResponsiveContainer width="100%" height="100%">
                                     {correlationChartData.length > 0 ? ( <ComposedChart data={correlationChartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}> <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider}/> <XAxis dataKey="displayDate" fontSize={10} tick={{ fill: theme.palette.text.secondary }} interval="preserveStartEnd"/> <YAxis yAxisId="left" orientation="left" domain={['auto', 'auto']} label={{ value: 'Price / Profit (EGP)', angle: -90, position: 'insideLeft', style: {fontSize: 10, fill: theme.palette.text.secondary} }} tickFormatter={(v) => v.toFixed(0)} fontSize={10} tick={{ fill: theme.palette.primary.main }} stroke={theme.palette.primary.main} allowDataOverflow={false}/> <YAxis yAxisId="right" orientation="right" domain={[0, 'auto']} label={{ value: 'Quantity', angle: 90, position: 'insideRight', style: {fontSize: 10, fill: theme.palette.text.secondary} }} fontSize={10} tick={{ fill: theme.palette.secondary.main }} stroke={theme.palette.secondary.main}/> <Tooltip formatter={(value, name) => { if (name === 'Metro Price' || name === 'Gross Profit') return formatCurrency(value); if (name === 'Units Sold' || name === 'Forecast') return value?.toLocaleString() ?? 'N/A'; return value; }}/> <Legend wrapperStyle={{fontSize: "11px"}}/> <Bar yAxisId="right" dataKey="quantitySold" name="Units Sold" fill={theme.palette.secondary.light} barSize={15}/> <Line yAxisId="left" type="monotone" dataKey="metroPrice" name="Metro Price" stroke={theme.palette.primary.dark} strokeWidth={2} dot={false} activeDot={{ r: 5 }} connectNulls={false}/> <Line yAxisId="left" type="monotone" dataKey="grossProfit" name="Gross Profit" stroke={theme.palette.success.main} strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} strokeDasharray="5 5" connectNulls={false}/> <Line yAxisId="right" type="monotone" dataKey="forecastedQuantity" name="Forecast" stroke={theme.palette.grey[500]} strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} strokeDasharray="3 3" connectNulls={false}/> </ComposedChart> ) : ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">{loading ? 'Loading...' : 'No data.'}</Typography></Box> )}
                                 </ResponsiveContainer>
                             </Box>
                         </Paper>
                     </Grid>
                      <Grid item xs={12} md={6}> {/* Price Gap Chart */}
                         {/* ... Chart Code as Before ... */}
                         <Paper elevation={3} sx={{ p: 2, height: '350px', display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="h6" sx={{ mb: 1, flexShrink: 0, color: 'text.primary' }}>Metro Price Gap vs Avg. Competitor (%)</Typography>
                              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                 <ResponsiveContainer width="100%" height="100%">
                                     {priceGapChartData.length > 0 ? ( <LineChart data={priceGapChartData} margin={{ top: 5, right: 5, left: 10, bottom: 5 }}> <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider}/> <XAxis dataKey="displayDate" fontSize={10} tick={{ fill: theme.palette.text.secondary }} interval="preserveStartEnd" /> <YAxis domain={['auto', 'auto']} tickFormatter={(v) => `${v}%`} fontSize={10} tick={{ fill: theme.palette.text.secondary }} /> <Tooltip formatter={(value) => [formatPercent(value, 1), "Price Gap %"]}/> <Legend wrapperStyle={{fontSize: "11px"}}/> <Line type="monotone" dataKey="priceGapPercent" name="Price Gap %" stroke={theme.palette.warning.main} strokeWidth={2} dot={false} activeDot={{ r: 5 }} connectNulls={false} /> </LineChart> ) : ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">{loading ? 'Loading...' : selectedCompetitors.length === 0 ? 'Select competitors' : 'No gap data.'}</Typography></Box> )}
                                 </ResponsiveContainer>
                              </Box>
                         </Paper>
                     </Grid>
                      <Grid item xs={12} md={6}> {/* Scatter Plot */}
                         {/* ... Chart Code as Before ... */}
                         <Paper elevation={3} sx={{ p: 2, height: '350px', display: 'flex', flexDirection: 'column' }}>
                             <Typography variant="h6" sx={{ mb: 1, flexShrink: 0, color: 'text.primary' }}>Daily Price vs Quantity Sold</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                 <ResponsiveContainer width="100%" height="100%">
                                     {scatterPlotData.length > 0 ? ( <ScatterChart margin={{ top: 5, right: 20, bottom: 20, left: 10 }}> <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider}/> <XAxis type="number" dataKey="metroPrice" name="Metro Price (EGP)" domain={['dataMin - 1', 'dataMax + 1']} tickFormatter={(v) => v.toFixed(0)} fontSize={10} tick={{ fill: theme.palette.text.secondary }} label={{ value: "Price (EGP)", position: 'insideBottom', offset: -10, style: {fontSize: 10, fill: theme.palette.text.secondary} }}/> <YAxis type="number" dataKey="quantitySold" name="Units Sold" domain={[0, 'auto']} fontSize={10} tick={{ fill: theme.palette.text.secondary }} label={{ value: "Units Sold", angle: -90, position: 'insideLeft', style: {fontSize: 10, fill: theme.palette.text.secondary} }}/> <ZAxis type="number" range={[60, 60]} /> <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name) => { if (name === 'Metro Price (EGP)') return formatCurrency(value); if (name === 'Units Sold') return value.toLocaleString(); return value; }}/> <Legend wrapperStyle={{fontSize: "11px"}}/> <Scatter name="Daily Sales" data={scatterPlotData} fill={theme.palette.secondary.main} /> </ScatterChart> ) : ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">{loading ? 'Loading...' : 'No sales data.'}</Typography></Box> )}
                                 </ResponsiveContainer>
                             </Box>
                         </Paper>
                     </Grid>
                 </Grid>
            </Box>
        </LocalizationProvider>
    );
};

export default DynamicPricingDashboard;