const express = require('express');
const { getHolidays, createHoliday, getCalendarEvents } = require('../controllers/calendarController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect); // All calendar routes require authentication

router.route('/holidays')
  .get(getHolidays)
  .post(createHoliday);

router.get('/events', getCalendarEvents);

module.exports = router;
