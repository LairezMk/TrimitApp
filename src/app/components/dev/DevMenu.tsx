import { Menu } from "lucide-react";
import { useNavigate } from "react-router";

interface Page {
  name: string;
  path: string;
}

interface DevMenuProps {
  showDevMenu: boolean;
  setShowDevMenu: (show: boolean) => void;
  pages: Page[];
}

export function DevMenu({ showDevMenu, setShowDevMenu, pages }: DevMenuProps) {
  const navigate = useNavigate();

  return (
    <>
      <button
        onClick={() => setShowDevMenu(!showDevMenu)}
        className="fixed bottom-6 right-6 z-50 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-2xl transition-all hover:scale-110"
        title="Menú de Desarrollo"
      >
        <Menu className="w-6 h-6" />
      </button>

      {showDevMenu && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDevMenu(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold dark:text-white">🚀 Menú de Desarrollo - Todas las Páginas</h2>
              <button
                onClick={() => setShowDevMenu(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {pages.map((page) => (
                <button
                  key={page.path}
                  onClick={() => {
                    navigate(page.path);
                    setShowDevMenu(false);
                  }}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-lg px-4 py-3 text-sm font-medium transition-all hover:scale-105 shadow-lg"
                >
                  {page.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
