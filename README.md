# TrimitApp

Aplicación web para gestionar y controlar suscripciones de servicios.

## 🚀 Características

- ✨ Dashboard interactivo con estadísticas en tiempo real
- 📊 Visualización de gastos mensuales
- 📅 Calendario de pagos
- 🔔 Alertas y notificaciones
- 🎨 Tema claro/oscuro
- 📱 Diseño responsive

## 🛠️ Tecnologías

- React 18 + TypeScript
- Vite 6
- TailwindCSS 4
- React Router 7
- Radix UI + shadcn/ui
- Lucide Icons

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

## 🎯 Uso

1. Ejecuta `npm install` para instalar las dependencias
2. Ejecuta `npm run dev` para iniciar el servidor de desarrollo
3. Abre `http://localhost:5173` en tu navegador
4. Configura Firebase siguiendo `guidelines/FirebaseSetup.md` y abre `/auth`

### Recordatorios por correo (días configurables)

La app ahora encola correos en la colección `mail` cuando faltan los días definidos en Configuración (1 a 15) y está habilitado el recordatorio por correo.
Para envío real por email, activa la extensión de Firebase **Trigger Email** apuntando a la colección `mail`.

## 📝 Estructura del Proyecto

```
src/
├── app/
│   ├── components/    # Componentes reutilizables
│   ├── contexts/      # Context providers (Theme)
│   ├── pages/         # Páginas de la aplicación
│   ├── types/         # TypeScript types
│   └── routes.ts      # Configuración de rutas
├── assets/            # Imágenes y recursos
└── styles/            # Estilos globales
```

## 👥 Equipo

- Jonathan Gaviria Ocampo - Backend & Pruebas
- Samuel Herrera Marin - Frontend & Diseño
- Juan David Correa - Marketing & Estrategia

## 📄 Licencia

Este proyecto es privado y confidencial.

---

© 2026 Trimit. Todos los derechos reservados.
