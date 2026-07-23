import React from 'react'

function SecurityAudit({data}) {
  return (
    <div className='security_audit_comp p-[15px] bg-[#12121B] rounded-lg w-full'>
      <p className='text-gray-400 text-[13px]'>{data.name}</p>
      <h3 className='text-[20px] font-[700]'>{data.value}</h3>
    </div>
  )
}

export default SecurityAudit
