import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  LayoutDashboard, Users, Clock, TrendingUp, Activity,
  CheckCircle, XCircle, PlayCircle, Calendar, AlertCircle,
  RefreshCw
} from 'lucide-react';
import { dashboardAPI, tokenAPI, departmentAPI } from '../../services/api';
import websocketService from '../../services/websocket';
import LoadingSpinner from '../shared/LoadingSpinner';

const AdminDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedDepartment, setSelectedDepartment] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState(null);
  const [recentTokens, setRecentTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sample data for charts (you can replace with real API data)
  const [hourlyData, setHourlyData] = useState([
    { hour: '8 AM', tokens: 12, avgWait: 15 },
    { hour: '9 AM', tokens: 18, avgWait: 22 },
    { hour: '10 AM', tokens: 25, avgWait: 28 },
    { hour: '11 AM', tokens: 22, avgWait: 25 },
    { hour: '12 PM', tokens: 15, avgWait: 18 },
    { hour: '1 PM', tokens: 20, avgWait: 23 },
    { hour: '2 PM', tokens: 28, avgWait: 30 },
    { hour: '3 PM', tokens: 24, avgWait: 26 },
    { hour: '4 PM', tokens: 19, avgWait: 21 },
    { hour: '5 PM', tokens: 10, avgWait: 12 },
  ]);

  const departmentData = [
    { name: 'Cardiology', value: 85, color: '#EF4444' },
    { name: 'Orthopedics', value: 72, color: '#3B82F6' },
    { name: 'Neurology', value: 58, color: '#8B5CF6' },
    { name: 'Pediatrics', value: 45, color: '#10B981' },
    { name: 'Dermatology', value: 62, color: '#F59E0B' },
  ];

  const weeklyData = [
    { day: 'Mon', completed: 145, cancelled: 12 },
    { day: 'Tue', completed: 158, cancelled: 8 },
    { day: 'Wed', completed: 162, cancelled: 15 },
    { day: 'Thu', completed: 149, cancelled: 11 },
    { day: 'Fri', completed: 172, cancelled: 9 },
    { day: 'Sat', completed: 98, cancelled: 5 },
    { day: 'Sun', completed: 76, cancelled: 3 },
  ];

  useEffect(() => {
    fetchDepartments();
    fetchDashboardData();
    
    // Setup WebSocket for real-time updates
    websocketService.connect(() => {
      websocketService.subscribe(`/topic/queue/${selectedDepartment}/stats`, handleStatsUpdate);
    });

    return () => {
      websocketService.unsubscribe(`/topic/queue/${selectedDepartment}/stats`);
    };
  }, [selectedDepartment]);

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data);
      if (response.data.length > 0) {
        setSelectedDepartment(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResponse, tokensResponse] = await Promise.all([
        dashboardAPI.getStats(selectedDepartment),
        tokenAPI.getDepartmentQueue(selectedDepartment)
      ]);

      setStats(statsResponse.data);
      setRecentTokens(tokensResponse.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatsUpdate = (data) => {
    console.log('Stats updated:', data);
    fetchDashboardData();
  };

  const statsCards = [
    {
      title: 'Total Tokens Today',
      value: stats?.totalTokensToday || '0',
      change: '+12%',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      trend: 'up'
    },
    {
      title: 'Completed',
      value: stats?.completedTokens || '0',
      change: '+8%',
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      trend: 'up'
    },
    {
      title: 'Avg Wait Time',
      value: stats?.averageWaitTime ? `${Math.round(stats.averageWaitTime)} min` : '0 min',
      change: '-5%',
      icon: Clock,
      color: 'from-purple-500 to-pink-500',
      trend: 'down'
    },
    {
      title: 'Cancelled',
      value: stats?.cancelledTokens || '0',
      change: '+2%',
      icon: XCircle,
      color: 'from-red-500 to-orange-500',
      trend: 'up'
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'WAITING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center"
              >
                <LayoutDashboard className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Hospital Queue Management Analytics</p>
              </div>
            </div>

            <div className="flex gap-3">
              {/* Department Selector */}
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(Number(e.target.value))}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
              >
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>

              {/* Period Selector */}
              <div className="flex bg-white rounded-xl shadow-md p-1">
                {['today', 'week', 'month'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-6 py-2 rounded-lg font-medium transition-all capitalize ${
                      selectedPeriod === period
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>

              {/* Refresh Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchDashboardData}
                className="p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm font-semibold px-2 py-1 rounded-lg ${
                  stat.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Hourly Tokens Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Hourly Token Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="tokens" fill="url(#colorTokens)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Department Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Department Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Weekly Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Weekly Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: 'none', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="cancelled" 
                stroke="#EF4444" 
                strokeWidth={3}
                dot={{ fill: '#EF4444', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Tokens Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            Recent Token Activity
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Token #</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Patient</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Wait Time</th>
                </tr>
              </thead>
              <tbody>
                {recentTokens.map((token, index) => (
                  <motion.tr
                    key={token.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="font-mono font-semibold text-gray-900">{token.tokenNumber}</span>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{token.patientName}</td>
                    <td className="py-4 px-4 text-gray-700">{token.departmentName}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(token.status)}`}>
                        {token.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {token.estimatedWaitTime ? `${token.estimatedWaitTime} min` : 'N/A'}
                    </td>
                  </motion.tr>
                ))}
                {recentTokens.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">
                      No recent tokens found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;