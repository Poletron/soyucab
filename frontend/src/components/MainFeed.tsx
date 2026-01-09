import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, Camera, FileText, Calendar, Users, TrendingUp, Loader2, RefreshCw, Send, X, Image as ImageIcon, UserPlus, Briefcase } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { getFeed, createPost, reactToPost, removeReaction, commentOnPost, getComments, sendConnectionRequest, getCurrentUser, getUserStats, getConnectionSuggestions, getUpcomingEvents, uploadImage } from '../services/api';
import { useRole } from '../hooks/useRole';

// URL base del backend para resolver paths relativos de imágenes
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper para resolver URLs de imágenes que vienen como paths relativos
const getImageUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  // Si ya es URL absoluta, retornar tal cual
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Si es path relativo del backend, agregar base URL
  return `${API_BASE_URL}${url}`;
};

interface Comment {
  clave_comentario: number;
  texto_comentario: string;
  fecha_hora_comentario: string;
  correo_autor_comentario: string;
  nombres?: string;
  apellidos?: string;
  fotografia_url?: string;
}

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
  user_has_reacted?: boolean;
}

interface MainFeedProps {
  onViewProfile?: (email: string) => void;
  onNavigate?: (view: string) => void;
}

const MainFeed = ({ onViewProfile, onNavigate }: MainFeedProps) => {
  const { isOrg, isVisitor, isModerator } = useRole();
  const [postContent, setPostContent] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<{ total_conexiones: number; total_grupos: number; total_publicaciones: number } | null>(null);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comments state
  const [activePostId, setActivePostId] = useState<number | null>(null);
  const [currentComments, setCurrentComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  // Image modal state
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

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

  const loadStats = async () => {
    try {
      const result = await getUserStats();
      if (result.success && result.stats) {
        setUserStats(result.stats);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  useEffect(() => {
    loadPosts();
    loadStats();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() && !selectedFile) return;

    setPosting(true);
    try {
      let imageUrl = undefined;

      if (selectedFile) {
        const uploadResult = await uploadImage(selectedFile);
        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url;
        } else {
          throw new Error('Error al subir imagen');
        }
      }

      const result = await createPost({
        texto: postContent,
        visibilidad: 'Público',
        archivo_url: imageUrl
      });

      if (result.success) {
        setPostContent('');
        clearFile();
        loadPosts(); // Refresh feed
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Error al crear la publicación');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: number, postAuthor: string, hasReacted: boolean) => {
    // Prevent self-reactions
    if (postAuthor === currentUser?.email) {
      alert('No puedes reaccionar a tu propia publicación');
      return;
    }

    try {
      if (hasReacted) {
        // Remove reaction
        await removeReaction(postId);
      } else {
        // Add reaction
        await reactToPost(postId, 'Me Gusta');
      }
      // Reload feed to get updated counts and reaction status
      await loadPosts();
    } catch (err: any) {
      console.error('Error toggling reaction:', err);
      if (err.message?.includes('Auto-Like prohibido') || err.message?.includes('propio contenido')) {
        alert('No puedes reaccionar a tu propia publicación');
      } else {
        alert('Error al reaccionar. Intenta de nuevo.');
      }
    }
  };

  const handleCommentClick = async (postId: number) => {
    if (activePostId === postId) {
      setActivePostId(null);
      return;
    }

    setActivePostId(postId);
    setLoadingComments(true);
    try {
      const result = await getComments(postId);
      if (result.success) {
        setCurrentComments(result.data || []);
      }
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async (postId: number) => {
    if (!commentText.trim()) return;

    try {
      const result = await commentOnPost(postId, commentText);
      if (result.success) {
        setCommentText('');
        // Refresh comments
        const commentsResult = await getComments(postId);
        if (commentsResult.success) {
          setCurrentComments(commentsResult.data || []);
        }
        // Refresh post list (to update comment count)
        loadPosts();
      }
    } catch (err) {
      console.error('Error posting comment:', err);
      alert('Error al publicar comentario');
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

  // Connection suggestions state
  interface Suggestion {
    correo_principal: string;
    nombres: string;
    apellidos?: string;
    fotografia_url?: string;
    conexiones_comunes?: number;
    status?: 'sent' | 'none';
  }
  const [suggestedConnections, setSuggestedConnections] = useState<Suggestion[]>([]);

  const loadSuggestions = async () => {
    try {
      const result = await getConnectionSuggestions();
      if (result.success && result.data) {
        setSuggestedConnections(result.data);
      }
    } catch (err) {
      console.error('Error loading suggestions:', err);
    }
  };

  useEffect(() => {
    loadSuggestions();
    loadEvents();
  }, []);

  interface Event {
    clave_evento: number;
    titulo: string;
    fecha_inicio: string;
  }
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  const loadEvents = async () => {
    try {
      const result = await getUpcomingEvents();
      if (result.success && result.data) {
        setUpcomingEvents(result.data.slice(0, 3));
      }
    } catch (err) {
      console.error('Error loading events:', err);
    }
  };


  /* Share Handler */
  const handleShare = async (post: Post) => {
    const shareData = {
      title: post.evento_titulo || 'Publicación en SoyUCAB',
      text: post.texto_contenido,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`);
        alert('Enlace copiado al portapapeles');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <>
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
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Conexiones</span>
                  <span className="font-medium">{userStats?.total_conexiones ?? '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Grupos</span>
                  <span className="font-medium">{userStats?.total_grupos ?? '--'}</span>
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
                {!isOrg && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-2 h-auto"
                    onClick={() => onNavigate && onNavigate('groups')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Mis Grupos
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start p-2 h-auto"
                  onClick={() => onNavigate && onNavigate('jobs')}
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Bolsa de Trabajo
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-2 h-auto"
                  onClick={() => onNavigate && onNavigate('profile')}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Mi Perfil
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
                    {/* Hidden File Input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      className="hidden"
                    />

                    {/* Preview Image */}
                    {previewUrl && (
                      <div className="relative mb-3 inline-block">
                        <img src={previewUrl} alt="Preview" className="h-20 w-auto rounded-md object-cover border" />
                        <button
                          onClick={clearFile}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}

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
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:text-gray-800"
                              onClick={() => fileInputRef.current?.click()}
                            >
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
                        disabled={(!postContent.trim() && !selectedFile) || posting}
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
                  <Avatar
                    className="cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all"
                    onClick={() => onViewProfile && onViewProfile(post.correo_autor)}
                  >
                    <AvatarImage src={getImageUrl(post.fotografia_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent((post.nombres || '') + ' ' + (post.apellidos || ''))}`} />
                    <AvatarFallback>{(post.nombres?.[0] || post.correo_autor?.[0])?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p
                      className="font-medium cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                      onClick={() => onViewProfile && onViewProfile(post.correo_autor)}
                    >
                      {post.nombres || post.correo_autor}
                    </p>
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
                  {post.archivo_url && (
                    <div
                      className="mt-3 rounded-lg overflow-hidden border border-gray-100 cursor-pointer"
                      onClick={() => setSelectedImageUrl(getImageUrl(post.archivo_url) || null)}
                    >
                      <img
                        src={getImageUrl(post.archivo_url)}
                        alt="Contenido"
                        className="w-full max-h-[500px] object-cover hover:opacity-95 transition-opacity"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={post.user_has_reacted ? "text-red-600" : "text-gray-600 hover:text-red-600"}
                      onClick={() => post.clave_contenido && handleLike(post.clave_contenido, post.correo_autor, post.user_has_reacted || false)}
                    >
                      <Heart className={`h-4 w-4 mr-1 ${post.user_has_reacted ? 'fill-red-600' : ''}`} />
                      {Number(post.likes_count) || 0}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-blue-600"
                      onClick={() => post.clave_contenido && handleCommentClick(post.clave_contenido)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post.comments_count || 0}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-green-600"
                      onClick={() => handleShare(post)}
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Compartir
                    </Button>
                  </div>
                </div>

                {/* Comments Section */}
                {activePostId === post.clave_contenido && (
                  <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50 -mx-4 -mb-4 p-4">
                    {loadingComments ? (
                      <div className="flex justify-center p-2"><Loader2 className="h-4 w-4 animate-spin text-gray-500" /></div>
                    ) : (
                      <div className="space-y-4">
                        {/* Comments List */}
                        {currentComments.length > 0 ? (
                          <div className="space-y-3 mb-4">
                            {currentComments.map((comment) => (
                              <div key={comment.clave_comentario} className="flex space-x-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={getImageUrl(comment.fotografia_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent((comment.nombres || '') + ' ' + (comment.apellidos || ''))}`} />
                                  <AvatarFallback>{(comment.nombres?.[0] || 'U')}</AvatarFallback>
                                </Avatar>
                                <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm flex-1">
                                  <div className="flex justify-between items-start">
                                    <p className="text-xs font-semibold text-gray-900">
                                      {comment.nombres} {comment.apellidos}
                                    </p>
                                    <span className="text-xs text-gray-400">{formatDate(comment.fecha_hora_comentario)}</span>
                                  </div>
                                  <p className="text-sm text-gray-700 mt-1">{comment.texto_comentario}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-center text-gray-400 py-2">Sé el primero en comentar</p>
                        )}

                        {/* Comment Input */}
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={currentUser?.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'U')}`} />
                            <AvatarFallback>{currentUser?.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 relative">
                            <Input
                              placeholder="Escribe un comentario..."
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  post.clave_contenido && handleSubmitComment(post.clave_contenido);
                                }
                              }}
                              className="pr-10"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="absolute right-1 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 hover:bg-transparent p-1 h-auto"
                              onClick={() => post.clave_contenido && handleSubmitComment(post.clave_contenido)}
                              disabled={!commentText.trim()}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
                  {suggestedConnections.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay sugerencias disponibles</p>
                  ) : suggestedConnections.map((person, index) => {
                    const fullName = `${person.nombres || ''} ${person.apellidos || ''}`.trim() || 'Usuario';
                    return (
                      <div key={index} className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={person.fotografia_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}`} />
                          <AvatarFallback>{fullName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{fullName}</p>
                          <p className="text-xs text-gray-400">{person.conexiones_comunes || 0} conexiones en común</p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 text-xs h-6"
                            style={{
                              borderColor: person.status === 'sent' ? '#e2e8f0' : '#40b4e5',
                              color: person.status === 'sent' ? '#94a3b8' : '#40b4e5',
                              backgroundColor: person.status === 'sent' ? '#f1f5f9' : 'transparent'
                            }}
                            disabled={person.status === 'sent'}
                            onClick={async () => {
                              try {
                                await sendConnectionRequest(person.correo_principal);
                                setSuggestedConnections(prev =>
                                  prev.map(p => p.correo_principal === person.correo_principal ? { ...p, status: 'sent' } : p)
                                );
                              } catch (err) {
                                console.error('Error connecting:', err);
                              }
                            }}
                          >
                            {person.status === 'sent' ? 'Pendiente' : 'Conectar'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
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
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay eventos próximos</p>
                ) : upcomingEvents.map((event, index) => (
                  <div
                    key={event.clave_evento || index}
                    className="border-l-2 pl-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-r py-1"
                    style={{ borderColor: '#ffc526' }}
                    onClick={() => onNavigate && onNavigate('events')}
                  >
                    <p className="text-sm font-medium">{event.titulo}</p>
                    <p className="text-xs text-gray-500">{event.fecha_inicio ? formatDate(event.fecha_inicio) : 'Fecha no disponible'}</p>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full mt-3 text-sm"
                style={{ borderColor: '#ffc526', color: '#ffc526' }}
                onClick={() => onNavigate && onNavigate('events')}
              >
                Ver todos los eventos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImageUrl(null)}
        >
          {/* Close button - always visible */}
          <button
            className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/40 rounded-full p-2 transition-colors"
            onClick={() => setSelectedImageUrl(null)}
          >
            <X className="h-6 w-6 text-white" />
          </button>

          {/* Image container */}
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImageUrl}
              alt="Imagen ampliada"
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Click anywhere hint */}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            Click fuera de la imagen o presiona X para cerrar
          </p>
        </div>
      )}
    </>
  );
};

export default MainFeed;