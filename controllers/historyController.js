import History from '../models/History.js';

/**
 * Get all user history
 */
export const getAllHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 50, skip = 0, action } = req.query;

    let history;

    if (action) {
      history = await History.getHistoryByAction(
        userId,
        action,
        parseInt(limit)
      );
    } else {
      history = await History.getUserHistory(
        userId,
        parseInt(limit),
        parseInt(skip)
      );
    }

    res.status(200).json({
      success: true,
      data: {
        history,
        count: history.length
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching history',
      error: error.message
    });
  }
};

/**
 * Add a history entry
 */
export const addHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { action, details } = req.body;

    const historyEntry = await History.addEntry(userId, action, details);

    res.status(201).json({
      success: true,
      message: 'History entry added successfully',
      data: { history: historyEntry }
    });
  } catch (error) {
    console.error('Add history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding history entry',
      error: error.message
    });
  }
};

/**
 * Get history statistics
 */
export const getHistoryStats = async (req, res) => {
  try {
    const userId = req.userId;

    const history = await History.find({ userId });

    // Count by action type
    const actionCounts = {};
    history.forEach(entry => {
      actionCounts[entry.action] = (actionCounts[entry.action] || 0) + 1;
    });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await History.find({
      userId,
      timestamp: { $gte: sevenDaysAgo }
    }).sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      data: {
        totalEntries: history.length,
        actionCounts,
        recentActivity: recentActivity.slice(0, 10),
        activityLast7Days: recentActivity.length
      }
    });
  } catch (error) {
    console.error('Get history stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching history statistics',
      error: error.message
    });
  }
};

export default { getAllHistory, addHistory, getHistoryStats };
