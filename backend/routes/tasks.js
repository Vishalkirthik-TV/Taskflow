const express = require('express');
const { body, query, param } = require('express-validator');
const Task = require('../models/Task');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'completed'])
    .withMessage('Status must be pending or completed'),
];

const updateTaskValidation = [
  param('id').isMongoId().withMessage('Invalid task ID'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'completed'])
    .withMessage('Status must be pending or completed'),
];

const listTasksValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('status')
    .optional()
    .isIn(['pending', 'completed', 'all'])
    .withMessage('Status filter must be pending, completed, or all'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query cannot exceed 100 characters'),
];

// GET /api/tasks — list with search, filter, pagination
router.get('/', listTasksValidation, validate, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { status, search } = req.query;

    const filter = { userId: req.user._id };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Task.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/:id
router.get(
  '/:id',
  param('id').isMongoId().withMessage('Invalid task ID'),
  validate,
  async (req, res, next) => {
    try {
      const task = await Task.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found.',
        });
      }

      res.json({ success: true, data: { task } });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/tasks
router.post('/', createTaskValidation, validate, async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    const task = await Task.create({
      title,
      description: description || '',
      status: status || 'pending',
      userId: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/tasks/:id
router.put('/:id', updateTaskValidation, validate, async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    if (title === undefined && description === undefined && status === undefined) {
      return res.status(400).json({
        success: false,
        message: 'At least one field (title, description, or status) is required to update.',
      });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;

    await task.save();

    res.json({
      success: true,
      message: 'Task updated successfully.',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/tasks/:id/toggle — toggle pending ↔ completed
router.patch(
  '/:id/toggle',
  param('id').isMongoId().withMessage('Invalid task ID'),
  validate,
  async (req, res, next) => {
    try {
      const task = await Task.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found.',
        });
      }

      task.status = task.status === 'pending' ? 'completed' : 'pending';
      await task.save();

      res.json({
        success: true,
        message: `Task marked as ${task.status}.`,
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/tasks/:id
router.delete(
  '/:id',
  param('id').isMongoId().withMessage('Invalid task ID'),
  validate,
  async (req, res, next) => {
    try {
      const task = await Task.findOneAndDelete({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found.',
        });
      }

      res.json({
        success: true,
        message: 'Task deleted successfully.',
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
