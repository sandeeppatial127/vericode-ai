import Report from '../models/Report.js';

/**
 * @desc    Save a new report
 * @route   POST /api/report
 * @access  Private
 */
export const saveReport = async (req, res, next) => {
  const { title, language, analysis, fixedCode } = req.body;

  try {
    if (!title || !language || !analysis) {
      return res.status(400).json({
        success: false,
        message: 'Title, language, and analysis content are required to save a report',
        data: null
      });
    }

    const report = await Report.create({
      userId: req.user._id,
      title,
      language,
      analysis,
      fixedCode
    });

    res.status(201).json({
      success: true,
      message: 'Report saved successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reports for user
 * @route   GET /api/report
 * @access  Private
 */
export const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Reports retrieved successfully',
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single report by ID
 * @route   GET /api/report/:id
 * @access  Private
 */
export const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Report retrieved successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a report
 * @route   DELETE /api/report/:id
 * @access  Private
 */
export const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found or unauthorized',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};
