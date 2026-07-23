import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getErrorMessage = (error, fallback) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message) return error.message;
  return fallback;
};

// Configure Axios with baseURL and cookie credentials
export const API = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token from localStorage if present
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vericode_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Surface backend error messages for all failed requests
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = getErrorMessage(error, 'Request failed');
    return Promise.reject(new Error(message));
  }
);

/**
 * AI API Calls
 */

// 1. Code Analysis
export async function main(code, language) {
  try {
    const response = await API.post('/analyze', { code, language });
    if (response.data && response.data.success) {
      if (response.data.data.historyId) {
        localStorage.setItem('last_history_id', response.data.data.historyId);
      }
      return response.data.data.analysis;
    }
    throw new Error(response.data?.message || 'Failed to analyze code');
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to analyze code'));
  }
}

// 2. Explain Code
export async function explain(code, language) {
  try {
    const response = await API.post('/explain', { code, language });
    if (response.data && response.data.success) {
      if (response.data.data.historyId) {
        localStorage.setItem('last_history_id', response.data.data.historyId);
      }
      const explanation = response.data.data.explanation;

      if (typeof explanation === 'string') {
        return explanation;
      }

      if (explanation?.explanation) {
        return explanation.explanation;
      }

      return [
        explanation?.lineByLine && `## Line-by-line explanation\n\n${explanation.lineByLine}`,
        explanation?.timeComplexity && `## Time complexity\n\n${explanation.timeComplexity}`,
        explanation?.spaceComplexity && `## Space complexity\n\n${explanation.spaceComplexity}`,
        explanation?.logic && `## Logic\n\n${explanation.logic}`,
        explanation?.improvements && `## Improvements\n\n${explanation.improvements}`
      ].filter(Boolean).join('\n\n');
    }
    throw new Error(response.data?.message || 'Failed to explain code');
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to explain code'));
  }
}

// 3. Fix Code
export async function fix(code, language) {
  try {
    const response = await API.post('/fix', { code, language });
    if (response.data && response.data.success) {
      if (response.data.data.historyId) {
        localStorage.setItem('last_history_id', response.data.data.historyId);
      }
      const fixResult = response.data.data?.fix;
      const fixedCode = fixResult?.fixedCode || fixResult?.optimizedCode;
      if (typeof fixedCode === 'string' && fixedCode.trim()) {
        return fixedCode;
      }
      throw new Error('The AI service returned an empty fixed code response.');
    }
    throw new Error(response.data?.message || 'Failed to fix code');
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to fix code'));
  }
}

/**
 * Authentication APIs
 */

export async function registerUser(name, email, password) {
  try {
    const response = await API.post('/auth/register', { name, email, password });
    if (response.data && response.data.success) {
      localStorage.setItem('vericode_token', response.data.data.token);
      return response.data.data.user;
    }
    throw new Error(response.data?.message || 'Registration failed');
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Registration failed'));
  }
}

export async function loginUser(email, password) {
  try {
    const response = await API.post('/auth/login', { email, password });
    if (response.data && response.data.success) {
      localStorage.setItem('vericode_token', response.data.data.token);
      return response.data.data.user;
    }
    throw new Error(response.data?.message || 'Login failed');
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Login failed'));
  }
}

export async function logoutUser() {
  try {
    const response = await API.post('/auth/logout');
    localStorage.removeItem('vericode_token');
    return response.data;
  } catch (error) {
    localStorage.removeItem('vericode_token');
    throw new Error(getErrorMessage(error, 'Logout failed'));
  }
}

export async function getMe() {
  try {
    const response = await API.get('/auth/me');
    if (response.data && response.data.success) {
      return response.data.data.user;
    }
    throw new Error('Failed to load profile');
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load profile'));
  }
}

export async function updateProfile(userData) {
  try {
    const response = await API.put('/auth/profile', userData);
    if (response.data && response.data.success) {
      return response.data.data.user;
    }
    throw new Error(response.data?.message || 'Failed to update profile');
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to update profile'));
  }
}

/**
 * History APIs
 */

export async function getHistory(search = '', language = '') {
  try {
    let url = '/history';
    const params = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (language) params.push(`language=${encodeURIComponent(language)}`);

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    const response = await API.get(url);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Failed to fetch history');
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to fetch history'));
  }
}

export async function deleteHistory(id) {
  const response = await API.delete(`/history/${id}`);
  return response.data;
}

/**
 * Reports APIs
 */

export async function saveReport(reportData) {
  try {
    const response = await API.post('/report', reportData);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Failed to save report');
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to save report'));
  }
}

export async function getReports() {
  try {
    const response = await API.get('/report');
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Failed to fetch reports');
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to fetch reports'));
  }
}

export async function deleteReport(id) {
  const response = await API.delete(`/report/${id}`);
  return response.data;
}

/**
 * Dashboard APIs
 */

export async function getDashboard() {
  try {
    const response = await API.get('/dashboard');
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Failed to load dashboard stats');
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load dashboard stats'));
  }
}

/**
 * Documentation APIs
 */

export async function getAPIDocs() {
  try {
    const response = await API.get('/docs');
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Failed to load API docs');
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load API docs'));
  }
}

/**
 * Download Helper
 */
export async function downloadCodeFile(historyId) {
  const token = localStorage.getItem('vericode_token') || '';
  const downloadBase = import.meta.env.VITE_API_URL || '/api';
  const url = `${downloadBase}/download/${historyId}?token=${encodeURIComponent(token)}`;
  window.open(url, '_blank');
}
