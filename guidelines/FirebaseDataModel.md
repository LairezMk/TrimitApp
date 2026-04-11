# Firebase Data Model - TrimIt

Este documento define una estructura inicial para Firestore + Firebase Auth orientada a:
- Registro/login simple de usuarios.
- Gestion de suscripciones.
- Funciones actuales del proyecto (pagos, alertas, categorias, reportes, recomendaciones, presupuesto).

## 1) Autenticacion (Firebase Auth)

Proveedor inicial recomendado:
- Email/Password (simple y rapido de implementar).

Campos minimos en registro:
- email
- password
- displayName (opcional en UI; recomendable)

Flujo recomendado:
1. Crear usuario en Auth.
2. Crear documento en `users/{uid}` con perfil base.
3. Guardar `uid` como clave principal para todo el dominio del usuario.

## 2) Estructura Firestore (por usuario)

Se recomienda usar subcolecciones por usuario para simplificar seguridad y aislamiento de datos:

- `users/{uid}`
  - `subscriptions/{subscriptionId}`
  - `payments/{paymentId}`
  - `reminders/{reminderId}`
  - `categories/{categoryId}`
  - `budgets/{budgetId}`
  - `notifications/{notificationId}`
  - `recommendations/{recommendationId}`
  - `sharedAccess/{shareId}`

## 3) Esquema de documentos

### 3.1 users/{uid}
Campos sencillos recomendados:
- `email: string`
- `displayName: string`
- `photoURL: string | null`
- `role: "user" | "admin"`
- `status: "active" | "blocked" | "deleted"`
- `currency: "COP" | "USD" | "EUR"` (default: `COP`)
- `timezone: string` (default: `America/Bogota`)
- `createdAt: Timestamp`
- `updatedAt: Timestamp`
- `lastLoginAt: Timestamp | null`

### 3.2 users/{uid}/subscriptions/{subscriptionId}
Campos clave para tus funciones:
- `name: string`
- `categoryId: string | null`
- `amount: number`
- `currency: string`
- `billingCycle: "monthly" | "yearly" | "weekly" | "custom"`
- `billingInterval: number` (ej. cada 1 mes, cada 12 meses)
- `startDate: Timestamp`
- `nextPaymentDate: Timestamp`
- `paymentMethodId: string | null`
- `status: "active" | "paused" | "cancelled" | "trial" | "archived"`
- `isAutoRenew: boolean`
- `provider: string | null` (Netflix, Spotify, etc.)
- `icon: string | null`
- `color: string | null`
- `notes: string | null`
- `tags: string[]`
- `cancelUrl: string | null`
- `createdAt: Timestamp`
- `updatedAt: Timestamp`
- `archivedAt: Timestamp | null`

### 3.3 users/{uid}/payments/{paymentId}
Historial de cobros/pagos reales o estimados:
- `subscriptionId: string`
- `amount: number`
- `currency: string`
- `paymentDate: Timestamp`
- `periodStart: Timestamp | null`
- `periodEnd: Timestamp | null`
- `status: "paid" | "failed" | "refunded" | "pending"`
- `source: "manual" | "projected" | "imported"`
- `createdAt: Timestamp`

### 3.4 users/{uid}/reminders/{reminderId}
- `subscriptionId: string`
- `type: "before_charge" | "budget_limit" | "renewal" | "custom"`
- `daysBefore: number`
- `enabled: boolean`
- `channel: "in_app" | "email"`
- `nextTriggerAt: Timestamp`
- `lastTriggeredAt: Timestamp | null`
- `createdAt: Timestamp`
- `updatedAt: Timestamp`

### 3.5 users/{uid}/categories/{categoryId}
- `name: string`
- `color: string`
- `icon: string | null`
- `isDefault: boolean`
- `createdAt: Timestamp`

### 3.6 users/{uid}/budgets/{budgetId}
Presupuesto mensual por categoria o global:
- `scope: "global" | "category"`
- `categoryId: string | null`
- `limitAmount: number`
- `currency: string`
- `month: string` (formato `YYYY-MM`)
- `alertPercent: number` (ej. 80)
- `createdAt: Timestamp`
- `updatedAt: Timestamp`

### 3.7 users/{uid}/notifications/{notificationId}
- `type: "payment_due" | "payment_failed" | "budget_alert" | "recommendation" | "system"`
- `title: string`
- `message: string`
- `read: boolean`
- `relatedId: string | null`
- `createdAt: Timestamp`

### 3.8 users/{uid}/recommendations/{recommendationId}
- `subscriptionId: string`
- `type: "unused" | "duplicate" | "price_increase" | "downgrade_plan"`
- `impactAmount: number`
- `currency: string`
- `confidence: number` (0-1)
- `status: "new" | "dismissed" | "accepted"`
- `createdAt: Timestamp`

### 3.9 users/{uid}/sharedAccess/{shareId}
- `targetUserId: string`
- `permission: "read" | "write"`
- `status: "pending" | "accepted" | "revoked"`
- `createdAt: Timestamp`

## 4) Indices recomendados (Firestore)

Crear indices compuestos para consultas comunes:
- `subscriptions`: `status ASC, nextPaymentDate ASC`
- `subscriptions`: `categoryId ASC, status ASC`
- `payments`: `paymentDate DESC`
- `notifications`: `read ASC, createdAt DESC`
- `recommendations`: `status ASC, createdAt DESC`
- `budgets`: `month ASC, scope ASC`

## 5) Convenciones recomendadas

- Todos los docs con `createdAt` y `updatedAt`.
- Fechas siempre en `Timestamp`, no string.
- Montos en `number` y con moneda explicita (`currency`).
- Soft delete con `status = archived/deleted` cuando aplique.
- Evitar duplicar datos calculables (ej. total mensual), calcular en query/servicio.

## 6) MVP sugerido (primera fase)

Si quieres avanzar rapido, empieza con:
- `users/{uid}`
- `users/{uid}/subscriptions`
- `users/{uid}/payments`
- `users/{uid}/reminders`

Con eso ya cubres login, listado de suscripciones, calendario de cobros, historial y alertas basicas.
