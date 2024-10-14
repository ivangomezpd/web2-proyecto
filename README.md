# Proyecto fin de WEB 2
## Objetivos del proyecto
    
1. Desmostrar el uso del front y back
2. Trabajar con Bases de datos relacionales
3. Comprender como funciona la autenticacion.
4. Usar una pasarela de pago 
5. Desplegar el proyecto en servicios cloud.
6. Usar apis y sercicios externos.
8. Cuidar el diseño

## Contexto del proyecto

Se trata de hacer un ecommerce en el que haya dos perfiles bien diferenciados. El cliente y el gestor del comercio.

### Nivel 1. Cliente

Se trata de hacer una web que presente unos productos, permita al usuario seleccionar uno o varios productos y que pueda pagarlos con una pasarela de pago.

### Tecnologia a usar
1. Vamos a usar un framwework que tiene mucha traccion que se llama nextjs. Se trata de un framework que combina front / back en un unico proyecto. 
2. La base de datos que vamos a usar es sql y el modelo es de de Northwind, una base de datos que ya hemos usado en la practicas de sql.
3. Para la pasarela de pago usaremos la pasarela redsys, una pasarela espa;ola de bastante uso.
4. Los datos para el registro de usuario son user y password. 
5. Para los componentes de diseño usaremos shadcn, que usa tailwind por debajo.



## Especificaciones del Proyecto

### 1. Autenticación y Gestión de Usuarios

#### 1.1 Registro y Login
- Implementar sistema de registro (SignUp) y login. En el signup daremos de alta Customers
- Generar JWT al hacer login y almacenarlo en localStorage.
- Validar el token en el servidor en cada uso para verificar integridad y caducidad.

#### 1.2 Seguridad
- Hashear la contraseña antes de enviarla al servidor.
- Implementar cambio de contraseña para usuarios autenticados.

#### 1.3 Gestión de Sesión
- Redirigir al dashboard tras login exitoso.
- Redirigir a login o home si se intenta acceder al dashboard sin autenticación.

#### 1.4 Perfil de Usuario
- Permitir edición del registro de cliente (customer) autenticado.

### 2. Catálogo de Productos

#### 2.1 Listado de Productos
- Desarrollar página que muestre todos los productos disponibles.

#### 2.2 Página de Producto Individual
- Mostrar detalles del producto seleccionado.
- Permitir especificar cantidad deseada.

### 3. Gestión del Carrito de Compras

#### 3.1 Funcionalidad del Carrito
- Agregar productos con cantidades especificadas.
- Mantener carrito para usuarios no autenticados.
- Asociar carrito al usuario tras autenticación.
- Persistir carrito entre sesiones para usuarios autenticados.
- Eliminar carrito si el usuario no se autentica.

#### 3.2 Modificación del Carrito
- Permitir cambios en la cantidad de productos.
- Eliminar productos si la cantidad se establece en 0.

### 4. Proceso de Pedido

#### 4.1 Confirmación del Pedido
- Permitir confirmación del contenido del carrito.
- Crear registros en tablas Orders y Order Details.

#### 4.2 Visualización del Pedido
- Mostrar detalles del pedido confirmado a usuarios autenticados.

### 5. Proceso de Pago

#### 5.1 Integración de Pasarela de Pago (Redsys)
- Implementar pago utilizando Redsys.
- URL de pruebas: https://pagosonline.redsys.es/entornosPruebas.html
- Datos de tarjeta de prueba:
  - Número: 4548810000000003
  - Caducidad: 12/29
  - Código de seguridad: 123

#### 5.2 Registro de Pago
- Crear registro en la tabla `cobro` tras pago exitoso.

#### 5.3 Manejo de Errores de Pago
- Implementar reintentos si el pago falla o es cancelado.

### 6. Configuración y Seguridad

#### 6.1 Gestión de Variables de Entorno
- Almacenar claves de servicios en archivo .env.
- Excluir .env de control de versiones (no subir a GitHub).

## Estructura de la Base de Datos (SQLite)

Tablas añadidas a la base de datos.

Archivo: `northwind.db`

### Tablas

#### 1. users
```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    acceptPolicy BOOLEAN NOT NULL,
    acceptMarketing BOOLEAN NOT NULL
);
```
Notas:
- Se inicializa con todos los customers.
- Utilizada para autenticación.

#### 2. cesta
```sql
CREATE TABLE IF NOT EXISTS cesta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId INTEGER NOT NULL,
    username TEXT NOT NULL,
    cantidad INTEGER NOT NULL,
    UNIQUE(productId, username)
);
```

#### 3. cobro
```sql
CREATE TABLE IF NOT EXISTS cobro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId INTEGER NOT NULL,
    customerId TEXT NOT NULL,
    amount REAL NOT NULL,
    authorizationCode TEXT NOT NULL UNIQUE,
    fecha TEXT NOT NULL
);
```


### Nivel 2. Mejoras en el cliente


1. En la pagina de productos poner un sidenav con las categorias. Pinchando que aparezcan los productos
2. Pagina los productos de 10 en 10


#### Perfil comercio

Claro, aquí tienes el texto reformateado:

---

Se trata de solucionar la parte del comercio. Habrá usuarios registrados a los que el administrador del sistema les otorgará permisos de gestor del eCommerce.

Los usuarios con permisos de gestor podrán:

1. Ver la lista de clientes.
2. Ver la lista de las últimas compras.
3. Consultar las compras realizadas por cada cliente.
4. Cambiar el estado de un pedido a "enviado".
5. Analizar las ventas usando el tiempo como variable (día/mes/hora/trimestre/semestre/año).
6. Analizar las ventas usando la categoría y el tiempo.
7. Consultar el log de actividad del usuario. 

--- 

Espero que esto sea lo que necesitabas.
### Nivel 3. Refactoring 

1. Usar la orientacion a objetos para mejorar el codigo.
2. Usar test para realizar algunos test.
