const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const workerController = require('../controllers/workerController');

router.use(authenticateToken);

const ADMIN_OWNER = [constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER];
router.use(authorize(...ADMIN_OWNER));

/**
 * @swagger
 * tags:
 *   name: Workers
 *   description: Worker/Technician management
 */

/**
 * @swagger
 * /workers:
 *   get:
 *     summary: List workers
 *     tags: [Workers]
 *     responses:
 *       200:
 *         description: List of workers
 */
router.get('/', workerController.listWorkers);

/**
 * @swagger
 * /workers/{workerId}:
 *   get:
 *     summary: Get worker by ID
 *     tags: [Workers]
 *     parameters:
 *       - in: path
 *         name: workerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Worker details
 */
router.get('/:workerId', workerController.getWorker);

/**
 * @swagger
 * /workers:
 *   post:
 *     summary: Create new worker
 *     tags: [Workers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - WorkerName
 *               - Phone
 *             properties:
 *               WorkerName:
 *                 type: string
 *               Phone:
 *                 type: string
 *               Skills:
 *                 type: string
 *               Username:
 *                 type: string
 *               Password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', workerController.createWorker);

/**
 * @swagger
 * /workers/{id}:
 *   put:
 *     summary: Update worker
 *     tags: [Workers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/:id', workerController.updateWorker);

/**
 * @swagger
 * /workers/{id}:
 *   delete:
 *     summary: Delete worker (Soft)
 *     tags: [Workers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       204:
 *         description: Deleted
 */
router.delete('/:id', workerController.deleteWorker);

module.exports = router;
