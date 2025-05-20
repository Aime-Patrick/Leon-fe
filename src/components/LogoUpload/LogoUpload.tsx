import React, { useState, useRef } from 'react';
import { FaUpload, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axios';

interface LogoUploadProps {
    currentLogo?: string;
    onLogoUpdate: (logoUrl: string) => void;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ currentLogo, onLogoUpdate }) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('File size should be less than 2MB');
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('logo', file);

            const response = await axiosInstance.post('/api/setup/upload-logo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            onLogoUpdate(response.data.logoUrl);
            toast.success('Logo uploaded successfully');
        } catch (error) {
            console.error('Error uploading logo:', error);
            toast.error('Failed to upload logo');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            {currentLogo && (
                <div className="w-32 h-32 relative">
                    <img
                        src={currentLogo}
                        alt="Current logo"
                        className="w-full h-full object-contain rounded-lg"
                    />
                </div>
            )}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
            <button
                type="button"
                onClick={handleButtonClick}
                disabled={isUploading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isUploading ? (
                    <FaSpinner className="animate-spin" />
                ) : (
                    <FaUpload />
                )}
                <span>{isUploading ? 'Uploading...' : 'Choose Logo'}</span>
            </button>
            <p className="text-sm text-gray-500">
                Recommended: Square image, max 2MB
            </p>
        </div>
    );
};

export default LogoUpload; 