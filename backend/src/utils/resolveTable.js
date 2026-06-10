const mongoose = require('mongoose');
const Table = require('../models/Table');

async function resolveTableByIdentifier(identifier) {
  const value = String(identifier || '').trim();

  if (!value) {
    return null;
  }

  if (mongoose.Types.ObjectId.isValid(value)) {
    const byId = await Table.findById(value);
    if (byId) {
      return byId;
    }
  }

  if (/^\d+$/.test(value)) {
    const number = Number(value);
    if (Number.isSafeInteger(number) && number > 0) {
      return Table.findOne({ number });
    }
  }

  return null;
}

module.exports = { resolveTableByIdentifier };
