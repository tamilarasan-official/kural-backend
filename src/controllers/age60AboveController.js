const Age60AboveVoter = require('../models/age60AboveVoter');
const { asyncHandler } = require('../utils/asyncHandler');

// List age 60+ voters with pagination and optional search
const listAge60AboveVoters = asyncHandler(async(req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const q = (req.query.q || '').trim();

    const filter = {};
    if (q) {
        filter.$or = [
            { 'Name': { $regex: q, $options: 'i' } },
            { 'Number': { $regex: q, $options: 'i' } },
            { 's.Name': { $regex: q, $options: 'i' } },
            { 's.Number': { $regex: q, $options: 'i' } },
        ];
    }

    const [items, total] = await Promise.all([
        Age60AboveVoter.find(filter).skip((page - 1) * limit).limit(limit),
        Age60AboveVoter.countDocuments(filter),
    ]);

    // Calculate gender summary - handle both root level and nested 's' object
    const maleCount = await Age60AboveVoter.countDocuments({ $or: [{ sex: 'Male' }, { 's.sex': 'Male' }] });
    const femaleCount = await Age60AboveVoter.countDocuments({ $or: [{ sex: 'Female' }, { 's.sex': 'Female' }] });
    const otherCount = await Age60AboveVoter.countDocuments({ $or: [{ sex: 'Third' }, { 's.sex': 'Third' }] });

    res.json({
        success: true,
        data: items,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalCount: total,
            limit,
            hasNext: page * limit < total,
            hasPrev: page > 1
        },
        genderSummary: {
            male: maleCount,
            female: femaleCount,
            other: otherCount,
            total: total
        }
    });
});

module.exports = { listAge60AboveVoters };