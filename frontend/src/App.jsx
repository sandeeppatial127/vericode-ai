import React, { useState, useEffect } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import ScoreSquare from './components/ScoreSquare'
import ProgressBar from './components/ProgressBar'
import CriticalBox from './components/CriticalBox'
import WarningCom from './components/WarningCom'
import SecurityAudit from './components/SecurityAudit'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

// Icons
import { RiMagicFill } from 'react-icons/ri'
import { Editor } from '@monaco-editor/react'
import { GoCodeReview } from 'react-icons/go'
import { AiOutlineFileSearch } from 'react-icons/ai'
import { BsStars } from 'react-icons/bs'
import { IoCheckmarkDoneCircleOutline, IoEye } from 'react-icons/io5'
import { RxCross2 } from 'react-icons/rx'
import { FaCode, FaRegLightbulb, FaSearch, FaTrash, FaDownload, FaHistory, FaBook, FaUserAlt } from 'react-icons/fa'

// Utils & Custom Imports
import { 
  main, explain, fix, 
  registerUser, loginUser, logoutUser, getMe, updateProfile as updateProfileAPI,
  getHistory as getHistoryAPI, deleteHistory as deleteHistoryAPI, 
  getDashboard, getAPIDocs, downloadCodeFile 
} from './AI'
import { ClipLoader } from 'react-spinners'
import MarkdownPreview from '@uiw/react-markdown-preview'

function App() {
  const [isNoContent, setIsNoContent] = useState(true);
  const [screen, setScreen] = useState("noscreen"); // "noscreen" | "analyze" | "explain"
  const [language, setLanguage] = useState("JavaScript");
  const [code, setCode] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState(""); // "analyze" | "fix" | "explain"
  const [explainData, setExplainData] = useState("");

  // Authentication State
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  // Navigation Modals State
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [docsModalOpen, setDocsModalOpen] = useState(false);

  // History & Dashboard Data States
  const [historyList, setHistoryList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [langFilter, setLangFilter] = useState("");
  const [dashboardStats, setDashboardStats] = useState(null);
  const [apiDocs, setApiDocs] = useState(null);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const override = {
    display: "inline-block",
    margin: "0 auto",
    verticalAlign: "middle"
  };

  const spinnerColor = "#ffffff";

  // Check user authentication status on load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('vericode_token');
        if (token) {
          const profile = await getMe();
          setUser(profile);
          setProfileForm({ name: profile.name, email: profile.email });
        }
      } catch (error) {
        console.warn("User session expired or token invalid.");
        localStorage.removeItem('vericode_token');
      }
    };
    fetchUser();
  }, []);

  // Fetch History list dynamically when search, filters, or modal state changes
  useEffect(() => {
    if (historyModalOpen && user) {
      const loadHistory = async () => {
        try {
          const list = await getHistoryAPI(searchQuery, langFilter);
          setHistoryList(list);
        } catch (error) {
          console.error("Error loading history:", error.message);
        }
      };
      // Simple debounce
      const timer = setTimeout(loadHistory, 300);
      return () => clearTimeout(timer);
    }
  }, [historyModalOpen, searchQuery, langFilter, user]);

  // Fetch Dashboard Stats when Account page opens
  useEffect(() => {
    if (accountModalOpen && user) {
      const loadStats = async () => {
        try {
          const stats = await getDashboard();
          setDashboardStats(stats);
        } catch (error) {
          console.error("Error loading dashboard stats:", error.message);
        }
      };
      loadStats();
    }
  }, [accountModalOpen, user]);

  // Fetch API documentation when Docs modal opens
  useEffect(() => {
    if (docsModalOpen) {
      const loadDocs = async () => {
        try {
          const docs = await getAPIDocs();
          setApiDocs(docs);
        } catch (error) {
          console.error("Error loading docs:", error.message);
        }
      };
      loadDocs();
    }
  }, [docsModalOpen]);

  // Monaco requires strict lowercase string keys for specific languages
  const getMonacoLanguage = (lang) => {
    const lower = lang.toLowerCase();
    if (lower === 'react' || lower === 'vue.js' || lower === 'angular') return 'javascript';
    if (lower === 'shell script') return 'shell';
    if (lower === 'tailwind css') return 'css';
    return lower;
  };

  /**
   * Operations
   */

  const explain_data = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code to explain!");
      return;
    }
    if (!user) {
      toast.info("Please login or register to use AI explanations.");
      setAuthModalOpen(true);
      return;
    }
    try {
      setLoading(true);
      setCurrentAction("explain");
      
      const res = await explain(code, language);
      
      setExplainData(res);
      setIsNoContent(false);
      setScreen("explain");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong while explaining the code.");
    } finally {
      setLoading(false);
      setCurrentAction("");
    }
  };

  const get_response = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code to analyze!");
      return;
    }
    if (!user) {
      toast.info("Please login or register to analyze code.");
      setAuthModalOpen(true);
      return;
    }
    try {
      setLoading(true);
      setCurrentAction("analyze");

      const res = await main(code, language);
      const parsedData = typeof res === "string" ? JSON.parse(res) : res;

      setData(parsedData);
      setIsNoContent(false);
      setScreen("analyze");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to analyze code. Make sure AI response is valid JSON.");
    } finally {
      setLoading(false);
      setCurrentAction("");
    }
  };

  const fixCode = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code to fix.");
      return;
    }
    if (!user) {
      toast.info("Please login or register to fix code.");
      setAuthModalOpen(true);
      return;
    }
    try {
      setLoading(true);
      setCurrentAction("fix");

      const res = await fix(code, language);
      setCode(res);
      toast.success("Code optimized and fixed successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong while attempting to fix the code.");
    } finally {
      setLoading(false);
      setCurrentAction("");
    }
  };

  /**
   * Navbar Buttons Actions
   */

  const handleCopyReport = () => {
    if (!data) {
      toast.warning("No code analysis active. Run an analysis first to copy the report!");
      return;
    }
    try {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      toast.success("Analysis report JSON copied to clipboard!");
    } catch (err) {
      toast.error("Could not copy report.");
    }
  };

  const handleDownloadCode = () => {
    const cachedId = localStorage.getItem('last_history_id');
    if (cachedId && user) {
      downloadCodeFile(cachedId);
      toast.success("Starting code download stream...");
    } else {
      if (!code.trim()) {
        toast.warning("Editor is empty. Type some code first!");
        return;
      }
      // Fallback: local blob download
      const extensions = {
        'HTML': 'html', 'CSS': 'css', 'JavaScript': 'js', 'TypeScript': 'ts',
        'Python': 'py', 'Java': 'java', 'C': 'c', 'C++': 'cpp', 'C#': 'cs',
        'PHP': 'php', 'Ruby': 'rb', 'Go': 'go', 'Rust': 'rs', 'SQL': 'sql',
        'JSON': 'json', 'YAML': 'yaml', 'Markdown': 'md'
      };
      const ext = extensions[language] || 'txt';
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vericode_code.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Downloading code draft locally.");
    }
  };

  /**
   * Auth actions
   */
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      let loggedUser;
      if (isLoginView) {
        loggedUser = await loginUser(authForm.email, authForm.password);
        toast.success(`Welcome back, ${loggedUser.name}!`);
      } else {
        loggedUser = await registerUser(authForm.name, authForm.email, authForm.password);
        toast.success(`Account created successfully! Welcome, ${loggedUser.name}!`);
      }
      setUser(loggedUser);
      setProfileForm({ name: loggedUser.name, email: loggedUser.email });
      setAuthModalOpen(false);
      setAuthForm({ name: '', email: '', password: '' });
    } catch (error) {
      toast.error(error.message || 'Authentication failed. Please check inputs.');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      localStorage.removeItem('last_history_id');
      toast.success("Logged out successfully.");
      setAccountModalOpen(false);
      setHistoryModalOpen(false);
      setScreen("noscreen");
      setIsNoContent(true);
      setCode("");
      setData(null);
    } catch (error) {
      toast.error("Logout failed.");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateProfileAPI(profileForm);
      setUser(updated);
      setIsEditingProfile(false);
      toast.success("Profile details updated.");
    } catch (error) {
      toast.error(error.message || "Failed to update profile.");
    }
  };

  /**
   * History selection
   */
  const handleLoadHistoryItem = async (item) => {
    try {
      setCode(item.originalCode);
      setLanguage(item.language);
      
      if (item.analysis) {
        setData(item.analysis);
        setScreen("analyze");
      } else if (item.explanation) {
        setExplainData(item.explanation);
        setScreen("explain");
      } else if (item.fixedCode) {
        setCode(item.fixedCode);
        setScreen("noscreen");
        setIsNoContent(true);
      }
      
      setIsNoContent(false);
      setHistoryModalOpen(false);
      localStorage.setItem('last_history_id', item._id);
      toast.success(`Loaded history item from ${new Date(item.createdAt).toLocaleDateString()}`);
    } catch (error) {
      toast.error("Failed to load history item.");
    }
  };

  const handleDeleteHistoryItem = async (e, id) => {
    e.stopPropagation(); // prevent loading item
    try {
      await deleteHistoryAPI(id);
      setHistoryList(historyList.filter(item => item._id !== id));
      toast.success("History item deleted.");
    } catch (error) {
      toast.error("Failed to delete history record.");
    }
  };

  function handleEditorWillMount(monaco) {
    monaco.editor.defineTheme("codeReviewTheme", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "8B7CFF" },
        { token: "entity.name.function", foreground: "2EE6A6", fontStyle: "bold" },
        { token: "identifier", foreground: "E6E6F0" },
        { token: "string", foreground: "FF9E7A" },
        { token: "number", foreground: "FFB86B" },
        { token: "comment", foreground: "808080", fontStyle: "italic" },
        { token: "type.identifier", foreground: "F6C177" },
        { token: "delimiter", foreground: "CFCFE6" },
      ],
      colors: {
        "editor.background": "#09090F",
        "editor.foreground": "#E6E6F0",
        "editorCursor.foreground": "#8B7CFF",
        "editor.lineHighlightBackground": "#11111A",
        "editor.selectionBackground": "#7C6BFF22",
        "editorLineNumber.foreground": "#4A4A5C",
        "editorLineNumber.activeForeground": "#8B7CFF",
        "editorGutter.background": "#09090F",
        "editorIndentGuide.background": "#1A1A26",
        "minimap.background": "#09090F",
        "editorSuggestWidget.background": "#11111A",
        "editorSuggestWidget.border": "#1F1F2E",
        "editorSuggestWidget.selectedBackground": "#1A1A26",
        "scrollbarSlider.background": "#1A1A26",
        "scrollbarSlider.hoverBackground": "#2A2A3D",
        "editorBracketMatch.background": "#1A1A26",
        "editorBracketMatch.border": "#8B7CFF",
        "editorGroup.border": "#1A1A26",
      },
    });
  }

  return (
    <>
      <Navbar 
        user={user} 
        onOpenHistory={() => {
          if (!user) {
            toast.info("Please login to view history.");
            setAuthModalOpen(true);
          } else {
            setHistoryModalOpen(true);
          }
        }}
        onOpenDocs={() => setDocsModalOpen(true)}
        onOpenAccount={() => {
          if (!user) {
            setAuthModalOpen(true);
          } else {
            setAccountModalOpen(true);
          }
        }}
        onCopyReport={handleCopyReport}
        onDownloadCode={handleDownloadCode}
        onLogout={handleLogout}
      />
      <div className="container flex h-[calc(100vh-4rem)] w-full overflow-hidden">
        
        {/* Left Pane - Code Input */}
        <div className='left w-[50%] h-full flex flex-col border-r border-gray-600 bg-[#09090F]'>
          <div className="left-header flex items-center justify-between h-[4rem] px-4 border-b border-gray-600">
            <div>
              <select 
                onChange={(e) => setLanguage(e.target.value)} 
                value={language} 
                className='language-selector bg-[#11111A] text-white p-2 rounded border border-gray-600 outline-none'
              >
                <option value="HTML">HTML</option>
                <option value="CSS">CSS</option>
                <option value="JavaScript">JavaScript</option>
                <option value="TypeScript">TypeScript</option>
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="C">C</option>
                <option value="C++">C++</option>
                <option value="C#">C#</option>
                <option value="PHP">PHP</option>
                <option value="Ruby">Ruby</option>
                <option value="Go">Go</option>
                <option value="Rust">Rust</option>
                <option value="Swift">Swift</option>
                <option value="Kotlin">Kotlin</option>
                <option value="Dart">Dart</option>
                <option value="R">R</option>
                <option value="Perl">Perl</option>
                <option value="Scala">Scala</option>
                <option value="Shell Script">Shell Script</option>
                <option value="SQL">SQL</option>
                <option value="MongoDB">MongoDB</option>
                <option value="MySQL">MySQL</option>
                <option value="PostgreSQL">PostgreSQL</option>
                <option value="React">React</option>
                <option value="Vue.js">Vue.js</option>
                <option value="Angular">Angular</option>
                <option value="Node.js">Node.js</option>
                <option value="Express.js">Express.js</option>
                <option value="Django">Django</option>
                <option value="Flask">Flask</option>
                <option value="Laravel">Laravel</option>
                <option value="Bootstrap">Bootstrap</option>
                <option value="Tailwind CSS">Tailwind CSS</option>
                <option value="JSON">JSON</option>
                <option value="XML">XML</option>
                <option value="YAML">YAML</option>
                <option value="Markdown">Markdown</option>
              </select>
            </div>
            <div>
              <button 
                disabled={loading} 
                onClick={get_response} 
                className="blue-btn flex items-center gap-[10px] bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded transitioning"
              >
                {loading && currentAction === "analyze" ? (
                  <ClipLoader color={spinnerColor} loading={loading} cssOverride={override} size={15} />
                ) : (
                  <RiMagicFill />
                )}
                Analyze Code
              </button>
            </div>
          </div>
          
          <div className="flex-1 w-full code-editor">
            <Editor 
              onChange={(val) => setCode(val || "")} 
              value={code} 
              height="100%" 
              language={getMonacoLanguage(language)} 
              beforeMount={handleEditorWillMount} 
              theme='codeReviewTheme' 
            />
          </div>
          
          <div className="buttons flex items-center w-full gap-[10px] px-[10px] py-[10px] border-t border-gray-600 bg-[#09090F]">
            <button 
              disabled={loading}
              className="trans flex items-center gap-[10px] w-full justify-center p-[10px] border border-gray-600 rounded text-white hover:bg-gray-800 disabled:opacity-50" 
              onClick={fixCode}
            >
              {loading && currentAction === "fix" && (
                <ClipLoader color={spinnerColor} loading={loading} cssOverride={override} size={15} />
              )}
              Fix Code
            </button>
            <button 
              disabled={loading}
              className="trans flex items-center gap-[10px] w-full justify-center p-[10px] border border-gray-600 rounded text-white hover:bg-gray-800 disabled:opacity-50" 
              onClick={explain_data}
            >
              {loading && currentAction === "explain" && (
                <ClipLoader color={spinnerColor} loading={loading} cssOverride={override} size={15} />
              )}
              Explain Code
            </button>
          </div>
        </div>

        {/* Right Pane - Visual Diagnostics Dashboard */}
        <div className='right w-[50%] h-full overflow-auto bg-[#0b0c16] text-white'>
          {isNoContent && (
            <div className="flex flex-col items-center justify-center w-full h-full gap-3 opacity-60">
              <i className='text-[60px]  text-white rounded-xl p-3'><FaCode /></i>
              <p className='text-xl font-[600] text-white'>Fix, Analyze or ask for code explanations.</p>
            </div>
          )}
          
          {screen === "analyze" && data && (
            <div className="w-full h-full overflow-auto p-[20px] space-y-6" >
              <div className="flex items-center justify-start gap-[20px] bg-[#17192C]/30 p-4 rounded-xl border border-gray-800">
                <ScoreSquare score={data.overallScore} />
                <div>
                  <h3 className='text-[28px] font-[700] m-0 p-0 leading-tight'>Overall Score</h3>
                  <p className='mt-1 text-sm text-gray-400'>Analysis engine checked against standard layout patterns.</p>
                </div>
              </div>

              {data.scoreBreakdown && (
                <div className="grid items-center grid-cols-1 gap-4 mt-6 md:grid-cols-2">
                  {data.scoreBreakdown.map((item, index) => (
                    <ProgressBar key={index} name={item.name} score={item.score} />
                  ))}
                </div>
              )}

              {data.summary && (
                <div className="summary p-[15px] bg-[#17192C] rounded-lg border border-blue-900/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[10px]">
                      <i className='text-[25px] text-blue-400'><AiOutlineFileSearch /></i>
                      <h3 className='text-[20px] font-[700] text-blue-400'>Summary</h3>
                    </div>
                    <i className='text-[20px] text-purple-400'><BsStars /></i>
                  </div>
                  <p className='mt-2 text-sm leading-relaxed text-gray-300'>{data.summary}</p>
                </div>
              )}

              {data.critical && data.critical.length > 0 && (
                <div className="space-y-2 critical_con">
                  <p className='font-[700] text-red-400 text-xs tracking-wider uppercase'>Critical Issues</p>
                  {data.critical.map((item, index) => (
                    <CriticalBox key={index} data={{ title: item?.title, description: item?.description, icon: item?.icon }} />
                  ))}
                </div>
              )}

              {data.warnings && data.warnings.length > 0 && (
                <div className="space-y-2 warning_con">
                  <p className="font-[700] text-amber-300 text-xs tracking-wider uppercase">Warnings</p>
                  {data.warnings.map((item, index) => (
                    <WarningCom key={index} data={{ title: item?.title, line: item?.line }} />
                  ))}
                </div>
              )}

              {data.securityAudit && data.securityAudit.metrics && data.securityAudit.metrics.length > 0 && (
                <div className="space-y-2 security_audit">
                  <p className='font-[700] text-gray-400 text-xs tracking-wider uppercase'>Security Audit Metrics</p>
                  <div className='flex flex-wrap gap-[15px]'>
                    {data.securityAudit.metrics.map((item, index) => (
                      <SecurityAudit key={index} data={{ name: item?.name, value: item?.value }} />
                    ))}
                  </div>
                </div>
              )}

              {data.complianceStandards && data.complianceStandards.length > 0 && (
                <div className="space-y-3 Complaince_Standards">
                  <p className="font-[700] text-gray-400 text-xs tracking-wider uppercase">Compliance & Vulnerability Standards</p>
                  <div className="bg-[#101019] p-4 rounded-lg space-y-3">
                    {data.complianceStandards.map((item, index) => (
                      <div key={index} className="flex items-center gap-[15px]">
                        {item.check === "yes" ? (
                          <IoCheckmarkDoneCircleOutline className="text-green-400 text-[22px]" />
                        ) : (
                          <RxCross2 className="text-red-400 text-[20px]" />
                        )}
                        <p className="font-[600] text-sm text-gray-200">{item.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.proTip && (
                <div className='protip p-[15px] bg-[#101019] border border-gray-800 rounded-lg'>
                  <div className='flex items-center gap-[10px] text-blue-400 mb-2'>
                    <i className='text-[17px]'><FaRegLightbulb /></i>
                    <p className='font-[700] text-[14px] tracking-wider uppercase'>Pro Tip</p>
                  </div>
                  <p className='text-[14px] text-gray-400 leading-relaxed'>{data.proTip}</p>
                </div>
              )}
            </div>
          )}

          {screen === "explain" && (
            <div className="explanation-panel w-full h-full overflow-auto p-[20px] bg-[#09090F]" data-color-mode="dark">
              <div className="explanation-heading">
                <span className="explanation-kicker">AI CODE EXPLANATION</span>
                <h2>Understand how your code works</h2>
                <p>Detailed guidance based on the code in the editor.</p>
              </div>
              <MarkdownPreview
                className="explanation-preview"
                source={explainData || 'No explanation was returned. Please try again.'}
                style={{ backgroundColor: 'transparent' }}
              />
            </div>
          )}
        </div>

      </div>

      {/* ===================================================
          MODALS INTEGRATION
          =================================================== */}

      {/* 1. Auth Modal (Register / Login) */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b0c16] border border-gray-800 rounded-2xl w-[420px] max-w-full overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setAuthModalOpen(false)} 
              className="absolute p-2 text-gray-400 transition-colors rounded-full top-4 right-4 hover:text-white hover:bg-white/5"
            >
              <RxCross2 size={18} />
            </button>
            <div className="p-6">
              <div className="mb-6 text-center">
                <h3 className="text-[24px] font-[700] text-white tracking-wide">
                  {isLoginView ? 'Welcome Back' : 'Create Account'}
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  {isLoginView ? 'Sign in to review and save code analysis' : 'Join VeriCode AI '}
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {!isLoginView && (
                  <div>
                    <label className="block text-xs font-[600] text-gray-400 uppercase tracking-wider mb-2">Name</label>
                    <input 
                      type="text" 
                      required
                      minLength={2}
                      maxLength={50}
                      value={authForm.name} 
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      placeholder="John Doe" 
                      className="w-full bg-[#101019] text-white p-3 rounded-lg border border-gray-800 focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-[600] text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={authForm.email} 
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    placeholder="john@example.com" 
                    className="w-full bg-[#101019] text-white p-3 rounded-lg border border-gray-800 focus:border-blue-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-[600] text-gray-400 uppercase tracking-wider mb-2">Password</label>
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={authForm.password} 
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    placeholder="••••••••" 
                    className="w-full bg-[#101019] text-white p-3 rounded-lg border border-gray-800 focus:border-blue-500 outline-none transition-colors"
                  />
                  {!isLoginView && (
                    <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-[700] p-3 rounded-lg mt-6 transition-colors shadow-lg shadow-blue-600/25"
                >
                  {isLoginView ? 'Sign In' : 'Sign Up'}
                </button>
              </form>

              <div className="pt-4 mt-6 text-center border-t border-gray-900">
                <button 
                  onClick={() => setIsLoginView(!isLoginView)} 
                  className="text-sm text-blue-400 hover:text-blue-300 font-[500]"
                >
                  {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. History Modal */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#0b0c16] border border-gray-800 rounded-2xl w-[640px] max-w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setHistoryModalOpen(false)} 
              className="absolute p-2 text-gray-400 transition-colors rounded-full top-4 right-4 hover:text-white hover:bg-white/5"
            >
              <RxCross2 size={18} />
            </button>
            <div className="p-6 border-b border-gray-900">
              <div className="flex items-center gap-[10px] text-blue-400 mb-2">
                <FaHistory size={20} />
                <h3 className="text-[22px] font-[700] text-white">Analysis History</h3>
              </div>
              <p className="text-sm text-gray-400">Search and load previous code sessions.</p>
            </div>

            {/* Filter bar */}
            <div className="p-4 bg-[#101019] flex gap-3 border-b border-gray-900">
              <div className="relative flex-1">
                <FaSearch className="absolute text-gray-500 -translate-y-1/2 left-3 top-1/2" size={14} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search code contents..."
                  className="w-full bg-[#0b0c16] text-white pl-9 pr-4 py-2 rounded-lg border border-gray-800 outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <select
                value={langFilter}
                onChange={(e) => setLangFilter(e.target.value)}
                className="bg-[#0b0c16] text-white px-3 py-2 rounded-lg border border-gray-800 outline-none text-sm"
              >
                <option value="">All Languages</option>
                <option value="JavaScript">JavaScript</option>
                <option value="TypeScript">TypeScript</option>
                <option value="Python">Python</option>
                <option value="HTML">HTML</option>
                <option value="CSS">CSS</option>
                <option value="SQL">SQL</option>
              </select>
            </div>

            <div className="flex-1 p-4 space-y-3 overflow-auto">
              {historyList.length === 0 ? (
                <div className="py-10 text-sm text-center text-gray-500">
                  No history logs found. Perform some code reviews to start!
                </div>
              ) : (
                historyList.map((item) => (
                  <div 
                    key={item._id}
                    onClick={() => handleLoadHistoryItem(item)}
                    className="p-4 rounded-xl border border-gray-800 bg-[#0f1020]/40 hover:bg-[#121326] cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex-1 pr-4 space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-600/10 text-blue-400 text-xs px-2 py-0.5 rounded font-[600] border border-blue-500/10">
                          {item.language}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-sm font-semibold text-gray-200 line-clamp-1 opacity-80">
                        {item.originalCode.trim().substring(0, 80)}
                      </p>
                      <div className="flex gap-4 mt-2">
                        {item.analysis && <span className="text-[11px] text-green-400 font-medium">✓ Analysis Saved</span>}
                        {item.explanation && <span className="text-[11px] text-purple-400 font-medium">✓ Explanation Saved</span>}
                        {item.fixedCode && <span className="text-[11px] text-amber-400 font-medium">✓ Corrected Code Saved</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadCodeFile(item._id);
                        }}
                        className="p-2 text-gray-400 transition-colors rounded hover:text-white hover:bg-white/5"
                        title="Download Code"
                      >
                        <FaDownload size={14} />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteHistoryItem(e, item._id)}
                        className="p-2 text-red-400 transition-colors rounded hover:text-red-300 hover:bg-white/5"
                        title="Delete record"
                      >
                        <FaTrash size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Account / Dashboard Modal */}
      {accountModalOpen && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#0b0c16] border border-gray-800 rounded-2xl w-[680px] max-w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative text-white">
            <button 
              onClick={() => {
                setAccountModalOpen(false);
                setIsEditingProfile(false);
              }} 
              className="absolute p-2 text-gray-400 transition-colors rounded-full top-4 right-4 hover:text-white hover:bg-white/5"
            >
              <RxCross2 size={18} />
            </button>
            
            <div className="p-6 border-b border-gray-900 bg-[#101019]">
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <img 
                  src={user.avatar} 
                  alt="avatar" 
                  className="w-[60px] h-[60px] rounded-full border border-blue-500/40 bg-gray-900 shadow-lg shadow-blue-500/10"
                />
                <div className="flex-1 text-center sm:text-left">
                  {!isEditingProfile ? (
                    <>
                      <h3 className="text-[22px] font-[700] tracking-wide">{user.name}</h3>
                      <p className="text-sm text-gray-400">{user.email}</p>
                      <button 
                        onClick={() => setIsEditingProfile(true)}
                        className="mt-2 text-xs font-semibold text-blue-400 hover:text-blue-300"
                      >
                        Edit Profile
                      </button>
                    </>
                  ) : (
                    <form onSubmit={handleUpdateProfile} className="mt-2 space-y-2">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          required
                          value={profileForm.name} 
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="bg-[#0b0c16] text-white px-2 py-1 rounded text-sm border border-gray-800"
                        />
                        <input 
                          type="email" 
                          required
                          value={profileForm.email} 
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="bg-[#0b0c16] text-white px-2 py-1 rounded text-sm border border-gray-800"
                        />
                      </div>
                      <div className="flex justify-center gap-2 sm:justify-start">
                        <button type="submit" className="text-xs font-semibold text-green-400 hover:text-green-300">Save</button>
                        <button type="button" onClick={() => setIsEditingProfile(false)} className="text-xs text-gray-400 hover:text-gray-300">Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 space-y-6 overflow-auto">
              {/* Dashboard stats cards */}
              <div>
                <h4 className="text-xs font-[700] text-gray-400 uppercase tracking-wider mb-3">Dashboard</h4>
                {dashboardStats ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="p-4 rounded-xl border border-gray-850 bg-[#101019] text-center">
                      <p className="text-[26px] font-[800] text-blue-400 leading-tight">{dashboardStats.totalAnalyses}</p>
                      <p className="text-[11px] text-gray-400 uppercase font-[600] tracking-wider mt-1">Analyses</p>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-850 bg-[#101019] text-center">
                      <p className="text-[26px] font-[800] text-amber-400 leading-tight">{dashboardStats.totalFixes}</p>
                      <p className="text-[11px] text-gray-400 uppercase font-[600] tracking-wider mt-1">Optimizations</p>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-850 bg-[#101019] text-center">
                      <p className="text-[26px] font-[800] text-purple-400 leading-tight">{dashboardStats.totalExplanations}</p>
                      <p className="text-[11px] text-gray-400 uppercase font-[600] tracking-wider mt-1">Explanations</p>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-850 bg-[#101019] text-center">
                      <p className="text-[18px] font-[800] text-green-400 leading-[26px] line-clamp-1">{dashboardStats.favoriteLanguage}</p>
                      <p className="text-[11px] text-gray-400 uppercase font-[600] tracking-wider mt-1">Fav Language</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-xs text-center text-gray-500">Loading statistics...</div>
                )}
              </div>

              {/* Recent activity log */}
              <div>
                <h4 className="text-xs font-[700] text-gray-400 uppercase tracking-wider mb-3">Recent Activity</h4>
                <div className="space-y-2">
                  {!dashboardStats || dashboardStats.recentActivity.length === 0 ? (
                    <div className="py-4 text-sm text-center text-gray-500">No activity recorded yet.</div>
                  ) : (
                    dashboardStats.recentActivity.map((activity) => (
                      <div 
                        key={activity.id}
                        onClick={async () => {
                          try {
                            const fullItem = await getHistoryAPI('', '');
                            const match = fullItem.find(i => i._id === activity.id);
                            if (match) {
                              handleLoadHistoryItem(match);
                              setAccountModalOpen(false);
                            }
                          } catch (e) {
                            toast.error("Could not fetch details.");
                          }
                        }}
                        className="p-3 bg-[#0f1020]/45 hover:bg-[#121326] border border-gray-900 rounded-lg flex justify-between items-center text-sm cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            activity.type === 'fix' ? 'bg-amber-400' :
                            activity.type === 'explanation' ? 'bg-purple-400' : 'bg-blue-400'
                          }`} />
                          <span className="font-semibold uppercase text-xs tracking-wider text-gray-400 w-[80px]">
                            {activity.type}
                          </span>
                          <span className="font-semibold text-gray-200">{activity.language}</span>
                          <span className="text-gray-500 truncate max-w-[200px] font-mono hidden sm:inline ml-2">{activity.snippet}</span>
                        </div>
                        <span className="text-xs text-gray-500">{new Date(activity.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-900 flex justify-end bg-[#09090f]">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-400 transition-colors border rounded-lg bg-red-900/10 border-red-500/20 hover:bg-red-900/30"
              >
                Logout Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. API Documentation Modal */}
      {docsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#0b0c16] border border-gray-800 rounded-2xl w-[720px] max-w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative text-white">
            <button 
              onClick={() => setDocsModalOpen(false)} 
              className="absolute p-2 text-gray-400 transition-colors rounded-full top-4 right-4 hover:text-white hover:bg-white/5"
            >
              <RxCross2 size={18} />
            </button>
            <div className="p-6 border-b border-gray-900">
              <div className="flex items-center gap-[10px] text-blue-400 mb-2">
                <FaBook size={20} />
                <h3 className="text-[22px] font-[700] text-white">Backend API Specifications</h3>
              </div>
              <p className="text-sm text-gray-400">Read the Swagger-styled JSON API configurations generated dynamically from the backend.</p>
            </div>

            <div className="flex-1 p-6 space-y-6 overflow-auto">
              {!apiDocs ? (
                <div className="py-10 text-sm text-center text-gray-500">Loading documentation...</div>
              ) : (
                apiDocs.endpoints.map((cat, idx) => (
                  <div key={idx} className="space-y-3">
                    <h4 className="text-sm font-[700] text-blue-400 uppercase tracking-wider border-b border-gray-900 pb-1">
                      {cat.category}
                    </h4>
                    <div className="space-y-4">
                      {cat.routes.map((route, rIdx) => (
                        <div key={rIdx} className="p-4 rounded-xl border border-gray-950 bg-[#101019]/60 space-y-2">
                          <div className="flex items-center gap-3">
                            <span className={`text-[11px] font-[800] px-2 py-1 rounded tracking-wide ${
                              route.method === 'POST' ? 'bg-green-600/10 text-green-400 border border-green-500/10' :
                              route.method === 'PUT' ? 'bg-amber-600/10 text-amber-400 border border-amber-500/10' :
                              route.method === 'DELETE' ? 'bg-red-600/10 text-red-400 border border-red-500/10' :
                              'bg-blue-600/10 text-blue-400 border border-blue-500/10'
                            }`}>
                              {route.method}
                            </span>
                            <span className="font-mono text-sm font-semibold text-gray-200">{route.path}</span>
                            <span className="text-[11px] text-gray-500 ml-auto">Auth: {route.auth}</span>
                          </div>
                          
                          <p className="text-xs text-gray-300">{route.description}</p>
                          
                          {route.body && (
                            <div className="mt-2">
                              <span className="text-[10px] text-gray-500 uppercase font-bold">Request Body JSON:</span>
                              <pre className="bg-[#0b0c16] text-[11px] text-gray-400 p-2 rounded border border-gray-900 mt-1 font-mono overflow-auto max-h-[100px]">
                                {JSON.stringify(route.body, null, 2)}
                              </pre>
                            </div>
                          )}

                          {route.response && (
                            <div className="mt-2">
                              <span className="text-[10px] text-gray-500 uppercase font-bold">Response JSON Shape:</span>
                              <pre className="bg-[#0b0c16] text-[11px] text-gray-400 p-2 rounded border border-gray-900 mt-1 font-mono overflow-auto max-h-[100px]">
                                {JSON.stringify(route.response, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App