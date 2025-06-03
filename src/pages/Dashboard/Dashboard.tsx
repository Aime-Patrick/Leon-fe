import React from 'react'
import { Card } from '../../components/Card/Card'
import { FaWhatsapp } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { CustomDataTable } from '../../components/DataTable/DataTable'
import { userGmailStats } from '../../hooks/gmailStats';
import { useWhatsappStats } from '../../hooks/useWhatsappNumber';

export const Dashboard: React.FC = () => {
  const { data, isLoading, error } = userGmailStats();
  const { whatsappStats, whatsappStatsError, whatsappStatsLoading } = useWhatsappStats();

  // Show loading spinner if either is loading
  if (isLoading || whatsappStatsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If either has error, show error in a Card and stop rendering
  if (error || whatsappStatsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Card
            title="Dashboard Error"
            description="There was a problem loading your dashboard data."
            icon={<span className="text-red-500 text-2xl">!</span>}
            totalColor="text-red-500"
          >
            {error && (
              <div className="text-red-600 mb-2">
                Gmail Error: {(error as any)?.response?.data?.error || error.message || "Failed to load Gmail stats"}
                {((error as any)?.response?.status === 401) && (
                  <div className="text-sm text-gray-500 mt-1">You may need to re-authenticate your Gmail integration.</div>
                )}
              </div>
            )}
            {whatsappStatsError && (
              <div className="text-red-600">
                WhatsApp Error: {(whatsappStatsError as any)?.response?.data?.message || whatsappStatsError.message || "Failed to load WhatsApp stats"}
                {((whatsappStatsError as any)?.response?.status === 401) && (
                  <div className="text-sm text-gray-500 mt-1">You may need to re-authenticate your WhatsApp integration.</div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // If either data is missing, show error and stop rendering
  if (!data || !whatsappStats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-600">Failed to load dashboard data.</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-gray-900'>Dashboard</h1>
          <p className='mt-1 text-sm text-gray-500'>Overview of your communication channels</p>
        </div>

        {/* Stats Section */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
          <Card 
            title='WhatsApp Users' 
            value={whatsappStats.totalUsers || 0} 
            description='Active Users' 
            icon={<FaWhatsapp className='text-green-500 text-2xl'/>} 
            totalColor='text-green-500'
          />
          <Card 
            title='Gmail Inbox' 
            value={data?.data?.totalEmails || 0} 
            description='Total Emails' 
            icon={<MdEmail className='text-red-500 text-2xl'/>} 
            totalColor='text-red-500'
          />
        </div>

        {/* Recent Activity Section */}
        <div className='bg-white rounded-xl shadow-lg border border-gray-100'>
          <div className='px-6 py-4 border-b border-gray-100'>
            <h2 className='text-lg font-semibold text-gray-900'>Recent Activity</h2>
            <p className='text-sm text-gray-500'>Latest communications and interactions</p>
          </div>
          <div className='p-6'>
            <div className='overflow-x-auto'>
              <CustomDataTable 
                data={[
                  { name: 'Jane Doe', email: 'jane@example' },
                  { name: 'Sam Smith', email: 'sam@example' },
                  { name: 'Alice Johnson', email: 'alice@example' },
                  { name: 'Bob Brown', email: 'bob@example' },
                  { name: 'Charlie Black', email: 'charlie@example' },
                ]} 
                columns={[
                  { field: 'name', header: 'Name' },
                  { field: 'email', header: 'Email' },
                ]} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
