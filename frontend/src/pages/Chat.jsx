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
    <div className="flex h-[calc(100vh-8rem)] rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm dark:border-darkBorder dark:bg-darkCard">
      {/* Left Pane: Conversations roster */}
      <div className="w-80 border-r border-gray-100 flex flex-col dark:border-darkBorder">
        <div className="p-4 border-b border-gray-100 dark:border-darkBorder">
          <h2 className="text-sm font-bold text-gray-950 dark:text-white uppercase tracking-wider">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-darkBorder/40">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500 dark:text-gray-400">
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
                  className={`flex w-full items-center gap-3 p-4 text-left hover:bg-gray-50/70 dark:hover:bg-darkBg/30 transition-colors ${
                    isSelected ? 'bg-brand-50/50 dark:bg-brand-950/10' : ''
                  }`}
                >
                  {/* Avatar with online bubble */}
                  <div className="relative flex-shrink-0">
                    {avatar ? (
                      <img src={avatar} alt={conv.partner_name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 font-bold text-white text-xs">
                        {conv.partner_name.charAt(0)}
                      </div>
                    )}
                    {conv.partner_online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-darkCard" />
                    )}
                  </div>

                  {/* Thread details snippet */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-gray-900 truncate dark:text-white">{conv.partner_name}</span>
                      <span className="text-[9px] text-gray-400">
                        {conv.last_message_time ? new Date(conv.last_message_time).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                      </span>
                    </div>
                    
                    <p className={`text-[11px] truncate leading-normal ${
                      conv.unread_count > 0 ? 'font-bold text-gray-950 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {conv.last_message}
                    </p>
                  </div>

                  {/* Unread badge count */}
                  {conv.unread_count > 0 && (
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
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
            <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between dark:border-darkBorder dark:bg-darkCard">
              <div className="flex items-center space-x-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 font-bold text-white text-sm">
                  {partnerProfile.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-950 dark:text-white">{partnerProfile.name}</h3>
                  {typingUsers[activeChatUserId] ? (
                    <span className="text-[10px] text-brand-600 font-bold animate-pulse block">typing...</span>
                  ) : (
                    <span className="text-[10px] text-gray-400">active room thread</span>
                  )}
                </div>
              </div>
            </div>

            {/* Message Feed grid */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {chatLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
                </div>
              ) : (
                chatHistory.map((msg) => {
                  const isMe = msg.sender_id === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl p-3 text-xs leading-relaxed space-y-1 shadow-sm ${
                        isMe 
                          ? 'bg-brand-600 text-white rounded-br-none' 
                          : 'bg-white text-gray-800 rounded-bl-none border border-gray-100 dark:bg-darkCard dark:border-darkBorder dark:text-gray-300'
                      }`}>
                        <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                        
                        <div className="flex items-center justify-end space-x-1 text-[9px] opacity-80 text-right">
                          <span>
                            {parseDate(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          
                          {/* Read receipt checkmark ticks */}
                          {isMe && (
                            msg.is_read ? (
                              <CheckCheck className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Check className="h-3.5 w-3.5 text-white/70" />
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
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex items-center gap-3 dark:border-darkBorder dark:bg-darkCard">
              <input
                type="text"
                placeholder="Type your message here..."
                value={inputText}
                onChange={handleInputChange}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 px-4 text-xs focus:border-brand-500 focus:outline-none dark:border-darkBorder dark:bg-darkBg dark:text-white"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="rounded-xl bg-brand-600 p-2.5 text-white shadow-md hover:bg-brand-500 disabled:opacity-50"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 p-8">
            <MessageCircle className="h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Start a Conversation</h3>
            <p className="text-xs text-gray-500 max-w-xs leading-normal">
              Select a peer contact thread from the sidebar or click "Contact Student" on listing profiles to start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
