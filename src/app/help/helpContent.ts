export interface HelpStep {
  title: string;
  description: string;
  selector?: string;
}

export interface HelpGuide {
  route: string;
  title: string;
  summary: string;
  steps: HelpStep[];
}

export interface HelpFaqCategory {
  category: string;
  questions: Array<{ q: string; a: string }>;
}

export const HELP_GUIDES: HelpGuide[] = [
  {
    route: "/dashboard",
    title: "Dashboard",
    summary: "Resumen rápido de tus suscripciones, métricas y accesos directos.",
    steps: [
      {
        title: "Encabezado principal",
        description: "Desde aquí puedes crear una nueva suscripción en un clic.",
        selector: "[data-tour='dashboard-header']",
      },
      {
        title: "Tarjetas de estadísticas",
        description: "Visualiza gasto mensual, suscripciones activas y olvidadas.",
        selector: "[data-tour='dashboard-stats']",
      },
      {
        title: "Suscripciones recientes",
        description: "Muestra las próximas suscripciones con pago cercano.",
        selector: "[data-tour='dashboard-recent']",
      },
      {
        title: "Acciones rápidas",
        description: "Atajos hacia Calendario y Analíticas para seguir profundizando.",
        selector: "[data-tour='dashboard-actions']",
      },
    ],
  },
  {
    route: "/subscriptions",
    title: "Suscripciones",
    summary: "Administra, filtra y edita todas tus suscripciones desde un solo lugar.",
    steps: [
      {
        title: "Indicadores clave",
        description: "Consulta tu gasto total y el estado de tus suscripciones.",
        selector: "[data-tour='subscriptions-stats']",
      },
      {
        title: "Buscador y filtros",
        description: "Filtra por estado y encuentra suscripciones por nombre.",
        selector: "[data-tour='subscriptions-filters']",
      },
      {
        title: "Grid de suscripciones",
        description: "Haz clic en cualquier tarjeta para editar o revisar detalles.",
        selector: "[data-tour='subscriptions-grid']",
      },
    ],
  },
  {
    route: "/calendar",
    title: "Calendario",
    summary:
      "Centraliza calendario, próximos pagos, pagos registrados y cronología en una sola vista.",
    steps: [
      {
        title: "Vista del mes",
        description: "Navega entre meses y detecta rápidamente días con pagos.",
        selector: "[data-tour='calendar-main']",
      },
      {
        title: "Detalle de fecha",
        description:
          "Selecciona un día para ver próximos cobros y pagos ya registrados en esa fecha.",
        selector: "[data-tour='calendar-day-detail']",
      },
      {
        title: "Resumen del mes",
        description: "Consolida totales del mes y próximos vencimientos.",
        selector: "[data-tour='calendar-summary']",
      },
      {
        title: "Registrar pago",
        description: "Agrega manualmente pagos asociados a una suscripción.",
        selector: "[data-tour='payments-register']",
      },
      {
        title: "Filtros de estado",
        description: "Alterna entre todos, pagados y programados.",
        selector: "[data-tour='payments-filters']",
      },
      {
        title: "Cronología",
        description: "Revisa cada movimiento en orden con fecha, monto y estado.",
        selector: "[data-tour='payments-timeline']",
      },
    ],
  },
  {
    route: "/budget",
    title: "Presupuesto",
    summary: "Configura límites globales y por categoría con alertas visuales.",
    steps: [
      {
        title: "Presupuesto total",
        description: "Define el monto mensual objetivo y guarda tus cambios.",
        selector: "[data-tour='budget-overview']",
      },
      {
        title: "Categorías",
        description: "Crea categorías y ajusta sus límites de gasto.",
        selector: "[data-tour='budget-categories']",
      },
      {
        title: "Consejos automáticos",
        description: "Lee recomendaciones según tu comportamiento actual.",
        selector: "[data-tour='budget-insights']",
      },
    ],
  },
  {
    route: "/analytics",
    title: "Estadísticas",
    summary: "Métricas avanzadas para entender tendencias de gasto.",
    steps: [
      {
        title: "Métricas generales",
        description: "Resumen de consumo por periodo.",
        selector: "[data-tour='analytics-metrics']",
      },
      {
        title: "Gráficos principales",
        description: "Identifica tendencia mensual y distribución por categoría.",
        selector: "[data-tour='analytics-charts']",
      },
      {
        title: "Comparación mensual",
        description: "Contrasta el mes actual con meses anteriores.",
        selector: "[data-tour='analytics-comparison']",
      },
    ],
  },
  {
    route: "/trends",
    title: "Tendencias",
    summary: "Detecta patrones y cambios de gasto en el tiempo.",
    steps: [
      {
        title: "Indicadores de tendencia",
        description: "Resumen de gasto, promedio y meses extremos.",
        selector: "[data-tour='trends-stats']",
      },
      {
        title: "Evolución",
        description: "Evolución de gasto mes a mes.",
        selector: "[data-tour='trends-chart']",
      },
      {
        title: "Insights",
        description: "Identifica incrementos y señales relevantes.",
        selector: "[data-tour='trends-insights']",
      },
    ],
  },
  {
    route: "/reports",
    title: "Reportes",
    summary: "Genera y exporta reportes consolidados.",
    steps: [
      {
        title: "Exportación",
        description: "Descarga la información en PDF o CSV.",
        selector: "[data-tour='reports-actions']",
      },
      {
        title: "Reportes disponibles",
        description: "Consulta resumen mensual, trimestral y proyección.",
        selector: "[data-tour='reports-summary']",
      },
      {
        title: "Gráficos y categorías",
        description: "Revisa comparación mensual y desglose por categoría.",
        selector: "[data-tour='reports-chart']",
      },
    ],
  },
  {
    route: "/categories",
    title: "Categorías",
    summary: "Organiza tus suscripciones en grupos personalizados.",
    steps: [
      { title: "Crear categoría", description: "Agrega categorías para ordenar tus gastos." },
      { title: "Asignación", description: "Asocia suscripciones a categorías relevantes." },
    ],
  },
  {
    route: "/recommendations",
    title: "Recomendaciones",
    summary: "Sugerencias para optimizar gastos según tus suscripciones.",
    steps: [
      {
        title: "Ahorro potencial",
        description: "Resumen del ahorro estimado con base en tus suscripciones.",
        selector: "[data-tour='recommendations-summary']",
      },
      {
        title: "Sugerencias activas",
        description: "Recomendaciones de ahorro y optimización.",
        selector: "[data-tour='recommendations-list']",
      },
      {
        title: "Precios de referencia",
        description: "Analiza alternativas colombianas para comparar mejor.",
        selector: "[data-tour='recommendations-market']",
      },
    ],
  },
  {
    route: "/profile",
    title: "Perfil",
    summary: "Administra tus datos personales y seguridad.",
    steps: [
      {
        title: "Información de cuenta",
        description: "Actualiza nombre y datos personales.",
        selector: "[data-tour='profile-info']",
      },
      {
        title: "Seguridad",
        description: "Cambia tu contraseña desde el perfil.",
        selector: "[data-tour='profile-security']",
      },
      {
        title: "Resumen",
        description: "Consulta tu actividad y acceso a logros.",
        selector: "[data-tour='profile-summary']",
      },
    ],
  },
  {
    route: "/profile/achievements",
    title: "Logros",
    summary: "Desbloquea insignias según tu actividad y progreso en Trimit.",
    steps: [
      {
        title: "Resumen de logros",
        description: "Consulta cuántas insignias has desbloqueado y cuál fue tu último avance.",
        selector: "[data-tour='achievements-progress']",
      },
      {
        title: "Listado de logros",
        description: "Revisa requisitos, rareza y progreso de cada logro disponible.",
        selector: "[data-tour='achievements-list']",
      },
    ],
  },
  {
    route: "/settings",
    title: "Configuración",
    summary: "Personaliza comportamiento y preferencias de la aplicación.",
    steps: [
      {
        title: "Notificaciones",
        description: "Configura avisos, correos y recordatorios.",
        selector: "[data-tour='settings-notifications']",
      },
      {
        title: "Apariencia",
        description: "Ajusta tema visual y privacidad de montos.",
        selector: "[data-tour='settings-appearance']",
      },
      {
        title: "Preferencias",
        description: "Ajusta idioma, moneda, zona horaria y reglas por defecto.",
        selector: "[data-tour='settings-preferences']",
      },
      {
        title: "Guardar cambios",
        description: "Sincroniza tus preferencias con tu cuenta.",
        selector: "[data-tour='settings-save']",
      },
    ],
  },
  {
    route: "/notifications",
    title: "Notificaciones y recordatorios",
    summary: "Controla avisos, próximos pagos y recordatorios por correo.",
    steps: [
      {
        title: "Próximos pagos",
        description: "Configura cuándo recibir recordatorios internos o por correo.",
        selector: "[data-tour='notifications-reminders']",
      },
      {
        title: "Centro de notificaciones",
        description: "Revisa, marca o limpia los eventos recientes.",
        selector: "[data-tour='notifications-list']",
      },
      {
        title: "Estado de correos",
        description: "Comprueba si los recordatorios por correo están en cola, enviados o fallidos.",
        selector: "[data-tour='notifications-email-status']",
      },
    ],
  },
  {
    route: "/sharing",
    title: "Compartidas",
    summary: "Crea grupos para dividir pagos recurrentes con otras personas.",
    steps: [
      {
        title: "Resumen compartido",
        description: "Consulta ahorro, grupos activos, miembros y tu pago mensual estimado.",
        selector: "[data-tour='sharing-stats']",
      },
      {
        title: "Crear compartida",
        description: "Elige una suscripción, agrega integrantes y crea el grupo.",
        selector: "[data-tour='sharing-create']",
      },
      {
        title: "Grupos compartidos",
        description: "Administra integrantes, copia enlaces, envía recordatorios o elimina grupos.",
        selector: "[data-tour='sharing-groups']",
      },
    ],
  },
];

export const HELP_FAQS: HelpFaqCategory[] = [
  {
    category: "General",
    questions: [
      {
        q: "¿Cómo agrego una nueva suscripción?",
        a: "En Dashboard o Suscripciones, usa el botón “Nueva Suscripción” y completa nombre, monto, categoría y fecha de pago.",
      },
      {
        q: "¿Puedo importar suscripciones automáticamente?",
        a: "Sí, usando el flujo de Gmail para detectar pagos recurrentes y luego confirmarlos antes de guardarlos.",
      },
    ],
  },
  {
    category: "Pagos",
    questions: [
      {
        q: "¿Cómo funcionan los recordatorios de pago?",
        a: "Se generan según la configuración de recordatorios y te alertan antes del vencimiento.",
      },
      {
        q: "¿Puedo exportar mi historial de pagos?",
        a: "Sí, desde Reportes puedes descargar datos consolidados y usarlos en otras herramientas.",
      },
    ],
  },
  {
    category: "Presupuesto",
    questions: [
      {
        q: "¿Cómo establezco un presupuesto mensual?",
        a: "En Presupuesto define el monto global mensual, añade categorías y guarda los cambios.",
      },
      {
        q: "¿Qué pasa si excedo el presupuesto?",
        a: "La app muestra alertas visuales por categoría y en el resumen para que ajustes tus gastos.",
      },
    ],
  },
];

export function getGuideForPath(pathname: string): HelpGuide | null {
  const exact = HELP_GUIDES.find((guide) => pathname === guide.route);
  if (exact) {
    return exact;
  }

  const partial = HELP_GUIDES.find(
    (guide) => pathname.startsWith(`${guide.route}/`) && guide.route !== "/",
  );
  if (partial) {
    return partial;
  }

  if (pathname === "/" || pathname === "/auth" || pathname === "/help") {
    return null;
  }

  return {
    route: pathname,
    title: "Guía de esta vista",
    summary: "Orientación general para esta sección de Trimit.",
    steps: [
      {
        title: "Vista actual",
        description:
          "Revisa la información principal, acciones disponibles y formularios de esta pantalla.",
        selector: "[data-tour-page]",
      },
    ],
  };
}
