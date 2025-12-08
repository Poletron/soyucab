import React from 'react';
import { MapPin, Calendar, Edit, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

const UserProfile = () => {
  const skills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 
    'Project Management', 'Agile', 'Machine Learning', 'Data Analysis'
  ];

  const experiences = [
    {
      position: 'Desarrollador Frontend Junior',
      company: 'TechCorp Venezuela',
      duration: '2024 - Presente',
      description: 'Desarrollo de aplicaciones web usando React y TypeScript. Colaboración en proyectos de e-commerce y plataformas educativas.'
    },
    {
      position: 'Pasante de Desarrollo',
      company: 'StartupHub Caracas',
      duration: '2023 - 2024',
      description: 'Asistí en el desarrollo de MVP para startups locales. Experiencia en prototipado rápido y testing de aplicaciones.'
    }
  ];

  const education = [
    {
      degree: 'Ingeniería Informática',
      institution: 'Universidad Católica Andrés Bello',
      duration: '2020 - 2025',
      description: 'Cursando 8vo semestre. Especialización en Desarrollo de Software y Ciencia de Datos.'
    },
    {
      degree: 'Bachillerato en Ciencias',
      institution: 'Colegio San Ignacio',
      duration: '2014 - 2020',
      description: 'Graduado con Mención Honorífica. Participante activo en olimpiadas de matemáticas.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="overflow-hidden">
        {/* Cover Photo */}
        <div 
          className="h-52 bg-gradient-to-r from-blue-500 to-blue-700 relative"
          style={{ 
            backgroundImage: `linear-gradient(135deg, rgba(64, 180, 229, 0.8) 0%, rgba(41, 128, 185, 0.8) 100%), url('https://images.unsplash.com/photo-1685456891912-c09f9cd252eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzJTIwcG9ydHJhaXQlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NTkzMjQ4NzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        <CardContent className="relative px-6 pb-6">
          {/* Profile Photo */}
          <div className="relative -mt-[6.75rem] mb-4">
            <Avatar className="h-36 w-36 border-6 border-white shadow-lg">
              <AvatarImage src="https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzJTIwcG9ydHJhaXQlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NTkzMjQ4NzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" />
              <AvatarFallback className="text-3xl">MG</AvatarFallback>
            </Avatar>
          </div>

          {/* Profile Info and Actions */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
            <div className="flex-1 mb-4 md:mb-0">
              <div className="flex items-center space-x-2 mb-1">
                <h1 className="text-2xl md:text-3xl">María Gabriela Rodríguez</h1>

              </div>
              <p className="text-lg md:text-xl text-gray-700 mb-2">
                Estudiante de 8vo Semestre | Ingeniería Informática | UCAB
              </p>
              <div className="flex items-center text-gray-500 space-x-1 mb-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Caracas, Venezuela</span>
                <span className="mx-2">•</span>
                <span className="text-sm" style={{ color: '#40b4e5' }}>Información de contacto</span>
              </div>
              <p className="text-sm text-gray-600">
                <span style={{ color: '#40b4e5' }}>324 conexiones</span>
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button 
                style={{ backgroundColor: '#40b4e5' }}
                className="text-white hover:opacity-90 px-6"
              >
                Conectar
              </Button>
              <Button variant="outline" className="flex items-center space-x-2 px-6">
                <MessageSquare className="h-4 w-4" />
                <span>Mensaje</span>
              </Button>
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* University and Organization Info */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#40b4e5' }}>
                  <span className="text-white text-xs font-bold">UCAB</span>
                </div>
                <div>
                  <p className="font-medium">Universidad Católica Andrés Bello</p>
                  <p className="text-sm text-gray-500">Escuela de Ingeniería Informática</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p><span className="font-medium">Promedio:</span> 18.5</p>
                  <p><span className="font-medium">Semestre:</span> 8vo de 10</p>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Se unió en Enero 2024</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl">Acerca de</h2>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            Estudiante apasionada por la tecnología y el desarrollo de software con enfoque en 
            aplicaciones web modernas. Me especializo en frontend development con React y tengo 
            experiencia en proyectos de ciencia de datos. Busco oportunidades para aplicar mis 
            conocimientos en proyectos que generen impacto positivo en la comunidad universitaria 
            y más allá. Actualmente explorando el mundo de la inteligencia artificial y su 
            aplicación en soluciones educativas.
          </p>
        </CardContent>
      </Card>

      {/* Experience Section */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl">Experiencia Laboral</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          {experiences.map((exp, index) => (
            <div key={index} className="border-l-2 pl-4" style={{ borderColor: '#40b4e5' }}>
              <h3 className="text-xl mb-1">{exp.position}</h3>
              <p className="text-lg text-gray-600 mb-1">{exp.company}</p>
              <p className="text-sm text-gray-500 mb-3">{exp.duration}</p>
              <p className="text-gray-700">{exp.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education Section */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl">Formación Académica</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          {education.map((edu, index) => (
            <div key={index} className="border-l-2 pl-4" style={{ borderColor: '#40b4e5' }}>
              <h3 className="text-xl mb-1">{edu.degree}</h3>
              <p className="text-lg text-gray-600 mb-1">{edu.institution}</p>
              <p className="text-sm text-gray-500 mb-3">{edu.duration}</p>
              <p className="text-gray-700">{edu.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl">Aptitudes</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-sm py-1 px-3 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;