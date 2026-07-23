import React from 'react'

function ScoreSquare({score}) {
    let size=120;
    let radius=12;
    let perimeter=4*(size-40);
    let progress=perimeter*(score/100);
  return (
    <div className='relative w-[120px] h-[120px]'>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className='-rotate-[-90deg]'>
        <rect
        x='10px'
        y='20px'
        width={size-40}
        height={size-40}
        rx={radius}
        fill='none'
        stroke='#1f1f2e'
        strokeWidth="10"/>
        {/* progress */}
        <rect
        x='10'
        y='20'
        width={size-40}
        height={size-40}
        rx={radius}
        fill='none'
        stroke='#6366F1'
        strokeWidth="10"
        strokeLinecap='round'
        pathLength={perimeter}
        strokeDasharray={perimeter}
        strokeDashoffset={perimeter - progress}
        />
      </svg>
        <div className='absolute inset-0 flex flex-col items-center justify-center'>
          <span className='flex items-center justify-center text-5xl font-bold text-indigo-500'>{score}</span>
          <span className='text-sm text-gray-400'>/100</span>
        </div>
    </div>
  )
}

export default ScoreSquare
