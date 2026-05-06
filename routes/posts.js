const router = require('express').Router();
const Post = require('../models/Post');
const Class = require('../models/Class');
const { protect, teacherOnly } = require('../middleware/auth');

const verifyClassAccess = async (classId, user) => {
  const cls = await Class.findById(classId);
  if (!cls) return null;
  const isMember = cls.teacherId.equals(user._id) || cls.students.includes(user._id);
  return isMember ? cls : null;
};

// Get posts for a class
router.get('/:classId', protect, async (req, res) => {
  try {
    const cls = await verifyClassAccess(req.params.classId, req.user);
    if (!cls) return res.status(403).json({ message: 'Access denied' });
    const posts = await Post.find({ classId: req.params.classId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create post (teacher only)
router.post('/:classId', protect, teacherOnly, async (req, res) => {
  try {
    const cls = await Class.findOne({ _id: req.params.classId, teacherId: req.user._id });
    if (!cls) return res.status(403).json({ message: 'Not your class' });
    const { title, description, link, type, deadline } = req.body;
    if (!title || !type) return res.status(400).json({ message: 'Title and type required' });
    const post = await Post.create({ classId: req.params.classId, title, description, link, type, deadline });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete post (teacher only)
router.delete('/:classId/:postId', protect, teacherOnly, async (req, res) => {
  try {
    const cls = await Class.findOne({ _id: req.params.classId, teacherId: req.user._id });
    if (!cls) return res.status(403).json({ message: 'Not your class' });
    await Post.findByIdAndDelete(req.params.postId);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
