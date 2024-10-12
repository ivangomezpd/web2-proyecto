# Proyecto fin de WEB 2
## Objetivos del proyecto
    
1. Desmostrar el uso del front y back
2. Trabajar con Bases de datos relacionales
3. Usar jwt como token
4. Usar una pasarela de pago 
5. Desplegar el proyecto en servicios cloud.
6. Usar apis y sercicios externos.
7. Cumplir requisitos de seguridad.
8. Cuidar el dise;o.

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

### Especificaciones.

1. Habra un sigung y un login, para que los usuarios puedan registrarse y logearse. Cuando se haga el login se generara un jwt y se guardara en localStorage. Siempre que se tome el token del localStorage, se validara este en el servidor, por si ha sido alterado o ha caducado.
2. La password no puede viajar en claro a el servidor y se usara xxxx para ofuscarla.
3. Todas las keys usadas en los servicios usado hay que ponerlo en el .env. El .env  no se subira a github
4. Habra una pagina que liste todos los productos
5. Seleccionando un producto nos iremos a la pagina del producto y podremos meter la cantidad.
6. Cuando metamos la cantidad se metera el dato es una cesta. Hay que tener en cuenta que el usuario puede no estar autenticado cuando empiece a comprar. 
7. Cuando el usuario se logea se conecta la cesta al usuario. Si el usuario sale y vuelve a entrar la cesta sigue estando.
8. Si el usuario no se logea la cesta se pierde.
9. El usuario puede cambiar la cantidad del producto. Si pone un 0, se elimina de la cesta
10. Cuando el usuario ve la cesta debe de poder confirmar esta. Significa que se creara un registro en Orders y varios en Order Details, que contengan lo que ha pedido.
11. Cuando ha confirmado el pedido, podra verlo, ya que esta logeado. En esta pagina del pedido podra pagarlo con la pasarela.
12 Cuando pague el pedido se creara una registro en 
```sql
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                orderId INTEGER NOT NULL,
                customerId TEXT NOT NULL,
                amount REAL NOT NULL,
                authorizationCode TEXT NOT NULL UNIQUE,
                fecha TEXT NOT NULL
```
Esto indicara al sistema que el pedido esta pagado

13. Si el usuario ha cancelado la pasarela o no tiene fondos, entonces debera de poder intentarlo otra vez.
14. Cuando el usuario se logea debe de ir a una pagina que llamamos dasboard
15. Si se intenta entrar en el dashboard sin estar logeado, debe de redireccionarnos al login o la home.
16. Cambiar la password.




### sobre la pasarela de pago redsys

https://pagosonline.redsys.es/entornosPruebas.html

tarjeta 4548810000000003
caducidad :12/29
codigo de seguridad: 123


### sobre la base de datos

la base de datos sqlite esta en el proyecto: northwind.db

1. USER
TABLA USER PARA LA AUTENTICACION
SE INICIALIZA CON TODOS LOS CUSTOMERS 

```
 CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        acceptPolicy BOOLEAN NOT NULL,
        acceptMarketing BOOLEAN NOT NULL
      );
```
2. CESTA
```
CREATE TABLE IF NOT EXISTS cesta (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                productId INTEGER NOT NULL,
                username TEXT NOT NULL,
                cantidad INTEGER NOT NULL,
                UNIQUE(productId, username)
            )
```

3. COBROS
```
CREATE TABLE IF NOT EXISTS cobro (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                orderId INTEGER NOT NULL,
                customerId TEXT NOT NULL,
                amount REAL NOT NULL,
                authorizationCode TEXT NOT NULL UNIQUE,
                fecha TEXT NOT NULL
            )
```

### Nivel 2. Mejoras en el cliente


1. En la pagina de productos poner un sidenav con las categorias. Pinchando que aparezcan los productos
2. Pagina los productos de 10 en 10


#### Perfil comercio

Se trata de soluccionar la parte del comercio. Habra usuarios registrados al que el admin del sistema le otorgara permisos de gestor del ecommerce.

Los usuarios con permisos gestor podran:

1. Lista de clientes
2. Lista de ultimas compras
3. Compras realizadas por cliente
4. Cambiar estado de enviado a un pedido
5. Ventas usando el tiempo como variable (dia/mes/hora/trimetre/semestre/aaaa).
6. Ventas usando la  categoria y el tiempo

### Nivel 3. Refactoring 

1. Usar la orientacion a objetos para mejorar el codigo.
2. Usar test para realizar algunos test.
