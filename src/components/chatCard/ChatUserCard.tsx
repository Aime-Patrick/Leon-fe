import React from "react";
import { formatDistanceToNow, isYesterday, format } from "date-fns";
interface ChatUserCardProps {
  name?: string;
  phoneNumber?: string;
  message: string;
  time: string;
  unreadCount: number;
  selected?: boolean; // Add this line
}

const truncatedMessage = (message: string) => {
  if (message.length > 20) {
    return message.slice(0, 20) + "...";
  }
  return message;
}

const getTimeLabel = (time: string) => {
  const date = new Date(time);
  if (isYesterday(date)) {
    return "Yesterday";
  }
  const diff = Date.now() - date.getTime();
  if (diff < 1000 * 60 * 60 * 24) {
    // less than 24 hours
    return formatDistanceToNow(date, { addSuffix: true });
  }
  // else show date
  return format(date, "MMM d, yyyy");
};


export const ChatUserCard:React.FC<ChatUserCardProps> = ({
  name, phoneNumber, message, time, unreadCount, selected
}) => {
  return (
    <div
      className={`w-full bg-gray-50 p-3 flex justify-between border-2 rounded-lg transition-colors duration-200 ${
        selected ? "border-blue-700" : "border-transparent"
      }`}
    >
      <div className="flex items-center gap-2">
        <img
          src="https://avatar.iran.liara.run/public/32"
          alt="User"
          className="w-8 h-8 rounded-full"
        />
        <div className="flex flex-col">
          <h1 className="text-[12px] font-semibold text-gray-500">{name || phoneNumber}</h1>
          <p className="text-gray-600 whitespace-nowrap">{truncatedMessage(message)}</p>
        </div>
      </div>
      <div className="mt-2 flex flex-col items-end gap-0.5">
        <p className="text-gray-400 text-[10px] whitespace-nowrap">
          {getTimeLabel(time)}
        </p>
       { unreadCount !== 0 && <span className="bg-gray-500 text-white text-xs rounded-full px-1 py-0.5">
          {unreadCount}
        </span>}
      </div>
    </div>
  );
};
