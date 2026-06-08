import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import api, { API_BASE_URL } from '../services/api';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();
  const { addNotification } = useNotifications();
  const [conversations, setConversations] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatUserId, setActiveChatUserId] = useState(null);
  const [typingUsers, setTypingUsers] = useState({}); // maps partnerId -> bool
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);

  const fetchConversations = async () => {
    if (!user) return;
    try {
      const res = await api.get('/api/chat/conversations');
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  const fetchChatHistory = async (partnerId) => {
    if (!user) return;
    try {
      const res = await api.get(`/api/chat/history/${partnerId}`);
      setChatHistory(res.data);
      // Refresh conversations list to update unread counts
      fetchConversations();
    } catch (err) {
      console.error('Failed to fetch chat history:', err);
    }
  };

  // Connect to websocket
  const connectWebSocket = () => {
    if (!user || !token) return;
    
    // Cleanup existing socket
    if (ws.current) {
      ws.current.close();
    }

    const wsBase = API_BASE_URL.replace(/^http/, 'ws');
    const wsUrl = `${wsBase}/api/chat/ws/${user.id}?token=${token}`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      console.log('WebSocket connection established.');
      fetchConversations();
    };

    socket.onmessage = (event) => {
      const payload = jsonParseSafe(event.data);
      if (!payload) return;

      switch (payload.type) {
        case 'message':
          handleIncomingMessage(payload);
          break;
        case 'typing':
          handleIncomingTyping(payload);
          break;
        case 'read_receipt':
          handleIncomingReadReceipt(payload);
          break;
        case 'online_status':
          handleIncomingOnlineStatus(payload);
          break;
        case 'notification':
          // Push notification event to notification context
          addNotification({
            id: payload.notification_id,
            type: payload.notif_type,
            content: payload.content,
            is_read: payload.is_read,
            created_at: payload.created_at
          });
          break;
        default:
          break;
      }
    };

    socket.onclose = (e) => {
      console.log('WebSocket connection closed.', e);
      // Auto-reconnect after 3 seconds
      if (user) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = setTimeout(connectWebSocket, 3000);
      }
    };

    socket.onerror = (err) => {
      console.error('WebSocket encountered error:', err);
      socket.close();
    };
  };

  useEffect(() => {
    if (user && token) {
      connectWebSocket();
    } else {
      if (ws.current) {
        ws.current.close();
      }
      clearTimeout(reconnectTimeout.current);
      setConversations([]);
      setChatHistory([]);
      setActiveChatUserId(null);
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
      clearTimeout(reconnectTimeout.current);
    };
  }, [user, token]);

  const handleIncomingMessage = (msg) => {
    const isFromMe = msg.sender_id === user.id;
    const partnerId = isFromMe ? msg.receiver_id : msg.sender_id;

    // 1. If we are currently chatting with the sender, append to history
    if (activeChatUserId && activeChatUserId === partnerId) {
      setChatHistory((prev) => [...prev, msg]);
      
      // Send read receipt if received from partner
      if (!isFromMe) {
        sendReadReceipt(partnerId, msg.id);
      }
    }
    
    // 2. Refresh conversations thread list to reflect last message
    fetchConversations();
  };

  const handleIncomingTyping = (data) => {
    setTypingUsers((prev) => ({
      ...prev,
      [data.sender_id]: data.is_typing
    }));
  };

  const handleIncomingReadReceipt = (data) => {
    // If the message is in our current chat log, update it
    setChatHistory((prev) =>
      prev.map((m) => (m.id === data.message_id ? { ...m, is_read: true } : m))
    );
    fetchConversations();
  };

  const handleIncomingOnlineStatus = (data) => {
    setConversations((prev) =>
      prev.map((c) => (c.partner_id === data.sender_id ? { ...c, partner_online: data.online } : c))
    );
  };

  const sendWsMessage = (receiverId, content) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: 'message',
          receiver_id: receiverId,
          content: content
        })
      );
    } else {
      console.error('WebSocket is not open.');
    }
  };

  const sendTypingStatus = (receiverId, isTyping) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: 'typing',
          receiver_id: receiverId,
          is_typing: isTyping
        })
      );
    }
  };

  const sendReadReceipt = (receiverId, messageId) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: 'read_receipt',
          receiver_id: receiverId,
          message_id: messageId
        })
      );
    }
  };

  const jsonParseSafe = (data) => {
    try {
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        chatHistory,
        activeChatUserId,
        typingUsers,
        setActiveChatUserId,
        sendWsMessage,
        sendTypingStatus,
        sendReadReceipt,
        fetchConversations,
        fetchChatHistory,
        setChatHistory
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
