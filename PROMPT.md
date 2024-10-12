
create a header with a logo a la izquierda y a la derecha un signup y login en el caso de no estar autenticado. Si esta autenticado el nombre del usuario obtenido del localStorage y un boton de logout

SIGNUP
======
a Form to signup using shadcn Form, with username, password two times, accept politica de seguridad, accept comunicaciones comerciales. Password with al menos 6 caracteres mayusculas, minusculas, numeros caracteres especiaels [.,/\]. Send data to function insertUser que es una action function. Cuando se registre correctamente enrutar a /login. Si hay algun error en la llamada obtener con el Alert el error

LOGIN
=====
form Login with username and password. Si no existe poner error. Poner un loading en el Button para indicar al usuario que se esta accediendo. Usar el ComtextGlocal para setear datos. Si todo va bien enlazar con dashboard/username. Enviar los datos del formulario a getUser en lig/db/db. Sacar error cuando venga una exception


DASHBOARD
=========
using getCustomerOrders using customerId params of url presentar a Table using shadcn con los datos recibidos del servidor. Si no se reciben datos sacar una alerta de no hay facturas


FORM DE CANTIDAD
================
form con una cantidad y un boton. Cuando se pulse el boton llamar a una server function llamada cesta con username, productoId, cantidad