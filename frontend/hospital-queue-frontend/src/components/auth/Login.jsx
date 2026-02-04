import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Mail, Lock, User, Eye, EyeOff, Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login, register } = useAuth();
  //const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    username: '',
    phoneNumber: '',
    role: 'USER'
  });

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await login({
          username: formData.username || formData.email,
          password: formData.password
        });
      } else {
        await register(formData);
      }
    //  navigate('/');
    } catch (err) {
      setError(err || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

return (
  <>
    <div className="min-h-screen w-full border border-white bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      
      {/* Animated Background Circles */}
      <motion.div
        className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        animate={{ scale: [1, 1.3, 1], x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full z-10"
      >

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex items-center justify-center mb-4"
          >
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
              <Activity className="w-12 h-12" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-bold text-center mb-2"
          >
            Hospital Queue
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-blue-100"
          >
            Smart Queue Management System
          </motion.p>
        </div>

        {/* Form Container */}
        <div className="p-8">

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
              >
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(""); }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                isLogin ? "bg-white text-blue-600 shadow-md" : "text-gray-600"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(""); }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                !isLogin ? "bg-white text-blue-600 shadow-md" : "text-gray-600"
              }`}
            >
              Register
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-xl"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isLogin ? "Username or Email" : "Email"}
            </label>
            <input
              name={isLogin ? "username" : "email"}
              value={isLogin ? formData.username : formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl"
            />

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl"
            />

          </div> {/* ✅ FIXED: closing Form Fields */}

          <AnimatePresence mode="wait">
            {!isLogin && (
              <>
                <input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl mt-4"
                />

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl mt-4"
                >
                  <option value="USER">Patient</option>
                  <option value="HOSPITAL_ADMIN">Hospital Admin</option>
                </select>
              </>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handleSubmit}
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold"
          >
            {isLogin ? "Sign In" : "Create Account"}
          </motion.button>

        </div>
      </motion.div>
    </div>
  </>
);

};

export default Login;