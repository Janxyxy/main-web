import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  IconToolsKitchen2,
  IconArrowNarrowRight,
  IconCircleCheck,
  IconCircleX,
  IconSoup,
  IconClipboardCheck,
  IconAlertTriangle,
  IconRefresh,
} from "@tabler/icons-react";

const MealsBanner = () => {
  const [todayMeals, setTodayMeals] = useState([]);
  const [hasOrderedToday, setHasOrderedToday] = useState(false);
  const [orderedMeal, setOrderedMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Load from env
  const viteAPI = import.meta.env.VITE_API_URL;

  // Format today's date in Czech format
  const formattedDate = new Date().toLocaleDateString("cs-CZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Capitalize first letter of the date
  const capitalizedDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const fetchMealsData = async () => {
    if (isRetrying) setIsRetrying(false);
    setLoading(true);

    try {
      const response = await fetch(`${viteAPI}/api/obedy`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.success && Array.isArray(data.data)) {
        // Get today's date in YYYY-MM-DD format for comparison
        const today = new Date().toISOString().split("T")[0];

        // Filter meals for today
        const mealsForToday = data.data.filter((meal) => meal.date === today);

        // Set today's meals
        setTodayMeals(mealsForToday);

        // Find ordered meal if any
        const ordered = mealsForToday.find((meal) => meal.is_ordered);
        if (ordered) {
          setHasOrderedToday(true);
          setOrderedMeal(ordered);
        } else {
          setHasOrderedToday(false);
          setOrderedMeal(null);
        }
      } else {
        console.error("Unexpected data structure:", data);
        setError("Received unexpected data format from server");
      }
    } catch (err) {
      console.error("Error fetching meals:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMealsData();
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    setError(null);
    fetchMealsData();
  };

  // Count number of main meals (exclude soup which typically has type "P")
  const mainMealCount = todayMeals.filter((meal) => meal.type !== "P").length;

  // Get soup if available
  const todaySoup = todayMeals.find((meal) => meal.type === "P");

  return (
    <div className="w-full bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 rounded-lg shadow-xl overflow-hidden my-6 relative">
      {/* Background pattern - food icons */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-5 right-10"></div>
        <div className="absolute bottom-2 left-20"></div>
      </div>

      <div className="flex flex-col md:flex-row items-center p-6 relative z-10">
        {/* Banner image/icon with animation */}
        <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-8 transform transition-all duration-300 hover:scale-105">
          <div className="bg-white/15 p-5 rounded-full shadow-lg backdrop-blur-sm border border-white/10">
            <IconToolsKitchen2 size={48} className="text-white" stroke={1.5} />
          </div>
        </div>

        {/* Banner content */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-baseline md:justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                Obědy
              </h2>
              <p
                className="text-purple-200 text-sm md:text-base mb-3"
                aria-label="Datum"
              >
                {capitalizedDate}
              </p>
            </div>

            {/* Order status badge with improved visibility */}
            {!loading && !error && (
              <div
                className={`
                px-4 py-2 rounded-full mb-3 md:mb-0 self-center
                transition-all duration-300 shadow-md
                ${
                  hasOrderedToday
                    ? "bg-green-900/70 border border-green-500/70 hover:bg-green-900/90 hover:border-green-500"
                    : "bg-red-900/70 border border-red-500/70 hover:bg-red-900/90 hover:border-red-500"
                }
              `}
              >
                <p
                  className={`
                  text-sm font-medium flex items-center
                  ${hasOrderedToday ? "text-green-300" : "text-red-300"}
                `}
                >
                  {hasOrderedToday ? (
                    <>
                      Dnes objednáno
                      <IconCircleCheck size={18} className="ml-2" />
                    </>
                  ) : (
                    <>
                      Dnes neobjednáno
                      <IconCircleX size={18} className="ml-2" />
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Info section with improved error handling */}
          <div className="mb-4 mt-3">
            {loading ? (
              <div className="space-y-2">
                <div className="h-5 bg-white/10 rounded animate-pulse w-3/4 max-w-md"></div>
                <div className="h-5 bg-white/10 rounded animate-pulse w-2/3 max-w-sm"></div>
                <span className="sr-only">Načítání dat...</span>
              </div>
            ) : error ? (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 flex items-start">
                <IconAlertTriangle
                  size={20}
                  className="text-red-400 mr-2 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-red-300 text-sm font-medium">
                    Chyba načítání dat
                  </p>
                  <p className="text-red-400/70 text-xs mt-1">{error}</p>
                  <button
                    onClick={handleRetry}
                    className="mt-2 px-3 py-1 bg-red-800/50 hover:bg-red-700/70 text-red-200 text-xs rounded flex items-center transition-colors"
                    disabled={isRetrying}
                  >
                    <IconRefresh
                      size={14}
                      className={`mr-1 ${isRetrying ? "animate-spin" : ""}`}
                    />
                    {isRetrying ? "Obnovuji..." : "Zkusit znovu"}
                  </button>
                </div>
              </div>
            ) : hasOrderedToday && orderedMeal ? (
              <div className="bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/10">
                <div className="flex flex-wrap items-start text-white mb-2">
                  <IconSoup
                    size={18}
                    className="mr-2 mt-0.5 text-purple-300 flex-shrink-0"
                  />
                  <div>
                    <span className="font-medium mr-1 text-purple-200">
                      Polévky:
                    </span>
                    <span className="text-gray-300">
                      {todaySoup?.name
                        ? todaySoup.name.replace(/,/g, " a")
                        : "Nejsou k dispozici"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-start text-white">
                  <IconClipboardCheck
                    size={18}
                    className="mr-2 mt-0.5 text-green-300 flex-shrink-0"
                  />
                  <div>
                    <span className="font-medium mr-1 text-green-200">
                      Objednáno:
                    </span>
                    <span className="text-gray-300">{orderedMeal.name}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-300 font-medium flex items-center">
                  <IconAlertTriangle size={18} className="mr-2" />
                  Dneska bez obědu :()
                </p>
              </div>
            )}
          </div>

          {/* Stats and action button section */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-2">
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm transition-all hover:bg-white/15 border border-white/5 hover:border-white/20">
              <p className="text-purple-200 text-sm">Dnes</p>
              {loading ? (
                <div className="h-7 bg-white/10 rounded animate-pulse mt-1"></div>
              ) : error ? (
                <p className="text-red-300 font-bold text-sm">Chyba načítání</p>
              ) : (
                <p className="text-white font-bold text-xl">
                  {mainMealCount}{" "}
                  {mainMealCount === 1
                    ? "jídlo"
                    : mainMealCount >= 2 && mainMealCount <= 4
                    ? "jídla"
                    : "jídel"}
                </p>
              )}
            </div>

            <Link
              to="/obedy"
              className="group flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:translate-y-[-2px] border border-purple-500/50"
              aria-label="Zobrazit všechny obědy"
            >
              <span>Všechny obědy</span>
              <IconArrowNarrowRight
                size={20}
                className="ml-2 transform group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealsBanner;
