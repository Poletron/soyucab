import React, { useState } from 'react';
import { 
  Settings, 
  Bell, 
  Shield, 
  Eye, 
  Moon, 
  Sun, 
  Monitor,
  Globe,
  Lock,
  Mail,
  MessageSquare,
  Users,
  Smartphone,
  Download,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

export default function GeneralSettings() {
  const [settings, setSettings] = useState({
    // Notificaciones
    emailNotifications: true,
    pushNotifications: true,
    mentionNotifications: true,
    eventReminders: true,
    messageNotifications: true,
    groupUpdates: false,
    
    // Privacidad
    profileVisibility: 'public', // public, friends, private
    showEmail: false,
    showPhone: false,
    allowMessages: 'everyone', // everyone, friends, nobody
    showOnlineStatus: true,
    
    // Apariencia
    theme: 'system', // light, dark, system
    language: 'es',
    fontSize: 'medium',
    compactMode: false,
    
    // Seguridad
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: '30'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSuccess('');
  };

  const handleSave = async (section: string) => {
    setIsLoading(true);
    setSuccess('');

    // Simular guardado
    setTimeout(() => {
      setSuccess('Configuración guardada correctamente');
      setIsLoading(false);
    }, 1000);
  };

  const exportData = () => {
    // Simular exportación de datos
    const dataBlob = new Blob(['Datos de SoyUCAB exportados...'], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'soyucab-data.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl" style={{ color: '#12100c' }}>Configuración</h1>
          <p className="text-gray-600 mt-2">
            Personaliza tu experiencia en SoyUCAB
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

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="privacy">Privacidad</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="data">Datos</TabsTrigger>
        </TabsList>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" style={{ color: '#40b4e5' }} />
                <span>Notificaciones</span>
              </CardTitle>
              <CardDescription>
                Configura cómo y cuándo recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Notificaciones por Email</Label>
                    <p className="text-sm text-gray-500">
                      Recibe resúmenes y actualizaciones por correo electrónico
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Notificaciones Push</Label>
                    <p className="text-sm text-gray-500">
                      Recibe notificaciones instantáneas en tu dispositivo
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Menciones y Etiquetas</Label>
                    <p className="text-sm text-gray-500">
                      Cuando alguien te menciona en posts o comentarios
                    </p>
                  </div>
                  <Switch
                    checked={settings.mentionNotifications}
                    onCheckedChange={(checked) => handleSettingChange('mentionNotifications', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Recordatorios de Eventos</Label>
                    <p className="text-sm text-gray-500">
                      Recordatorios antes de eventos que marcaste como interesante
                    </p>
                  </div>
                  <Switch
                    checked={settings.eventReminders}
                    onCheckedChange={(checked) => handleSettingChange('eventReminders', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Mensajes Directos</Label>
                    <p className="text-sm text-gray-500">
                      Cuando recibas mensajes privados
                    </p>
                  </div>
                  <Switch
                    checked={settings.messageNotifications}
                    onCheckedChange={(checked) => handleSettingChange('messageNotifications', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Actualizaciones de Grupos</Label>
                    <p className="text-sm text-gray-500">
                      Nuevos posts y actividades en grupos que sigues
                    </p>
                  </div>
                  <Switch
                    checked={settings.groupUpdates}
                    onCheckedChange={(checked) => handleSettingChange('groupUpdates', checked)}
                  />
                </div>
              </div>

              <Button
                onClick={() => handleSave('notifications')}
                disabled={isLoading}
                style={{ backgroundColor: '#40b4e5', borderColor: '#40b4e5' }}
              >
                {isLoading ? 'Guardando...' : 'Guardar Preferencias'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PRIVACY TAB */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" style={{ color: '#40b4e5' }} />
                <span>Privacidad</span>
              </CardTitle>
              <CardDescription>
                Controla quién puede ver tu información y contenido
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base">Visibilidad del Perfil</Label>
                  <p className="text-sm text-gray-500 mb-3">
                    Controla quién puede ver tu perfil completo
                  </p>
                  <RadioGroup
                    value={settings.profileVisibility}
                    onValueChange={(value) => handleSettingChange('profileVisibility', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="public" />
                      <Label htmlFor="public">Público - Cualquier miembro de UCAB</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="friends" id="friends" />
                      <Label htmlFor="friends">Solo Conexiones - Solo personas conectadas contigo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="private" />
                      <Label htmlFor="private">Privado - Solo tú puedes ver tu perfil completo</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Mostrar Email</Label>
                    <p className="text-sm text-gray-500">
                      Permitir que otros vean tu correo electrónico
                    </p>
                  </div>
                  <Switch
                    checked={settings.showEmail}
                    onCheckedChange={(checked) => handleSettingChange('showEmail', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Mostrar Teléfono</Label>
                    <p className="text-sm text-gray-500">
                      Permitir que otros vean tu número de teléfono
                    </p>
                  </div>
                  <Switch
                    checked={settings.showPhone}
                    onCheckedChange={(checked) => handleSettingChange('showPhone', checked)}
                  />
                </div>

                <Separator />

                <div>
                  <Label className="text-base">Mensajes Directos</Label>
                  <p className="text-sm text-gray-500 mb-3">
                    Quién puede enviarte mensajes privados
                  </p>
                  <Select 
                    value={settings.allowMessages} 
                    onValueChange={(value) => handleSettingChange('allowMessages', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona opción" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Cualquier miembro de UCAB</SelectItem>
                      <SelectItem value="friends">Solo mis conexiones</SelectItem>
                      <SelectItem value="nobody">Nadie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Estado En Línea</Label>
                    <p className="text-sm text-gray-500">
                      Mostrar cuando estás activo en la plataforma
                    </p>
                  </div>
                  <Switch
                    checked={settings.showOnlineStatus}
                    onCheckedChange={(checked) => handleSettingChange('showOnlineStatus', checked)}
                  />
                </div>
              </div>

              <Button
                onClick={() => handleSave('privacy')}
                disabled={isLoading}
                style={{ backgroundColor: '#40b4e5', borderColor: '#40b4e5' }}
              >
                {isLoading ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* APPEARANCE TAB */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" style={{ color: '#40b4e5' }} />
                <span>Apariencia</span>
              </CardTitle>
              <CardDescription>
                Personaliza la apariencia de la interfaz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base">Tema</Label>
                  <p className="text-sm text-gray-500 mb-3">
                    Elige el tema de color de la aplicación
                  </p>
                  <RadioGroup
                    value={settings.theme}
                    onValueChange={(value) => handleSettingChange('theme', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" />
                      <Sun className="h-4 w-4 mr-2" />
                      <Label htmlFor="light">Claro</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="dark" />
                      <Moon className="h-4 w-4 mr-2" />
                      <Label htmlFor="dark">Oscuro</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="system" />
                      <Monitor className="h-4 w-4 mr-2" />
                      <Label htmlFor="system">Sistema</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div>
                  <Label className="text-base">Idioma</Label>
                  <p className="text-sm text-gray-500 mb-3">
                    Selecciona el idioma de la interfaz
                  </p>
                  <Select 
                    value={settings.language} 
                    onValueChange={(value) => handleSettingChange('language', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div>
                  <Label className="text-base">Tamaño de Fuente</Label>
                  <p className="text-sm text-gray-500 mb-3">
                    Ajusta el tamaño del texto
                  </p>
                  <Select 
                    value={settings.fontSize} 
                    onValueChange={(value) => handleSettingChange('fontSize', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona tamaño" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequeño</SelectItem>
                      <SelectItem value="medium">Mediano</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Modo Compacto</Label>
                    <p className="text-sm text-gray-500">
                      Reduce el espaciado para mostrar más contenido
                    </p>
                  </div>
                  <Switch
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => handleSettingChange('compactMode', checked)}
                  />
                </div>
              </div>

              <Button
                onClick={() => handleSave('appearance')}
                disabled={isLoading}
                style={{ backgroundColor: '#40b4e5', borderColor: '#40b4e5' }}
              >
                {isLoading ? 'Guardando...' : 'Guardar Apariencia'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" style={{ color: '#40b4e5' }} />
                <span>Seguridad</span>
              </CardTitle>
              <CardDescription>
                Configura las opciones de seguridad de tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Autenticación de Dos Factores</Label>
                    <p className="text-sm text-gray-500">
                      Añade una capa extra de seguridad a tu cuenta
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Alertas de Inicio de Sesión</Label>
                    <p className="text-sm text-gray-500">
                      Recibe notificaciones cuando alguien acceda a tu cuenta
                    </p>
                  </div>
                  <Switch
                    checked={settings.loginAlerts}
                    onCheckedChange={(checked) => handleSettingChange('loginAlerts', checked)}
                  />
                </div>

                <Separator />

                <div>
                  <Label className="text-base">Tiempo de Sesión</Label>
                  <p className="text-sm text-gray-500 mb-3">
                    Tiempo después del cual se cerrará automáticamente tu sesión
                  </p>
                  <Select 
                    value={settings.sessionTimeout} 
                    onValueChange={(value) => handleSettingChange('sessionTimeout', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona tiempo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                      <SelectItem value="never">Nunca</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-base">Sesiones Activas</Label>
                  <p className="text-sm text-gray-500">
                    Dispositivos donde tienes sesión iniciada
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Monitor className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">Chrome en Windows</p>
                          <p className="text-sm text-gray-500">Caracas, Venezuela • Actual</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        Sesión Actual
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">iPhone</p>
                          <p className="text-sm text-gray-500">Hace 2 días</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Cerrar Sesión
                      </Button>
                    </div>
                  </div>

                  <Button variant="outline" size="sm">
                    Cerrar todas las sesiones
                  </Button>
                </div>
              </div>

              <Button
                onClick={() => handleSave('security')}
                disabled={isLoading}
                style={{ backgroundColor: '#40b4e5', borderColor: '#40b4e5' }}
              >
                {isLoading ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DATA TAB */}
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" style={{ color: '#40b4e5' }} />
                <span>Datos</span>
              </CardTitle>
              <CardDescription>
                Gestiona tus datos personales y privacidad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Exportar Datos</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Descarga una copia de tus datos personales, posts, mensajes y actividad en SoyUCAB.
                  </p>
                  <Button onClick={exportData} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar Mis Datos
                  </Button>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Estadísticas de Uso</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold" style={{ color: '#40b4e5' }}>47</p>
                      <p className="text-sm text-gray-600">Posts Creados</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold" style={{ color: '#40b4e5' }}>156</p>
                      <p className="text-sm text-gray-600">Comentarios</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold" style={{ color: '#40b4e5' }}>23</p>
                      <p className="text-sm text-gray-600">Eventos Asistidos</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold" style={{ color: '#40b4e5' }}>89</p>
                      <p className="text-sm text-gray-600">Conexiones</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2 text-red-600">Zona de Peligro</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Estas acciones son irreversibles. Procede con cuidado.
                  </p>
                  
                  <div className="space-y-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar Toda Mi Actividad
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <span>¿Eliminar toda tu actividad?</span>
                          </DialogTitle>
                          <DialogDescription>
                            Esta acción eliminará permanentemente todos tus posts, comentarios, y actividad en SoyUCAB. 
                            Tu perfil se mantendrá activo pero sin contenido.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end space-x-3">
                          <DialogTrigger asChild>
                            <Button variant="outline">Cancelar</Button>
                          </DialogTrigger>
                          <Button className="bg-red-600 hover:bg-red-700">
                            Eliminar Actividad
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar Mi Cuenta
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <span>¿Eliminar tu cuenta?</span>
                          </DialogTitle>
                          <DialogDescription>
                            Esta acción eliminará permanentemente tu cuenta y todos los datos asociados. 
                            No podrás recuperar tu cuenta después de eliminarla.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end space-x-3">
                          <DialogTrigger asChild>
                            <Button variant="outline">Cancelar</Button>
                          </DialogTrigger>
                          <Button className="bg-red-600 hover:bg-red-700">
                            Eliminar Cuenta
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}