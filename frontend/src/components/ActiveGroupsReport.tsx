import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Filter, Download, Users, MessageSquare, TrendingUp, Calendar } from 'lucide-react';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const ActiveGroupsReport = () => {
  // Datos de grupos más activos
  const groupsData = [
    {
      id: 1,
      name: 'Desarrolladores UCAB',
      members: 324,
      newPosts: 47,
      category: 'Tecnología',
      growth: '+12%',
      avatar: '💻',
      description: 'Comunidad de programadores y desarrolladores'
    },
    {
      id: 2,
      name: 'Emprendedores UCAbistas',
      members: 298,
      newPosts: 42,
      category: 'Negocios',
      growth: '+8%',
      avatar: '🚀',
      description: 'Red de emprendedores y startups'
    },
    {
      id: 3,
      name: 'Investigación Científica',
      members: 267,
      newPosts: 38,
      category: 'Académico',
      growth: '+15%',
      avatar: '🔬',
      description: 'Grupo de investigadores y académicos'
    },

    {
      id: 5,
      name: 'Creativos Digitales',
      members: 189,
      newPosts: 33,
      category: 'Arte y Diseño',
      growth: '+22%',
      avatar: '🎨',
      description: 'Diseñadores, artistas y creativos'
    },
    {
      id: 6,
      name: 'Líderes Estudiantiles',
      members: 156,
      newPosts: 31,
      category: 'Liderazgo',
      growth: '+18%',
      avatar: '👥',
      description: 'Representantes y líderes estudiantiles'
    },
    {
      id: 7,
      name: 'Deportes UCAB',
      members: 203,
      newPosts: 29,
      category: 'Deportes',
      growth: '+7%',
      avatar: '⚽',
      description: 'Comunidad deportiva universitaria'
    },
    {
      id: 8,
      name: 'Voluntariado Social',
      members: 178,
      newPosts: 26,
      category: 'Social',
      growth: '+10%',
      avatar: '🤝',
      description: 'Proyectos de responsabilidad social'
    },
    {
      id: 9,
      name: 'Alumni Derecho',
      members: 312,
      newPosts: 24,
      category: 'Profesional',
      growth: '+3%',
      avatar: '⚖️',
      description: 'Egresados de la Escuela de Derecho'
    },
    {
      id: 10,
      name: 'Intercambio Académico',
      members: 145,
      newPosts: 22,
      category: 'Internacional',
      growth: '+25%',
      avatar: '🌍',
      description: 'Estudiantes de intercambio'
    }
  ];

  // Métricas generales
  const totalMembers = groupsData.reduce((sum, group) => sum + group.members, 0);
  const totalPosts = groupsData.reduce((sum, group) => sum + group.newPosts, 0);
  const avgMembersPerGroup = Math.round(totalMembers / groupsData.length);
  const mostActiveGroup = groupsData[0];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Tecnología': '#40b4e5',
      'Negocios': '#047732',
      'Académico': '#ffc526',
      'Profesional': '#8b5cf6',
      'Arte y Diseño': '#ec4899',
      'Liderazgo': '#f97316',
      'Deportes': '#84cc16',
      'Social': '#06b6d4',
      'Internacional': '#ef4444'
    };
    return colors[category] || '#6b7280';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl">Ranking de Actividad en Grupos</h1>
          <p className="text-gray-600">Últimos 30 días - Comunidades más vibrantes</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </Button>
          <Button 
            className="flex items-center space-x-2"
            style={{ backgroundColor: '#ffc526', color: '#12100c' }}
          >
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Grupos Activos</p>
                <p className="text-2xl" style={{ color: '#40b4e5' }}>10</p>
                <p className="text-sm text-gray-500">Top performers</p>
              </div>
              <Users className="h-8 w-8" style={{ color: '#40b4e5' }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Miembros</p>
                <p className="text-2xl" style={{ color: '#047732' }}>{totalMembers.toLocaleString()}</p>
                <p className="text-sm text-gray-500">usuarios activos</p>
              </div>
              <TrendingUp className="h-8 w-8" style={{ color: '#047732' }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nuevas Publicaciones</p>
                <p className="text-2xl" style={{ color: '#ffc526' }}>{totalPosts}</p>
                <p className="text-sm text-gray-500">últimos 30 días</p>
              </div>
              <MessageSquare className="h-8 w-8" style={{ color: '#ffc526' }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Grupo Más Activo</p>
                <p className="text-lg truncate">{mostActiveGroup.name}</p>
                <p className="text-sm text-gray-500">{mostActiveGroup.newPosts} posts nuevos</p>
              </div>
              <Calendar className="h-8 w-8" style={{ color: '#40b4e5' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Ranking */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking de Grupos por Actividad</CardTitle>
          <p className="text-gray-600">Ordenado por número de publicaciones nuevas</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {groupsData.map((group, index) => (
              <div 
                key={group.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {/* Ranking Number */}
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                    style={{ backgroundColor: index < 3 ? '#40b4e5' : '#6b7280' }}
                  >
                    {index + 1}
                  </div>

                  {/* Group Avatar */}
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: '#f3f4f6' }}
                  >
                    {group.avatar}
                  </div>

                  {/* Group Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg">{group.name}</h3>
                      <Badge 
                        style={{ 
                          backgroundColor: getCategoryColor(group.category), 
                          color: 'white' 
                        }}
                      >
                        {group.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{group.description}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-6 text-right">
                  <div>
                    <p className="text-sm text-gray-600">Miembros</p>
                    <p className="text-xl" style={{ color: '#40b4e5' }}>{group.members}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Posts Nuevos</p>
                    <p className="text-xl" style={{ color: '#ffc526' }}>{group.newPosts}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Crecimiento</p>
                    <p 
                      className="text-lg"
                      style={{ color: '#047732' }}
                    >
                      {group.growth}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle style={{ color: '#40b4e5' }}>Categorías Más Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Tecnología</span>
                <Badge style={{ backgroundColor: '#40b4e5', color: 'white' }}>47 posts</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Negocios</span>
                <Badge style={{ backgroundColor: '#047732', color: 'white' }}>42 posts</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Académico</span>
                <Badge style={{ backgroundColor: '#ffc526', color: 'white' }}>38 posts</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle style={{ color: '#047732' }}>Mayor Crecimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Intercambio Académico</span>
                <span className="text-sm" style={{ color: '#047732' }}>+25%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Creativos Digitales</span>
                <span className="text-sm" style={{ color: '#047732' }}>+22%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Líderes Estudiantiles</span>
                <span className="text-sm" style={{ color: '#047732' }}>+18%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle style={{ color: '#ffc526' }}>Más Miembros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Alumni Derecho</span>
                <span className="text-sm" style={{ color: '#ffc526' }}>312 miembros</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Desarrolladores UCAB</span>
                <span className="text-sm" style={{ color: '#ffc526' }}>324 miembros</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Alumni Derecho</span>
                <span className="text-sm" style={{ color: '#ffc526' }}>312 miembros</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActiveGroupsReport;