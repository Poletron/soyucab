import React, { useState } from 'react';
import { Users, Calendar, MessageSquare, Settings, UserPlus, Bell, Image, Lock, Eye, Globe, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';

const GroupPage = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [newPost, setNewPost] = useState('');

  const groupInfo = {
    name: 'Desarrolladores UCAB',
    description: 'Comunidad de estudiantes y egresados apasionados por el desarrollo de software, compartiendo conocimientos, proyectos y oportunidades.',
    members: 342,
    privacy: 'publico', // 'publico', 'privado', 'secreto'
    coverImage: 'https://images.unsplash.com/photo-1632834380561-d1e05839a33a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHMlMjBjYW1wdXMlMjBidWlsZGluZ3xlbnwxfHx8fDE3NTkyNTgyMTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  };

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'privado':
        return <Lock className="h-4 w-4" />;
      case 'secreto':
        return <Eye className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getPrivacyLabel = (privacy: string) => {
    switch (privacy) {
      case 'privado':
        return 'Grupo privado';
      case 'secreto':
        return 'Grupo secreto';
      default:
        return 'Grupo público';
    }
  };

  const groupPosts = [
    {
      id: 1,
      author: {
        name: 'Carlos Mendoza',
        role: 'Moderador del Grupo',
        avatar: 'https://images.unsplash.com/photo-1652471943570-f3590a4e52ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBidXNpbmVzcyUyMHN1aXQlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NTkyMTQ4MTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      content: '🚀 ¡Nueva oportunidad de colaboración! \n\nEstamos buscando desarrolladores para participar en un proyecto open source que beneficiará a toda la comunidad universitaria. Es una excelente oportunidad para ganar experiencia y contribuir al ecosistema tech de Venezuela.\n\nTecnologías: React, Node.js, PostgreSQL\n\n¿Quién está interesado?',
      timestamp: 'Hace 3 horas',
      likes: 28,
      comments: 12
    },
    {
      id: 2,
      author: {
        name: 'Andrea López',
        role: 'Miembro',
        avatar: 'https://images.unsplash.com/photo-1667035533110-7964092f44a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHl5b3VuZyUyMHdvbWFuJTIwc3R1ZGVudCUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc1OTMyNDg4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      content: 'Acabo de terminar mi primer proyecto en Django y quería compartir la experiencia con el grupo. La curva de aprendizaje fue empinada pero muy gratificante. \n\n¿Alguien más ha trabajado con Django? Me encantaría intercambiar tips y mejores prácticas.',
      timestamp: 'Hace 6 horas',
      likes: 15,
      comments: 8
    },
    {
      id: 3,
      author: {
        name: 'Miguel Hernández',
        role: 'Miembro',
        avatar: 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHl5b3VuZyUyMG1hbiUyMHN0dWRlbnQlMjBwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NTkzMjQ4Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      content: '📚 Recursos de estudio recomendados:\n\n• "Clean Code" por Robert Martin\n• Curso de TypeScript en freeCodeCamp\n• Documentación oficial de React 18\n• Canal de YouTube "Coding with Mosh"\n\n¿Qué otros recursos han sido útiles para ustedes?',
      timestamp: 'Hace 1 día',
      likes: 42,
      comments: 18
    }
  ];

  const groupMembers = [
    { 
      name: 'Carlos Mendoza', 
      role: 'Estudiante 9no Sem.', 
      avatar: 'https://images.unsplash.com/photo-1652471943570-f3590a4e52ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBidXNpbmVzcyUyMHN1aXQlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NTkyMTQ4MTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', 
      badge: 'admin'
    },
    { 
      name: 'Andrea López', 
      role: 'Estudiante 7mo Sem.', 
      avatar: 'https://images.unsplash.com/photo-1667035533110-7964092f44a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHl5b3VuZyUyMHdvbWFuJTIwc3R1ZGVudCUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc1OTMyNDg4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', 
      badge: 'moderador'
    },
    { 
      name: 'Miguel Hernández', 
      role: 'Egresado 2023', 
      avatar: 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHl5b3VuZyUyMG1hbiUyMHN0dWRlbnQlMjBwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NTkzMjQ4Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', 
      badge: null
    },
    { 
      name: 'Sofía Reyes', 
      role: 'Estudiante 5to Sem.', 
      avatar: 'https://images.unsplash.com/photo-1667035533110-7964092f44a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHl5b3VuZyUyMHdvbWFuJTIwc3R1ZGVudCUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc1OTMyNDg4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', 
      badge: null
    },
    { name: 'Roberto Silva', role: 'Egresado 2022', avatar: '', badge: null },
    { name: 'Paola Torres', role: 'Estudiante 6to Sem.', avatar: '', badge: null }
  ];

  const groupEvents = [
    {
      name: 'Workshop: Intro a Docker',
      date: '2024-11-20',
      time: '6:00 PM',
      attendees: 45,
      status: 'Próximo'
    },
    {
      name: 'Code Review Session',
      date: '2024-11-25',
      time: '4:00 PM',
      attendees: 28,
      status: 'Próximo'
    },
    {
      name: 'Hackathon Interno',
      date: '2024-12-05',
      time: '9:00 AM',
      attendees: 67,
      status: 'Planeado'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Group Header */}
      <Card className="overflow-hidden">
        <div 
          className="h-48 bg-cover bg-center relative"
          style={{ 
            backgroundImage: `linear-gradient(135deg, rgba(64, 180, 229, 0.8) 0%, rgba(41, 128, 185, 0.8) 100%), url('https://images.unsplash.com/photo-1753715613373-90b1ea010731?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMGNvZGUlMjB0ZWNobm9sb2d5JTIwbW9kZXJuJTIwd29ya3NwYWNlfGVufDF8fHx8MTc1OTMyODU2MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div className="flex-1 mb-4 md:mb-0">
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-3xl">{groupInfo.name}</h1>
                <span className="text-gray-500">{getPrivacyIcon(groupInfo.privacy)}</span>
              </div>
              <p className="text-gray-600 mb-3 max-w-2xl">{groupInfo.description}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{groupInfo.members} miembros</span>
                </div>
                <div className="flex items-center space-x-1">
                  {getPrivacyIcon(groupInfo.privacy)}
                  <span>{getPrivacyLabel(groupInfo.privacy)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                style={{ backgroundColor: '#ffc526' }}
                className="text-white hover:opacity-90 flex items-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Unirse al Grupo</span>
              </Button>
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Group Content */}
      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Publicaciones</TabsTrigger>
          <TabsTrigger value="members">Miembros</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          {/* Create Post in Group */}
          <Card>
            <CardContent className="p-4">
              <div className="flex space-x-3">
                <Avatar>
                  <AvatarImage src="https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzJTIwcG9ydHJhaXQlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NTkzMjQ4NzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" />
                  <AvatarFallback>MG</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Comparte algo con el grupo..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="resize-none border-0 shadow-none text-lg placeholder:text-gray-400 min-h-[60px]"
                  />
                  <div className="flex justify-between items-center mt-3">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                      <Image className="h-4 w-4 mr-1" />
                      Imagen
                    </Button>
                    <Button 
                      style={{ backgroundColor: '#ffc526' }}
                      className="text-white hover:opacity-90"
                      disabled={!newPost.trim()}
                    >
                      Publicar en el Grupo
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Group Posts */}
          {groupPosts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3 mb-4">
                  <Avatar>
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{post.author.name}</p>
                      {post.author.role === 'Moderador del Grupo' && (
                        <Badge variant="secondary" className="text-xs">Moderador</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{post.author.role}</p>
                    <p className="text-xs text-gray-400">{post.timestamp}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="whitespace-pre-line">{post.content}</p>
                </div>

                <div className="flex items-center space-x-4 pt-3 border-t border-gray-100">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600">
                    ❤️ {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                    💬 {post.comments}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <h3>Miembros del Grupo ({groupInfo.members})</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupMembers.map((member, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-100">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium truncate">{member.name}</p>
                        {member.badge && (
                          <Badge variant="secondary" className="text-xs">{member.badge}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <h3>Eventos del Grupo</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groupEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-lg" style={{ backgroundColor: '#40b4e5', opacity: 0.1 }}>
                        <Calendar className="h-5 w-5" style={{ color: '#40b4e5' }} />
                      </div>
                      <div>
                        <h4 className="font-medium">{event.name}</h4>
                        <p className="text-sm text-gray-600">{event.date} • {event.time}</p>
                        <p className="text-sm text-gray-500">{event.attendees} asistentes</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant={event.status === 'Próximo' ? 'default' : 'secondary'}
                        style={{ backgroundColor: event.status === 'Próximo' ? '#ffc526' : undefined }}
                      >
                        {event.status}
                      </Badge>
                      <Button variant="outline" size="sm">Ver Detalles</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupPage;