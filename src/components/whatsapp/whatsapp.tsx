import React, { useState, useEffect } from "react";
import { useWhatsapp } from "../../hooks/useWhatsapp";
import { useSocket } from "../../context/SocketContext";
import { ChatUserCard } from "../chatCard/ChatUserCard";
import { format } from "date-fns";
import { IoSend } from "react-icons/io5";
import { CgSpinner } from "react-icons/cg";
import { IoArrowBack } from "react-icons/io5";

interface Message {
  _id: string;
  from: string;
  to?: string;
  type: "incoming" | "outgoing";
  message: string;
  timestamp: string;
}

export const WhatsAppConsole = () => {
  const {
    data = [],
    isLoading,
    error,
    getMessagesByPhoneNumber,
    sendMessage,
    sendMessageLoading,
    sendMessageSuccess,
  } = useWhatsapp() as {
    data: Message[];
    isLoading: boolean;
    error: any;
    getMessagesByPhoneNumber: (phone: string) => void;
    sendMessage: (message: { to: string; message: string }) => void;
    sendMessageLoading: boolean;
    sendMessageSuccess: boolean;
  };

  const { socket } = useSocket();
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<{ [phone: string]: number }>(
    {}
  );
  const [recentPhones, setRecentPhones] = useState<string[]>([]);

  // Add new state for mobile view
  const [showChatList, setShowChatList] = useState(true);

  // Set initial messages when a phone is selected or data changes
  useEffect(() => {
    if (selectedPhone && data) {
      const filtered = data.filter(
        (chat) => chat.from === selectedPhone || chat.to === selectedPhone
      );
      setMessages(filtered);
    }
  }, [selectedPhone, data]);

  // Listen to socket events for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg: Message) => {
      const phone = newMsg.from === "LeonHub" ? newMsg.to! : newMsg.from!;

      // Update recentPhones to move this number to the top
      setRecentPhones((prev) => {
        const updated = prev.filter((p) => p !== phone);
        return [phone, ...updated];
      });

      if (phone === selectedPhone) {
        setMessages((prev) => [...prev, newMsg]);
      } else {
        // Otherwise, increment unread count
        setUnreadCounts((prev) => ({
          ...prev,
          [phone!]: (prev[phone!] || 0) + 1,
        }));
      }
    };

    socket.on("new_message", handleNewMessage);
    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, selectedPhone]);

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim() || !selectedPhone) return;
    sendMessage({ to: selectedPhone, message });
    // Move selected chat to top
    setRecentPhones((prev) => {
      const updated = prev.filter((p) => p !== selectedPhone);
      return [selectedPhone, ...updated];
    });
  };

  useEffect(() => {
    if (sendMessageSuccess) {
      setMessage("");
    }
  }, [sendMessageSuccess]);

  // Modify handleSelectChat to handle mobile view
  const handleSelectChat = (phone: string) => {
    setSelectedPhone(phone);
    getMessagesByPhoneNumber(phone);
    setUnreadCounts((prev) => ({
      ...prev,
      [phone]: 0,
    }));
    // On mobile, switch to chat view
    if (window.innerWidth < 1024) {
      setShowChatList(false);
    }
  };

  // Add function to handle back button
  const handleBack = () => {
    setShowChatList(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        Error loading messages
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        No messages found
      </div>
    );
  }

  const uniquePhones = [
    ...new Set(
      data.map((chat) => (chat.from === "LeonHub" ? chat.to : chat.from))
    ),
  ].filter(Boolean) as string[];

  // Keep them in recent order, and add others below if any
  const sortedPhones = [
    ...recentPhones,
    ...uniquePhones.filter((p) => !recentPhones.includes(p)),
  ];

  const getLatestMessageForPhone = (phone: string) => {
    // Find messages where this phone is either sender or receiver
    const related = data.filter(
      (msg) => msg.from === phone || msg.to === phone
    );
    // Sort by timestamp descending and get the first (latest)
    return related.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-3">
      <div className="flex flex-col lg:flex-row gap-2 md:gap-4">
        {/* Chat List - Sidebar */}
        <div className={`w-full lg:w-1/4 h-[500px] md:h-[600px] lg:h-[700px] bg-gray-100 p-2 md:p-4 rounded ${
          !showChatList ? 'hidden lg:block' : ''
        }`}>
          <h1 className="text-sm font-semibold mb-4">Messages</h1>
          {/* List of recent chats */}
          <div className="flex flex-col gap-2 w-full">
            {sortedPhones.map((phone) => {
              const latestMsg = getLatestMessageForPhone(phone);
              return (
                <div
                  key={phone}
                  onClick={() => handleSelectChat(phone)}
                  className={`flex flex-col gap-2 cursor-pointer hover:bg-gray-200 transition-colors ${
                    selectedPhone === phone ? "bg-gray-200" : ""
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <ChatUserCard
                      phoneNumber={phone}
                      name={""}
                      message={latestMsg?.message || ""}
                      time={latestMsg?.timestamp || ""}
                      unreadCount={unreadCounts[phone] || 0}
                      selected={selectedPhone === phone}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={`w-full lg:w-3/4 h-[500px] md:h-[600px] lg:h-[700px] flex flex-col relative ${
          showChatList ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Mobile Header with Back Button */}
          <div className="lg:hidden flex items-center p-2 bg-gray-100 border-b">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <IoArrowBack className="w-6 h-6" />
            </button>
            <span className="ml-2 font-semibold">
              {selectedPhone || 'Select a chat'}
            </span>
          </div>

          <div className="flex-grow overflow-y-auto p-2 md:p-4 bg-gray-100">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`mb-2 flex ${
                  msg.type === "outgoing" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-end ${
                    msg.type === "outgoing" ? "flex-row-reverse" : ""
                  }`}
                >
                  <img
                    src={
                      msg.type === "incoming"
                        ? "https://avatar.iran.liara.run/public/32"
                        : "https://avatar.iran.liara.run/public/1"
                    }
                    alt="User"
                    className="w-6 h-6 md:w-8 md:h-8 rounded-full mx-1 md:mx-2"
                  />
                  <div
                    className={`p-2 rounded max-w-[80%] md:max-w-xs ${
                      msg.type === "outgoing" ? "bg-blue-600 text-gray-200" : "bg-blue-700 text-gray-200"
                    }`}
                  >
                    <div className="flex items-end gap-2">
                      <p className="text-xs md:text-sm break-words">{msg.message}</p>
                      <span className="text-[10px] md:text-xs text-gray-300 whitespace-nowrap">
                        {format(new Date(msg.timestamp), "hh:mm a")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {!selectedPhone && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-700/20 bg-opacity-90 z-10">
                <span className="text-base md:text-xl text-gray-400 font-semibold text-center px-4">
                  Select a chat to start messaging
                </span>
              </div>
            )}
          </div>
          {selectedPhone && (
            <form onSubmit={handleSendMessage} className="p-2 md:p-4 bg-white w-full">
              <div className="w-full flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-grow p-2 w-full rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-100 text-sm md:text-base"
                  placeholder="Type a message..."
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-700 text-white px-2 py-1 rounded hover:bg-blue-800 transition-colors"
                >
                  {sendMessageLoading ? (
                    <CgSpinner className="animate-spin w-5 h-5 md:w-6 md:h-6" />
                  ) : (
                    <IoSend className="w-5 h-5 md:w-6 md:h-6" />
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
