# Practica 10: Backend Avanzado

Autenticación, internacionalización y subida de imagen con tarea en background.

## Tecnologías usadas

- VS Code
- MongoDB
- Node.js
- EJS

## Comandos

1. node run initDB = Inicialización de la base de datos
2. node run start = Ejecución de la web-api.
3. node run dev = Ejecución de la web-api con nodemon en localhost:3000. Entorno de desarrollo.

## API

### Ejemplos

1. GET /api/advertisement = Obten todos los anuncios en formato json.
2. GET /api/advertisement/:id = Obten un anuncio con el id especificado en formato json.
3. POST /api/advertisement = añade un anuncio a la base de datos.
4. PUT /api/advertisement/:id = Modifica el anuncio con el id especificado.
5. DELETE /api/advertisement/:id = Borra el anuncio con el id especificado.

## Querys

### Ejemplos

1. ?tag=motor = Te muestra todos los anuncios que tengan ese tag. Si quieres poner más de un tag, se haría así: ?tag=motor&tag=work . Así te mostraría todos los anuncios que tengan motor y work. (Condición OR)
2. ?name=Bi = Te muestra los nombres que empiezen por Bi.
3. ?price=20- = Te muestra todos los anuncios con un precio mayor que 20. Si pones ?price=20 te mostrará los anuncios con precio igual a 20. Si pones ?price=20-50 te mostrará los anuncios con un precio mayor que 20 y menos que 50.
4. ?limit=1 = Te muestra 1 anuncio.
5. ?start=0 = Te muestra a partir del primer anuncio.
6. ?sort=price = Ordena los anuncios por precio.
7. ?sale=false = Tipo de anuncio. Si es false es de búsqueda y si es true es de venta.
