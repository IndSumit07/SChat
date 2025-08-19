import React, { useContext, useEffect, useState } from 'react'
import assets from '../../public/assets'
import { useNavigate } from "react-router-dom"
import api from "../lib/api.js";
import { AuthContext } from "../context/AuthContext.jsx";
import toast from 'react-hot-toast';

const Sidebar = ({ selectedUser, setSelectedUser }) => {

  const navigate = useNavigate();
  const { logout, onlineUsers } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [unseen, setUnseen] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate('/login');
  }

  useEffect(() => {
    (async () => {
      try {
        setLoadingUsers(true);
        const res = await api.get("/messages/users");
        if (res.data?.success) {
          setUsers(res.data.users || []);
          setUnseen(res.data.unseenMessages || {});
        }
      } catch (e) {
        toast.error("Failed to load users");
      } finally {
        setLoadingUsers(false);
      }
    })();
  }, []);
  return (
    <div className={`bg-gray-900/40 h-full p-3 sm:p-5 rounded-r-xl overflow-y-scroll text-white ${selectedUser ? "max-md:hidden" : ""}`}>
      <div className='pb-4 sm:pb-5'>
        <div className='flex justify-between items-center'>
          <h1 className='text-xl sm:text-2xl font-bold'>SChat</h1>
          <div className='relative py-2 group'>
            <img src={assets.menu_icon} alt="Menu" className='max-h-4 sm:max-h-5 cursor-pointer' />
            <div className='absolute top-full right-0 z-20 w-28 sm:w-32 p-3 sm:p-5 rounded-md bg-gray-900 border border-gray-700 text-gray-100 hidden group-hover:block text-xs sm:text-sm'>
              <p onClick={() => {
                navigate("/profile")
              }} className='cursor-pointer'>Edit Profile</p>
              <hr className='my-2 border-t border-gray-500' />
              <p onClick={handleLogout} className='cursor-pointer'>Logout</p>
            </div>
          </div>
        </div>
        <div className='bg-gray-800/60 rounded-full flex items-center gap-2 py-2 sm:py-3 px-3 sm:px-4 mt-4 sm:mt-5'>
          <img src={assets.search_icon} alt="Search" className='w-3 flex-shrink-0' />
          <input type="text" className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1' placeholder='Search User...' />
        </div>
      </div>
      <div className='flex flex-col'>
        {loadingUsers ? (
          <div className="flex items-center justify-center py-6 sm:py-8">
            <div className="w-5 sm:w-6 h-5 sm:h-6 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-gray-400">
            <p className="text-sm sm:text-base">No users found</p>
          </div>
        ) : (
          users.map((user, index) => (
            <div onClick={() => {
              setSelectedUser(user)
            }} key={index} className={`relative flex items-center gap-2 p-2 sm:p-2 pl-2 sm:pl-4 rounded cursor-pointer text-xs sm:text-sm ${selectedUser?._id === user._id && "bg-gray-800/50"}`}>
              <img src={user?.profilePic || assets.avatar_icon} alt="" className='w-8 sm:w-[35px] aspect-[1/1] rounded-full flex-shrink-0' />
              <div className='flex flex-col leading-4 sm:leading-5 min-w-0 flex-1'>
                <p className='flex items-center gap-1 sm:gap-2 truncate'>
                  <span className="truncate">{user.fullname}</span>
                  {Array.isArray(onlineUsers) && onlineUsers.includes(user._id) && (
                    <span className='w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-green-500 flex-shrink-0'></span>
                  )}
                </p>
                {unseen[user._id] ? (
                  <span className='text-cyan-300 text-xs truncate'>{unseen[user._id]} unread</span>
                ) : (
                  <span className='text-neutral-400 text-xs truncate'>No new messages</span>
                )}
              </div>
              {index > 2 && <p className='absolute top-1 sm:top-4 right-1 sm:right-4 text-xs h-4 w-4 sm:h-5 sm:w-5 flex justify-center items-center rounded-full bg-gray-600/60 text-xs'>{index}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Sidebar