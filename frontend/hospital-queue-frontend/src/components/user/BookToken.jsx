import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Users, TrendingUp, CheckCircle, 
  Loader, AlertCircle, ArrowRight, Sparkles, Phone, Mail 
} from 'lucide-react';
import { departmentAPI, tokenAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import websocketService from '../../services/websocket';

const BookToken = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [tokenData, setTokenData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      
      // Mock queue data for demonstration
      const departmentsWithQueue = response.data.map((dept, index) => ({
        ...dept,
        icon: getIconForDepartment(dept.name),
        waitTime: 15 + (index * 5),
        queueLength: 4 + (index * 2),
        color: getColorForDepartment(index)
      }));
      
      setDepartments(departmentsWithQueue);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('Failed to load departments');
    }
  };

  const getIconForDepartment = (name) => {
    const icons = {
      'Cardiology': '❤️',
      'Orthopedics': '🦴',
      'Neurology': '🧠',
      'Pediatrics': '👶',
      'Dermatology': '🔬',
      'General Medicine': '🏥',
    };
    return icons[name] || '🏥';
  };

  const getColorForDepartment = (index) => {
    const colors = [
      'from-red-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-indigo-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-yellow-500',
      'from-teal-500 to-cyan-500',
    ];
    return colors[index % colors.length];
  };

  const handleBookToken = async () => {
    if (!selectedDepartment) {
      setError('Please select a department');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await tokenAPI.create({
        userId: user.id,
        departmentId: selectedDepartment,
        priority: 0
      });

      setTokenData(response.data);
      setShowSuccess(true);

      // Subscribe to WebSocket updates for this token
      websocketService.connect(() => {
        websocketService.subscribe(`/queue/user/${user.id}/notifications`, (notification) => {
          console.log('Notification received:', notification);
        });
      });

    } catch (error) {
      console.error('Booking failed:', error);
      setError(error.response?.data?.message || 'Failed to book token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowSuccess(false);
    setSelectedDepartment(null);
    setTokenData(null);
    fetchDepartments();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block mb-4"
          >
            <Sparkles className="w-12 h-12 text-purple-600" />
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Book Your Token
          </h1>
          <p className="text-gray-600">Select a department and get instant queue updates</p>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
            >
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!showSuccess ? (
            <motion.div
              key="booking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Department Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {departments.map((dept, index) => (
                  <motion.div
                    key={dept.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    onClick={() => {
                      setSelectedDepartment(dept.id);
                      setError('');
                    }}
                    className={`relative cursor-pointer rounded-2xl p-6 transition-all ${
                      selectedDepartment === dept.id
                        ? 'ring-4 ring-purple-500 shadow-2xl'
                        : 'bg-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {selectedDepartment === dept.id && (
                      <motion.div
                        layoutId="selected"
                        className={`absolute inset-0 bg-gradient-to-br ${dept.color} opacity-10 rounded-2xl`}
                      />
                    )}
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-4xl">{dept.icon}</span>
                        {selectedDepartment === dept.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring" }}
                          >
                            <CheckCircle className="w-6 h-6 text-purple-600" />
                          </motion.div>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-800 mb-3">
                        {dept.name}
                      </h3>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-blue-500" />
                          <span className="font-medium">{dept.waitTime} min</span>
                          <span className="ml-1">wait</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2 text-green-500" />
                          <span className="font-medium">{dept.queueLength}</span>
                          <span className="ml-1">in queue</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="mt-4">
                        {dept.queueLength < 5 ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Low Wait
                          </span>
                        ) : dept.queueLength < 10 ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Moderate
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Busy
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Book Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBookToken}
                  disabled={!selectedDepartment || loading}
                  className={`px-12 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all ${
                    selectedDepartment && !loading
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <Loader className="w-6 h-6 animate-spin" />
                      Processing with AI...
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      Book Token
                      <ArrowRight className="w-6 h-6" />
                    </span>
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          ) : (
            // Success Screen
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden">
                {/* Success Animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-16 h-16 text-white" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-center text-gray-800 mb-2"
                >
                  Token Booked Successfully!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center text-gray-600 mb-8"
                >
                  Your appointment has been confirmed
                </motion.p>

                {/* Token Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-6"
                >
                  <div className="text-center mb-6">
                    <p className="text-sm text-gray-600 mb-2">Your Token Number</p>
                    <p className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {tokenData?.tokenNumber}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-white rounded-xl">
                      <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-600 mb-1">Department</p>
                      <p className="font-bold text-gray-800">{tokenData?.departmentName}</p>
                    </div>

                    <div className="text-center p-4 bg-white rounded-xl">
                      <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-600 mb-1">Est. Wait Time</p>
                      <p className="font-bold text-gray-800">{tokenData?.estimatedWaitTime} min</p>
                    </div>

                    <div className="text-center p-4 bg-white rounded-xl">
                      <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-600 mb-1">Queue Position</p>
                      <p className="font-bold text-gray-800">#{tokenData?.queuePosition}</p>
                    </div>

                    <div className="text-center p-4 bg-white rounded-xl">
                      <TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-600 mb-1">Booked At</p>
                      <p className="font-bold text-gray-800">
                        {new Date(tokenData?.bookingTime).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Info Box */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6"
                >
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0"/>
<div className="text-sm text-blue-800">
<p className="font-semibold mb-1">Important Information</p>
<p>Please arrive 10 minutes before your estimated time. You'll receive live updates via the app.</p>
</div>
</div>
</motion.div>
            {/* Action Buttons */}
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetForm}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-lg"
              >
                Book Another Token
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/my-tokens'}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200"
              >
                View My Tokens
              </motion.button>
            </div>

            {/* Confetti Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -20, opacity: 1 }}
                  animate={{ 
                    y: 500, 
                    opacity: 0,
                    rotate: 360 
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                  className="absolute w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: -20
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
</div>
);
};
export default BookToken;