const express = require('express');
const {
    searchVoters,
    getVoterById,
    getVotersByPart,
    getPartGenderStats,
    getPartNames,
    getVotersByAgeRange
} = require('../controllers/voterController');
/**
 * @swagger
 * /voter/by-age-range:
 *   get:
 *     tags: [Voter]
 *     summary: Get voters by age range
 *     parameters:
 *       - in: query
 *         name: minAge
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxAge
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of voters in age range
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 voters:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     total:
 *                       type: integer
 */
router.route('/by-age-range').get(getVotersByAgeRange);
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Voter
 *   description: Voter endpoints
 */

/**
 * @swagger
 * /voter/search:
 *   post:
 *     tags: [Voter]
 *     summary: Search voters
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 type: string
 *               partNo:
 *                 type: string
 *           example:
 *             Name: John
 *             partNo: "1"
 *     responses:
 *       200:
 *         description: List of voters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   Name:
 *                     type: string
 *       429:
 *         description: Too many requests
 */
router.route('/search')
    .post(searchVoters);

/**
 * @swagger
 * /voter/part-names:
 *   get:
 *     tags: [Voter]
 *     summary: Get all part names
 *     responses:
 *       200:
 *         description: List of part names
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.route('/part-names')
    .get(getPartNames);

/**
 * @swagger
 * /voter/by-part/{partNumber}:
 *   get:
 *     tags: [Voter]
 *     summary: Get voters by part number
 *     parameters:
 *       - in: path
 *         name: partNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of voters in part
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   Name:
 *                     type: string
 *       404:
 *         description: Part not found
 */
router.route('/by-part/:partNumber')
    .get(getVotersByPart);

/**
 * @swagger
 * /voter/stats/{partNumber}:
 *   get:
 *     tags: [Voter]
 *     summary: Get gender stats for a part
 *     parameters:
 *       - in: path
 *         name: partNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Gender stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 male:
 *                   type: number
 *                 female:
 *                   type: number
 *       404:
 *         description: Part not found
 */
router.route('/stats/:partNumber')
    .get(getPartGenderStats);

/**
 * @swagger
 * /voter/{id}:
 *   get:
 *     tags: [Voter]
 *     summary: Get voter by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Voter found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 Name:
 *                   type: string
 *       404:
 *         description: Voter not found
 */
router.route('/:id')
    .get(getVoterById);

// Temporary debug endpoint: returns total voters and count for a given part
router.get('/debug/part/:partNumber', async(req, res) => {
    try {
        const Voter = require('../models/voter');
        const part = parseInt(req.params.partNumber);
        const total = await Voter.countDocuments({});
        const countUpper = await Voter.countDocuments({ Part_no: part });
        const countLower = await Voter.countDocuments({ part_no: part });
        const sample = await Voter.findOne({ $or: [{ Part_no: part }, { part_no: part }] }).lean();
        res.json({ success: true, total, part, countUpper, countLower, sample });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

module.exports = router;