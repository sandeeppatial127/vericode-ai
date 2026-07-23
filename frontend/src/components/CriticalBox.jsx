import React from 'react'
import * as FaIcons from "react-icons/fa";
function CriticalBox({data}) {
    let Icon=FaIcons[data.icon];
  return (
    <div className='flex items-start mb-2 criticalBox gap-10px p-[15px] rounded-lg bg-[#16181E]'>
      <i className='text-[20px]'>{Icon && <Icon/>}</i>
      <div>
        <h3 className='text-[15px] font-[700] mb-1'>{data.title}</h3>
        <p className='text-[14px]'>{data.description}</p>
      </div>
    </div>
  )
}

export default CriticalBox
