import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Eye,
    Plus,
    ArrowRight,
    TrendingUp,
    Clock,
    CheckCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useRole } from '../hooks/useRole';
import { getMyPublishedOffers, getUserStats, JobOffer } from '../services/api';

// Reusing Dialog components from JobBoard for "Quick Create" if needed, 
// or directing user to JobBoard with a query param. 
// For now, we will redirect to JobBoard for creation to avoid code duplication 
// until we refactor the creation form into a separate component.

export default function OrgDashboard({ onNavigate }: { onNavigate: (view: any) => void }) {
    // const { user } = useRole(); // Property 'user' does not exist on type 'UserRoles'
    const userName = localStorage.getItem('userName');
    const [offers, setOffers] = useState<JobOffer[]>([]);
    const [stats, setStats] = useState({
        totalOffers: 0,
        totalApplicants: 0,
        views: 0 // Mocked for now or if available
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Parallel fetching
            const [offersRes, userStatsRes] = await Promise.all([
                getMyPublishedOffers(),
                getUserStats()
            ]);

            let activeOffers: JobOffer[] = [];
            let totalApps = 0;

            if (offersRes.success) {
                activeOffers = offersRes.data;
                // Sum total applicants from all offers
                totalApps = activeOffers.reduce((sum, offer) => sum + (offer.total_postulaciones || 0), 0);
            }

            setOffers(activeOffers);
            setStats({
                totalOffers: activeOffers.length,
                totalApplicants: totalApps,
                views: 125 // Mock value for "Profile Views" as it's often a requested metric
            });

        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate recent activity or active offers
    const recentOffers = offers.slice(0, 3);

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Panel Organizacional</h1>
                    <p className="text-gray-600 mt-1">
                        Bienvenido, <span className="font-semibold">{userName || 'Organización'}</span>. Aquí tienes el resumen de tu actividad.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => onNavigate('jobs')}>
                        <Briefcase className="h-4 w-4 mr-2" />
                        Gestionar Ofertas
                    </Button>
                    {/* We can pass state to JobBoard to open modal automatically if we want */}
                    <Button style={{ backgroundColor: '#40b4e5' }} onClick={() => onNavigate('jobs')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Publicar Vacante
                    </Button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ofertas Activas</CardTitle>
                        <Briefcase className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOffers}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            +1 desde el mes pasado
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Postulantes</CardTitle>
                        <Users className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalApplicants}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            En todas tus vacantes activas
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Visualizaciones de Perfil</CardTitle>
                        <Eye className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.views}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            <span className="text-green-500 flex items-center">
                                <TrendingUp className="h-3 w-3 mr-1" /> +12%
                            </span>
                            respeto a la semana pasada
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Offers Section */}
                <Card className="col-span-1 lg:col-span-2 shadow-sm">
                    <CardHeader>
                        <CardTitle>Ofertas Recientes</CardTitle>
                        <CardDescription>
                            Tus últimas vacantes publicadas y su estado actual.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">Cargando...</div>
                        ) : offers.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                                <p>No tienes ofertas activas.</p>
                                <Button variant="link" onClick={() => onNavigate('jobs')} className="mt-2 text-blue-600">
                                    Publicar tu primera oferta
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentOffers.map((offer) => (
                                    <div key={offer.clave_oferta} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-blue-100 p-2 rounded-full">
                                                <Briefcase className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{offer.titulo_oferta}</h4>
                                                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                                    <Clock className="h-3 w-3" />
                                                    <span>Publicado el {new Date(offer.fecha_publicacion).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="secondary" className="mb-1">
                                                {offer.modalidad}
                                            </Badge>
                                            <div className="text-sm font-medium text-gray-900">
                                                {offer.total_postulaciones} postulantes
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {offers.length > 3 && (
                            <div className="mt-4 text-center">
                                <Button variant="ghost" onClick={() => onNavigate('jobs')} className="text-blue-600 hover:text-blue-800">
                                    Ver todas las ofertas <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Stats / Tips */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Estado de la Cuenta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium">Perfil Verificado</p>
                                <p className="text-xs text-gray-500">Tu organización está validada</p>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="text-sm font-semibold mb-3">Tips para reclutadores</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500">•</span>
                                    Detalla bien los requisitos técnicos.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500">•</span>
                                    Incluye el rango salarial para atraer más talento.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500">•</span>
                                    Responde rápido a las postulaciones.
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
