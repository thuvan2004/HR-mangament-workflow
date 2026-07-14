import User from '../models/User.js';
import Analysis from '../models/Analysis.js';

// @desc    Get dashboard metrics & aggregations
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAnalyses = await Analysis.countDocuments();

    // Average health score
    const avgScoreAgg = await Analysis.aggregate([
      { $group: { _id: null, avg: { $avg: '$healthScore' } } }
    ]);
    const averageHairScore = avgScoreAgg.length > 0 ? Math.round(avgScoreAgg[0].avg) : 0;

    // Active users: Users with at least one analysis
    const activeUsersList = await Analysis.distinct('userId');
    const activeUsers = activeUsersList.length;

    // Norwood Stage Distribution
    const stageDistribution = await Analysis.aggregate([
      { $group: { _id: '$norwoodStage', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const formattedStageDistribution = stageDistribution.map(item => ({
      stage: item._id,
      count: item.count
    }));

    // Find the most common Norwood stage
    let mostCommonNorwoodStage = 'N/A';
    if (formattedStageDistribution.length > 0) {
      const sorted = [...formattedStageDistribution].sort((a, b) => b.count - a.count);
      mostCommonNorwoodStage = sorted[0].stage;
    }

    // User growth & Analysis growth mock analytics (last 6 months trend for chart)
    const userGrowth = [
      { month: 'Jan', users: Math.round(totalUsers * 0.4) },
      { month: 'Feb', users: Math.round(totalUsers * 0.5) },
      { month: 'Mar', users: Math.round(totalUsers * 0.7) },
      { month: 'Apr', users: Math.round(totalUsers * 0.8) },
      { month: 'May', users: Math.round(totalUsers * 0.9) },
      { month: 'Jun', users: totalUsers }
    ];

    const analysisGrowth = [
      { month: 'Jan', analyses: Math.round(totalAnalyses * 0.3) },
      { month: 'Feb', analyses: Math.round(totalAnalyses * 0.4) },
      { month: 'Mar', analyses: Math.round(totalAnalyses * 0.6) },
      { month: 'Apr', analyses: Math.round(totalAnalyses * 0.75) },
      { month: 'May', analyses: Math.round(totalAnalyses * 0.9) },
      { month: 'Jun', analyses: totalAnalyses }
    ];

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalAnalyses,
        activeUsers,
        averageHairScore,
        mostCommonNorwoodStage,
        userGrowth,
        analysisGrowth,
        stageDistribution: formattedStageDistribution
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update user role
// @route   PATCH /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Please specify a valid role (user or admin)' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully`,
      user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
