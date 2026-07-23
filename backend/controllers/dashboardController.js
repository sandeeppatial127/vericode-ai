import History from '../models/History.js';

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/dashboard
 * @access  Private
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Get counts
    const totalAnalyses = await History.countDocuments({
      userId,
      analysis: { $ne: null }
    });

    const totalFixes = await History.countDocuments({
      userId,
      fixedCode: { $ne: null }
    });

    const totalExplanations = await History.countDocuments({
      userId,
      explanation: { $ne: null }
    });

    // 2. Favorite Language aggregation
    const favLangResult = await History.aggregate([
      { $match: { userId } },
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    const favoriteLanguage = favLangResult.length > 0 ? favLangResult[0]._id : 'None';

    // 3. Recent Activity (last 5 entries)
    const recentActivity = await History.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('language createdAt originalCode analysis fixedCode explanation');

    // Format recent activity for dashboard presentation
    const formattedActivity = recentActivity.map(item => {
      let type = 'analysis';
      if (item.fixedCode) type = 'fix';
      else if (item.explanation) type = 'explanation';

      return {
        id: item._id,
        language: item.language,
        type,
        createdAt: item.createdAt,
        snippet: item.originalCode ? (item.originalCode.substring(0, 100) + (item.originalCode.length > 100 ? '...' : '')) : ''
      };
    });

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved',
      data: {
        totalAnalyses,
        favoriteLanguage,
        totalFixes,
        totalExplanations,
        recentActivity: formattedActivity
      }
    });
  } catch (error) {
    next(error);
  }
};
