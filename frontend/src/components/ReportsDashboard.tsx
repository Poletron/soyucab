import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
    TrendingUp, Users, Calendar, BarChart3, UserCheck,
    Hash, BookOpen, Link2, Briefcase, ArrowLeft, Globe
} from 'lucide-react';
import { Button } from './ui/button';

// Import all report components
import TopViralReport from './TopViralReport';
import LideresReport from './LideresReport';
import EventosReport from './EventosReport';
import CrecimientoDemograficoReport from './CrecimientoDemograficoReport';
import ActiveGroupsReport from './ActiveGroupsReport';
import ReferentesReport from './ReferentesReport';
import TutoriasReport from './TutoriasReport';
import NexosReport from './NexosReport';
import OfertasReport from './OfertasReport';
import DiasporaReport from './DiasporaReport';

interface ReportsDashboardProps {
    onNavigate?: (view: string) => void;
}

export default function ReportsDashboard({ onNavigate }: ReportsDashboardProps) {
    const [activeTab, setActiveTab] = useState('viralidad');

    return (
        <div className="min-h-screen bg-slate-50 -m-6 -mt-4">
            {/* Header */}
            <header
                className="sticky top-0 z-40 backdrop-blur-sm border-b"
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderColor: '#e2e8f0'
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Back Button & Title */}
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onNavigate && onNavigate('feed')}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                            <div className="flex items-center space-x-3">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: '#40b4e5' }}
                                >
                                    <BarChart3 className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold" style={{ color: '#12100c' }}>
                                        Centro de Reportes
                                    </h1>
                                    <p className="text-xs text-gray-500">Dashboard Ejecutivo</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Title */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Reportes Analíticos</h2>
                    <p className="mt-1 text-gray-600">
                        Visualiza los reportes ejecutivos y descarga PDFs para presentación
                    </p>
                </div>

                {/* Tabs Navigation */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-5 md:grid-cols-10 mb-8 h-auto gap-1 bg-white/80 p-1 rounded-lg shadow-sm">
                        <TabsTrigger
                            value="viralidad"
                            className="flex flex-col md:flex-row items-center gap-1 md:space-x-2 py-2 px-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-blue-100 hover:text-blue-600 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                        >
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-xs">Viral</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="lideres"
                            className="flex flex-col md:flex-row items-center gap-1 md:space-x-2 py-2 px-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-blue-100 hover:text-blue-600 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                        >
                            <Users className="h-4 w-4" />
                            <span className="text-xs">Líderes</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="eventos"
                            className="flex flex-col md:flex-row items-center gap-1 md:space-x-2 py-2 px-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-blue-100 hover:text-blue-600 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                        >
                            <Calendar className="h-4 w-4" />
                            <span className="text-xs">Eventos</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="crecimiento"
                            className="flex flex-col md:flex-row items-center gap-1 md:space-x-2 py-2 px-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-blue-100 hover:text-blue-600 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                        >
                            <BarChart3 className="h-4 w-4" />
                            <span className="text-xs">Crec.</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="grupos"
                            className="flex flex-col md:flex-row items-center gap-1 md:space-x-2 py-2 px-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-blue-100 hover:text-blue-600 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                        >
                            <Hash className="h-4 w-4" />
                            <span className="text-xs">Grupos</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="referentes"
                            className="flex flex-col md:flex-row items-center gap-1 md:space-x-2 py-2 px-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-blue-100 hover:text-blue-600 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                        >
                            <UserCheck className="h-4 w-4" />
                            <span className="text-xs">Ref.</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="tutorias"
                            className="flex flex-col md:flex-row items-center gap-1 md:space-x-2 py-2 px-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-blue-100 hover:text-blue-600 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                        >
                            <BookOpen className="h-4 w-4" />
                            <span className="text-xs">Tut.</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="nexos"
                            className="flex flex-col md:flex-row items-center gap-1 md:space-x-2 py-2 px-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-blue-100 hover:text-blue-600 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                        >
                            <Link2 className="h-4 w-4" />
                            <span className="text-xs">Nexos</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="ofertas"
                            className="flex flex-col md:flex-row items-center gap-1 md:space-x-2 py-2 px-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-blue-100 hover:text-blue-600 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                        >
                            <Briefcase className="h-4 w-4" />
                            <span className="text-xs">Ofertas</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="diaspora"
                            className="flex flex-col md:flex-row items-center gap-1 md:space-x-2 py-2 px-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-blue-100 hover:text-blue-600 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                        >
                            <Globe className="h-4 w-4" />
                            <span className="text-xs">Diáspora</span>
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
                        <CrecimientoDemograficoReport />
                    </TabsContent>

                    <TabsContent value="grupos" className="mt-0">
                        <ActiveGroupsReport />
                    </TabsContent>

                    <TabsContent value="referentes" className="mt-0">
                        <ReferentesReport />
                    </TabsContent>

                    <TabsContent value="tutorias" className="mt-0">
                        <TutoriasReport />
                    </TabsContent>

                    <TabsContent value="nexos" className="mt-0">
                        <NexosReport />
                    </TabsContent>

                    <TabsContent value="ofertas" className="mt-0">
                        <OfertasReport />
                    </TabsContent>

                    <TabsContent value="diaspora" className="mt-0">
                        <DiasporaReport />
                    </TabsContent>
                </Tabs>
            </main>

            {/* Footer */}
            <footer className="border-t mt-12 py-6 text-center text-sm text-gray-500" style={{ borderColor: '#e2e8f0' }}>
                <p>© 2024 SoyUCAB - Red Social Universitaria</p>
            </footer>
        </div>
    );
}
