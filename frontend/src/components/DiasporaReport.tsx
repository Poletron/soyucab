import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, Globe, Loader2, RefreshCcw } from 'lucide-react';
import { getReportPreview } from '../services/api'; // Usamos el helper existente que ya maneja token
import WorldMapSVG from './WorldMapSVG';

interface DiasporaData {
    pais_residencia: string;
    total: number;
}

const DiasporaReport = () => {
    const [data, setData] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Usamos el endpoint fetch general pero apuntando a 'diaspora'
            // NOTA: Como agregamos una ruta especifica /diaspora en backend,
            // quizas necesitemos llamar fetch directo o ajustar getReportPreview.
            // Por consistencia, asumiremos que getReportPreview maneja tipos.

            const token = localStorage.getItem('token'); // Asumimos token en localStorage
            const response = await fetch('http://localhost:4000/api/reports/diaspora', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar datos del mapa');
            }

            const json = await response.json();

            if (json.success) {
                // Transformar array [{pais, total}] a objeto {Pais: total}
                const mapData: Record<string, number> = {};
                json.data.forEach((item: DiasporaData) => {
                    mapData[item.pais_residencia] = item.total;
                });
                setData(mapData);
            } else {
                setError(json.error || 'Error desconocido');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold">Mapa de la Diáspora</h1>
                    <p className="text-gray-600">Distribución global de la comunidad SoyUCAB</p>
                </div>
                <Button onClick={loadData} variant="outline" className="flex items-center space-x-2">
                    <RefreshCcw className="h-4 w-4" />
                    <span>Actualizar</span>
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                    {error}
                </div>
            )}

            <Card className="h-[600px] overflow-hidden bg-slate-50 relative">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                    </div>
                )}
                <CardContent className="p-0 h-full">
                    {/* Pasamos los datos al componente presentacional */}
                    <div className="w-full h-full p-4">
                        <WorldMapSVG highlightData={data} />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Leyenda Simple */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Leyenda de Densidad</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-[#047732] rounded mr-2"></div>
                                <span className="text-sm">Alta (10+ usuarios)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-[#40b4e5] rounded mr-2"></div>
                                <span className="text-sm">Media (5-10 usuarios)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-[#ffc526] rounded mr-2"></div>
                                <span className="text-sm">Baja (1-4 usuarios)</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DiasporaReport;
