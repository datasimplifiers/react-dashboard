// InventoryOptimizationDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Chip,
  Tooltip as MuiTooltip,
  Button,
  useTheme,
  Autocomplete,
  TextField,
  Skeleton,
  Tabs,
  Tab,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  LinearProgress,
} from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  subDays,
  format,
  addDays,
  parseISO,
  isValid,
  startOfDay,
  endOfDay,
  differenceInDays,
  eachDayOfInterval,
} from 'date-fns';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Cell,
} from 'recharts';

// MUI Icons
import Inventory2Icon from '@mui/icons-material/Inventory2';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AutorenewIcon from '@mui/icons-material/Autorenew'; // Stock Turn
import RuleIcon from '@mui/icons-material/Rule'; // Forecast Accuracy
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'; // Recommendations
import FactCheckIcon from '@mui/icons-material/FactCheck'; // PO Status
import LocalShippingIcon from '@mui/icons-material/LocalShipping'; // Supplier
import StorefrontIcon from '@mui/icons-material/Storefront'; // Location filter
import CategoryIcon from '@mui/icons-material/Category'; // Category filter

// Import data generators
import {
  getMockStores,
  getMockProducts,
  getMockCategories,
  getMockSuppliers,
  generateMockSalesData,
} from '../utils/mockDataGenerator';
import { generateMockInventorySnapshots } from '../utils/mockInventoryDataGenerator';
import { generateMockForecastData } from '../utils/mockPricingForecastGenerator';
import { generateMockPurchaseOrderData } from '../utils/mockPurchaseOrderGenerator';

// --- Constants ---
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
const SAFETY_STOCK_DAYS = 7;
const REVIEW_PERIOD_DAYS = 1;
const DEFAULT_STOCK_STATUS = { understocked: [], overstocked: [] }; // Default object

// --- Helper Functions ---
const formatCurrency = (value) => {
  if (value === null || value === undefined || !isFinite(value)) return 'N/A';
  return `EGP ${value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};
const formatNumber = (value, digits = 0) => {
  if (value === null || value === undefined || !isFinite(value)) return 'N/A';
  return value.toLocaleString('en-US', { maximumFractionDigits: digits });
};
const formatPercent = (value, digits = 1) => {
  if (value === null || value === undefined || !isFinite(value)) return 'N/A';
  return `${value.toFixed(digits)}%`;
};
const formatDate = (isoString) => {
  try {
    const d = parseISO(isoString);
    return isValid(d) ? format(d, 'MMM d') : '';
  } catch {
    return '';
  }
};
const formatDateFull = (isoString) => {
  try {
    const d = parseISO(isoString);
    return isValid(d) ? format(d, 'MMM d, yyyy') : 'Invalid';
  } catch {
    return 'Invalid';
  }
};
const getLatestSnapshots = (snapshots) => {
  const latest = {};
  snapshots.forEach((s) => {
    const key = `${s.productKey}-${s.locationKey}`;
    if (!latest[key] || s.snapshotDate > latest[key].snapshotDate) {
      latest[key] = s;
    }
  });
  return Object.values(latest);
};

// --- KpiCard Component ---
const KpiCard = ({
  title,
  value,
  formatFunc = formatNumber,
  icon,
  loading,
  color = 'text.secondary',
  tooltip = '',
  valueColor,
}) => (
  <MuiTooltip title={tooltip} placement="top" arrow disableHoverListener={!tooltip}>
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Typography sx={{ fontSize: 14, mb: 1 }} color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 36 }}>
          {loading ? (
            <Skeleton variant="text" width="80%" />
          ) : (
            <>
              {icon && React.cloneElement(icon, { sx: { mr: 1.5, color: color }, fontSize: 'medium' })}
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: valueColor || color }}>
                {(value !== null && value !== undefined && (typeof value !== 'number' || isFinite(value)))
                  ? formatFunc(value)
                  : 'N/A'}
              </Typography>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  </MuiTooltip>
);

// --- Main Component ---
const InventoryOptimizationDashboard = () => {
  const theme = useTheme();

  // --- State Hooks ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inventorySnapshots, setInventorySnapshots] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([{ locationKey: 'ALL', locationName: 'All Locations', locationType: 'ALL' }]);
  const [dateRange, setDateRange] = useState([startOfDay(subDays(new Date(), 29)), endOfDay(new Date())]);
  const [selectedLocationKey, setSelectedLocationKey] = useState('ALL');
  const [selectedCategoryKey, setSelectedCategoryKey] = useState('ALL');
  const [currentTab, setCurrentTab] = useState(0);
  const [recommendationParams, setRecommendationParams] = useState({
    safetyStockDays: SAFETY_STOCK_DAYS,
    reviewPeriodDays: REVIEW_PERIOD_DAYS,
  });

  // --- Top-level Hook: useRef for dateRange ---
  const dateRangeRef = useRef(dateRange);

  // --- Data Fetching & Dimension Loading Effect ---
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    console.log('Effect: Starting data fetch cycle...');

    const fetchAllData = async () => {
      try {
        // 1. Load Dimensions first (synchronously)
        const prods = getMockProducts();
        const cats = getMockCategories();
        const supps = getMockSuppliers();
        const storesData = getMockStores();
        const locs = [
          { locationKey: 'ALL', locationName: 'All Locations', locationType: 'ALL' },
          ...storesData
            .map((s) => ({
              locationKey: `LOC_${s.storeKey}`,
              locationName: s.storeName,
              locationType: 'Store',
            }))
            .sort((a, b) => a.locationName.localeCompare(b.locationName)),
        ];
        if (!isMounted) return;
        setProducts(prods);
        setCategories(cats);
        setSuppliers(supps);
        setLocations(locs);
        console.log('Effect: Dimensions set.');

        // Check if dates are valid before proceeding
        const [start, end] = dateRangeRef.current;
        if (!isValid(start) || !isValid(end))
          throw new Error('Invalid date range for fetch.');
        const historyStart = subDays(start, 90);

        // 2. Fetch Transactional Data in parallel
        console.log('Effect: Fetching transactional data...');
        const [inv, sales, forecast, pos] = await Promise.all([
          new Promise((res) => setTimeout(() => res(generateMockInventorySnapshots(historyStart, end)), 800)),
          new Promise((res) => setTimeout(() => res(generateMockSalesData(historyStart, end)), 500)),
          new Promise((res) =>
            setTimeout(() => {
              const salesHist = generateMockSalesData(subDays(historyStart, 30), subDays(historyStart, 1));
              res(generateMockForecastData(start, addDays(end, 30), salesHist));
            }, 600)
          ),
          new Promise((res) => setTimeout(() => res(generateMockPurchaseOrderData(subDays(start, 60), end)), 400)),
        ]);

        if (!isMounted) return;
        if (!inv || !sales || !forecast || !pos)
          throw new Error('Transactional data generation failed.');
        setInventorySnapshots(inv);
        setSalesData(sales);
        setForecastData(forecast);
        setPurchaseOrders(pos);
        console.log('Effect: Transactional data fetch complete.');
      } catch (err) {
        if (!isMounted) return;
        console.error('Error during data fetch:', err);
        setError(`Failed to load data: ${err.message}`);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    // Update the ref value with the current date range
    dateRangeRef.current = dateRange;

    fetchAllData();

    return () => {
      isMounted = false;
      console.log('Effect: Cleanup.');
    };
  }, [dateRange]);

  // --- Memoized Data Calculations ---

  const latestInventoryFiltered = useMemo(() => {
    if (inventorySnapshots.length === 0) return [];
    const [start, end] = dateRange;
    const snapsInRange = inventorySnapshots.filter((s) => {
      try {
        const d = parseISO(s.snapshotDate);
        return isValid(d) && d >= start && d <= end;
      } catch {
        return false;
      }
    });
    const latest = getLatestSnapshots(snapsInRange);
    return latest.filter(
      (s) => (selectedLocationKey === 'ALL' || s.locationKey === selectedLocationKey) &&
             (selectedCategoryKey === 'ALL' || s.categoryKey === selectedCategoryKey)
    );
  }, [inventorySnapshots, dateRange, selectedLocationKey, selectedCategoryKey]);

  const filteredSales = useMemo(() => {
    if (salesData.length === 0) return [];
    const [start, end] = dateRange;
    return salesData.filter((s) => {
      try {
        const d = parseISO(s.dateKey);
        return (
          isValid(d) &&
          d >= start &&
          d <= end &&
          (selectedLocationKey === 'ALL' || `LOC_${s.storeKey}` === selectedLocationKey) &&
          (selectedCategoryKey === 'ALL' || s.categoryKey === selectedCategoryKey)
        );
      } catch {
        return false;
      }
    });
  }, [salesData, dateRange, selectedLocationKey, selectedCategoryKey]);

  const filteredForecast = useMemo(() => {
    if (forecastData.length === 0 || products.length === 0) return [];
    const [start, end] = dateRange;
    return forecastData.filter((f) => {
      try {
        const d = parseISO(f.forecastDateKey);
        return (
          isValid(d) &&
          d >= start &&
          d <= end &&
          (selectedLocationKey === 'ALL' || `LOC_${f.locationKey}` === selectedLocationKey) &&
          (selectedCategoryKey === 'ALL' ||
            products.find((p) => p.productKey === f.productKey)?.categoryKey === selectedCategoryKey)
        );
      } catch {
        return false;
      }
    });
  }, [forecastData, dateRange, selectedLocationKey, selectedCategoryKey, products]);

  const filteredPOs = useMemo(() => {
    if (purchaseOrders.length === 0 || products.length === 0) return [];
    const [start, end] = dateRange;
    return purchaseOrders.filter((po) => {
      try {
        const d = parseISO(po.orderDate);
        return (
          isValid(d) &&
          d >= start &&
          d <= end &&
          (selectedLocationKey === 'ALL' || po.destinationLocationKey === selectedLocationKey) &&
          (selectedCategoryKey === 'ALL' ||
            products.find((p) => p.productKey === po.productKey)?.categoryKey === selectedCategoryKey)
        );
      } catch {
        return false;
      }
    });
  }, [purchaseOrders, dateRange, selectedLocationKey, selectedCategoryKey, products]);

  const historicalSalesAggregated = useMemo(() => {
    if (salesData.length === 0) return {};
    const [start] = dateRange;
    const hS = subDays(start, 90);
    const sH = salesData.filter((s) => {
      try {
        const d = parseISO(s.dateKey);
        return isValid(d) && d >= hS && d < start;
      } catch {
        return false;
      }
    });
    const sS = {};
    sH.forEach((s) => {
      const k = `${s.productKey}-${`LOC_${s.storeKey}`}`;
      if (!sS[k]) sS[k] = { tQ: 0, d: new Set() };
      sS[k].tQ += s.quantitySold || 0;
      sS[k].d.add(s.dateKey);
    });
    const aDS = {};
    Object.entries(sS).forEach(([k, d]) => {
      aDS[k] = d.d.size > 0 ? d.tQ / d.d.size : 0;
    });
    return aDS;
  }, [salesData, dateRange]);

  const inventoryKpiData = useMemo(() => {
    const dK = { totalValue: 0, oosRate: 0, stockTurn: 0 };
    if (latestInventoryFiltered.length === 0 || salesData.length === 0 || inventorySnapshots.length === 0)
      return dK;
    const tV = latestInventoryFiltered.reduce((s, i) => s + i.onHandValue, 0);
    const iSIP = new Set(filteredSales.map((s) => `${s.productKey}-${`LOC_${s.storeKey}`}`));
    const oSC = latestInventoryFiltered.filter(
      (s) => s.onHandQuantity <= 0 && iSIP.has(`${s.productKey}-${s.locationKey}`)
    ).length;
    const tIT = latestInventoryFiltered.length;
    const oR = tIT > 0 ? (oSC / tIT) * 100 : 0;
    const [st, en] = dateRange;
    const sIP = salesData.filter((s) => {
      try {
        const d = parseISO(s.dateKey);
        return isValid(d) && d >= st && d <= en;
      } catch {
        return false;
      }
    });
    const cg = sIP.reduce((s, i) => s + (i.costOfGoodsSold || 0), 0);
    const iOP = inventorySnapshots.filter((s) => {
      try {
        const d = parseISO(s.snapshotDate);
        return isValid(d) && d >= st && d <= en;
      } catch {
        return false;
      }
    });
    const dT = {};
    iOP.forEach((s) => {
      dT[s.snapshotDate] = (dT[s.snapshotDate] || 0) + s.onHandValue;
    });
    const dV = Object.values(dT);
    const aIV = dV.length > 0 ? dV.reduce((s, v) => s + v, 0) / dV.length : 0;
    const sT = aIV > 0 ? cg / aIV : 0;
    return { totalValue: tV, oosRate: oR, stockTurn: sT };
  }, [latestInventoryFiltered, filteredSales, dateRange, salesData, inventorySnapshots]);

  const forecastAccuracyKpi = useMemo(() => {
    if (filteredSales.length === 0 || filteredForecast.length === 0) return { accuracy: null };
    const sM = filteredSales.reduce((m, s) => {
      const k = `${s.dateKey}-${s.productKey}-${`LOC_${s.storeKey}`}`;
      m[k] = (m[k] || 0) + (s.quantitySold || 0);
      return m;
    }, {});
    let tAE = 0;
    let tA = 0;
    filteredForecast.forEach((f) => {
      const k = `${f.forecastDateKey}-${f.productKey}-${f.locationKey}`;
      const act = sM[k] || 0;
      const fc = f.forecastedQuantity || 0;
      if (act > 0) {
        tAE += Math.abs(act - fc);
        tA += act;
      }
    });
    const mape = tA > 0 ? (tAE / tA) * 100 : null;
    const acc = mape !== null ? 100 - mape : null;
    return { accuracy: acc };
  }, [filteredSales, filteredForecast]);

  const stockStatusItems = useMemo(() => {
    if (latestInventoryFiltered.length === 0 || Object.keys(historicalSalesAggregated).length === 0)
      return DEFAULT_STOCK_STATUS;
    const under = [];
    const over = [];
    latestInventoryFiltered.forEach((item) => {
      const avgS = historicalSalesAggregated[`${item.productKey}-${item.locationKey}`] || 0;
      const dos = avgS > 0 ? item.onHandQuantity / avgS : item.onHandQuantity > 0 ? 999 : 0;
      if (item.onHandQuantity <= avgS * recommendationParams.safetyStockDays * 0.5 && avgS > 0) {
        under.push({ ...item, daysOfSupply: Math.round(dos) });
      } else if (dos > 90) {
        over.push({ ...item, daysOfSupply: Math.round(dos) });
      }
    });
    under.sort((a, b) => a.daysOfSupply - b.daysOfSupply);
    over.sort((a, b) => b.daysOfSupply - a.daysOfSupply);
    return { understocked: under.slice(0, 20), overstocked: over.slice(0, 20) };
  }, [latestInventoryFiltered, historicalSalesAggregated, recommendationParams.safetyStockDays]);

  const purchaseRecommendations = useMemo(() => {
    if (
      latestInventoryFiltered.length === 0 ||
      suppliers.length === 0 ||
      forecastData.length === 0 ||
      products.length === 0 ||
      Object.keys(historicalSalesAggregated).length === 0
    )
      return [];
    const recs = [];
    const openPOs = purchaseOrders.filter(
      (po) => po.status === 'Ordered' || po.status === 'Pending Receipt' || po.status === 'Partially Received'
    );
    const qoMap = openPOs.reduce((map, po) => {
      const key = `${po.productKey}-${po.destinationLocationKey}`;
      const remainingQty = po.orderedQuantity - (po.receivedQuantity || 0);
      map[key] = (map[key] || 0) + remainingQty;
      return map;
    }, {});
    const supplierMap = new Map(suppliers.map((s) => [s.supplierKey, s]));
    latestInventoryFiltered.forEach((item) => {
      const product = products.find((p) => p.productKey === item.productKey);
      const supplier = supplierMap.get(product?.supplierKey);
      if (!product || !supplier) return;
      const locationKey = item.locationKey;
      const lookupKey = `${item.productKey}-${locationKey}`;
      const onHand = item.onHandQuantity;
      const avgDailySales = historicalSalesAggregated[lookupKey] || 0.1;
      const leadTime = supplier.leadTimeDays || 7;
      const safetyStockQty = avgDailySales * recommendationParams.safetyStockDays;
      const reorderPoint = avgDailySales * leadTime + safetyStockQty;
      const qtyOnOrder = qoMap[lookupKey] || 0;
      const effectiveStock = onHand + qtyOnOrder;
      if (effectiveStock <= reorderPoint) {
        const lookAheadDays = leadTime + recommendationParams.reviewPeriodDays + recommendationParams.safetyStockDays;
        const periodEndDate = addDays(new Date(), lookAheadDays);
        const relevantForecasts = forecastData.filter((f) => {
          try {
            const fDate = parseISO(f.forecastDateKey);
            return (
              f.productKey === item.productKey &&
              `LOC_${f.locationKey}` === locationKey &&
              isValid(fDate) &&
              fDate >= startOfDay(new Date()) &&
              fDate <= endOfDay(periodEndDate)
            );
          } catch {
            return false;
          }
        });
        const forecastedDemand = relevantForecasts.reduce((sum, f) => sum + (f.forecastedQuantity || 0), 0);
        const demandEstimate = forecastedDemand > 0 ? forecastedDemand : avgDailySales * lookAheadDays;
        const targetStock = demandEstimate + safetyStockQty;
        let recommendedOrderQty = targetStock - effectiveStock;
        recommendedOrderQty = Math.max(0, Math.ceil(recommendedOrderQty));
        if (recommendedOrderQty > 0) {
          recs.push({
            productKey: item.productKey,
            productName: item.productName,
            locationKey: item.locationKey,
            locationName: item.locationName,
            supplierName: supplier.supplierName,
            currentStock: onHand,
            qtyOnOrder: qtyOnOrder,
            reorderPoint: Math.round(reorderPoint),
            avgDailySales: parseFloat(avgDailySales.toFixed(1)),
            recommendedOrderQty: recommendedOrderQty,
            estimatedCost: parseFloat((recommendedOrderQty * (item.unitCost || 1)).toFixed(2)),
          });
        }
      }
    });
    return recs.sort((a, b) => b.recommendedOrderQty - a.recommendedOrderQty);
  }, [latestInventoryFiltered, suppliers, forecastData, purchaseOrders, products, historicalSalesAggregated, recommendationParams]);

  // --- Compute Chart Data Outside of JSX ---
  const salesVsForecastChartData = useMemo(() => {
    if (filteredSales.length === 0 || filteredForecast.length === 0) return [];
    const cM = {};
    const [st, en] = dateRange;
    const dI = eachDayOfInterval({ start: st, end: en });
    dI.forEach((d) => {
      cM[format(d, 'yyyy-MM-dd')] = { date: format(d, 'yyyy-MM-dd'), Sales: 0, Forecast: 0 };
    });
    filteredSales.forEach((s) => {
      if (cM[s.dateKey]) cM[s.dateKey].Sales += s.quantitySold || 0;
    });
    filteredForecast.forEach((f) => {
      if (cM[f.forecastDateKey]) cM[f.forecastDateKey].Forecast += f.forecastedQuantity || 0;
    });
    return Object.values(cM)
      .map((d) => ({ ...d, displayDate: formatDate(d.date) }))
      .sort((a, b) => {
        try {
          return parseISO(a.date) - parseISO(b.date);
        } catch {
          return 0;
        }
      });
  }, [filteredSales, filteredForecast, dateRange]);

  // --- Compute Inventory by Category for the BarChart ---
  const inventoryByCategory = useMemo(() => {
    const byCat = latestInventoryFiltered.reduce((acc, item) => {
      const cat = item.categoryName || 'Unknown';
      acc[cat] = (acc[cat] || 0) + item.onHandValue;
      return acc;
    }, {});
    return Object.entries(byCat)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [latestInventoryFiltered]);

  // --- Handlers ---
  const handleTabChange = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  // --- Render Logic ---
  if (error) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const kpiLoading = false;
  const chartPaperHeight = '400px';

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
          Inventory Management & Optimization
        </Typography>

        {/* Filters */}
        <Paper elevation={2} sx={{ p: { xs: 1, sm: 2 }, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <DateRangePicker
                localeText={{ start: 'Start Date', end: 'End Date' }}
                value={dateRange}
                onChange={(r) => {
                  if (r && r.length === 2 && isValid(r[0]) && isValid(r[1])) {
                    setDateRange([startOfDay(r[0]), endOfDay(r[1])]);
                  }
                }}
                slotProps={{ textField: { variant: 'outlined', size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Location</InputLabel>
                <Select value={selectedLocationKey} onChange={(e) => setSelectedLocationKey(e.target.value)} label="Location" disabled={locations.length <= 1}>
                  {locations.map((l) => (
                    <MenuItem key={l.locationKey} value={l.locationKey}>
                      {l.locationName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Category</InputLabel>
                <Select value={selectedCategoryKey} onChange={(e) => setSelectedCategoryKey(e.target.value)} label="Category" disabled={categories.length === 0}>
                  <MenuItem value="ALL">All Categories</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.categoryKey} value={c.categoryKey}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* KPIs */}
        <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} md={2.4}>
            <KpiCard title="Total Inventory Value" value={inventoryKpiData.totalValue} formatFunc={formatCurrency} icon={<AttachMoneyIcon />} loading={kpiLoading} color="success.main" />
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <KpiCard title="Out of Stock Rate" value={inventoryKpiData.oosRate} formatFunc={(v) => formatPercent(v, 1)} icon={<ErrorOutlineIcon />} loading={kpiLoading} color="error.main" tooltip="Items with recent sales but 0 stock now / Total items" />
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <KpiCard title="Stock Turn (Period)" value={inventoryKpiData.stockTurn} formatFunc={(v) => formatNumber(v, 1)} icon={<AutorenewIcon />} loading={kpiLoading} tooltip="COGS / Avg Inventory Value for selected period" />
          </Grid>
          <Grid item xs={6} sm={6} md={2.4}>
            <KpiCard title="Forecast Accuracy" value={forecastAccuracyKpi.accuracy} formatFunc={(v) => formatPercent(v, 1)} icon={<RuleIcon />} loading={kpiLoading} color="info.main" tooltip="Approx. 100 - MAPE (Lower error = Higher accuracy)" />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <KpiCard
              title="Recommended PO Value"
              value={purchaseRecommendations.reduce((sum, r) => sum + (r.estimatedCost || 0), 0)}
              formatFunc={formatCurrency}
              icon={<AddShoppingCartIcon />}
              loading={kpiLoading}
              color="secondary.main"
              tooltip="Total estimated cost of recommended purchase orders"
            />
          </Grid>
        </Grid>

        {/* Tabs for Different Views */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="Inventory views">
            <Tab label="Current Status" id="inv-tab-0" aria-controls="inv-tabpanel-0" />
            <Tab label="Demand & Forecast" id="inv-tab-1" aria-controls="inv-tabpanel-1" />
            <Tab label="Purchase Recommendations" id="inv-tab-2" aria-controls="inv-tabpanel-2" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box>
          {/* Tab 0: Current Status */}
          <Box role="tabpanel" hidden={currentTab !== 0} id="inv-tabpanel-0" aria-labelledby="inv-tab-0">
            {currentTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} lg={6}>
                  <Paper elevation={2} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>
                      Inventory Value by Category
                    </Typography>
                    <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        {kpiLoading ? (
                          <Skeleton variant="rectangular" height="100%" />
                        ) : inventoryByCategory.length > 0 ? (
                          <BarChart data={inventoryByCategory} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" tickFormatter={(v) => `${formatNumber(v / 1000)}k`} fontSize={10} />
                            <YAxis dataKey="name" type="category" width={100} interval={0} fontSize={10} />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Bar dataKey="value" name="Inventory Value">
                              {COLORS.map((color, index) => (
                                <Cell key={`cell-${index}`} fill={color} />
                              ))}
                            </Bar>
                          </BarChart>
                        ) : (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <Typography color="textSecondary">No data for selection</Typography>
                          </Box>
                        )}
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <Paper elevation={2} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>
                      Stock Status Summary
                    </Typography>
                    <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="error">
                          Potentially Understocked ({stockStatusItems?.understocked?.length ?? 0})
                        </Typography>
                        <List dense sx={{ maxHeight: '300px', overflow: 'auto' }}>
                          {(stockStatusItems?.understocked ?? []).map((item) => (
                            <ListItem disablePadding key={item.productKey + item.locationKey}>
                              <ListItemText primary={item.productName} secondary={`${item.locationName} (${formatNumber(item.daysOfSupply)} days)`} primaryTypographyProps={{ fontSize: '0.8rem' }} secondaryTypographyProps={{ fontSize: '0.7rem' }} />
                            </ListItem>
                          ))}
                          {(!stockStatusItems?.understocked || stockStatusItems.understocked.length === 0) && (
                            <ListItem>
                              <ListItemText secondary="None" />
                            </ListItem>
                          )}
                        </List>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="warning.dark">
                          Potentially Overstocked ({stockStatusItems?.overstocked?.length ?? 0})
                        </Typography>
                        <List dense sx={{ maxHeight: '300px', overflow: 'auto' }}>
                          {(stockStatusItems?.overstocked ?? []).map((item) => (
                            <ListItem disablePadding key={item.productKey + item.locationKey}>
                              <ListItemText primary={item.productName} secondary={`${item.locationName} (${formatNumber(item.daysOfSupply)} days)`} primaryTypographyProps={{ fontSize: '0.8rem' }} secondaryTypographyProps={{ fontSize: '0.7rem' }} />
                            </ListItem>
                          ))}
                          {(!stockStatusItems?.overstocked || stockStatusItems.overstocked.length === 0) && (
                            <ListItem>
                              <ListItemText secondary="None" />
                            </ListItem>
                          )}
                        </List>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>

          {/* Tab 1: Demand & Forecast */}
          <Box role="tabpanel" hidden={currentTab !== 1} id="inv-tabpanel-1" aria-labelledby="inv-tab-1">
            {currentTab === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 2, height: chartPaperHeight, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" sx={{ mb: 1, flexShrink: 0 }}>
                      Sales vs. Forecast Quantity
                    </Typography>
                    <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        {kpiLoading ? (
                          <Skeleton variant="rectangular" height="100%" />
                        ) : salesVsForecastChartData.length > 0 ? (
                          <ComposedChart data={salesVsForecastChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="displayDate" fontSize={10} />
                            <YAxis fontSize={10} />
                            <Tooltip />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            <Bar dataKey="Sales" fill={theme.palette.secondary.light} name="Actual Sales" barSize={20} />
                            <Line type="monotone" dataKey="Forecast" stroke={theme.palette.grey[600]} name="Forecasted Sales" strokeWidth={2} dot={false} />
                          </ComposedChart>
                        ) : (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <Typography color="textSecondary">No sales/forecast data.</Typography>
                          </Box>
                        )}
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>

          {/* Tab 2: Purchase Recommendations */}
          <Box role="tabpanel" hidden={currentTab !== 2} id="inv-tabpanel-2" aria-labelledby="inv-tab-2">
            {currentTab === 2 && (
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Purchase Order Recommendations
                </Typography>
                <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                  Based on Reorder Point (Lead Time Demand + Safety Stock), Current Stock, Quantity on Order, and Forecasted Demand.
                </Typography>
                <TableContainer sx={{ maxHeight: 600 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Supplier</TableCell>
                        <TableCell align="right">Current Stock</TableCell>
                        <TableCell align="right">On Order</TableCell>
                        <TableCell align="right">Reorder Pt.</TableCell>
                        <TableCell align="right">Avg Dly Sales</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          Rec. Order Qty
                        </TableCell>
                        <TableCell align="right">Est. Cost</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {kpiLoading ? (
                        <TableRow>
                          <TableCell colSpan={9} align="center">
                            <CircularProgress size={24} />
                          </TableCell>
                        </TableRow>
                      ) : purchaseRecommendations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                            No recommendations.
                          </TableCell>
                        </TableRow>
                      ) : (
                        purchaseRecommendations.map((rec) => (
                          <TableRow hover key={rec.productKey + rec.locationKey}>
                            <TableCell>{rec.productName}</TableCell>
                            <TableCell>{rec.locationName}</TableCell>
                            <TableCell>{rec.supplierName}</TableCell>
                            <TableCell align="right">{formatNumber(rec.currentStock)}</TableCell>
                            <TableCell align="right">{formatNumber(rec.qtyOnOrder)}</TableCell>
                            <TableCell align="right">{formatNumber(rec.reorderPoint)}</TableCell>
                            <TableCell align="right">{formatNumber(rec.avgDailySales, 1)}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                              {formatNumber(rec.recommendedOrderQty)}
                            </TableCell>
                            <TableCell align="right">{formatCurrency(rec.estimatedCost)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default InventoryOptimizationDashboard;
