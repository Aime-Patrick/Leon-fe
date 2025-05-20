import React from 'react'

interface CardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    description?: string;
    totalColor?: string;
}
export const Card: React.FC<CardProps> = ({ title, value, icon, description, totalColor }) => {
  return (
    <div className='w-80 h-40 bg-white p-3 flex justify-between px-4 rounded-lg shadow-md'>
        <div className='flex flex-col justify-between'>
            <h1 className='text-lg font-bold text-gray-500'>{title}</h1>
            <p className='text-black font-bold text-2xl'>{value}</p>
            <div className='flex mt-2 items-center'>
                <span className={`p-1 bg-gray-200 rounded  font-semibold ${totalColor}`}>Total</span>
                <span className='text-gray-600'>{description}</span>
            </div>
        </div>
        <div className='flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full'>
            {icon}
        </div>
    </div>
  )
}
