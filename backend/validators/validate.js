import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Extract first error message or compile them
    const errorMsg = errors.array().map(err => err.msg).join(', ');
    
    return res.status(400).json({
      success: false,
      message: errorMsg,
      data: errors.array()
    });
  }
  next();
};
