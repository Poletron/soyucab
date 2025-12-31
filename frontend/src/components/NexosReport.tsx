import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, Link, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { getReportPreview, downloadReportPDF } from '../services/api';

interface NexoData {
    tipo_convenio: string;
    nombre_persona: string;
    nombre_organizacion: string;
    fecha_inicio: string;
    fecha_fin: string;
    estado_vigencia: string;
}

const NexosReport = () => {
    const [data, setData] = useState<NexoData[]>([]);
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
            const response = await getReportPreview('nexos');
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
            await downloadReportPDF('nexos');
        } catch (err) {
            alert('Error al descargar PDF');
        } finally {
            setDownloading(false);
        }
    };

    const totalNexos = data.length;
    const vigentes = data.filter(r => r.estado_vigencia === 'Vigente').length;
    const porVencer = data.filter(r => r.estado_vigencia === 'Por Vencer').length;
    const vencidos = data.filter(r => r.estado_vigencia === 'Vencido').length;

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Vigente':
                return { backgroundColor: '#dcfce7', color: '#047732' };
            case 'Por Vencer':
                return { backgroundColor: '#fef3c7', color: '#d97706' };
            case 'Vencido':
                return { backgroundColor: '#fee2e2', color: '#dc2626' };
            default:
                return { backgroundColor: '#f3f4f6', color: '#6b7280' };
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
            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold">Nexos Vigentes vs Por Vencer</h1>
                    <p className="text-gray-600">Estado de convenios y relaciones institucionales</p>
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
                                <p className="text-sm text-gray-600">Total Nexos</p>
                                <p className="text-2xl font-bold" style={{ color: '#40b4e5' }}>{totalNexos}</p>
                                <p className="text-sm text-gray-500">convenios activos</p>
                            </div>
                            <Link className="h-8 w-8" style={{ color: '#40b4e5' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Vigentes</p>
                                <p className="text-2xl font-bold" style={{ color: '#047732' }}>{vigentes}</p>
                                <p className="text-sm text-gray-500">en regla</p>
                            </div>
                            <CheckCircle className="h-8 w-8" style={{ color: '#047732' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Por Vencer</p>
                                <p className="text-2xl font-bold" style={{ color: '#ffc526' }}>{porVencer}</p>
                                <p className="text-sm text-gray-500">próximos 30 días</p>
                            </div>
                            <AlertTriangle className="h-8 w-8" style={{ color: '#ffc526' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Vencidos</p>
                                <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>{vencidos}</p>
                                <p className="text-sm text-gray-500">requieren acción</p>
                            </div>
                            <AlertTriangle className="h-8 w-8" style={{ color: '#ef4444' }} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Estado de Nexos Institucionales</CardTitle>
                    <p className="text-gray-600">Vista: vista_nexos_vigentes_vs_por_vencer</p>
                </CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tipo Convenio</TableHead>
                                    <TableHead>Persona</TableHead>
                                    <TableHead>Organización</TableHead>
                                    <TableHead className="text-center">Fecha Inicio</TableHead>
                                    <TableHead className="text-center">Fecha Fin</TableHead>
                                    <TableHead className="text-center">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{item.tipo_convenio || '-'}</TableCell>
                                        <TableCell>{item.nombre_persona || '-'}</TableCell>
                                        <TableCell>{item.nombre_organizacion || '-'}</TableCell>
                                        <TableCell className="text-center text-gray-600">
                                            {item.fecha_inicio ? new Date(item.fecha_inicio).toLocaleDateString('es-VE') : '-'}
                                        </TableCell>
                                        <TableCell className="text-center text-gray-600">
                                            {item.fecha_fin ? new Date(item.fecha_fin).toLocaleDateString('es-VE') : 'Indefinido'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge style={getStatusStyle(item.estado_vigencia)}>
                                                {item.estado_vigencia || '-'}
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

export default NexosReport;
