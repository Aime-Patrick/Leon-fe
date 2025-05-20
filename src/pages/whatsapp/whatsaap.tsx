import { useState, useEffect } from 'react';
import { WhatsAppConsole } from '../../components/whatsapp/whatsapp'
export const Whatsaap = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 overflow-hidden">
        <WhatsAppConsole />
      </div>
    </div>
  )
}
