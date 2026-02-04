import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Clock, PlayCircle, CheckCircle, XCircle, 
  AlertCircle, RefreshCw, Phone, User 
} from 'lucide-react';
import { tokenAPI, departmentAPI } from '../../services/api';
import websocketService from '../../services/websocket';
import LoadingSpinner from '../shared/LoadingSpinner';

const ManageQueue = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(1);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      fetchQueue();
      
      // Setup WebSocket
      websocketService.connect(() => {
        websocketService.subscribe(`/topic/queue/${selectedDepartment}`, handleQueueUpdate);
      });

      return () => {
        websocketService.unsubscribe(`/topic/queue/${selectedDepartment}`);
      };
    }
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

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const response = await tokenAPI.getDepartmentQueue(selectedDepartment);
      setTokens(response.data);
    } catch (error) {
      console.error('Error fetching queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQueueUpdate = (data) => {
    console.log('Queue updated:', data);
    fetchQueue();
  };

  const updateTokenStatus = async (tokenId, status) => {
    setUpdating(tokenId);
    try {
      await tokenAPI.updateStatus(tokenId, status);
      fetchQueue();
    } catch (error) {
      console.error('Error updating token:', error);
      alert('Failed to update token status');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'WAITING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionButtons = (token) => {
    switch (token.status) {
      case 'WAITING':
        return (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => updateTokenStatus(token.id, 'IN_PROGRESS')}
              disabled={updating === token.id}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <PlayCircle className="w-4 h-4" />
              Start
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => updateTokenStatus(token.id, 'CANCELLED')}
              disabled={updating === token.id}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Cancel
            </motion.button>
          </>
        );
      case 'IN_PROGRESS':
        return (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => updateTokenStatus(token.id, 'COMPLETED')}
            disabled={updating === token.id}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            Complete
          </motion.button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading queue..." />;
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
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Manage Queue
                </h1>
                <p className="text-gray-600 mt-1">Control and monitor patient flow</p>
              </div>
            </div>

            <div className="flex gap-3">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(Number(e.target.value))}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
              >
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchQueue}
                className="p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Queue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Waiting</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {tokens.filter(t => t.status === 'WAITING').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
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
                <p className="text-gray-600 text-sm mb-1">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">
                  {tokens.filter(t => t.status === 'IN_PROGRESS').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <PlayCircle className="w-6 h-6 text-blue-600" />
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
                <p className="text-gray-600 text-sm mb-1">Total in Queue</p>
                <p className="text-3xl font-bold text-purple-600">
                  {tokens.filter(t => ['WAITING', 'IN_PROGRESS'].includes(t.status)).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Queue List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Active Queue</h3>
          
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {tokens.filter(t => ['WAITING', 'IN_PROGRESS'].includes(t.status)).map((token, index) => (
                <motion.div
                  key={token.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: "spring", stiffness: 500, damping: 50 }}
                  className={`relative overflow-hidden rounded-2xl border-2 ${
                    token.status === 'IN_PROGRESS' 
                      ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-400 shadow-lg' 
                      : 'bg-white border-gray-200'     }`}
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex items-center gap-6">
                    {/* Position Badge */}
                    <motion.div
                      animate={token.status === 'IN_PROGRESS' ? {
                        scale: [1, 1.1, 1],
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${
                        token.status === 'IN_PROGRESS'
                          ? 'bg-gradient-to-br from-blue-600 to-cyan-600'
                          : 'bg-gradient-to-br from-gray-500 to-gray-600'
                      }`}
                    >
                      {index + 1}
                    </motion.div>                    {/* Token Info */}
                    <div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {token.tokenNumber}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {token.patientName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {token.estimatedWaitTime} min
                        </span>
                      </div>
                    </div>
                  </div>                  {/* Right Section */}
                  <div className="flex items-center gap-4">
                    {/* Status Badge */}
                    <div className={`px-4 py-2 rounded-xl border-2 font-semibold ${getStatusColor(token.status)}`}>
                      {token.status === 'IN_PROGRESS' ? 'In Progress' : 'Waiting'}
                    </div>                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {updating === token.id ? (
                        <div className="px-6 py-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <RefreshCw className="w-5 h-5 text-blue-600" />
                          </motion.div>
                        </div>
                      ) : (
                        getActionButtons(token)
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>        {tokens.filter(t => ['WAITING', 'IN_PROGRESS'].includes(t.status)).length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-600 mb-2">Queue is Empty</p>
            <p className="text-gray-500">No patients waiting at the moment</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  </div>
</div>
);
};export default ManageQueue;