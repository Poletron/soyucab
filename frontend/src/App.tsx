import {
  Users,
  Home,
  Calendar,
  BarChart3,
  MessageSquare,
  Search,
  Bell,
  Settings,
  UserCircle,
  ChevronDown,
  LogOut,
  Edit,
  Plus,
  BookOpen,
  TrendingUp,
  Award,
  Link,
  Briefcase,
  Check
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './components/ui/dropdown-menu';
import { Badge } from './components/ui/badge';
import { ScrollArea } from './components/ui/scroll-area';
import { getNotifications, markNotificationRead, markAllNotificationsRead, Notification } from './services/api';
import MainFeed from './components/MainFeed';
import UserProfile from './components/UserProfile';
import GroupPage from './components/GroupPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import EditProfile from './components/EditProfile';
import CreateContent from './components/CreateContentSimple';
import Tutoring from './components/Tutoring';
import GeneralSettings from './components/GeneralSettings';
import MessagingSystem from './components/MessagingSystem';
import JobBoard from './components/JobBoard';
// Importar los 9 reportes de Entrega 3 (conectados a la BD)
import TopViralReport from './components/TopViralReport';
import LideresReport from './components/LideresReport';
import EventosReport from './components/EventosReport';
import CrecimientoDemograficoReport from './components/CrecimientoDemograficoReport';
import ActiveGroupsReport from './components/ActiveGroupsReport';
import ReferentesReport from './components/ReferentesReport';
import TutoriasReport from './components/TutoriasReport';
import NexosReport from './components/NexosReport';
import OfertasReport from './components/OfertasReport';
import DiasporaReport from './components/DiasporaReport';
import EventsPage from './components/EventsPage';
import soyucabLogo from './assets/33c35295992cfb6178c01246eefc5ecbf6bc76db.png';

// Solo los views necesarios para Entrega 4
type View = 'feed' | 'profile' | 'user-profile' | 'edit-profile' | 'create' | 'tutoring' | 'groups' | 'messaging' | 'settings' | 'events' |
  'viral-report' | 'lideres-report' | 'eventos-report' | 'crecimiento-report' | 'grupos-report' |
  'referentes-report' | 'tutorias-report' | 'nexos-report' | 'ofertas-report' | 'diaspora-report' | 'jobs';
type AuthView = 'login' | 'register';

import { useRole } from './hooks/useRole';

function App() {
  const { isModerator, isAuditor, isOrg } = useRole();
  // Inicializar estado de autenticación desde localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('userEmail');
  });
  const [authView, setAuthView] = useState<AuthView>('login');
  const [currentView, setCurrentView] = useState<View>(() => {
    const saved = localStorage.getItem('currentView');
    return (saved as View) || 'feed';
  });
  const [viewProfileEmail, setViewProfileEmail] = useState<string | null>(() => {
    return localStorage.getItem('viewProfileEmail');
  });

  // Persist view state to localStorage
  useEffect(() => {
    localStorage.setItem('currentView', currentView);
    if (viewProfileEmail) {
      localStorage.setItem('viewProfileEmail', viewProfileEmail);
    } else {
      localStorage.removeItem('viewProfileEmail');
    }
  }, [currentView, viewProfileEmail]);

  // Global Search State
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadNotifications = async () => {
      try {
        const res = await getNotifications();
        if (res.success) {
          setNotifications(res.data);
          setUnreadCount(res.unreadCount);
        }
      } catch (err) {
        console.error('Error loading notifications', err);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleMarkAsRead = async (id: number) => {
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.clave_notificacion === id ? { ...n, leida: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
    setUnreadCount(0);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    // Disparar evento para actualizar roles inmediatamente en toda la app
    window.dispatchEvent(new Event('auth-change'));
  };

  const handleLogout = () => {
    // Limpiar localStorage al cerrar sesión
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userFoto');
    localStorage.removeItem('userRoles');
    localStorage.removeItem('userType');
    setIsAuthenticated(false);
    setIsAuthenticated(false);
    setCurrentView('feed');
    // Disparar evento para limpiar roles inmediatamente
    window.dispatchEvent(new Event('auth-change'));
  };

  const handleRegister = () => {
    setIsAuthenticated(true);
  };

  // Lista de views de reportes para highlight del botón
  const reportViews: View[] = [
    'viral-report', 'lideres-report', 'eventos-report', 'crecimiento-report',
    'grupos-report', 'referentes-report', 'tutorias-report', 'nexos-report', 'ofertas-report'
  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'profile':
        return <UserProfile onNavigate={(view) => setCurrentView(view as View)} />;
      case 'user-profile':
        return <UserProfile
          targetEmail={viewProfileEmail || undefined}
          onNavigate={(view) => setCurrentView(view as View)}
        />;
      case 'edit-profile':
        return <EditProfile />;
      case 'create':
        return <CreateContent />;
      case 'tutoring':
        return <Tutoring />;
      case 'groups':
        return <GroupPage />;
      case 'messaging':
        return <MessagingSystem />;
      case 'settings':
        return <GeneralSettings />;
      case 'events':
        return <EventsPage onNavigate={(view) => setCurrentView(view as View)} />;
      case 'jobs':
        return <JobBoard />;
      // 9 Reportes de Entrega 3 (conectados a la BD)
      case 'viral-report':
        return <TopViralReport />;
      case 'lideres-report':
        return <LideresReport />;
      case 'eventos-report':
        return <EventosReport />;
      case 'crecimiento-report':
        return <CrecimientoDemograficoReport />;
      case 'grupos-report':
        return <ActiveGroupsReport />;
      case 'referentes-report':
        return <ReferentesReport />;
      case 'tutorias-report':
        return <TutoriasReport />;
      case 'nexos-report':
        return <NexosReport />;
      case 'ofertas-report':
        return <OfertasReport />;
      case 'diaspora-report':
        return <DiasporaReport />;
      default:
        return <MainFeed
          onViewProfile={(email) => {
            setViewProfileEmail(email);
            setCurrentView('user-profile');
          }}
          onNavigate={(view) => setCurrentView(view as View)}
        />;
    }
  };

  // Render authentication pages if not authenticated
  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <LoginPage
          onLogin={handleLogin}
          onSwitchToRegister={() => setAuthView('register')}
        />
      );
    } else {
      return (
        <RegisterPage
          onRegister={handleRegister}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentView('feed')}>
                <img src={soyucabLogo} alt="SoyUCAB" className="h-10 w-auto" />
              </div>

              <nav className="hidden md:flex space-x-6">
                <Button
                  variant={currentView === 'feed' ? 'default' : 'ghost'}
                  onClick={() => setCurrentView('feed')}
                  className="flex items-center space-x-2"
                  style={{ backgroundColor: currentView === 'feed' ? '#40b4e5' : 'transparent' }}
                >
                  <Home className="h-4 w-4" />
                  <span>Inicio</span>
                </Button>
                <Button
                  variant={currentView === 'create' ? 'default' : 'ghost'}
                  onClick={() => setCurrentView('create')}
                  className="flex items-center space-x-2"
                  style={{ backgroundColor: currentView === 'create' ? '#40b4e5' : 'transparent' }}
                >
                  <Plus className="h-4 w-4" />
                  <span>Crear</span>
                </Button>
                <Button
                  variant={currentView === 'jobs' ? 'default' : 'ghost'}
                  onClick={() => setCurrentView('jobs')}
                  className="flex items-center space-x-2"
                  style={{ backgroundColor: currentView === 'jobs' ? '#40b4e5' : 'transparent' }}
                >
                  <Briefcase className="h-4 w-4" />
                  <span>Empleos</span>
                </Button>
                {!isOrg && (
                  <Button
                    variant={currentView === 'tutoring' ? 'default' : 'ghost'}
                    onClick={() => setCurrentView('tutoring')}
                    className="flex items-center space-x-2"
                    style={{ backgroundColor: currentView === 'tutoring' ? '#40b4e5' : 'transparent' }}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Tutorías</span>
                  </Button>
                )}
                {!isOrg && (
                  <Button
                    variant={currentView === 'groups' ? 'default' : 'ghost'}
                    onClick={() => setCurrentView('groups')}
                    className="flex items-center space-x-2"
                    style={{ backgroundColor: currentView === 'groups' ? '#40b4e5' : 'transparent' }}
                  >
                    <Users className="h-4 w-4" />
                    <span>Grupos</span>
                  </Button>
                )}
                {!isOrg && (
                  <Button
                    variant={currentView === 'messaging' ? 'default' : 'ghost'}
                    onClick={() => setCurrentView('messaging')}
                    className="flex items-center space-x-2"
                    style={{ backgroundColor: currentView === 'messaging' ? '#40b4e5' : 'transparent' }}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Mensajes</span>
                  </Button>
                )}

                {/* Dropdown de Reportes - Solo los 9 de Entrega 3 */}
                {(isModerator || isAuditor) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant={reportViews.includes(currentView) ? 'default' : 'ghost'}
                        className="flex items-center space-x-2"
                        style={{ backgroundColor: reportViews.includes(currentView) ? '#40b4e5' : 'transparent' }}
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span>Reportes</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64">
                      {/* ... Items ... */}
                      <DropdownMenuItem onClick={() => setCurrentView('viral-report')}>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        <span>Top Contenido Viral</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCurrentView('lideres-report')}>
                        <Users className="mr-2 h-4 w-4" />
                        <span>Líderes de Opinión</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCurrentView('eventos-report')}>
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Proyección Interés Eventos</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCurrentView('crecimiento-report')}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Crecimiento Demográfico</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCurrentView('grupos-report')}>
                        <Users className="mr-2 h-4 w-4" />
                        <span>Grupos Más Activos</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCurrentView('referentes-report')}>
                        <Award className="mr-2 h-4 w-4" />
                        <span>Top Referentes Comunidad</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCurrentView('tutorias-report')}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        <span>Áreas Conocimiento Demanda</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCurrentView('nexos-report')}>
                        <Link className="mr-2 h-4 w-4" />
                        <span>Vigencia Nexos</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCurrentView('ofertas-report')}>
                        <Briefcase className="mr-2 h-4 w-4" />
                        <span>Ofertas Más Postuladas</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCurrentView('diaspora-report')}>
                        <Users className="mr-2 h-4 w-4" />
                        <span>Mapa de la Diáspora</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </nav>
            </div>

            {/* Search and User Actions */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                <Input
                  placeholder="Buscar en SoyUCAB..."
                  className="pl-10 w-64 bg-gray-100 border-gray-200"
                  value={globalSearchQuery}
                  onChange={async (e) => {
                    const query = e.target.value;
                    setGlobalSearchQuery(query);
                    if (query.length >= 2) {
                      try {
                        const { searchUsers } = await import('./services/api');
                        const result = await searchUsers(query);
                        if (result.success) {
                          setGlobalSearchResults(result.data || []);
                          setShowSearchResults(true);
                        }
                      } catch (err) {
                        console.error('Search error:', err);
                      }
                    } else {
                      setGlobalSearchResults([]);
                      setShowSearchResults(false);
                    }
                  }}
                  onFocus={() => globalSearchQuery.length >= 2 && setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                />

                {/* Search Results Dropdown */}
                {showSearchResults && globalSearchResults.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {globalSearchResults.map((user, index) => (
                      <div
                        key={user.correo_principal || index}
                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setViewProfileEmail(user.correo_principal);
                          setCurrentView('user-profile');
                          setGlobalSearchQuery('');
                          setShowSearchResults(false);
                        }}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.fotografia_url || `https://ui-avatars.com/api/?name=${encodeURIComponent((user.nombres || '') + ' ' + (user.apellidos || ''))}`} />
                          <AvatarFallback>{(user.nombres?.[0] || 'U')}</AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <p className="text-sm font-medium">{user.nombres} {user.apellidos}</p>
                          <p className="text-xs text-gray-500">{user.correo_principal}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!isOrg && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentView('messaging')}
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex items-center justify-between px-4 py-2 border-b">
                    <span className="font-semibold">Notificaciones</span>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-auto p-0" onClick={handleMarkAllRead}>
                        Marcar todas leídas
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">No tienes notificaciones</div>
                    ) : (
                      notifications.map(notif => (
                        <DropdownMenuItem key={notif.clave_notificacion} className="cursor-pointer">
                          <div
                            className={`flex-1 ${!notif.leida ? 'bg-blue-50' : ''} p-2 rounded`}
                            onClick={() => {
                              handleMarkAsRead(notif.clave_notificacion);
                              // Navigate based on notification type and url_accion
                              if (notif.url_accion) {
                                if (notif.url_accion.startsWith('/profile/')) {
                                  const email = decodeURIComponent(notif.url_accion.replace('/profile/', ''));
                                  setViewProfileEmail(email);
                                  setCurrentView('user-profile');
                                } else if (notif.url_accion.startsWith('/messages/')) {
                                  setCurrentView('messaging');
                                } else if (notif.url_accion.startsWith('/post/') || notif.url_accion.startsWith('/groups/')) {
                                  // For posts/groups, navigate to feed for now
                                  setCurrentView('feed');
                                }
                              }
                            }}
                          >
                            <p className="text-xs font-bold text-gray-500 mb-1">{notif.tipo_notificacion}</p>
                            <p className="text-sm text-gray-800">{notif.mensaje}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(notif.fecha_creacion).toLocaleDateString()}</p>
                          </div>
                          {!notif.leida && (
                            <div className="ml-2">
                              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            </div>
                          )}
                        </DropdownMenuItem>
                      ))
                    )}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentView('settings')}
              >
                <Settings className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={localStorage.getItem('userFoto') || undefined} />
                      <AvatarFallback>
                        {(localStorage.getItem('userName')?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setCurrentView('profile')}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Mi Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrentView('edit-profile')}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Editar Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrentView('settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;