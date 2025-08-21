import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import assets from "../../public/assets";
import { formatMessageTime } from "../lib/utils";
import api from "../lib/api.js";
import { AuthContext } from "../context/AuthContext.jsx";
import toast from 'react-hot-toast';

const ChatContainer = ({ selectedUser, setSelectedUser }) => {
  const scrollEnd = useRef();
  const { user, socket, isAuthenticated } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [media, setMedia] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // load messages when user selected and authenticated
  useEffect(() => {
    if (!selectedUser?._id || !isAuthenticated) return;
    (async () => {
      try {
        setLoadingMessages(true);
        const res = await api.get(`/messages/${selectedUser._id}`);
        if (res.data?.success) {
          setMessages(res.data.messages || []);
        }
      } catch (e) {
        toast.error("Failed to load messages");
      } finally {
        setLoadingMessages(false);
      }
    })();
  }, [selectedUser?._id, isAuthenticated]);

  // load media for mobile modal
  useEffect(() => {
    if (!selectedUser?._id || !showMediaModal || !isAuthenticated) return;
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
  }, [selectedUser?._id, showMediaModal, isAuthenticated]);

  // realtime new messages
  useEffect(() => {
    if (!socket || !isAuthenticated) return;
    const handler = (newMessage) => {
      if (
        selectedUser?._id &&
        (newMessage?.senderId === selectedUser._id || newMessage?.receiverId === selectedUser._id)
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };
    socket.on("newMessage", handler);
    return () => socket.off("newMessage", handler);
  }, [socket, selectedUser?._id, isAuthenticated]);

  const currentUserId = useMemo(() => user?._id, [user?._id]);

  const onSelectImage = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const result = reader.result?.toString() || "";
      setImageDataUrl(result);
      // if no text, auto-send image
      if (!text && result) {
        await send(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const send = async (imageOverride) => {
    const imageToSend = imageOverride || imageDataUrl;
    if (!selectedUser?._id || (!text && !imageToSend) || sending || !isAuthenticated) return;
    try {
      setSending(true);
      const res = await api.post(`/messages/send/${selectedUser._id}`, {
        text,
        image: imageToSend || undefined,
      });
      if (res.data?.success) {
        setMessages((prev) => [...prev, res.data.newMessage]);
        setText("");
        setImageDataUrl("");
        toast.success("Message sent!");
      }
    } catch (e) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg">
      {/* header */}
      <div className="flex items-center gap-3 py-3 px-4 border-b border-gray-700">
        <div
          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
          onClick={() => setShowMediaModal(true)}
        >
          <img
            src={selectedUser?.profilePic || assets.avatar_icon}
            alt=""
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-lg text-white flex items-center gap-2 truncate">
              {selectedUser?.fullname || "User"}
              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
            </p>
            <p className="text-xs text-gray-400 truncate">{selectedUser?.bio || "No bio"}</p>
          </div>
        </div>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className="md:hidden w-7 cursor-pointer flex-shrink-0"
        />
        <img
          src={assets.help_icon}
          alt=""
          className="max-md:hidden w-5 cursor-pointer flex-shrink-0"
        />
      </div>

      {/* chat area */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isCurrentUser = msg.senderId === currentUserId;

            return (
              <div
                key={index}
                className={`flex flex-col mb-4 ${isCurrentUser ? "items-end self-end" : "items-start self-start"
                  }`}
              >
                <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[70%]">
                  {/* Avatar (left side only for other person) */}
                  {!isCurrentUser && (
                    <img
                      src={selectedUser?.profilePic || assets.avatar_icon}
                      alt="user"
                      className="w-7 h-7 rounded-full flex-shrink-0"
                    />
                  )}

                  {/* Message bubble */}
                  {msg.image ? (
                    <img
                      className={`max-w-full rounded-lg border border-gray-700 ${isCurrentUser ? "rounded-br-none" : "rounded-bl-none"
                        }`}
                      src={msg.image}
                      alt="message-img"
                    />
                  ) : (
                    <p
                      className={`p-2 max-w-full text-sm font-light break-words rounded-lg text-white ${isCurrentUser
                        ? "bg-gray-700/50 rounded-br-none text-right"
                        : "bg-gray-800/40 rounded-bl-none text-left"
                        }`}
                    >
                      {msg.text}
                    </p>
                  )}

                  {/* Avatar (right side only for me) */}
                  {isCurrentUser && (
                    <img
                      src={user?.profilePic || assets.avatar_icon}
                      alt="me"
                      className="w-7 h-7 rounded-full flex-shrink-0"
                    />
                  )}
                </div>

                {/* Timestamp */}
                <p
                  className={`text-[11px] text-gray-400 mt-1 ${isCurrentUser ? "text-right pr-9" : "text-left pl-9"
                    }`}
                >
                  {formatMessageTime(msg.createdAt)}
                </p>
              </div>
            );
          })
        )}
        <div ref={scrollEnd}></div>
      </div>

      {/* bottom area */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3 bg-gray-900/30">
        <div className="flex-1 flex items-center bg-gray-800/40 px-3 rounded-full">
          <input
            type="text"
            placeholder="Send a message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                send();
              }
            }}
            className="flex-1 text-sm p-2 border-none rounded-lg outline-none text-white placeholder-gray-400 bg-transparent"
            disabled={sending || !isAuthenticated}
          />
          <input type="file" id="image" accept="image/png, image/jpeg" hidden onChange={(e) => onSelectImage(e.target.files?.[0])} disabled={sending || !isAuthenticated} />
          <label htmlFor="image" className={sending || !isAuthenticated ? "cursor-not-allowed opacity-50" : "cursor-pointer"}>
            <img
              src={assets.gallery_icon}
              alt=""
              className="w-5 mr-2"
            />
          </label>
        </div>
        <button
          onClick={() => send()}
          disabled={sending || (!text && !imageDataUrl) || !isAuthenticated}
          className="flex items-center justify-center w-7 h-7 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <img
              src={assets.send_button}
              className="w-7"
              alt="send-btn"
            />
          )}
        </button>
      </div>

      {/* Mobile Media Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Media</h3>
              <button
                onClick={() => setShowMediaModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {loadingMedia ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
                </div>
              ) : media.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No media shared yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {media.map((url, index) => (
                    <div key={index} onClick={() => window.open(url)} className='cursor-pointer rounded overflow-hidden'>
                      <img src={url} alt="" className='w-full h-32 object-cover' />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-400 bg-gray-900/20 h-full max-md:hidden">
      <img src={assets.logo_icon} className="w-16" alt="logo" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;
