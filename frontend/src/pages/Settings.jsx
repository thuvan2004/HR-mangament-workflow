import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiSliders, FiPlus, FiTrash2, FiUser, FiInfo } from 'react-icons/fi';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [skills, setSkills] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setSkills(user.skills ? user.skills.join(', ') : '');
      setEmergencyContacts(user.emergencyContacts || []);
    }
  }, [user]);

  const handleAddContact = () => {
    setEmergencyContacts([...emergencyContacts, { name: '', relation: '', phone: '' }]);
  };

  const handleContactChange = (index, field, value) => {
    const updated = [...emergencyContacts];
    updated[index][field] = value;
    setEmergencyContacts(updated);
  };

  const handleRemoveContact = (index) => {
    setEmergencyContacts(emergencyContacts.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const skillsArr = skills ? skills.split(',').map((s) => s.trim()) : [];
    const result = await updateProfile({
      name,
      skills: skillsArr,
      emergencyContacts,
    });

    setLoading(false);

    if (result.success) {
      setSuccess('Profile details successfully updated!');
    } else {
      setError(result.message);
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto text-xs font-semibold text-slate-400">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-3xl font-extrabold text-slate-850 dark:text-white tracking-tight">Personal Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Configure profile details, emergency contact directories, and active skill lists.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Info panel left */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-850 pb-3">
            <FiInfo className="text-indigo-500" size={16} />
            <h3 className="font-extrabold text-sm text-slate-850 dark:text-white uppercase tracking-wider">Account Info</h3>
          </div>
          <div className="space-y-3.5">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Registered Email</span>
              <span className="text-slate-200 block mt-1 font-semibold break-all">{user.email}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Organization Role</span>
              <span className="text-slate-200 block mt-1 font-semibold">{user.role}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Designation</span>
              <span className="text-slate-200 block mt-1 font-semibold">{user.designation}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Department Office</span>
              <span className="text-slate-200 block mt-1 font-semibold">{user.department?.name || 'Unassigned'}</span>
            </div>
          </div>
        </div>

        {/* Configurations Form right */}
        <form onSubmit={handleSubmit} className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
          
          {success && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-450 rounded-xl leading-relaxed">
              {success}
            </div>
          )}
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-xl leading-relaxed">
              {error}
            </div>
          )}

          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-850 pb-3 mb-2">
            <FiSliders className="text-indigo-500" size={16} />
            <h3 className="font-extrabold text-sm text-slate-850 dark:text-white uppercase tracking-wider">Profile Configurations</h3>
          </div>

          {/* Full Name */}
          <div>
            <label className="block uppercase tracking-wider text-[10px] mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-200 focus:outline-none"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block uppercase tracking-wider text-[10px] mb-1.5">Skills (comma-separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-200 focus:outline-none"
            />
          </div>

          {/* Emergency contacts builder */}
          <div className="space-y-3.5 border-t border-slate-100 dark:border-slate-800/80 pt-4">
            <div className="flex items-center justify-between">
              <span className="block uppercase tracking-wider text-[10px]">Emergency Contacts Directory</span>
              <button
                type="button"
                onClick={handleAddContact}
                className="flex items-center space-x-1 px-3 py-1 bg-indigo-500/10 text-indigo-500 border border-indigo-550/10 rounded-xl font-bold hover:bg-indigo-500 hover:text-white transition-colors cursor-pointer"
              >
                <FiPlus size={12} /> <span>Add Relation</span>
              </button>
            </div>

            {emergencyContacts.map((contact, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end bg-slate-50/40 dark:bg-slate-850/30 p-3 border border-slate-100 dark:border-slate-800/50 rounded-2xl relative">
                <div>
                  <label className="block text-[9px] uppercase text-slate-500 mb-1">Contact Name</label>
                  <input
                    type="text"
                    required
                    value={contact.name}
                    onChange={(e) => handleContactChange(idx, 'name', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-250 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-slate-500 mb-1">Relation</label>
                  <input
                    type="text"
                    required
                    value={contact.relation}
                    onChange={(e) => handleContactChange(idx, 'relation', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-250 focus:outline-none"
                  />
                </div>
                <div className="flex space-x-2 items-center">
                  <div className="flex-1">
                    <label className="block text-[9px] uppercase text-slate-500 mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={contact.phone}
                      onChange={(e) => handleContactChange(idx, 'phone', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-250 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveContact(idx)}
                    className="p-2 text-slate-400 hover:text-rose-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 hover:bg-rose-500/10 cursor-pointer mt-5"
                    title="Remove contact"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors cursor-pointer"
          >
            {loading ? 'Updating details...' : 'Save Profile Config'}
          </button>

        </form>

      </div>

    </div>
  );
};

export default Settings;
