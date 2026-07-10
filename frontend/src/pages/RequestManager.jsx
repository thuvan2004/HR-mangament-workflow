import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Timeline from '../components/Timeline';
import { 
  FiFileText, FiPlus, FiX, FiCheckCircle, FiXCircle, 
  FiMessageSquare, FiCpu, FiTrendingUp, FiCheck, FiPaperclip 
} from 'react-icons/fi';

const RequestManager = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('me'); // 'me' or 'approvals'
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);

  // Submission Form State
  const [reqType, setReqType] = useState('Leave');
  const [title, setTitle] = useState('');
  const [reason, setReason] = useState('');
  
  // Leave Form
  const [leaveType, setLeaveType] = useState('annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Expense Form
  const [expenseCategory, setExpenseCategory] = useState('Travel');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);

  // Asset Form
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('Hardware');
  const [actionType, setActionType] = useState('Request');

  // HR Letter Form
  const [letterType, setLetterType] = useState('Salary Certificate');
  const [purpose, setPurpose] = useState('');

  // Action forms
  const [actionComment, setActionComment] = useState('');
  const [submitComment, setSubmitComment] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/requests', {
        params: {
          filter: activeTab,
        }
      });
      if (data.success) {
        setRequests(data.data);
      }
    } catch (err) {
      console.error('Failed to load requests queue: ', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const handleOpenDetail = async (reqId) => {
    try {
      const { data } = await api.get(`/requests/${reqId}`);
      if (data.success) {
        setSelectedReq(data.data);
        setActionComment('');
        setSubmitComment('');
        setShowDetailModal(true);
      }
    } catch (err) {
      alert('Could not fetch request details');
    }
  };

  const handleAction = async (action) => {
    try {
      const { data } = await api.put(`/requests/${selectedReq._id || selectedReq.id}/action`, {
        action,
        comment: actionComment || `${action}d at review stage.`
      });
      if (data.success) {
        setShowDetailModal(false);
        fetchRequests();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!submitComment.trim()) return;
    try {
      const { data } = await api.post(`/requests/${selectedReq._id || selectedReq.id}/comments`, {
        text: submitComment
      });
      if (data.success) {
        // Reload details
        handleOpenDetail(selectedReq._id || selectedReq.id);
      }
    } catch (err) {
      alert('Comment post failed');
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('requestType', reqType);
      formData.append('title', title);

      // Build details payload
      const details = {};
      if (reqType === 'Leave') {
        details.leaveType = leaveType;
        details.startDate = startDate;
        details.endDate = endDate;
        details.reason = reason;
      } else if (reqType === 'Expense') {
        details.category = expenseCategory;
        details.amount = parseFloat(expenseAmount);
        details.reason = reason;
        if (receiptFile) {
          formData.append('receipt', receiptFile);
        }
      } else if (reqType === 'Asset') {
        details.assetName = assetName;
        details.assetType = assetType;
        details.actionType = actionType;
        details.reason = reason;
      } else if (reqType === 'HRRequest') {
        details.letterType = letterType;
        details.purpose = purpose;
      }

      formData.append('details', JSON.stringify(details));

      const { data } = await api.post('/requests', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (data.success) {
        setShowSubmitModal(false);
        fetchRequests();
        // Reset forms
        setTitle('');
        setReason('');
        setStartDate('');
        setEndDate('');
        setExpenseAmount('');
        setReceiptFile(null);
        setAssetName('');
        setPurpose('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-850 dark:text-white tracking-tight">Requests Hub</h1>
          <p className="text-sm text-slate-400 mt-1">Submit new claims, schedule holidays, request hardware assets, or approve team tickets.</p>
        </div>
        
        <button
          onClick={() => setShowSubmitModal(true)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-glass cursor-pointer transition-colors shrink-0 text-sm"
        >
          <FiPlus size={16} /> <span>Submit Request</span>
        </button>
      </div>

      {/* 2. Tabs Selector */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('me')}
          className={`pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
            activeTab === 'me'
              ? 'border-indigo-500 text-indigo-500 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          My Submissions
        </button>
        {['Manager', 'HR', 'Admin'].includes(user?.role) && (
          <button
            onClick={() => setActiveTab('approvals')}
            className={`pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
              activeTab === 'approvals'
                ? 'border-indigo-500 text-indigo-500 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending Actions
          </button>
        )}
      </div>

      {/* 3. Requests Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-4 px-6">Requester</th>
                <th className="p-4">Type</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400 font-semibold">
                    Fetching items...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400 font-semibold">
                    No requests found in this context queue.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-850/30 text-slate-755 dark:text-slate-300">
                    <td className="p-4 px-6 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                        {r.user?.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-850 dark:text-slate-200 block">{r.user?.name}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{r.user?.designation}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold border ${
                        r.requestType === 'Leave' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/10' :
                        r.requestType === 'Expense' ? 'bg-teal-500/10 text-teal-500 border-teal-500/10' :
                        r.requestType === 'Asset' ? 'bg-amber-500/10 text-amber-500 border-amber-500/10' :
                        'bg-pink-500/10 text-pink-550 border-pink-500/10'
                      }`}>
                        {r.requestType}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-850 dark:text-slate-200">{r.title}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.priority === 'High' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                        r.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700/60'
                      }`}>
                        {r.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        r.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        r.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700/60'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 px-6 text-center">
                      <button
                        onClick={() => handleOpenDetail(r._id)}
                        className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-850 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all text-[11px] font-bold cursor-pointer border border-transparent hover:shadow-sm"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Request Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <h3 className="font-extrabold text-lg text-slate-850 dark:text-white">Submit Workflow Request</h3>
              <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-white"><FiX size={18} /></button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs font-semibold text-slate-400">
              
              {/* Type selector */}
              <div>
                <label className="block uppercase tracking-wider text-[10px] mb-1.5">Request Type</label>
                <select
                  value={reqType}
                  onChange={(e) => setReqType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-350 focus:outline-none"
                >
                  <option value="Leave">Schedule Holiday Leave</option>
                  <option value="Expense">Claim Expense Reimbursement</option>
                  <option value="Asset">Request Corporate IT Asset</option>
                  <option value="HRRequest">Request HR Letter or Certificate</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block uppercase tracking-wider text-[10px] mb-1.5">Subject Summary</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                  placeholder="e.g. AWS exam, Christmas Holiday, Keyboard upgrade"
                />
              </div>

              {/* DYNAMIC FORM SEGMENTS */}
              
              {/* Leave fields */}
              {reqType === 'Leave' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-wider text-[10px] mb-1.5">Leave Type</label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-350"
                    >
                      <option value="annual">Annual Leave</option>
                      <option value="sick">Sick Leave</option>
                      <option value="casual">Casual Leave</option>
                    </select>
                  </div>
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block uppercase tracking-wider text-[10px] mb-1.5">Start Date</label>
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-300 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block uppercase tracking-wider text-[10px] mb-1.5">End Date</label>
                      <input
                        type="date"
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-300 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Expense fields */}
              {reqType === 'Expense' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-wider text-[10px] mb-1.5">Category</label>
                    <select
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-350"
                    >
                      <option value="Travel">Corporate Travel</option>
                      <option value="Hardware">Hardware upgrade</option>
                      <option value="Software">Software Tool Subscription</option>
                      <option value="Meals">Client meals allowance</option>
                      <option value="Other">Other Category</option>
                    </select>
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider text-[10px] mb-1.5">Reimbursement Amount ($)</label>
                    <input
                      type="number"
                      required
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                      placeholder="150"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block uppercase tracking-wider text-[10px] mb-1.5">Invoice Receipt Attachment</label>
                    <div className="mt-2.5 flex items-center justify-center border-2 border-dashed border-slate-800 hover:border-indigo-500 rounded-2xl p-4.5 transition-colors cursor-pointer relative">
                      <input
                        type="file"
                        required
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => setReceiptFile(e.target.files[0])}
                      />
                      <FiPaperclip className="text-slate-500 mr-2" size={16} />
                      <span className="text-slate-400 text-xs">
                        {receiptFile ? receiptFile.name : "Select Invoice Image/PDF file (Max 5MB)"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Asset fields */}
              {reqType === 'Asset' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-wider text-[10px] mb-1.5">Hardware / Software name</label>
                    <input
                      type="text"
                      required
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                      placeholder="Dell UltraSharp 32'"
                    />
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider text-[10px] mb-1.5">Category</label>
                    <select
                      value={assetType}
                      onChange={(e) => setAssetType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-350"
                    >
                      <option value="Hardware">Hardware Accessories</option>
                      <option value="Software">Software Subscriptions</option>
                    </select>
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider text-[10px] mb-1.5">Operation Type</label>
                    <select
                      value={actionType}
                      onChange={(e) => setActionType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-350"
                    >
                      <option value="Request">Deploy / Allocate</option>
                      <option value="Return">Decommission / Return</option>
                    </select>
                  </div>
                </div>
              )}

              {/* HR Letter fields */}
              {reqType === 'HRRequest' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-wider text-[10px] mb-1.5">Letter Template</label>
                    <select
                      value={letterType}
                      onChange={(e) => setLetterType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-350"
                    >
                      <option value="Salary Certificate">Salary Certificate</option>
                      <option value="Employment Verification">Employment Verification</option>
                      <option value="ID Card Request">ID Card Request</option>
                      <option value="HR General Letter">HR General Letter</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block uppercase tracking-wider text-[10px] mb-1.5">Purpose / Letter Description</label>
                    <textarea
                      required
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                      rows="3"
                      placeholder="e.g. Applying for bank mortgage or housing lease agreement..."
                    />
                  </div>
                </div>
              )}

              {/* General Reason */}
              {reqType !== 'HRRequest' && (
                <div>
                  <label className="block uppercase tracking-wider text-[10px] mb-1.5">Justification Reason</label>
                  <textarea
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                    rows="3"
                    placeholder="Justify and detail your workflow request..."
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors cursor-pointer"
              >
                Submit to Approval Route
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. Request Details / Timeline inspection Drawer Modal */}
      {showDetailModal && selectedReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass grid grid-cols-1 lg:grid-cols-3 gap-6 my-8">
            
            {/* Modal Header */}
            <div className="col-span-1 lg:col-span-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500">
                  {selectedReq.requestType} ID: {selectedReq._id.substring(18)}
                </span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  selectedReq.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' :
                  selectedReq.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500' :
                  'bg-slate-100 dark:bg-slate-800 text-slate-400 animate-pulse'
                }`}>
                  {selectedReq.status}
                </span>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-white"><FiX size={18} /></button>
            </div>

            {/* Left section: details & AI suggestions */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Description details */}
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-slate-850 dark:text-white">{selectedReq.title}</h2>
                <div className="bg-slate-50 dark:bg-slate-850 p-4.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {selectedReq.requestType === 'Leave' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div><span className="text-slate-450 block font-semibold">Start Date:</span> {new Date(selectedReq.details.startDate).toLocaleDateString()}</div>
                      <div><span className="text-slate-450 block font-semibold">End Date:</span> {new Date(selectedReq.details.endDate).toLocaleDateString()}</div>
                      <div className="col-span-2 mt-1"><span className="text-slate-450 block font-semibold mb-1">Reason:</span> "{selectedReq.details.reason}"</div>
                    </div>
                  )}
                  {selectedReq.requestType === 'Expense' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div><span className="text-slate-450 block font-semibold">Claim Amount:</span> ${selectedReq.details.amount}</div>
                      <div><span className="text-slate-450 block font-semibold">Category:</span> {selectedReq.details.category}</div>
                      <div className="col-span-2 mt-1"><span className="text-slate-450 block font-semibold mb-1">Justification:</span> "{selectedReq.details.reason}"</div>
                      {selectedReq.details.receiptUrl && (
                        <div className="col-span-2 mt-2">
                          <span className="text-slate-450 block font-semibold mb-2">Receipt Document:</span>
                          <a 
                            href={selectedReq.details.receiptUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1.5 text-indigo-500 font-bold hover:underline"
                          >
                            <FiPaperclip /> <span>Open Uploaded Invoice</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedReq.requestType === 'Asset' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div><span className="text-slate-450 block font-semibold">Asset Details:</span> {selectedReq.details.assetName} ({selectedReq.details.assetType})</div>
                      <div><span className="text-slate-450 block font-semibold">Type:</span> {selectedReq.details.actionType} Request</div>
                      <div className="col-span-2 mt-1"><span className="text-slate-450 block font-semibold mb-1">Reason:</span> "{selectedReq.details.reason}"</div>
                    </div>
                  )}
                  {selectedReq.requestType === 'HRRequest' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div><span className="text-slate-450 block font-semibold">Certificate:</span> {selectedReq.details.letterType}</div>
                      <div className="col-span-2 mt-1"><span className="text-slate-450 block font-semibold mb-1">Purpose:</span> "{selectedReq.details.purpose}"</div>
                    </div>
                  )}
                </div>
              </div>

              {/* AI validation assistance */}
              {selectedReq.aiInsights && (
                <div className="bg-indigo-500/10 dark:bg-indigo-950/10 border border-indigo-500/20 rounded-2xl p-4 flex items-start space-x-3.5 shadow-sm text-xs text-left">
                  <FiCpu className="text-indigo-500 shrink-0 mt-0.5 animate-pulse" size={20} />
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">AI Decision Support suggestions</span>
                    <div className="mt-1 flex items-center space-x-2 font-bold text-slate-850 dark:text-slate-100">
                      <span>Recommendation:</span>
                      <span className={`px-2 py-0.5 rounded ${selectedReq.aiInsights.suggestion === 'Approve' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {selectedReq.aiInsights.suggestion} ({selectedReq.aiInsights.confidence * 100}% confidence)
                      </span>
                    </div>
                    <p className="text-slate-400 mt-1.5 leading-relaxed font-semibold">"{selectedReq.aiInsights.reasoning}"</p>
                  </div>
                </div>
              )}

              {/* Action Buttons for Assigned Reviewer */}
              {selectedReq.status === 'Pending' && selectedReq.assignedApprover?._id === user?._id && (
                <div className="bg-slate-900/40 dark:bg-darkbg-800 glass-panel p-5 rounded-2xl space-y-4">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Submit Review decision</h4>
                  <div className="space-y-3.5">
                    <textarea
                      placeholder="Provide reasoning comments..."
                      value={actionComment}
                      onChange={(e) => setActionComment(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                      rows="2"
                    />
                    <div className="flex space-x-3 text-xs font-bold">
                      <button
                        onClick={() => handleAction('Approve')}
                        className="flex-1 py-3 bg-emerald-650 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center space-x-2 shadow-glass cursor-pointer"
                      >
                        <FiCheckCircle /> <span>Approve Request</span>
                      </button>
                      <button
                        onClick={() => handleAction('Reject')}
                        className="flex-1 py-3 bg-rose-650 hover:bg-rose-500 text-white rounded-xl flex items-center justify-center space-x-2 shadow-glass cursor-pointer"
                      >
                        <FiXCircle /> <span>Reject Request</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments Feed */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider flex items-center"><FiMessageSquare className="mr-1.5" /> Comments Hub</h4>
                <div className="space-y-3.5 max-h-40 overflow-y-auto pr-1">
                  {selectedReq.comments.length === 0 ? (
                    <p className="text-xs text-slate-400 font-semibold">No comments posted yet.</p>
                  ) : (
                    selectedReq.comments.map((com, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800/80 rounded-2xl text-xs flex flex-col">
                        <div className="flex items-center justify-between text-slate-400 font-bold mb-1">
                          <span>{com.userName} ({com.userRole})</span>
                          <span className="text-[10px]">{new Date(com.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-250 font-semibold">"{com.text}"</p>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Comment composer */}
                <form onSubmit={handleAddComment} className="flex space-x-2 text-xs">
                  <input
                    type="text"
                    placeholder="Type comments..."
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                    value={submitComment}
                    onChange={(e) => setSubmitComment(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Post
                  </button>
                </form>
              </div>

            </div>

            {/* Right section: visual Timeline vertical stages */}
            <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-slate-150 dark:border-slate-800 lg:pl-6 pt-6 lg:pt-0">
              <Timeline 
                steps={selectedReq.workflowSteps} 
                timeline={selectedReq.timeline} 
              />
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default RequestManager;
