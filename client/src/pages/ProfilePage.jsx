import React, { useContext, useState } from 'react'
import { useNavigate } from "react-router-dom"
import assets from "../../public/assets.js"
import api from "../lib/api.js"
import { AuthContext } from "../context/AuthContext.jsx";
const ProfilePage = () => {
  const [selectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState("Sumit Kumar");
  const [bio, setBio] = useState("Hi Everyone, I am Sumit Kumar.");
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let profilePic = "";
      if (selectedImg) {
        const reader = new FileReader();
        const dataUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result?.toString() || "");
          reader.readAsDataURL(selectedImg);
        });
        profilePic = dataUrl;
      }
      const res = await api.put('/auth/update-profile', {
        fullname: name,
        bio,
        profilePic: profilePic || undefined
      });
      if (res.data?.success) {
        navigate('/');
      } else {
        alert(res.data?.message || 'Failed to update');
      }
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'Failed');
    }
  }
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center'>
      <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 bg-gradient-to-br from-gray-950/70 via-gray-900/60 to-black/50 border border-gray-800 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-5 p-10 flex-1'>
          <h3 className='text-lg'>Profile Details</h3>
          <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
            <input onChange={(e) => setSelectedImg(e.target.files[0])} type="file" id='avatar' accept='.png, .jpg, .jpeg' hidden />
            <img src={selectedImg ? URL.createObjectURL(selectedImg) : assets.avatar_icon} alt="" className={`w-12 h-12 ${selectedImg && "rounded-full"}`} />
            Upload profile image
          </label>
          <input onChange={(e) => setName(e.target.value)} value={name} type="text" required placeholder='Your Name' className='p-2 rounded-md bg-gray-900/70 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600' />
          <textarea onChange={(e) => setBio(e.target.value)} value={bio} placeholder='Write profile bio' required className='p-2 rounded-md bg-gray-900/70 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600' rows={4}></textarea>
          <button type='submit' className='bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 hover:from-gray-700 hover:to-gray-600 text-white p-2 rounded-full mx-10 max-sm:mt-10 focus:outline-none focus:ring-2 focus:ring-gray-600'>Save</button>
        </form>
        <img src={assets.robot} className='max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10' alt="" />
      </div>
    </div>
  )
}

export default ProfilePage