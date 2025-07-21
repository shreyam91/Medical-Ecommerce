// import React, { useState, useEffect } from "react";
// import {
//   CurrencyDollarIcon,
//   UserPlusIcon,
//   UserGroupIcon,
//   ArrowTrendingUpIcon,
// } from "@heroicons/react/24/outline";
// import { parse, isWithinInterval } from "date-fns";


// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   ArcElement,
//   RadialLinearScale,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   ArcElement,
//   RadialLinearScale,
//   Title,
//   Tooltip,
//   Legend
// );

// import { getCustomers } from '../lib/customerApi';
// import { getOrders } from '../lib/orderApi';
// import {
//   Bar,
//   Pie,
//   Doughnut,
//   Line,
//   PolarArea,
// } from 'react-chartjs-2';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

// const chartTypes = [
//   { value: 'bar', label: 'Bar' },
//   { value: 'line', label: 'Line' },
//   { value: 'pie', label: 'Pie' },
//   { value: 'doughnut', label: 'Doughnut' },
//   { value: 'polarArea', label: 'Polar Area' },
// ];

// const colorMap = {
//   'orders': '#2563eb',
//   'revenue': '#16a34a',
//   'customers': '#ca8a04',
//   'active': '#7c3aed',
//   'avg': '#f59e42',
//   'status': ['#2563eb', '#16a34a', '#ca8a04', '#f59e42', '#e11d48'],
// };

// const statusLabels = ['Ordered', 'Shipped', 'Delivered', 'Returned', 'Refunded'];

// const Dashboard = () => {
//   const [orders, setOrders] = useState([]);
//   const [customers, setCustomers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
//   const [endDate, setEndDate] = useState(new Date());
//   // Chart type per metric
//   const [chartType, setChartType] = useState({
//     orders: 'bar',
//     revenue: 'doughnut',
//     customers: 'pie',
//     active: 'bar',
//     avg: 'bar',
//     status: 'pie',
//     ordersTrend: 'line',
//     revenueTrend: 'line',
//   });

//   useEffect(() => {
//     setLoading(true);
//     Promise.all([
//       getOrders().catch(() => []),
//       getCustomers().catch(() => []),
//     ]).then(([ordersData, customersData]) => {
//       setOrders(ordersData);
//       setCustomers(customersData);
//       setLoading(false);
//     });
//   }, []);

//   // Filter by date range
//   const start = startDate;
//   const end = endDate;
//   const filteredOrders = orders.filter(o => {
//     const d = new Date(o.order_date || o.date || o.createdAt || o.created_at);
//     return d >= start && d <= end;
//   });
//   const filteredCustomers = customers.filter(c => {
//     const d = new Date(c.createdAt || c.created_at);
//     return d >= start && d <= end;
//   });

//   // Metrics
//   const totalOrders = filteredOrders.length;
//   const totalRevenue = filteredOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
//   const newCustomerCount = filteredCustomers.length;
//   // Active customers: those who placed at least one order in range
//   const activeCustomerIds = new Set(filteredOrders.map(o => o.customer_id));
//   const activeCustomers = customers.filter(c => activeCustomerIds.has(c.id));
//   const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
//   // Orders per day
//   const dayMap = {};
//   const revMap = {};
//   for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
//     const key = d.toISOString().slice(0, 10);
//     dayMap[key] = 0;
//     revMap[key] = 0;
//   }
//   filteredOrders.forEach(o => {
//     const d = new Date(o.order_date || o.date || o.createdAt || o.created_at).toISOString().slice(0, 10);
//     if (dayMap[d] !== undefined) {
//       dayMap[d]++;
//       revMap[d] += Number(o.total_amount || 0);
//     }
//   });
//   const ordersPerDayLabels = Object.keys(dayMap);
//   const ordersPerDayData = Object.values(dayMap);
//   const revenuePerDayData = Object.values(revMap);
//   // Order status breakdown
//   const statusCounts = statusLabels.map(status => filteredOrders.filter(o => o.status === status).length);

//   // Chart data
//   const ordersChart = {
//     labels: ['Orders'],
//     datasets: [{
//       label: 'Total Orders',
//       data: [totalOrders],
//       backgroundColor: [colorMap.orders],
//     }],
//   };
//   const revenueChart = {
//     labels: ['Revenue'],
//     datasets: [{
//       label: 'Total Revenue',
//       data: [totalRevenue],
//       backgroundColor: [colorMap.revenue],
//     }],
//   };
//   const customersChart = {
//     labels: ['New Customers'],
//     datasets: [{
//       label: 'New Customers',
//       data: [newCustomerCount],
//       backgroundColor: [colorMap.customers],
//     }],
//   };
//   const activeChart = {
//     labels: ['Active Customers'],
//     datasets: [{
//       label: 'Active Customers',
//       data: [activeCustomers.length],
//       backgroundColor: [colorMap.active],
//     }],
//   };
//   const avgChart = {
//     labels: ['Avg Order Value'],
//     datasets: [{
//       label: 'Avg Order Value',
//       data: [avgOrderValue],
//       backgroundColor: [colorMap.avg],
//     }],
//   };
//   const statusChart = {
//     labels: statusLabels,
//     datasets: [{
//       label: 'Order Status',
//       data: statusCounts,
//       backgroundColor: colorMap.status,
//     }],
//   };
//   const ordersTrendChart = {
//     labels: ordersPerDayLabels,
//     datasets: [{
//       label: 'Orders per Day',
//       data: ordersPerDayData,
//       backgroundColor: colorMap.orders,
//       borderColor: colorMap.orders,
//       fill: false,
//     }],
//   };
//   const revenueTrendChart = {
//     labels: ordersPerDayLabels,
//     datasets: [{
//       label: 'Revenue per Day',
//       data: revenuePerDayData,
//       backgroundColor: colorMap.revenue,
//       borderColor: colorMap.revenue,
//       fill: false,
//     }],
//   };

//   const chartComponent = (type, data) => {
//     switch (type) {
//       case 'bar': return <Bar data={data} options={{ plugins: { legend: { display: false } } }} />;
//       case 'line': return <Line data={data} options={{ plugins: { legend: { display: false } } }} />;
//       case 'pie': return <Pie data={data} options={{ plugins: { legend: { display: false } } }} />;
//       case 'doughnut': return <Doughnut data={data} options={{ plugins: { legend: { display: false } } }} />;
//       case 'polarArea': return <PolarArea data={data} options={{ plugins: { legend: { display: false } } }} />;
//       default: return <Bar data={data} options={{ plugins: { legend: { display: false } } }} />;
//     }
//   };

//   if (loading) {
//     return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
//   }

//   return (
//     <div className="p-6 space-y-8">
//       {/* Minimal Date Range Picker */}
//       <div className="flex gap-2 items-center mb-4">
//         <label className="font-medium">From:</label>
//         <DatePicker
//           selected={startDate}
//           onChange={date => setStartDate(date)}
//           selectsStart
//           startDate={startDate}
//           endDate={endDate}
//           maxDate={endDate}
//           className="border rounded px-2 py-1 w-32"
//           dateFormat="yyyy-MM-dd"
//         />
//         <label className="font-medium">To:</label>
//         <DatePicker
//           selected={endDate}
//           onChange={date => setEndDate(date)}
//           selectsEnd
//           startDate={startDate}
//           endDate={endDate}
//           minDate={startDate}
//           className="border rounded px-2 py-1 w-32"
//           dateFormat="yyyy-MM-dd"
//         />
//       </div>
//       {/* Metrics Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//         {/* Orders Stat */}
//         <div className="bg-white rounded shadow p-6 flex flex-col items-center">
//           <h2 className="text-lg font-semibold mb-2">Total Orders</h2>
//           <div className="w-full h-48 flex items-center justify-center">
//             {chartComponent(chartType.orders, ordersChart)}
//           </div>
//           <div className="mt-4 text-2xl font-bold text-blue-600">{totalOrders}</div>
//           <div className="mt-2">
//             <select value={chartType.orders} onChange={e => setChartType(t => ({ ...t, orders: e.target.value }))} className="border rounded px-2 py-1">
//               {chartTypes.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
//             </select>
//           </div>
//         </div>
//         {/* Revenue Stat */}
//         <div className="bg-white rounded shadow p-6 flex flex-col items-center">
//           <h2 className="text-lg font-semibold mb-2">Total Revenue</h2>
//           <div className="w-full h-48 flex items-center justify-center">
//             {chartComponent(chartType.revenue, revenueChart)}
//           </div>
//           <div className="mt-4 text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</div>
//           <div className="mt-2">
//             <select value={chartType.revenue} onChange={e => setChartType(t => ({ ...t, revenue: e.target.value }))} className="border rounded px-2 py-1">
//               {chartTypes.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
//             </select>
//           </div>
//         </div>
//         {/* New Customers Stat */}
//         <div className="bg-white rounded shadow p-6 flex flex-col items-center">
//           <h2 className="text-lg font-semibold mb-2">New Customers</h2>
//           <div className="w-full h-48 flex items-center justify-center">
//             {chartComponent(chartType.customers, customersChart)}
//           </div>
//           <div className="mt-4 text-2xl font-bold text-yellow-600">{newCustomerCount}</div>
//           <div className="mt-2">
//             <select value={chartType.customers} onChange={e => setChartType(t => ({ ...t, customers: e.target.value }))} className="border rounded px-2 py-1">
//               {chartTypes.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
//             </select>
//           </div>
//         </div>
//         {/* Active Customers Stat */}
//         <div className="bg-white rounded shadow p-6 flex flex-col items-center">
//           <h2 className="text-lg font-semibold mb-2">Active Customers</h2>
//           <div className="w-full h-48 flex items-center justify-center">
//             {chartComponent(chartType.active, activeChart)}
//           </div>
//           <div className="mt-4 text-2xl font-bold text-purple-600">{activeCustomers.length}</div>
//           <div className="mt-2">
//             <select value={chartType.active} onChange={e => setChartType(t => ({ ...t, active: e.target.value }))} className="border rounded px-2 py-1">
//               {chartTypes.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
//             </select>
//           </div>
//         </div>
//         {/* Average Order Value Stat */}
//         <div className="bg-white rounded shadow p-6 flex flex-col items-center">
//           <h2 className="text-lg font-semibold mb-2">Avg Order Value</h2>
//           <div className="w-full h-48 flex items-center justify-center">
//             {chartComponent(chartType.avg, avgChart)}
//           </div>
//           <div className="mt-4 text-2xl font-bold text-orange-600">₹{avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
//           <div className="mt-2">
//             <select value={chartType.avg} onChange={e => setChartType(t => ({ ...t, avg: e.target.value }))} className="border rounded px-2 py-1">
//               {chartTypes.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
//             </select>
//           </div>
//         </div>
//         {/* Order Status Breakdown */}
//         <div className="bg-white rounded shadow p-6 flex flex-col items-center">
//           <h2 className="text-lg font-semibold mb-2">Order Status Breakdown</h2>
//           <div className="w-full h-48 flex items-center justify-center">
//             {chartComponent(chartType.status, statusChart)}
//           </div>
//           <div className="mt-4 text-2xl font-bold text-pink-600">{statusLabels.map((s, i) => statusCounts[i] > 0 ? `${s}: ${statusCounts[i]}` : null).filter(Boolean).join(' | ')}</div>
//           <div className="mt-2">
//             <select value={chartType.status} onChange={e => setChartType(t => ({ ...t, status: e.target.value }))} className="border rounded px-2 py-1">
//               {chartTypes.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
//             </select>
//           </div>
//         </div>
//       </div>
//       {/* Trends */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
//         <div className="bg-white rounded shadow p-6 flex flex-col items-center">
//           <h2 className="text-lg font-semibold mb-2">Orders per Day</h2>
//           <div className="w-full h-64 flex items-center justify-center">
//             {chartComponent(chartType.ordersTrend, ordersTrendChart)}
//           </div>
//           <div className="mt-2">
//             <select value={chartType.ordersTrend} onChange={e => setChartType(t => ({ ...t, ordersTrend: e.target.value }))} className="border rounded px-2 py-1">
//               {chartTypes.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
//             </select>
//           </div>
//         </div>
//         <div className="bg-white rounded shadow p-6 flex flex-col items-center">
//           <h2 className="text-lg font-semibold mb-2">Revenue per Day</h2>
//           <div className="w-full h-64 flex items-center justify-center">
//             {chartComponent(chartType.revenueTrend, revenueTrendChart)}
//           </div>
//           <div className="mt-2">
//             <select value={chartType.revenueTrend} onChange={e => setChartType(t => ({ ...t, revenueTrend: e.target.value }))} className="border rounded px-2 py-1">
//               {chartTypes.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
//             </select>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;



import React, { useState, useEffect } from "react";
import { getCustomers } from '../lib/customerApi';
import { getOrders } from '../lib/orderApi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie, Doughnut, Line, PolarArea } from "react-chartjs-2";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import ChartCard from '../components/ChartCard';
import { exportToExcel } from '../lib/exportToExcel';
import { chartTypes, colorMap, statusLabels } from '../constants';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState(new Date());
  const [chartType, setChartType] = useState({
    orders: 'bar',
    revenue: 'doughnut',
    customers: 'pie',
    active: 'bar',
    avg: 'bar',
    status: 'pie',
    ordersTrend: 'line',
    revenueTrend: 'line',
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getOrders().catch(() => []),
      getCustomers().catch(() => []),
    ]).then(([ordersData, customersData]) => {
      setOrders(ordersData);
      setCustomers(customersData);
      setLoading(false);
    });
  }, []);

  const parseDate = obj => new Date(obj.order_date || obj.date || obj.createdAt || obj.created_at);

  const filteredOrders = orders.filter(o => {
    const d = parseDate(o);
    return d >= startDate && d <= endDate;
  });

  const filteredCustomers = customers.filter(c => {
    const d = new Date(c.createdAt || c.created_at);
    return d >= startDate && d <= endDate;
  });

  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const newCustomerCount = filteredCustomers.length;
  const activeCustomerIds = new Set(filteredOrders.map(o => o.customer_id));
  const activeCustomers = customers.filter(c => activeCustomerIds.has(c.id));
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const dayMap = {};
  const revMap = {};
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    dayMap[key] = 0;
    revMap[key] = 0;
  }
  filteredOrders.forEach(o => {
    const d = parseDate(o).toISOString().slice(0, 10);
    if (dayMap[d] !== undefined) {
      dayMap[d]++;
      revMap[d] += Number(o.total_amount || 0);
    }
  });

  const ordersPerDayLabels = Object.keys(dayMap);
  const ordersPerDayData = Object.values(dayMap);
  const revenuePerDayData = Object.values(revMap);

  const statusCounts = statusLabels.map(status =>
    filteredOrders.filter(o => o.status === status).length
  );

  const baseChartOptions = {
    plugins: {
      legend: {
        display: window.innerWidth >= 768,
        position: 'bottom',
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  const chartComponent = (type, data) => {
    switch (type) {
      case 'bar': return <Bar data={data} options={baseChartOptions} />;
      case 'line': return <Line data={data} options={baseChartOptions} />;
      case 'pie': return <Pie data={data} options={baseChartOptions} />;
      case 'doughnut': return <Doughnut data={data} options={baseChartOptions} />;
      case 'polarArea': return <PolarArea data={data} options={baseChartOptions} />;
      default: return <Bar data={data} options={baseChartOptions} />;
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

  const ordersChart = {
    labels: ['Orders'],
    datasets: [{
      label: 'Total Orders',
      data: [totalOrders],
      backgroundColor: [colorMap.orders],
    }],
  };

  const revenueChart = {
    labels: ['Revenue'],
    datasets: [{
      label: 'Total Revenue',
      data: [totalRevenue],
      backgroundColor: [colorMap.revenue],
    }],
  };

  const customersChart = {
    labels: ['New Customers'],
    datasets: [{
      label: 'New Customers',
      data: [newCustomerCount],
      backgroundColor: [colorMap.customers],
    }],
  };

  const activeChart = {
    labels: ['Active Customers'],
    datasets: [{
      label: 'Active Customers',
      data: [activeCustomers.length],
      backgroundColor: [colorMap.active],
    }],
  };

  const avgChart = {
    labels: ['Avg Order Value'],
    datasets: [{
      label: 'Avg Order Value',
      data: [avgOrderValue],
      backgroundColor: [colorMap.avg],
    }],
  };

  const statusChart = {
    labels: statusLabels,
    datasets: [{
      label: 'Order Status',
      data: statusCounts,
      backgroundColor: colorMap.status,
    }],
  };

  const ordersTrendChart = {
    labels: ordersPerDayLabels,
    datasets: [{
      label: 'Orders per Day',
      data: ordersPerDayData,
      backgroundColor: colorMap.orders,
      borderColor: colorMap.orders,
      fill: false,
    }],
  };

  const revenueTrendChart = {
    labels: ordersPerDayLabels,
    datasets: [{
      label: 'Revenue per Day',
      data: revenuePerDayData,
      backgroundColor: colorMap.revenue,
      borderColor: colorMap.revenue,
      fill: false,
    }],
  };

  return (
    <div className="p-6 space-y-8">
      {/* Date Picker */}
      <div className="flex gap-2 items-center mb-4">
        <label className="font-medium">From:</label>
        <DatePicker
          selected={startDate}
          onChange={date => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          maxDate={endDate}
          className="border rounded px-2 py-1 w-32"
          dateFormat="yyyy-MM-dd"
        />
        <label className="font-medium">To:</label>
        <DatePicker
          selected={endDate}
          onChange={date => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          className="border rounded px-2 py-1 w-32"
          dateFormat="yyyy-MM-dd"
        />
      </div>

      {/* Export Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => exportToExcel(filteredOrders, 'Orders')}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          Export Orders to Excel
        </button>
        <button
          onClick={() => exportToExcel(filteredCustomers, 'Customers')}
          className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
        >
          Export Customers to Excel
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ChartCard
          title="Total Orders"
          chart={chartComponent(chartType.orders, ordersChart)}
          value={totalOrders}
          colorClass="text-blue-600"
          chartTypeKey="orders"
          chartType={chartType}
          setChartType={setChartType}
        />
        <ChartCard
          title="Total Revenue"
          chart={chartComponent(chartType.revenue, revenueChart)}
          value={`₹${totalRevenue.toLocaleString()}`}
          colorClass="text-green-600"
          chartTypeKey="revenue"
          chartType={chartType}
          setChartType={setChartType}
        />
        <ChartCard
          title="New Customers"
          chart={chartComponent(chartType.customers, customersChart)}
          value={newCustomerCount}
          colorClass="text-yellow-600"
          chartTypeKey="customers"
          chartType={chartType}
          setChartType={setChartType}
        />
        <ChartCard
          title="Active Customers"
          chart={chartComponent(chartType.active, activeChart)}
          value={activeCustomers.length}
          colorClass="text-purple-600"
          chartTypeKey="active"
          chartType={chartType}
          setChartType={setChartType}
        />
        <ChartCard
          title="Avg Order Value"
          chart={chartComponent(chartType.avg, avgChart)}
          value={`₹${avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          colorClass="text-orange-600"
          chartTypeKey="avg"
          chartType={chartType}
          setChartType={setChartType}
        />
        <ChartCard
          title="Order Status Breakdown"
          chart={chartComponent(chartType.status, statusChart)}
          value={statusLabels.map((s, i) =>
            statusCounts[i] > 0 ? `${s}: ${statusCounts[i]}` : null
          ).filter(Boolean).join(' | ')}
          colorClass="text-pink-600"
          chartTypeKey="status"
          chartType={chartType}
          setChartType={setChartType}
        />
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <ChartCard
          title="Orders per Day"
          chart={chartComponent(chartType.ordersTrend, ordersTrendChart)}
          value=""
          colorClass=""
          chartTypeKey="ordersTrend"
          chartType={chartType}
          setChartType={setChartType}
        />
        <ChartCard
          title="Revenue per Day"
          chart={chartComponent(chartType.revenueTrend, revenueTrendChart)}
          value=""
          colorClass=""
          chartTypeKey="revenueTrend"
          chartType={chartType}
          setChartType={setChartType}
        />
      </div>
    </div>
  );
};

export default Dashboard;
