import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle, Building2, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import soyucabLogo from '../assets/33c35295992cfb6178c01246eefc5ecbf6bc76db.png';
import { register as apiRegister } from '../services/api';

interface RegisterPageProps {
  onRegister: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterPage({ onRegister, onSwitchToLogin }: RegisterPageProps) {
  const [accountType, setAccountType] = useState<'persona' | 'organizacion'>('persona');
  const [formData, setFormData] = useState({
    // Persona fields
    firstName: '',
    lastName: '',
    country: '',
    city: '',
    // Organizacion fields
    organizationName: '',
    rif: '',
    entityType: '',
    // Common fields
    email: '',
    password: '',
    confirmPassword: '',
    userType: '',
    school: '',
    career: '',
    graduationYear: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const userTypes = [
    { value: 'student', label: 'Estudiante' },
    { value: 'graduate', label: 'Egresado' },
    { value: 'professor', label: 'Profesor' },
    { value: 'staff', label: 'Personal Administrativo' }
  ];

  const entityTypes = [
    'Empresa Privada',
    'Institución Pública',
    'ONG',
    'Fundación',
    'Asociación Civil',
    'Cooperativa'
  ];

  const countries = [
    'Venezuela',
    'Colombia',
    'Panamá',
    'Estados Unidos',
    'España',
    'Argentina',
    'Chile',
    'México',
    'Otro'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (accountType === 'persona') {
      if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es requerido';
      if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es requerido';
      if (!formData.country.trim()) newErrors.country = 'El país es requerido';
      if (!formData.city.trim()) newErrors.city = 'La ciudad es requerida';
      if (!formData.userType) newErrors.userType = 'Selecciona tu tipo de usuario';
      if (!formData.school && (formData.userType === 'student' || formData.userType === 'graduate')) {
        newErrors.school = 'Selecciona tu escuela';
      }
    } else {
      if (!formData.organizationName.trim()) newErrors.organizationName = 'El nombre de la organización es requerido';
      if (!formData.rif.trim()) newErrors.rif = 'El RIF es requerido';
      if (!formData.entityType.trim()) newErrors.entityType = 'Selecciona el tipo de entidad';
    }

    if (!formData.email.trim()) newErrors.email = 'El correo es requerido';
    if (accountType === 'persona' && !formData.email.includes('@ucab.edu.ve')) {
      newErrors.email = 'Debe ser un correo institucional (@ucab.edu.ve)';
    }
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    if (formData.password.length < 8) newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    if (!acceptTerms) newErrors.terms = 'Debes aceptar los términos y condiciones';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Solo registro de personas por ahora (organizaciones requieren tabla diferente)
      if (accountType === 'persona') {
        const result = await apiRegister({
          email: formData.email,
          password: formData.password,
          nombre: formData.firstName,
          apellido: formData.lastName,
          ubicacion: `${formData.city}, ${formData.country}`
        });

        if (result.success) {
          onRegister();
        } else {
          setErrors({ general: result.error || 'Error al registrar' });
        }
      } else {
        // Para organizaciones, simulamos por ahora
        setErrors({ general: 'El registro de organizaciones estará disponible próximamente' });
      }
    } catch (err) {
      console.error('Register error:', err);
      setErrors({ general: 'Error de conexión con el servidor' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Background Image */}
      <div className="hidden lg:flex flex-1 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1758270703813-2ecf235a6462?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHMlMjBzdHVkeWluZyUyMHRvZ2V0aGVyfGVufDF8fHx8MTc1OTU5ODQ5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(64, 180, 229, 0.8) 0%, rgba(41, 128, 185, 0.8) 100%)'
          }}
        />
        <div className="relative z-10 flex items-center justify-center p-12">
          <div className="text-center text-white max-w-lg">
            <h2 className="text-4xl font-bold mb-6">
              Forma Parte de SoyUCAB
            </h2>
            <p className="text-xl leading-relaxed mb-8">
              Crea tu perfil y conéctate con toda la comunidad universitaria. Comparte experiencias, conocimientos y oportunidades.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5" style={{ color: '#ffc526' }} />
                <span>Perfil profesional completo</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5" style={{ color: '#ffc526' }} />
                <span>Acceso a grupos exclusivos</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5" style={{ color: '#ffc526' }} />
                <span>Oportunidades laborales</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-6 py-8">
          {/* Logo and Header */}
          <div className="text-center">
            <img src={soyucabLogo} alt="SoyUCAB" className="h-14 w-auto mx-auto mb-4" />
            <h1 className="text-2xl font-bold" style={{ color: '#12100c' }}>
              Crear Cuenta
            </h1>
            <p className="mt-2 text-gray-600 text-sm">
              Únete a la comunidad UCAB
            </p>
          </div>

          {/* Account Type Toggle */}
          <div className="flex items-center justify-center space-x-2 p-2 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setAccountType('persona')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all ${accountType === 'persona'
                ? 'bg-white shadow-sm'
                : 'bg-transparent text-gray-600'
                }`}
              style={accountType === 'persona' ? { color: '#40b4e5' } : {}}
            >
              <User className="h-5 w-5" />
              <span className="font-medium">Persona</span>
            </button>
            <button
              type="button"
              onClick={() => setAccountType('organizacion')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all ${accountType === 'organizacion'
                ? 'bg-white shadow-sm'
                : 'bg-transparent text-gray-600'
                }`}
              style={accountType === 'organizacion' ? { color: '#40b4e5' } : {}}
            >
              <Building2 className="h-5 w-5" />
              <span className="font-medium">Organización</span>
            </button>
          </div>

          {/* Register Form */}
          <Card className="border-gray-200 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle>
                {accountType === 'persona' ? 'Información Personal' : 'Información de la Organización'}
              </CardTitle>
              <CardDescription>
                Complete todos los campos para crear su cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* PERSONA FIELDS */}
                {accountType === 'persona' && (
                  <>
                    {/* Nombres */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nombre *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="firstName"
                            placeholder="Tu nombre"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                        {errors.firstName && (
                          <p className="text-xs text-red-600">{errors.firstName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Apellido *</Label>
                        <Input
                          id="lastName"
                          placeholder="Tu apellido"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          required
                        />
                        {errors.lastName && (
                          <p className="text-xs text-red-600">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    {/* Ubicación */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>País *</Label>
                        <Select value={formData.country} onValueChange={(value: string) => handleInputChange('country', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu país" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.country && (
                          <p className="text-xs text-red-600">{errors.country}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Ciudad *</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="city"
                            placeholder="Tu ciudad"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                        {errors.city && (
                          <p className="text-xs text-red-600">{errors.city}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* ORGANIZACION FIELDS */}
                {accountType === 'organizacion' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="organizationName">Nombre de la Organización *</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="organizationName"
                          placeholder="Nombre oficial de la organización"
                          value={formData.organizationName}
                          onChange={(e) => handleInputChange('organizationName', e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                      {errors.organizationName && (
                        <p className="text-xs text-red-600">{errors.organizationName}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rif">RIF *</Label>
                        <Input
                          id="rif"
                          placeholder="J-12345678-9"
                          value={formData.rif}
                          onChange={(e) => handleInputChange('rif', e.target.value)}
                          required
                        />
                        {errors.rif && (
                          <p className="text-xs text-red-600">{errors.rif}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo de Entidad *</Label>
                        <Select value={formData.entityType} onValueChange={(value: string) => handleInputChange('entityType', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Tipo de entidad" />
                          </SelectTrigger>
                          <SelectContent>
                            {entityTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.entityType && (
                          <p className="text-xs text-red-600">{errors.entityType}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {accountType === 'persona' ? 'Correo Institucional *' : 'Correo Corporativo *'}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={accountType === 'persona' ? 'nombre.apellido@ucab.edu.ve' : 'contacto@empresa.com'}
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Contraseñas */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mínimo 8 caracteres"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-600">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Repite tu contraseña"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="pl-10 pr-10"
                        required
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

                {/* Tipo de usuario (solo para personas) */}
                {accountType === 'persona' && (
                  <>
                    <div className="space-y-2">
                      <Label>Tipo de Usuario *</Label>
                      <Select onValueChange={(value: string) => handleInputChange('userType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu tipo de usuario" />
                        </SelectTrigger>
                        <SelectContent>
                          {userTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.userType && (
                        <p className="text-xs text-red-600">{errors.userType}</p>
                      )}
                    </div>

                    {/* Escuela (solo para estudiantes y egresados) */}
                    {(formData.userType === 'student' || formData.userType === 'graduate') && (
                      <div className="space-y-2">
                        <Label>Escuela *</Label>
                        <Select onValueChange={(value: string) => handleInputChange('school', value)}>
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
                        {errors.school && (
                          <p className="text-xs text-red-600">{errors.school}</p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Términos y condiciones */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked: boolean | "indeterminate") => setAcceptTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm leading-5 cursor-pointer">
                    Acepto los{' '}
                    <Button variant="link" className="p-0 h-auto text-sm underline">
                      Términos y Condiciones
                    </Button>
                    {' '}y la{' '}
                    <Button variant="link" className="p-0 h-auto text-sm underline">
                      Política de Privacidad
                    </Button>
                  </Label>
                </div>
                {errors.terms && (
                  <p className="text-xs text-red-600">{errors.terms}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  style={{ backgroundColor: '#40b4e5', borderColor: '#40b4e5' }}
                >
                  {isLoading ? (
                    'Creando cuenta...'
                  ) : (
                    <>
                      Crear Cuenta
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-4">
                <Separator className="my-4" />
                <div className="text-center text-sm text-gray-600">
                  ¿Ya tienes una cuenta?{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    style={{ color: '#40b4e5' }}
                    onClick={onSwitchToLogin}
                  >
                    Inicia sesión aquí
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}