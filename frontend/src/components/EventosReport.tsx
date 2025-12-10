import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, Calendar, Users, CheckCircle, Loader2, MapPin, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { getReportPreview, downloadReportPDF } from '../services/api';

interface EventoData {
    nombre_evento: string;
    fecha_inicio: string;
    lugar: string;
    interesados_potenciales: number;
    status_proyeccion: string;
}

const EventosReport = () => {
    const [data, setData] = useState<EventoData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await getReportPreview('eventos');
            if (response.success) {
                setData(response.data);
            } else {
                setError(response.error || 'Error al cargar datos');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            setDownloading(true);
            await downloadReportPDF('eventos');
        } catch (err) {
            alert('Error al descargar PDF');
        } finally {
            setDownloading(false);
        }
    };

    // Métricas calculadas
    const totalEventos = data.length;
    const totalInteresados = data.reduce((sum, r) => sum + (Number(r.interesados_potenciales) || 0), 0);
    const exitoCount = data.filter(r => r.status_proyeccion === 'EXITO ASEGURADO').length;
    const nextEvent = data[0]?.nombre_evento || 'N/A';

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'EXITO ASEGURADO':
                return { backgroundColor: '#dcfce7', color: '#047732', borderColor: '#047732' };
            case 'BUENA PROYECCION':
                return { backgroundColor: '#e0f2fe', color: '#0284c7', borderColor: '#0284c7' };
            case 'RIESGO DE BAJA ASISTENCIA':
                return { backgroundColor: '#fef3c7', color: '#d97706', borderColor: '#d97706' };
            default:
                return { backgroundColor: '#f3f4f6', color: '#6b7280', borderColor: '#6b7280' };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#40b4e5' }} />
                <span className="ml-2">Cargando datos...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-red-500">
                        <p>Error: {error}</p>
                        <Button onClick={loadData} className="mt-4">Reintentar</Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold">Proyección de Interés en Eventos</h1>
                    <p className="text-gray-600">Predicción de asistencia basada en interacciones</p>
                </div>
                <div className="flex space-x-3">
                    <Button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="flex items-center space-x-2"
                        style={{ backgroundColor: '#ffc526', color: '#12100c' }}
                    >
                        {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        <span>{downloading ? 'Generando...' : 'Exportar PDF'}</span>
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Eventos Futuros</p>
                                <p className="text-2xl font-bold" style={{ color: '#40b4e5' }}>{totalEventos}</p>
                                <p className="text-sm text-gray-500">programados</p>
                            </div>
                            <Calendar className="h-8 w-8" style={{ color: '#40b4e5' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Interesados</p>
                                <p className="text-2xl font-bold" style={{ color: '#047732' }}>{totalInteresados}</p>
                                <p className="text-sm text-gray-500">potenciales asistentes</p>
                            </div>
                            <Users className="h-8 w-8" style={{ color: '#047732' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Éxito Asegurado</p>
                                <p className="text-2xl font-bold" style={{ color: '#ffc526' }}>{exitoCount}</p>
                                <p className="text-sm text-gray-500">eventos confirmados</p>
                            </div>
                            <CheckCircle className="h-8 w-8" style={{ color: '#ffc526' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0 mr-2">
                                <p className="text-sm text-gray-600">Próximo Evento</p>
                                <p className="text-sm font-semibold truncate" title={nextEvent}>{nextEvent}</p>
                                <p className="text-sm text-gray-500">más cercano</p>
                            </div>
                            <Clock className="h-8 w-8 flex-shrink-0" style={{ color: '#40b4e5' }} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Eventos Próximos y Proyección</CardTitle>
                    <p className="text-gray-600">Ordenado por fecha de inicio (próximos primero)</p>
                </CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No hay eventos futuros programados</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Evento</TableHead>
                                    <TableHead className="text-center">Fecha Inicio</TableHead>
                                    <TableHead>Lugar</TableHead>
                                    <TableHead className="text-center">Interesados</TableHead>
                                    <TableHead className="text-center">Proyección</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((item, index) => {
                                    const statusStyle = getStatusStyle(item.status_proyeccion);
                                    return (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium max-w-[200px] truncate">
                                                {item.nombre_evento || '-'}
                                            </TableCell>
                                            <TableCell className="text-center text-gray-600">
                                                {item.fecha_inicio
                                                    ? new Date(item.fecha_inicio).toLocaleDateString('es-VE', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-gray-600">
                                                    <MapPin className="h-4 w-4 mr-1" />
                                                    {item.lugar || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className="font-semibold">
                                                    {item.interesados_potenciales || 0}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    style={{
                                                        backgroundColor: statusStyle.backgroundColor,
                                                        color: statusStyle.color,
                                                        border: `1px solid ${statusStyle.borderColor}`
                                                    }}
                                                >
                                                    {item.status_proyeccion || '-'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default EventosReport;
