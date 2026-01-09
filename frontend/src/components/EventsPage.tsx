import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Loader2, ArrowLeft, CheckCircle, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getUpcomingEvents, closeEvent, getCurrentUser } from '../services/api';

interface Event {
    clave_evento: number;
    fk_contenido?: number;
    titulo: string;
    descripcion?: string;
    fecha_inicio: string;
    fecha_fin?: string;
    ubicacion?: string;
    correo_autor?: string;
    nombres?: string;
    apellidos?: string;
}

interface EventsPageProps {
    onNavigate?: (view: string) => void;
}

const EventsPage = ({ onNavigate }: EventsPageProps) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [closingEvent, setClosingEvent] = useState<number | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const currentUser = getCurrentUser();

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const result = await getUpcomingEvents();
            if (result.success && result.data) {
                setEvents(result.data);
            }
        } catch (err) {
            console.error('Error loading events:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseEvent = async (event: Event) => {
        if (!confirm(`¿Estás seguro de cerrar el evento "${event.titulo}"?\n\nSe creará automáticamente un borrador de reseña para documentar el evento.`)) {
            return;
        }

        const eventId = event.fk_contenido || event.clave_evento;
        setClosingEvent(eventId);
        setMessage(null);

        try {
            const result = await closeEvent(eventId);
            if (result.success) {
                setMessage({ type: 'success', text: result.message || 'Evento cerrado exitosamente' });
                // Remover el evento de la lista
                setEvents(events.filter(e => e.clave_evento !== event.clave_evento));
            } else {
                setMessage({ type: 'error', text: result.error || 'Error al cerrar el evento' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error de conexión al cerrar el evento' });
        } finally {
            setClosingEvent(null);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-VE', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isOrganizer = (event: Event) => {
        return currentUser && event.correo_autor === currentUser.email;
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate && onNavigate('feed')}
                    className="mr-3"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Volver
                </Button>
                <h1 className="text-2xl font-bold">Eventos</h1>
            </div>

            {/* Messages */}
            {message && (
                <div className={`mb-4 p-4 rounded-lg flex items-center justify-between ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                    <div className="flex items-center gap-2">
                        {message.type === 'success' ? (
                            <CheckCircle className="h-5 w-5" />
                        ) : (
                            <X className="h-5 w-5" />
                        )}
                        <span>{message.text}</span>
                    </div>
                    <button onClick={() => setMessage(null)} className="hover:opacity-70">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            ) : events.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No hay eventos próximos</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {events.map((event) => (
                        <Card key={event.clave_evento} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h2 className="text-xl font-semibold">{event.titulo}</h2>
                                            {isOrganizer(event) && (
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                                    Organizador
                                                </span>
                                            )}
                                        </div>

                                        {event.descripcion && (
                                            <p className="text-gray-600 mb-4">{event.descripcion}</p>
                                        )}

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Clock className="h-4 w-4 mr-2" style={{ color: '#ffc526' }} />
                                                <span>{formatDate(event.fecha_inicio)}</span>
                                            </div>

                                            {event.ubicacion && (
                                                <div className="flex items-center">
                                                    <MapPin className="h-4 w-4 mr-2" style={{ color: '#40b4e5' }} />
                                                    <span>{event.ubicacion}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                            {event.nombres && (
                                                <div className="flex items-center">
                                                    <Avatar className="h-6 w-6 mr-2">
                                                        <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(event.nombres + ' ' + (event.apellidos || ''))}`} />
                                                        <AvatarFallback>{event.nombres[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm text-gray-500">
                                                        Organizado por {event.nombres} {event.apellidos}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Botón de cerrar evento - solo visible para el organizador */}
                                            {isOrganizer(event) && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleCloseEvent(event)}
                                                    disabled={closingEvent === (event.fk_contenido || event.clave_evento)}
                                                    className="text-orange-600 border-orange-300 hover:bg-orange-50"
                                                >
                                                    {closingEvent === (event.fk_contenido || event.clave_evento) ? (
                                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                    )}
                                                    Cerrar Evento
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="ml-4 p-3 rounded-lg bg-yellow-50 text-center min-w-[80px]">
                                        <div className="text-2xl font-bold" style={{ color: '#ffc526' }}>
                                            {new Date(event.fecha_inicio).getDate()}
                                        </div>
                                        <div className="text-xs text-gray-500 uppercase">
                                            {new Date(event.fecha_inicio).toLocaleDateString('es-VE', { month: 'short' })}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EventsPage;
