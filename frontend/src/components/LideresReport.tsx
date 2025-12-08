import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, Users, FileText, TrendingUp, Loader2, MapPin } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { getReportPreview, downloadReportPDF } from '../services/api';

interface LiderData {
    influencer: string;
    total_publicaciones: number;
    impacto_acumulado_comunidad: number;
    ubicacion: string;
}

const LideresReport = () => {
    const [data, setData] = useState<LiderData[]>([]);
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
            console.log('[LideresReport] Fetching data...');
            const response = await getReportPreview('lideres');
            console.log('[LideresReport] Response:', response);
            if (response.success) {
                setData(response.data);
            } else {
                setError(response.error || 'Error al cargar datos');
            }
        } catch (err) {
            console.error('[LideresReport] Error:', err);
            setError(err instanceof Error ? err.message : 'Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            setDownloading(true);
            await downloadReportPDF('lideres');
        } catch (err) {
            alert('Error al descargar PDF');
        } finally {
            setDownloading(false);
        }
    };

    // Métricas calculadas (PostgreSQL devuelve bigints como strings)
    const totalLideres = data.length;
    const totalPubs = data.reduce((sum, r) => sum + (Number(r.total_publicaciones) || 0), 0);
    const totalImpacto = data.reduce((sum, r) => sum + (Number(r.impacto_acumulado_comunidad) || 0), 0);
    const topInfluencer = data[0]?.influencer || 'N/A';

    const getImpactoColor = (impacto: number | string): string => {
        const val = Number(impacto) || 0;
        if (val >= 50) return '#047732';
        if (val >= 20) return '#40b4e5';
        if (val >= 10) return '#ffc526';
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
                    <h1 className="text-3xl font-bold">Líderes de Opinión</h1>
                    <p className="text-gray-600">Usuarios más activos en generación de contenido</p>
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
                                <p className="text-sm text-gray-600">Total Líderes</p>
                                <p className="text-2xl font-bold" style={{ color: '#40b4e5' }}>{totalLideres}</p>
                                <p className="text-sm text-gray-500">usuarios activos</p>
                            </div>
                            <Users className="h-8 w-8" style={{ color: '#40b4e5' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Publicaciones</p>
                                <p className="text-2xl font-bold" style={{ color: '#047732' }}>{totalPubs}</p>
                                <p className="text-sm text-gray-500">contenido generado</p>
                            </div>
                            <FileText className="h-8 w-8" style={{ color: '#047732' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Impacto Total</p>
                                <p className="text-2xl font-bold" style={{ color: '#ffc526' }}>{totalImpacto.toFixed(0)}</p>
                                <p className="text-sm text-gray-500">puntos acumulados</p>
                            </div>
                            <TrendingUp className="h-8 w-8" style={{ color: '#ffc526' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0 mr-2">
                                <p className="text-sm text-gray-600">Top Influencer</p>
                                <p className="text-sm font-semibold truncate" title={topInfluencer}>{topInfluencer}</p>
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
                    <CardTitle>Ranking de Líderes de Opinión</CardTitle>
                    <p className="text-gray-600">Ordenado por impacto acumulado en la comunidad</p>
                </CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">Rank</TableHead>
                                    <TableHead>Influencer</TableHead>
                                    <TableHead className="text-center">Publicaciones</TableHead>
                                    <TableHead className="text-center">Impacto Acumulado</TableHead>
                                    <TableHead>Ubicación</TableHead>
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
                                        <TableCell className="font-medium">{item.influencer || '-'}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline">{item.total_publicaciones || 0}</Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                style={{
                                                    backgroundColor: getImpactoColor(item.impacto_acumulado_comunidad),
                                                    color: 'white'
                                                }}
                                            >
                                                {item.impacto_acumulado_comunidad || 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-600">
                                            <div className="flex items-center">
                                                <MapPin className="h-4 w-4 mr-1" />
                                                {item.ubicacion || '-'}
                                            </div>
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

export default LideresReport;
