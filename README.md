# AstroMath 🚀🪐

AstroMath es una aplicación web educativa e interactiva diseñada para que los niños aprendan y practiquen las tablas de multiplicar (del 1 al 10) de manera divertida. Con una temática de "Aventura Espacial Animada", la aplicación cuenta con divertidos planetas, colores brillantes, una interfaz amigable y efectos de sonido envolventes que mantienen a los niños motivados y enfocados.

## 📖 Descripción General del Proyecto

AstroMath ha sido creado pensando en una experiencia gamificada ("EdTech"). Los niños viajan por el espacio donde cada tabla de multiplicar es un planeta que deben superar. Al completar ejercicios, pueden desbloquear niveles más avanzados y adquirir recompensas visuales (estrellas). La aplicación usa retroalimentación inmediata (tanto visual como auditiva) para reforzar el proceso de aprendizaje continuo y cuenta con sistemas de perfiles para que múltiples niños puedan hacer seguimiento de su propio progreso.

## 🛠 Stack Tecnológico Utilizado

El proyecto está construido con herramientas y frameworks modernos para asegurar el más alto rendimiento y la mejor experiencia de usuario:

- **Frontend Framework:** [Angular 21](https://angular.dev/) (Uso exclusivo de **Standalone Components**, control de flujo moderno y gestión reactiva del estado con **Angular Signals**).
- **Estilos:** [Tailwind CSS 4](https://tailwindcss.com/) (Diseño altamente responsivo, con colores específicos de la temática espacial: Space Blue, Star Yellow, Alien Green, Comet Red).
- **Iconografía:** [Lucide-Angular](https://lucide.dev/) para iconos de interfaz limpios y modernos.
- **Efectos de Audio:** [Howler.js](https://howlerjs.com/) para efectos de sonido inmersivos de acierto, error y finalización de niveles.
- **Backend y Autenticación:** Firebase (Autenticación de usuarios segura y gestión de base de datos).
- **Testing:** [Vitest](https://vitest.dev/) y Angular Testing Library para pruebas unitarias rápidas y confiables.

## ⚙️ Información sobre su Instalación y Ejecución

Sigue estos pasos para ejecutar el proyecto en tu entorno local de desarrollo:

### 1. Requisitos previos
- [Node.js](https://nodejs.org/) instalado (se recomienda la versión LTS más reciente).
- NPM (gestor de paquetes de Node) o el gestor de paquetes de tu preferencia instalado globalmente.

### 2. Instalación de dependencias
Abre tu terminal, clona el proyecto desde el [Repositorio GitHub](https://github.com/hsaeia-ventures/math-tables-for-kids), navega a la raíz del proyecto (la carpeta `math-tables-for-kids`) y ejecuta el siguiente comando para instalar todos los paquetes y dependencias necesarias:
```bash
npm install --legacy-peer-deps
```

### 3. Configuración del Entorno (Variables)
Asegúrate de configurar los archivos `environment.ts` y `environment.development.ts` dentro de la carpeta pertinente (por ejemplo, `src/environments/`) incluyendo las credenciales de Firebase/Supabase para que la base de datos de Auth e información guarden los cambios correctamente.

### 4. Lanzar el servidor de desarrollo
Para iniciar la aplicación localmente, ejecuta:
```bash
npm start
```
*(O alternativamente usando la CLI de Angular: `ng serve`)*

Una vez que el servidor haya procesado la aplicación, abre tu navegador web de preferencia y visita la URL: `http://localhost:4200/`. La aplicación se recargará automáticamente siempre que guardes y modifiques algún archivo fuente.

### 5. Configuración de Pruebas y Productiva
- **Para ejecutar las pruebas unitarias (Vitest):** `npm run test` (o `ng test`).
- **Para construir a producción compilando el proyecto:** `npm run build` o `ng build`. Los archivos optimizados generados residirán en el directorio `dist/`.

## 📁 Estructura del Proyecto

La aplicación sigue una arquitectura modular y escalable para separar la lógica, vistas y responsabilidades de manera muy clara:

```text
public/           # Imágenes corporativas e iconos.
src/
 ├── app/
 │    ├── core/        # Servicios singleton (StorageService, SoundService, AuthService), Guards, y Modelos.
 │    ├── shared/      # Componentes reutilizables a nivel global (StarBackground, Buttons, UI compartida).
 │    └── features/    # Módulos y vistas principales basados en funcionalidad (Login, Perfiles, Dashboard, Juego).
  ├── environments/     # Configuración de variables de entorno (desarrollo, producción).
 └── styles.css        # Estilos globales y configuración raíz de Tailwind.
```
*Además de los directorios estándar, el proyecto contempla documentación como: `context/` (Manejo documental, PRDs) y `docs/` (Guías de arquitectura y despliegue).*

## 🚀 Funcionalidades Principales

**1. Autenticación y Administración de Perfiles (Padres/Jugadores):**
- Inicio de sesión seguro para padres/profesores (vía Firebase Auth).
- Gestión múltiple de "Perfiles de Jugadores" para los niños. Allí mismo pueden establecer su propio nombre, edad, escoger un divertido avatar personal, y guardar su racha de estrellas total.

**2. Panel de Control de Misiones (El Dashboard):**
- Un gran mapa de navegación espacial visible en donde aparecen 10 planetas mágicos, cada uno corresponde a una de las tablas matemáticas (del 1 al 10).
- Utiliza diversos indicadores visuales en vivo que muestran tu progreso; incluye candados para los niveles bloqueados y la acumulación de estrellas.

**3. Motor de Juego Dinámico y Retador:**
- **Niveles progresivos:** Modo 'Básico' (Preguntas en modo secuencial, paso por paso: 1x1, 1x2...) y Modo 'Avanzado' (Preguntas en forma aleatoria). El modo avanzado solo se desbloquea tras dominar exitosamente el básico.
- **Variabilidad de interacción constante:** Para evitar la monotonía o fatiga mental, los retos cambian probabilísticamente de forma aleatoria (50/50) a través de distintas dinámicas:
  - *Opción múltiple interactiva:* 4 botones interactivos de colores, incluyendo la respuesta correcta y otras 3 incorrectas.
  - *Ingreso de información manual:* Aparece un campo de texto acompañado de un botón alusivo a "Disparar!" (*Fire!*).
- Batallas de series por 10 preguntas por ronda/planeta.

**4. Retroalimentación Inmediata con Refuerzo Positivo:**
- Expresa corrección en vivo y en directo en plena partida: Al equivocarse el pequeño astronauta, el sistema proyecta con un refuerzo audio-visual la respuesta correcta antes de darle pase libre al siguiente cuestionamiento; garantizando de esta forma contundente la interiorización y corrección natural e inmediata de la materia.

## Link Slides
https://docs.google.com/presentation/d/1ISdASPvu4X8jIqmTiwB7uOgqucItdpmTpxpwauufotw/edit?slide=id.g39428a8267a_2_63#slide=id.g39428a8267a_2_63
