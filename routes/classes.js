const router = require('express').Router();
const Class = require('../models/Class');
const { protect, teacherOnly } = require('../middleware/auth');

// Create class (teacher only)
router.post('/', protect, teacherOnly, async (req, res) => {
  try {
    const { name, subject } = req.body;
    if (!name) return res.status(400).json({ message: 'Class name required' });
    const cls = await Class.create({ name, subject, teacherId: req.user._id });
    res.status(201).json(cls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all classes for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const query = req.user.role === 'teacher'
      ? { teacherId: req.user._id }
      : { students: req.user._id };
    const classes = await Class.find(query).populate('teacherId', 'name email');
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single class
router.get('/:id', protect, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate('teacherId', 'name email')
      .populate('students', 'name email');
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    const isMember = cls.teacherId._id.equals(req.user._id) || cls.students.some(s => s._id.equals(req.user._id));
    if (!isMember) return res.status(403).json({ message: 'Access denied' });
    res.json(cls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Join class via code (student only)
router.post('/join', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Only students can join classes' });
    const { code } = req.body;
    const cls = await Class.findOne({ code: code?.toUpperCase() });
    if (!cls) return res.status(404).json({ message: 'Invalid class code' });
    if (cls.students.includes(req.user._id)) return res.status(400).json({ message: 'Already enrolled' });
    cls.students.push(req.user._id);
    await cls.save();
    res.json({ message: 'Joined successfully', class: cls });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
