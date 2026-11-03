# Catálogo del vendedor

Ruta lazy: `/seller/catalog`. Carga los 100 libros de `public/stock.json` mediante
`Storage`; valida el contrato antes de exponerlos y permite reintentar ante errores.

`CatalogPage` coordina búsqueda, filtros, orden, paginación y diálogos. Usa señales
para estado y valores derivados. `q`, `availability` y `sort` se sincronizan con los
parámetros de URL. La búsqueda compara título, autor e ISBN sin distinguir acentos.

`BookCover` presenta título completo, autor, precio y disponibilidad. La acción de
agregar está deshabilitada sin existencias, en otra sucursal o al alcanzar el límite
del carrito. Las primeras portadas tienen prioridad de carga; las imágenes fallidas
usan un recurso local. “Cargar más” mueve el foco al primer resultado añadido.

`Cart` conserva cantidades y snapshots con `LocalPersistence`; el catálogo reconcilia
las líneas guardadas con el inventario al cargar. Los cambios se conservan al navegar,
filtrar y recargar. Salir del acceso demo restablece el nombre, conservando el carrito;
“Restablecer demo” elimina carrito, tickets y nombre de esta aplicación.

Los diálogos se implementan con Angular Primitives: contienen el foco, bloquean el
scroll exterior, cierran con Escape y restauran el foco. El checkout registra ventas
simuladas en `Sales` y abre una ruta de ticket persistente e imprimible. El catálogo
ofrece acceso al último ticket. No hay autenticación real ni reserva de existencias.
