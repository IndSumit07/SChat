import React, { useContext, useEffect, useState } from 'react'
import assets from '../../public/assets'
import { useNavigate } from "react-router-dom"
import api from "../lib/api.js"
import { AuthContext } from "../context/AuthContext.jsx";
import toast from 'react-hot-toast';

const Sidebar = ({ selectedUser, setSelectedUser }) => {
  const navigate = useNavigate();
  const { logout, onlineUsers, isAuthenticated } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [unseen, setUnseen] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate('/login');
  }

  useEffect(() => {
    if (isAuthenticated) {
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
    }
  }, [isAuthenticated]);

  return (
    <div className={`bg-gray-900/40 h-full p-3 sm:p-5 rounded-r-xl overflow-y-scroll text-white ${selectedUser ? "max-md:hidden" : ""}`}>
      {/* header */}
      <div className='flex items-center justify-between mb-6 sm:mb-8'>
        <h1 className='text-xl sm:text-2xl font-bold text-white'>SChat</h1>
        <div className='relative group'>
          <img src={assets.menu_icon} alt="" className='w-5 sm:w-6 cursor-pointer' />
          <div className='absolute right-0 top-full mt-2 w-32 bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10'>
            <button onClick={handleLogout} className='w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 rounded-lg transition-colors'>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* search */}
      <div className='relative mb-6 sm:mb-8'>
        <img src={assets.search_icon} alt="" className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
        <input type="text" placeholder='Search or start new chat' className='w-full pl-10 pr-4 py-2 sm:py-3 bg-gray-800/40 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 text-sm sm:text-base' />
      </div>

      {/* users list */}
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