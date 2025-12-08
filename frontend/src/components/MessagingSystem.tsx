import React, { useState } from 'react';
import { 
  Send, 
  Search, 
  Phone, 
  Video, 
  MoreVertical, 
  Paperclip, 
  Smile, 
  ArrowLeft,
  Users,
  UserPlus,
  Circle,
  CheckCheck,
  Check
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

// Mock data for conversations
const mockConversations = [
  {
    id: '1',
    user: {
      name: 'Dr. María Rodríguez',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzJTIwcG9ydHJhaXQlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NTkzMjQ4NzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      status: 'online',
      role: 'Directora - Ing. Informática'
    },
    lastMessage: {
      content: 'Perfecto, nos vemos mañana en la reunión.',
      timestamp: '10:30 AM',
      isRead: true,
      sender: 'other'
    },
    unreadCount: 0
  },
  {
    id: '2',
    user: {
      name: 'Carlos Mendoza',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBidXNpbmVzcyUyMHBvcnRyYWl0JTIwaGVhZHNob3R8ZW58MXx8fHwxNzU5MzI0ODc0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      status: 'offline',
      role: 'Estudiante - Administración'
    },
    lastMessage: {
      content: '¿Podrías ayudarme con el proyecto de marketing?',
      timestamp: 'Ayer',
      isRead: false,
      sender: 'other'
    },
    unreadCount: 2
  },
  {
    id: '3',
    user: {
      name: 'Ana Gutierrez',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzJTIwcG9ydHJhaXQlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NTkzMjQ4NzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      status: 'online',
      role: 'Egresada - Psicología'
    },
    lastMessage: {
      content: 'Excelente presentación hoy 👏',
      timestamp: '2:15 PM',
      isRead: true,
      sender: 'me'
    },
    unreadCount: 0
  },
  {
    id: '4',
    user: {
      name: 'Prof. Luis Torres',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBidXNpbmVzcyUyMHBvcnRyYWl0JTIwaGVhZHNob3R8ZW58MXx8fHwxNzU5MzI0ODc0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      status: 'away',
      role: 'Profesor - Ingeniería'
    },
    lastMessage: {
      content: 'Las calificaciones ya están disponibles',
      timestamp: '11:45 AM',
      isRead: true,
      sender: 'other'
    },
    unreadCount: 0
  }
];

// Mock data for messages
const mockMessages = [
  {
    id: '1',
    content: 'Hola María, ¿cómo estás? Quería consultarte sobre la propuesta del nuevo programa de mentorías.',
    timestamp: '10:25 AM',
    sender: 'me',
    status: 'read'
  },
  {
    id: '2',
    content: 'Hola! Todo bien, gracias por preguntar. Me parece una excelente iniciativa. ¿Tienes tiempo para una reunión mañana?',
    timestamp: '10:27 AM',
    sender: 'other',
    status: 'sent'
  },
  {
    id: '3',
    content: 'Por supuesto, mañana me viene perfecto. ¿Te parece a las 2:00 PM en tu oficina?',
    timestamp: '10:29 AM',
    sender: 'me',
    status: 'read'
  },
  {
    id: '4',
    content: 'Perfecto, nos vemos mañana en la reunión.',
    timestamp: '10:30 AM',
    sender: 'other',
    status: 'sent'
  }
];

interface MessagingSystemProps {}

export default function MessagingSystem({}: MessagingSystemProps) {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showConversations, setShowConversations] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      // Here you would normally send the message to your backend
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const filteredConversations = mockConversations.filter(conversation =>
    conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => {
                setSelectedConversation(conversation);
                if (window.innerWidth < 768) {
                  setShowConversations(false);
                }
              }}
              className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedConversation.id === conversation.id ? 'bg-blue-50 border border-blue-200' : ''
              }`}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={conversation.user.avatar} />
                  <AvatarFallback>{conversation.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                {conversation.user.status === 'online' && (
                  <Circle className="absolute -bottom-1 -right-1 h-4 w-4 text-green-500 fill-current" />
                )}
                {conversation.user.status === 'away' && (
                  <Circle className="absolute -bottom-1 -right-1 h-4 w-4 text-yellow-500 fill-current" />
                )}
              </div>
              
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900 truncate">{conversation.user.name}</p>
                  <span className="text-xs text-gray-500">{conversation.lastMessage.timestamp}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{conversation.user.role}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-gray-500 truncate flex-1">{conversation.lastMessage.content}</p>
                  {conversation.unreadCount > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="ml-2 bg-blue-500 text-white"
                      style={{ backgroundColor: '#40b4e5' }}
                    >
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  const renderChatArea = () => (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
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
              <AvatarFallback>{selectedConversation.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {mockMessages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'me'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
              style={message.sender === 'me' ? { backgroundColor: '#40b4e5' } : {}}
              >
                <p className="text-sm">{message.content}</p>
                <div className={`flex items-center justify-end mt-1 space-x-1 ${
                  message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  <span className="text-xs">{message.timestamp}</span>
                  {message.sender === 'me' && (
                    <>
                      {message.status === 'read' ? (
                        <CheckCheck className="h-3 w-3" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
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
            />
            <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1/2 transform -translate-y-1/2">
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            type="submit" 
            style={{ backgroundColor: '#40b4e5' }}
            className="text-white hover:bg-blue-600"
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );

  const renderNewChatModal = () => {
    if (!showNewChat) return null;

    const suggestedUsers = [
      {
        name: 'Roberto Silva',
        role: 'Estudiante - Ingeniería',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBidXNpbmVzcyUyMHBvcnRyYWl0JTIwaGVhZHNob3R8ZW58MXx8fHwxNzU5MzI0ODc0fDA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      {
        name: 'Dra. Carmen López',
        role: 'Profesora - Medicina',
        avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzJTIwcG9ydHJhaXQlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NTkzMjQ4NzR8MA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      {
        name: 'Miguel Herrera',
        role: 'Egresado - Economía',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBidXNpbmVzcyUyMHBvcnRyYWl0JTIwaGVhZHNob3R8ZW58MXx8fHwxNzU5MzI0ODc0fDA&ixlib=rb-4.1.0&q=80&w=1080'
      }
    ];

    return (
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Nueva Conversación</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowNewChat(false)}>
              ×
            </Button>
          </div>
          
          <div className="mb-4">
            <Input placeholder="Buscar usuarios..." />
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Usuarios sugeridos</p>
            {suggestedUsers.map((user, index) => (
              <div key={index} className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1">
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-120px)] bg-gray-50 rounded-lg overflow-hidden relative">
      <div className="flex h-full">
        {/* Conversations sidebar - visible on desktop or when showConversations is true on mobile */}
        <div className={`${showConversations ? 'block' : 'hidden'} md:block`}>
          {renderConversationsList()}
        </div>
        
        {/* Chat area - visible when conversation is selected on mobile, always visible on desktop */}
        <div className={`${showConversations ? 'hidden' : 'flex'} md:flex flex-1`}>
          {renderChatArea()}
        </div>
      </div>
      
      {renderNewChatModal()}
    </div>
  );
}