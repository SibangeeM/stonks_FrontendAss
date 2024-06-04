import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Dropzone from 'react-dropzone';

const Header = () => {
    const router = useRouter();
    const [userImage, setUserImage] = useState('https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/47.jpg');
    const [newImage, setNewImage] = useState(null);  // To hold the new image temporarily
    const [uploadModalOpen, setUploadModalOpen] = useState(false);

    const onDrop = (acceptedFiles) => {
        const reader = new FileReader();
        reader.onload = () => {
            setNewImage(reader.result);  // Load new image for preview
        };
        reader.readAsDataURL(acceptedFiles[0]);
    };

    const handleSaveImage = () => {
        if (newImage) {
            setUserImage(newImage);  // Save the new image as the user image
            setNewImage(null);       // Clear the temporary new image
            setUploadModalOpen(false);  // Close the modal
        }
    };

    const handleCancel = () => {
        setNewImage(null);  // Clear the temporary new image
        setUploadModalOpen(false);  // Close the modal
    };

    const handleTitleClick = () => {
        router.push('/');  // Navigate to the index page
    };

    return (
        <header className="bg-blue-600 text-white p-4 flex items-center justify-between relative">
            <div className="flex items-center">
                <h1 className="text-xl font-bold cursor-pointer" onClick={handleTitleClick}>
                    Frontend Assignment
                </h1>
                <p>(Assume that the logged-in user is Dr. Edmond Kohler) </p>
            </div>
            <div className="flex items-center relative">
                <span className="mr-2">Dr. Edmond Kohler</span>
                <img 
                    src={newImage || userImage}  // Display new image if available, otherwise current user image
                    alt="Dr. Edmond Kohler" 
                    className="h-10 w-10 rounded-full cursor-pointer"
                    onClick={() => setUploadModalOpen(!uploadModalOpen)}
                />
                {uploadModalOpen && (
                    <div className="absolute top-full right-0 mt-2 bg-white border border-gray-300 shadow-lg z-50 p-4 w-96">
                        <Dropzone onDrop={onDrop}>
                            {({getRootProps, getInputProps}) => (
                                <div {...getRootProps()} className="cursor-pointer p-2 text-center border-dashed border-2 border-gray-400">
                                    <input {...getInputProps()} accept="image/jpeg,image/png,image/svg+xml" />
                                    <p className="text-gray-800 font-semibold">Click or drop a new profile image here</p>
                                </div>
                            )}
                        </Dropzone>
                        {newImage && (
                            <div className="flex justify-between mt-2">
                                <button onClick={handleSaveImage} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
                                    Save Image
                                </button>
                                <button onClick={handleCancel} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700">
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
