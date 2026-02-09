import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, Clock, Calendar, CheckCircle, XCircle, 
  PlayCircle, Loader, RefreshCw, AlertCircle, Users,
  MapPin, Phone
} from 'lucide-react';
import { tokenAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import websocketService from '../../services/websocket';
import LoadingSpinner from '../shared/LoadingSpinner';

const MyTokens = () => {
  const { user } = useAuth();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedToken, setSelectedToken] = useState(null);

  useEffect(() => {
    if (user) {
      fetchMyTokens();
      
      // Setup WebSocket for notifications
      websocketService.connect(() => {
        websocketService.subscribe(`/queue/user/${user.id}/notifications`, handleNotification);
        websocketService.subscribe(`/queue/user/${user.id}/call`, handleTokenCall);
      });

      return () => {
        websocketService.unsubscribe(`/queue/user/${user.id}/notifications`);
        websocketService.unsubscribe(`/queue/user/${user.id}/call`);
      };
    }
  }, [user]);

  const fetchMyTokens = async () => {
    setLoading(true);
    try {
      const response = await tokenAPI.getUserTokens(user.id);
      setTokens(response.data);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotification = (notification) => {
    console.log('Notification:', notification);
    // Show browser notification
    if (Notification.permission === 'granted') {
      new Notification('Queue Update', {
        body: notification.message,
        icon: '/hospital-icon.png'
      });
    }
    fetchMyTokens();
  };

  const handleTokenCall = (data) => {
    console.log('Token called:', data);
    // Show alert when it's user's turn
    alert(`Your turn! Token ${data.tokenNumber} - Please proceed to ${data.departmentName}`);
    fetchMyTokens();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'WAITING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'WAITING':
        return <Clock className="w-5 h-5" />;
      case 'IN_PROGRESS':
        return <PlayCircle className="w-5 h-5" />;
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Ticket className="w-5 h-5" />;
    }
  };

  const filteredTokens = tokens.filter(token => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['WAITING', 'IN_PROGRESS'].includes(token.status);
    if (filter === 'completed') return token.status === 'COMPLETED';
    if (filter === 'cancelled') return token.status === 'CANCELLED';
    return true;
  });

  const activeTokens = tokens.filter(t => ['WAITING', 'IN_PROGRESS'].includes(t.status));
  const completedTokens = tokens.filter(t => t.status === 'COMPLETED');
  const cancelledTokens = tokens.filter(t => t.status === 'CANCELLED');

  if (loading) {
    return <LoadingSpinner message="Loading your tokens..." />;
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
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <Ticket className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  My Tokens
                </h1>
                <p className="text-gray-600 mt-1">View and manage your appointments</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchMyTokens}
              className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
              <span className="font-medium">Refresh</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Active Tokens</p>
                <p className="text-3xl font-bold text-blue-600">{activeTokens.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <PlayCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedTokens.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Tokens</p>
                <p className="text-3xl font-bold text-purple-600">{tokens.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Ticket className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-2 shadow-md mb-6 inline-flex gap-2"
        >
          {[
            { key: 'all', label: 'All Tokens' },
            { key: 'active', label: 'Active' },
            { key: 'completed', label: 'Completed' },
            { key: 'cancelled', label: 'Cancelled' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-6 py-2 rounded-xl font-medium transition-all ${
                filter === key
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </motion.div>

        {/* Tokens List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredTokens.map((token, index) => (
              <motion.div
                key={token.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedToken(token.id === selectedToken ? null : token.id)}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden ${
                  selectedToken === token.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex items-center gap-6">
                      {/* Status Icon */}
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.3 }}
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                          token.status === 'IN_PROGRESS'
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                            : token.status === 'WAITING'
                            ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                            : token.status === 'COMPLETED'
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                            : 'bg-gradient-to-br from-red-500 to-pink-500'
                        } text-white shadow-lg`}
                      >
                        {getStatusIcon(token.status)}
                      </motion.div>

                      {/* Token Info */}
                      <div>
                        <p className="text-2xl font-bold text-gray-900 mb-1">
                          {token.tokenNumber}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {token.departmentName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(token.bookingTime).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(token.bookingTime).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                      {/* Wait Time (for active tokens) */}
                      {['WAITING', 'IN_PROGRESS'].includes(token.status) && (
                        <div className="text-center px-4 py-2 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-600 mb-1">Est. Wait</p>
                          <p className="text-lg font-bold text-gray-900">
                            {token.estimatedWaitTime} min
                          </p>
                        </div>
                      )}

                      {/* Queue Position */}
                      {token.status === 'WAITING' && (
                        <div className="text-center px-4 py-2 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-600 mb-1">Position</p>
                          <p className="text-lg font-bold text-gray-900">
                            #{token.queuePosition}
                          </p>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className={`px-4 py-2 rounded-xl border-2 font-semibold ${getStatusColor(token.status)}`}>
                        {token.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {selectedToken === token.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 pt-6 border-t border-gray-200"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-blue-50 rounded-xl p-4">
                            <p className="text-sm text-blue-600 font-medium mb-1">Patient Name</p>
                            <p className="text-gray-900 font-semibold">{token.patientName}</p>
                          </div>

                          {token.serviceStartTime && (
                            <div className="bg-green-50 rounded-xl p-4">
                              <p className="text-sm text-green-600 font-medium mb-1">Service Started</p>
                              <p className="text-gray-900 font-semibold">
                                {new Date(token.serviceStartTime).toLocaleTimeString()}
                              </p>
                            </div>
                          )}

                          {token.serviceEndTime && (
                            <div className="bg-purple-50 rounded-xl p-4">
                              <p className="text-sm text-purple-600 font-medium mb-1">Service Ended</p>
                              <p className="text-gray-900 font-semibold">
                                {new Date(token.serviceEndTime).toLocaleTimeString()}
                              </p>
                            </div>
                          )}
                        </div>

                        {token.status === 'IN_PROGRESS' && (
                          <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                            <div className="flex items-start">
                              <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-blue-800">
                                <p className="font-semibold mb-1">Your turn is now!</p>
                                <p>Please proceed to {token.departmentName} department immediately.</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {token.status === 'WAITING' && (
                          <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                            <div className="flex items-start">
                              <Clock className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-yellow-800">
                                <p className="font-semibold mb-1">Please wait for your turn</p>
                                <p>You are #{token.queuePosition} in the queue. Estimated wait time: {token.estimatedWaitTime} minutes.</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredTokens.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white rounded-2xl shadow-lg"
            >
              <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-600 mb-2">No tokens found</p>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? "You haven't booked any tokens yet" 
                  : `No ${filter} tokens available`}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/'}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg"
              >
                Book a Token
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTokens;