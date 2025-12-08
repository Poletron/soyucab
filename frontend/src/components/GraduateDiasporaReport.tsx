import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { MapPin, Calendar, Users, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import WorldMapSVG from './WorldMapSVG';

// Mock data para países con egresados
// Coordenadas basadas en el viewBox del SVG: 0 0 2000 857
const countriesData = [
  {
    id: 'us',
    name: 'Estados Unidos',
    flag: '🇺🇸',
    graduates: 2847,
    position: { x: 450, y: 250 }, // Coordenadas absolutas en el SVG
    sectors: [
      { name: 'Tecnología', value: 35, color: '#40b4e5' },
      { name: 'Finanzas', value: 28, color: '#ffc526' },
      { name: 'Consultoría', value: 18, color: '#047732' },
      { name: 'Salud', value: 12, color: '#12100c' },
      { name: 'Otros', value: 7, color: '#94a3b8' }
    ],
    events: [
      { id: 1, title: 'Networking UCABista Miami', date: '2025-11-15', attendees: 85 },
      { id: 2, title: 'Encuentro Alumni NYC', date: '2025-11-28', attendees: 62 },
      { id: 3, title: 'Webinar: Oportunidades Tech', date: '2025-12-05', attendees: 120 }
    ]
  },
  {
    id: 'es',
    name: 'España',
    flag: '🇪🇸',
    graduates: 1523,
    position: { x: 980, y: 235 },
    sectors: [
      { name: 'Finanzas', value: 32, color: '#40b4e5' },
      { name: 'Tecnología', value: 25, color: '#ffc526' },
      { name: 'Educación', value: 20, color: '#047732' },
      { name: 'Turismo', value: 15, color: '#12100c' },
      { name: 'Otros', value: 8, color: '#94a3b8' }
    ],
    events: [
      { id: 1, title: 'Reunión Alumni Madrid', date: '2025-11-20', attendees: 95 },
      { id: 2, title: 'Foro de Emprendimiento', date: '2025-12-10', attendees: 48 },
      { id: 3, title: 'Cena Anual Barcelona', date: '2025-12-18', attendees: 110 }
    ]
  },
  {
    id: 'cl',
    name: 'Chile',
    flag: '🇨🇱',
    graduates: 892,
    position: { x: 610, y: 720 },
    sectors: [
      { name: 'Minería', value: 30, color: '#40b4e5' },
      { name: 'Tecnología', value: 28, color: '#ffc526' },
      { name: 'Finanzas', value: 22, color: '#047732' },
      { name: 'Consultoría', value: 12, color: '#12100c' },
      { name: 'Otros', value: 8, color: '#94a3b8' }
    ],
    events: [
      { id: 1, title: 'Encuentro Santiago', date: '2025-11-25', attendees: 55 },
      { id: 2, title: 'Networking Profesional', date: '2025-12-08', attendees: 40 },
      { id: 3, title: 'Asamblea Regional', date: '2025-12-20', attendees: 65 }
    ]
  },
  {
    id: 'co',
    name: 'Colombia',
    flag: '🇨🇴',
    graduates: 756,
    position: { x: 580, y: 440 },
    sectors: [
      { name: 'Tecnología', value: 38, color: '#40b4e5' },
      { name: 'Finanzas', value: 24, color: '#ffc526' },
      { name: 'Marketing', value: 18, color: '#047732' },
      { name: 'Consultoría', value: 14, color: '#12100c' },
      { name: 'Otros', value: 6, color: '#94a3b8' }
    ],
    events: [
      { id: 1, title: 'Cumbre UCABista Bogotá', date: '2025-11-18', attendees: 72 },
      { id: 2, title: 'Charla: Innovación', date: '2025-12-02', attendees: 45 },
      { id: 3, title: 'Encuentro Alumni Medellín', date: '2025-12-15', attendees: 58 }
    ]
  },
  {
    id: 'mx',
    name: 'México',
    flag: '🇲🇽',
    graduates: 645,
    position: { x: 350, y: 310 },
    sectors: [
      { name: 'Tecnología', value: 33, color: '#40b4e5' },
      { name: 'Manufactura', value: 27, color: '#ffc526' },
      { name: 'Finanzas', value: 20, color: '#047732' },
      { name: 'Educación', value: 13, color: '#12100c' },
      { name: 'Otros', value: 7, color: '#94a3b8' }
    ],
    events: [
      { id: 1, title: 'Networking CDMX', date: '2025-11-22', attendees: 68 },
      { id: 2, title: 'Foro Tecnológico', date: '2025-12-12', attendees: 52 },
      { id: 3, title: 'Encuentro Alumni Monterrey', date: '2025-12-28', attendees: 41 }
    ]
  },
  {
    id: 'ar',
    name: 'Argentina',
    flag: '🇦🇷',
    graduates: 534,
    position: { x: 665, y: 730 },
    sectors: [
      { name: 'Finanzas', value: 31, color: '#40b4e5' },
      { name: 'Tecnología', value: 29, color: '#ffc526' },
      { name: 'Agricultura', value: 20, color: '#047732' },
      { name: 'Consultoría', value: 14, color: '#12100c' },
      { name: 'Otros', value: 6, color: '#94a3b8' }
    ],
    events: [
      { id: 1, title: 'Reunión Buenos Aires', date: '2025-11-30', attendees: 48 },
      { id: 2, title: 'Networking Profesional', date: '2025-12-14', attendees: 35 },
      { id: 3, title: 'Encuentro Fin de Año', date: '2025-12-22', attendees: 60 }
    ]
  },
  {
    id: 'ca',
    name: 'Canadá',
    flag: '🇨🇦',
    graduates: 423,
    position: { x: 450, y: 170 },
    sectors: [
      { name: 'Tecnología', value: 40, color: '#40b4e5' },
      { name: 'Finanzas', value: 25, color: '#ffc526' },
      { name: 'Salud', value: 18, color: '#047732' },
      { name: 'Educación', value: 12, color: '#12100c' },
      { name: 'Otros', value: 5, color: '#94a3b8' }
    ],
    events: [
      { id: 1, title: 'Encuentro Toronto', date: '2025-11-17', attendees: 38 },
      { id: 2, title: 'Networking Vancouver', date: '2025-12-07', attendees: 29 },
      { id: 3, title: 'Celebración Navideña', date: '2025-12-21', attendees: 45 }
    ]
  },
  {
    id: 'uk',
    name: 'Reino Unido',
    flag: '🇬🇧',
    graduates: 389,
    position: { x: 975, y: 160 },
    sectors: [
      { name: 'Finanzas', value: 42, color: '#40b4e5' },
      { name: 'Tecnología', value: 26, color: '#ffc526' },
      { name: 'Consultoría', value: 18, color: '#047732' },
      { name: 'Educación', value: 10, color: '#12100c' },
      { name: 'Otros', value: 4, color: '#94a3b8' }
    ],
    events: [
      { id: 1, title: 'Networking Londres', date: '2025-11-23', attendees: 42 },
      { id: 2, title: 'Foro Profesional', date: '2025-12-09', attendees: 31 },
      { id: 3, title: 'Encuentro Alumni', date: '2025-12-19', attendees: 38 }
    ]
  },
  {
    id: 'br',
    name: 'Brasil',
    flag: '🇧🇷',
    graduates: 312,
    position: { x: 675, y: 540 },
    sectors: [
      { name: 'Tecnología', value: 34, color: '#40b4e5' },
      { name: 'Finanzas', value: 28, color: '#ffc526' },
      { name: 'Agronegocios', value: 22, color: '#047732' },
      { name: 'Consultoría', value: 11, color: '#12100c' },
      { name: 'Otros', value: 5, color: '#94a3b8' }
    ],
    events: [
      { id: 1, title: 'Encuentro São Paulo', date: '2025-11-26', attendees: 35 },
      { id: 2, title: 'Networking Rio', date: '2025-12-11', attendees: 28 },
      { id: 3, title: 'Reunión Brasília', date: '2025-12-17', attendees: 22 }
    ]
  },
  {
    id: 'pe',
    name: 'Perú',
    flag: '🇵🇪',
    graduates: 267,
    position: { x: 585, y: 570 },
    sectors: [
      { name: 'Minería', value: 35, color: '#40b4e5' },
      { name: 'Finanzas', value: 27, color: '#ffc526' },
      { name: 'Tecnología', value: 22, color: '#047732' },
      { name: 'Consultoría', value: 12, color: '#12100c' },
      { name: 'Otros', value: 4, color: '#94a3b8' }
    ],
    events: [
      { id: 1, title: 'Reunión Lima', date: '2025-11-29', attendees: 32 },
      { id: 2, title: 'Networking Profesional', date: '2025-12-13', attendees: 24 },
      { id: 3, title: 'Encuentro Alumni', date: '2025-12-27', attendees: 28 }
    ]
  }
];

const GraduateDiasporaReport = () => {
  const [selectedCountry, setSelectedCountry] = useState(countriesData[0]);
  const [hoveredCountry, setHoveredCountry] = useState<typeof countriesData[0] | null>(null);
  const [filters, setFilters] = useState({
    career: 'all',
    year: 'all',
    country: 'all'
  });

  const getCircleSize = (graduates: number) => {
    const maxGraduates = Math.max(...countriesData.map(c => c.graduates));
    const minSize = 8;
    const maxSize = 40;
    return minSize + (graduates / maxGraduates) * (maxSize - minSize);
  };

  const totalGraduates = countriesData.reduce((sum, country) => sum + country.graduates, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl" style={{ color: '#12100c' }}>
            Reporte de Impacto de la Diáspora UCABista
          </h1>
          <p className="text-gray-600 mt-2">
            Visualización geográfica del impacto de nuestros egresados alrededor del mundo
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-600">Total de Egresados</div>
            <div className="text-2xl" style={{ color: '#40b4e5' }}>
              {totalGraduates.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card style={{ borderColor: '#40b4e5', borderWidth: '2px' }}>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-2" style={{ color: '#12100c' }}>
                Carrera
              </label>
              <Select value={filters.career} onValueChange={(value) => setFilters({ ...filters, career: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar carrera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las carreras</SelectItem>
                  <SelectItem value="ing">Ingeniería</SelectItem>
                  <SelectItem value="admin">Administración</SelectItem>
                  <SelectItem value="derecho">Derecho</SelectItem>
                  <SelectItem value="economia">Economía</SelectItem>
                  <SelectItem value="comunicacion">Comunicación Social</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#12100c' }}>
                Año de Egreso
              </label>
              <Select value={filters.year} onValueChange={(value) => setFilters({ ...filters, year: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar año" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los años</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                  <SelectItem value="2020">2020</SelectItem>
                  <SelectItem value="2015-2019">2015-2019</SelectItem>
                  <SelectItem value="2010-2014">2010-2014</SelectItem>
                  <SelectItem value="before-2010">Antes de 2010</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#12100c' }}>
                País
              </label>
              <Select value={filters.country} onValueChange={(value) => setFilters({ ...filters, country: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar país" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los países</SelectItem>
                  {countriesData.map(country => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.flag} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mapa Mundial */}
        <div className="lg:col-span-8">
          <Card className="h-full" style={{ borderColor: '#40b4e5', borderWidth: '1px' }}>
            <CardHeader style={{ backgroundColor: '#40b4e5' }}>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Distribución Global de Egresados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative w-full" style={{ height: '500px', backgroundColor: '#f0f9ff' }}>
                {/* SVG de mapa mundial como fondo */}
                <div className="absolute inset-0">
                  <WorldMapSVG />
                </div>
                
                {/* Contenedor para los puntos sobre el mapa */}
                <svg 
                  className="absolute inset-0 w-full h-full" 
                  viewBox="0 0 2000 857" 
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Puntos de países con egresados */}
                  {countriesData.map((country) => {
                    const size = getCircleSize(country.graduates);
                    
                    return (
                      <g key={country.id}>
                        {/* Círculo con efecto de resplandor */}
                        <circle
                          cx={country.position.x}
                          cy={country.position.y}
                          r={size / 2 + 4}
                          fill="#40b4e5"
                          opacity="0.2"
                        />
                        {/* Círculo principal */}
                        <circle
                          cx={country.position.x}
                          cy={country.position.y}
                          r={size / 2}
                          fill="#40b4e5"
                          opacity="0.85"
                          stroke="#ffc526"
                          strokeWidth="3"
                          className="cursor-pointer transition-all hover:scale-110"
                          style={{
                            filter: selectedCountry?.id === country.id 
                              ? 'drop-shadow(0 0 8px rgba(255, 197, 38, 0.6))' 
                              : 'drop-shadow(0 4px 12px rgba(64, 180, 229, 0.4))',
                            transformOrigin: `${country.position.x}px ${country.position.y}px`
                          }}
                          onClick={() => setSelectedCountry(country)}
                          onMouseEnter={() => setHoveredCountry(country)}
                          onMouseLeave={() => setHoveredCountry(null)}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Tooltip de país al hacer hover */}
                {hoveredCountry && (
                  <div 
                    className="absolute bg-white px-4 py-3 rounded-lg shadow-lg border-2 pointer-events-none z-10"
                    style={{
                      borderColor: '#ffc526',
                      left: `${(hoveredCountry.position.x / 2000) * 100}%`,
                      top: `${(hoveredCountry.position.y / 857) * 100}%`,
                      transform: 'translate(-50%, -120%)'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{hoveredCountry.flag}</span>
                      <span className="font-medium">{hoveredCountry.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm" style={{ color: '#40b4e5' }}>
                      <Users className="h-4 w-4" />
                      <span>{hoveredCountry.graduates.toLocaleString()} egresados</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Leyenda */}
              <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#40b4e5' }}></div>
                  <span>Ubicación de egresados</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#40b4e5' }}></div>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#40b4e5' }}></div>
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: '#40b4e5' }}></div>
                  </div>
                  <span>Tamaño = Cantidad de egresados</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Información Detallada */}
        <div className="lg:col-span-4 space-y-6">
          {/* País Seleccionado */}
          <Card style={{ borderColor: '#ffc526', borderWidth: '2px' }}>
            <CardHeader style={{ backgroundColor: '#ffc526' }}>
              <CardTitle className="flex items-center gap-2" style={{ color: '#12100c' }}>
                <span className="text-3xl">{selectedCountry.flag}</span>
                {selectedCountry.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Egresados registrados</span>
                  <Badge style={{ backgroundColor: '#40b4e5', color: 'white' }} className="text-lg px-3 py-1">
                    {selectedCountry.graduates.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">% del total</span>
                  <span className="font-medium">
                    {((selectedCountry.graduates / totalGraduates) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Sectores */}
          <Card>
            <CardHeader style={{ backgroundColor: '#047732' }}>
              <CardTitle className="text-white">
                Principales Sectores Laborales
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={selectedCountry.sectors}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {selectedCountry.sectors.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${value}%`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '2px solid #40b4e5',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-sm">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Próximos Eventos */}
          <Card>
            <CardHeader style={{ backgroundColor: '#40b4e5' }}>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximos Eventos de Egresados
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {selectedCountry.events.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg border-2 hover:shadow-md transition-shadow"
                    style={{ borderColor: '#e0f2fe' }}
                  >
                    <h4 className="font-medium mb-1" style={{ color: '#12100c' }}>
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{event.attendees} asistentes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Estadísticas Adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card style={{ borderColor: '#40b4e5', borderWidth: '1px' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#e0f2fe' }}>
                <MapPin className="h-6 w-6" style={{ color: '#40b4e5' }} />
              </div>
              <div>
                <div className="text-sm text-gray-600">Países con presencia</div>
                <div className="text-2xl" style={{ color: '#12100c' }}>
                  {countriesData.length}
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
                <div className="text-sm text-gray-600">Promedio por país</div>
                <div className="text-2xl" style={{ color: '#12100c' }}>
                  {Math.round(totalGraduates / countriesData.length)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: '#047732', borderWidth: '1px' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#e6f7ed' }}>
                <TrendingUp className="h-6 w-6" style={{ color: '#047732' }} />
              </div>
              <div>
                <div className="text-sm text-gray-600">Crecimiento anual</div>
                <div className="text-2xl" style={{ color: '#12100c' }}>
                  +12.5%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: '#40b4e5', borderWidth: '1px' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#e0f2fe' }}>
                <Calendar className="h-6 w-6" style={{ color: '#40b4e5' }} />
              </div>
              <div>
                <div className="text-sm text-gray-600">Eventos próximos</div>
                <div className="text-2xl" style={{ color: '#12100c' }}>
                  {countriesData.reduce((sum, c) => sum + c.events.length, 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GraduateDiasporaReport;