# ProCard

## Descripción

ProductividadApp es una aplicación de gestión de tareas y productividad inspirada en Trello, diseñada para ayudarte a organizar y priorizar tus actividades de manera eficiente. Esta aplicación está construida utilizando Vue.js y otras tecnologías web modernas, y se distribuye bajo la licencia **GNU General Public License v3.0**.

https://github.com/user-attachments/assets/df827eba-8695-4183-9f4e-16988a8c92cd

## Características Principales

### 1. **Tablero de Tareas**
El tablero de tareas es el núcleo de la aplicación, donde puedes visualizar y gestionar todas tus tareas de manera intuitiva. Las tareas se organizan en columnas que representan diferentes estados de progreso:

- **Por hacer**: Aquí se listan todas las tareas pendientes que aún no has comenzado.
- **En progreso**: Esta columna contiene las tareas que actualmente estás trabajando.
- **Completado**: Aquí se mueven las tareas que has finalizado.

### 2. **Creación y Edición de Tareas**
Puedes crear nuevas tareas fácilmente y editarlas según sea necesario. Cada tarea puede incluir:
- **Título**: Un nombre descriptivo para la tarea.
- **Descripción**: Detalles adicionales sobre lo que necesitas hacer.
- **Fecha de vencimiento**: Una fecha límite para completar la tarea.
- **Etiquetas**: Para categorizar y priorizar tus tareas.

### 3. **Arrastrar y Soltar**
La interfaz de usuario permite arrastrar y soltar tareas entre diferentes columnas, facilitando la actualización del estado de una tarea de manera rápida y sencilla.

### 4. **Integración con Google Calendar**
La aplicación incluye una integración con Google Calendar, permitiéndote sincronizar tus tareas con tu calendario y visualizar tus eventos directamente desde la aplicación. Esto te ayuda a mantener una visión unificada de tus compromisos y tareas pendientes.

### 5. **Pronóstico del Tiempo**
Un widget de pronóstico del tiempo está integrado en la aplicación, mostrando la temperatura actual y el pronóstico para los próximos tres días. Esto puede ser útil para planificar tus actividades diarias teniendo en cuenta las condiciones climáticas.

### 6. **Importación y Exportación de Tareas**
La aplicación permite importar y exportar tareas en formato JSON, facilitando la migración de datos y el respaldo de tus tareas.

### 7. **Modo Oscuro**
La aplicación soporta un modo oscuro para mejorar la experiencia de usuario en entornos con poca luz, reduciendo la fatiga visual y mejorando la legibilidad.

## Instalación

Para instalar y ejecutar ProductividadApp en tu entorno local, sigue estos pasos:

1. **Clonar el Repositorio**
   ```bash
   [git clone https://github.com/diez/productividadapp.git](https://github.com/Diez111/card.git)
   cd card
   ```

2. **Instalar Dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar la Aplicación**
   ```bash
   npm run serve
   ```

4. **Abrir en el Navegador**
   Abre tu navegador y navega a `http://localhost:8080` para ver la aplicación en funcionamiento.


## Diagrama

![diagram](https://github.com/user-attachments/assets/dc7b2711-0a4d-46c2-8eae-610101369620)


## Licencia

Este proyecto está licenciado bajo la **GNU General Public License v3.0**. Consulta el archivo [LICENSE](LICENSE) para obtener más detalles.

## Contribución

Las contribuciones son bienvenidas. Si encuentras algún problema o tienes una sugerencia, por favor abre un issue o envía un pull request.

## Contacto

Para cualquier pregunta o comentario, puedes contactarme a través de [mi correo electrónico](lautaroagustindiez@gmail.com).

# Configuración de Supabase

Para conectar este proyecto a tu propio servidor de Supabase (local u online), debes definir las siguientes variables de entorno:

- `VITE_SUPABASE_URL`: La URL de tu proyecto Supabase
- `VITE_SUPABASE_ANON_KEY`: La clave pública (anon) de tu proyecto Supabase

Puedes definirlas en tu entorno o modificar los scripts en `package.json`.

Ejemplo de ejecución:

```
VITE_SUPABASE_URL=https://tuproyecto.supabase.co VITE_SUPABASE_ANON_KEY=tu_clave_anon npm run dev
```

---

# Sistema colaborativo y autenticación

Se implementará un sistema de usuarios y autenticación con Supabase Auth. Cada acción relevante quedará registrada con el usuario y la fecha/hora, permitiendo trabajo colaborativo y logs de cambios.

Próximos pasos:
- Registro e inicio de sesión de usuarios
- Guardado de tareas y cambios en Supabase
- Opción de trabajo local o colaborativo
- Log de modificaciones por usuario
