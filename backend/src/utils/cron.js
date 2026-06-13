const cron = require('node-cron');
const MenuItem = require('../models/MenuItem');

// Schedule reset isAvailable=true at 08:00 Asia/Ho_Chi_Minh every day
function startCronJobs() {
  cron.schedule(
    '0 8 * * *',
    async () => {
      try {
        await MenuItem.updateMany(
          { isAvailable: false },
          { $set: { isAvailable: true } }
        );
        // optional: log
        // console.log('[cron] reset MenuItem availability to true');
      } catch (err) {
        console.error('[cron] reset availability failed:', err);
      }
    },
    {
      timezone: 'Asia/Ho_Chi_Minh',
    }
  );
}

module.exports = { startCronJobs };

