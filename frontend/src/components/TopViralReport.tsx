import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, TrendingUp, MessageCircle, Heart, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { getReportPreview, downloadReportPDF } from '../services/api';

interface ViralData {
    ranking: number;
    autor: string;
    contenido_titulo: string;
    fecha_hora_creacion: string;
    score_viralidad: number;
    total_comentarios: number;
    total_reacciones: number;
}

const TopViralReport = () => {
    const [data, setData] = useState<ViralData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await getReportPreview('viralidad');
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
            await downloadReportPDF('viralidad');
        } catch (err) {
            alert('Error al descargar PDF');
        } finally {
            setDownloading(false);
        }
    };

    // Métricas calculadas
    const totalContenido = data.length;
    const avgScore = data.length > 0
        ? (data.reduce((sum, r) => sum + (r.score_viralidad || 0), 0) / data.length).toFixed(1)
        : '0';
    const totalComentarios = data.reduce((sum, r) => sum + (r.total_comentarios || 0), 0);
    const topContent = data[0]?.contenido_titulo || 'N/A';

    const getScoreLevel = (score: number): string => {
        if (score >= 10) return 'Muy Alto';
        if (score >= 5) return 'Alto';
        if (score >= 2) return 'Medio';
        return 'Bajo';
    };

    const getScoreColor = (score: number): string => {
        if (score >= 10) return '#047732';
        if (score >= 5) return '#40b4e5';
        if (score >= 2) return '#ffc526';
        return '#ef4444';
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
                    <h1 className="text-3xl font-bold">Top Contenido Viral</h1>
                    <p className="text-gray-600">Ranking de publicaciones con mayor impacto</p>
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
                                <p className="text-sm text-gray-600">Total Contenido</p>
                                <p className="text-2xl font-bold" style={{ color: '#40b4e5' }}>{totalContenido}</p>
                                <p className="text-sm text-gray-500">publicaciones</p>
                            </div>
                            <TrendingUp className="h-8 w-8" style={{ color: '#40b4e5' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Score Promedio</p>
                                <p className="text-2xl font-bold" style={{ color: '#047732' }}>{avgScore}</p>
                                <p className="text-sm text-gray-500">nivel de impacto</p>
                            </div>
                            <Heart className="h-8 w-8" style={{ color: '#047732' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Comentarios</p>
                                <p className="text-2xl font-bold" style={{ color: '#ffc526' }}>{totalComentarios}</p>
                                <p className="text-sm text-gray-500">en total</p>
                            </div>
                            <MessageCircle className="h-8 w-8" style={{ color: '#ffc526' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0 mr-2">
                                <p className="text-sm text-gray-600">Mejor Contenido</p>
                                <p className="text-sm font-semibold truncate" title={topContent}>{topContent}</p>
                                <p className="text-sm text-gray-500">#1 en ranking</p>
                            </div>
                            <span className="text-2xl flex-shrink-0">🏆</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Ranking de Contenido por Impacto</CardTitle>
                    <p className="text-gray-600">Ordenado por score de viralidad (FN_CALCULAR_NIVEL_IMPACTO)</p>
                </CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">Rank</TableHead>
                                    <TableHead>Autor</TableHead>
                                    <TableHead>Contenido</TableHead>
                                    <TableHead className="text-center">Fecha</TableHead>
                                    <TableHead className="text-center">Score</TableHead>
                                    <TableHead className="text-center">Comentarios</TableHead>
                                    <TableHead className="text-center">Reacciones</TableHead>
                                    <TableHead className="text-center">Nivel</TableHead>
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
                                                {item.ranking || index + 1}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{item.autor || '-'}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">
                                            {item.contenido_titulo || '-'}
                                        </TableCell>
                                        <TableCell className="text-center text-gray-600">
                                            {item.fecha_hora_creacion
                                                ? new Date(item.fecha_hora_creacion).toLocaleDateString('es-VE')
                                                : '-'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                style={{
                                                    backgroundColor: getScoreColor(item.score_viralidad),
                                                    color: 'white'
                                                }}
                                            >
                                                {item.score_viralidad || 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center" style={{ color: '#ffc526', fontWeight: 600 }}>
                                            {item.total_comentarios || 0}
                                        </TableCell>
                                        <TableCell className="text-center" style={{ color: '#047732', fontWeight: 600 }}>
                                            {item.total_reacciones || 0}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant="outline"
                                                style={{ borderColor: getScoreColor(item.score_viralidad) }}
                                            >
                                                {getScoreLevel(item.score_viralidad)}
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

export default TopViralReport;
