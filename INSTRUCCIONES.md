# 🚀 TRIMIT - Guía de Ejecución Local

## ✅ Cambios Realizados

### 1. **Rutas Desbloqueadas**

Todas las páginas del proyecto ahora son accesibles:

- ✅ Dashboard
- ✅ Suscripciones
- ✅ Calendario
- ✅ Analíticas
- ✅ Presupuesto
- ✅ Y 15 páginas más...

### 2. **Menú de Desarrollo Agregado**

- En la Landing Page encontrarás un **botón flotante morado** en la esquina inferior derecha
- Haz clic en él para ver **todas las páginas disponibles**
- Puedes navegar a cualquier página desde este menú

---

## 📋 Instrucciones para Ejecutar

### Opción 1: Usando los scripts automáticos (RECOMENDADO)

1. **Ejecuta `install.bat`**
   - Doble clic en el archivo
   - Esto instalará todas las dependencias necesarias
   - Espera a que termine (puede tardar 2-5 minutos)

2. **Ejecuta `run-dev.bat`**
   - Doble clic en el archivo
   - El servidor se iniciará automáticamente
   - Se abrirá en `http://localhost:5173`

### Opción 2: Usando la terminal

```bash
# 1. Navega al directorio del proyecto
cd "e:\LANDING TRIMIT"

# 2. Instala las dependencias
npm install

# 3. Inicia el servidor de desarrollo
npm run dev
```

---

## 🎯 Cómo Navegar

### Desde la Landing Page:

1. Abre `http://localhost:5173` en tu navegador
2. Busca el **botón morado flotante** con icono de menú (☰) en la esquina inferior derecha
3. Haz clic para abrir el menú de desarrollo
4. Selecciona cualquier página para navegar

### Rutas Directas:

También puedes acceder directamente desde la barra de direcciones:

- `http://localhost:5173/dashboard`
- `http://localhost:5173/subscriptions`
- `http://localhost:5173/calendar`
- `http://localhost:5173/analytics`
- etc...

---

## 📁 Estructura de Rutas Actualizada

```
/ ...................... Landing Page (inicio)
/dashboard ............. Panel principal
/subscriptions ......... Lista de suscripciones
/subscriptions/add ..... Agregar nueva suscripción
/subscriptions/:id ..... Detalle de suscripción
/calendar .............. Calendario de pagos
/analytics ............. Análisis y estadísticas
/budget ................ Gestión de presupuesto
/categories ............ Categorías
/payment-methods ....... Métodos de pago
/payments .............. Historial de pagos
/reports ............... Reportes
/trends ................ Tendencias
/recommendations ....... Recomendaciones
/reminders ............. Recordatorios
/notifications ......... Notificaciones
/calculator ............ Calculadora
/archived .............. Elementos archivados
/sharing ............... Compartir
/profile ............... Perfil de usuario
/settings .............. Configuración
/help .................. Ayuda
```

---

## 🛑 Detener el Servidor

- Presiona `Ctrl + C` en la terminal donde está corriendo
- O simplemente cierra la ventana

---

## 🐛 Solución de Problemas

### El servidor no inicia:

1. Asegúrate de tener Node.js instalado (versión 16 o superior)
2. Verifica que `node_modules` existe (si no, ejecuta `npm install`)
3. Revisa que el puerto 5173 no esté en uso

### No veo el botón flotante:

- Asegúrate de estar en la página principal (`http://localhost:5173`)
- El botón está en la esquina inferior derecha, es de color morado

### Las páginas no cargan:

- Verifica que el servidor esté corriendo
- Revisa la consola del navegador (F12) para ver errores
- Algunas páginas pueden estar en desarrollo y mostrar contenido básico

---

## 📝 Notas Adicionales

- El proyecto usa **React + TypeScript + Vite**
- El tema claro/oscuro se maneja automáticamente
- Todas las páginas están estructuradas pero algunas pueden tener contenido de prueba
- El botón de "Comenzar gratis" sigue redirigiendo al Google Form original

---

## ✨ ¡Listo!

Tu proyecto TRIMIT está configurado y listo para desarrollo local con acceso a todas las páginas.
