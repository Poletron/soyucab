import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, BookOpen, Users, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { getReportPreview, downloadReportPDF } from '../services/api';

interface TutoriaData {
    area_conocimiento: string;
    total_solicitudes_area: number;
    total_tutores_disponibles: number;
}

const TutoriasReport = () => {
    const [data, setData] = useState<TutoriaData[]>([]);
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
            const response = await getReportPreview('tutorias');
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
            await downloadReportPDF('tutorias');
        } catch (err) {
            alert('Error al descargar PDF');
        } finally {
            setDownloading(false);
        }
    };

    const totalSolicitudes = data.reduce((sum, r) => sum + (Number(r.total_solicitudes_area) || 0), 0);
    const totalTutores = data.reduce((sum, r) => sum + (Number(r.total_tutores_disponibles) || 0), 0);
    const areasCount = data.length;
    const topArea = data[0]?.area_conocimiento || 'N/A';

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
            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold">Top Áreas de Conocimiento en Tutorías</h1>
                    <p className="text-gray-600">Top 5 áreas más demandadas</p>
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Solicitudes</p>
                                <p className="text-2xl font-bold" style={{ color: '#40b4e5' }}>{totalSolicitudes}</p>
                                <p className="text-sm text-gray-500">demanda tutorías</p>
                            </div>
                            <BookOpen className="h-8 w-8" style={{ color: '#40b4e5' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Áreas Analizadas</p>
                                <p className="text-2xl font-bold" style={{ color: '#047732' }}>{areasCount}</p>
                                <p className="text-sm text-gray-500">top 5 áreas</p>
                            </div>
                            <BookOpen className="h-8 w-8" style={{ color: '#047732' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Tutores Totales</p>
                                <p className="text-2xl font-bold" style={{ color: '#ffc526' }}>{totalTutores}</p>
                                <p className="text-sm text-gray-500">disponibles</p>
                            </div>
                            <Users className="h-8 w-8" style={{ color: '#ffc526' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0 mr-2">
                                <p className="text-sm text-gray-600">Área Top</p>
                                <p className="text-sm font-semibold truncate" title={topArea}>{topArea}</p>
                                <p className="text-sm text-gray-500">más demandada</p>
                            </div>
                            <span className="text-2xl flex-shrink-0">📚</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Ranking de Áreas por Demanda</CardTitle>
                    <p className="text-gray-600">Vista: vista_top5_areas_conocimiento_demanda</p>
                </CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">Rank</TableHead>
                                    <TableHead>Área de Conocimiento</TableHead>
                                    <TableHead className="text-center">Total Solicitudes</TableHead>
                                    <TableHead className="text-center">Tutores Disponibles</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                                                style={{ backgroundColor: index < 3 ? '#40b4e5' : '#6b7280' }}
                                            >
                                                {index + 1}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{item.area_conocimiento || '-'}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge style={{ backgroundColor: '#047732', color: 'white' }}>
                                                {item.total_solicitudes_area || 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center text-gray-600">
                                            {item.total_tutores_disponibles || 0}
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

export default TutoriasReport;
