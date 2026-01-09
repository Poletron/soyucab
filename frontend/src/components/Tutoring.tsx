import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Users,
  Search,
  Filter,
  Plus,
  GraduationCap,
  MessageSquare,
  Award,
  ThumbsUp,
  Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { searchTutors, getMyMentorships, requestMentorship, registerAsTutor, getCurrentUser } from '../services/api';

/* Interfaces updated to match API */
interface Tutor {
  clave_tutoria: number;
  correo_tutor: string;
  nombres: string;
  apellidos: string;
  fotografia_url: string;
  area_conocimiento: string;
  descripcion_enfoque: string;
  active_students: number;
}

interface MentorConnection {
  clave_solicitud: number;
  area_conocimiento: string;
  other_name: string;
  other_lastname: string;
  other_photo: string;
  estado: 'Enviada' | 'Aceptada' | 'Rechazada' | 'Completada';
  my_role: 'Mentor' | 'Mentoreado';
}

export default function Tutoring() {
  const [activeTab, setActiveTab] = useState('find');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [myConnections, setMyConnections] = useState<MentorConnection[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [tutorFormData, setTutorFormData] = useState({
    subjects: '',
    experience: '1-2', // Default value
    description: ''
  });
  const [registering, setRegistering] = useState(false);

  const currentUser = getCurrentUser();

  const subjects = [
    'Calculo I', 'Calculo II', 'Algebra Lineal', 'Fisica I', 'Fisica II',
    'Contabilidad', 'Finanzas', 'Estadística', 'Programación', 'Marketing Digital'
  ];

  /* Load Tutors */
  const loadTutors = async () => {
    setLoading(true);
    try {
      const result = await searchTutors(searchTerm, selectedSubject);
      if (result.success) {
        setTutors(result.data || []);
      }
    } catch (err) {
      console.error('Error loading tutors:', err);
    } finally {
      setLoading(false);
    }
  };

  /* Load Connections */
  const loadConnections = async () => {
    try {
      const result = await getMyMentorships();
      if (result.success) {
        setMyConnections(result.data || []);
      }
    } catch (err) {
      console.error('Error loading connections:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'find') {
      const timer = setTimeout(() => loadTutors(), 500); // Debounce
      return () => clearTimeout(timer);
    } else if (activeTab === 'sessions') {
      loadConnections();
    }
  }, [activeTab, searchTerm, selectedSubject]);

  // New state to track requests made in this session
  const [sessionRequests, setSessionRequests] = useState<Set<number>>(new Set());

  const handleRequestMentorship = async (tutoriaId: number) => {
    try {
      setSessionRequests(prev => new Set(prev).add(tutoriaId)); // Optimistic update
      const result = await requestMentorship(tutoriaId);
      if (result.success) {
        alert('Solicitud enviada correctamente');
        loadTutors();
      }
    } catch (err: any) {
      setSessionRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(tutoriaId);
        return newSet;
      });
      alert(err.message || 'Error al solicitar mentoría');
    }
  };

  const handleRegisterTutor = async () => {
    if (!tutorFormData.subjects || !tutorFormData.description) {
      alert('Por favor completa todos los campos');
      return;
    }

    setRegistering(true);
    try {
      const result = await registerAsTutor({
        subjects: tutorFormData.subjects,
        experience: tutorFormData.experience,
        description: tutorFormData.description
      });

      if (result.success) {
        alert('Te has registrado como mentor exitosamente');
        setTutorFormData({ subjects: '', experience: '1-2', description: '' });
        setActiveTab('sessions');
      }
    } catch (err: any) {
      alert(err.message || 'Error al registrarse como tutor');
    } finally {
      setRegistering(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aceptada':
        return <Badge className="bg-blue-100 text-blue-800">✅ Conectado</Badge>;
      case 'Enviada':
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Pendiente</Badge>;
      case 'Completada':
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
          onClick={() => setActiveTab('mentor')}
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
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" style={{ color: '#40b4e5' }} />
                <span>Buscar Mentores</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Nombre del mentor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Materia</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las materias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las materias</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={`filter-${subject}`} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tutors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              </div>
            ) : (
              tutors.length > 0 ? (
                tutors.map((tutor) => (
                  <Card key={tutor.clave_tutoria} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={tutor.fotografia_url} />
                          <AvatarFallback>{tutor.nombres.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">{tutor.nombres} {tutor.apellidos}</h3>
                          <p className="text-sm text-gray-600">{tutor.area_conocimiento}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 mb-2">
                        <Users className="h-4 w-4" style={{ color: '#40b4e5' }} />
                        <span className="text-sm font-medium">{tutor.active_students || 0} estudiantes activos</span>
                      </div>

                    </CardHeader>

                    <CardContent className="space-y-4">
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
                                <AvatarImage src={tutor.fotografia_url} />
                                <AvatarFallback>{tutor.nombres.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h2 className="text-xl">{tutor.nombres} {tutor.apellidos}</h2>
                                <p className="text-gray-600">{tutor.area_conocimiento}</p>
                              </div>
                            </DialogTitle>
                            <DialogDescription>
                              Perfil de mentor
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-6">
                            <div>
                              <h3 className="font-semibold mb-2">Descripción</h3>
                              <p className="text-gray-700">{tutor.descripcion_enfoque}</p>
                            </div>

                            <Button
                              className="w-full"
                              style={{
                                backgroundColor: sessionRequests.has(tutor.clave_tutoria) ? '#fbbf24' : '#40b4e5',
                                borderColor: sessionRequests.has(tutor.clave_tutoria) ? '#fbbf24' : '#40b4e5'
                              }}
                              onClick={() => handleRequestMentorship(tutor.clave_tutoria)}
                              disabled={sessionRequests.has(tutor.clave_tutoria)}
                            >
                              {sessionRequests.has(tutor.clave_tutoria) ? (
                                <>
                                  <Clock className="mr-2 h-4 w-4" />
                                  Solicitado
                                </>
                              ) : (
                                <>
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  Solicitar Mentoría
                                </>
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron mentores</h3>
                  <p className="text-gray-600">Intenta ajustar tus filtros.</p>
                </div>
              )
            )}
          </div>
        </TabsContent>

        {/* MY CONNECTIONS TAB */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" style={{ color: '#40b4e5' }} />
                <span>Mis Conexiones de Mentoría</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myConnections.map((connection) => (
                  <Card key={connection.clave_solicitud} className="border-l-4" style={{ borderLeftColor: connection.estado === 'Aceptada' ? '#40b4e5' : connection.estado === 'Enviada' ? '#ffc526' : '#047732' }}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={connection.other_photo} />
                            <AvatarFallback>{connection.other_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{connection.area_conocimiento}</h3>
                            <p className="text-sm text-gray-600">{connection.my_role}: {connection.other_name} {connection.other_lastname}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(connection.estado)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {myConnections.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes conexiones de mentoría</h3>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* BECOME MENTOR TAB */}
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

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tutorSubjects">Materias que puedes enseñar</Label>
                  <Select
                    value={tutorFormData.subjects}
                    onValueChange={(value: string) => setTutorFormData(prev => ({ ...prev, subjects: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una materia" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experiencia (años)</Label>
                  <Select
                    value={tutorFormData.experience}
                    onValueChange={(value: string) => setTutorFormData(prev => ({ ...prev, experience: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Años de experiencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">Menos de 1 año</SelectItem>
                      <SelectItem value="1-2">1-2 años</SelectItem>
                      <SelectItem value="2-3">2-3 años</SelectItem>
                      <SelectItem value="3+">Más de 3 años</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tutorDescription">Descripción</Label>
                  <Textarea
                    id="tutorDescription"
                    placeholder="Cuéntanos sobre tu experiencia..."
                    rows={4}
                    value={tutorFormData.description}
                    onChange={(e: any) => setTutorFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <Button
                  className="w-full md:w-auto"
                  style={{ backgroundColor: '#40b4e5', borderColor: '#40b4e5' }}
                  onClick={handleRegisterTutor}
                  disabled={registering}
                >
                  {registering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GraduationCap className="mr-2 h-4 w-4" />}
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