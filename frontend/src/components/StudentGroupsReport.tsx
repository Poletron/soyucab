import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Users, Calendar, FileText, TrendingUp, Heart, Music, Dumbbell, HandHeart, BookOpen, Palette } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ImageWithFallback } from './figma/ImageWithFallback';

// Mock data para agrupaciones estudiantiles
const studentGroupsData = [
  {
    id: 1,
    name: 'UCAB Voluntarios',
    type: 'Voluntariado',
    faculty: 'Todas',
    logo: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=200&h=200&fit=crop',
    activeMembers: 234,
    eventsCreated: 18,
    recentPosts: 45,
    description: 'Servicio comunitario y ayuda social'
  },
  {
    id: 2,
    name: 'Grupo de Teatro UCAB',
    type: 'Cultural',
    faculty: 'Humanidades',
    logo: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=200&h=200&fit=crop',
    activeMembers: 187,
    eventsCreated: 15,
    recentPosts: 38,
    description: 'Artes escénicas y expresión artística'
  },
  {
    id: 3,
    name: 'UCAB FC',
    type: 'Deportiva',
    faculty: 'Todas',
    logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200&h=200&fit=crop',
    activeMembers: 156,
    eventsCreated: 22,
    recentPosts: 52,
    description: 'Fútbol competitivo y recreacional'
  },
  {
    id: 4,
    name: 'Tuna UCAB',
    type: 'Cultural',
    faculty: 'Todas',
    logo: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200&h=200&fit=crop',
    activeMembers: 142,
    eventsCreated: 12,
    recentPosts: 29,
    description: 'Música tradicional universitaria'
  },
  {
    id: 5,
    name: 'Club de Debate',
    type: 'Académica',
    faculty: 'Derecho',
    logo: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=200&h=200&fit=crop',
    activeMembers: 128,
    eventsCreated: 16,
    recentPosts: 31,
    description: 'Oratoria y argumentación competitiva'
  },
  {
    id: 6,
    name: 'Coro Polifónico',
    type: 'Cultural',
    faculty: 'Todas',
    logo: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=200&h=200&fit=crop',
    activeMembers: 115,
    eventsCreated: 10,
    recentPosts: 24,
    description: 'Música coral y presentaciones'
  },
  {
    id: 7,
    name: 'Basketball UCAB',
    type: 'Deportiva',
    faculty: 'Todas',
    logo: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200&h=200&fit=crop',
    activeMembers: 98,
    eventsCreated: 14,
    recentPosts: 28,
    description: 'Baloncesto universitario competitivo'
  },
  {
    id: 8,
    name: 'Pastoral Universitaria',
    type: 'Voluntariado',
    faculty: 'Todas',
    logo: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=200&h=200&fit=crop',
    activeMembers: 176,
    eventsCreated: 20,
    recentPosts: 42,
    description: 'Acompañamiento espiritual y fe'
  },
  {
    id: 9,
    name: 'Danza Contemporánea',
    type: 'Cultural',
    faculty: 'Humanidades',
    logo: 'https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=200&h=200&fit=crop',
    activeMembers: 89,
    eventsCreated: 11,
    recentPosts: 26,
    description: 'Expresión corporal y coreografía'
  },
  {
    id: 10,
    name: 'Club de Fotografía',
    type: 'Cultural',
    faculty: 'Comunicación',
    logo: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=200&h=200&fit=crop',
    activeMembers: 134,
    eventsCreated: 13,
    recentPosts: 47,
    description: 'Arte fotográfico y visual'
  },
  {
    id: 11,
    name: 'Natación UCAB',
    type: 'Deportiva',
    faculty: 'Todas',
    logo: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=200&h=200&fit=crop',
    activeMembers: 76,
    eventsCreated: 9,
    recentPosts: 19,
    description: 'Natación competitiva y recreativa'
  },
  {
    id: 12,
    name: 'Emprendimiento Social',
    type: 'Voluntariado',
    faculty: 'Ciencias Económicas',
    logo: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=200&h=200&fit=crop',
    activeMembers: 121,
    eventsCreated: 17,
    recentPosts: 35,
    description: 'Innovación social y negocios con impacto'
  }
];

// Data para gráfico de crecimiento (últimos 6 meses)
const growthData = [
  { month: 'May', 'UCAB Voluntarios': 156, 'Teatro UCAB': 132, 'UCAB FC': 98, 'Tuna UCAB': 89, 'Club Debate': 76 },
  { month: 'Jun', 'UCAB Voluntarios': 178, 'Teatro UCAB': 145, 'UCAB FC': 112, 'Tuna UCAB': 98, 'Club Debate': 85 },
  { month: 'Jul', 'UCAB Voluntarios': 192, 'Teatro UCAB': 156, 'UCAB FC': 125, 'Tuna UCAB': 107, 'Club Debate': 92 },
  { month: 'Ago', 'UCAB Voluntarios': 205, 'Teatro UCAB': 167, 'UCAB FC': 138, 'Tuna UCAB': 118, 'Club Debate': 103 },
  { month: 'Sep', 'UCAB Voluntarios': 218, 'Teatro UCAB': 175, 'UCAB FC': 147, 'Tuna UCAB': 130, 'Club Debate': 115 },
  { month: 'Oct', 'UCAB Voluntarios': 234, 'Teatro UCAB': 187, 'UCAB FC': 156, 'Tuna UCAB': 142, 'Club Debate': 128 }
];

// Intereses principales para word cloud
const interestsCloud = [
  { word: 'Servicio Comunitario', size: 48, color: '#40b4e5' },
  { word: 'Música', size: 42, color: '#ffc526' },
  { word: 'Deporte', size: 45, color: '#047732' },
  { word: 'Arte', size: 38, color: '#9b59b6' },
  { word: 'Cultura', size: 40, color: '#e74c3c' },
  { word: 'Voluntariado', size: 44, color: '#40b4e5' },
  { word: 'Teatro', size: 35, color: '#ff6b9d' },
  { word: 'Fútbol', size: 36, color: '#047732' },
  { word: 'Liderazgo', size: 32, color: '#3498db' },
  { word: 'Creatividad', size: 34, color: '#9b59b6' },
  { word: 'Danza', size: 30, color: '#e74c3c' },
  { word: 'Fotografía', size: 33, color: '#ff6b9d' },
  { word: 'Debate', size: 31, color: '#ffc526' },
  { word: 'Innovación', size: 29, color: '#40b4e5' },
  { word: 'Solidaridad', size: 37, color: '#047732' },
  { word: 'Expresión', size: 28, color: '#9b59b6' },
  { word: 'Competencia', size: 30, color: '#3498db' },
  { word: 'Colaboración', size: 35, color: '#40b4e5' },
  { word: 'Fe', size: 32, color: '#ffc526' },
  { word: 'Pasión', size: 31, color: '#e74c3c' },
  { word: 'Talento', size: 29, color: '#ff6b9d' },
  { word: 'Compromiso', size: 33, color: '#047732' },
  { word: 'Comunidad', size: 41, color: '#40b4e5' },
  { word: 'Valores', size: 30, color: '#9b59b6' },
  { word: 'Impacto Social', size: 36, color: '#ffc526' }
];

const StudentGroupsReport = () => {
  const [filters, setFilters] = useState({
    type: 'all',
    faculty: 'all'
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Cultural':
        return <Music className="h-5 w-5" style={{ color: '#ffc526' }} />;
      case 'Deportiva':
        return <Dumbbell className="h-5 w-5" style={{ color: '#047732' }} />;
      case 'Voluntariado':
        return <HandHeart className="h-5 w-5" style={{ color: '#40b4e5' }} />;
      case 'Académica':
        return <BookOpen className="h-5 w-5" style={{ color: '#9b59b6' }} />;
      default:
        return <Heart className="h-5 w-5" style={{ color: '#12100c' }} />;
    }
  };

  const filteredGroups = studentGroupsData.filter(group => {
    const typeMatch = filters.type === 'all' || group.type === filters.type;
    const facultyMatch = filters.faculty === 'all' || group.faculty === filters.faculty || group.faculty === 'Todas';
    return typeMatch && facultyMatch;
  });

  const sortedGroups = [...filteredGroups].sort((a, b) => b.activeMembers - a.activeMembers);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl" style={{ color: '#12100c' }}>
            Dashboard de Agrupaciones Estudiantiles
          </h1>
          <p className="text-gray-600 mt-2">
            Dinamismo de Comunidades y Agrupaciones - Dirección de Desarrollo Estudiantil
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#e0f2fe' }}>
            <Users className="h-8 w-8" style={{ color: '#40b4e5' }} />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card style={{ borderColor: '#40b4e5', borderWidth: '2px' }}>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2" style={{ color: '#12100c' }}>
                Tipo de Agrupación
              </label>
              <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las agrupaciones</SelectItem>
                  <SelectItem value="Cultural">Cultural</SelectItem>
                  <SelectItem value="Deportiva">Deportiva</SelectItem>
                  <SelectItem value="Voluntariado">Voluntariado</SelectItem>
                  <SelectItem value="Académica">Académica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#12100c' }}>
                Facultad
              </label>
              <Select value={filters.faculty} onValueChange={(value) => setFilters({ ...filters, faculty: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar facultad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las facultades</SelectItem>
                  <SelectItem value="Humanidades">Humanidades y Educación</SelectItem>
                  <SelectItem value="Ciencias Económicas">Ciencias Económicas y Sociales</SelectItem>
                  <SelectItem value="Ingeniería">Ingeniería</SelectItem>
                  <SelectItem value="Derecho">Derecho</SelectItem>
                  <SelectItem value="Comunicación">Comunicación Social</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card style={{ borderColor: '#40b4e5', borderWidth: '1px' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#e0f2fe' }}>
                <Users className="h-6 w-6" style={{ color: '#40b4e5' }} />
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Agrupaciones</div>
                <div className="text-2xl" style={{ color: '#12100c' }}>
                  {filteredGroups.length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: '#ffc526', borderWidth: '1px' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#fff9e5' }}>
                <Users className="h-6 w-6" style={{ color: '#ffc526' }} />
              </div>
              <div>
                <div className="text-sm text-gray-600">Miembros Activos</div>
                <div className="text-2xl" style={{ color: '#12100c' }}>
                  {filteredGroups.reduce((sum, g) => sum + g.activeMembers, 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: '#047732', borderWidth: '1px' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#e6f7ed' }}>
                <Calendar className="h-6 w-6" style={{ color: '#047732' }} />
              </div>
              <div>
                <div className="text-sm text-gray-600">Eventos Creados</div>
                <div className="text-2xl" style={{ color: '#12100c' }}>
                  {filteredGroups.reduce((sum, g) => sum + g.eventsCreated, 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: '#9b59b6', borderWidth: '1px' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#f3e5f5' }}>
                <FileText className="h-6 w-6" style={{ color: '#9b59b6' }} />
              </div>
              <div>
                <div className="text-sm text-gray-600">Publicaciones</div>
                <div className="text-2xl" style={{ color: '#12100c' }}>
                  {filteredGroups.reduce((sum, g) => sum + g.recentPosts, 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agrupaciones Más Activas - Cards Grid */}
      <div>
        <h2 className="text-2xl mb-4" style={{ color: '#12100c' }}>
          Agrupaciones Más Activas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedGroups.slice(0, 9).map((group, index) => (
            <Card
              key={group.id}
              className="hover:shadow-lg transition-all duration-300 cursor-pointer"
              style={{
                borderColor: index < 3 ? '#40b4e5' : '#e0e0e0',
                borderWidth: index < 3 ? '2px' : '1px'
              }}
            >
              <CardContent className="pt-6">
                {/* Header with Rank Badge */}
                {index < 3 && (
                  <div className="absolute top-4 right-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
                      style={{
                        backgroundColor: index === 0 ? '#ffc526' : index === 1 ? '#e0e0e0' : '#cd7f32'
                      }}
                    >
                      <span className="text-white font-bold">#{index + 1}</span>
                    </div>
                  </div>
                )}

                {/* Logo and Name */}
                <div className="flex items-start gap-4 mb-4">
                  <ImageWithFallback
                    src={group.logo}
                    alt={group.name}
                    className="w-16 h-16 rounded-lg object-cover border-2"
                    style={{ borderColor: '#40b4e5' }}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium mb-1" style={{ color: '#12100c' }}>
                      {group.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(group.type)}
                      <Badge
                        style={{
                          backgroundColor:
                            group.type === 'Cultural' ? '#fff9e5' :
                            group.type === 'Deportiva' ? '#e6f7ed' :
                            group.type === 'Voluntariado' ? '#e0f2fe' : '#f3e5f5',
                          color:
                            group.type === 'Cultural' ? '#ffc526' :
                            group.type === 'Deportiva' ? '#047732' :
                            group.type === 'Voluntariado' ? '#40b4e5' : '#9b59b6',
                          border: 'none'
                        }}
                      >
                        {group.type}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  {/* Active Members */}
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Miembros Activos</span>
                    </div>
                    <span className="font-bold text-lg" style={{ color: '#40b4e5' }}>
                      {group.activeMembers}
                    </span>
                  </div>

                  {/* Events and Posts */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: '#e6f7ed' }}>
                      <Calendar className="h-4 w-4" style={{ color: '#047732' }} />
                      <div>
                        <div className="text-xs text-gray-600">Eventos</div>
                        <div className="font-medium" style={{ color: '#047732' }}>
                          {group.eventsCreated}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: '#fff9e5' }}>
                      <FileText className="h-4 w-4" style={{ color: '#ffc526' }} />
                      <div>
                        <div className="text-xs text-gray-600">Posts</div>
                        <div className="font-medium" style={{ color: '#ffc526' }}>
                          {group.recentPosts}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mt-3 border-t pt-3">
                  {group.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Gráfico de Crecimiento de Miembros */}
      <Card style={{ borderColor: '#047732', borderWidth: '1px' }}>
        <CardHeader style={{ backgroundColor: '#047732' }}>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Crecimiento de Miembros - Top 5 Agrupaciones (Últimos 6 Meses)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={growthData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="month"
                stroke="#666"
                style={{ fontSize: '13px' }}
              />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '2px solid #047732',
                  borderRadius: '8px'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line
                type="monotone"
                dataKey="UCAB Voluntarios"
                stroke="#40b4e5"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Teatro UCAB"
                stroke="#ffc526"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="UCAB FC"
                stroke="#047732"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Tuna UCAB"
                stroke="#9b59b6"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Club Debate"
                stroke="#e74c3c"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Insights */}
          <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#e6f7ed' }}>
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 mt-0.5" style={{ color: '#047732' }} />
              <div>
                <h4 className="font-medium mb-1" style={{ color: '#047732' }}>
                  Crecimiento Sostenido
                </h4>
                <p className="text-sm text-gray-700">
                  Las 5 agrupaciones más activas han experimentado un crecimiento promedio del <strong>50.2%</strong> en
                  membresía durante el último semestre, destacando el incremento de UCAB Voluntarios con un <strong>50%</strong> de crecimiento.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Word Cloud - Intereses Principales */}
      <Card>
        <CardHeader style={{ backgroundColor: '#ffc526' }}>
          <CardTitle className="flex items-center gap-2" style={{ color: '#12100c' }}>
            <Palette className="h-5 w-5" />
            Intereses Principales de las Agrupaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="bg-gradient-to-br from-blue-50 via-yellow-50 to-green-50 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {interestsCloud.map((item, index) => (
                <div
                  key={index}
                  className="cursor-pointer hover:scale-110 transition-transform duration-300"
                  style={{
                    fontSize: `${item.size}px`,
                    color: item.color,
                    fontWeight: item.size > 40 ? 'bold' : item.size > 35 ? '600' : '500',
                    opacity: 0.85,
                    padding: '8px',
                    animation: `fadeIn 0.${index + 5}s ease-in`
                  }}
                >
                  {item.word}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#40b4e5' }}></div>
              <span className="text-sm text-gray-600">Voluntariado y Comunidad</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ffc526' }}></div>
              <span className="text-sm text-gray-600">Música y Fe</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#047732' }}></div>
              <span className="text-sm text-gray-600">Deportes y Compromiso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#9b59b6' }}></div>
              <span className="text-sm text-gray-600">Arte y Creatividad</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Promedio de Miembros</div>
              <div className="text-3xl mb-1" style={{ color: '#40b4e5' }}>
                {Math.round(filteredGroups.reduce((sum, g) => sum + g.activeMembers, 0) / filteredGroups.length)}
              </div>
              <div className="text-xs text-gray-500">
                Por agrupación activa
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Tasa de Participación</div>
              <div className="text-3xl mb-1" style={{ color: '#ffc526' }}>
                42.8%
              </div>
              <div className="text-xs text-gray-500">
                Estudiantes en agrupaciones
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Agrupación Más Popular</div>
              <div className="text-3xl mb-1" style={{ color: '#047732' }}>
                {sortedGroups[0]?.name.split(' ')[0]}
              </div>
              <div className="text-xs text-gray-500">
                {sortedGroups[0]?.activeMembers} miembros activos
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentGroupsReport;
