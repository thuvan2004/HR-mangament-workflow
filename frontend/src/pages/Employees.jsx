import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiUserPlus, FiEdit2, FiTrash2, FiEye, FiCheck, FiX } from 'react-icons/fi';

const Employees = () => {
  const { user: currentUser } = useAuth();
  
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const [designation, setDesignation] = useState('Software Engineer');
  const [department, setDepartment] = useState('');
  const [manager, setManager] = useState('');
  const [skills, setSkills] = useState('');
  const [status, setStatus] = useState('Active');

  const isHrOrAdmin = ['HR', 'Admin'].includes(currentUser?.role);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/employees', {
        params: {
          search,
          department: deptFilter,
          role: roleFilter,
          status: statusFilter,
          page,
          limit: 8,
        }
      });
      if (data.success) {
        setEmployees(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (err) {
      console.error('Failed to load employee list: ', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeptsAndManagers = async () => {
    try {
      const { data } = await api.get('/employees/departments');
      if (data.success) {
        setDepartments(data.data);
      }
    } catch (err) {
      console.warn('Depts fetch offline');
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, deptFilter, roleFilter, statusFilter, page]);

  useEffect(() => {
    fetchDeptsAndManagers();
  }, []);

  const handleOpenAdd = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('Employee');
    setDesignation('Software Engineer');
    setDepartment('');
    setManager('');
    setSkills('');
    setShowAddModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const skillsArr = skills ? skills.split(',').map(s => s.trim()) : [];
      const payload = {
        name,
        email,
        password,
        role,
        designation,
        skills: skillsArr,
        status: 'Active',
      };
      if (department) payload.department = department;
      if (manager) payload.manager = manager;

      const { data } = await api.post('/employees', payload);
      if (data.success) {
        setShowAddModal(false);
        fetchEmployees();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create profile');
    }
  };

  const handleOpenEdit = (emp) => {
    setSelectedEmp(emp);
    setName(emp.name);
    setEmail(emp.email);
    setRole(emp.role);
    setDesignation(emp.designation);
    setDepartment(emp.department?._id || emp.department || '');
    setManager(emp.manager?._id || emp.manager || '');
    setSkills(emp.skills ? emp.skills.join(', ') : '');
    setStatus(emp.status);
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const skillsArr = skills ? skills.split(',').map(s => s.trim()) : [];
      const payload = {
        name,
        role,
        designation,
        skills: skillsArr,
        status,
        department: department || null,
        manager: manager || null,
      };

      const { data } = await api.put(`/employees/${selectedEmp._id || selectedEmp.id}`, payload);
      if (data.success) {
        setShowEditModal(false);
        fetchEmployees();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user profile?')) return;
    try {
      await api.delete(`/employees/${id}`);
      fetchEmployees();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-850 dark:text-white tracking-tight">Staff Directory</h1>
          <p className="text-sm text-slate-400 mt-1">Manage staff profiles, departmental allocations, and emergency contact details.</p>
        </div>
        {isHrOrAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-glass cursor-pointer transition-colors shrink-0 text-sm"
          >
            <FiUserPlus size={16} /> <span>Onboard Employee</span>
          </button>
        )}
      </div>

      {/* 2. Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        
        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, designation..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10 pr-4 py-2.5 w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Dept Filter */}
        <select
          value={deptFilter}
          onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
          className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs focus:outline-none text-slate-650 dark:text-slate-300 font-semibold"
        >
          <option value="">All Departments</option>
          {departments.map(d => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs focus:outline-none text-slate-650 dark:text-slate-300 font-semibold"
        >
          <option value="">All Roles</option>
          <option value="Employee">Employee</option>
          <option value="Manager">Manager</option>
          <option value="HR">HR</option>
          <option value="Admin">Admin</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs focus:outline-none text-slate-650 dark:text-slate-300 font-semibold"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Suspended">Suspended</option>
        </select>

      </div>

      {/* 3. Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-4 px-6">Name</th>
                <th className="p-4">Role</th>
                <th className="p-4">Department</th>
                <th className="p-4">Designation</th>
                <th className="p-4">Status</th>
                <th className="p-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400 font-semibold">
                    Fetching records...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400 font-semibold">
                    No active staff matches found.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50 dark:hover:bg-slate-850/30 text-slate-750 dark:text-slate-300">
                    <td className="p-4 px-6 flex items-center space-x-3.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 font-bold flex items-center justify-center">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-850 dark:text-slate-200 block">{emp.name}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{emp.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        emp.role === 'Admin' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                        emp.role === 'HR' ? 'bg-teal-500/10 text-teal-500 border-teal-500/20' :
                        emp.role === 'Manager' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700/60'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="p-4">{emp.department?.name || 'Unassigned'}</td>
                    <td className="p-4">{emp.designation}</td>
                    <td className="p-4">
                      <span className={`flex items-center space-x-1.5 ${
                        emp.status === 'Active' ? 'text-emerald-500' :
                        emp.status === 'Suspended' ? 'text-rose-500' :
                        'text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          emp.status === 'Active' ? 'bg-emerald-500' :
                          emp.status === 'Suspended' ? 'bg-rose-500' :
                          'bg-slate-400'
                        }`} />
                        <span>{emp.status}</span>
                      </span>
                    </td>
                    <td className="p-4 px-6 text-center space-x-2">
                      <button
                        onClick={() => { setSelectedEmp(emp); setShowViewModal(true); }}
                        className="p-2 bg-slate-100 dark:bg-slate-800 hover:text-indigo-400 rounded-xl transition-colors cursor-pointer"
                        title="View profile details"
                      >
                        <FiEye size={13} />
                      </button>
                      {isHrOrAdmin && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            className="p-2 bg-slate-100 dark:bg-slate-800 hover:text-amber-400 rounded-xl transition-colors cursor-pointer"
                            title="Edit details"
                          >
                            <FiEdit2 size={13} />
                          </button>
                          {currentUser.role === 'Admin' && (
                            <button
                              onClick={() => handleDelete(emp._id)}
                              className="p-2 bg-slate-100 dark:bg-slate-800 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
                              title="Delete profile"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-xs text-slate-400">
            <span>Page {page} of {totalPages}</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 4. MODALS (Add / Edit / View Drawers) */}
      
      {/* View Details Modal */}
      {showViewModal && selectedEmp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="font-extrabold text-lg text-slate-850 dark:text-white">Staff Details Profile</h3>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-white"><FiX size={18} /></button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Name</span>
                <span className="font-semibold text-slate-850 dark:text-slate-200 text-sm mt-1 block">{selectedEmp.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Email</span>
                <span className="font-semibold text-slate-850 dark:text-slate-200 text-sm mt-1 block">{selectedEmp.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Role / Designation</span>
                <span className="font-semibold text-slate-850 dark:text-slate-200 mt-1 block">{selectedEmp.role} / {selectedEmp.designation}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Department</span>
                <span className="font-semibold text-slate-850 dark:text-slate-200 mt-1 block">{selectedEmp.department?.name || 'Unassigned'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px] mb-1">Skills Stack</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedEmp.skills && selectedEmp.skills.length > 0 ? (
                    selectedEmp.skills.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/10 rounded font-semibold text-[10px]">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">None specified</span>
                  )}
                </div>
              </div>
              <div className="col-span-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px] mb-1">Emergency Contacts</span>
                {selectedEmp.emergencyContacts && selectedEmp.emergencyContacts.length > 0 ? (
                  selectedEmp.emergencyContacts.map((c, i) => (
                    <div key={i} className="flex justify-between mt-1 text-slate-700 dark:text-slate-350">
                      <span>{c.name} ({c.relation})</span>
                      <span className="font-semibold">{c.phone}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-slate-400 text-xs">No emergency contacts registered.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onboard Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <h3 className="font-extrabold text-lg text-slate-850 dark:text-white">Onboard New Employee</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white"><FiX size={18} /></button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4 text-xs font-semibold text-slate-400">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider text-[10px] mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-200 focus:outline-none"
                    placeholder="Alice Cooper"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-[10px] mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-200 focus:outline-none"
                    placeholder="alice@company.com"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-[10px] mb-1.5">Temporary Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-200 focus:outline-none"
                    placeholder="Welcome@123"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-[10px] mb-1.5">Designation</label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-200 focus:outline-none"
                    placeholder="Product Designer"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-[10px] mb-1.5">Role Type</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-350 focus:outline-none"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="HR">HR</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-[10px] mb-1.5">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-350 focus:outline-none"
                  >
                    <option value="">Select Dept</option>
                    {departments.map(d => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block uppercase tracking-wider text-[10px] mb-1.5">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-200 focus:outline-none"
                  placeholder="Figma, UI design, Prototyping"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors cursor-pointer"
              >
                Create Staff Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <h3 className="font-extrabold text-lg text-slate-850 dark:text-white">Modify Employee Credentials</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white"><FiX size={18} /></button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-4 text-xs font-semibold text-slate-400">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider text-[10px] mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-250 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-[10px] mb-1.5">Designation</label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-250 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-[10px] mb-1.5">Role Type</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-350 focus:outline-none"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="HR">HR</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-[10px] mb-1.5">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-350 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-[10px] mb-1.5">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-350 focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {departments.map(d => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-[10px] mb-1.5">Manager ID</label>
                  <input
                    type="text"
                    value={manager}
                    onChange={(e) => setManager(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-250 focus:outline-none"
                    placeholder="Mongoose User ID"
                  />
                </div>
              </div>
              <div>
                <label className="block uppercase tracking-wider text-[10px] mb-1.5">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-250 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Employees;
