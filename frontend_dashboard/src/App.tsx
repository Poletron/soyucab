import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { TrendingUp, Users, Calendar, BarChart3 } from 'lucide-react';
import TopViralReport from './components/TopViralReport';
import LideresReport from './components/LideresReport';
import EventosReport from './components/EventosReport';

function App() {
    const [activeTab, setActiveTab] = useState('viralidad');

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header
                className="sticky top-0 z-50 backdrop-blur-sm border-b"
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderColor: '#e2e8f0'
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo & Title */}
                        <div className="flex items-center space-x-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: '#40b4e5' }}
                            >
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold" style={{ color: '#12100c' }}>
                                    SoyUCAB - Entrega 3
                                </h1>
                                <p className="text-xs text-gray-500">Dashboard de Reportes</p>
                            </div>
                        </div>

                        {/* Brand Colors Indicator */}
                        <div className="hidden md:flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Colores UCAB:</span>
                            <div className="flex space-x-1">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#40b4e5' }} title="Azul UCAB"></div>
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#047732' }} title="Verde UCAB"></div>
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ffc526' }} title="Oro UCAB"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Title */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Centro de Reportes</h2>
                    <p className="mt-1 text-gray-600">
                        Visualiza los reportes analíticos y descarga PDFs para presentación
                    </p>
                </div>

                {/* Tabs Navigation */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-8 h-12">
                        <TabsTrigger
                            value="viralidad"
                            className="flex items-center space-x-2 data-[state=active]:bg-white"
                            style={{
                                '--tw-ring-color': '#40b4e5'
                            } as React.CSSProperties}
                        >
                            <TrendingUp className="h-4 w-4" />
                            <span className="hidden sm:inline">Contenido Viral</span>
                            <span className="sm:hidden">Viralidad</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="lideres"
                            className="flex items-center space-x-2 data-[state=active]:bg-white"
                        >
                            <Users className="h-4 w-4" />
                            <span className="hidden sm:inline">Líderes de Opinión</span>
                            <span className="sm:hidden">Líderes</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="eventos"
                            className="flex items-center space-x-2 data-[state=active]:bg-white"
                        >
                            <Calendar className="h-4 w-4" />
                            <span className="hidden sm:inline">Proyección Eventos</span>
                            <span className="sm:hidden">Eventos</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="viralidad" className="mt-0">
                        <TopViralReport />
                    </TabsContent>

                    <TabsContent value="lideres" className="mt-0">
                        <LideresReport />
                    </TabsContent>

                    <TabsContent value="eventos" className="mt-0">
                        <EventosReport />
                    </TabsContent>
                </Tabs>
            </main>

            {/* Footer */}
            <footer className="border-t mt-12 py-6" style={{ borderColor: '#e2e8f0' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm text-gray-500">
                        <p>© 2024 SoyUCAB - Red Social Universitaria</p>
                        <p className="mt-2 md:mt-0">
                            Entrega 3: Dashboard Ejecutivo para Defensa de Proyecto
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;
