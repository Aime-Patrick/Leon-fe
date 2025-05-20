import React from 'react'
import { Card } from '../../components/Card/Card'
import { FaHotel } from "react-icons/fa";
import { CustomDataTable } from '../../components/DataTable/DataTable'
export const Dashboard:React.FC = () => {
  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold text-gray-700'>Dashboard</h1>
      <div className='mt-4 flex gap-10'>
        <div className=' grid grid-cols-2 gap-5'>
        <Card title='Total Users' value='100' description='Users' icon={<FaHotel className='text-blue-800'/>} totalColor='text-blue-800'/>
        <Card title='Total Bookings' value='50' description='Bookings' icon={<FaHotel className='text-blue-800'/>} totalColor='text-blue-800'/>
        <Card title='Total Messages' value='200' description='Messages' icon={<FaHotel className='text-blue-800'/>} totalColor='text-blue-800'/>
        <Card title='Total Appointments' value='30' description='Appointments' icon={<FaHotel className='text-blue-800'/>} totalColor='text-blue-800'/>
      </div>
      <div>
        <CustomDataTable 
            data={[
            { name: 'Jane Doe', email: 'jane@example' },
            { name: 'Sam Smith', email: 'sam@example' },
            { name: 'Alice Johnson', email: 'alice@example' },
            { name: 'Bob Brown', email: 'bob@example' }
            , { name: 'Charlie Black', email: 'charlie@example' },
            ]} columns={[
              { field: 'name', header: 'Name' },
              { field: 'email', header: 'Email' },
            ]} />
            </div>
      </div>
    </div>
  )
}
