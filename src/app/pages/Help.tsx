import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Search,
  BookOpen,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Mail,
  Phone,
  PlayCircle,
} from "lucide-react";
import { HELP_FAQS, HELP_GUIDES, getGuideForPath } from "../help/helpContent";

export default function Help() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [selectedRoute, setSelectedRoute] = useState("/dashboard");
  const [slideIndex, setSlideIndex] = useState(0);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const requestedPage = params.get("page");
  const requestedPath = requestedPage ? decodeURIComponent(requestedPage) : null;

  const currentGuide = useMemo(() => {
    const baseRoute = getGuideForPath(requestedPath || selectedRoute)?.route || selectedRoute;
    return HELP_GUIDES.find((guide) => guide.route === baseRoute) || HELP_GUIDES[0];
  }, [requestedPath, selectedRoute]);

  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return HELP_FAQS;
    }

    return HELP_FAQS.map((category) => ({
      ...category,
      questions: category.questions.filter(
        (question) =>
          question.q.toLowerCase().includes(query) || question.a.toLowerCase().includes(query),
      ),
    })).filter((category) => category.questions.length > 0);
  }, [searchQuery]);

  const selectedStep = currentGuide.steps[Math.min(slideIndex, currentGuide.steps.length - 1)];

  const startTour = () => {
    navigate(`${currentGuide.route}?tour=1`);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      <div className="mb-2">
        <h1 className="text-3xl mb-2 dark:text-white">Centro de Ayuda</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Guías completas, tours por página y respuestas rápidas.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar en preguntas frecuentes..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-semibold dark:text-white">Guía interactiva por página</h2>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          <aside className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {HELP_GUIDES.map((guide) => (
              <button
                key={guide.route}
                onClick={() => {
                  setSelectedRoute(guide.route);
                  setSlideIndex(0);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  currentGuide.route === guide.route
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {guide.title}
              </button>
            ))}
          </aside>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold dark:text-white">{currentGuide.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{currentGuide.summary}</p>
              </div>
              <button
                onClick={startTour}
                className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm inline-flex items-center gap-2"
              >
                <PlayCircle className="w-4 h-4" />
                Iniciar tour en página
              </button>
            </div>

            <div className="relative rounded-xl border border-white/50 dark:border-white/10 bg-white/80 dark:bg-black/20 p-5 min-h-[230px]">
              <div className="absolute left-[8%] top-[18%] w-[62%] h-[22%] border-2 border-emerald-400/90 rounded-lg bg-emerald-100/30 dark:bg-emerald-500/10 pointer-events-none transition-all" />
              <div className="relative z-10">
                <p className="text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">
                  Slide {slideIndex + 1} de {currentGuide.steps.length}
                </p>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {selectedStep?.title}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedStep?.description}</p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setSlideIndex((prev) => Math.max(0, prev - 1))}
                disabled={slideIndex === 0}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50 inline-flex items-center gap-2 dark:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              <button
                onClick={() =>
                  setSlideIndex((prev) => Math.min(currentGuide.steps.length - 1, prev + 1))
                }
                disabled={slideIndex >= currentGuide.steps.length - 1}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50 inline-flex items-center gap-2 dark:text-white"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">Preguntas Frecuentes</h2>
        </div>
        <div className="p-6 space-y-6">
          {filteredFaqs.map((category, categoryIndex) => (
            <div key={category.category}>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-600" />
                {category.category}
              </h3>
              <div className="space-y-3">
                {category.questions.map((faq, qIndex) => {
                  const questionId = categoryIndex * 100 + qIndex;
                  const expanded = expandedQuestion === questionId;
                  return (
                    <div key={faq.q} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedQuestion(expanded ? null : questionId)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">{faq.q}</span>
                        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? "rotate-90" : ""}`} />
                      </button>
                      {expanded && (
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-gray-600 dark:text-gray-300 text-sm">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-xl p-8 border border-emerald-100 dark:border-slate-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-center">
          ¿No encontraste lo que buscabas?
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
          Nuestro equipo está listo para ayudarte
        </p>
        <div className="flex justify-center gap-4">
          <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-lg transition-colors font-medium flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Enviar Email
          </button>
          <button className="px-6 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Llamar Soporte
          </button>
        </div>
      </div>
    </div>
  );
}
