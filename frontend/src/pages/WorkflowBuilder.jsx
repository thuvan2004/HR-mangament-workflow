import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FiPlus, FiTrash2, FiSave, FiSliders, FiPlayCircle, FiGrid } from 'react-icons/fi';

const WorkflowBuilder = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selection
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  // Editor values
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [requestType, setRequestType] = useState('Leave');
  const [steps, setSteps] = useState([
    { role: 'Manager', label: 'Department Manager Review' }
  ]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/workflows');
      if (data.success) {
        setTemplates(data.data);
        if (data.data.length > 0) {
          loadTemplateIntoEditor(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load templates: ', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const loadTemplateIntoEditor = (temp) => {
    setSelectedTemplate(temp);
    setName(temp.name);
    setDescription(temp.description);
    setRequestType(temp.requestType);
    setSteps(temp.steps.map(s => ({ role: s.role, label: s.label })));
  };

  const handleAddNewTemplate = () => {
    setSelectedTemplate(null);
    setName('New Workflow Path');
    setDescription('Define the sequence of reviews required.');
    setRequestType('Leave');
    setSteps([
      { role: 'Manager', label: 'Immediate Supervisor Check' }
    ]);
  };

  const handleAddStep = () => {
    setSteps([...steps, { role: 'HR', label: 'Secondary Compliance Review' }]);
  };

  const handleRemoveStep = (idx) => {
    if (steps.length === 1) return alert('Workflows must have at least 1 approval stage.');
    setSteps(steps.filter((_, i) => i !== idx));
  };

  const handleStepChange = (idx, field, value) => {
    const updated = [...steps];
    updated[idx][field] = value;
    setSteps(updated);
  };

  const handleSave = async () => {
    if (!name.trim()) return alert('Please enter a template name.');
    try {
      const payload = { name, description, requestType, steps };
      let res;
      if (selectedTemplate) {
        // Update
        res = await api.put(`/workflows/${selectedTemplate._id}`, payload);
      } else {
        // Create new
        res = await api.post('/workflows', payload);
      }
      if (res.data.success) {
        alert('Workflow template saved successfully!');
        fetchTemplates();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save template');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 min-h-[85vh]">
      
      {/* A. Sidebar list of templates */}
      <div className="w-full lg:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-5 flex flex-col shrink-0">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
          <h3 className="font-extrabold text-sm text-slate-850 dark:text-white uppercase tracking-wider">Workflow Templates</h3>
          <button
            onClick={handleAddNewTemplate}
            className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl hover:bg-indigo-500 hover:text-white transition-colors cursor-pointer"
            title="Create Custom Route"
          >
            <FiPlus size={16} />
          </button>
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto max-h-96 lg:max-h-none">
          {loading ? (
            <div className="text-slate-450 py-4 text-center text-xs">Loading templates...</div>
          ) : templates.length === 0 ? (
            <div className="text-slate-450 py-4 text-center text-xs">No active templates. Click + to add.</div>
          ) : (
            templates.map((temp) => (
              <button
                key={temp._id}
                onClick={() => loadTemplateIntoEditor(temp)}
                className={`
                  w-full px-4 py-3 rounded-2xl border text-left text-xs transition-all duration-150 flex items-center justify-between group
                  ${selectedTemplate?._id === temp._id
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-glass-hover font-semibold' 
                    : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }
                `}
              >
                <div className="truncate">
                  <span className="block font-bold truncate">{temp.name}</span>
                  <span className={`text-[10px] mt-0.5 block ${selectedTemplate?._id === temp._id ? 'text-indigo-200' : 'text-slate-400'}`}>
                    Request: {temp.requestType} ({temp.steps.length} steps)
                  </span>
                </div>
                <FiPlayCircle className="opacity-0 group-hover:opacity-100 transition-opacity ml-2" size={14} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* B. Workflow Canvas Editor */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col relative overflow-hidden workflow-grid-bg">
        
        {/* Editor controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 z-10">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-850 dark:text-white tracking-tight">Visual Route Studio</h1>
            <p className="text-xs text-slate-400 mt-1">Design stages and define reviewer authorities required to authorize submissions.</p>
          </div>
          
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-glass cursor-pointer transition-colors text-xs shrink-0"
          >
            <FiSave size={14} /> <span>Save Route Config</span>
          </button>
        </div>

        {/* Template metadata forms */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 z-10 text-xs font-semibold text-slate-400">
          <div className="md:col-span-2">
            <label className="block uppercase tracking-wider text-[10px] mb-1.5">Route Template Title</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-200 focus:outline-none"
              placeholder="Leave Approval Policy"
            />
          </div>
          <div>
            <label className="block uppercase tracking-wider text-[10px] mb-1.5">Target Request Module</label>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-350 focus:outline-none"
            >
              <option value="Leave">Leave Requests</option>
              <option value="Expense">Expense Claims</option>
              <option value="Asset">Asset Requests</option>
              <option value="HRRequest">HR Letters</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="block uppercase tracking-wider text-[10px] mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-200 focus:outline-none"
              placeholder="Describe this route sequence..."
            />
          </div>
        </div>

        {/* C. VISUAL FLOW CHART CANVAS */}
        <div className="flex-1 mt-8 border border-dashed border-slate-250 dark:border-slate-800 rounded-3xl p-6 overflow-y-auto flex flex-col items-center justify-start py-10 space-y-6 min-h-[300px]">
          
          {/* Initiator bubble */}
          <div className="w-56 bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-center text-xs shadow-sm z-10 shrink-0">
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Employee Submits Request</span>
            <p className="text-slate-450 dark:text-slate-300 mt-1 font-semibold">Workflow Initiated</p>
          </div>

          {/* Steps loops */}
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              {/* Connecting line */}
              <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-850 shrink-0" />
              
              {/* Stage Node */}
              <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 flex items-center justify-between shadow-sm relative group hover:border-indigo-550/40 transition-colors z-10 shrink-0">
                <div className="flex items-center space-x-3.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={step.label}
                      onChange={(e) => handleStepChange(idx, 'label', e.target.value)}
                      className="bg-transparent border-0 outline-none text-xs font-semibold text-slate-850 dark:text-slate-200 p-0 border-b border-transparent focus:border-slate-700 w-48 md:w-64"
                      placeholder={`Step ${idx + 1} Name`}
                    />
                    <div className="flex items-center space-x-2 text-[10px] text-slate-450 font-semibold uppercase tracking-wider">
                      <span>Auth Role:</span>
                      <select
                        value={step.role}
                        onChange={(e) => handleStepChange(idx, 'role', e.target.value)}
                        className="bg-transparent border-0 text-indigo-500 dark:text-indigo-400 font-bold focus:ring-0 p-0 outline-none select-none"
                      >
                        <option value="Manager">Manager</option>
                        <option value="HR">HR</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveStep(idx)}
                  className="p-2 text-slate-400 hover:text-rose-500 bg-slate-50 dark:bg-slate-850 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                  title="Remove stage"
                >
                  <FiTrash2 size={13} />
                </button>
              </div>
            </React.Fragment>
          ))}

          {/* Connector to Add Button */}
          <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-850 shrink-0" />

          {/* Add Step Button */}
          <button
            onClick={handleAddStep}
            className="flex items-center space-x-1.5 px-4 py-2 border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-500 hover:text-indigo-500 rounded-xl text-slate-450 text-xs font-bold transition-all cursor-pointer shrink-0 z-10"
          >
            <FiPlus size={14} /> <span>Add Approval Stage</span>
          </button>

        </div>

      </div>

    </div>
  );
};

export default WorkflowBuilder;
