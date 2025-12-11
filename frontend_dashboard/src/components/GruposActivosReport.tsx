import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, Users, Hash, BarChart3, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { getReportPreview, downloadReportPDF } from '../services/api';

interface GrupoData {
    nombre_grupo: string;
    descripcion_grupo: string;
    total_miembros: number;
}

const GruposActivosReport = () => {
    const [data, setData] = useState<GrupoData[]>([]);
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
            const response = await getReportPreview('grupos');
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
            await downloadReportPDF('grupos');
        } catch {
            alert('Error al descargar PDF');
        } finally {
            setDownloading(false);
        }
    };

    // Métricas calculadas
    const totalGrupos = data.length;
    const totalMiembros = data.reduce((sum, r) => sum + (Number(r.total_miembros) || 0), 0);
    const promedioMiembros = totalGrupos > 0 ? (totalMiembros / totalGrupos).toFixed(1) : 0;
    const grupoTop = data[0]?.nombre_grupo || 'N/A';

    const getMiembrosColor = (miembros: number): string => {
        if (miembros >= 10) return '#047732';
        if (miembros >= 5) return '#40b4e5';
        if (miembros >= 2) return '#ffc526';
        return '#6b7280';
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
                    <h1 className="text-3xl font-bold">Grupos Más Activos</h1>
                    <p className="text-gray-600">Top 10 grupos de interés por cantidad de miembros</p>
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
                                <p className="text-sm text-gray-600">Total Grupos</p>
                                <p className="text-2xl font-bold" style={{ color: '#40b4e5' }}>{totalGrupos}</p>
                                <p className="text-sm text-gray-500">grupos activos</p>
                            </div>
                            <Hash className="h-8 w-8" style={{ color: '#40b4e5' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Miembros</p>
                                <p className="text-2xl font-bold" style={{ color: '#047732' }}>{totalMiembros}</p>
                                <p className="text-sm text-gray-500">participantes</p>
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
                                <p className="text-2xl font-bold" style={{ color: '#ffc526' }}>{promedioMiembros}</p>
                                <p className="text-sm text-gray-500">miembros/grupo</p>
                            </div>
                            <BarChart3 className="h-8 w-8" style={{ color: '#ffc526' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0 mr-2">
                                <p className="text-sm text-gray-600">Grupo #1</p>
                                <p className="text-sm font-semibold truncate" title={grupoTop}>{grupoTop}</p>
                                <p className="text-sm text-gray-500">más activo</p>
                            </div>
                            <span className="text-2xl flex-shrink-0">🏆</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Ranking de Grupos</CardTitle>
                    <p className="text-gray-600">Ordenado por cantidad de miembros</p>
                </CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">Rank</TableHead>
                                    <TableHead>Nombre del Grupo</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead className="text-center">Miembros</TableHead>
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
                                        <TableCell className="font-medium">{item.nombre_grupo || '-'}</TableCell>
                                        <TableCell className="text-gray-600 max-w-[300px] truncate">
                                            {item.descripcion_grupo || '-'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                style={{
                                                    backgroundColor: getMiembrosColor(Number(item.total_miembros) || 0),
                                                    color: 'white'
                                                }}
                                            >
                                                {item.total_miembros || 0}
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

export default GruposActivosReport;
