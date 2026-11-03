# Catálogo del vendedor

Ruta lazy: `/seller/catalog`. `CatalogPage` mantiene la búsqueda y el carrito con
signals; `CatalogLayout` organiza el encabezado y el contenido. `CatalogToolbar`
es un organismo y `CatalogSearch` una molécula con `NgpSearch`, `NgpInput` y
`NgpSearchClear`. Se reutilizan `ButtonField` y `BookCover`.

La página recibe `username` y `books` como inputs; el catálogo usa el contrato
`CatalogBook`. Actualmente muestra `DEMO_BOOKS` y el nombre `Usuario`. Reemplaza
esos datos desde el contenedor o la integración de inventario y sesión.

La búsqueda compara título y autor, ignorando mayúsculas y acentos. El botón de
limpiar y Escape restablecen el filtro. El carrito cuenta unidades, conserva sus
elementos al filtrar y permite quitarlos desde un diálogo. Solo agrega libros
disponibles aquí (`yes`) y hasta el número de copias indicado. Es estado local:
se pierde al recargar o salir de la página; no reserva inventario ni procesa ventas.

Información y carrito usan diálogos nativos con cierre por Escape y restauración
de foco. El botón de salir vacía el carrito y navega a `/auth`; cuando exista un
servicio de sesión, `logout()` debe llamar también a la operación de cierre real.
No se ha añadido un guard de autenticación porque el proyecto todavía no tiene
un proveedor de sesión configurado.

El usuario aparece a la izquierda, la canasta junto al lado izquierdo del buscador
y salir al extremo derecho. En móvil la canasta y el buscador comparten una segunda
fila y la cuadrícula tiene dos columnas. El contador representa el total de unidades,
no la cantidad de títulos distintos.
