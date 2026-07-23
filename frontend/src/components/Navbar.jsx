import React from 'react'
import { IoSettings, IoLogOutOutline } from 'react-icons/io5'

function Navbar({ user, onOpenHistory, onOpenDocs, onOpenAccount, onCopyReport, onDownloadCode, onLogout }) {
  return (
    <div className='navbar'>
      <div className='logo'>
        <h3 className='text-[16px] font-[700] text-[var(--blue)]'>VERICODE AI</h3>
      </div>
      <div className='links'>
        <a href='#' onClick={(e) => { e.preventDefault(); onOpenHistory(); }}>History</a>
        <a href='#' onClick={(e) => { e.preventDefault(); onOpenDocs(); }}>Documentation</a>
        <a href='#' onClick={(e) => { e.preventDefault(); onOpenAccount(); }}>{user ? 'Account' : 'Login / Register'}</a>
      </div>
      <div className='right flex items-center gap-[15px]'>
        <button className="trans" onClick={onCopyReport}>Copy Report</button>
        <button className="blue-btn" onClick={onDownloadCode}>Download Code</button>
        {user && (
          <div className="flex items-center gap-[10px] pl-[10px] border-l border-gray-800">
            <img 
              src={user.avatar} 
              alt="avatar" 
              className="w-[28px] h-[28px] rounded-full border border-blue-500/40 bg-gray-900"
            />
            <span className="text-sm font-[600] text-gray-300 hidden md:inline">{user.name}</span>
            <button 
              className="text-red-400 hover:text-red-300 text-[18px] transition-colors ml-[5px]" 
              onClick={onLogout}
              title="Logout"
            >
              <IoLogOutOutline />
            </button>
          </div>
        )}
        
      </div>
    </div>
  )
}

export default Navbar
