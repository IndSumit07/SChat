import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom"
import assets from "../../public/assets.js"
import api from "../lib/api.js"
import { AuthContext } from "../context/AuthContext.jsx";
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const [selectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, updateUser } = useContext(AuthContext);

  // Initialize form with current user data
  useEffect(() => {
    if (user) {
      setName(user.fullname || "");
      setBio(user.bio || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
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
        // Update the user context with new data
        updateUser(res.data.user);
        toast.success("Profile updated successfully!");
        navigate('/');
      } else {
        toast.error(res.data?.message || 'Failed to update');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center px-4'>
      <div className='w-full max-w-2xl backdrop-blur-2xl text-gray-300 bg-gradient-to-br from-gray-950/70 via-gray-900/60 to-black/50 border border-gray-800 flex flex-col sm:flex-row items-center justify-between rounded-lg overflow-hidden'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4 sm:gap-5 p-6 sm:p-10 flex-1 w-full'>
          <h3 className='text-lg sm:text-xl font-semibold text-white'>Profile Details</h3>
          <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
            <input onChange={(e) => setSelectedImg(e.target.files[0])} type="file" id='avatar' accept='.png, .jpg, .jpeg' hidden disabled={submitting} />
            <img
              src={selectedImg ? URL.createObjectURL(selectedImg) : (user?.profilePic || assets.avatar_icon)}
              alt=""
              className={`w-12 h-12 ${(selectedImg || user?.profilePic) && "rounded-full"}`}
            />
            <span className="text-sm sm:text-base">Upload profile image</span>
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            required
            placeholder='Your Name'
            className='p-2 sm:p-3 rounded-md bg-gray-900/70 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 text-sm sm:text-base'
            disabled={submitting}
          />
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder='Write profile bio'
            required
            className='p-2 sm:p-3 rounded-md bg-gray-900/70 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 text-sm sm:text-base'
            rows={4}
            disabled={submitting}
          ></textarea>
          <button
            type='submit'
            disabled={submitting}
            className='bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 hover:from-gray-700 hover:to-gray-600 text-white p-2 sm:p-3 rounded-full mx-4 sm:mx-10 mt-4 sm:mt-6 focus:outline-none focus:ring-2 focus:ring-gray-600 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base'
          >
            {submitting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            Save
          </button>
        </form>
        <div className="flex-shrink-0 p-4 sm:p-6">
          <img src={assets.robot} className='w-32 h-32 sm:w-44 sm:h-44 aspect-square rounded-full' alt="" />
        </div>
      </div>
    </div>
  )
}

export default ProfilePage