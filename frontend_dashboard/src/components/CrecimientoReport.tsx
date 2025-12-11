import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, Users, Calendar, Briefcase, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { getReportPreview, downloadReportPDF } from '../services/api';

interface CrecimientoData {
    mes_registro: string;
    ocupacion: string;
    nuevos_registros: number;
}

const CrecimientoReport = () => {
    const [data, setData] = useState<CrecimientoData[]>([]);
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
            const response = await getReportPreview('crecimiento');
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
            await downloadReportPDF('crecimiento');
        } catch {
            alert('Error al descargar PDF');
        } finally {
            setDownloading(false);
        }
    };

    // Métricas calculadas
    const totalRegistros = data.reduce((sum, r) => sum + (Number(r.nuevos_registros) || 0), 0);
    const mesesUnicos = [...new Set(data.map(r => r.mes_registro))].length;
    const ocupaciones = [...new Set(data.map(r => r.ocupacion))];
    const topOcupacion = data.reduce((max, r) =>
        (Number(r.nuevos_registros) || 0) > (Number(max?.nuevos_registros) || 0) ? r : max, data[0])?.ocupacion || 'N/A';

    const getOcupacionColor = (ocupacion: string): string => {
        if (ocupacion === 'Estudiante') return '#40b4e5';
        if (ocupacion === 'Profesor') return '#047732';
        if (ocupacion === 'Egresado') return '#ffc526';
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
                    <h1 className="text-3xl font-bold">Crecimiento Demográfico</h1>
                    <p className="text-gray-600">Nuevos registros por mes y tipo de ocupación</p>
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
                                <p className="text-sm text-gray-600">Total Registros</p>
                                <p className="text-2xl font-bold" style={{ color: '#40b4e5' }}>{totalRegistros}</p>
                                <p className="text-sm text-gray-500">nuevos miembros</p>
                            </div>
                            <Users className="h-8 w-8" style={{ color: '#40b4e5' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Meses Analizados</p>
                                <p className="text-2xl font-bold" style={{ color: '#047732' }}>{mesesUnicos}</p>
                                <p className="text-sm text-gray-500">períodos</p>
                            </div>
                            <Calendar className="h-8 w-8" style={{ color: '#047732' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Tipos Ocupación</p>
                                <p className="text-2xl font-bold" style={{ color: '#ffc526' }}>{ocupaciones.length}</p>
                                <p className="text-sm text-gray-500">categorías</p>
                            </div>
                            <Briefcase className="h-8 w-8" style={{ color: '#ffc526' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0 mr-2">
                                <p className="text-sm text-gray-600">Más Registros</p>
                                <p className="text-sm font-semibold truncate" title={topOcupacion}>{topOcupacion}</p>
                                <p className="text-sm text-gray-500">ocupación líder</p>
                            </div>
                            <span className="text-2xl flex-shrink-0">📈</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Registros por Período</CardTitle>
                    <p className="text-gray-600">Ordenado por mes de registro (más recientes primero)</p>
                </CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mes</TableHead>
                                    <TableHead>Ocupación</TableHead>
                                    <TableHead className="text-center">Nuevos Registros</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{item.mes_registro || '-'}</TableCell>
                                        <TableCell>
                                            <Badge
                                                style={{
                                                    backgroundColor: getOcupacionColor(item.ocupacion),
                                                    color: 'white'
                                                }}
                                            >
                                                {item.ocupacion || '-'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" style={{ borderColor: '#047732', color: '#047732' }}>
                                                {item.nuevos_registros || 0}
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

export default CrecimientoReport;
