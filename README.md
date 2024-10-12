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

4. Los datos para el registro de usuario son mail y password. Hay que validar el mail enviando un mensaje al correo indicado. Para hacerlo usaremos el api de resend.

5. Para los componentes de dise;o usaremos shadcn, que usar tailwind por debajo.

### Especificaciones.

1. La password no puede viajar en claro a el servidor y se usara xxxx para ofuscarla.

2. Todas las keys usadas en los servicios usado hay que ponerlo en el .env. El .env  no se subira a github

3. El usuario seleccionar por cada producto una cantidad y esto se a;adira a una cesta.

4. Si un usuario sale de la web y vuelve a entrar, le apareceran los registros de la cesta.

5. El usuario puede eliminar productos y/o cambiar la cantidad.

6. Cuando el usuario confirma la cesta, debe de meter la direccion de envio con los campos calle, codigo postal, municipio, provincia.

7 Confirmada la direccion, que quedara asociada al pedido, se le pedira que paque.

8. Si el usuario paga, enviar un email con lo que ha pedido.

9. Cuando desde el comercio se le haga el envio, enviar mail con la envio.

10. El cliente debe de poder ver los pedidos y el estado.


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

### Nivel 2. Comercio

Se trata de soluccionar la parte del comercio. Habra usuarios registrados al que el admin del sistema le otorgara permisos de gestor del ecommerce.

Los usuarios con permisos gestor podran:

1. Ver las compras realiadas y el estado en el que han quedado.
2. Cambiar el estado de las compras a enviado.
3. Enviar email a los compradores informandoles de ofertas. A todos o a los seleccionados.
4. Ventas usando el tiempo como variable (dia/mes/hora/trimetre/semestre/aaaa).
5. Ventas usando la  categoria y el tiempo

### Nivel 3. Refactoring 

1. Usar la orientacion a objetos para mejorar el codigo.
2. Usar test para realizar algunos test.
