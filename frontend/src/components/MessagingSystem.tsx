import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  ArrowLeft,
  UserPlus,
  CheckCheck,
  Check,
  Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import {
  getConversations,
  getMessages,
  sendMessage,
  startConversation,
  searchUsers,
  getCurrentUser,
  Conversation,
  Message
} from '../services/api';
import { useRole } from '../hooks/useRole';

interface ConversationDisplay {
  id: number;
  user: {
    name: string;
    email: string;
    avatar: string;
    status: string;
    role: string;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    isRead: boolean;
    sender: string;
  };
  unreadCount: number;
}

export default function MessagingSystem() {
  // State
  const [conversations, setConversations] = useState<ConversationDisplay[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showConversations, setShowConversations] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [newChatSearch, setNewChatSearch] = useState('');

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedConversationIdRef = useRef<number | null>(null);
  const isInitialLoadRef = useRef(true);

  const { isVisitor } = useRole();
  const currentUser = getCurrentUser();

  // Keep ref in sync with state
  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  // Derived state for selected conversation
  const selectedConversation = conversations.find(c => c.id === selectedConversationId) || null;

  // Format time helper
  const formatTime = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-VE');
    }
  }, []);

  // Load conversations (does NOT auto-select or trigger message loading)
  const loadConversations = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const result = await getConversations();
      if (result.success && result.data) {
        const mapped: ConversationDisplay[] = result.data.map((conv: Conversation) => ({
          id: conv.clave_conversacion,
          user: {
            name: conv.otros_participantes?.[0] || conv.titulo_chat || 'Chat',
            email: conv.otros_participantes?.[0] || '',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.otros_participantes?.[0] || 'C')}`,
            status: 'offline',
            role: conv.tipo_conversacion || 'Privada'
          },
          lastMessage: {
            content: conv.ultimo_mensaje || 'Sin mensajes',
            timestamp: conv.fecha_ultimo_mensaje ? formatTime(conv.fecha_ultimo_mensaje) : '',
            isRead: Number(conv.mensajes_sin_leer) === 0,
            sender: 'other'
          },
          unreadCount: Number(conv.mensajes_sin_leer) || 0
        }));
        setConversations(mapped);

        // Only auto-select on FIRST load if nothing selected
        if (isInitialLoadRef.current && mapped.length > 0 && !selectedConversationIdRef.current) {
          isInitialLoadRef.current = false;
          setSelectedConversationId(mapped[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [formatTime]);

  // Load messages for a specific conversation
  const loadMessages = useCallback(async (conversationId: number) => {
    try {
      setLoadingMessages(true);
      const result = await getMessages(conversationId);
      if (result.success && result.data) {
        // Only update if this is still the selected conversation
        if (selectedConversationIdRef.current === conversationId) {
          setMessages(result.data);
        }
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Silent poll for messages (no loading state)
  const pollMessages = useCallback(async () => {
    const currentId = selectedConversationIdRef.current;
    if (!currentId) return;

    try {
      const result = await getMessages(currentId);
      if (result.success && result.data && selectedConversationIdRef.current === currentId) {
        setMessages(prev => {
          // Only update if there's actually new data
          if (prev.length !== result.data.length) {
            return result.data;
          }
          const lastPrev = prev[prev.length - 1]?.clave_mensaje;
          const lastNew = result.data[result.data.length - 1]?.clave_mensaje;
          if (lastPrev !== lastNew) {
            return result.data;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Error polling messages:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages when selected conversation changes
  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
    } else {
      setMessages([]);
    }
  }, [selectedConversationId, loadMessages]);

  // Polling interval
  useEffect(() => {
    const interval = setInterval(() => {
      loadConversations(true);
      pollMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadConversations, pollMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // Handlers
  const handleSelectConversation = useCallback((conversationId: number) => {
    setSelectedConversationId(conversationId);
    if (window.innerWidth < 768) {
      setShowConversations(false);
    }
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId || sending) return;

    try {
      setSending(true);
      const result = await sendMessage(selectedConversationId, newMessage.trim());
      if (result.success) {
        setNewMessage('');
        loadMessages(selectedConversationId);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleStartNewChat = async (email: string) => {
    try {
      const result = await startConversation(email);
      if (result.success) {
        setShowNewChat(false);
        setNewChatSearch('');
        setSearchResults([]);
        await loadConversations();
        // Select the new conversation if we got an ID back
        if (result.data?.clave_conversacion) {
          setSelectedConversationId(result.data.clave_conversacion);
        }
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
    }
  };

  const handleSearchUsers = async (query: string) => {
    setNewChatSearch(query);
    if (query.length >= 2) {
      try {
        const result = await searchUsers(query);
        if (result.success) {
          setSearchResults(result.data || []);
        }
      } catch (err) {
        console.error('Error searching users:', err);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Filtered conversations
  const filteredConversations = conversations.filter(conversation =>
    conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render helpers
  const renderConversationsList = () => (
    <div className="w-full md:w-96 border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Mensajes</h2>
          <Button
            size="sm"
            onClick={() => setShowNewChat(true)}
            style={{ backgroundColor: '#40b4e5' }}
            className="text-white hover:bg-blue-600"
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="p-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No hay conversaciones
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation.id)}
                className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${selectedConversationId === conversation.id ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={conversation.user.avatar} />
                  <AvatarFallback>{conversation.user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</AvatarFallback>
                </Avatar>

                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 truncate">{conversation.user.name}</p>
                    <span className="text-xs text-gray-500">{conversation.lastMessage.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-500 truncate flex-1">{conversation.lastMessage.content}</p>
                    {conversation.unreadCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-2 text-white"
                        style={{ backgroundColor: '#40b4e5' }}
                      >
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );

  const renderChatArea = () => (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      {selectedConversation && (
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConversations(true)}
                className="md:hidden mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedConversation.user.avatar} />
                <AvatarFallback>{selectedConversation.user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <h3 className="font-semibold text-gray-900">{selectedConversation.user.name}</h3>
                <p className="text-sm text-gray-500">{selectedConversation.user.role}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                  <DropdownMenuItem>Silenciar conversación</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Eliminar conversación</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isMe = message.correo_autor_mensaje === currentUser?.email;
              return (
                <div
                  key={message.clave_mensaje}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isMe
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-900'
                    }`}
                    style={isMe ? { backgroundColor: '#40b4e5' } : {}}
                  >
                    <p className="text-sm">{message.texto_mensaje}</p>
                    <div className={`flex items-center justify-end mt-1 space-x-1 ${isMe ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                      <span className="text-xs">{formatTime(message.fecha_hora_envio)}</span>
                      {isMe && (
                        <>
                          {message.estado_mensaje === 'Leído' ? (
                            <CheckCheck className="h-3 w-3" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Button type="button" variant="ghost" size="sm">
            <Paperclip className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="pr-10"
              disabled={sending}
            />
            <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1/2 transform -translate-y-1/2">
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          <Button
            type="submit"
            style={{ backgroundColor: '#40b4e5' }}
            className="text-white hover:bg-blue-600"
            disabled={!newMessage.trim() || sending}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );

  const renderNewChatModal = () => {
    if (!showNewChat) return null;

    return (
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Nueva Conversación</h3>
            <Button variant="ghost" size="sm" onClick={() => { setShowNewChat(false); setNewChatSearch(''); setSearchResults([]); }}>
              ×
            </Button>
          </div>

          <div className="mb-4">
            <Input
              placeholder="Buscar usuarios..."
              value={newChatSearch}
              onChange={(e) => handleSearchUsers(e.target.value)}
            />
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {searchResults.length === 0 && newChatSearch.length >= 2 ? (
              <p className="text-sm text-gray-500 text-center py-4">No se encontraron usuarios</p>
            ) : (
              searchResults.map((user, index) => (
                <div
                  key={user.correo_principal || index}
                  className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleStartNewChat(user.correo_principal)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.fotografia_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombres + ' ' + user.apellidos)}`} />
                    <AvatarFallback>{(user.nombres?.[0] || '') + (user.apellidos?.[0] || '')}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3 flex-1">
                    <p className="font-medium text-sm">{user.nombres} {user.apellidos}</p>
                    <p className="text-xs text-gray-500">{user.correo_principal}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-140px)] bg-gray-50 rounded-lg overflow-hidden relative z-0">
      <div className="flex h-full">
        {/* Conversations sidebar */}
        <div className={`${showConversations ? 'block' : 'hidden'} md:block`}>
          {renderConversationsList()}
        </div>

        {/* Chat area */}
        <div className={`${showConversations ? 'hidden' : 'flex'} md:flex flex-1`}>
          {selectedConversation ? renderChatArea() : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Selecciona una conversación
            </div>
          )}
        </div>
      </div>

      {renderNewChatModal()}
    </div>
  );
}