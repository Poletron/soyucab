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
  PenTool,
  MapPin,
  Building2,
  Activity,
  UsersRound,
  TrendingUp
} from 'lucide-react';
import { useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './components/ui/dropdown-menu';
import MainFeed from './components/MainFeed';
import UserProfile from './components/UserProfile';
import GroupPage from './components/GroupPage';
import EventsReport from './components/EventsReport';
import CommunityGrowthReport from './components/CommunityGrowthReport';
import GraduateSkillsReport from './components/GraduateSkillsReport';
import ContentInteractionReport from './components/ContentInteractionReport';
import TopViralReport from './components/TopViralReport';
import LideresReport from './components/LideresReport';
import EventosReport from './components/EventosReport';
import ActiveGroupsReport from './components/ActiveGroupsReport';
import GraduateDiasporaReport from './components/GraduateDiasporaReport';
import CompanyUniversityLinkReport from './components/CompanyUniversityLinkReport';
import CommunityHealthReport from './components/CommunityHealthReport';
import StudentGroupsReport from './components/StudentGroupsReport';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import EditProfile from './components/EditProfile';
import CreateContent from './components/CreateContentSimple';
import Tutoring from './components/TutoringSimple';
import GeneralSettings from './components/GeneralSettings';
import MessagingSystem from './components/MessagingSystem';
import soyucabLogo from './assets/33c35295992cfb6178c01246eefc5ecbf6bc76db.png';

type View = 'feed' | 'profile' | 'edit-profile' | 'create' | 'tutoring' | 'groups' | 'messaging' | 'settings' | 'events-report' | 'community-report' | 'skills-report' | 'interaction-report' | 'viral-report' | 'lideres-report' | 'eventos-db-report' | 'groups-report' | 'diaspora-report' | 'internships-report' | 'health-report' | 'student-groups-report';
type AuthView = 'login' | 'register';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [currentView, setCurrentView] = useState<View>('feed');

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('feed');
  };

  const handleRegister = () => {
    setIsAuthenticated(true);
  };

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
      case 'events-report':
        return <EventsReport />;
      case 'community-report':
        return <CommunityGrowthReport />;
      case 'skills-report':
        return <GraduateSkillsReport />;
      case 'interaction-report':
        return <ContentInteractionReport />;
      case 'viral-report':
        return <TopViralReport />;
      case 'lideres-report':
        return <LideresReport />;
      case 'eventos-db-report':
        return <EventosReport />;
      case 'groups-report':
        return <ActiveGroupsReport />;
      case 'diaspora-report':
        return <GraduateDiasporaReport />;
      case 'internships-report':
        return <CompanyUniversityLinkReport />;
      case 'health-report':
        return <CommunityHealthReport />;
      case 'student-groups-report':
        return <StudentGroupsReport />;
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={['events-report', 'community-report', 'skills-report', 'interaction-report', 'groups-report', 'diaspora-report', 'internships-report', 'health-report', 'student-groups-report'].includes(currentView) ? 'default' : 'ghost'}
                      className="flex items-center space-x-2"
                      style={{ backgroundColor: ['events-report', 'community-report', 'skills-report', 'interaction-report', 'groups-report', 'diaspora-report', 'internships-report', 'health-report', 'student-groups-report'].includes(currentView) ? '#40b4e5' : 'transparent' }}
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Reportes</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem onClick={() => setCurrentView('events-report')}>
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Participación en Eventos</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentView('community-report')}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>Crecimiento de Comunidad</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentView('skills-report')}>
                      <Users className="mr-2 h-4 w-4" />
                      <span>Aptitudes de Egresados</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentView('interaction-report')}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Análisis de Interacción</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentView('viral-report')}>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      <span>Top Contenido Viral (BD)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentView('lideres-report')}>
                      <Users className="mr-2 h-4 w-4" />
                      <span>Líderes de Opinión (BD)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentView('eventos-db-report')}>
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Interés en Eventos (BD)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentView('groups-report')}>
                      <Users className="mr-2 h-4 w-4" />
                      <span>Grupos Más Activos</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentView('diaspora-report')}>
                      <MapPin className="mr-2 h-4 w-4" />
                      <span>Impacto de la Diáspora</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentView('internships-report')}>
                      <Building2 className="mr-2 h-4 w-4" />
                      <span>Vinculación Empresarial</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentView('health-report')}>
                      <Activity className="mr-2 h-4 w-4" />
                      <span>Salud de la Comunidad</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentView('student-groups-report')}>
                      <UsersRound className="mr-2 h-4 w-4" />
                      <span>Agrupaciones Estudiantiles</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                      <AvatarImage src="https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzJTIwcG9ydHJhaXQlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NTkzMjQ4NzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" />
                      <AvatarFallback>MG</AvatarFallback>
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