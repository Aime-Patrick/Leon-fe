import React from 'react'

interface CardProps {
    title: string;
    value?: string | number;
    icon?: React.ReactNode;
    description?: string;
    totalColor?: string;
    children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  value,
  icon,
  description,
  totalColor,
  children
}) => {
  return (
    <div className='bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100'>
      <div className='flex justify-between items-start'>
        <div className='space-y-2 w-full'>
          <h1 className='text-sm font-medium text-gray-500 uppercase tracking-wider'>{title}</h1>
          {/* Render value/description if value is provided, else render children */}
          {value !== undefined ? (
            <>
              <p className='text-3xl font-bold text-gray-800'>{value}</p>
              {description && (
                <div className='flex items-center space-x-2'>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${totalColor} bg-opacity-10`}>
                    {description}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="mt-2">{children}</div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${totalColor} bg-opacity-10`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
