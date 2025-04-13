import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Select, MenuItem, FormControl, InputLabel, Paper, Divider, CircularProgress, Alert, Chip, Tooltip as MuiTooltip, Button, useTheme, Autocomplete, TextField, Skeleton // Removed unused Tabs, Tab, Link
} from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { BarChart, Bar, ScatterChart, Scatter, LineChart, Line, Sankey, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ZAxis } from 'recharts';
import { subDays, format, parseISO, isValid, startOfDay, endOfDay, eachDayOfInterval, addSeconds } from 'date-fns';

// MUI Icons
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StorefrontIcon from '@mui/icons-material/Storefront';
import RouteIcon from '@mui/icons-material/Route';
import TrafficIcon from '@mui/icons-material/Traffic';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import GrainIcon from '@mui/icons-material/Grain';
import MapIcon from '@mui/icons-material/Map';

// Import data generators
import { generateMockSalesData, getMockStores, getMockStoreZones, getMockCategories } from '../utils/mockDataGenerator';
import { generateMockCustomerBehaviorData } from '../utils/mockCustomerBehaviorGenerator';

// --- Constants ---
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// --- Helper Functions ---
const formatSeconds = (secs) => { if (secs === null || secs === undefined || !isFinite(secs)) return 'N/A'; if (secs < 60) return `${Math.round(secs)}s`; return `${Math.round(secs / 60)}m ${Math.round(secs % 60)}s`; };
const formatNumber = (value, digits = 0) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return value.toLocaleString('en-US', { maximumFractionDigits: digits }); };
const formatCurrency = (value) => { if (value === null || value === undefined || !isFinite(value)) return 'N/A'; return `EGP ${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`; };
const formatDate = (isoString) => { try { const d = parseISO(isoString); return isValid(d) ? format(d, 'MMM d, yyyy') : 'Invalid'; } catch { return 'Invalid'; } };


// --- Custom Tooltip for Sankey ---
const SankeyTooltipContent = ({ active, payload }) => { if (active && payload && payload.length) { const data = payload[0].payload; if(data.source && data.target && data.source.name && data.target.name) { return ( <Paper sx={{ p: 1, background: 'rgba(255, 255, 255, 0.9)', borderRadius: 1 }}><Typography variant="caption" display="block">{data.source.name} → {data.target.name}: {formatNumber(data.value)} Trips</Typography></Paper> ); } const nodePayload = payload[0]; if(nodePayload && nodePayload.name && nodePayload.value !== undefined) { return ( <Paper sx={{ p: 1, background: 'rgba(255, 255, 255, 0.9)', borderRadius: 1 }}><Typography variant="caption" display="block" sx={{fontWeight: 'bold'}}>Zone: {nodePayload.name}</Typography><Typography variant="caption" display="block">Total Flow: {formatNumber(nodePayload.value)} Trips</Typography></Paper> ); } } return null; };

// *** KpiCard Component - REMOVED Tooltip Wrapper ***
const KpiCard = ({ title, value, formatFunc = formatNumber, icon, loading, color = 'text.secondary', tooltip = '' /* Tooltip prop no longer used by wrapper */ }) => (
    <Card elevation={2} sx={{ height: '100%' }}>
        <CardContent>
            <MuiTooltip title={tooltip} placement="top" arrow disableHoverListener={!tooltip}>
                {/* Tooltip can optionally wrap just the title */}
                <Typography sx={{ fontSize: 14, mb: 1 }} color="text.secondary" gutterBottom>{title}</Typography>
            </MuiTooltip>
            <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 36 }}>
                {loading ? (<Skeleton variant="text" width="80%" />) : (
                    <>
                        {icon && React.cloneElement(icon, { sx: { mr: 1.5, color: color }, fontSize: "medium" })}
                        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                            {(value !== null && value !== undefined && (typeof value !== 'number' || isFinite(value))) ? formatFunc(value) : 'N/A'}
                        </Typography>
                    </>
                )}
            </Box>
        </CardContent>
    </Card>
);


// --- Main Component ---
const CustomerBehaviorDashboard = () => {
    const theme = useTheme();

    // State
    const [loading, setLoading] = useState(true); const [error, setError] = useState(null); const [behaviorData, setBehaviorData] = useState([]); const [salesData, setSalesData] = useState([]); const [zones, setZones] = useState([]); const [categories, setCategories] = useState([]);
    const [dateRange, setDateRange] = useState([startOfDay(subDays(new Date(), 6)), endOfDay(new Date())]);
    const [selectedStore, setSelectedStore] = useState('');

    // Dimensions for Filters
    const stores = useMemo(() => getMockStores().sort((a,b)=> a.storeName.localeCompare(b.storeName)), []);

    // Initialize first store
    useEffect(() => { if (!selectedStore && stores.length > 0) { setSelectedStore(stores[0].storeKey); } }, [stores, selectedStore]);

    // Create Zone -> Category Mapping
    const zoneCategoryMap = useMemo(() => { const map = {}; const zonesData = getMockStoreZones(); const categoriesData = getMockCategories(); zonesData.forEach(zone => { map[zone.zoneKey] = zone.categoryKeys.map(ck => categoriesData.find(cat => cat.categoryKey === ck)?.name).filter(Boolean); }); return map; }, []);

    // --- Data Fetching ---
    useEffect(() => {
        setLoading(true); setError(null); const [start, end] = dateRange; if (!isValid(start) || !isValid(end)) { setError("Invalid date range."); setLoading(false); return; }
        Promise.all([ new Promise(res => setTimeout(() => res(generateMockCustomerBehaviorData(start, end)), 700)), new Promise(res => setTimeout(() => res(generateMockSalesData(start, end)), 500)), new Promise(res => setTimeout(() => res(getMockStoreZones()), 50)), new Promise(res => setTimeout(() => res(getMockCategories()), 50)), ])
        .then(([behavior, sales, zoneData, categoryData]) => { if (!Array.isArray(behavior) || !Array.isArray(sales) || !Array.isArray(zoneData) || !Array.isArray(categoryData)) { throw new Error("Data generation failed."); } setBehaviorData(behavior); setSalesData(sales); setZones(zoneData); setCategories(categoryData); setLoading(false); })
        .catch(err => { console.error("Error loading behavior data:", err); setError(`Failed: ${err.message}`); setLoading(false); });
    }, [dateRange]);

    // --- Filtered Data ---
    const filteredBehavior = useMemo(() => { if (loading || !selectedStore || !behaviorData.length) return []; return behaviorData.filter(b => b.storeKey === selectedStore); }, [loading, selectedStore, behaviorData]);
    const filteredSales = useMemo(() => { if (loading || !selectedStore || !salesData.length) return []; return salesData.filter(s => s.storeKey === selectedStore); }, [loading, selectedStore, salesData]);

    // --- KPIs & Aggregations ---
    const kpiData = useMemo(() => { if (!filteredBehavior.length) return { totalSessions: 0, avgDwell: 0, busiestZone: 'N/A', peakHour: 'N/A' }; const sessions = new Set(filteredBehavior.map(b => b.customerSessionId)); const totalDwell = filteredBehavior.reduce((sum, b) => sum + (b.dwellTimeSeconds || 0), 0); const avgDwell = sessions.size > 0 ? totalDwell / sessions.size : 0; const tBZ = filteredBehavior.reduce((acc, b) => { acc[b.zoneName] = (acc[b.zoneName] || 0) + 1; return acc; }, {}); const busiestZone = Object.entries(tBZ).sort(([,a],[,b]) => b-a)[0]?.[0] || 'N/A'; const tBH = filteredBehavior.reduce((acc, b) => { acc[b.hourOfDay] = (acc[b.hourOfDay] || 0) + 1; return acc; }, {}); const peakHour = Object.entries(tBH).sort(([,a],[,b]) => b-a)[0]?.[0]; return { totalSessions: sessions.size, avgDwell: avgDwell, busiestZone: busiestZone, peakHour: peakHour ? `${peakHour}:00 - ${parseInt(peakHour)+1}:00` : 'N/A' }; }, [filteredBehavior]);
    const zonePerformanceData = useMemo(() => { if (!filteredBehavior.length) return []; const zM = {}; filteredBehavior.forEach(b => { if (!zM[b.zoneKey]) { zM[b.zoneKey] = { name: b.zoneName, type: b.zoneType, sessions: new Set(), totalDwell: 0, eventCount: 0 }; } zM[b.zoneKey].sessions.add(b.customerSessionId); zM[b.zoneKey].totalDwell += b.dwellTimeSeconds || 0; zM[b.zoneKey].eventCount++; }); return Object.values(zM).map(z => ({ name: z.name, type: z.type, traffic: z.sessions.size, avgDwell: z.eventCount > 0 ? z.totalDwell / z.eventCount : 0 })).sort((a, b) => b.traffic - a.traffic); }, [filteredBehavior]);
    const salesCorrelationData = useMemo(() => { if (!zonePerformanceData.length || !filteredSales.length || !Object.keys(zoneCategoryMap).length || !zones.length) return []; const sBC = filteredSales.reduce((acc, s) => { const cN = s.categoryName || 'Unknown'; if (!acc[cN]) acc[cN] = { tS: 0, tQ: 0 }; acc[cN].tS += s.netSalesAmount || 0; acc[cN].tQ += s.quantitySold || 0; return acc; }, {}); return zonePerformanceData.map(zone => { const zK = zones.find(z => z.zoneName === zone.name)?.zoneKey; const zCs = zoneCategoryMap[zK] || []; let zS = 0; let zQ = 0; zCs.forEach(cN => { zS += sBC[cN]?.tS || 0; zQ += sBC[cN]?.tQ || 0; }); return { ...zone, zoneSales: zS, zoneQty: zQ }; }).filter(z => z.traffic > 0 || z.zoneSales > 0); }, [zonePerformanceData, filteredSales, zoneCategoryMap, zones]);
    const heatmapData = useMemo(() => { if (!filteredBehavior.length) return { data: [], yLabels: [] }; const hM = {}; const zN = [...new Set(filteredBehavior.map(z => z.zoneName))].sort(); const hrs = Array.from({length: 16}, (_, i) => 8 + i); filteredBehavior.forEach(b => { const key = `${b.zoneName}-${b.hourOfDay}`; hM[key] = (hM[key] || 0) + 1; }); const sD = []; zN.forEach((zName, zIdx) => { hrs.forEach((hr) => { const key = `${zName}-${hr}`; sD.push({ x: hr, y: zIdx, zoneName: zName, hourLabel: `${hr}:00`, value: hM[key] || 0 }); }); }); return { data: sD, yLabels: zN }; }, [filteredBehavior]);

    // ** SANKEY DATA LOGIC REVISED **
    const sankeyData = useMemo(() => {
        try {
            if (!filteredBehavior.length) return { nodes: [], links: [] };
            const paths = {}; const sessions = {};
            filteredBehavior.forEach(b => { if (!sessions[b.customerSessionId]) sessions[b.customerSessionId] = []; sessions[b.customerSessionId].push(b); });

            Object.values(sessions).forEach(sE => {
                sE.sort((a, b) => a.pathSequence - b.pathSequence);
                for (let i = 0; i < sE.length - 1; i++) {
                    const sN = sE[i].zoneName; const tN = sE[i+1].zoneName; const pTN = i > 0 ? sE[i-1].zoneName : null;
                    if (sN && tN && sN !== tN && tN !== pTN) { const key = `${sN}->${tN}`; paths[key] = (paths[key] || 0) + 1; }
                }
            });

            const invZN = new Set(); Object.keys(paths).forEach(k => { const [sN, tN] = k.split('->'); invZN.add(sN); invZN.add(tN); });
            const nodes = Array.from(invZN).map(name => ({ name }));
            if (nodes.length === 0) return { nodes: [], links: [] };

            const nodeIdxMap = new Map(nodes.map((n, i) => [n.name, i]));
            const links = Object.entries(paths)
                .map(([k, v]) => { const [sN, tN] = k.split('->'); const sI = nodeIdxMap.get(sN); const tI = nodeIdxMap.get(tN); if (sI !== undefined && tI !== undefined && sI !== tI && v > 0) { return { source: sI, target: tI, value: v }; } return null; })
                .filter(l => l !== null).sort((a, b) => b.value - a.value);

            let limitedLinks = links.slice(0, 20); // Limit further if needed

            // Prevent direct reversals in limited links
            const linkPairs = new Set();
            limitedLinks = limitedLinks.filter(link => { const pk1=`${link.source}-${link.target}`; const pk2=`${link.target}-${link.source}`; if(linkPairs.has(pk1)||linkPairs.has(pk2)){ return false; } linkPairs.add(pk1); linkPairs.add(pk2); return true; });

            // Final check: ensure nodes referenced by links exist
            const finalUsedNodeIndices = new Set();
            limitedLinks.forEach(link => { finalUsedNodeIndices.add(link.source); finalUsedNodeIndices.add(link.target); });
            const finalNodes = nodes.filter((_, i) => finalUsedNodeIndices.has(i));
            const finalNodeIndexMap = new Map(finalNodes.map((n, i) => [n.name, i]));
            const finalLinks = limitedLinks.map(link => { const sN = nodes[link.source]?.name; const tN = nodes[link.target]?.name; const nSI = finalNodeIndexMap.get(sN); const nTI = finalNodeIndexMap.get(tN); if (nSI !== undefined && nTI !== undefined) { return { source: nSI, target: nTI, value: link.value }; } return null; }).filter(l => l !== null);

            if (finalNodes.length === 0 && finalLinks.length > 0) { console.warn("Sankey: Links exist but no nodes."); return { nodes: [], links: [] }; }

            // console.log("Final Sankey Nodes:", finalNodes.length, "Final Sankey Links:", finalLinks.length);
            return { nodes: finalNodes, links: finalLinks };

        } catch (sankeyError) { console.error("Sankey calculation error:", sankeyError); return { nodes: [], links: [] }; }
    }, [filteredBehavior]);


    // --- Render Logic ---
    if (error) { return <Box sx={{ padding: 3 }}><Alert severity="error" sx={{ mt: 2 }}>{error}</Alert></Box>; }

    const chartPaperHeight = '450px';

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
                    Customer Behavior Analysis
                </Typography>

                 {/* Filters */}
                <Paper elevation={2} sx={{ p: {xs: 1, sm: 2}, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                         <Grid item xs={12} sm={6} md={4}> <FormControl fullWidth variant="outlined" size="small"> <InputLabel>Store</InputLabel> <Select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)} label="Store" disabled={loading}> {stores.map(s => <MenuItem key={s.storeKey} value={s.storeKey}>{s.storeName}</MenuItem>)} </Select> </FormControl> </Grid>
                         <Grid item xs={12} sm={6} md={8}> <DateRangePicker localeText={{ start: "Start Date", end: "End Date" }} value={dateRange} onChange={(r) => { if (r && r.length === 2 && isValid(r[0]) && isValid(r[1])) { setDateRange([startOfDay(r[0]), endOfDay(r[1])]); } }} slotProps={{ textField: { variant: 'outlined', size: 'small', fullWidth: true } }} /> </Grid>
                    </Grid>
                </Paper>

                {/* KPIs */}
                <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={3}><KpiCard title="Total Customer Sessions" value={kpiData.totalSessions} icon={<PeopleAltIcon />} loading={loading} /></Grid>
                    <Grid item xs={6} sm={3}><KpiCard title="Avg. Dwell Time / Session" value={kpiData.avgDwell} formatFunc={formatSeconds} icon={<AccessTimeFilledIcon />} loading={loading} /></Grid>
                    <Grid item xs={6} sm={3}><KpiCard title="Busiest Zone (Events)" value={kpiData.busiestZone} formatFunc={v => v} icon={<LocationOnIcon />} loading={loading} /></Grid>
                    <Grid item xs={6} sm={3}><KpiCard title="Peak Hour (Est.)" value={kpiData.peakHour} formatFunc={v => v} icon={<TrafficIcon />} loading={loading} /></Grid>
                </Grid>

                {/* Charts - Stacked Full Width */}
                 <Grid container spacing={3}>
                     {/* Zone Performance */}
                     <Grid item xs={12}>
                         <Paper elevation={3} sx={{ p: 2, height: '800px', display: 'flex', flexDirection: 'column' }}>
                             <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Zone Performance (Traffic & Dwell)</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                 <ResponsiveContainer width="100%" height="100%">
                                     {loading ? <Skeleton variant="rectangular" height="100%" /> : zonePerformanceData.length > 0 ? (
                                         <ComposedChart layout="vertical" data={zonePerformanceData.slice(0, 12)} margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                                             <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider}/>
                                             <XAxis type="number" xAxisId="trafficAxis" orientation='top' fontSize={10} tick={{ fill: theme.palette.text.secondary }}/>
                                             <XAxis type="number" xAxisId="dwellAxis" orientation="bottom" fontSize={10} tickFormatter={formatSeconds} tick={{ fill: theme.palette.text.secondary }}/>
                                             <YAxis dataKey="name" type="category" width={100} interval={0} fontSize={11} tick={{ fill: theme.palette.text.secondary }}/>
                                             <Tooltip formatter={(value, name) => name === 'Avg Dwell / Visit' ? formatSeconds(value) : formatNumber(value)}/>
                                             <Legend wrapperStyle={{fontSize: "11px"}}/>
                                             <Bar xAxisId="trafficAxis" dataKey="traffic" name="Unique Sessions" barSize={15} fill={theme.palette.primary.light} />
                                             <Line xAxisId="dwellAxis" type="monotone" dataKey="avgDwell" name="Avg Dwell / Visit" stroke={theme.palette.secondary.main} strokeWidth={2} dot={false}/>
                                         </ComposedChart>
                                     ) : ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No data.</Typography></Box> )}
                                 </ResponsiveContainer>
                              </Box>
                         </Paper>
                     </Grid>
                     {/* Sales Correlation */}
                     <Grid item xs={12}>
                          <Paper elevation={3} sx={{ p: 2, height: '800px', display: 'flex', flexDirection: 'column' }}>
                             <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Zone Traffic vs Category Sales</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                 <ResponsiveContainer width="100%" height="100%">
                                      {loading ? <Skeleton variant="rectangular" height="100%" /> : salesCorrelationData.length > 0 ? (
                                         <ScatterChart margin={{ top: 5, right: 20, bottom: 30, left: 20 }}>
                                             <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider}/>
                                             <XAxis type="number" dataKey="traffic" name="Unique Sessions" domain={[0, 'auto']} tickFormatter={(v) => formatNumber(v)} fontSize={10} tick={{ fill: theme.palette.text.secondary }} label={{ value: "Zone Traffic (Sessions)", position: 'insideBottom', offset: -15, style:{fontSize: 11}}}/>
                                             <YAxis type="number" dataKey="zoneSales" name="Category Sales" domain={[0, 'auto']} tickFormatter={(v) => `${formatNumber(v/1000)}k`} fontSize={10} tick={{ fill: theme.palette.text.secondary }} label={{ value: "Sales (EGP)", angle: -90, position: 'insideLeft', offset: 0, style:{fontSize: 11} }}/>
                                             <ZAxis type="number" dataKey="avgDwell" name="Avg Dwell" range={[60, 500]} />
                                             <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => { if (active && payload && payload.length) { const data = payload[0].payload; return ( <Paper sx={{ p: 1, background: 'rgba(255, 255, 255, 0.9)' }}><Typography variant="caption" display="block" sx={{fontWeight: 'bold'}}>{data.name}</Typography><Typography variant="caption" display="block">Traffic: {formatNumber(data.traffic)} sessions</Typography><Typography variant="caption" display="block">Avg Dwell: {formatSeconds(data.avgDwell)}</Typography><Typography variant="caption" display="block">Category Sales: {formatCurrency(data.zoneSales)}</Typography></Paper> ); } return null; }}/>
                                             <Legend wrapperStyle={{fontSize: "11px"}}/>
                                             <Scatter name="Zones" data={salesCorrelationData} fill={theme.palette.success.main} />
                                         </ScatterChart>
                                     ) : ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No correlation data.</Typography></Box> )}
                                 </ResponsiveContainer>
                              </Box>
                         </Paper>
                     </Grid>
                     {/* Traffic Heatmap */}
                     <Grid item xs={12}>
                          <Paper elevation={3} sx={{ p: 2, height: '800px', display: 'flex', flexDirection: 'column' }}>
                             <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Traffic Heatmap (Zone vs Hour)</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                 <ResponsiveContainer width="100%" height="100%">
                                      {loading ? <Skeleton variant="rectangular" height="100%" /> : heatmapData.data?.length > 0 ? (
                                         <ScatterChart margin={{ top: 5, right: 10, bottom: 20, left: 80 }}>
                                             <CartesianGrid stroke={theme.palette.divider}/>
                                             <XAxis type="number" dataKey="x" name="Hour" interval={0} ticks={[8,10,12,14,16,18,20,22]} tickFormatter={(h) => `${h}:00`} fontSize={10} tick={{ fill: theme.palette.text.secondary }} label={{ value: "Hour of Day", position: 'insideBottom', offset: -10, style:{fontSize: 11}}}/>
                                             <YAxis type="number" dataKey="y" name="Zone" interval={0} ticks={heatmapData.yLabels.map((_, i) => i)} tickFormatter={(i) => heatmapData.yLabels[i]} width={100} fontSize={10} tick={{ fill: theme.palette.text.secondary }}/>
                                             <ZAxis type="number" dataKey="value" range={[60, 1200]} />
                                             <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => { if (active && payload && payload.length) { const data = payload[0].payload; return ( <Paper sx={{ p: 1, background: 'rgba(255, 255, 255, 0.9)' }}><Typography variant="caption">{data.zoneName} @ {data.hourLabel}: {formatNumber(data.value)} events</Typography></Paper> ); } return null; }}/>
                                             <Scatter data={heatmapData.data} fill={theme.palette.warning.main} shape="square" />
                                         </ScatterChart>
                                     ) : ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No heatmap data.</Typography></Box> )}
                                 </ResponsiveContainer>
                              </Box>
                         </Paper>
                     </Grid>
                      {/* Path Analysis (Sankey) */}
                     <Grid item xs={12}>
                          <Paper elevation={3} sx={{ p: 2, height: '1000px', display: 'flex', flexDirection: 'column' }}>
                             <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>Top Customer Paths</Typography>
                             <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                 <ResponsiveContainer width="100%" height="100%">
                                      {loading ? <Skeleton variant="rectangular" height="100%" /> : sankeyData.nodes?.length > 0 && sankeyData.links?.length > 0 ? (
                                        <Sankey
                                            data={sankeyData}
                                            iterations={32}
                                            nodePadding={15}
                                            margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
                                            // ** Use default link and node rendering for better interactivity **
                                            link={{ stroke: theme.palette.info.light, strokeOpacity: 0.5 }}
                                            // node={{ fill: theme.palette.primary.main, fillOpacity: 0.9 }} // Optionally set default node style if needed
                                            // Removed custom node renderer
                                        >
                                            <Tooltip content={<SankeyTooltipContent />} />
                                            {/* Recharts Sankey doesn't have a built-in Legend component */}
                                        </Sankey>
                                     ) : ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="textSecondary">No path data.</Typography></Box> )}
                                 </ResponsiveContainer>
                              </Box>
                         </Paper>
                     </Grid>
                 </Grid>
            </Box>
        </LocalizationProvider>
    );
};

export default CustomerBehaviorDashboard;