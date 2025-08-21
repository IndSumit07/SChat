import React, { useEffect, useState, useContext } from 'react'
import assets from '../../public/assets'
import api from "../lib/api.js";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const RightSidebar = ({ selectedUser }) => {
  const { logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleLogout = () => { logout(); toast.success("Logged out successfully"); navigate('/login'); };
  const [media, setMedia] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  useEffect(() => {
    if (!selectedUser?._id || !isAuthenticated) return;
    (async () => {
      try {
        setLoadingMedia(true);
        const res = await api.get(`/messages/${selectedUser._id}`);
        if (res.data?.success) {
          const imgs = (res.data.messages || []).filter(m => m.image).map(m => m.image);
          setMedia(imgs);
        }
      } catch (e) {
        toast.error("Failed to load media");
        setMedia([]);
      } finally {
        setLoadingMedia(false);
      }
    })();
  }, [selectedUser?._id, isAuthenticated]);

  return selectedUser && (
    <div className={`bg-gray-900/40 text-white w-full relative overflow-y-scroll ${selectedUser ? "max-md:hidden" : ""} `}>
      {/* profile details */}
      <div className='p-5 border-b border-gray-700'>
        <div className='flex flex-col items-center gap-3'>
          <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className='w-16 h-16 rounded-full' />
          <h3 className='text-lg font-semibold'>{selectedUser?.fullname}</h3>
          <p className='text-sm text-gray-400 text-center'>{selectedUser?.bio || "No bio available"}</p>
        </div>
      </div>

      {/* media section */}
      <div className='px-5 text-xs'>
        <p>Media</p>
        {loadingMedia ? (
          <div className="flex items-center justify-center py-4">
            <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : media.length === 0 ? (
          <p className='text-gray-400 mt-2'>No media shared yet</p>
        ) : (
          <div className='mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80 '>
            {media.map((url, index) => (
              <div key={index} onClick={() => window.open(url)} className='cursor-pointer rounded' >
                <img src={url} alt="" className='h-full rounded-md' />
              </div>
            ))}
          </div>
        )}
      </div>
      <button onClick={handleLogout} className='absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer'>Logout</button>
    </div>
  )
}

export default RightSidebar