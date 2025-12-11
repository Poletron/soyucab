import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { TrendingUp, Users, Calendar, BarChart3, UserCheck, Hash } from 'lucide-react';
import TopViralReport from './components/TopViralReport';
import LideresReport from './components/LideresReport';
import EventosReport from './components/EventosReport';
import CrecimientoReport from './components/CrecimientoReport';
import GruposActivosReport from './components/GruposActivosReport';
import ReferentesReport from './components/ReferentesReport';

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

                        {/* Logo UCAB */}
                        <div className="hidden md:flex items-center">
                            <img
                                src="/logo.png"
                                alt="UCAB Logo"
                                className="h-10 w-auto"
                            />
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
                    <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-8 h-auto gap-1">
                        <TabsTrigger
                            value="viralidad"
                            className="flex items-center space-x-2 data-[state=active]:bg-white py-2"
                            style={{
                                '--tw-ring-color': '#40b4e5'
                            } as React.CSSProperties}
                        >
                            <TrendingUp className="h-4 w-4" />
                            <span className="hidden lg:inline">Contenido Viral</span>
                            <span className="lg:hidden text-xs">Viral</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="lideres"
                            className="flex items-center space-x-2 data-[state=active]:bg-white py-2"
                        >
                            <Users className="h-4 w-4" />
                            <span className="hidden lg:inline">Líderes Opinión</span>
                            <span className="lg:hidden text-xs">Líderes</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="eventos"
                            className="flex items-center space-x-2 data-[state=active]:bg-white py-2"
                        >
                            <Calendar className="h-4 w-4" />
                            <span className="hidden lg:inline">Proyección Eventos</span>
                            <span className="lg:hidden text-xs">Eventos</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="crecimiento"
                            className="flex items-center space-x-2 data-[state=active]:bg-white py-2"
                        >
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden lg:inline">Crecimiento</span>
                            <span className="lg:hidden text-xs">Crec.</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="grupos"
                            className="flex items-center space-x-2 data-[state=active]:bg-white py-2"
                        >
                            <Hash className="h-4 w-4" />
                            <span className="hidden lg:inline">Grupos Activos</span>
                            <span className="lg:hidden text-xs">Grupos</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="referentes"
                            className="flex items-center space-x-2 data-[state=active]:bg-white py-2"
                        >
                            <UserCheck className="h-4 w-4" />
                            <span className="hidden lg:inline">Referentes</span>
                            <span className="lg:hidden text-xs">Ref.</span>
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

                    <TabsContent value="crecimiento" className="mt-0">
                        <CrecimientoReport />
                    </TabsContent>

                    <TabsContent value="grupos" className="mt-0">
                        <GruposActivosReport />
                    </TabsContent>

                    <TabsContent value="referentes" className="mt-0">
                        <ReferentesReport />
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
