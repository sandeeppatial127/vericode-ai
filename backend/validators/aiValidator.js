import { body } from 'express-validator';
import { validate } from './validate.js';

export const validateAIRequest = [
  body('language')
    .trim()
    .notEmpty()
    .withMessage('Programming language is required'),
    
  body('code')
    .notEmpty()
    .withMessage('Code content is required')
    .isString()
    .withMessage('Code must be a string')
    .custom((value) => {
      if (value.trim().length === 0) {
        throw new Error('Code content cannot be empty or blank space');
      }
      return true;
    }),
    
  validate
];
