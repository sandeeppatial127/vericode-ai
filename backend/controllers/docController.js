/**
 * @desc    Get API Documentation
 * @route   GET /api/docs
 * @access  Public
 */
export const getDocs = (req, res) => {
  const docs = {
    title: 'VeriCode AI API Documentation',
    version: '1.0.0',
    description: 'Documentation for VeriCode AI backend services.',
    base_url: '/api',
    endpoints: [
      {
        category: 'Authentication',
        routes: [
          {
            method: 'POST',
            path: '/api/auth/register',
            description: 'Register a new user account',
            auth: 'None',
            body: {
              name: 'string (required)',
              email: 'string (required, unique)',
              password: 'string (required, min 6 characters)'
            },
            response: {
              success: 'boolean',
              message: 'string',
              data: {
                user: { id: 'string', name: 'string', email: 'string', avatar: 'string', createdAt: 'date' },
                token: 'string'
              }
            }
          },
          {
            method: 'POST',
            path: '/api/auth/login',
            description: 'Login to an existing account',
            auth: 'None',
            body: {
              email: 'string (required)',
              password: 'string (required)'
            },
            response: {
              success: 'boolean',
              message: 'string',
              data: {
                user: { id: 'string', name: 'string', email: 'string', avatar: 'string', createdAt: 'date' },
                token: 'string'
              }
            }
          },
          {
            method: 'POST',
            path: '/api/auth/logout',
            description: 'Logout and clear authentication cookies',
            auth: 'None',
            response: {
              success: 'boolean',
              message: 'string',
              data: 'null'
            }
          },
          {
            method: 'GET',
            path: '/api/auth/me',
            description: 'Get details of the currently logged-in user',
            auth: 'JWT (Cookie or Bearer)',
            response: {
              success: 'boolean',
              message: 'string',
              data: {
                user: { id: 'string', name: 'string', email: 'string', avatar: 'string', createdAt: 'date' }
              }
            }
          },
          {
            method: 'PUT',
            path: '/api/auth/profile',
            description: 'Update user profile name, email, or avatar',
            auth: 'JWT (Cookie or Bearer)',
            body: {
              name: 'string (optional)',
              email: 'string (optional)',
              avatar: 'string (optional, must be URL)'
            },
            response: {
              success: 'boolean',
              message: 'string',
              data: {
                user: { id: 'string', name: 'string', email: 'string', avatar: 'string', createdAt: 'date' }
              }
            }
          }
        ]
      },
      {
        category: 'AI Services',
        routes: [
          {
            method: 'POST',
            path: '/api/analyze',
            description: 'Analyze code and generate a  report',
            auth: 'JWT Required',
            body: {
              language: 'string (required)',
              code: 'string (required)'
            },
            response: {
              success: 'boolean',
              message: 'string',
              data: {
                overallScore: 'number (0-100)',
                scoreBreakdown: 'array of objects',
                summary: 'string',
                critical: 'array of objects',
                warnings: 'array of objects',
                securityAudit: 'object',
                complianceStandards: 'array of objects',
                proTip: 'string',
                needToFix: 'boolean'
              }
            }
          },
          {
            method: 'POST',
            path: '/api/explain',
            description: 'Generate line-by-line explanation and complexities of code',
            auth: 'JWT Required',
            body: {
              language: 'string (required)',
              code: 'string (required)'
            },
            response: {
              success: 'boolean',
              message: 'string',
              data: {
                lineByLine: 'string',
                timeComplexity: 'string',
                spaceComplexity: 'string',
                logic: 'string',
                improvements: 'string',
                explanation: 'string (Markdown)'
              }
            }
          },
          {
            method: 'POST',
            path: '/api/fix',
            description: 'Optimize, clean, and fix bugs in code snippet',
            auth: 'JWT Required',
            body: {
              language: 'string (required)',
              code: 'string (required)'
            },
            response: {
              success: 'boolean',
              message: 'string',
              data: {
                fixedCode: 'string',
                bugList: 'array of strings',
                explanation: 'string',
                optimizedCode: 'string'
              }
            }
          }
        ]
      },
      {
        category: 'History Management',
        routes: [
          {
            method: 'GET',
            path: '/api/history',
            description: 'List user request histories with search and language filters',
            auth: 'JWT Required',
            query_params: {
              search: 'string (optional, matches code contents)',
              language: 'string (optional, filter by programming language)'
            },
            response: {
              success: 'boolean',
              message: 'string',
              data: 'array of history records'
            }
          },
          {
            method: 'GET',
            path: '/api/history/:id',
            description: 'Get details of a specific history item',
            auth: 'JWT Required',
            response: {
              success: 'boolean',
              message: 'string',
              data: 'history record'
            }
          },
          {
            method: 'DELETE',
            path: '/api/history/:id',
            description: 'Delete a request history record',
            auth: 'JWT Required',
            response: {
              success: 'boolean',
              message: 'string',
              data: 'null'
            }
          },
          {
            method: 'GET',
            path: '/api/download/:historyId',
            description: 'Download the source code file with correct extension',
            auth: 'JWT Required',
            response: 'Source code text file download stream'
          }
        ]
      },
      {
        category: 'Saved Reports',
        routes: [
          {
            method: 'POST',
            path: '/api/report',
            description: 'Save an analysis report to dashboard',
            auth: 'JWT Required',
            body: {
              title: 'string (required)',
              language: 'string (required)',
              analysis: 'object (required, analysis output)',
              fixedCode: 'string (optional)'
            },
            response: {
              success: 'boolean',
              message: 'string',
              data: 'saved report object'
            }
          },
          {
            method: 'GET',
            path: '/api/report',
            description: 'List all saved reports for the user',
            auth: 'JWT Required',
            response: {
              success: 'boolean',
              message: 'string',
              data: 'array of saved reports'
            }
          },
          {
            method: 'GET',
            path: '/api/report/:id',
            description: 'Get details of a specific saved report',
            auth: 'JWT Required',
            response: {
              success: 'boolean',
              message: 'string',
              data: 'saved report object'
            }
          },
          {
            method: 'DELETE',
            path: '/api/report/:id',
            description: 'Delete a saved report',
            auth: 'JWT Required',
            response: {
              success: 'boolean',
              message: 'string',
              data: 'null'
            }
          }
        ]
      },
      {
        category: 'Dashboard',
        routes: [
          {
            method: 'GET',
            path: '/api/dashboard',
            description: 'Get summary statistics of analyses and activity logs',
            auth: 'JWT Required',
            response: {
              success: 'boolean',
              message: 'string',
              data: {
                totalAnalyses: 'number',
                favoriteLanguage: 'string',
                totalFixes: 'number',
                totalExplanations: 'number',
                recentActivity: 'array of activity logs'
              }
            }
          }
        ]
      }
    ]
  };

  res.status(200).json({
    success: true,
    message: 'API documentation retrieved successfully',
    data: docs
  });
};
