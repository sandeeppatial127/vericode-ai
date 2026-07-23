import { analyzeCode, explainCode, fixCode } from '../services/aiService.js';
import History from '../models/History.js';

/**
 * @desc    Analyze Code
 * @route   POST /api/analyze
 * @access  Private
 */
export const analyze = async (req, res, next) => {
  const { language, code } = req.body;

  try {
    const analysisResult = await analyzeCode(code, language);

    // Save in history for the user
    const historyItem = await History.create({
      userId: req.user._id,
      language,
      originalCode: code,
      analysis: analysisResult
    });

    res.status(200).json({
      success: true,
      message: 'Code analysis completed successfully',
      data: {
        analysis: analysisResult,
        historyId: historyItem._id
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Explain Code
 * @route   POST /api/explain
 * @access  Private
 */
export const explain = async (req, res, next) => {
  const { language, code } = req.body;

  try {
    const explanationResult = await explainCode(code, language);

    // Save in history
    const historyItem = await History.create({
      userId: req.user._id,
      language,
      originalCode: code,
      explanation: explanationResult.explanation // store the full markdown explanation
    });

    res.status(200).json({
      success: true,
      message: 'Code explanation generated successfully',
      data: {
        explanation: explanationResult,
        historyId: historyItem._id
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fix Code
 * @route   POST /api/fix
 * @access  Private
 */
export const fix = async (req, res, next) => {
  const { language, code } = req.body;

  try {
    const fixResult = await fixCode(code, language);

    // Save in history
    const historyItem = await History.create({
      userId: req.user._id,
      language,
      originalCode: code,
      fixedCode: fixResult.fixedCode
    });

    res.status(200).json({
      success: true,
      message: 'Code optimization and fix completed successfully',
      data: {
        fix: fixResult,
        historyId: historyItem._id
      }
    });
  } catch (error) {
    next(error);
  }
};
