# 🎯 Sistema de Administración - E-commerce

## 📋 Descripción

Sistema completo de administración para la plataforma de e-commerce con las siguientes funcionalidades:

### ✅ Funcionalidades Implementadas

1. **Panel de Administración Principal** (`/admin`)
   - Dashboard con estadísticas en tiempo real
   - Resumen de pedidos recientes
   - Navegación a todas las secciones

2. **Gestión de Clientes** (`/admin/customers`)
   - Lista completa de clientes
   - Búsqueda y filtros
   - Detalles de cada cliente
   - Historial de compras por cliente

3. **Gestión de Pedidos** (`/admin/orders`)
   - Lista de todas las órdenes
   - Filtros por estado y pago
   - Cambio de estado de pedidos (Pendiente → Procesando → Enviado)
   - Búsqueda por ID, empresa o contacto

4. **Análisis de Ventas** (`/admin/analytics`)
   - Análisis por tiempo (hora/día/mes/trimestre/semestre/año)
   - Análisis por categoría
   - Reportes detallados con insights
   - Estadísticas de conversión

5. **Logs de Actividad** (`/admin/activity`)
   - Historial completo de acciones del sistema
   - Filtros por usuario y tipo de acción
   - Información de IP y user agent
   - Estadísticas de actividad

## 🚀 Instalación y Configuración

### 1. Inicializar el Sistema de Administración

```bash
# Ejecutar script de inicialización
node init-admin.js
```

### 2. Crear Usuario Administrador

```bash
# Crear usuario admin con credenciales por defecto
node create-admin.js
```

### 3. Credenciales de Acceso

- **Usuario:** `admin`
- **Contraseña:** `admin123`
- **URL de acceso:** `http://localhost:3000/admin`

⚠️ **IMPORTANTE:** Cambia la contraseña después del primer acceso por seguridad.

## 🔐 Sistema de Roles

### Roles Disponibles:
- **`admin`**: Acceso completo al sistema de administración
- **`user`**: Usuario regular (acceso limitado)

### Verificación de Permisos:
- Todas las páginas de administración verifican el rol del usuario
- Solo usuarios con rol `admin` pueden acceder
- Redirección automática a login si no hay permisos

## 📊 Funcionalidades Detalladas

### Dashboard Principal (`/admin`)
- **Estadísticas en tiempo real:**
  - Total de pedidos del mes
  - Ingresos totales
  - Clientes únicos
  - Tendencia de crecimiento

- **Pedidos recientes:**
  - Lista de los últimos 5 pedidos
  - Estado de pago y envío
  - Enlaces directos a detalles

### Gestión de Clientes (`/admin/customers`)
- **Lista de clientes:**
  - Información completa de cada cliente
  - Estadísticas de compras
  - Total gastado por cliente

- **Búsqueda y filtros:**
  - Búsqueda por empresa, contacto o ID
  - Filtros dinámicos

- **Detalles del cliente:**
  - Información de contacto completa
  - Historial de pedidos
  - Estadísticas de compras

### Gestión de Pedidos (`/admin/orders`)
- **Lista de pedidos:**
  - Todos los pedidos del sistema
  - Información del cliente
  - Estado de pago y envío

- **Cambio de estados:**
  - Pendiente → Procesando → Enviado → Cancelado
  - Actualización en tiempo real
  - Logs de cambios

- **Filtros avanzados:**
  - Por estado de pedido
  - Por estado de pago
  - Búsqueda por ID o cliente

### Análisis de Ventas (`/admin/analytics`)
- **Análisis temporal:**
  - Por hora, día, mes, trimestre, semestre, año
  - Gráficos y tablas detalladas

- **Análisis por categoría:**
  - Ventas por categoría de producto
  - Comparativas temporales

- **Insights automáticos:**
  - Período con más ventas
  - Ticket promedio
  - Tasa de conversión
  - Promedio de pedidos

### Logs de Actividad (`/admin/activity`)
- **Historial completo:**
  - Todas las acciones del sistema
  - Información de usuario y timestamp
  - IP y user agent

- **Tipos de acciones registradas:**
  - Login/Logout
  - Creación de pedidos
  - Actualización de estados
  - Pagos exitosos/fallidos
  - Actualización de perfiles
  - Acciones del carrito

- **Filtros y búsqueda:**
  - Por usuario
  - Por tipo de acción
  - Búsqueda en detalles

## 🗄️ Estructura de Base de Datos

### Tablas Creadas:

1. **`user_roles`**
   - Gestión de roles y permisos
   - Asociación usuario-rol

2. **`activity_logs`**
   - Registro de todas las actividades
   - Información de auditoría

3. **`order_status`**
   - Estados de pedidos
   - Historial de cambios

### Funciones de Base de Datos:

- `initializeAdminTables()`: Crear tablas necesarias
- `isAdmin(username)`: Verificar rol de administrador
- `getAllCustomers()`: Obtener todos los clientes
- `getRecentOrders(limit)`: Obtener pedidos recientes
- `updateOrderStatus()`: Actualizar estado de pedidos
- `getSalesAnalytics()`: Análisis de ventas
- `logActivity()`: Registrar actividad
- `getActivityLogs()`: Obtener logs de actividad

## 🔧 API Endpoints

### Administración:
- `GET /api/admin/orders` - Obtener pedidos
- `PUT /api/admin/orders/[orderId]/status` - Actualizar estado
- `GET /api/admin/analytics` - Obtener análisis

### Seguridad:
- Verificación de rol admin en todos los endpoints
- Validación de parámetros
- Manejo de errores

## 🎨 Interfaz de Usuario

### Características:
- **Diseño responsive** - Funciona en móvil y desktop
- **Componentes modernos** - Usando ShadCN UI
- **Iconos descriptivos** - Lucide React
- **Navegación intuitiva** - Breadcrumbs y enlaces
- **Feedback visual** - Loading states y mensajes

### Componentes Utilizados:
- Cards para información
- Tablas para datos
- Badges para estados
- Selects para filtros
- Inputs para búsqueda
- Botones con iconos

## 🚨 Seguridad

### Medidas Implementadas:
- **Verificación de roles** en todas las páginas
- **Validación de permisos** en API endpoints
- **Logs de auditoría** para todas las acciones
- **Sanitización de datos** en formularios
- **Manejo seguro de contraseñas** con bcrypt

### Recomendaciones:
1. Cambiar contraseña por defecto del admin
2. Configurar HTTPS en producción
3. Implementar rate limiting
4. Configurar backups de base de datos
5. Monitorear logs de actividad

## 🔄 Mantenimiento

### Tareas Recomendadas:
- **Diarias:** Revisar logs de actividad
- **Semanales:** Analizar ventas y tendencias
- **Mensuales:** Revisar permisos de usuarios
- **Trimestrales:** Backup completo de base de datos

### Monitoreo:
- Logs de actividad sospechosa
- Errores en el sistema
- Rendimiento de consultas
- Uso de recursos

## 📞 Soporte

### Para problemas técnicos:
1. Revisar logs de la aplicación
2. Verificar permisos de usuario
3. Comprobar conectividad de base de datos
4. Validar configuración de entorno

### Archivos importantes:
- `src/lib/db/db.ts` - Funciones de base de datos
- `src/app/admin/` - Páginas de administración
- `src/app/api/admin/` - API endpoints
- `init-admin.js` - Script de inicialización
- `create-admin.js` - Script de creación de admin

---

## 🎉 ¡Sistema Listo!

El sistema de administración está completamente implementado y listo para usar. Accede a `http://localhost:3000/admin` con las credenciales proporcionadas y comienza a gestionar tu e-commerce. 