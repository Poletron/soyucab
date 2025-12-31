import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Edit, MessageSquare, Loader2, UserPlus, Clock, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  getProfile,
  sendConnectionRequest,
  startConversation,
  getCurrentUser
} from '../services/api';

interface ProfileData {
  correo_principal?: string;
  nombres?: string;
  apellidos?: string;
  biografia?: string;
  ciudad_residencia?: string;
  pais_residencia?: string;
  fecha_registro?: string;
  fotografia_url?: string;
  total_conexiones?: number;
  total_publicaciones?: number;
  tipo?: 'Persona' | 'Organizacion';
  rif?: string;
  entityType?: string;
}

const UserProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [messaging, setMessaging] = useState(false);

  const currentUser = getCurrentUser();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const result = await getProfile();
      if (result.success && result.profile) {
        setProfile({
          correo_principal: result.profile.email,
          nombres: result.profile.nombre,
          apellidos: result.profile.apellido,
          biografia: result.profile.biografia,
          ciudad_residencia: result.profile.ubicacion?.split(',')[0],
          pais_residencia: result.profile.ubicacion?.split(',')[1] || result.profile.pais_residencia || 'Venezuela',
          fecha_registro: result.profile.fechaRegistro,
          fotografia_url: result.profile.foto,
          // Org specific
          tipo: result.profile.tipo,
          rif: result.profile.rif,
          entityType: result.profile.tipo_entidad,
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!profile?.correo_principal) return;
    try {
      setConnecting(true);
      await sendConnectionRequest(profile.correo_principal);
    } catch (err) {
      console.error('Error sending connection request:', err);
    } finally {
      setConnecting(false);
    }
  };

  const handleMessage = async () => {
    if (!profile?.correo_principal) return;
    try {
      setMessaging(true);
      await startConversation(profile.correo_principal);
      navigate('/messages');
    } catch (err) {
      console.error('Error starting conversation:', err);
    } finally {
      setMessaging(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Fecha no disponible';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-VE', { month: 'long', year: 'numeric' });
  };

  const isOwnProfile = profile?.correo_principal === currentUser?.email;
  const fullName = profile ? `${profile.nombres || ''} ${profile.apellidos || ''}`.trim() : 'Usuario';
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
                  onClick={() => navigate('/edit-profile')}
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar Perfil</span>
                </Button>
              ) : (
                <>
                  <Button
                    style={{ backgroundColor: '#40b4e5' }}
                    className="text-white hover:opacity-90 px-6"
                    onClick={handleConnect}
                    disabled={connecting}
                  >
                    {connecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                    Conectar
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
    </div>
  );
};

export default UserProfile;