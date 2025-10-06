const SoonVoter = require('../models/soonVoter');

exports.create = async (req, res, next) => {
  try {
    const doc = await SoonVoter.create(req.body);
    res.json({ success: true, data: doc });
  } catch (e) { next(e); }
};

exports.list = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const q = (req.query.q || '').trim();
    const filter = {};
    if (q) filter.$or = [{ voterName: { $regex: q, $options: 'i' } }, { epicId: { $regex: q, $options: 'i' } }];
    const [items, total] = await Promise.all([
      SoonVoter.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      SoonVoter.countDocuments(filter)
    ]);
    res.json({ success: true, data: items, pagination: { total, page, limit, totalPages: Math.ceil(total/limit) } });
  } catch (e) { next(e); }
};


