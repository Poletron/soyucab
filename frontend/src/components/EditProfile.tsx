import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Save, Camera, GraduationCap } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export default function EditProfile() {
  const [formData, setFormData] = useState({
    firstName: 'María',
    lastName: 'González',
    username: 'maria.gonzalez',
    email: 'maria.gonzalez@ucab.edu.ve',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    bio: 'Estudiante de Ingeniería en Informática apasionada por el desarrollo web y la tecnología.',
    phone: '+58 412 123 4567',
    birthDate: '1998-05-15',
    school: 'Escuela de Ingeniería',
    career: 'Ingeniería en Informática',
    graduationYear: '2024',
    linkedIn: 'https://linkedin.com/in/mariagonzalez',
    github: 'https://github.com/mariagonzalez',
    website: 'https://mariagonzalez.dev'
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const schools = [
    'Escuela de Administración y Contaduría',
    'Escuela de Comunicación Social',
    'Escuela de Derecho',
    'Escuela de Economía',
    'Escuela de Educación',
    'Escuela de Filosofía',
    'Escuela de Ingeniería',
    'Escuela de Medicina',
    'Escuela de Psicología',
    'Escuela de Relaciones Industriales'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (success) setSuccess('');
  };

  const validateForm = (section: string) => {
    const newErrors: Record<string, string> = {};

    if (section === 'personal') {
      if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es requerido';
      if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es requerido';
      if (!formData.username.trim()) newErrors.username = 'El nombre de usuario es requerido';
      if (!formData.email.trim()) newErrors.email = 'El correo es requerido';
      if (!formData.email.includes('@ucab.edu.ve')) newErrors.email = 'Debe ser un correo institucional';
    }

    if (section === 'password') {
      if (!formData.currentPassword) newErrors.currentPassword = 'La contraseña actual es requerida';
      if (!formData.newPassword) newErrors.newPassword = 'La nueva contraseña es requerida';
      if (formData.newPassword.length < 8) newErrors.newPassword = 'Mínimo 8 caracteres';
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (section: string) => {
    if (!validateForm(section)) return;

    setIsLoading(true);
    setSuccess('');

    // Simulamos guardar
    setTimeout(() => {
      setSuccess('Información actualizada correctamente');
      setIsLoading(false);
      
      if (section === 'password') {
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl" style={{ color: '#12100c' }}>Editar Perfil</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tu información personal y configuración de cuenta
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

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Información Personal</TabsTrigger>
          <TabsTrigger value="academic">Información Académica</TabsTrigger>
          <TabsTrigger value="social">Redes Sociales</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                Actualiza tu información básica y foto de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Photo Upload */}
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzJTIwcG9ydHJhaXQlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NTkzMjQ4NzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" />
                  <AvatarFallback>MG</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Camera className="h-4 w-4" />
                    <span>Cambiar Foto</span>
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    JPG, PNG o GIF. Máximo 2MB.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-xs text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-600">{errors.lastName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de Usuario</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                  />
                  {errors.username && (
                    <p className="text-xs text-red-600">{errors.username}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografía</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Cuéntanos un poco sobre ti..."
                  rows={4}
                />
              </div>

              <Button
                onClick={() => handleSave('personal')}
                disabled={isLoading}
                className="w-full md:w-auto"
                style={{ backgroundColor: '#40b4e5', borderColor: '#40b4e5' }}
              >
                {isLoading ? 'Guardando...' : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Académica</CardTitle>
              <CardDescription>
                Actualiza tu información educativa y profesional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Escuela</Label>
                  <Select value={formData.school} onValueChange={(value) => handleInputChange('school', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu escuela" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map((school) => (
                        <SelectItem key={school} value={school}>
                          {school}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="career">Carrera</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="career"
                      value={formData.career}
                      onChange={(e) => handleInputChange('career', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Año de Graduación</Label>
                  <Input
                    id="graduationYear"
                    value={formData.graduationYear}
                    onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={() => handleSave('academic')}
                disabled={isLoading}
                className="w-full md:w-auto"
                style={{ backgroundColor: '#40b4e5', borderColor: '#40b4e5' }}
              >
                {isLoading ? 'Guardando...' : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociales</CardTitle>
              <CardDescription>
                Conecta tus perfiles de redes sociales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedIn">LinkedIn</Label>
                  <Input
                    id="linkedIn"
                    value={formData.linkedIn}
                    onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                    placeholder="https://linkedin.com/in/tu-perfil"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    value={formData.github}
                    onChange={(e) => handleInputChange('github', e.target.value)}
                    placeholder="https://github.com/tu-usuario"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web Personal</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://tu-sitio-web.com"
                  />
                </div>
              </div>

              <Button
                onClick={() => handleSave('social')}
                disabled={isLoading}
                className="w-full md:w-auto"
                style={{ backgroundColor: '#40b4e5', borderColor: '#40b4e5' }}
              >
                {isLoading ? 'Guardando...' : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad de la Cuenta</CardTitle>
              <CardDescription>
                Actualiza tu contraseña y configuración de seguridad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Contraseña Actual</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-xs text-red-600">{errors.currentPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-xs text-red-600">{errors.newPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <Button
                onClick={() => handleSave('password')}
                disabled={isLoading}
                className="w-full md:w-auto"
                style={{ backgroundColor: '#40b4e5', borderColor: '#40b4e5' }}
              >
                {isLoading ? 'Actualizando...' : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Actualizar Contraseña
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