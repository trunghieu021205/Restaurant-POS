const cron = require('node-cron');
const MenuItem = require('../models/MenuItem');

const MENU_RESET_CRON = '0 8 * * *';
const MENU_RESET_TIMEZONE = process.env.MENU_RESET_TIMEZONE || 'Asia/Ho_Chi_Minh';

let menuResetTask = null;

async function resetMenuAvailability(logger = console) {
  const startedAt = new Date();
  try {
    const result = await MenuItem.updateMany(
      { isAvailable: false },
      { $set: { isAvailable: true } }
    );
    const modifiedCount = result.modifiedCount ?? result.nModified ?? 0;
    logger.info?.('[cron] menu availability reset completed', {
      modifiedCount,
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      timezone: MENU_RESET_TIMEZONE,
    });
    return { modifiedCount };
  } catch (err) {
    logger.error?.('[cron] menu availability reset failed', err);
    throw err;
  }
}

function startCronJobs(logger = console) {
  if (menuResetTask) return { menuResetTask };

  if (!cron.validate(MENU_RESET_CRON)) {
    throw new Error(`Invalid menu reset cron expression: ${MENU_RESET_CRON}`);
  }

  menuResetTask = cron.schedule(
    MENU_RESET_CRON,
    () => resetMenuAvailability(logger).catch(() => undefined),
    { timezone: MENU_RESET_TIMEZONE }
  );

  logger.info?.('[cron] registered menu availability reset', {
    schedule: MENU_RESET_CRON,
    timezone: MENU_RESET_TIMEZONE,
  });

  return { menuResetTask };
}

module.exports = {
  MENU_RESET_CRON,
  MENU_RESET_TIMEZONE,
  resetMenuAvailability,
  startCronJobs,
};
