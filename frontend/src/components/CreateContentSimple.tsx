import { useState } from 'react';
import {
    PenTool,
    Calendar,
    Megaphone,
    Briefcase,
    Send,
    Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Switch } from './ui/switch';
import { createPost, createEvent } from '../services/api';

type ContentType = 'post' | 'event' | 'campaign' | 'announcement';

export default function CreateContentSimple() {
    const [activeTab, setActiveTab] = useState<ContentType>('post');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Unified form data
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        location: '',
        isPublic: true,
        allowComments: true
    });

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setSuccess('');
        setError('');
    };

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            startDate: '',
            endDate: '',
            startTime: '',
            endTime: '',
            location: '',
            isPublic: true,
            allowComments: true
        });
    };

    const handleSubmit = async (contentType: ContentType) => {
        setIsLoading(true);
        setSuccess('');
        setError('');

        try {
            const contentTypeNames = {
                post: 'Post',
                event: 'Evento',
                campaign: 'Campaña',
                announcement: 'Convocatoria'
            };

            if (contentType === 'post' || contentType === 'campaign' || contentType === 'announcement') {
                // Create post/campaign/announcement using createPost API
                const texto = formData.title ? `**${formData.title}**\n\n${formData.content}` : formData.content;
                const visibilidad = formData.isPublic ? 'Público' : 'Solo Conexiones';

                const result = await createPost({ texto, visibilidad });

                if (result.success) {
                    setSuccess(`${contentTypeNames[contentType]} creado exitosamente`);
                    resetForm();
                } else {
                    setError(result.error || `Error al crear ${contentTypeNames[contentType].toLowerCase()}`);
                }
            } else if (contentType === 'event') {
                // Create event using createEvent API
                const result = await createEvent({
                    titulo: formData.title,
                    descripcion: formData.content,
                    fecha_inicio: formData.startDate,
                    hora_inicio: formData.startTime,
                    ubicacion: formData.location,
                    visibilidad: formData.isPublic ? 'Público' : 'Solo Conexiones'
                });

                if (result.success) {
                    setSuccess('Evento creado exitosamente');
                    resetForm();
                } else {
                    setError(result.error || 'Error al crear evento');
                }
            }
        } catch (err) {
            console.error('Error creating content:', err);
            setError('Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: '#12100c' }}>Crear Contenido</h1>
                    <p className="text-gray-600 mt-2">
                        Comparte posts, organiza eventos, lanza campañas y publica convocatorias
                    </p>
                </div>
            </div>

            {success && (
                <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-700">
                        {success}
                    </AlertDescription>
                </Alert>
            )}

            {error && (
                <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">
                        {error}
                    </AlertDescription>
                </Alert>
            )}

            <Tabs value={activeTab} onValueChange={(value: ContentType) => setActiveTab(value)} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="post" className="flex items-center space-x-2">
                        <PenTool className="h-4 w-4" />
                        <span>Post</span>
                    </TabsTrigger>
                    <TabsTrigger value="event" className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Evento</span>
                    </TabsTrigger>
                    <TabsTrigger value="campaign" className="flex items-center space-x-2">
                        <Megaphone className="h-4 w-4" />
                        <span>Campaña</span>
                    </TabsTrigger>
                    <TabsTrigger value="announcement" className="flex items-center space-x-2">
                        <Briefcase className="h-4 w-4" />
                        <span>Convocatoria</span>
                    </TabsTrigger>
                </TabsList>

                {/* POST TAB */}
                <TabsContent value="post">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <PenTool className="h-5 w-5" style={{ color: '#40b4e5' }} />
                                <span>Crear Post</span>
                            </CardTitle>
                            <CardDescription>
                                Comparte pensamientos, noticias o actualizaciones con la comunidad UCAB
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="postTitle">Título (opcional)</Label>
                                <Input
                                    id="postTitle"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    placeholder="¿De qué quieres hablar?"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="postContent">Contenido</Label>
                                <Textarea
                                    id="postContent"
                                    value={formData.content}
                                    onChange={(e) => handleInputChange('content', e.target.value)}
                                    placeholder="Escribe tu post aquí..."
                                    rows={6}
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Post Público</Label>
                                        <p className="text-sm text-gray-500">Visible para toda la comunidad UCAB</p>
                                    </div>
                                    <Switch
                                        checked={formData.isPublic}
                                        onCheckedChange={(checked: boolean) => handleInputChange('isPublic', checked)}
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={() => handleSubmit('post')}
                                disabled={isLoading || !formData.content}
                                className="w-full"
                                style={{ backgroundColor: '#40b4e5', borderColor: '#40b4e5' }}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Publicando...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Publicar Post
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* EVENT TAB */}
                <TabsContent value="event">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5" style={{ color: '#40b4e5' }} />
                                <span>Crear Evento</span>
                            </CardTitle>
                            <CardDescription>
                                Organiza conferencias, talleres, actividades y más
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="eventTitle">Título del Evento</Label>
                                <Input
                                    id="eventTitle"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    placeholder="Nombre del evento"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="eventDescription">Descripción</Label>
                                <Textarea
                                    id="eventDescription"
                                    value={formData.content}
                                    onChange={(e) => handleInputChange('content', e.target.value)}
                                    placeholder="Describe tu evento..."
                                    rows={4}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Fecha de Inicio</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="startTime">Hora de Inicio</Label>
                                    <Input
                                        id="startTime"
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Ubicación</Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                    placeholder="Aula, edificio, campus o enlace virtual..."
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Evento Público</Label>
                                    <p className="text-sm text-gray-500">Visible para toda la comunidad</p>
                                </div>
                                <Switch
                                    checked={formData.isPublic}
                                    onCheckedChange={(checked: boolean) => handleInputChange('isPublic', checked)}
                                />
                            </div>

                            <Button
                                onClick={() => handleSubmit('event')}
                                disabled={isLoading || !formData.title || !formData.startDate}
                                className="w-full"
                                style={{ backgroundColor: '#40b4e5', borderColor: '#40b4e5' }}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creando...
                                    </>
                                ) : (
                                    <>
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Crear Evento
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* CAMPAIGN TAB */}
                <TabsContent value="campaign">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Megaphone className="h-5 w-5" style={{ color: '#40b4e5' }} />
                                <span>Crear Campaña</span>
                            </CardTitle>
                            <CardDescription>
                                Lanza campañas de concientización, promoción o participación
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="campaignTitle">Título de la Campaña</Label>
                                <Input
                                    id="campaignTitle"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    placeholder="Nombre de la campaña"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="campaignDescription">Descripción</Label>
                                <Textarea
                                    id="campaignDescription"
                                    value={formData.content}
                                    onChange={(e) => handleInputChange('content', e.target.value)}
                                    placeholder="Describe tu campaña..."
                                    rows={4}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="campaignStartDate">Fecha de Inicio</Label>
                                    <Input
                                        id="campaignStartDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="campaignEndDate">Fecha de Fin</Label>
                                    <Input
                                        id="campaignEndDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={() => handleSubmit('campaign')}
                                disabled={isLoading || !formData.title || !formData.content}
                                className="w-full"
                                style={{ backgroundColor: '#40b4e5', borderColor: '#40b4e5' }}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creando...
                                    </>
                                ) : (
                                    <>
                                        <Megaphone className="mr-2 h-4 w-4" />
                                        Lanzar Campaña
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ANNOUNCEMENT TAB */}
                <TabsContent value="announcement">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Briefcase className="h-5 w-5" style={{ color: '#40b4e5' }} />
                                <span>Crear Convocatoria</span>
                            </CardTitle>
                            <CardDescription>
                                Publica convocatorias para becas, empleos, voluntariados y más
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="announcementTitle">Título de la Convocatoria</Label>
                                <Input
                                    id="announcementTitle"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    placeholder="Título de la convocatoria"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="announcementContent">Contenido</Label>
                                <Textarea
                                    id="announcementContent"
                                    value={formData.content}
                                    onChange={(e) => handleInputChange('content', e.target.value)}
                                    placeholder="Detalles de la convocatoria..."
                                    rows={6}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expiryDate">Fecha de Vencimiento</Label>
                                <Input
                                    id="expiryDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                                />
                            </div>

                            <Button
                                onClick={() => handleSubmit('announcement')}
                                disabled={isLoading || !formData.title || !formData.content}
                                className="w-full"
                                style={{ backgroundColor: '#40b4e5', borderColor: '#40b4e5' }}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Publicando...
                                    </>
                                ) : (
                                    <>
                                        <Briefcase className="mr-2 h-4 w-4" />
                                        Publicar Convocatoria
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
