import React, { useContext, useEffect, useState } from 'react'
import assets from '../../public/assets'
import { useNavigate } from "react-router-dom"
import api from "../lib/api.js";
import { AuthContext } from "../context/AuthContext.jsx";
const Sidebar = ({ selectedUser, setSelectedUser }) => {

  const navigate = useNavigate();
  const { logout, onlineUsers } = useContext(AuthContext);
  const handleLogout = () => {
    logout();
    navigate('/login');
  }
  const [users, setUsers] = useState([]);
  const [unseen, setUnseen] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/messages/users");
        if (res.data?.success) {
          setUsers(res.data.users || []);
          setUnseen(res.data.unseenMessages || {});
        }
      } catch (e) {
        // noop
      }
    })();
  }, []);
  return (
    <div className={`bg-gray-900/40 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${selectedUser ? "max-md:hidden" : ""}`}>
      <div className='pb-5'>
        <div className='flex justify-between items-center'>
          <h1 className='text-2xl font-bold'>SChat</h1>
          <div className='relative py-2 group'>
            <img src={assets.menu_icon} alt="Menu" className='max-h-5 cursor-pointer' />
            <div className='absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-gray-900 border border-gray-700 text-gray-100 hidden group-hover:block'>
              <p onClick={() => {
                navigate("/profile")
              }} className='cursor-pointer text-sm'>Edit Profile</p>
              <hr className='my-2 border-t border-gray-500' />
              <p onClick={handleLogout} className='cursor-pointer text-sm'>Logout</p>
            </div>
          </div>
        </div>
        <div className='bg-gray-800/60 rounded-full flex items-center gap-2 py-3 px-4 mt-5'>
          <img src={assets.search_icon} alt="Search" className='w-3' />
          <input type="text" className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1' placeholder='Search User...' />
        </div>
      </div>
      <div className='flex flex-col'>
        {users.map((user, index) => (
          <div onClick={() => {
            setSelectedUser(user)
          }} key={index} className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${selectedUser?._id === user._id && "bg-gray-800/50"}`}>
            <img src={user?.profilePic || assets.avatar_icon} alt="" className='w-[35px] aspect-[1/1] rounded-full' />
            <div className='flex flex-col leading-5'>
              <p className='flex items-center gap-2'>
                {user.fullname}
                {Array.isArray(onlineUsers) && onlineUsers.includes(user._id) && (
                  <span className='w-2 h-2 rounded-full bg-green-500 inline-block'></span>
                )}
              </p>
              {unseen[user._id] ? (
                <span className='text-cyan-300 text-xs'>{unseen[user._id]} unread</span>
              ) : (
                <span className='text-neutral-400 text-xs'>No new messages</span>
              )}
            </div>
            {index > 2 && <p className='absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-gray-600/60'>{index}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Sidebar