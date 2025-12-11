import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, Briefcase, Users, TrendingUp, Award, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { getReportPreview, downloadReportPDF } from '../services/api';

interface OfertaData {
    titulo_oferta: string;
    nombre_organizacion: string;
    cantidad_postulantes: number;
}

const OfertasReport = () => {
    const [data, setData] = useState<OfertaData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getReportPreview('ofertas');
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
            await downloadReportPDF('ofertas');
        } catch {
            alert('Error al descargar PDF');
        } finally {
            setDownloading(false);
        }
    };

    // Métricas calculadas
    const totalOfertas = data.length;
    const totalPostulantes = data.reduce((sum, r) => sum + (Number(r.cantidad_postulantes) || 0), 0);
    const promedioPostulantes = totalOfertas > 0 ? (totalPostulantes / totalOfertas).toFixed(1) : 0;
    const topOferta = data[0]?.titulo_oferta || 'N/A';

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
                    <h1 className="text-3xl font-bold">Top 10 Ofertas Laborales Más Postuladas</h1>
                    <p className="text-gray-600">Ofertas laborales con más postulaciones</p>
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
                                <p className="text-sm text-gray-600">Total Ofertas</p>
                                <p className="text-2xl font-bold" style={{ color: '#40b4e5' }}>{totalOfertas}</p>
                                <p className="text-sm text-gray-500">ofertas analizadas</p>
                            </div>
                            <Briefcase className="h-8 w-8" style={{ color: '#40b4e5' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Postulantes</p>
                                <p className="text-2xl font-bold" style={{ color: '#047732' }}>{totalPostulantes}</p>
                                <p className="text-sm text-gray-500">aplicaciones</p>
                            </div>
                            <Users className="h-8 w-8" style={{ color: '#047732' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Promedio</p>
                                <p className="text-2xl font-bold" style={{ color: '#ffc526' }}>{promedioPostulantes}</p>
                                <p className="text-sm text-gray-500">postulantes/oferta</p>
                            </div>
                            <TrendingUp className="h-8 w-8" style={{ color: '#ffc526' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0 mr-2">
                                <p className="text-sm text-gray-600">Oferta Top</p>
                                <p className="text-sm font-semibold truncate" title={topOferta}>{topOferta}</p>
                                <p className="text-sm text-gray-500">más popular</p>
                            </div>
                            <Award className="h-8 w-8 flex-shrink-0" style={{ color: '#12100c' }} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Ranking de Ofertas Laborales</CardTitle>
                    <p className="text-gray-600">Ordenado por cantidad de postulantes</p>
                </CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">#</TableHead>
                                    <TableHead>Título Oferta</TableHead>
                                    <TableHead>Organización</TableHead>
                                    <TableHead className="text-center">Postulantes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Badge
                                                style={{
                                                    backgroundColor: index < 3 ? '#40b4e5' : '#e5e7eb',
                                                    color: index < 3 ? 'white' : '#6b7280'
                                                }}
                                            >
                                                {index + 1}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">{item.titulo_oferta || '-'}</TableCell>
                                        <TableCell>{item.nombre_organizacion || '-'}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" style={{ borderColor: '#047732', color: '#047732' }}>
                                                {item.cantidad_postulantes || 0}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default OfertasReport;
