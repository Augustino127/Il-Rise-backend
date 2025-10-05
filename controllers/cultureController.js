import Culture from '../models/Culture.js';

/**
 * Get all cultures
 */
export const getAllCultures = async (req, res) => {
  try {
    const { active, category, difficulty } = req.query;

    const filter = {};

    if (active !== undefined) {
      filter.active = active === 'true';
    }

    if (category) {
      filter.category = category;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    const cultures = await Culture.find(filter).sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: {
        cultures,
        count: cultures.length
      }
    });
  } catch (error) {
    console.error('Get cultures error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cultures',
      error: error.message
    });
  }
};

/**
 * Get culture by ID
 */
export const getCultureById = async (req, res) => {
  try {
    const { id } = req.params;

    const culture = await Culture.findById(id);

    if (!culture) {
      return res.status(404).json({
        success: false,
        message: 'Culture not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { culture }
    });
  } catch (error) {
    console.error('Get culture error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching culture',
      error: error.message
    });
  }
};

/**
 * Create new culture (admin only)
 */
export const createCulture = async (req, res) => {
  try {
    const cultureData = req.body;

    // Check if culture with same name exists
    const existingCulture = await Culture.findOne({ name: cultureData.name });

    if (existingCulture) {
      return res.status(409).json({
        success: false,
        message: 'Culture with this name already exists'
      });
    }

    // Create culture
    const culture = await Culture.create(cultureData);

    res.status(201).json({
      success: true,
      message: 'Culture created successfully',
      data: { culture }
    });
  } catch (error) {
    console.error('Create culture error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating culture',
      error: error.message
    });
  }
};

/**
 * Update culture (admin only)
 */
export const updateCulture = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const culture = await Culture.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!culture) {
      return res.status(404).json({
        success: false,
        message: 'Culture not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Culture updated successfully',
      data: { culture }
    });
  } catch (error) {
    console.error('Update culture error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating culture',
      error: error.message
    });
  }
};

/**
 * Delete culture (admin only)
 */
export const deleteCulture = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete by setting active to false
    const culture = await Culture.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );

    if (!culture) {
      return res.status(404).json({
        success: false,
        message: 'Culture not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Culture deactivated successfully',
      data: { culture }
    });
  } catch (error) {
    console.error('Delete culture error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting culture',
      error: error.message
    });
  }
};

export default {
  getAllCultures,
  getCultureById,
  createCulture,
  updateCulture,
  deleteCulture
};
