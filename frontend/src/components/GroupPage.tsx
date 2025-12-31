import { useState, useEffect } from 'react';
import { Users, Calendar, Settings, UserPlus, Bell, Image, Lock, Globe, Loader2, LogOut, UserCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import {
  getGroups,
  getMyGroups,
  joinGroup,
  leaveGroup,
  createPost,
  getCurrentUser,
  Group
} from '../services/api';

interface GroupMember {
  correo_persona: string;
  nombres?: string;
  apellidos?: string;
  rol_en_grupo: string;
  fotografia_url?: string;
}

const GroupPage = () => {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [newPost, setNewPost] = useState('');
  const [joining, setJoining] = useState(false);
  const [posting, setPosting] = useState(false);

  const currentUser = getCurrentUser();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const [allGroupsResult, myGroupsResult] = await Promise.all([
        getGroups(),
        getMyGroups()
      ]);

      if (allGroupsResult.success) {
        setGroups(allGroupsResult.data || []);
        if (allGroupsResult.data?.length > 0 && !selectedGroup) {
          setSelectedGroup(allGroupsResult.data[0]);
        }
      }

      if (myGroupsResult.success) {
        setMyGroups(myGroupsResult.data || []);
      }
    } catch (err) {
      console.error('Error loading groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupName: string) => {
    try {
      setJoining(true);
      const result = await joinGroup(groupName);
      if (result.success) {
        loadGroups();
      }
    } catch (err) {
      console.error('Error joining group:', err);
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveGroup = async (groupName: string) => {
    try {
      setJoining(true);
      const result = await leaveGroup(groupName);
      if (result.success) {
        loadGroups();
      }
    } catch (err) {
      console.error('Error leaving group:', err);
    } finally {
      setJoining(false);
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() || !selectedGroup) return;
    try {
      setPosting(true);
      // Posts in groups would need a group association - for now just create a regular post
      await createPost({ texto: newPost, visibilidad: 'Público' });
      setNewPost('');
    } catch (err) {
      console.error('Error posting:', err);
    } finally {
      setPosting(false);
    }
  };

  const getPrivacyIcon = (visibility: string) => {
    return visibility === 'Privado' ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />;
  };

  const getPrivacyLabel = (visibility: string) => {
    return visibility === 'Privado' ? 'Grupo privado' : 'Grupo público';
  };

  const isMyGroup = (groupName: string) => {
    return myGroups.some(g => g.nombre_grupo === groupName);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Group List / Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Groups Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Mis Grupos</h3>
            </CardHeader>
            <CardContent className="space-y-2">
              {myGroups.length === 0 ? (
                <p className="text-sm text-gray-500">No perteneces a ningún grupo</p>
              ) : (
                myGroups.map((group) => (
                  <div
                    key={group.nombre_grupo}
                    onClick={() => setSelectedGroup(group)}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${selectedGroup?.nombre_grupo === group.nombre_grupo ? 'bg-blue-50 border border-blue-200' : ''
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#40b4e5' }}>
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{group.nombre_grupo}</p>
                        <p className="text-xs text-gray-500">{group.total_miembros || 0} miembros</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Descubrir Grupos</h3>
            </CardHeader>
            <CardContent className="space-y-2">
              {groups.filter(g => !isMyGroup(g.nombre_grupo)).slice(0, 5).map((group) => (
                <div
                  key={group.nombre_grupo}
                  className="p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
                        <Users className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{group.nombre_grupo}</p>
                        <p className="text-xs text-gray-500">{group.total_miembros || 0} miembros</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleJoinGroup(group.nombre_grupo)}
                      disabled={joining}
                    >
                      {joining ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Selected Group Content */}
        <div className="lg:col-span-2">
          {selectedGroup ? (
            <>
              {/* Group Header */}
              <Card className="overflow-hidden">
                <div
                  className="h-32 bg-gradient-to-r from-blue-500 to-blue-700 relative"
                  style={{
                    backgroundImage: `linear-gradient(135deg, rgba(64, 180, 229, 0.8) 0%, rgba(41, 128, 185, 0.8) 100%)`,
                  }}
                />
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div className="flex-1 mb-4 md:mb-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h1 className="text-2xl font-bold">{selectedGroup.nombre_grupo}</h1>
                        {getPrivacyIcon(selectedGroup.visibilidad)}
                      </div>
                      <p className="text-gray-600 mb-3 max-w-xl">{selectedGroup.descripcion_grupo || 'Sin descripción'}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{selectedGroup.total_miembros || 0} miembros</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getPrivacyIcon(selectedGroup.visibilidad)}
                          <span>{getPrivacyLabel(selectedGroup.visibilidad)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      {isMyGroup(selectedGroup.nombre_grupo) ? (
                        <Button
                          variant="outline"
                          className="flex items-center space-x-2"
                          onClick={() => handleLeaveGroup(selectedGroup.nombre_grupo)}
                          disabled={joining}
                        >
                          {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                          <span>Salir del Grupo</span>
                        </Button>
                      ) : (
                        <Button
                          style={{ backgroundColor: '#40b4e5' }}
                          className="text-white hover:opacity-90 flex items-center space-x-2"
                          onClick={() => handleJoinGroup(selectedGroup.nombre_grupo)}
                          disabled={joining}
                        >
                          {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                          <span>Unirse al Grupo</span>
                        </Button>
                      )}
                      <Button variant="outline" size="icon">
                        <Bell className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Group Content */}
              <div className="mt-6 space-y-4">
                {/* Create Post */}
                {isMyGroup(selectedGroup.nombre_grupo) && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex space-x-3">
                        <Avatar>
                          <AvatarImage src={currentUser?.foto || `https://ui-avatars.com/api/?name=${currentUser?.name || 'U'}`} />
                          <AvatarFallback>{currentUser?.name?.[0] || 'U'}</AvatarFallback>
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
                              style={{ backgroundColor: '#40b4e5' }}
                              className="text-white hover:opacity-90"
                              disabled={!newPost.trim() || posting}
                              onClick={handlePost}
                            >
                              {posting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                              Publicar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Group Info */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Información del Grupo</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-500">Creador:</span> {selectedGroup.correo_creador}</p>
                      <p><span className="text-gray-500">Creado:</span> {new Date(selectedGroup.fecha_creacion).toLocaleDateString('es-VE')}</p>
                      <p><span className="text-gray-500">Visibilidad:</span> {selectedGroup.visibilidad}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Selecciona un grupo para ver su contenido</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupPage;