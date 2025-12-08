import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Building2, TrendingUp, Briefcase, Award } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Mock data para empresas top
const companiesData = [
  {
    id: 1,
    name: 'Mercantil Banco',
    offers: 47,
    hiringRate: 92.5,
    sector: 'Finanzas'
  },
  {
    id: 2,
    name: 'Empresas Polar',
    offers: 38,
    hiringRate: 88.3,
    sector: 'Manufactura'
  },
  {
    id: 3,
    name: 'Bancaribe',
    offers: 34,
    hiringRate: 85.7,
    sector: 'Finanzas'
  },
  {
    id: 4,
    name: 'KPMG Venezuela',
    offers: 31,
    hiringRate: 90.2,
    sector: 'Consultoría'
  },
  {
    id: 5,
    name: 'Banesco',
    offers: 29,
    hiringRate: 82.4,
    sector: 'Finanzas'
  },
  {
    id: 6,
    name: 'PwC Venezuela',
    offers: 27,
    hiringRate: 87.9,
    sector: 'Consultoría'
  },
  {
    id: 7,
    name: 'Digitel',
    offers: 25,
    hiringRate: 81.6,
    sector: 'Telecomunicaciones'
  },
  {
    id: 8,
    name: 'Ron Santa Teresa',
    offers: 22,
    hiringRate: 79.2,
    sector: 'Manufactura'
  },
  {
    id: 9,
    name: 'Deloitte Venezuela',
    offers: 21,
    hiringRate: 86.5,
    sector: 'Consultoría'
  },
  {
    id: 10,
    name: 'Movistar Venezuela',
    offers: 19,
    hiringRate: 78.8,
    sector: 'Telecomunicaciones'
  }
];

// Data para gráfico de ofertas por carrera
const careerOffersData = [
  { career: 'Ingeniería Informática', offers: 125 },
  { career: 'Administración', offers: 98 },
  { career: 'Contaduría Pública', offers: 87 },
  { career: 'Economía', offers: 72 },
  { career: 'Ing. Industrial', offers: 68 },
  { career: 'Derecho', offers: 56 },
  { career: 'Comunicación Social', offers: 45 },
  { career: 'Psicología', offers: 38 }
];

// Data para evolución de ofertas (últimos 6 meses)
const evolutionData = [
  { month: 'May', offers: 78 },
  { month: 'Jun', offers: 92 },
  { month: 'Jul', offers: 85 },
  { month: 'Ago', offers: 105 },
  { month: 'Sep', offers: 118 },
  { month: 'Oct', offers: 134 }
];

const CompanyUniversityLinkReport = () => {
  const [filters, setFilters] = useState({
    period: '2025-2',
    sector: 'all'
  });

  const totalOffers = companiesData.reduce((sum, company) => sum + company.offers, 0);
  const avgHiringRate = companiesData.reduce((sum, company) => sum + company.hiringRate, 0) / companiesData.length;

  const filteredCompanies = filters.sector === 'all' 
    ? companiesData 
    : companiesData.filter(c => c.sector === filters.sector);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl" style={{ color: '#12100c' }}>
            Análisis de Vinculación Empresarial
          </h1>
          <p className="text-gray-600 mt-2">
            Monitoreo de oportunidades de pasantías y colaboración empresa-universidad
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-600">Total de Ofertas</div>
            <div className="text-2xl" style={{ color: '#40b4e5' }}>
              {totalOffers}
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card style={{ borderColor: '#40b4e5', borderWidth: '2px' }}>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2" style={{ color: '#12100c' }}>
                Período Académico
              </label>
              <Select value={filters.period} onValueChange={(value) => setFilters({ ...filters, period: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025-2">Sep 2025 - Ene 2026</SelectItem>
                  <SelectItem value="2025-1">Ene 2025 - Jul 2025</SelectItem>
                  <SelectItem value="2024-2">Sep 2024 - Ene 2025</SelectItem>
                  <SelectItem value="2024-1">Ene 2024 - Jul 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#12100c' }}>
                Sector Empresarial
              </label>
              <Select value={filters.sector} onValueChange={(value) => setFilters({ ...filters, sector: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los sectores</SelectItem>
                  <SelectItem value="Finanzas">Finanzas y Banca</SelectItem>
                  <SelectItem value="Consultoría">Consultoría</SelectItem>
                  <SelectItem value="Manufactura">Manufactura</SelectItem>
                  <SelectItem value="Telecomunicaciones">Telecomunicaciones</SelectItem>
                  <SelectItem value="Tecnología">Tecnología</SelectItem>
                  <SelectItem value="Salud">Salud</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card style={{ borderColor: '#40b4e5', borderWidth: '1px' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#e0f2fe' }}>
                <Building2 className="h-6 w-6" style={{ color: '#40b4e5' }} />
              </div>
              <div>
                <div className="text-sm text-gray-600">Empresas Activas</div>
                <div className="text-2xl" style={{ color: '#12100c' }}>
                  {filteredCompanies.length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: '#ffc526', borderWidth: '1px' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#fff9e5' }}>
                <Briefcase className="h-6 w-6" style={{ color: '#ffc526' }} />
              </div>
              <div>
                <div className="text-sm text-gray-600">Total de Ofertas</div>
                <div className="text-2xl" style={{ color: '#12100c' }}>
                  {totalOffers}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: '#047732', borderWidth: '1px' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#e6f7ed' }}>
                <Award className="h-6 w-6" style={{ color: '#047732' }} />
              </div>
              <div>
                <div className="text-sm text-gray-600">Tasa Promedio</div>
                <div className="text-2xl" style={{ color: '#12100c' }}>
                  {avgHiringRate.toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: '#40b4e5', borderWidth: '1px' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#e0f2fe' }}>
                <TrendingUp className="h-6 w-6" style={{ color: '#40b4e5' }} />
              </div>
              <div>
                <div className="text-sm text-gray-600">Crecimiento</div>
                <div className="text-2xl" style={{ color: '#12100c' }}>
                  +13.4%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tabla de Empresas Top - Columna Izquierda */}
        <div className="lg:col-span-5">
          <Card className="h-full" style={{ borderColor: '#40b4e5', borderWidth: '1px' }}>
            <CardHeader style={{ backgroundColor: '#40b4e5' }}>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Empresas Top - Ranking
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#f0f9ff', borderBottom: '2px solid #40b4e5' }}>
                      <th className="px-4 py-3 text-left text-sm" style={{ color: '#12100c' }}>
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-sm" style={{ color: '#12100c' }}>
                        Empresa
                      </th>
                      <th className="px-4 py-3 text-center text-sm" style={{ color: '#12100c' }}>
                        Ofertas
                      </th>
                      <th className="px-4 py-3 text-center text-sm" style={{ color: '#12100c' }}>
                        Tasa %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies.map((company, index) => (
                      <tr
                        key={company.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center">
                            {index < 3 ? (
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{
                                  backgroundColor: index === 0 ? '#ffc526' : index === 1 ? '#e0e0e0' : '#cd7f32'
                                }}
                              >
                                <span className="text-white">{index + 1}</span>
                              </div>
                            ) : (
                              <span className="text-gray-600">{index + 1}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e0f2fe' }}>
                              <Building2 className="h-5 w-5" style={{ color: '#40b4e5' }} />
                            </div>
                            <div>
                              <div className="font-medium" style={{ color: '#12100c' }}>
                                {company.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {company.sector}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Badge
                            style={{ backgroundColor: '#40b4e5', color: 'white' }}
                            className="px-3 py-1"
                          >
                            {company.offers}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <span
                              className="font-medium"
                              style={{
                                color: company.hiringRate >= 85 ? '#047732' : company.hiringRate >= 75 ? '#ffc526' : '#12100c'
                              }}
                            >
                              {company.hiringRate.toFixed(1)}%
                            </span>
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${company.hiringRate}%`,
                                  backgroundColor: company.hiringRate >= 85 ? '#047732' : company.hiringRate >= 75 ? '#ffc526' : '#40b4e5'
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos - Columna Derecha */}
        <div className="lg:col-span-7 space-y-6">
          {/* Gráfico de Barras Horizontales - Ofertas por Carrera */}
          <Card style={{ borderColor: '#ffc526', borderWidth: '1px' }}>
            <CardHeader style={{ backgroundColor: '#ffc526' }}>
              <CardTitle className="flex items-center gap-2" style={{ color: '#12100c' }}>
                <Briefcase className="h-5 w-5" />
                Ofertas de Pasantías por Carrera
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={careerOffersData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis type="number" stroke="#666" />
                  <YAxis
                    dataKey="career"
                    type="category"
                    stroke="#666"
                    width={110}
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '2px solid #40b4e5',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value} ofertas`, 'Total']}
                  />
                  <Bar dataKey="offers" fill="#40b4e5" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Líneas - Evolución de Ofertas */}
          <Card style={{ borderColor: '#047732', borderWidth: '1px' }}>
            <CardHeader style={{ backgroundColor: '#047732' }}>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Evolución de Ofertas Publicadas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={evolutionData}
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
                    formatter={(value: number) => [`${value} ofertas`, 'Total']}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '10px' }}
                    formatter={() => 'Ofertas Publicadas'}
                  />
                  <Line
                    type="monotone"
                    dataKey="offers"
                    stroke="#047732"
                    strokeWidth={3}
                    dot={{ fill: '#047732', r: 6 }}
                    activeDot={{ r: 8, fill: '#ffc526' }}
                  />
                </LineChart>
              </ResponsiveContainer>

              {/* Insights */}
              <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#e6f7ed' }}>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 mt-0.5" style={{ color: '#047732' }} />
                  <div>
                    <h4 className="font-medium mb-1" style={{ color: '#047732' }}>
                      Tendencia Positiva
                    </h4>
                    <p className="text-sm text-gray-700">
                      Las ofertas de pasantías han incrementado un <strong>71.8%</strong> en los últimos 6 meses,
                      reflejando un fortalecimiento en la vinculación empresa-universidad.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer con Información Adicional */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-sm text-gray-600 mb-1">Empresa con Mayor Contratación</div>
              <div className="font-medium" style={{ color: '#40b4e5' }}>
                {companiesData[0].name}
              </div>
              <div className="text-sm text-gray-500">
                {companiesData[0].hiringRate}% de tasa de contratación
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Carrera Más Demandada</div>
              <div className="font-medium" style={{ color: '#ffc526' }}>
                {careerOffersData[0].career}
              </div>
              <div className="text-sm text-gray-500">
                {careerOffersData[0].offers} ofertas publicadas
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Sector Más Activo</div>
              <div className="font-medium" style={{ color: '#047732' }}>
                Finanzas y Banca
              </div>
              <div className="text-sm text-gray-500">
                110 ofertas en total
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyUniversityLinkReport;