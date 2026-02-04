import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, Users, Clock, Activity, CheckCircle, 
  PlayCircle, Pause, RefreshCw 
} from 'lucide-react';
import { tokenAPI, departmentAPI } from '../../services/api';
import websocketService from '../../services/websocket';
import { useParams } from 'react-router-dom';

const LiveDisplay = () => {
  const { departmentId } = useParams();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tokens, setTokens] = useState([]);
  const [department, setDepartment] = useState(null);
  const [stats, setStats] = useState({
    totalServed: 0,
    avgWaitTime: 0,
    currentQueue: 0,
  });

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    if (departmentId) {
      fetchDepartmentData();
      fetchQueueData();

      // Setup WebSocket
      websocketService.connect(() => {
        websocketService.subscribe(`/topic/queue/${departmentId}`, handleQueueUpdate);
        websocketService.subscribe(`/topic/display/${departmentId}`, handleDisplayUpdate);
      });

      // Refresh data every 5 seconds
      const refreshInterval = setInterval(() => {
        fetchQueueData();
      }, 5000);

      return () => {
        clearInterval(refreshInterval);
        websocketService.unsubscribe(`/topic/queue/${departmentId}`);
        websocketService.unsubscribe(`/topic/display/${departmentId}`);
      };
    }
  }, [departmentId]);

  const fetchDepartmentData = async () => {
    try {
      const response = await departmentAPI.getById(departmentId);
      setDepartment(response.data);
    } catch (error) {
      console.error('Error fetching department:', error);
    }
  };

  const fetchQueueData = async () => {
    try {
      const response = await tokenAPI.getDepartmentQueue(departmentId);
      const activeTokens = response.data.filter(t => 
        ['WAITING', 'IN_PROGRESS'].includes(t.status)
      );
      setTokens(activeTokens);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        currentQueue: activeTokens.length,
      }));
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  const handleQueueUpdate = (data) => {
    console.log('Queue updated:', data);
    fetchQueueData();
  };

  const handleDisplayUpdate = (data) => {
    console.log('Display updated:', data);
    if (data.stats) {
      setStats(prev => ({ ...prev, ...data.stats }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'from-green-500 to-emerald-500';
      case 'WAITING':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <PlayCircle className="w-5 h-5" />;
      case 'WAITING':
        return <Pause className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ top: '10%', left: '10%' }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ bottom: '10%', right: '10%' }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-6 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center"
              >
                <Monitor className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">
                  {department?.name || 'Department'} Queue
                </h1>
                <p className="text-blue-200">Live Queue Management Display</p>
              </div>
            </div>

            <div className="text-right">
              <motion.div
                key={currentTime.getSeconds()}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold text-white mb-1"
              >
                {currentTime.toLocaleTimeString()}
              </motion.div>
              <p className="text-blue-200">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-3">
              <Users className="w-8 h-8 text-blue-400" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 bg-green-500 rounded-full"
              />
            </div>
            <p className="text-blue-200 text-sm mb-1">Current Queue</p>
            <p className="text-4xl font-bold text-white">{stats.currentQueue}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <Activity className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-blue-200 text-sm mb-1">Patients Served Today</p>
            <p className="text-4xl font-bold text-white">{stats.totalServed}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-8 h-8 text-purple-400" />
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-blue-200 text-sm mb-1">Avg Wait Time</p>
            <p className="text-4xl font-bold text-white">{stats.avgWaitTime}m</p>
          </motion.div>
        </div>

        {/* Queue Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Users className="w-7 h-7 text-blue-400" />
            Current Queue
          </h2>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {tokens.map((token, index) => (
                <motion.div
                  key={token.id}
                  layout
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ type: "spring", stiffness: 500, damping: 50 }}
                  className={`relative overflow-hidden rounded-2xl ${
                    token.status === 'IN_PROGRESS' 
                      ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400' 
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  {/* Progress Bar for active token */}
                  {token.status === 'IN_PROGRESS' && (
                    <motion.div
                      className="absolute top-0 left-0 h-1 bg-gradient-to-r from-green-400 to-emerald-400"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                    />
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      {/* Left Section */}
                      <div className="flex items-center gap-6">
                        {/* Position Badge */}
                        <motion.div
                          animate={token.status === 'IN_PROGRESS' ? {
                            scale: [1, 1.1, 1],
                          } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getStatusColor(token.status)} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                        >
                          {token.status === 'IN_PROGRESS' ? '▶' : index + 1}
                        </motion.div>

                        {/* Token Info */}
                        <div>
                          <p className="text-2xl font-bold text-white mb-1">
                            {token.tokenNumber}
                          </p>
                          <p className="text-blue-200 text-lg">{token.patientName}</p>
                        </div>
                      </div>

                      {/* Right Section */}
                      <div className="flex items-center gap-8">
                        {/* Wait Time */}
                        <div className="text-right">
                          <p className="text-blue-200 text-sm mb-1">Est. Wait Time</p>
                          <motion.p
                            key={token.estimatedWaitTime}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            className="text-3xl font-bold text-white"
                          >
                            {token.estimatedWaitTime}m
                          </motion.p>
                        </div>

                        {/* Status Badge */}
                        <div className={`px-6 py-3 rounded-xl bg-gradient-to-r ${getStatusColor(token.status)} flex items-center gap-2 text-white font-semibold shadow-lg`}>
                          {getStatusIcon(token.status)}
                          {token.status === 'IN_PROGRESS' ? 'In Progress' : 'Waiting'}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {tokens.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-2xl font-bold text-white mb-2">Queue is Empty!</p>
                <p className="text-blue-200">No patients waiting at the moment</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Footer Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-center text-blue-200"
        >
          <p className="flex items-center justify-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-green-400 rounded-full"
            />
            Live updates in real-time
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LiveDisplay;