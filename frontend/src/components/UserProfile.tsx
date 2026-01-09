import { useState, useEffect } from 'react';
import { MapPin, Calendar, Edit, MessageSquare, Loader2, UserPlus, Clock, Users, Check, Heart, MessageCircle, X, Save } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  getProfile,
  sendConnectionRequest,
  acceptConnectionRequest,
  startConversation,
  getCurrentUser,
  getUserProfile,
  getUserPosts,
  updatePost
} from '../services/api';

interface ProfileData {
  correo_principal?: string;
  nombre?: string;
  apellido?: string;
  biografia?: string;
  ciudad_residencia?: string;
  pais_residencia?: string;
  fecha_registro?: string;
  fotografia_url?: string;
  total_conexiones?: number;
  total_grupos?: number;
  total_publicaciones?: number;
  tipo?: 'Persona' | 'Organizacion';
  rif?: string;
  entityType?: string;
  estado_conexion?: 'conectado' | 'pendiente_enviada' | 'pendiente_recibida' | 'no_conectado';
  solicitud_id?: number;
}

interface UserProfileProps {
  onNavigate?: (view: string) => void;
  targetEmail?: string; // Email of the user to view (if not current user)
}

const UserProfile = ({ onNavigate, targetEmail }: UserProfileProps) => {
  // Removed useNavigate since we are using state-based routing in App.tsx
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [messaging, setMessaging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit Post State
  const [editingPost, setEditingPost] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [savingPost, setSavingPost] = useState(false);

  const currentUser = getCurrentUser();

  // Determine if viewing own profile
  const isViewingOwnProfile = !targetEmail || targetEmail === currentUser?.email;

  useEffect(() => {
    loadProfile();
  }, [targetEmail]); // Reload when target changes

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      let result;
      if (targetEmail && targetEmail !== currentUser?.email) {
        // Loading another user's profile
        result = await getUserProfile(targetEmail);
      } else {
        // Loading current user's profile
        result = await getProfile();
      }

      console.log('Profile result:', result);

      if (result.success && (result.profile || result.data)) {
        const profileData = result.profile || result.data;
        setProfile({
          correo_principal: profileData.email || profileData.correo_principal,
          nombre: profileData.nombre || profileData.nombres,
          apellido: profileData.apellido || profileData.apellidos,
          biografia: profileData.biografia,
          ciudad_residencia: profileData.ciudad_residencia,
          pais_residencia: profileData.pais_residencia || 'Venezuela',
          fecha_registro: profileData.fecha_registro,
          fotografia_url: profileData.foto || profileData.fotografia_url,
          total_conexiones: profileData.total_conexiones,
          total_grupos: profileData.total_grupos,
          total_publicaciones: profileData.total_publicaciones,
          tipo: profileData.tipo,
          rif: profileData.rif,
          entityType: profileData.tipo_entidad,
          estado_conexion: profileData.estado_conexion,
          solicitud_id: profileData.solicitud_id,
        });

        // Cargar publicaciones del usuario
        const emailToLoad = profileData.email || profileData.correo_principal;
        if (emailToLoad) {
          loadUserPosts(emailToLoad);
        }
      } else {
        setError('No se pudo cargar el perfil');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosts = async (email: string) => {
    try {
      setPostsLoading(true);
      const result = await getUserPosts(email);
      if (result.success) {
        setPosts(result.data || []);
      }
    } catch (err) {
      console.error('Error loading user posts:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!profile?.correo_principal) return;

    try {
      setConnecting(true);

      if (profile.estado_conexion === 'pendiente_recibida' && profile.solicitud_id) {
        // Accept request
        const result = await acceptConnectionRequest(profile.solicitud_id);
        if (result.success) {
          setProfile(prev => prev ? { ...prev, estado_conexion: 'conectado' } : null);
        } else {
          console.error('Accept failed:', result.error);
        }
      } else {
        // Send request
        const result = await sendConnectionRequest(profile.correo_principal);
        if (result.success) {
          setProfile(prev => prev ? { ...prev, estado_conexion: 'pendiente_enviada' } : null);
        } else {
          console.error('Send request failed:', result.error);
        }
      }
    } catch (err) {
      console.error('Error handling connection:', err);
    } finally {
      setConnecting(false);
    }
  };

  const handleMessage = async () => {
    if (!profile?.correo_principal) return;
    try {
      setMessaging(true);
      await startConversation(profile.correo_principal);
      if (onNavigate) onNavigate('messaging');
    } catch (err) {
      console.error('Error starting conversation:', err);
    } finally {
      setMessaging(false);
    }
  };

  const handleEditClick = (post: any) => {
    setEditingPost(post.clave_contenido);
    setEditContent(post.texto_contenido);
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;
    try {
      setSavingPost(true);
      const result = await updatePost(editingPost, editContent);
      if (result.success) {
        setPosts(posts.map(p => p.clave_contenido === editingPost ? { ...p, texto_contenido: editContent } : p));
        setEditingPost(null);
      }
    } catch (err) {
      console.error('Error updating post:', err);
    } finally {
      setSavingPost(false);
    }
  };

  const cancelEdit = () => {
    setEditingPost(null);
    setEditContent('');
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Fecha no disponible';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-VE', { month: 'long', year: 'numeric' });
  };

  const isOwnProfile = isViewingOwnProfile;
  const fullName = profile ? `${profile.nombre || ''} ${profile.apellido || ''}`.trim() : 'Usuario';
  const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="overflow-hidden">
        {/* Cover Photo */}
        <div
          className="h-52 bg-gradient-to-r from-blue-500 to-blue-700 relative"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(64, 180, 229, 0.8) 0%, rgba(41, 128, 185, 0.8) 100%)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        <CardContent className="relative px-6 pb-6">
          {/* Profile Photo */}
          <div className="relative -mt-[6.75rem] mb-4">
            <Avatar className="h-36 w-36 border-4 border-white shadow-lg">
              <AvatarImage src={profile?.fotografia_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&size=144`} />
              <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
            </Avatar>
          </div>

          {/* Profile Info and Actions */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
            <div className="flex-1 mb-4 md:mb-0">
              <div className="flex items-center space-x-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold">{fullName}</h1>
              </div>
              <p className="text-lg md:text-xl text-gray-700 mb-2">
                {profile?.correo_principal || 'Correo no disponible'}
              </p>
              <div className="flex items-center text-gray-500 space-x-1 mb-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">
                  {profile?.ciudad_residencia && profile?.pais_residencia
                    ? `${profile.ciudad_residencia}, ${profile.pais_residencia}`
                    : 'Ubicación no especificada'}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center" style={{ color: '#40b4e5' }}>
                  <Users className="h-4 w-4 mr-1" />
                  {profile?.total_conexiones || 0} conexiones
                </span>
                {profile?.total_grupos !== undefined && (
                  <span className="flex items-center text-purple-600">
                    <Users className="h-4 w-4 mr-1" />
                    {profile.total_grupos} grupos
                  </span>
                )}
                <span className="flex items-center text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  Se unió en {formatDate(profile?.fecha_registro)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {isOwnProfile ? (
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 px-6"
                  onClick={() => onNavigate && onNavigate('edit-profile')}
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar Perfil</span>
                </Button>
              ) : (
                <>
                  <Button
                    style={{
                      backgroundColor: profile?.estado_conexion === 'conectado' ? '#10b981' :
                        profile?.estado_conexion?.startsWith('pendiente') ? '#94a3b8' : '#40b4e5'
                    }}
                    className="text-white hover:opacity-90 px-6 disabled:opacity-70"
                    onClick={handleConnect}
                    disabled={connecting || (profile?.estado_conexion !== 'no_conectado' && profile?.estado_conexion !== 'pendiente_recibida')}
                  >
                    {connecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> :
                      profile?.estado_conexion === 'conectado' ? <Check className="h-4 w-4 mr-2" /> :
                        profile?.estado_conexion === 'pendiente_enviada' ? <Clock className="h-4 w-4 mr-2" /> :
                          <UserPlus className="h-4 w-4 mr-2" />}

                    {profile?.estado_conexion === 'conectado' ? 'Conectado' :
                      profile?.estado_conexion === 'pendiente_enviada' ? 'Pendiente' :
                        profile?.estado_conexion === 'pendiente_recibida' ? 'Aceptar Solicitud' : 'Conectar'}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2 px-6"
                    onClick={handleMessage}
                    disabled={messaging}
                  >
                    {messaging ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                    <span>Mensaje</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* University Info */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#40b4e5' }}>
                  <span className="text-white text-xs font-bold">UCAB</span>
                </div>
                <div>
                  <p className="font-medium">Universidad Católica Andrés Bello</p>
                  <p className="text-sm text-gray-500">Miembro de la comunidad</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p><span className="font-medium">Publicaciones:</span> {profile?.total_publicaciones || 0}</p>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Desde {formatDate(profile?.fecha_registro)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold">{profile?.tipo === 'Organizacion' ? 'Descripción' : 'Acerca de'}</h2>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            {profile?.biografia || 'Sin descripción disponible.'}
          </p>
          {profile?.tipo === 'Organizacion' && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-500">Información Corporativa</p>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <span className="text-xs text-gray-400 block">RIF</span>
                  <span className="text-sm font-medium">{profile.rif || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Tipo Entidad</span>
                  <span className="text-sm font-medium">{profile.entityType || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Posts Section */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold">Publicaciones</h2>
        </CardHeader>
        <CardContent>
          {postsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay publicaciones aún.</p>
          ) : (
            <div className="space-y-4">
              {posts.slice(0, 5).map((post: any) => (
                <div key={post.clave_contenido} className="border-b pb-4 last:border-0">
                  {editingPost === post.clave_contenido ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={savingPost}>
                          <X className="h-4 w-4 mr-1" /> Cancelar
                        </Button>
                        <Button size="sm" onClick={handleSaveEdit} disabled={savingPost}>
                          {savingPost ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                          Guardar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="group flex items-start justify-between gap-2">
                      <p className="text-gray-700 whitespace-pre-wrap flex-1">{post.texto_contenido}</p>
                      {isOwnProfile && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-500 flex-shrink-0 h-8 w-8 p-0"
                          onClick={() => handleEditClick(post)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-400">
                      {post.fecha_hora_creacion ? new Date(post.fecha_hora_creacion).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </p>
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <span className="flex items-center"><Heart className="h-3 w-3 mr-1" /> {post.total_reacciones || 0}</span>
                      <span className="flex items-center"><MessageCircle className="h-3 w-3 mr-1" /> {post.total_comentarios || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;