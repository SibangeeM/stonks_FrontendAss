// state management within the component
import React, { useState } from 'react'; 
import { useRouter } from 'next/router'; // handle routing actions
import Dropzone from 'react-dropzone'; // for handling drag-and-drop file uploads
import imageCompression from 'browser-image-compression'; // to compress images

const Header = () => {
  const router = useRouter();
  const [userImage, setUserImage] = useState('https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/47.jpg'); //  initially set to a default image URL
  const [newImage, setNewImage] = useState(null); //  initially null, will hold the base64 URL of a newly uploaded and potentially compressed image
  const [uploadModalOpen, setUploadModalOpen] = useState(false); //  to toggle visibility of the image upload modal

// Handling Image Upload
// Takes the first file from the dropped files.
// Logs the original size of the file.
// Sets compression options like maximum size and dimensions.
// Compresses the image and reads it as a data URL using FileReader, then updates newImage with this data.

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    console.log('Original File size:', file.size / 1024 / 1024, 'MB');

    const options = {
      maxSizeMB: 0.55, // Maximum size (in MB)
      maxWidthOrHeight: 1920,
      useWebWorker: true
    };
    try {
      const compressedFile = await imageCompression(file, options);
      console.log('Compressed File size:', compressedFile.size / 1024 / 1024, 'MB');
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Error during image compression:', error);
    }
  };

//Saving and Cancelling Image
  const handleSaveImage = async () => {
    if (newImage) {
      setUserImage(newImage); // Save the new image as the user image
      setNewImage(null); // Clear the temporary new image
      setUploadModalOpen(false); // Close the modal

    }
  };

  const handleCancel = () => {
    setNewImage(null);
    setUploadModalOpen(false);
  };

  const handleTitleClick = () => {
    router.push('/');
  };

  return (
    <header className="bg-blue-600 text-white p-4 flex items-center justify-between relative">
      <div className="flex items-center">
        <h1 className="text-xl font-bold cursor-pointer" onClick={handleTitleClick}>Frontend Assignment</h1>
        <p>(Assume that the logged-in user is Dr. Edmond Kohler)</p>
      </div>
      <div className="flex items-center relative">
        <span className="mr-2">Dr. Edmond Kohler</span>
        <img src={newImage || userImage} alt="Dr. Edmond Kohler" className="h-10 w-10 rounded-full cursor-pointer" onClick={() => setUploadModalOpen(!uploadModalOpen)} />
        {uploadModalOpen && (
          <div className="absolute top-full right-0 mt-2 bg-white border border-gray-300 shadow-lg z-50 p-4 w-96">
            <Dropzone onDrop={onDrop}>
              {({ getRootProps, getInputProps }) => (
                <section>
                  <div {...getRootProps({ className: 'dropzone' })}>
                    <input {...getInputProps()} accept="image/*" />
                    <p className="text-gray-800 font-semibold">Click or drop a new profile image here</p>
                  </div>
                </section>
              )}
            </Dropzone>
            {newImage && (
              <div>
                <img src={newImage} alt="Preview" className="w-full mt-2" />
                <div className="flex justify-between mt-2">
                  <button onClick={() => handleSaveImage(newImage)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">Save Image</button>
                  <button onClick={handleCancel} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
