"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/app/AuthContext";
import { useRouter } from "next/navigation";
import { isAdmin, getActivityLogs } from "@/lib/db/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity, 
  Search, 
  Filter, 
  Clock,
  User,
  ArrowLeft,
  RefreshCw,
  Eye,
  Download
} from "lucide-react";
import Link from "next/link";

interface ActivityLog {
  id: number;
  username: string;
  action: string;
  details: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  role: string;
}

export default function AdminActivity() {
  const { username } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, [username]);

  const checkAdminAccess = async () => {
    if (!username) {
      router.push('/login');
      return;
    }

    try {
      const adminStatus = await isAdmin(username);
      if (!adminStatus) {
        setError("Acceso denegado. Solo los administradores pueden acceder a esta página.");
        return;
      }

      await loadLogs();
    } catch (err) {
      setError("Error verificando permisos de administrador");
      console.error(err);
    }
  };

  const loadLogs = async () => {
    try {
      setLoading(true);
      const logsData = await getActivityLogs();
      setLogs(logsData);
      setFilteredLogs(logsData);
    } catch (err) {
      setError("Error cargando logs de actividad");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFilters(term, actionFilter, userFilter);
  };

  const handleActionFilter = (action: string) => {
    setActionFilter(action);
    applyFilters(searchTerm, action, userFilter);
  };

  const handleUserFilter = (user: string) => {
    setUserFilter(user);
    applyFilters(searchTerm, actionFilter, user);
  };

  const applyFilters = (search: string, action: string, user: string) => {
    let filtered = logs;

    // Aplicar filtro de búsqueda
    if (search) {
      filtered = filtered.filter(log =>
        log.username.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.details?.toLowerCase().includes(search.toLowerCase()) ||
        log.ip_address?.includes(search)
      );
    }

    // Aplicar filtro de acción
    if (action !== 'all') {
      filtered = filtered.filter(log => log.action === action);
    }

    // Aplicar filtro de usuario
    if (user !== 'all') {
      filtered = filtered.filter(log => log.username === user);
    }

    setFilteredLogs(filtered);
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'login': return 'Inicio de Sesión';
      case 'logout': return 'Cierre de Sesión';
      case 'create_order': return 'Crear Pedido';
      case 'update_order_status': return 'Actualizar Estado';
      case 'payment_success': return 'Pago Exitoso';
      case 'payment_failed': return 'Pago Fallido';
      case 'profile_update': return 'Actualizar Perfil';
      case 'add_to_cart': return 'Agregar al Carrito';
      case 'remove_from_cart': return 'Quitar del Carrito';
      default: return action;
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'login':
      case 'payment_success':
      case 'create_order':
        return 'default';
      case 'payment_failed':
      case 'logout':
        return 'destructive';
      case 'update_order_status':
      case 'profile_update':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getUniqueUsers = () => {
    const users = [...new Set(logs.map(log => log.username))];
    return users.sort();
  };

  const getUniqueActions = () => {
    const actions = [...new Set(logs.map(log => log.action))];
    return actions.sort();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando logs de actividad...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Logs de Actividad</h1>
          <div className="flex gap-2">
            <Button onClick={loadLogs} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Link href="/admin">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Panel
              </Button>
            </Link>
          </div>
        </div>
        <p className="text-gray-600">Consulta el historial de actividades y acciones de todos los usuarios del sistema.</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por usuario, acción o detalles..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={actionFilter} onValueChange={handleActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por acción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las acciones</SelectItem>
                {getUniqueActions().map((action) => (
                  <SelectItem key={action} value={action}>
                    {getActionLabel(action)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={userFilter} onValueChange={handleUserFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por usuario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los usuarios</SelectItem>
                {getUniqueUsers().map((user) => (
                  <SelectItem key={user} value={user}>
                    {user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-600 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              {filteredLogs.length} de {logs.length} registros
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Historial de Actividad
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha/Hora</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Detalles</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Rol</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">
                            {new Date(log.created_at).toLocaleDateString('es-ES')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(log.created_at).toLocaleTimeString('es-ES')}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{log.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {getActionLabel(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm truncate" title={log.details || 'Sin detalles'}>
                          {log.details || 'Sin detalles'}
                        </p>
                        {log.user_agent && (
                          <p className="text-xs text-gray-500 truncate" title={log.user_agent}>
                            {log.user_agent}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {log.ip_address || 'N/A'}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {log.role || 'user'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron registros de actividad con los filtros aplicados.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      {logs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logs.length}</div>
              <p className="text-xs text-muted-foreground">Actividades registradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Usuarios Únicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getUniqueUsers().length}</div>
              <p className="text-xs text-muted-foreground">Usuarios activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Tipos de Acciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getUniqueActions().length}</div>
              <p className="text-xs text-muted-foreground">Diferentes acciones</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 