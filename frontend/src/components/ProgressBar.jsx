import React from 'react'

function ProgressBar({ name, score }) {
    const barColor = score < 50 ? '#F87171' : score < 75 ? '#F59E0B' : '#22C55E';
  return (
    <div className='p-[15px] rounded-lg progressbar w-full' style={{ borderLeft: `5px solid ${barColor}` }}>
      <div className="flex items-center justify-between">
        <p className='text-gray-400 text-[13px] font-[600]'>{name}</p>
        <p className='text-gray-400 text-[13px] font-[600]'>{score}/100</p>
      </div>
      <div className="progress">
        <div className="bg w-full h-[5px] rounded-[30px] mt-2 bg-[#1F1F2E] relative">
          <div
            style={{ width: `${score}%`, backgroundColor: barColor }}
            className="absolute left-0 top-0 score h-[5px] rounded-[30px]"
          ></div>
        </div>
      </div>
    </div>
  )
}

export default ProgressBar
