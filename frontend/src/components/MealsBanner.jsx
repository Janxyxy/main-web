import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { IconToolsKitchen2 } from "@tabler/icons-react";
import { IconArrowNarrowRight } from "@tabler/icons-react";
import { IconCircleCheck } from "@tabler/icons-react";
import { IconCircleX } from "@tabler/icons-react";

const MealsBanner = () => {
  const [todayMeals, setTodayMeals] = useState([]);
  const [hasOrderedToday, setHasOrderedToday] = useState(false);
  const [orderedMeal, setOrderedMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //load from env
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

  useEffect(() => {
    const fetchMealsData = async () => {
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

    fetchMealsData();
  }, []);

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
        {/* Banner image/icon */}
        <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-8">
          <div className="bg-white/10 p-5 rounded-full shadow-lg">
            <p className="text-white text-4xl">
              <IconToolsKitchen2 size={40} />
            </p>
          </div>
        </div>

        {/* Banner content */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-baseline md:justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                Obědy
              </h2>
              <p className="text-purple-200 text-sm md:text-base mb-3">
                {capitalizedDate}
              </p>
            </div>

            {/* Order status badge - show both "ordered" and "not ordered" states */}
            {!loading &&
              !error &&
              (hasOrderedToday ? (
                <div className="bg-green-900/50 px-3 py-1 rounded-full border border-green-500 mb-3 md:mb-0 self-center">
                  <p className="text-green-400 text-sm font-medium flex items-center">
                    Dnes objednáno
                    <IconCircleCheck size={20} className="ml-1" />
                  </p>
                </div>
              ) : (
                <div className="bg-red-900/50 px-3 py-1 rounded-full border border-red-500 mb-3 md:mb-0 self-center">
                  <p className="text-red-400 text-sm font-medium flex items-center">
                    Dnes neobjednáno
                    <IconCircleX size={20} className="ml-1" />
                  </p>
                </div>
              ))}
          </div>

          {/* Info */}
          <div className="mb-4">
            {loading ? (
              <div className="h-6 bg-white/10 rounded animate-pulse w-3/4">
                <span className="sr-only">Načítání dat...</span>
              </div>
            ) : error ? (
              <p className="text-red-300 text-sm">Chyba načítání dat</p>
            ) : hasOrderedToday && orderedMeal ? (
              <div>
                <div className="flex flex-wrap items-center text-white">
                  <span className="font-medium mr-2">Polévky:</span>
                  <span className="text-gray-300">
                    {todaySoup.name
                      ? todaySoup.name.replace(/,/g, " a")
                      : "Nejsou"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center text-white">
                  <span className="font-medium mr-2">Objednáno:</span>
                  <span className="text-gray-300">{orderedMeal.name}</span>
                </div>
              </div>
            ) : (
              <div className="text-red-500 font-medium"></div>
            )}
          </div>

          {/* Stats section */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-2">
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm transition-all hover:bg-white/15">
              <p className="text-purple-200 text-sm">Dnes</p>
              {loading ? (
                <div className="h-7 bg-white/10 rounded animate-pulse mt-1"></div>
              ) : error ? (
                <p className="text-red-300 font-bold text-sm">Chyba načítání</p>
              ) : (
                <p className="text-white font-bold text-xl">
                  {mainMealCount} jídel
                </p>
              )}
            </div>

            <Link
              to="/obedy"
              className="group flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:translate-y-[-1px]"
            >
              <span>Všechny obědy</span>
              <IconArrowNarrowRight
                size={20}
                className="ml-2 transform group-hover:translate-x-1 transition-transform"
              ></IconArrowNarrowRight>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealsBanner;
