import { useState, useEffect } from 'react';

interface UserRoles {
    isPersona: boolean;
    isOrg: boolean;
    isModerator: boolean;
    isAdmin: boolean;
    isVisitor: boolean;
    roles: string[];
}

export function useRole(): UserRoles {
    const [roles, setRoles] = useState<UserRoles>({
        isPersona: false,
        isOrg: false,
        isModerator: false,
        isAdmin: false,
        isVisitor: true,
        roles: []
    });

    useEffect(() => {
        const checkRoles = () => {
            const storedRolesStr = localStorage.getItem('userRoles');
            const userType = localStorage.getItem('userType'); // 'persona' | 'organizacion' legacy fallback

            let parsedRoles: string[] = [];
            try {
                parsedRoles = storedRolesStr ? JSON.parse(storedRolesStr) : [];
            } catch (e) {
                console.error('Error parsing roles', e);
            }

            const isOrg = parsedRoles.includes('Entidad') || userType === 'organizacion';
            const isPersona = parsedRoles.includes('Persona') || userType === 'persona'; // Fallback logic
            const isModerator = parsedRoles.includes('Moderador');
            const isAdmin = parsedRoles.includes('Administrador'); // Or 'Admin' depending on DB string
            const isVisitor = !localStorage.getItem('userEmail');

            setRoles({
                isPersona,
                isOrg,
                isModerator,
                isAdmin,
                isVisitor,
                roles: parsedRoles
            });
        };

        checkRoles();
        // Listen for storage changes just in case (login/logout in other tabs)
        window.addEventListener('storage', checkRoles);
        return () => window.removeEventListener('storage', checkRoles);
    }, []);

    return roles;
}
