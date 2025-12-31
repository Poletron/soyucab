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
  Briefcase
} from 'lucide-react';
import { useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './components/ui/dropdown-menu';
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
import soyucabLogo from './assets/33c35295992cfb6178c01246eefc5ecbf6bc76db.png';

// Solo los views necesarios para Entrega 4
type View = 'feed' | 'profile' | 'edit-profile' | 'create' | 'tutoring' | 'groups' | 'messaging' | 'settings' |
  'viral-report' | 'lideres-report' | 'eventos-report' | 'crecimiento-report' | 'grupos-report' |
  'referentes-report' | 'tutorias-report' | 'nexos-report' | 'ofertas-report';
type AuthView = 'login' | 'register';

import { useRole } from './hooks/useRole';

function App() {
  const { isModerator } = useRole();
  // Inicializar estado de autenticación desde localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('userEmail');
  });
  const [authView, setAuthView] = useState<AuthView>('login');
  const [currentView, setCurrentView] = useState<View>('feed');

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // Limpiar localStorage al cerrar sesión
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userFoto');
    localStorage.removeItem('userRoles');
    localStorage.removeItem('userType');
    setIsAuthenticated(false);
    setCurrentView('feed');
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
        return <UserProfile />;
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
      default:
        return <MainFeed />;
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
                  variant={currentView === 'tutoring' ? 'default' : 'ghost'}
                  onClick={() => setCurrentView('tutoring')}
                  className="flex items-center space-x-2"
                  style={{ backgroundColor: currentView === 'tutoring' ? '#40b4e5' : 'transparent' }}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Tutorías</span>
                </Button>
                <Button
                  variant={currentView === 'groups' ? 'default' : 'ghost'}
                  onClick={() => setCurrentView('groups')}
                  className="flex items-center space-x-2"
                  style={{ backgroundColor: currentView === 'groups' ? '#40b4e5' : 'transparent' }}
                >
                  <Users className="h-4 w-4" />
                  <span>Grupos</span>
                </Button>
                <Button
                  variant={currentView === 'messaging' ? 'default' : 'ghost'}
                  onClick={() => setCurrentView('messaging')}
                  className="flex items-center space-x-2"
                  style={{ backgroundColor: currentView === 'messaging' ? '#40b4e5' : 'transparent' }}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Mensajes</span>
                </Button>

                {/* Dropdown de Reportes - Solo los 9 de Entrega 3 */}
                {isModerator && (
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </nav>
            </div>

            {/* Search and User Actions */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar en SoyUCAB..."
                  className="pl-10 w-64 bg-gray-100 border-gray-200"
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentView('messaging')}
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
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
                      <AvatarFallback>U</AvatarFallback>
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