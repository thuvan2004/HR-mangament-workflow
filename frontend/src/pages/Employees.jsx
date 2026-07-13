import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiUserPlus, FiEdit2, FiTrash2, FiEye, FiX } from 'react-icons/fi';

const Employees = () => {
  const { user: currentUser } = useAuth();
  
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  // Keep the UI safe even when older/incomplete employee records exist.
  const getEmployeeName = (emp) => {
    const value = emp?.name ?? emp?.fullName ?? emp?.user?.name ?? '';
    const cleaned = String(value).trim();
    return cleaned || 'Unknown Employee';
  };

  const getEmployeeEmail = (emp) => {
    const value = emp?.email ?? emp?.user?.email ?? '';
    const cleaned = String(value).trim();
    return cleaned || 'No email';
  };

  const getEmployeeId = (emp) => emp?._id ?? emp?.id ?? emp?.user?._id ?? '';

  const getDepartmentName = (departmentValue) => {
    if (!departmentValue) return 'Unassigned';
    if (typeof departmentValue === 'string') return departmentValue;
    return departmentValue?.name || 'Unassigned';
  };

  const getSkillsArray = (value) => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof value === 'string') {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }

    return [];
  };

  const safeEmployees = Array.isArray(employees) ? employees.filter(Boolean) : [];
  const safeDepartments = Array.isArray(departments) ? departments.filter(Boolean) : [];

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get('/employees', {
        params: {
          search,
          department: deptFilter,
          role: roleFilter,
          status: statusFilter,
          page,
          limit: 8,
        },
      });

      const employeeList = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.data?.employees)
          ? data.data.employees
          : Array.isArray(data?.employees)
            ? data.employees
            : [];

      const pagination = data?.pagination || data?.data?.pagination || {};
      const pages = Number(pagination?.pages || pagination?.totalPages || 1);

      if (data?.success === false) {
        throw new Error(data?.message || 'Failed to load employee list');
      }

      setEmployees(employeeList);
      setTotalPages(Number.isFinite(pages) && pages > 0 ? pages : 1);
    } catch (err) {
      console.error('Failed to load employee list:', err);
      setEmployees([]);
      setTotalPages(1);
      setError(err.response?.data?.message || err.message || 'Failed to load employee list');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeptsAndManagers = async () => {
    try {
      const { data } = await api.get('/employees/departments');

      const departmentList = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.data?.departments)
          ? data.data.departments
          : Array.isArray(data?.departments)
            ? data.departments
            : [];

      setDepartments(departmentList);
    } catch (err) {
      console.warn('Departments fetch failed:', err.message);
      setDepartments([]);
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
      const skillsArr = getSkillsArray(skills);
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
    if (!emp) return;

    setSelectedEmp(emp);
    setName(getEmployeeName(emp) === 'Unknown Employee' ? '' : getEmployeeName(emp));
    setEmail(getEmployeeEmail(emp) === 'No email' ? '' : getEmployeeEmail(emp));
    setRole(emp?.role || 'Employee');
    setDesignation(emp?.designation || 'Software Engineer');
    setDepartment(emp?.department?._id || emp?.department?.id || (typeof emp?.department === 'string' ? emp.department : ''));
    setManager(emp?.manager?._id || emp?.manager?.id || (typeof emp?.manager === 'string' ? emp.manager : ''));
    setSkills(getSkillsArray(emp?.skills).join(', '));
    setStatus(emp?.status || 'Active');
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const skillsArr = getSkillsArray(skills);
      const payload = {
        name,
        role,
        designation,
        skills: skillsArr,
        status,
        department: department || null,
        manager: manager || null,
      };

      const employeeId = getEmployeeId(selectedEmp);
      if (!employeeId) {
        throw new Error('Employee ID is missing');
      }

      const { data } = await api.put(`/employees/${employeeId}`, payload);
      if (data.success) {
        setShowEditModal(false);
        fetchEmployees();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      alert('Employee ID is missing');
      return;
    }

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
          {safeDepartments.map((d, index) => {
            const deptId = d?._id || d?.id || String(d?.name || index);
            return (
              <option key={deptId} value={d?._id || d?.id || ''}>
                {d?.name || 'Unnamed Department'}
              </option>
            );
          })}
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
              ) : error ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-rose-500 font-semibold">
                    {error}
                  </td>
                </tr>
              ) : safeEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400 font-semibold">
                    No active staff matches found.
                  </td>
                </tr>
              ) : (
                safeEmployees.map((emp, index) => (
                  <tr key={getEmployeeId(emp) || `employee-${index}`} className="hover:bg-slate-50 dark:hover:bg-slate-850/30 text-slate-750 dark:text-slate-300">
                    <td className="p-4 px-6 flex items-center space-x-3.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 font-bold flex items-center justify-center">
                        {getEmployeeName(emp).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-850 dark:text-slate-200 block">{getEmployeeName(emp)}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{getEmployeeEmail(emp)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        emp.role === 'Admin' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                        emp.role === 'HR' ? 'bg-teal-500/10 text-teal-500 border-teal-500/20' :
                        emp.role === 'Manager' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700/60'
                      }`}>
                        {emp?.role || 'Employee'}
                      </span>
                    </td>
                    <td className="p-4">{getDepartmentName(emp?.department)}</td>
                    <td className="p-4">{emp?.designation || 'Not specified'}</td>
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
                        <span>{emp?.status || 'Inactive'}</span>
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
                          {currentUser?.role === 'Admin' && (
                            <button
                              onClick={() => handleDelete(getEmployeeId(emp))}
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
                <span className="font-semibold text-slate-850 dark:text-slate-200 text-sm mt-1 block">{getEmployeeName(selectedEmp)}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Email</span>
                <span className="font-semibold text-slate-850 dark:text-slate-200 text-sm mt-1 block">{getEmployeeEmail(selectedEmp)}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Role / Designation</span>
                <span className="font-semibold text-slate-850 dark:text-slate-200 mt-1 block">{selectedEmp?.role || 'Employee'} / {selectedEmp?.designation || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Department</span>
                <span className="font-semibold text-slate-850 dark:text-slate-200 mt-1 block">{getDepartmentName(selectedEmp?.department)}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px] mb-1">Skills Stack</span>
                <div className="flex flex-wrap gap-1.5">
                  {getSkillsArray(selectedEmp?.skills).length > 0 ? (
                    getSkillsArray(selectedEmp?.skills).map((s, index) => (
                      <span key={`${s}-${index}`} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/10 rounded font-semibold text-[10px]">
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
                {Array.isArray(selectedEmp?.emergencyContacts) && selectedEmp.emergencyContacts.length > 0 ? (
                  selectedEmp.emergencyContacts.filter(Boolean).map((c, i) => (
                    <div key={i} className="flex justify-between mt-1 text-slate-700 dark:text-slate-350">
                      <span>{c?.name || 'Unnamed'} ({c?.relation || 'Contact'})</span>
                      <span className="font-semibold">{c?.phone || 'No phone'}</span>
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
                    {safeDepartments.map((d, index) => {
                      const deptId = d?._id || d?.id || String(d?.name || index);
                      return (
                        <option key={deptId} value={d?._id || d?.id || ''}>
                          {d?.name || 'Unnamed Department'}
                        </option>
                      );
                    })}
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
                    {safeDepartments.map((d, index) => {
                      const deptId = d?._id || d?.id || String(d?.name || index);
                      return (
                        <option key={deptId} value={d?._id || d?.id || ''}>
                          {d?.name || 'Unnamed Department'}
                        </option>
                      );
                    })}
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