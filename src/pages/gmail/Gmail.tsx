import { useState, useEffect } from 'react';
import { FaPaperPlane, FaInbox, FaStar, FaTrash, FaEnvelope, FaSearch } from 'react-icons/fa';
import axiosInstance from '../../utils/axios';
import { useGmail } from '../../hooks/useGmail';
import type { Email, ComposeEmail, EmailFolder } from '../../api/gmail.api';

const Gmail = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isComposing, setIsComposing] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentFolder, setCurrentFolder] = useState<EmailFolder>('inbox');
    const [composeEmail, setComposeEmail] = useState<ComposeEmail>({
        to: '',
        subject: '',
        body: ''
    });

    const { useEmails, useEmailDetails, useSendEmail, useToggleStar, useMoveToTrash } = useGmail();
    const { data: emails = [], isLoading: isLoadingEmails, error: emailsError } = useEmails(currentFolder, isAuthenticated);
    const { data: emailDetails, isLoading: isLoadingEmailDetails } = useEmailDetails(selectedEmail?.id);
    const sendEmailMutation = useSendEmail();
    const toggleStarMutation = useToggleStar();
    const moveToTrashMutation = useMoveToTrash();

    useEffect(() => {
        const token = localStorage.getItem('gmail_access_token');
        setIsAuthenticated(!!token);
    }, []);

    const handleAuth = async () => {
        try {
            const response = await axiosInstance.get('/api/auth/google');
            window.location.href = response.data.authUrl;
        } catch (error) {
            console.error('Error initiating auth:', error);
        }
    };

    const handleSendEmail = () => {
        sendEmailMutation.mutate(composeEmail, {
            onSuccess: () => {
                setIsComposing(false);
                setComposeEmail({ to: '', subject: '', body: '' });
            }
        });
    };

    const handleToggleStar = (email: Email, e: React.MouseEvent) => {
        e.stopPropagation();
        toggleStarMutation.mutate({ messageId: email.id, isStarred: !email.isStarred });
    };

    const handleMoveToTrash = (email: Email, e: React.MouseEvent) => {
        e.stopPropagation();
        moveToTrashMutation.mutate(email.id);
    };

    const filteredEmails = emails.filter((email: Email) => 
        email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.snippet.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-bold text-gray-900">
                            Connect Your Gmail Account
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            To use Gmail features, you need to connect your account first.
                        </p>
                    </div>
                    <button
                        onClick={handleAuth}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Connect Gmail
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
                        onClick={() => setCurrentFolder('inbox')}
                        className={`w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                            currentFolder === 'inbox' ? 'bg-gray-100' : ''
                        }`}
                    >
                        <FaInbox className="mr-3" />
                        Inbox
                    </button>
                    <button
                        onClick={() => setCurrentFolder('starred')}
                        className={`w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                            currentFolder === 'starred' ? 'bg-gray-100' : ''
                        }`}
                    >
                        <FaStar className="mr-3" />
                        Starred
                    </button>
                    <button
                        onClick={() => setCurrentFolder('sent')}
                        className={`w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                            currentFolder === 'sent' ? 'bg-gray-100' : ''
                        }`}
                    >
                        <FaEnvelope className="mr-3" />
                        Sent
                    </button>
                    <button
                        onClick={() => setCurrentFolder('trash')}
                        className={`w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                            currentFolder === 'trash' ? 'bg-gray-100' : ''
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
                                className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                                    !email.isRead ? 'font-semibold' : ''
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={(e) => handleToggleStar(email, e)}
                                                className={`text-gray-400 hover:text-yellow-400 ${
                                                    email.isStarred ? 'text-yellow-400' : ''
                                                }`}
                                            >
                                                <FaStar />
                                            </button>
                                            <p className="text-sm text-gray-600">{email.from}</p>
                                        </div>
                                        <p className="text-sm">{email.subject}</p>
                                        <p className="text-sm text-gray-500 truncate">{email.snippet}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-gray-400">{email.date}</span>
                                        {currentFolder !== 'trash' && (
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg w-full max-w-2xl p-6">
                        <h2 className="text-xl font-semibold mb-4">New Message</h2>
                        <div className="space-y-4">
                            <input
                                type="email"
                                placeholder="To"
                                value={composeEmail.to}
                                onChange={(e) => setComposeEmail({ ...composeEmail, to: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                            <input
                                type="text"
                                placeholder="Subject"
                                value={composeEmail.subject}
                                onChange={(e) => setComposeEmail({ ...composeEmail, subject: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                            <textarea
                                placeholder="Message"
                                value={composeEmail.body}
                                onChange={(e) => setComposeEmail({ ...composeEmail, body: e.target.value })}
                                className="w-full p-2 border rounded h-64"
                            />
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => setIsComposing(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                    disabled={sendEmailMutation.isPending}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendEmail}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                    disabled={sendEmailMutation.isPending}
                                >
                                    {sendEmailMutation.isPending ? 'Sending...' : 'Send'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Email View Modal */}
            {selectedEmail && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg w-full max-w-4xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-semibold">{selectedEmail.subject}</h2>
                            <button
                                onClick={() => setSelectedEmail(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>
                        <div className="border-b pb-4 mb-4">
                            <p className="text-sm text-gray-600">From: {selectedEmail.from}</p>
                            <p className="text-sm text-gray-500">{selectedEmail.date}</p>
                        </div>
                        <div className="prose max-w-none">
                            {isLoadingEmailDetails ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                </div>
                            ) : (
                                <p>{emailDetails?.body || selectedEmail.snippet}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gmail; 