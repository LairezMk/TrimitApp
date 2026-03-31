# 📦 Guía para Subir TRIMIT a GitHub

## 🎯 Pasos para Crear el Repositorio

### 1️⃣ Crear Repositorio en GitHub (Manual)

1. Ve a https://github.com
2. Haz clic en el botón **"+"** (arriba derecha) → **"New repository"**
3. Configura el repositorio:
   - **Repository name:** `TrimitApp`
   - **Description:** "Aplicación web para gestionar suscripciones"
   - **Visibility:** ✅ **Private** (Privado)
   - ❌ NO marques "Add a README file"
   - ❌ NO agregues .gitignore
   - ❌ NO agregues licencia
4. Haz clic en **"Create repository"**
5. **COPIA LA URL** del repositorio (aparecerá algo como: `https://github.com/tu-usuario/TrimitApp.git`)

---

### 2️⃣ Inicializar Git en tu Proyecto Local

Abre una terminal en `E:\LANDING TRIMIT` y ejecuta:

```bash
# Inicializar repositorio git
git init

# Configurar rama principal como 'main'
git branch -M main

# Agregar todos los archivos
git add .

# Hacer el primer commit
git commit -m "Initial commit: TRIMIT App - Landing page y estructura base"
```

---

### 3️⃣ Conectar con GitHub y Subir

```bash
# Conectar con el repositorio remoto (reemplaza con TU URL)
git remote add origin https://github.com/TU-USUARIO/TrimitApp.git

# Subir todo a GitHub
git push -u origin main
```

**IMPORTANTE:** Reemplaza `TU-USUARIO` con tu nombre de usuario de GitHub.

---

## ✅ Verificación

Después de ejecutar los comandos:

1. Ve a tu repositorio en GitHub
2. Deberías ver todos los archivos del proyecto
3. El README.md se mostrará en la página principal
4. Verifica que sea **privado** (candado 🔒)

---

## 📝 Comandos para Futuros Cambios

```bash
# Ver estado de cambios
git status

# Agregar cambios específicos
git add <archivo>

# Agregar todos los cambios
git add .

# Hacer commit
git commit -m "Descripción del cambio"

# Subir cambios
git push

# Ver historial
git log --oneline
```

---

## 🔧 Si Tienes Problemas

### Error: "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/TU-USUARIO/TrimitApp.git
```

### Error: "Permission denied"

```bash
# Verifica que estés autenticado en GitHub
# Usa HTTPS o configura SSH
```

### Error: "Updates were rejected"

```bash
git pull origin main --rebase
git push origin main
```

---

## 🎉 ¡Listo!

Tu proyecto TRIMIT ahora está en GitHub de forma privada y segura.

Puedes compartirlo con tu equipo agregándolos como colaboradores:
**Settings → Collaborators → Add people**

---

## 📌 URLs Útiles

- Tu repositorio: `https://github.com/TU-USUARIO/TrimitApp`
- GitHub Desktop: https://desktop.github.com/ (alternativa visual)
- Git Documentation: https://git-scm.com/doc

---

¿Necesitas ayuda? Avísame si encuentras algún error! 🚀
