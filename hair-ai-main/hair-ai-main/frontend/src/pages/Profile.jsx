import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { User, Mail, Calendar, MapPin, Sparkles, Save, ShieldCheck } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: 'Male',
    country: '',
    hairLossStartYear: '',
    familyHistory: 'Unsure',
    profilePhoto: ''
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Sync profile details
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        age: user.age || '',
        gender: user.gender || 'Male',
        country: user.country || '',
        hairLossStartYear: user.hairLossStartYear || '',
        familyHistory: user.familyHistory || 'Unsure',
        profilePhoto: user.profilePhoto || ''
      });
    }
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await updateProfile({
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender,
        country: formData.country,
        hairLossStartYear: formData.hairLossStartYear ? parseInt(formData.hairLossStartYear) : null,
        familyHistory: formData.familyHistory,
        profilePhoto: formData.profilePhoto
      });

      if (res.success) {
        showToast('Profile configuration updated successfully!', 'success');
      } else {
        showToast(res.message || 'Profile update failed', 'error');
      }
    } catch (err) {
      showToast('Something went wrong.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <div>
        <h1 className="text-3xl font-extrabold text-white">Profile Settings</h1>
        <p className="text-sm text-gray-400">Configure profile indices and hair loss logs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Banner */}
        <div className="glass-card p-6 flex flex-col items-center text-center gap-4 h-fit md:col-span-1">
          <div className="w-24 h-24 rounded-full bg-brand-violet/20 border-2 border-brand-violet flex items-center justify-center text-brand-cyan text-3xl font-black overflow-hidden shadow-lg shadow-purple-950/20">
            {formData.profilePhoto ? (
              <img src={formData.profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              formData.name ? formData.name[0].toUpperCase() : 'U'
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">{formData.name}</h3>
            <p className="text-xs text-gray-400 mt-1 truncate max-w-[180px]">{formData.email}</p>
          </div>
          <div className="w-full border-t border-dark-border/40 pt-3 mt-1 flex flex-col gap-2 text-left">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Medical Logs</span>
            <div className="text-xs text-gray-300">
              <span className="font-semibold">Family history:</span> {formData.familyHistory}
            </div>
            <div className="text-xs text-gray-300">
              <span className="font-semibold">Onset:</span> {formData.hairLossStartYear || 'Not Scanned'}
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="glass-card p-6 md:col-span-2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Edit Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#0f1422] border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-brand-violet transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300">Email Address (Read-only)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-9 pr-4 py-2.5 bg-[#0f1422]/50 border border-dark-border/40 rounded-xl text-sm text-gray-500 cursor-not-allowed"
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
                    min="12"
                    max="100"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full pl-8 pr-2 py-2.5 bg-[#0f1422] border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-brand-violet transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-[#0f1422] border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-brand-violet transition-colors"
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
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full pl-8 pr-2 py-2.5 bg-[#0f1422] border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-brand-violet transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300">Hair Loss Onset Year</label>
                <input
                  type="number"
                  name="hairLossStartYear"
                  placeholder="e.g. 2021"
                  min="1950"
                  max={new Date().getFullYear()}
                  value={formData.hairLossStartYear}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#0f1422] border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-brand-violet transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300">Family History</label>
                <select
                  name="familyHistory"
                  value={formData.familyHistory}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-[#0f1422] border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-brand-violet transition-colors"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Unsure">Unsure</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-300">Profile Photo URL</label>
              <input
                type="text"
                name="profilePhoto"
                placeholder="https://example.com/avatar.jpg"
                value={formData.profilePhoto}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#0f1422] border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-brand-violet transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 px-5 py-3 bg-brand-violet hover:bg-purple-600 disabled:bg-purple-600/50 font-bold rounded-xl text-sm text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
