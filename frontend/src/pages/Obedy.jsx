import { useState, useEffect } from "react";
import DayMealCard from "../components/DayMealCard";
import { DatesProvider, DatePicker } from "@mantine/dates";
import { Box, Text } from "@mantine/core";

function Obedy() {
  const [meals, setMeals] = useState([]);
  const [groupedMeals, setGroupedMeals] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  //load from env
  const viteAPI = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await fetch(`${viteAPI}/api/obedy`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.success && Array.isArray(data.data)) {
          setMeals(data.data);
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

    fetchMeals();
  }, []);

  useEffect(() => {
    if (meals.length > 0) {
      // Get today's date at midnight for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Group meals by date
      const mealsByDate = {};

      meals.forEach((meal) => {
        const date = meal.date;
        const mealDate = new Date(date);

        // Skip dates before today
        if (mealDate < today) {
          return;
        }

        if (!mealsByDate[date]) {
          mealsByDate[date] = {
            date,
            soup: null,
            meals: [],
            orderedMeal: null,
          };
        }

        if (meal.type === "P") {
          mealsByDate[date].soup = meal;
        } else {
          mealsByDate[date].meals.push(meal);

          // Check if this is the ordered meal
          if (meal.is_ordered) {
            mealsByDate[date].orderedMeal = meal;
          }
        }
      });

      // Convert to array and sort by date ascending
      const sortedGroups = Object.values(mealsByDate).sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      setGroupedMeals(sortedGroups);
    }
  }, [meals]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full">
        <h1 className="font-medium text-xl sm:text-2xl md:text-3xl mb-6 text-white">
          Obědy
        </h1>

        {loading && (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}
        {error && (
          <div className="bg-red-900 border-l-4 border-red-500 p-4 rounded-md mb-6 text-white">
            <p>Error: {error}</p>
          </div>
        )}
        {!loading && !error && groupedMeals.length === 0 && (
          <div className="bg-gray-800 border-l-4 border-purple-500 p-4 rounded-md text-white">
            <p>
              No meals found for today or upcoming days. Please check back
              later.
            </p>
          </div>
        )}
        {!loading && !error && groupedMeals.length > 0 && (
          <div className="space-y-6">
            {groupedMeals.map((dayMeals) => (
              <DayMealCard key={dayMeals.date} dayMeals={dayMeals} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Obedy;
