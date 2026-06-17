import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import api, { API_BASE_URL } from '../services/api';
import { Send, Check, CheckCheck, MessageCircle, AlertCircle, Loader, Smile } from 'lucide-react';

const Chat = () => {
  const { user } = useAuth();
  const {
    conversations,
    chatHistory,
    activeChatUserId,
    typingUsers,
    setActiveChatUserId,
    sendWsMessage,
    sendTypingStatus,
    sendReadReceipt,
    fetchConversations,
    fetchChatHistory
  } = useChat();

  const location = useLocation();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const [inputText, setInputText] = useState('');
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);

  // Helper to parse dates safely across all browsers
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    const normalized = dateStr.includes(' ') && !dateStr.includes('T')
      ? dateStr.replace(' ', 'T')
      : dateStr;
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  // Scroll to bottom of message logs
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Load thread from URL query (?user=1)
  const loadUrlPartner = async () => {
    const searchParams = new URLSearchParams(location.search);
    const partnerIdParam = searchParams.get('user');
    
    if (partnerIdParam) {
      const pid = parseInt(partnerIdParam);
      if (pid === user.id) return;
      
      setActiveChatUserId(pid);
      
      // Fetch partner profile to show metadata immediately
      try {
        const res = await api.get(`/api/users/profile/${pid}`);
        setPartnerProfile(res.data);
      } catch (e) {
        console.error('Failed to load partner metadata:', e);
      }
    }
  };

  useEffect(() => {
    if (user) {
      loadUrlPartner();
    }
  }, [location.search, user]);

  // Handle active conversation thread selection
  useEffect(() => {
    if (activeChatUserId) {
      setChatLoading(true);
      fetchChatHistory(activeChatUserId).finally(() => setChatLoading(false));
      
      // Fetch partner profile if not already set by URL loader
      const existingConv = conversations.find(c => c.partner_id === activeChatUserId);
      if (existingConv) {
        setPartnerProfile({
          id: existingConv.partner_id,
          name: existingConv.partner_name,
          profile_picture: existingConv.partner_avatar
        });
      } else {
        api.get(`/api/users/profile/${activeChatUserId}`).then(res => setPartnerProfile(res.data));
      }

      // Mark all incoming messages in this thread as read immediately
      const unread = chatHistory.filter(m => m.sender_id === activeChatUserId && !m.is_read);
      for (const msg of unread) {
        sendReadReceipt(activeChatUserId, msg.id);
      }
    } else {
      setPartnerProfile(null);
    }
  }, [activeChatUserId]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);

    // Emit typing status
    if (activeChatUserId) {
      sendTypingStatus(activeChatUserId, true);
      
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStatus(activeChatUserId, false);
      }, 2000);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatUserId) return;

    // Send via WebSocket
    sendWsMessage(activeChatUserId, inputText.trim());
    
    // Stop typing indicator
    sendTypingStatus(activeChatUserId, false);
    clearTimeout(typingTimeoutRef.current);
    
    setInputText('');
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-none border-2 border-brutal-charcoal bg-white overflow-hidden shadow-brutal-md dark:border-white dark:bg-darkCard dark:shadow-brutal-dark-md text-brutal-charcoal dark:text-white">
      {/* Left Pane: Conversations roster */}
      <div className="w-80 border-r-2 border-brutal-charcoal flex flex-col dark:border-white">
        <div className="p-4 border-b-2 border-brutal-charcoal dark:border-white bg-brutal-yellow text-brutal-charcoal">
          <h2 className="text-xs font-black uppercase tracking-wider">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto divide-y-2 divide-brutal-charcoal dark:divide-white">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-xs font-bold text-gray-500 dark:text-gray-400">
              No conversations started yet.
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = activeChatUserId === conv.partner_id;
              const avatar = conv.partner_avatar
                ? (conv.partner_avatar.startsWith('http') ? conv.partner_avatar : `${API_BASE_URL}${conv.partner_avatar}`)
                : null;
              
              return (
                <button
                  key={conv.partner_id}
                  onClick={() => setActiveChatUserId(conv.partner_id)}
                  className={`flex w-full items-center gap-3 p-4 text-left border-b-2 border-brutal-charcoal last:border-b-0 dark:border-white transition-colors ${
                    isSelected ? 'bg-brutal-yellow text-brutal-charcoal' : 'bg-white hover:bg-gray-50/70 dark:bg-darkCard dark:hover:bg-darkBg/30'
                  }`}
                >
                  {/* Avatar with online bubble */}
                  <div className="relative flex-shrink-0">
                    {avatar ? (
                      <img src={avatar} alt={conv.partner_name} className="h-10 w-10 rounded-none border-2 border-brutal-charcoal object-cover shadow-brutal-sm dark:border-white" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-none border-2 border-brutal-charcoal bg-brutal-red font-black text-white text-xs shadow-brutal-sm dark:border-white">
                        {conv.partner_name.charAt(0)}
                      </div>
                    )}
                    {conv.partner_online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-none bg-emerald-500 border-2 border-brutal-charcoal" />
                    )}
                  </div>

                  {/* Thread details snippet */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex justify-between items-baseline">
                      <span className={`text-xs font-black truncate uppercase tracking-wider ${isSelected ? 'text-brutal-charcoal' : 'text-gray-900 dark:text-white'}`}>{conv.partner_name}</span>
                      <span className={`text-[9px] font-bold ${isSelected ? 'text-brutal-charcoal' : 'text-gray-400 dark:text-gray-500'}`}>
                        {conv.last_message_time ? new Date(conv.last_message_time).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                      </span>
                    </div>
                    
                    <p className={`text-[11px] truncate font-bold leading-normal ${
                      conv.unread_count > 0 
                        ? (isSelected ? 'text-brutal-charcoal' : 'text-gray-900 dark:text-white') 
                        : (isSelected ? 'text-gray-700' : 'text-gray-500 dark:text-gray-400')
                    }`}>
                      {conv.last_message}
                    </p>
                  </div>

                  {/* Unread badge count */}
                  {conv.unread_count > 0 && (
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-none bg-brutal-red text-[10px] font-black text-white border-2 border-brutal-charcoal shadow-brutal-sm">
                      {conv.unread_count}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Chat Window Feed */}
      <div className="flex-1 flex flex-col bg-gray-50/30 dark:bg-darkBg/10 justify-between">
        {activeChatUserId && partnerProfile ? (
          <>
            {/* Room Header details */}
            <div className="p-4 bg-white border-b-2 border-brutal-charcoal flex items-center justify-between dark:border-white dark:bg-darkCard">
              <div className="flex items-center space-x-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-none border-2 border-brutal-charcoal bg-brutal-red font-black text-white text-sm shadow-brutal-sm dark:border-white">
                  {partnerProfile.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-brutal-charcoal dark:text-white">{partnerProfile.name}</h3>
                  {typingUsers[activeChatUserId] ? (
                    <span className="text-[10px] text-brutal-red font-black animate-pulse block uppercase">typing...</span>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">active room thread</span>
                  )}
                </div>
              </div>
            </div>

            {/* Message Feed grid */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {chatLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="w-8 h-8 border-4 border-brutal-charcoal border-t-brutal-yellow rounded-none animate-spin dark:border-white dark:border-t-brutal-yellow"></div>
                </div>
              ) : (
                chatHistory.map((msg) => {
                  const isMe = msg.sender_id === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-none p-3.5 text-xs leading-relaxed space-y-1.5 shadow-brutal-sm ${
                        isMe 
                          ? 'bg-brutal-yellow text-brutal-charcoal border-2 border-brutal-charcoal' 
                          : 'bg-white text-brutal-charcoal border-2 border-brutal-charcoal dark:bg-darkCard dark:border-white dark:text-white'
                      }`}>
                        <p className="break-words font-bold whitespace-pre-wrap">{msg.content}</p>
                        
                        <div className={`flex items-center justify-end space-x-1 text-[9px] font-black text-right ${
                          isMe ? 'text-gray-700' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          <span>
                            {parseDate(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          
                          {/* Read receipt checkmark ticks */}
                          {isMe && (
                            msg.is_read ? (
                              <CheckCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Check className="h-3.5 w-3.5 text-gray-500" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input bar */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t-2 border-brutal-charcoal flex items-center gap-3 dark:border-white dark:bg-darkCard">
              <input
                type="text"
                placeholder="Type your message here..."
                value={inputText}
                onChange={handleInputChange}
                className="flex-1 brutal-input py-2.5 px-4 text-xs rounded-none font-bold"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="brutal-btn-yellow rounded-none p-2.5 text-white disabled:opacity-50"
              >
                <Send className="h-4.5 w-4.5 stroke-[3] text-brutal-charcoal" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-8">
            <MessageCircle className="h-16 w-16 text-brutal-red border-2 border-brutal-charcoal bg-brutal-yellow p-3 shadow-brutal-md dark:border-white" />
            <h3 className="text-lg font-black uppercase tracking-tight text-brutal-charcoal dark:text-white">Start a Conversation</h3>
            <p className="text-xs font-bold text-gray-500 max-w-xs leading-normal dark:text-gray-400">
              Select a peer contact thread from the sidebar or click "Contact Student" on listing profiles to start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
