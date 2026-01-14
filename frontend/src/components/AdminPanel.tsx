import { useState, useEffect } from 'react';
import { Loader2, Shield, UserPlus, UserMinus, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
    adminGetUsers,
    adminGetRoles,
    adminAssignRole,
    adminRemoveRole,
    AdminUser,
    AdminRole
} from '../services/api';

export default function AdminPanel() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [roles, setRoles] = useState<AdminRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [usersRes, rolesRes] = await Promise.all([
                adminGetUsers(),
                adminGetRoles()
            ]);

            if (usersRes.success) {
                setUsers(usersRes.data);
            } else {
                setError('Error cargando usuarios');
            }

            if (rolesRes.success) {
                setRoles(rolesRes.data);
            }
        } catch (err: any) {
            console.error('Admin load error:', err);
            setError(err.message || 'Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignRole = async (userEmail: string) => {
        if (!selectedRole) return;
        try {
            setActionLoading(userEmail);
            const result = await adminAssignRole(userEmail, selectedRole);
            if (result.success) {
                await loadData(); // Reload users
            }
        } catch (err: any) {
            console.error('Assign role error:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemoveRole = async (userEmail: string, role: string) => {
        try {
            setActionLoading(`${userEmail}-${role}`);
            const result = await adminRemoveRole(userEmail, role);
            if (result.success) {
                await loadData();
            }
        } catch (err: any) {
            console.error('Remove role error:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter(user =>
        user.correo_principal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <Card className="max-w-2xl mx-auto mt-8">
                <CardContent className="p-6 text-center">
                    <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-600 mb-2">Acceso Denegado</h2>
                    <p className="text-gray-600">{error}</p>
                    <p className="text-sm text-gray-500 mt-2">Solo usuarios con rol Admin pueden acceder a este panel.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-blue-600" />
                        Panel de Administración
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Buscar usuario..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Seleccionar rol" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map(role => (
                                    <SelectItem key={role.nombre_rol} value={role.nombre_rol}>
                                        {role.nombre_rol}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roles</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredUsers.map(user => (
                                    <tr key={user.correo_principal} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre || 'U')}`} />
                                                    <AvatarFallback>{user.nombre?.[0] || 'U'}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm">{user.nombre} {user.apellidos}</p>
                                                    <p className="text-xs text-gray-500">{user.correo_principal}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={user.tipo === 'Organizacion' ? 'secondary' : 'outline'}>
                                                {user.tipo}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles?.map(role => (
                                                    <Badge
                                                        key={role}
                                                        variant="default"
                                                        className="cursor-pointer hover:bg-red-500"
                                                        onClick={() => handleRemoveRole(user.correo_principal, role)}
                                                        title="Click para remover"
                                                    >
                                                        {role}
                                                        {actionLoading === `${user.correo_principal}-${role}` ? (
                                                            <Loader2 className="h-3 w-3 ml-1 animate-spin" />
                                                        ) : (
                                                            <UserMinus className="h-3 w-3 ml-1" />
                                                        )}
                                                    </Badge>
                                                )) || <span className="text-gray-400 text-sm">Sin roles</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={!selectedRole || actionLoading === user.correo_principal}
                                                onClick={() => handleAssignRole(user.correo_principal)}
                                            >
                                                {actionLoading === user.correo_principal ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <UserPlus className="h-4 w-4 mr-1" />
                                                        Asignar
                                                    </>
                                                )}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <p className="text-sm text-gray-500 mt-4">
                        Mostrando {filteredUsers.length} de {users.length} usuarios
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
