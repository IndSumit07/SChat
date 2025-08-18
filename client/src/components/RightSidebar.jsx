import React, { useContext, useEffect, useState } from 'react'
import assets from '../../public/assets'
import api from "../lib/api.js";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from 'react-router-dom';

const RightSidebar = ({ selectedUser }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };
  const [media, setMedia] = useState([]);

  useEffect(() => {
    (async () => {
      if (!selectedUser?._id) return;
      try {
        const res = await api.get(`/messages/${selectedUser._id}`);
        if (res.data?.success) {
          const imgs = (res.data.messages || []).filter(m => m.image).map(m => m.image);
          setMedia(imgs);
        }
      } catch (e) {
        setMedia([]);
      }
    })();
  }, [selectedUser?._id]);

  return selectedUser && (
    <div className={`bg-gray-900/40 text-white w-full relative overflow-y-scroll ${selectedUser ? "max-md:hidden" : ""} `}>
      <div className='pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto'>
        <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className='w-20 aspect-[1/1] rounded-full ' />

        <h1 className='px-10 text-xl font-medium mx-auto flex items-center gap-2 '>
          <p className='w-2 h-2 rounded-full bg-green-500 '></p>
          {selectedUser.fullname}</h1>
        <p className='px-10 mx-auto'>{selectedUser.bio}</p>
      </div>
      <hr className='border-gray-700 my-4' />
      <div className='px-5 text-xs'>
        <p>Media</p>
        {media.length === 0 ? (
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