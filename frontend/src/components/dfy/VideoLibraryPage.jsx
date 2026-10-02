// pages/VideoLibraryPage.jsx
import React from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import VideoLibrary from '../../components/dfy/VideoLibrary';

const VideoLibraryPage = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto">
          <VideoLibrary 
            apiKey={import.meta.env.VITE_PEXELS_API_KEY || 'YOUR_PEXELS_API_KEY'}
            defaultQuery="podcast"
            perPage={12}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoLibraryPage;
