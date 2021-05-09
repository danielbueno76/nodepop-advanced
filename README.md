# Practica 10: Backend Avanzado

Autenticación, internacionalización, subida de imagen con tarea en backgroundy tests de integracion.

## Tecnologías usadas

- VS Code
- MongoDB
- Node.js
- EJS

## Comandos

1. npm run initDB = Inicialización de la base de datos
2. npm run start = Ejecución de la web-api.
3. npm run dev = Ejecución de la web-api con nodemon en localhost:3000. Entorno de desarrollo.
4. npm run conversionImage = Se activa el microservicio que hace thumbnail de cada imagen que se sube con POST /api/advertisement con un tamaño de 100x100 pixeles. También funciona si ejecutas npm run initDB, ya que hará thumbnail de las imagenes usadas para la inicializacion de la base de datos.
5. npm run test = Ejecuta los tests de la api.

_Necesitas hacerte una copia del fichero .env.example y renombrarlo a .env para poder usar tu propia configuración al proyecto._

```shell
cp .env.example .env
```

## API

### Ejemplos

1. POST /api/authenticate = Realiza login y devuelve un token JWT.
2. GET /api/advertisement = Obten todos los anuncios en formato json. Es necesario incluir el token JWT en uno de los siguientes sitios: cabecera, body o query. Si no incluyes el token o está expirado devolverá un 401.
3. GET /api/advertisement/:id = Obten un anuncio con el id especificado en formato json.
4. POST /api/advertisement = añade un anuncio a la base de datos.
5. PUT /api/advertisement/:id = Modifica el anuncio con el id especificado.
6. DELETE /api/advertisement/:id = Borra el anuncio con el id especificado.

## Querys

### Ejemplos

1. ?tag=motor = Te muestra todos los anuncios que tengan ese tag. Si quieres poner más de un tag, se haría así: ?tag=motor&tag=work . Así te mostraría todos los anuncios que tengan motor y work. (Condición OR)
2. ?name=Bi = Te muestra los nombres que empiezen por Bi.
3. ?price=20- = Te muestra todos los anuncios con un precio mayor que 20. Si pones ?price=20 te mostrará los anuncios con precio igual a 20. Si pones ?price=20-50 te mostrará los anuncios con un precio mayor que 20 y menos que 50.
4. ?limit=1 = Te muestra 1 anuncio.
5. ?start=0 = Te muestra a partir del primer anuncio.
6. ?sort=price = Ordena los anuncios por precio.
7. ?sale=false = Tipo de anuncio. Si es false es de búsqueda y si es true es de venta.
