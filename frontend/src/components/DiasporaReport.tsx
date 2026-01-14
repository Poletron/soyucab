import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, Globe, Loader2, RefreshCcw } from 'lucide-react';
import { getReportPreview } from '../services/api'; // Usamos el helper existente que ya maneja token
import WorldMapSVG from './WorldMapSVG';

interface CityData {
    ciudad: string;
    total: number;
}

interface DiasporaData {
    pais_residencia: string;
    total: number;
    ciudades: CityData[];
}

const DiasporaReport = () => {
    const [highlightData, setHighlightData] = useState<Record<string, number>>({});
    const [tooltipContent, setTooltipContent] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            // Hardcoded email for dev/demo as per api.ts pattern if auth context is missing
            const userEmail = localStorage.getItem('userEmail') || 'oscar@ucab.edu.ve';

            const response = await fetch(`${baseUrl}/api/report/diaspora`, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': userEmail
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar datos del mapa');
            }

            const json = await response.json();

            if (json.success) {
                const mapData: Record<string, number> = {};
                const tooltips: Record<string, string> = {};

                json.data.forEach((item: DiasporaData) => {
                    const countryName = item.pais_residencia;
                    mapData[countryName] = item.total;

                    // Construir tooltip con detalle de ciudades
                    let tooltip = `${countryName}: ${item.total} usuarios`;
                    if (item.ciudades && item.ciudades.length > 0) {
                        // Ordenar ciudades por cantidad
                        const sortedCities = [...item.ciudades].sort((a, b) => b.total - a.total);
                        tooltip += '\n' + sortedCities.map(c => `- ${c.ciudad}: ${c.total}`).join('\n');
                    }
                    tooltips[countryName] = tooltip;
                });

                setHighlightData(mapData);
                setTooltipContent(tooltips);
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
                        <WorldMapSVG highlightData={highlightData} tooltipContent={tooltipContent} />
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
                                <div className="w-4 h-4 bg-[#047732] rounded mr-2 border border-gray-200"></div>
                                <span className="text-sm text-gray-700">Alta (10+ usuarios)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-[#40b4e5] rounded mr-2 border border-gray-200"></div>
                                <span className="text-sm text-gray-700">Media (5-10 usuarios)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-[#ffc526] rounded mr-2 border border-gray-200"></div>
                                <span className="text-sm text-gray-700">Baja (1-4 usuarios)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-[#F5F5F5] rounded mr-2 border border-gray-300"></div>
                                <span className="text-sm text-gray-500 italic">Sin información</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DiasporaReport;
