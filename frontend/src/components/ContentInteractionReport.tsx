import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Filter, Download, TrendingUp, MessageCircle, Heart, Share } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';

const ContentInteractionReport = () => {
  // Datos de interacción por tipo de contenido
  const interactionData = [
    {
      id: 1,
      type: 'Video Educativo',
      posts: 45,
      avgReactions: 23.4,
      avgComments: 8.7,
      avgShares: 5.2,
      engagement: 'Alto',
      trend: 'up'
    },
    {
      id: 2,
      type: 'Artículo Técnico',
      posts: 67,
      avgReactions: 18.9,
      avgComments: 12.3,
      avgShares: 3.8,
      engagement: 'Alto',
      trend: 'up'
    },
    {
      id: 3,
      type: 'Infografía',
      posts: 32,
      avgReactions: 31.2,
      avgComments: 4.1,
      avgShares: 8.9,
      engagement: 'Muy Alto',
      trend: 'up'
    },
    {
      id: 4,
      type: 'Evento/Anuncio',
      posts: 28,
      avgReactions: 15.6,
      avgComments: 6.8,
      avgShares: 4.3,
      engagement: 'Medio',
      trend: 'stable'
    },
    {
      id: 5,
      type: 'Foto Personal',
      posts: 156,
      avgReactions: 12.8,
      avgComments: 3.2,
      avgShares: 1.9,
      engagement: 'Medio',
      trend: 'down'
    },
    {
      id: 6,
      type: 'Logro Académico',
      posts: 23,
      avgReactions: 28.7,
      avgComments: 9.4,
      avgShares: 6.1,
      engagement: 'Alto',
      trend: 'up'
    },
    {
      id: 7,
      type: 'Proyecto Colaborativo',
      posts: 19,
      avgReactions: 21.3,
      avgComments: 11.7,
      avgShares: 7.2,
      engagement: 'Alto',
      trend: 'up'
    },
    {
      id: 8,
      type: 'Encuesta/Poll',
      posts: 14,
      avgReactions: 8.9,
      avgComments: 15.6,
      avgShares: 2.1,
      engagement: 'Medio',
      trend: 'stable'
    },
    {
      id: 9,
      type: 'Meme/Humor',
      posts: 41,
      avgReactions: 35.2,
      avgComments: 7.8,
      avgShares: 12.4,
      engagement: 'Muy Alto',
      trend: 'up'
    },
    {
      id: 10,
      type: 'Texto Reflexivo',
      posts: 52,
      avgReactions: 9.4,
      avgComments: 18.2,
      avgShares: 2.8,
      engagement: 'Medio',
      trend: 'down'
    }
  ];

  // Métricas generales
  const totalPosts = interactionData.reduce((sum, item) => sum + item.posts, 0);
  const avgTotalReactions = (interactionData.reduce((sum, item) => sum + (item.avgReactions * item.posts), 0) / totalPosts).toFixed(1);
  const avgTotalComments = (interactionData.reduce((sum, item) => sum + (item.avgComments * item.posts), 0) / totalPosts).toFixed(1);
  const topPerformer = interactionData.reduce((max, item) => 
    (item.avgReactions + item.avgComments + item.avgShares) > (max.avgReactions + max.avgComments + max.avgShares) ? item : max
  );

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case 'Muy Alto': return '#047732';
      case 'Alto': return '#40b4e5';
      case 'Medio': return '#ffc526';
      case 'Bajo': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl">Análisis de Interacción de Contenido</h1>
          <p className="text-gray-600">Rendimiento y engagement por tipo de publicación</p>
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
                <p className="text-sm text-gray-600">Total Publicaciones</p>
                <p className="text-2xl" style={{ color: '#40b4e5' }}>{totalPosts}</p>
                <p className="text-sm text-gray-500">Últimos 30 días</p>
              </div>
              <TrendingUp className="h-8 w-8" style={{ color: '#40b4e5' }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Promedio Reacciones</p>
                <p className="text-2xl" style={{ color: '#047732' }}>{avgTotalReactions}</p>
                <p className="text-sm text-gray-500">por publicación</p>
              </div>
              <Heart className="h-8 w-8" style={{ color: '#047732' }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Promedio Comentarios</p>
                <p className="text-2xl" style={{ color: '#ffc526' }}>{avgTotalComments}</p>
                <p className="text-sm text-gray-500">por publicación</p>
              </div>
              <MessageCircle className="h-8 w-8" style={{ color: '#ffc526' }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mejor Rendimiento</p>
                <p className="text-lg truncate">{topPerformer.type}</p>
                <p className="text-sm text-gray-500">{topPerformer.posts} publicaciones</p>
              </div>
              <Share className="h-8 w-8" style={{ color: '#40b4e5' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle>Clasificación de Rendimiento por Tipo de Contenido</CardTitle>
          <p className="text-gray-600">Métricas de engagement detalladas</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Rank</TableHead>
                <TableHead>Tipo de Publicación</TableHead>
                <TableHead className="text-center">Nº Posts</TableHead>
                <TableHead className="text-center">Promedio Reacciones</TableHead>
                <TableHead className="text-center">Promedio Comentarios</TableHead>
                <TableHead className="text-center">Promedio Compartidas</TableHead>
                <TableHead className="text-center">Nivel Engagement</TableHead>
                <TableHead className="text-center">Tendencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interactionData
                .sort((a, b) => (b.avgReactions + b.avgComments + b.avgShares) - (a.avgReactions + a.avgComments + a.avgShares))
                .map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                      style={{ backgroundColor: index < 3 ? '#40b4e5' : '#6b7280' }}
                    >
                      {index + 1}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{item.type}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{item.posts}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span style={{ color: '#047732' }}>{item.avgReactions}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span style={{ color: '#ffc526' }}>{item.avgComments}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span style={{ color: '#40b4e5' }}>{item.avgShares}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      style={{ 
                        backgroundColor: getEngagementColor(item.engagement), 
                        color: 'white' 
                      }}
                    >
                      {item.engagement}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-lg">{getTrendIcon(item.trend)}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle style={{ color: '#047732' }}>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm"><strong>Infografía:</strong> 31.2 reacciones promedio</p>
              <p className="text-sm"><strong>Meme/Humor:</strong> 35.2 reacciones promedio</p>
              <p className="text-sm"><strong>Logro Académico:</strong> 28.7 reacciones promedio</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle style={{ color: '#ffc526' }}>Más Comentados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm"><strong>Texto Reflexivo:</strong> 18.2 comentarios promedio</p>
              <p className="text-sm"><strong>Encuesta/Poll:</strong> 15.6 comentarios promedio</p>
              <p className="text-sm"><strong>Artículo Técnico:</strong> 12.3 comentarios promedio</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle style={{ color: '#40b4e5' }}>Más Compartidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm"><strong>Meme/Humor:</strong> 12.4 compartidas promedio</p>
              <p className="text-sm"><strong>Infografía:</strong> 8.9 compartidas promedio</p>
              <p className="text-sm"><strong>Proyecto Colaborativo:</strong> 7.2 compartidas promedio</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentInteractionReport;