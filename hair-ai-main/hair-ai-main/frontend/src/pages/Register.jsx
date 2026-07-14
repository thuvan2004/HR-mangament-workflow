import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Calendar, MapPin, AlertCircle, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: 'Male',
    country: '',
    familyHistory: 'Unsure',
    dietType: 'Non-Vegetarian'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setLoading(true);
      const res = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        age: parseInt(formData.age),
        gender: formData.gender,
        country: formData.country,
        familyHistory: formData.familyHistory,
        dietType: formData.dietType
      });

      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090B10] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-violet/10 blur-[130px] rounded-full -z-10"></div>

      <div className="w-full max-w-lg glass-card p-8 flex flex-col gap-6 my-10 animate-fade-in">
        <div className="text-center">
          <Link to="/" className="inline-block mb-3">
            <span className="text-2xl font-display font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
              HAIRSCOPE AI
            </span>
          </Link>
          <h2 className="text-xl font-bold text-white">Create your account</h2>
          <p className="text-sm text-gray-400">Join and start monitoring your hair progress</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-300">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0D0F16] border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-brand-violet transition-colors"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0D0F16] border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-brand-violet transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0D0F16] border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-brand-violet transition-colors"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-300">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0D0F16] border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-brand-violet transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-300">Age</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input
                  type="number"
                  name="age"
                  placeholder="25"
                  min="12"
                  max="100"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full pl-8 pr-2 py-2.5 bg-[#0D0F16] border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-brand-violet transition-colors"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-300">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-[#0D0F16] border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-brand-violet transition-colors"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">N/A</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-300">Country</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input
                  type="text"
                  name="country"
                  placeholder="USA"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full pl-8 pr-2 py-2.5 bg-[#0D0F16] border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-brand-violet transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-300">Family Hair Loss</label>
              <select
                name="familyHistory"
                value={formData.familyHistory}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-[#0D0F16] border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-brand-violet transition-colors"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Unsure">Unsure</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-300">Diet Type</label>
              <select
                name="dietType"
                value={formData.dietType}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-[#0D0F16] border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-brand-violet transition-colors"
              >
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Vegetarian">Vegetarian</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-brand-violet hover:bg-purple-600 disabled:bg-purple-600/50 font-bold rounded-xl text-sm text-white shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            {loading ? 'Registering...' : 'Register'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-sm text-center text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-cyan hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
