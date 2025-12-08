import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Camera, FileText, Calendar, Users, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';

const MainFeed = () => {
  const [postContent, setPostContent] = useState('');

  const posts = [
    {
      id: 1,
      author: {
        name: 'Dr. Carlos Mendoza',
        role: 'Profesor de Ingeniería de Software',
        avatar: 'https://images.unsplash.com/photo-1579540830482-659e7518c895?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzb3IlMjBhY2FkZW1pYyUyMG1hbiUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NTkzMjQ4ODR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      content: '¡Felicidades a todos los estudiantes que participaron en el Hackathon UCAB 2024! La calidad de los proyectos presentados fue excepcional. Es inspirador ver cómo nuestra comunidad aplica la tecnología para resolver problemas reales.',
      timestamp: 'Hace 2 horas',
      likes: 24,
      comments: 8,
      shares: 3
    },
    {
      id: 2,
      author: {
        name: 'Ana Sofía Torres',
        role: 'Egresada - Ing. Informática 2023',
        avatar: 'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzJTIwcG9ydHJhaXQlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NTkzMjQ4NzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      content: 'Compartiendo mi experiencia en mi nueva posición como Data Scientist en una startup fintech. Los conocimientos adquiridos en UCAB han sido fundamentales para mi desarrollo profesional. ¡Siempre orgullosa de ser parte de esta comunidad! 🚀',
      timestamp: 'Hace 5 horas',
      likes: 42,
      comments: 15,
      shares: 7
    },
    {
      id: 3,
      author: {
        name: 'Grupo de Robótica UCAB',
        role: 'Organización Estudiantil',
        avatar: 'https://images.unsplash.com/photo-1666558889375-798fa96b559a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHN0ZWFtJTIwcm9ib3RpY3MlMjB0ZWNobm9sb2d5JTIwc3R1ZGVudHN8ZW58MXx8fHwxNzU5MzI0ODg5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      content: '📅 ¡Próximo taller de Arduino y IoT! 📅\n\nFecha: Viernes 15 de Noviembre\nHora: 2:00 PM - 5:00 PM\nLugar: Laboratorio de Ingeniería\n\nAprende a crear tus primeros proyectos con sensores y actuadores. ¡Plazas limitadas!',
      timestamp: 'Hace 1 día',
      likes: 35,
      comments: 12,
      shares: 18
    }
  ];

  const suggestedConnections = [
    { 
      name: 'Luis Hernández', 
      role: 'Estudiante 6to Semestre', 
      mutualConnections: 12,
      avatar: 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHN5b3VuZyUyMG1hbiUyMHN0dWRlbnQlMjBwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NTkzMjQ4Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    { 
      name: 'Dra. Patricia Morales', 
      role: 'Directora Escuela Informática', 
      mutualConnections: 8,
      avatar: 'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzJTIwcG9ydHJhaXQlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NTkzMjQ4NzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    { 
      name: 'Roberto Silva', 
      role: 'Egresado - Ing. Industrial', 
      mutualConnections: 5,
      avatar: 'https://images.unsplash.com/photo-1652471943570-f3590a4e52ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBidXNpbmVzcyUyMHN1aXQlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NTkyMTQ4MTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    }
  ];

  const upcomingEvents = [
    { name: 'Conferencia de IA', date: 'Nov 20, 2024', attendees: 156 },
    { name: 'Feria de Empleo UCAB', date: 'Dic 5, 2024', attendees: 234 },
    { name: 'Workshop de Blockchain', date: 'Dic 12, 2024', attendees: 89 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        {/* User Quick Profile */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar>
                <AvatarImage src="https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzJTIwcG9ydHJhaXQlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NTkzMjQ4NzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" />
                <AvatarFallback>MG</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">María Gabriela</p>
                <p className="text-sm text-gray-500">Ver perfil</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Conexiones</span>
                <span className="font-medium">124</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Grupos</span>
                <span className="font-medium">8</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader className="pb-3">
            <h3>Accesos Rápidos</h3>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start p-2 h-auto">
                <Users className="h-4 w-4 mr-2" />
                Mis Grupos
              </Button>
              <Button variant="ghost" className="w-full justify-start p-2 h-auto">
                <Calendar className="h-4 w-4 mr-2" />
                Eventos
              </Button>
              <Button variant="ghost" className="w-full justify-start p-2 h-auto">
                <TrendingUp className="h-4 w-4 mr-2" />
                Estadísticas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Feed */}
      <div className="lg:col-span-2 space-y-6">
        {/* Create Post */}
        <Card>
          <CardContent className="p-4">
            <div className="flex space-x-3">
              <Avatar>
                <AvatarImage src="https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzJTIwcG9ydHJhaXQlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NTkzMjQ4NzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" />
                <AvatarFallback>MG</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="¿Sobre qué estás pensando, María Gabriela?"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="resize-none border-0 shadow-none text-lg placeholder:text-gray-400 min-h-[60px]"
                />
                <div className="flex justify-between items-center mt-3">
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                      <Camera className="h-4 w-4 mr-1" />
                      Foto
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                      <FileText className="h-4 w-4 mr-1" />
                      Artículo
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                      <Calendar className="h-4 w-4 mr-1" />
                      Evento
                    </Button>
                  </div>
                  <Button 
                    style={{ backgroundColor: '#ffc526' }}
                    className="text-white hover:opacity-90"
                    disabled={!postContent.trim()}
                  >
                    Publicar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-4">
              {/* Post Header */}
              <div className="flex items-start space-x-3 mb-4">
                <Avatar>
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{post.author.name}</p>
                  <p className="text-sm text-gray-500">{post.author.role}</p>
                  <p className="text-xs text-gray-400">{post.timestamp}</p>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="whitespace-pre-line">{post.content}</p>
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex space-x-4">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600">
                    <Heart className="h-4 w-4 mr-1" />
                    {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {post.comments}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-green-600">
                    <Share2 className="h-4 w-4 mr-1" />
                    {post.shares}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Right Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        {/* Suggested Connections */}
        <Card>
          <CardHeader className="pb-3">
            <h3>Personas que quizás conozcas</h3>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3">
              {suggestedConnections.map((person, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={person.avatar} />
                    <AvatarFallback>{person.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{person.name}</p>
                    <p className="text-xs text-gray-500 truncate">{person.role}</p>
                    <p className="text-xs text-gray-400">{person.mutualConnections} conexiones en común</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2 text-xs h-6"
                      style={{ borderColor: '#40b4e5', color: '#40b4e5' }}
                    >
                      Conectar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="pb-3">
            <h3>Eventos Recomendados</h3>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="border-l-2 pl-3" style={{ borderColor: '#ffc526' }}>
                  <p className="text-sm font-medium">{event.name}</p>
                  <p className="text-xs text-gray-500">{event.date}</p>
                  <p className="text-xs text-gray-400">{event.attendees} asistentes</p>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-3 text-sm" style={{ borderColor: '#ffc526', color: '#ffc526' }}>
              Ver todos los eventos
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MainFeed;