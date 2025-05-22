import { useState, useEffect, useMemo } from "react";
import {
  FaPaperPlane,
  FaInbox,
  FaStar,
  FaTrash,
  FaEnvelope,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaImage,
  FaReply,
  FaUser,
  FaCalendarAlt,
  FaPaperclip,
} from "react-icons/fa";
import axiosInstance from "../../utils/axios";
import { useGmail } from "../../hooks/useGmail";
import type { Email, EmailFolder } from "../../types/gmail";
import type { ComposeEmail } from "../../types/gmail";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

interface ErrorResponse {
  error: string;
  details?: string;
}

interface MessageCardProps {
  content: string;
  isQuoted?: boolean;
  headerLine?: string;
}

const MessageCard: React.FC<MessageCardProps> = ({
  content,
  isQuoted = false,
}) => {

  const formatMessageContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Clean up HTML entities
      const cleanLine = line
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');

      if (cleanLine.startsWith('>')) {
        return (
          <div key={index} className="pl-4 border-l-2 border-gray-200 text-gray-500 text-sm">
            {cleanLine.substring(1)}
          </div>
        );
      }
      return <div key={index}>{cleanLine}</div>;
    });
  };

  return (
    <div className={`${isQuoted ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="p-4">
        {/* Message Content */}
        <div className="mt-3">
          <div className="prose max-w-none">
            {formatMessageContent(content)}
          </div>
        </div>
      </div>
    </div>
  );
};

const Gmail = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFolder, setCurrentFolder] = useState<EmailFolder>("inbox");
  const [composeEmail, setComposeEmail] = useState<ComposeEmail>({
    to: [""],
    subject: "",
    body: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageToken, setPageToken] = useState<string | undefined>();
  const ITEMS_PER_PAGE = 10;
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const {
    useEmails,
    useEmailDetails,
    useSendEmail,
    useToggleStar,
    useMoveToTrash,
  } = useGmail();
  const {
    data: emailsData = { emails: [], pagination: {} },
    isLoading: isLoadingEmails,
    error: emailsError,
  } = useEmails(currentFolder, isAuthenticated, ITEMS_PER_PAGE, pageToken);
  const { data: emailDetails, isLoading: isLoadingEmailDetails } =
    useEmailDetails(selectedEmail?.id);
  const sendEmailMutation = useSendEmail();
  const toggleStarMutation = useToggleStar();
  const moveToTrashMutation = useMoveToTrash();
  const handleAuth = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/api/auth/gmail/auth");

      if (!response.data.authUrl) {
        throw new Error("No auth URL received from server");
      }

      // Store current URL to return to after auth
      localStorage.setItem("gmail_redirect_url", window.location.href);

      // Redirect to Google auth page
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error("Error initiating auth:", error);
      toast.error("Failed to connect to Gmail. Please try again.");
      setIsLoading(false);
    }
  };

  // Check Gmail authentication status on mount
  useEffect(() => {
    const checkGmailAuth = async () => {
      try {
        // Verify token is still valid
        const response = await axiosInstance.get("/api/auth/gmail/verify");
        setIsAuthenticated(response.data.success);
      } catch (error) {
        console.error("Invalid Gmail token:", error);
        localStorage.removeItem("gmail_access_token");
        setIsAuthenticated(false);
        toast.error("Gmail session expired. Please reconnect your account.");
      }
    };

    checkGmailAuth();
  }, []);

  const handleToChange = (value: string) => {
    // Split by comma and trim whitespace
    const recipients = value.split(",").map((email) => email.trim());
    setComposeEmail((prev) => ({
      ...prev,
      to: recipients,
    }));
  };

  const handleSendEmail = async () => {
    try {
      // Filter out empty strings from the recipients array
      const validRecipients = Array.isArray(composeEmail.to)
        ? composeEmail.to.filter((email) => email.trim() !== "")
        : [composeEmail.to.trim()];
      if (validRecipients.length === 0) {
        toast.error("Please enter at least one recipient");
        return;
      }

      await sendEmailMutation.mutateAsync({
        ...composeEmail,
        to: validRecipients,
      });

      toast.success("Email sent successfully");
      setIsComposing(false);
      setComposeEmail({
        to: [""],
        subject: "",
        body: "",
      });
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.details || axiosError.response?.data?.error;
      if (errorMessage === "Invalid Credentials") {
        localStorage.removeItem("gmail_access_token");
        setIsAuthenticated(false);
      } else {
        toast.error("Failed to send email");
      }
    }
  };

  const handleToggleStar = (email: Email, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStarMutation.mutate({
      messageId: email.id,
      isStarred: !email.isStarred,
    });
  };

  const handleMoveToTrash = (email: Email, e: React.MouseEvent) => {
    e.stopPropagation();
    moveToTrashMutation.mutate(email.id);
  };

  const handleNextPage = () => {
    if (emailsData.pagination.nextPageToken) {
      setPageToken(emailsData.pagination.nextPageToken);
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      // Note: Gmail API doesn't support going back directly
      // We'll need to refetch from the beginning
      setPageToken(undefined);
    }
  };

  // Reset pagination when folder changes
  useEffect(() => {
    setCurrentPage(1);
    setPageToken(undefined);
  }, [currentFolder]);

  const filteredEmails = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return emailsData.emails.filter(
      (e: Email) =>
        e.subject.toLowerCase().includes(q) ||
        e.from.toLowerCase().includes(q) ||
        e.snippet.toLowerCase().includes(q)
    );
  }, [emailsData.emails, searchQuery]);

  const handleReply = async () => {
    if (!selectedEmail || !replyContent.trim()) return;

    try {
      await sendEmailMutation.mutateAsync({
        to: [selectedEmail.from],
        subject: `Re: ${selectedEmail.subject}`,
        body: replyContent
      });

      toast.success('Reply sent successfully');
      setIsReplying(false);
      setReplyContent('');
      setSelectedEmail(null);
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const formatEmailContent = (content: string) => {
    if (!content) return null;

    // First, let's log the content to see what we're working with
    console.log('Original content:', content);

    // Split by "On ... wrote:" pattern
    const parts = content.split(/(On .*? wrote:)/);
    console.log('Split parts:', parts);

    // Process each part
    const messages: Array<{ content: string; header: string }> = [];
    let currentMessage = '';
    let currentHeader = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]?.trim() || '';
      
      if (part.startsWith('On ') && part.includes('wrote:')) {
        // This is a header
        if (currentMessage) {
          messages.push({
            content: currentMessage.trim(),
            header: currentHeader
          });
        }
        currentHeader = part;
        currentMessage = '';
      } else if (part) {
        // This is content
        currentMessage = part;
      }
    }

    // Add the last message if there is one
    if (currentMessage) {
      messages.push({
        content: currentMessage.trim(),
        header: currentHeader
      });
    }

    console.log('Processed messages:', messages);

    return messages.map((message, index) => {
      // Clean up the content
      const cleanContent = message.content
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .trim();

      // Clean up the header
      const cleanHeader = message.header
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .trim();

      return (
        <div key={index} className="mb-4">
          <MessageCard
            content={cleanContent}
            isQuoted={index > 0}
            headerLine={cleanHeader}
          />
        </div>
      );
    });
  };

  if (!isAuthenticated) {
    let isTokenExpired = false;
    if (emailsError && (emailsError as AxiosError).isAxiosError) {
      const err = emailsError as AxiosError<ErrorResponse>;
      const msg = err.response?.data?.details || err.response?.data?.error;
      isTokenExpired = msg === "Invalid Credentials";
    }

    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center flex flex-col justify-center items-center w-full">
          <h2 className="text-2xl font-bold mb-4">Connect to Gmail</h2>
          <p className="text-gray-600 mb-6">
            {isTokenExpired
              ? "Your Gmail connection has expired. Please reconnect to continue."
              : "To use Gmail features, you need to connect your Gmail account."}
          </p>
          <button
            onClick={handleAuth}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md flex items-center"
          >
            {isLoading ? (
              "Processing..."
            ) : (
              <span>
                <FaEnvelope className="mr-2" />
                {isTokenExpired ? "Reconnect Gmail" : "Connect Gmail"}
              </span>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Gmail Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <button
            onClick={() => setIsComposing(true)}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
          >
            <FaPaperPlane />
            <span>Compose</span>
          </button>
        </div>
        <nav className="mt-4">
          <button
            onClick={() => setCurrentFolder("inbox")}
            className={`w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 ${
              currentFolder === "inbox" ? "bg-gray-100" : ""
            }`}
          >
            <FaInbox className="mr-3" />
            Inbox
          </button>
          <button
            onClick={() => setCurrentFolder("starred")}
            className={`w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 ${
              currentFolder === "starred" ? "bg-gray-100" : ""
            }`}
          >
            <FaStar className="mr-3" />
            Starred
          </button>
          <button
            onClick={() => setCurrentFolder("sent")}
            className={`w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 ${
              currentFolder === "sent" ? "bg-gray-100" : ""
            }`}
          >
            <FaEnvelope className="mr-3" />
            Sent
          </button>
          <button
            onClick={() => setCurrentFolder("trash")}
            className={`w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 ${
              currentFolder === "trash" ? "bg-gray-100" : ""
            }`}
          >
            <FaTrash className="mr-3" />
            Trash
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="px-4 py-2 border-b flex items-center justify-between bg-white">
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-full ${
                currentPage === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaChevronLeft />
            </button>
            <span className="text-sm font-medium">
              Page {currentPage}
            </span>
            <button
              onClick={handleNextPage}
              disabled={!emailsData.pagination.nextPageToken}
              className={`p-2 rounded-full ${
                !emailsData.pagination.nextPageToken
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaChevronRight />
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {emailsData.pagination.resultSizeEstimate 
              ? `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, emailsData.pagination.resultSizeEstimate)} of ${emailsData.pagination.resultSizeEstimate}`
              : 'Loading...'}
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingEmails ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : emailsError ? (
            <div className="flex items-center justify-center h-full text-red-600">
              Error loading emails
            </div>
          ) : (
            filteredEmails.map((email: Email) => (
              <div
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                  !email.isRead 
                    ? 'bg-blue-50 hover:bg-blue-100' 
                    : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => handleToggleStar(email, e)}
                        className={`text-gray-400 hover:text-yellow-400 ${
                          email.isStarred ? "text-yellow-400" : ""
                        }`}
                      >
                        <FaStar />
                      </button>
                      <p className={`text-sm ${!email.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                        {email.from}
                      </p>
                      {email.images && email.images.length > 0 && (
                        <FaImage className="text-gray-400 text-sm" />
                      )}
                    </div>
                    <p className={`text-sm ${!email.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {email.subject}
                    </p>
                    <p className={`text-sm ${!email.isRead ? 'text-gray-600' : 'text-gray-500'} truncate`}>
                      {email.snippet}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">{email.date}</span>
                    {currentFolder !== "trash" && (
                      <button
                        onClick={(e) => handleMoveToTrash(email, e)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Compose Email Modal */}
      {isComposing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
            <h3 className="text-lg font-semibold mb-4">New Email</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                To
              </label>
              <input
                type="text"
                value={
                  Array.isArray(composeEmail.to)
                    ? composeEmail.to.join(", ")
                    : composeEmail.to
                }
                onChange={(e) => handleToChange(e.target.value)}
                placeholder="Separate multiple emails with commas"
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <input
                type="text"
                value={composeEmail.subject}
                onChange={(e) =>
                  setComposeEmail({ ...composeEmail, subject: e.target.value })
                }
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Body
              </label>
              <textarea
                rows={6}
                value={composeEmail.body}
                onChange={(e) =>
                  setComposeEmail({ ...composeEmail, body: e.target.value })
                }
                className="w-full mt-1 p-2 border rounded resize-none"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsComposing(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Detail Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Email Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">{selectedEmail.subject}</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsReplying(true)}
                    className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    title="Reply"
                  >
                    <FaReply />
                  </button>
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <FaUser />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{selectedEmail.from}</p>
                      <p className="text-sm text-gray-500">to me</p>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FaCalendarAlt className="mr-2" />
                      {new Date(selectedEmail.date).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingEmailDetails ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {formatEmailContent(emailDetails?.body || selectedEmail.snippet)}
                  
                  {/* Attachments */}
                  {Array.isArray(emailDetails?.images) && emailDetails.images.length > 0 && (
                    <div className="mt-8">
                      <div className="flex items-center text-gray-600 mb-4">
                        <FaPaperclip className="mr-2" />
                        <span className="font-medium">Attachments ({emailDetails.images.length})</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {emailDetails.images.map((imageUrl: string, index: number) => (
                          <div key={index} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`Attachment ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg flex items-center justify-center">
                              <button
                                onClick={() => window.open(imageUrl, '_blank')}
                                className="opacity-0 group-hover:opacity-100 bg-white p-2 rounded-full shadow-lg transition-opacity"
                              >
                                <FaImage className="text-gray-600" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Reply Form */}
            {isReplying && (
              <div className="border-t p-6 bg-gray-50">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reply to {selectedEmail.from}
                  </label>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Type your reply..."
                    className="w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none shadow-sm"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setIsReplying(false);
                      setReplyContent('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={!replyContent.trim()}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                      !replyContent.trim()
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <FaPaperPlane className="text-sm" />
                    <span>Send Reply</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Gmail;
