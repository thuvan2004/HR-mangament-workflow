const express = require('express');
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Department routes (Must be declared before general employee wildcards to prevent collision)
router.get('/departments', protect, getDepartments);
router.post('/departments', protect, authorize('admin', 'hr'), createDepartment);
router.put('/departments/:id', protect, authorize('admin', 'hr'), updateDepartment);
router.delete('/departments/:id', protect, authorize('admin'), deleteDepartment);

// Employee profile routes
router.get('/', protect, getEmployees);
router.post('/', protect, authorize('admin', 'hr'), createEmployee);
router.get('/:id', protect, getEmployeeById);
router.put('/:id', protect, updateEmployee);
router.delete('/:id', protect, authorize('admin'), deleteEmployee);

module.exports = router;
