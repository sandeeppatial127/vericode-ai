import History from '../models/History.js';

// Helper map for file extensions
const getFileExtension = (language) => {
  const map = {
    'javascript': '.js',
    'typescript': '.ts',
    'python': '.py',
    'java': '.java',
    'c': '.c',
    'c++': '.cpp',
    'c#': '.cs',
    'php': '.php',
    'ruby': '.rb',
    'go': '.go',
    'rust': '.rs',
    'swift': '.swift',
    'kotlin': '.kt',
    'dart': '.dart',
    'r': '.r',
    'perl': '.pl',
    'scala': '.scala',
    'shell script': '.sh',
    'sql': '.sql',
    'html': '.html',
    'css': '.css',
    'react': '.jsx',
    'vue.js': '.vue',
    'angular': '.ts',
    'json': '.json',
    'xml': '.xml',
    'yaml': '.yaml',
    'markdown': '.md'
  };
  const key = language?.toLowerCase().trim();
  return map[key] || '.txt';
};

/**
 * @desc    Get user history with optional search/filter
 * @route   GET /api/history
 * @access  Private
 */
export const getHistory = async (req, res, next) => {
  try {
    const { search, language } = req.query;
    
    // Base query: only current user
    const query = { userId: req.user._id };

    // Search filter
    if (search) {
      query.$or = [
        { originalCode: { $regex: search, $options: 'i' } },
        { fixedCode: { $regex: search, $options: 'i' } }
      ];
    }

    // Language filter
    if (language) {
      query.language = { $regex: `^${language.trim()}$`, $options: 'i' };
    }

    const history = await History.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'History retrieved successfully',
      data: history
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single history detail
 * @route   GET /api/history/:id
 * @access  Private
 */
export const getHistoryById = async (req, res, next) => {
  try {
    const historyItem = await History.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!historyItem) {
      return res.status(404).json({
        success: false,
        message: 'History item not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'History item details retrieved',
      data: historyItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a history item
 * @route   DELETE /api/history/:id
 * @access  Private
 */
export const deleteHistory = async (req, res, next) => {
  try {
    const historyItem = await History.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!historyItem) {
      return res.status(404).json({
        success: false,
        message: 'History item not found or unauthorized',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'History item deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download code for a history item
 * @route   GET /api/download/:historyId
 * @access  Private
 */
export const downloadCode = async (req, res, next) => {
  try {
    const historyItem = await History.findOne({
      _id: req.params.historyId,
      userId: req.user._id
    });

    if (!historyItem) {
      return res.status(404).json({
        success: false,
        message: 'History item not found or unauthorized',
        data: null
      });
    }

    // Determine code to download: fixed code first, otherwise original code
    const code = historyItem.fixedCode || historyItem.originalCode;
    const extension = getFileExtension(historyItem.language);
    const filename = `vericode_${historyItem._id}${extension}`;

    // Set file headers for download
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(code);
  } catch (error) {
    next(error);
  }
};
