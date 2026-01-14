import { useState, useEffect } from 'react';
import { Users, Calendar, Settings, UserPlus, Image, Lock, Globe, Loader2, LogOut, UserCheck, Heart, MessageCircle, Plus, Trash2, Edit } from 'lucide-react';
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
  getGroupPosts,
  createGroup,
  updateGroup,
  deleteGroup,
  requestJoinGroup,
  getGroupJoinRequests,
  acceptGroupJoinRequest,
  rejectGroupJoinRequest,
  getMyGroupJoinRequestStatus,
  Group,
  GroupJoinRequest
} from '../services/api';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface GroupMember {
  correo_persona: string;
  nombres?: string;
  apellidos?: string;
  rol_en_grupo: string;
  fotografia_url?: string;
}

interface GroupPost {
  clave_contenido: number;
  correo_autor: string;
  fecha_hora_creacion: string;
  texto_contenido: string;
  nombres?: string;
  apellidos?: string;
  fotografia_url?: string;
  total_reacciones?: number;
  total_comentarios?: number;
}

const GroupPage = () => {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupPosts, setGroupPosts] = useState<GroupPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [joining, setJoining] = useState(false);
  const [posting, setPosting] = useState(false);

  // Create/Edit Group Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupVisibility, setNewGroupVisibility] = useState('Público');
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Join Request state
  const [pendingRequests, setPendingRequests] = useState<GroupJoinRequest[]>([]);
  const [myRequestStatus, setMyRequestStatus] = useState<string | null>(null);
  const [requestingJoin, setRequestingJoin] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);

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
      }

      if (myGroupsResult.success) {
        setMyGroups(myGroupsResult.data || []);
        // Solo seleccionar automáticamente si el usuario tiene grupos
        if (myGroupsResult.data?.length > 0 && !selectedGroup) {
          setSelectedGroup(myGroupsResult.data[0]);
        }
      }
    } catch (err) {
      console.error('Error loading groups:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar posts cuando cambia el grupo seleccionado
  useEffect(() => {
    if (selectedGroup) {
      loadGroupPosts(selectedGroup.nombre_grupo);
    } else {
      setGroupPosts([]);
    }
  }, [selectedGroup?.nombre_grupo]);

  const loadGroupPosts = async (nombreGrupo: string) => {
    try {
      setPostsLoading(true);
      const result = await getGroupPosts(nombreGrupo);
      if (result.success) {
        setGroupPosts(result.data || []);
      }
    } catch (err) {
      console.error('Error loading group posts:', err);
    } finally {
      setPostsLoading(false);
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
      // Post asociado al grupo
      await createPost({
        texto: newPost,
        visibilidad: 'Público',
        nombre_grupo: selectedGroup.nombre_grupo
      });
      setNewPost('');
      // Recargar posts del grupo
      loadGroupPosts(selectedGroup.nombre_grupo);
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

  const isGroupCreator = (group: Group) => {
    return group.correo_creador === currentUser?.email;
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      setCreatingGroup(true);
      const result = await createGroup({
        nombre: newGroupName.trim(),
        descripcion: newGroupDesc.trim(),
        visibilidad: newGroupVisibility
      });
      if (result.success) {
        setShowCreateModal(false);
        setNewGroupName('');
        setNewGroupDesc('');
        setNewGroupVisibility('Público');
        loadGroups();
      }
    } catch (err) {
      console.error('Error creating group:', err);
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleEditGroup = async () => {
    if (!selectedGroup) return;
    try {
      setCreatingGroup(true);
      const result = await updateGroup(selectedGroup.nombre_grupo, {
        descripcion: newGroupDesc.trim(),
        visibilidad: newGroupVisibility
      });
      if (result.success) {
        setShowEditModal(false);
        // Update selectedGroup immediately for real-time UI update
        setSelectedGroup(prev => prev ? {
          ...prev,
          descripcion_grupo: newGroupDesc.trim(),
          visibilidad: newGroupVisibility
        } : null);
        loadGroups();
      }
    } catch (err) {
      console.error('Error updating group:', err);
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup || !confirm('¿Estás seguro de eliminar este grupo? Esta acción no se puede deshacer.')) return;
    try {
      const result = await deleteGroup(selectedGroup.nombre_grupo);
      if (result.success) {
        setSelectedGroup(null);
        loadGroups();
      }
    } catch (err) {
      console.error('Error deleting group:', err);
    }
  };

  // ===== Join Request Handlers =====

  const handleRequestJoin = async (groupName: string) => {
    if (requestingJoin) return; // Prevent double click
    try {
      setRequestingJoin(true);
      const result = await requestJoinGroup(groupName);
      if (result.success) {
        setMyRequestStatus('Pendiente');
      }
    } catch (err) {
      console.error('Error requesting join:', err);
    } finally {
      setRequestingJoin(false);
    }
  };

  const loadPendingRequests = async (groupName: string) => {
    try {
      const result = await getGroupJoinRequests(groupName);
      if (result.success) {
        setPendingRequests(result.data || []);
      }
    } catch (err) {
      console.error('Error loading pending requests:', err);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    if (processingRequestId) return;
    try {
      setProcessingRequestId(requestId);
      await acceptGroupJoinRequest(requestId);
      if (selectedGroup) {
        await loadPendingRequests(selectedGroup.nombre_grupo);
        await loadGroups(); // Reload to update member count/list
      }
    } catch (err) {
      console.error('Error accepting request:', err);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    if (processingRequestId) return;
    try {
      setProcessingRequestId(requestId);
      await rejectGroupJoinRequest(requestId);
      if (selectedGroup) {
        await loadPendingRequests(selectedGroup.nombre_grupo);
      }
    } catch (err) {
      console.error('Error rejecting request:', err);
    } finally {
      setProcessingRequestId(null);
    }
  };

  // Helper for safe date formatting
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Fecha desconocida';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return date.toLocaleDateString('es-VE');
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  // Load request status when selecting a group (for non-members)
  useEffect(() => {
    if (selectedGroup && !isMyGroup(selectedGroup.nombre_grupo)) {
      getMyGroupJoinRequestStatus(selectedGroup.nombre_grupo).then(res => {
        setMyRequestStatus(res.data?.estado_solicitud || null);
      });
    } else {
      setMyRequestStatus(null);
    }
  }, [selectedGroup]);

  // Load pending requests for creators/admins
  useEffect(() => {
    if (selectedGroup && isGroupCreator(selectedGroup)) {
      loadPendingRequests(selectedGroup.nombre_grupo);
    } else {
      setPendingRequests([]);
    }
  }, [selectedGroup]);

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
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="font-semibold">Mis Grupos</h3>
              <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogTrigger asChild>
                  <Button size="sm" style={{ backgroundColor: '#40b4e5' }} className="text-white">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Grupo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <Input
                      placeholder="Nombre del grupo"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                    <Textarea
                      placeholder="Descripción (opcional)"
                      value={newGroupDesc}
                      onChange={(e) => setNewGroupDesc(e.target.value)}
                    />
                    <Select value={newGroupVisibility} onValueChange={setNewGroupVisibility}>
                      <SelectTrigger>
                        <SelectValue placeholder="Visibilidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Público">Público</SelectItem>
                        <SelectItem value="Privado">Privado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      className="w-full"
                      style={{ backgroundColor: '#40b4e5' }}
                      onClick={handleCreateGroup}
                      disabled={creatingGroup || !newGroupName.trim()}
                    >
                      {creatingGroup ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Crear Grupo
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
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
                  className="p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedGroup(group)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
                        {group.visibilidad === 'Privado' ? <Lock className="h-4 w-4 text-gray-600" /> : <Users className="h-4 w-4 text-gray-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{group.nombre_grupo}</p>
                        <p className="text-xs text-gray-500">{group.total_miembros || 0} miembros · {group.visibilidad}</p>
                      </div>
                    </div>
                    {group.visibilidad === 'Privado' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); handleRequestJoin(group.nombre_grupo); }}
                        disabled={requestingJoin}
                        title="Solicitar acceso"
                      >
                        {requestingJoin ? <Loader2 className="h-3 w-3 animate-spin" /> : <Lock className="h-3 w-3" />}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); handleJoinGroup(group.nombre_grupo); }}
                        disabled={joining}
                      >
                        {joining ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3" />}
                      </Button>
                    )}
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
                        <>
                          {isGroupCreator(selectedGroup) && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setNewGroupDesc(selectedGroup.descripcion_grupo || '');
                                  setNewGroupVisibility(selectedGroup.visibilidad);
                                  setShowEditModal(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-600"
                                onClick={handleDeleteGroup}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            className="flex items-center space-x-2"
                            onClick={() => handleLeaveGroup(selectedGroup.nombre_grupo)}
                            disabled={joining}
                          >
                            {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                            <span>Salir del Grupo</span>
                          </Button>
                          {/* Pending requests badge for creators of private groups */}
                          {isGroupCreator(selectedGroup) && selectedGroup.visibilidad === 'Privado' && pendingRequests.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowRequestsModal(true)}
                              className="relative"
                            >
                              <UserPlus className="h-4 w-4" />
                              <span className="ml-1">Solicitudes</span>
                              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5">
                                {pendingRequests.length}
                              </Badge>
                            </Button>
                          )}
                        </>
                      ) : (
                        // Non-member view - show join, request, or pending status
                        <>
                          {selectedGroup.visibilidad === 'Privado' ? (
                            // Private group - show request button or pending status
                            myRequestStatus === 'Pendiente' ? (
                              <Button variant="outline" disabled className="flex items-center space-x-2">
                                <Lock className="h-4 w-4" />
                                <span>Solicitud Pendiente</span>
                              </Button>
                            ) : myRequestStatus === 'Rechazada' ? (
                              <Button
                                variant="outline"
                                className="flex items-center space-x-2"
                                onClick={() => handleRequestJoin(selectedGroup.nombre_grupo)}
                                disabled={requestingJoin}
                              >
                                {requestingJoin ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                                <span>Reintentar Solicitud</span>
                              </Button>
                            ) : (
                              <Button
                                style={{ backgroundColor: '#40b4e5' }}
                                className="text-white hover:opacity-90 flex items-center space-x-2"
                                onClick={() => handleRequestJoin(selectedGroup.nombre_grupo)}
                                disabled={requestingJoin}
                              >
                                {requestingJoin ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                                <span>Solicitar Ingreso</span>
                              </Button>
                            )
                          ) : (
                            // Public group - direct join
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
                        </>
                      )}
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

                {/* Group Feed - Posts */}
                {isMyGroup(selectedGroup.nombre_grupo) && (
                  <Card>
                    <CardHeader>
                      <h3 className="font-semibold">Publicaciones del Grupo</h3>
                    </CardHeader>
                    <CardContent>
                      {postsLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                      ) : groupPosts.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay publicaciones en este grupo aún. ¡Sé el primero!</p>
                      ) : (
                        <div className="space-y-4">
                          {groupPosts.map((post) => (
                            <div key={post.clave_contenido} className="border-b pb-4 last:border-0">
                              <div className="flex items-center space-x-3 mb-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={post.fotografia_url || `https://ui-avatars.com/api/?name=${post.nombres || 'U'}`} />
                                  <AvatarFallback>{post.nombres?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">{post.nombres} {post.apellidos}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(post.fecha_hora_creacion).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                              <p className="text-gray-700 ml-11">{post.texto_contenido}</p>
                              <div className="flex items-center space-x-4 mt-2 ml-11 text-sm text-gray-500">
                                <span className="flex items-center"><Heart className="h-4 w-4 mr-1" /> {post.total_reacciones || 0}</span>
                                <span className="flex items-center"><MessageCircle className="h-4 w-4 mr-1" /> {post.total_comentarios || 0}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Group Info */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Información del Grupo</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-500">Creador:</span> {selectedGroup.correo_creador}</p>
                      <p><span className="text-gray-500">Creado:</span> {formatDate(selectedGroup.fecha_creacion)}</p>
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

      {/* Edit Group Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Grupo: {selectedGroup?.nombre_grupo}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Textarea
              placeholder="Descripción"
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
            />
            <Select value={newGroupVisibility} onValueChange={setNewGroupVisibility}>
              <SelectTrigger>
                <SelectValue placeholder="Visibilidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Público">Público</SelectItem>
                <SelectItem value="Privado">Privado</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="w-full"
              style={{ backgroundColor: '#40b4e5' }}
              onClick={handleEditGroup}
              disabled={creatingGroup}
            >
              {creatingGroup ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pending Join Requests Modal */}
      <Dialog open={showRequestsModal} onOpenChange={setShowRequestsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitudes de Ingreso Pendientes</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4 max-h-[400px] overflow-y-auto">
            {pendingRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay solicitudes pendientes</p>
            ) : (
              pendingRequests.map((req) => (
                <div key={req.clave_solicitud} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={req.fotografia_url || `https://ui-avatars.com/api/?name=${req.nombres}`} />
                      <AvatarFallback>{req.nombres?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{req.nombres} {req.apellidos}</p>
                      <p className="text-xs text-gray-500">{req.correo_solicitante}</p>
                      <p className="text-xs text-gray-400">
                        {formatDate(req.fecha_solicitud)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      style={{ backgroundColor: '#10b981' }}
                      className="text-white relative"
                      onClick={() => handleAcceptRequest(req.clave_solicitud)}
                      disabled={processingRequestId === req.clave_solicitud}
                    >
                      {processingRequestId === req.clave_solicitud ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Aceptar'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 relative"
                      onClick={() => handleRejectRequest(req.clave_solicitud)}
                      disabled={processingRequestId === req.clave_solicitud}
                    >
                      {processingRequestId === req.clave_solicitud ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Rechazar'
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupPage;