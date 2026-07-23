import React from 'react'

function WarningCom({data}) {
  return (
    <div className='warningCom flex justify-between item-center p-[15px] rounded-lg bg-[#13151B] mb-2'>
      <h3 className='text-[16px]'>{data.title}</h3>
      <div className='px-[20px] py-[3px] bg-[#34343D] rounded-lg'>
        <p>Line {data.line}</p>
      </div>
    </div>
  )
}

export default WarningCom
