import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import soyucabLogo from '../assets/33c35295992cfb6178c01246eefc5ecbf6bc76db.png';
import { login as apiLogin } from '../services/api';

interface LoginPageProps {
  onLogin: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginPage({ onLogin, onSwitchToRegister }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await apiLogin(email, password);

      if (result.success) {
        onLogin();
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Header */}
          <div className="text-center">
            <img src={soyucabLogo} alt="SoyUCAB" className="h-16 w-auto mx-auto mb-6" />
            <h1 className="text-3xl font-bold" style={{ color: '#12100c' }}>
              Bienvenido a SoyUCAB
            </h1>
            <p className="mt-2 text-gray-600">
              La red social institucional de la Universidad Católica Andrés Bello
            </p>
          </div>

          {/* Login Form */}
          <Card className="border-gray-200 shadow-lg">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder a tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Institucional</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nombre.apellido@ucab.edu.ve"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Ingresa tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="remember" className="text-sm cursor-pointer">
                      Recordar sesión
                    </Label>
                  </div>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm"
                    style={{ color: '#40b4e5' }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  style={{ backgroundColor: '#40b4e5', borderColor: '#40b4e5' }}
                >
                  {isLoading ? (
                    'Iniciando sesión...'
                  ) : (
                    <>
                      Iniciar Sesión
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6">
                <Separator className="my-4" />
                <div className="text-center text-sm text-gray-600">
                  ¿No tienes una cuenta?{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    style={{ color: '#40b4e5' }}
                    onClick={onSwitchToRegister}
                  >
                    Regístrate aquí
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            <p>
              Al iniciar sesión, aceptas nuestros{' '}
              <Button variant="link" className="p-0 h-auto text-sm underline">
                Términos y Condiciones
              </Button>
              {' '}y{' '}
              <Button variant="link" className="p-0 h-auto text-sm underline">
                Política de Privacidad
              </Button>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Background Image */}
      <div className="hidden lg:flex flex-1 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1685456891912-c09f9cd252eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYXJjaGl0ZWN0dXJlJTIwbW9kZXJufGVufDF8fHx8MTc1OTU5ODQ4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`
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
              Conecta con la Comunidad UCAB
            </h2>
            <p className="text-xl leading-relaxed mb-8">
              Únete a la red social que conecta estudiantes, profesores, egresados y personal de la Universidad Católica Andrés Bello.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ffc526' }}></div>
                <span>Networking profesional</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ffc526' }}></div>
                <span>Eventos y oportunidades</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ffc526' }}></div>
                <span>Grupos de interés</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}