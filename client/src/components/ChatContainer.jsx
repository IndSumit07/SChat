import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import assets from "../../public/assets";
import { formatMessageTime } from "../lib/utils";
import api from "../lib/api.js";
import { AuthContext } from "../context/AuthContext.jsx";

const ChatContainer = ({ selectedUser, setSelectedUser }) => {
  const scrollEnd = useRef();
  const { user, socket } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");

  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // load messages when user selected
  useEffect(() => {
    (async () => {
      if (!selectedUser?._id) return;
      try {
        const res = await api.get(`/messages/${selectedUser._id}`);
        if (res.data?.success) {
          setMessages(res.data.messages || []);
        }
      } catch (e) {
        // noop
      }
    })();
  }, [selectedUser?._id]);

  // realtime new messages
  useEffect(() => {
    if (!socket) return;
    const handler = (newMessage) => {
      if (
        selectedUser?._id &&
        (newMessage?.senderId === selectedUser._id || newMessage?.recieverId === selectedUser._id)
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };
    socket.on("newMessage", handler);
    return () => socket.off("newMessage", handler);
  }, [socket, selectedUser?._id]);

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
    if (!selectedUser?._id || (!text && !imageToSend)) return;
    try {
      const res = await api.post(`/messages/send/${selectedUser._id}`, {
        text,
        image: imageToSend || undefined,
      });
      if (res.data?.success) {
        setMessages((prev) => [...prev, res.data.newMessage]);
        setText("");
        setImageDataUrl("");
      }
    } catch (e) {
      // noop
    }
  };

  // current user id from auth

  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg">
      {/* header */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-gray-700">
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt=""
          className="w-8 h-8 rounded-full object-cover"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser?.fullname || "User"}
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className="md:hidden w-7 cursor-pointer"
        />
        <img
          src={assets.help_icon}
          alt=""
          className="max-md:hidden w-5 cursor-pointer"
        />
      </div>

      {/* chat area */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messages.map((msg, index) => {
          const isCurrentUser = msg.senderId === currentUserId;

          return (
            <div
              key={index}
              className={`flex flex-col mb-4 ${isCurrentUser ? "items-end self-end" : "items-start self-start"
                }`}
            >
              <div className="flex items-end gap-2">
                {/* Avatar (left side only for other person) */}
                {!isCurrentUser && (
                  <img
                    src={selectedUser?.profilePic || assets.avatar_icon}
                    alt="user"
                    className="w-7 h-7 rounded-full"
                  />
                )}

                {/* Message bubble */}
                {msg.image ? (
                  <img
                    className={`max-w-[220px] rounded-lg border border-gray-700 ${isCurrentUser ? "rounded-br-none" : "rounded-bl-none"
                      }`}
                    src={msg.image}
                    alt="message-img"
                  />
                ) : (
                  <p
                    className={`p-2 max-w-[200px] text-sm font-light break-words rounded-lg text-white ${isCurrentUser
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
                    src={assets.avatar_icon}
                    alt="me"
                    className="w-7 h-7 rounded-full"
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
        })}
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
          />
          <input type="file" id="image" accept="image/png, image/jpeg" hidden onChange={(e) => onSelectImage(e.target.files?.[0])} />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt=""
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>
        <img
          src={assets.send_button}
          className="w-7 cursor-pointer"
          alt="send-btn"
          onClick={send}
        />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-400 bg-gray-900/20 h-full max-md:hidden">
      <img src={assets.logo_icon} className="w-16" alt="logo" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;
