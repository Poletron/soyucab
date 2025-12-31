import { useState, useEffect } from 'react';
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
  AlertTriangle,
  Save
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

const SETTINGS_KEY = 'soyucab_user_settings';

interface UserSettings {
  // Notificaciones
  emailNotifications: boolean;
  pushNotifications: boolean;
  mentionNotifications: boolean;
  eventReminders: boolean;
  messageNotifications: boolean;
  groupUpdates: boolean;

  // Privacidad
  profileVisibility: string;
  showEmail: boolean;
  showPhone: boolean;
  allowMessages: string;
  showOnlineStatus: boolean;

  // Apariencia
  theme: string;
  language: string;
  fontSize: string;
  compactMode: boolean;

  // Seguridad
  twoFactorAuth: boolean;
  loginAlerts: boolean;
  sessionTimeout: string;
}

const defaultSettings: UserSettings = {
  // Notificaciones
  emailNotifications: true,
  pushNotifications: true,
  mentionNotifications: true,
  eventReminders: true,
  messageNotifications: true,
  groupUpdates: false,

  // Privacidad
  profileVisibility: 'public',
  showEmail: false,
  showPhone: false,
  allowMessages: 'everyone',
  showOnlineStatus: true,

  // Apariencia
  theme: 'system',
  language: 'es',
  fontSize: 'medium',
  compactMode: false,

  // Seguridad
  twoFactorAuth: false,
  loginAlerts: true,
  sessionTimeout: '30'
};

export default function GeneralSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSuccess('');
  };

  const handleSave = async (section: string) => {
    setIsLoading(true);
    setSuccess('');

    // Save to localStorage
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      setSuccess('Configuración guardada correctamente');
    } catch (e) {
      console.error('Error saving settings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = () => {
    const dataBlob = new Blob([JSON.stringify({ settings, exportDate: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'soyucab-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#12100c' }}>Configuración</h1>
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
                    onCheckedChange={(checked: boolean) => handleSettingChange('emailNotifications', checked)}
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
                    onCheckedChange={(checked: boolean) => handleSettingChange('pushNotifications', checked)}
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
                    onCheckedChange={(checked: boolean) => handleSettingChange('mentionNotifications', checked)}
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
                    onCheckedChange={(checked: boolean) => handleSettingChange('eventReminders', checked)}
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
                    onCheckedChange={(checked: boolean) => handleSettingChange('messageNotifications', checked)}
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
                    onCheckedChange={(checked: boolean) => handleSettingChange('groupUpdates', checked)}
                  />
                </div>
              </div>

              <Button
                onClick={() => handleSave('notifications')}
                disabled={isLoading}
                style={{ backgroundColor: '#40b4e5', borderColor: '#40b4e5' }}
              >
                <Save className="mr-2 h-4 w-4" />
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
                    onValueChange={(value: string) => handleSettingChange('profileVisibility', value)}
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
                    onCheckedChange={(checked: boolean) => handleSettingChange('showEmail', checked)}
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
                    onCheckedChange={(checked: boolean) => handleSettingChange('showPhone', checked)}
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
                    onValueChange={(value: string) => handleSettingChange('allowMessages', value)}
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
                    onCheckedChange={(checked: boolean) => handleSettingChange('showOnlineStatus', checked)}
                  />
                </div>
              </div>

              <Button
                onClick={() => handleSave('privacy')}
                disabled={isLoading}
                style={{ backgroundColor: '#40b4e5', borderColor: '#40b4e5' }}
              >
                <Save className="mr-2 h-4 w-4" />
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
                    onValueChange={(value: string) => handleSettingChange('theme', value)}
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
                    onValueChange={(value: string) => handleSettingChange('language', value)}
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
                    onValueChange={(value: string) => handleSettingChange('fontSize', value)}
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
                    onCheckedChange={(checked: boolean) => handleSettingChange('compactMode', checked)}
                  />
                </div>
              </div>

              <Button
                onClick={() => handleSave('appearance')}
                disabled={isLoading}
                style={{ backgroundColor: '#40b4e5', borderColor: '#40b4e5' }}
              >
                <Save className="mr-2 h-4 w-4" />
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
                    onCheckedChange={(checked: boolean) => handleSettingChange('twoFactorAuth', checked)}
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
                    onCheckedChange={(checked: boolean) => handleSettingChange('loginAlerts', checked)}
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
                    onValueChange={(value: string) => handleSettingChange('sessionTimeout', value)}
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
                          <p className="font-medium">Navegador Actual</p>
                          <p className="text-sm text-gray-500">Esta sesión</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        Sesión Actual
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => handleSave('security')}
                disabled={isLoading}
                style={{ backgroundColor: '#40b4e5', borderColor: '#40b4e5' }}
              >
                <Save className="mr-2 h-4 w-4" />
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
                  <h3 className="font-semibold mb-2">Exportar Configuración</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Descarga una copia de tu configuración de SoyUCAB.
                  </p>
                  <Button onClick={exportData} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar Configuración
                  </Button>
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