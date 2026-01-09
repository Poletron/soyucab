import { useState, useEffect } from 'react';
import {
    Briefcase, Search, MapPin, Building, Clock,
    Plus, Filter, CheckCircle, Loader2, FileText,
    ChevronRight, ArrowRight
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { useRole } from '../hooks/useRole';
import {
    getOffers, createOffer, applyToOffer, getMyPublishedOffers,
    getMyApplications, JobOffer
} from '../services/api';

// URL base del backend para resolver paths relativos de imágenes
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getImageUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_BASE_URL}${url}`;
};

export default function JobBoard() {
    const { isOrg } = useRole();
    const [offers, setOffers] = useState<JobOffer[]>([]);
    const [myOffers, setMyOffers] = useState<JobOffer[]>([]);
    const [myApplications, setMyApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalidadFilter, setModalidadFilter] = useState<string>('all');

    // Create Offer State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newOffer, setNewOffer] = useState({
        titulo: '',
        descripcion: '',
        requisitos: '',
        modalidad: 'Presencial'
    });
    const [creating, setCreating] = useState(false);

    // Apply State
    const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        loadData();
    }, [isOrg]);

    const loadData = async () => {
        setLoading(true);
        try {
            const allOffersRes = await getOffers();
            let loadedOffers = allOffersRes.success ? allOffersRes.data : [];

            if (isOrg) {
                const published = await getMyPublishedOffers();
                if (published.success) {
                    setMyOffers(published.data);
                }
            } else {
                const appsRes = await getMyApplications();
                if (appsRes.success) {
                    setMyApplications(appsRes.data);

                    // Marcar ofertas como ya postuladas
                    const appliedIds = new Set(appsRes.data.map((app: any) => app.clave_oferta));
                    loadedOffers = loadedOffers.map(offer => ({
                        ...offer,
                        ya_postulado: appliedIds.has(offer.clave_oferta)
                    }));
                }
            }

            setOffers(loadedOffers);
        } catch (error) {
            console.error('Error loading offers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOffer = async () => {
        if (!newOffer.titulo || !newOffer.descripcion) return;

        setCreating(true);
        try {
            const result = await createOffer(newOffer);
            if (result.success) {
                setIsCreateOpen(false);
                setNewOffer({ titulo: '', descripcion: '', requisitos: '', modalidad: 'Presencial' });
                loadData(); // Reload all data
            }
        } catch (error) {
            console.error('Error creating offer:', error);
        } finally {
            setCreating(false);
        }
    };

    const handleApply = async (offerId: number) => {
        setApplying(true);
        try {
            const result = await applyToOffer(offerId);
            if (result.success) {
                setSelectedOffer(null);
                loadData();
            }
        } catch (error) {
            console.error('Error applying:', error);
        } finally {
            setApplying(false);
        }
    };

    const filteredOffers = offers.filter(offer => {
        const matchesSearch = offer.titulo_oferta.toLowerCase().includes(searchTerm.toLowerCase()) ||
            offer.nombre_organizacion?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesModalidad = modalidadFilter === 'all' || offer.modalidad === modalidadFilter;
        return matchesSearch && matchesModalidad;
    });

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Bolsa de Trabajo</h1>
                    <p className="text-gray-600 mt-1">Encuentra tu próxima oportunidad profesional</p>
                </div>

                {isOrg && (
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button style={{ backgroundColor: '#40b4e5' }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Publicar Vacante
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Publicar Nueva Vacante</DialogTitle>
                                <DialogDescription>
                                    Llena los detalles de la oferta laboral para atraer talento.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Título del Cargo</label>
                                    <Input
                                        placeholder="Ej: Desarrollador Full Stack"
                                        value={newOffer.titulo}
                                        onChange={e => setNewOffer({ ...newOffer, titulo: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Modalidad</label>
                                        <Select
                                            value={newOffer.modalidad}
                                            onValueChange={v => setNewOffer({ ...newOffer, modalidad: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Presencial">Presencial</SelectItem>
                                                <SelectItem value="Remoto">Remoto</SelectItem>
                                                <SelectItem value="Híbrido">Híbrido</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Descripción</label>
                                    <Textarea
                                        placeholder="Describe las responsabilidades..."
                                        rows={4}
                                        value={newOffer.descripcion}
                                        onChange={e => setNewOffer({ ...newOffer, descripcion: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Requisitos (Opcional)</label>
                                    <Textarea
                                        placeholder="Habilidades requeridas..."
                                        rows={3}
                                        value={newOffer.requisitos}
                                        onChange={e => setNewOffer({ ...newOffer, requisitos: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                                <Button onClick={handleCreateOffer} disabled={creating} style={{ backgroundColor: '#40b4e5' }}>
                                    {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Publicar
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <Tabs defaultValue="browse" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="browse">Explorar Ofertas</TabsTrigger>
                    {isOrg ? (
                        <TabsTrigger value="published">Mis Publicaciones</TabsTrigger>
                    ) : (
                        <TabsTrigger value="applications">Mis Postulaciones</TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="browse" className="space-y-6">
                    {/* Filters */}
                    <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar por cargo o empresa..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <Select value={modalidadFilter} onValueChange={setModalidadFilter}>
                                <SelectTrigger>
                                    <div className="flex items-center">
                                        <Filter className="h-4 w-4 mr-2 text-gray-500" />
                                        <SelectValue placeholder="Modalidad" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas</SelectItem>
                                    <SelectItem value="Presencial">Presencial</SelectItem>
                                    <SelectItem value="Remoto">Remoto</SelectItem>
                                    <SelectItem value="Híbrido">Híbrido</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Offers Grid */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : filteredOffers.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">No se encontraron ofertas</h3>
                            <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredOffers.map((offer) => (
                                <Card key={offer.clave_oferta} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="dir-col pb-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={getImageUrl(offer.foto_organizacion)} />
                                                    <AvatarFallback className="bg-blue-100 text-blue-600">
                                                        {offer.nombre_organizacion?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <CardTitle className="text-lg font-bold line-clamp-1" title={offer.titulo_oferta}>
                                                        {offer.titulo_oferta}
                                                    </CardTitle>
                                                    <CardDescription className="line-clamp-1">
                                                        {offer.nombre_organizacion}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <Badge variant="secondary" className="font-normal text-xs">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {offer.modalidad}
                                            </Badge>
                                            <Badge variant="outline" className="font-normal text-xs text-green-600 border-green-200 bg-green-50">
                                                Activa
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600 line-clamp-3 mb-4 min-h-[60px]">
                                            {offer.descripcion_cargo}
                                        </p>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="w-full" onClick={() => setSelectedOffer(offer)}>
                                                    Ver Detalles
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <div className="flex items-center space-x-4 mb-2">
                                                        <Avatar className="h-16 w-16">
                                                            <AvatarImage src={getImageUrl(offer.foto_organizacion)} />
                                                            <AvatarFallback className="text-xl">
                                                                {offer.nombre_organizacion?.[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <DialogTitle className="text-2xl">{offer.titulo_oferta}</DialogTitle>
                                                            <DialogDescription className="text-lg text-gray-700 font-medium">
                                                                {offer.nombre_organizacion}
                                                            </DialogDescription>
                                                        </div>
                                                    </div>
                                                </DialogHeader>

                                                <div className="grid grid-cols-2 gap-4 py-4">
                                                    <div className="bg-gray-50 p-3 rounded-lg flex items-center">
                                                        <MapPin className="h-5 w-5 text-gray-500 mr-3" />
                                                        <div>
                                                            <p className="text-xs text-gray-500">Modalidad</p>
                                                            <p className="font-medium">{offer.modalidad}</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded-lg flex items-center">
                                                        <Clock className="h-5 w-5 text-gray-500 mr-3" />
                                                        <div>
                                                            <p className="text-xs text-gray-500">Publicado</p>
                                                            <p className="font-medium">{new Date(offer.fecha_publicacion).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 py-4">
                                                    <div>
                                                        <h4 className="font-semibold mb-2 flex items-center">
                                                            <FileText className="h-4 w-4 mr-2" /> Descripción
                                                        </h4>
                                                        <p className="text-gray-600 whitespace-pre-wrap">{offer.descripcion_cargo}</p>
                                                    </div>
                                                    {offer.requisitos && (
                                                        <div>
                                                            <h4 className="font-semibold mb-2 flex items-center">
                                                                <CheckCircle className="h-4 w-4 mr-2" /> Requisitos
                                                            </h4>
                                                            <p className="text-gray-600 whitespace-pre-wrap">{offer.requisitos}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <DialogFooter className="flex-col sm:flex-row gap-2">
                                                    {!isOrg && (
                                                        <Button
                                                            className="w-full sm:w-auto"
                                                            onClick={() => handleApply(offer.clave_oferta)}
                                                            disabled={applying || offer.ya_postulado}
                                                            style={{ backgroundColor: offer.ya_postulado ? '#10b981' : '#40b4e5' }}
                                                        >
                                                            {applying ? (
                                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                            ) : offer.ya_postulado ? (
                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                            ) : (
                                                                <ArrowRight className="h-4 w-4 mr-2" />
                                                            )}
                                                            {offer.ya_postulado ? 'Ya Postulado' : 'Postularme'}
                                                        </Button>
                                                    )}
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="published">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mis Ofertas Publicadas</CardTitle>
                            <CardDescription>Gestiona las vacantes que has publicado</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {myOffers.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No has publicado ninguna oferta aún.</div>
                            ) : (
                                <div className="space-y-4">
                                    {myOffers.map(offer => (
                                        <div key={offer.clave_oferta} className="flex justify-between items-center p-4 border rounded-lg">
                                            <div>
                                                <h4 className="font-bold">{offer.titulo_oferta}</h4>
                                                <p className="text-sm text-gray-500">Publicado el {new Date(offer.fecha_publicacion).toLocaleDateString()}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <Badge variant="secondary">{offer.total_postulaciones} postulaciones</Badge>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm">Ver Postulantes</Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="applications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mis Postulaciones</CardTitle>
                            <CardDescription>Seguimiento de tus candidaturas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {myApplications.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No te has postulado a ninguna oferta.</div>
                            ) : (
                                <div className="space-y-4">
                                    {myApplications.map((app: any) => (
                                        <div key={app.clave_postulacion} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg gap-4">
                                            <div>
                                                <h4 className="font-bold">{app.titulo_oferta}</h4>
                                                <p className="text-sm font-medium text-gray-700">{app.nombre_organizacion}</p>
                                                <p className="text-xs text-gray-500">Postulado el {new Date(app.fecha_postulacion).toLocaleDateString()}</p>
                                            </div>
                                            <Badge
                                                variant={app.estado_postulacion === 'Enviada' ? 'default' : 'secondary'}
                                                className={
                                                    app.estado_postulacion === 'Enviada' ? 'bg-blue-100 text-blue-800' :
                                                        app.estado_postulacion === 'Aceptada' ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }
                                            >
                                                {app.estado_postulacion}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
