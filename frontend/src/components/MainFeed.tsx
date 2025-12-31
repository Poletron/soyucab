import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Camera, FileText, Calendar, Users, TrendingUp, Loader2, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { getFeed, createPost, reactToPost, commentOnPost, sendConnectionRequest, getCurrentUser } from '../services/api';
import { useRole } from '../hooks/useRole';

interface Post {
  clave_contenido?: number;
  correo_autor: string;
  fecha_hora_creacion: string;
  texto_contenido: string;
  visibilidad: string;
  tipo_contenido?: string;
  evento_titulo?: string;
  nombres?: string;
  apellidos?: string;
  fotografia_url?: string;
  archivo_url?: string;
  likes_count?: number;
  comments_count?: number;
}

const MainFeed = () => {
  const { isOrg, isVisitor, isModerator } = useRole();
  const [postContent, setPostContent] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUser = getCurrentUser();

  const loadPosts = async () => {
    try {
      setLoading(true);
      const result = await getFeed();
      if (result.success) {
        setPosts(result.data || []);
      }
    } catch (err) {
      console.error('Error loading feed:', err);
      setError('Error cargando el feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;

    setPosting(true);
    try {
      const result = await createPost({ texto: postContent, visibilidad: 'Público' });
      if (result.success) {
        setPostContent('');
        loadPosts(); // Refresh feed
      }
    } catch (err) {
      console.error('Error creating post:', err);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      await reactToPost(postId, 'Me Gusta');
      // Optimistic update
      setPosts(posts.map(p =>
        p.clave_contenido === postId
          ? { ...p, likes_count: (p.likes_count || 0) + 1 }
          : p
      ));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Hace unos minutos';
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffHours < 48) return 'Ayer';
    return date.toLocaleDateString('es-VE');
  };

  // TODO: Fetch from API - GET /api/connections/suggested
  const suggestedConnections = [
    { name: 'Luis Hernández', role: 'Estudiante 6to Semestre', mutualConnections: 12, email: 'luis@ucab.edu.ve' },
    { name: 'Dra. Patricia Morales', role: 'Directora Escuela Informática', mutualConnections: 8, email: 'patricia@ucab.edu.ve' },
    { name: 'Roberto Silva', role: 'Egresado - Ing. Industrial', mutualConnections: 5, email: 'roberto@ucab.edu.ve' }
  ];

  // TODO: Fetch from API - GET /api/events/upcoming
  const upcomingEvents = [
    { name: 'Conferencia de IA', date: 'Nov 20, 2024', attendees: 156 },
    { name: 'Feria de Empleo UCAB', date: 'Dic 5, 2024', attendees: 234 },
    { name: 'Workshop de Blockchain', date: 'Dic 12, 2024', attendees: 89 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar>
                <AvatarImage src={currentUser?.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'U')}`} />
                <AvatarFallback>{currentUser?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{currentUser?.name || 'Mi Perfil'}</p>
                <p className="text-sm text-gray-500">Ver perfil</p>
              </div>
            </div>
            {/* TODO: Fetch from API - user stats endpoint */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Conexiones</span>
                <span className="font-medium">--</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Grupos</span>
                <span className="font-medium">--</span>
              </div>
            </div>
          </CardContent>
        </Card>

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
        {!isVisitor && (
          <Card>
            <CardContent className="p-4">
              <div className="flex space-x-3">
                <Avatar>
                  <AvatarImage src={currentUser?.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'U')}`} />
                  <AvatarFallback>{currentUser?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder={isOrg ? "Publica una actualización corporativa o vacante..." : "¿Qué estás pensando?"}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="resize-none border-0 shadow-none text-lg placeholder:text-gray-400 min-h-[60px]"
                  />
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex space-x-2">
                      {isOrg ? (
                        <>
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                            <FileText className="h-4 w-4 mr-1" />
                            Oferta
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                            <Calendar className="h-4 w-4 mr-1" />
                            Evento
                          </Button>
                        </>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>
                    <Button
                      style={{ backgroundColor: '#ffc526' }}
                      className="text-white hover:opacity-90"
                      disabled={!postContent.trim() || posting}
                      onClick={handleCreatePost}
                    >
                      {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Publicar'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Refresh Button */}
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={loadPosts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Cargando...' : 'Actualizar feed'}
          </Button>
        </div>

        {/* Error */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 text-red-600">{error}</CardContent>
          </Card>
        )}

        {/* Posts from API */}
        {posts.length === 0 && !loading && (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No hay publicaciones aún. ¡Sé el primero en publicar!
            </CardContent>
          </Card>
        )}

        {posts.map((post, index) => (
          <Card key={post.clave_contenido || index}>
            <CardContent className="p-4">
              {/* Post Header */}
              <div className="flex items-start space-x-3 mb-4">
                <Avatar>
                  <AvatarImage src={post.fotografia_url || `https://ui-avatars.com/api/?name=${encodeURIComponent((post.nombres || '') + ' ' + (post.apellidos || ''))}`} />
                  <AvatarFallback>{(post.nombres?.[0] || post.correo_autor?.[0])?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{post.nombres || post.correo_autor}</p>
                  <p className="text-sm text-gray-500">{post.tipo_contenido === 'EVENTO' ? '📅 Evento' : 'Publicación'}</p>
                  <p className="text-xs text-gray-400">{formatDate(post.fecha_hora_creacion)}</p>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                {post.evento_titulo && (
                  <p className="font-semibold text-lg mb-2">{post.evento_titulo}</p>
                )}
                <p className="whitespace-pre-line">{post.texto_contenido}</p>
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-red-600"
                    onClick={() => post.clave_contenido && handleLike(post.clave_contenido)}
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    {post.likes_count || 0}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {post.comments_count || 0}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-green-600">
                    <Share2 className="h-4 w-4 mr-1" />
                    Compartir
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
        {!isOrg && (
          <Card>
            <CardHeader className="pb-3">
              <h3>Personas que quizás conozcas</h3>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                {suggestedConnections.map((person, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} />
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
                        onClick={() => sendConnectionRequest(person.email)}
                      >
                        Conectar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Moderator Panel */}
        {isModerator && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <h3 className="text-blue-800 font-semibold">Panel de Moderación</h3>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Ver Reportes
              </Button>
            </CardContent>
          </Card>
        )}

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