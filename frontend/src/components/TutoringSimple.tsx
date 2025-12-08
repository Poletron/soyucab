import React, { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  Search, 
  Plus,
  GraduationCap,
  MessageSquare,
  Award,
  ThumbsUp
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';

interface Tutor {
  id: string;
  name: string;
  avatar: string;
  school: string;
  subjects: string[];
  recommendedBy: number;
  experience: string;
  description: string;
  status: 'certificado' | 'voluntario';
}

interface MentorConnection {
  id: string;
  subject: string;
  mentorName: string;
  mentorAvatar: string;
  status: 'conectado' | 'pendiente' | 'finalizada';
}

export default function TutoringSimple() {
  const [activeTab, setActiveTab] = useState('find');
  const [searchTerm, setSearchTerm] = useState('');

  // Simplified mock data
  const tutors: Tutor[] = [
    {
      id: '1',
      name: 'Carlos Mendoza',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      school: 'Escuela de Ingeniería',
      subjects: ['Cálculo I', 'Cálculo II', 'Álgebra Lineal'],
      recommendedBy: 45,
      experience: '3 años',
      description: 'Estudiante de Ingeniería Civil con experiencia enseñando matemáticas y física.',
      status: 'certificado'
    },
    {
      id: '2',
      name: 'Ana Rodríguez',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9e09b09?w=150',
      school: 'Escuela de Comunicación Social',
      subjects: ['Redacción', 'Comunicación Oral'],
      recommendedBy: 32,
      experience: '2 años',
      description: 'Egresada de Comunicación Social, especializada en redacción y comunicación digital.',
      status: 'voluntario'
    },
    {
      id: '3',
      name: 'Miguel Torres',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      school: 'Escuela de Administración',
      subjects: ['Contabilidad', 'Finanzas'],
      recommendedBy: 28,
      experience: '4 años',
      description: 'Profesor de Contabilidad y Finanzas con amplia experiencia en el área empresarial.',
      status: 'certificado'
    }
  ];

  const myConnections: MentorConnection[] = [
    {
      id: '1',
      subject: 'Cálculo II',
      mentorName: 'Carlos Mendoza',
      mentorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: 'conectado'
    },
    {
      id: '2',
      subject: 'Marketing Digital',
      mentorName: 'Ana Rodríguez',
      mentorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b9e09b09?w=150',
      status: 'finalizada'
    }
  ];

  const filteredTutors = tutors.filter(tutor => {
    return tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           tutor.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'conectado':
        return <Badge className="bg-blue-100 text-blue-800">✅ Conectado</Badge>;
      case 'pendiente':
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Pendiente</Badge>;
      case 'finalizada':
        return <Badge className="bg-green-100 text-green-800">✓ Finalizada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl" style={{ color: '#12100c' }}>Directorio de Mentores UCAB</h1>
          <p className="text-gray-600 mt-2">
            Conecta con mentores y compañeros para apoyo académico
          </p>
        </div>
        <Button 
          className="flex items-center space-x-2"
          style={{ backgroundColor: '#40b4e5', borderColor: '#40b4e5' }}
        >
          <Plus className="h-4 w-4" />
          <span>Ofrecer Mentoría</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="find" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Buscar Mentores</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Mis Conexiones</span>
          </TabsTrigger>
          <TabsTrigger value="mentor" className="flex items-center space-x-2">
            <GraduationCap className="h-4 w-4" />
            <span>Ser Mentor</span>
          </TabsTrigger>
        </TabsList>

        {/* FIND TUTORS TAB */}
        <TabsContent value="find" className="space-y-6">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" style={{ color: '#40b4e5' }} />
                <span>Buscar Mentores</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Nombre del mentor o materia..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tutors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutors.map((tutor) => (
              <Card key={tutor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={tutor.avatar} />
                      <AvatarFallback>{tutor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{tutor.name}</h3>
                      <p className="text-sm text-gray-600">{tutor.school}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <ThumbsUp className="h-4 w-4" style={{ color: '#40b4e5' }} />
                      <span className="text-sm font-medium">Recomendado por {tutor.recommendedBy} usuarios</span>
                    </div>
                  </div>
                  <Badge 
                    variant={tutor.status === 'certificado' ? 'default' : 'secondary'}
                    style={tutor.status === 'certificado' ? { backgroundColor: '#047732', color: 'white' } : {}}
                  >
                    {tutor.status === 'certificado' ? '🎓 Certificado' : '🤝 Voluntario'}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Materias</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tutor.subjects.map((subject) => (
                        <Badge key={subject} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" style={{ backgroundColor: '#40b4e5', borderColor: '#40b4e5' }}>
                        Ver Perfil
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-3">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={tutor.avatar} />
                            <AvatarFallback>{tutor.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h2 className="text-xl">{tutor.name}</h2>
                            <p className="text-gray-600">{tutor.school}</p>
                          </div>
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                          Perfil completo del mentor {tutor.name}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <ThumbsUp className="h-4 w-4" style={{ color: '#40b4e5' }} />
                            <span>Recomendado por {tutor.recommendedBy} usuarios</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Award className="h-4 w-4 text-blue-600" />
                            <span>{tutor.experience} de experiencia</span>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Descripción</h3>
                          <p className="text-gray-700">{tutor.description}</p>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Materias que enseña</h3>
                          <div className="flex flex-wrap gap-2">
                            {tutor.subjects.map((subject) => (
                              <Badge key={subject} variant="outline">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Button className="w-full" style={{ backgroundColor: '#40b4e5', borderColor: '#40b4e5' }}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Solicitar Mentoría
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTutors.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron mentores</h3>
                <p className="text-gray-600">
                  Intenta ajustar tu búsqueda para encontrar más opciones.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* MY CONNECTIONS TAB */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" style={{ color: '#40b4e5' }} />
                <span>Mis Conexiones de Mentoría</span>
              </CardTitle>
              <CardDescription>
                Gestiona tus conexiones con mentores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myConnections.map((connection) => (
                  <Card key={connection.id} className="border-l-4" style={{ borderLeftColor: connection.status === 'conectado' ? '#40b4e5' : '#047732' }}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={connection.mentorAvatar} />
                            <AvatarFallback>{connection.mentorName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{connection.subject}</h3>
                            <p className="text-sm text-gray-600">con {connection.mentorName}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(connection.status)}
                          {connection.status === 'conectado' && (
                            <Button size="sm" variant="outline">
                              <MessageSquare className="mr-2 h-3 w-3" />
                              Enviar Mensaje
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {myConnections.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes conexiones de mentoría</h3>
                  <p className="text-gray-600 mb-4">
                    Busca mentores y solicita tu primera mentoría.
                  </p>
                  <Button 
                    onClick={() => setActiveTab('find')}
                    style={{ backgroundColor: '#40b4e5', borderColor: '#40b4e5' }}
                  >
                    Buscar Mentores
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* BECOME TUTOR TAB */}
        <TabsContent value="mentor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" style={{ color: '#40b4e5' }} />
                <span>Conviértete en Mentor</span>
              </CardTitle>
              <CardDescription>
                Comparte tu conocimiento y ayuda a otros estudiantes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-8 w-8" style={{ color: '#40b4e5' }} />
                  </div>
                  <h3 className="font-semibold mb-2">Ayuda a Compañeros</h3>
                  <p className="text-sm text-gray-600">
                    Comparte tu experiencia y conocimientos con otros estudiantes
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="h-8 w-8" style={{ color: '#ffc526' }} />
                  </div>
                  <h3 className="font-semibold mb-2">Desarrolla Habilidades</h3>
                  <p className="text-sm text-gray-600">
                    Mejora tus habilidades de comunicación y liderazgo
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="h-8 w-8" style={{ color: '#047732' }} />
                  </div>
                  <h3 className="font-semibold mb-2">Refuerza Conocimientos</h3>
                  <p className="text-sm text-gray-600">
                    Enseñar es la mejor forma de aprender y consolidar conceptos
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Solicitar ser Mentor</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tutorSubjects">Materias que puedes enseñar</Label>
                    <Input
                      id="tutorSubjects"
                      placeholder="Ej: Cálculo I, Física I, Programación..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tutorDescription">Descripción</Label>
                    <Textarea
                      id="tutorDescription"
                      placeholder="Cuéntanos sobre tu experiencia, metodología de enseñanza y por qué quieres ser mentor..."
                      rows={4}
                    />
                  </div>
                </div>

                <Button 
                  className="w-full md:w-auto"
                  style={{ backgroundColor: '#40b4e5', borderColor: '#40b4e5' }}
                >
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Enviar Solicitud
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}