import { useState, useEffect } from "react";
import MealCard from "../components/DayMealCard";

function Obedy() {
  const [meals, setMeals] = useState([]);
  const [groupedMeals, setGroupedMeals] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeals = async () => {
      console.log("Starting to fetch meals...");
      try {
        const response = await fetch("http://localhost:3000/api/obedy");
        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Received data:", data);
        if (data && data.success && Array.isArray(data.data)) {
          setMeals(data.data);
        } else {
          console.error("Unexpected data structure:", data);
          setError("Received unexpected data format from server");
        }
      } catch (err) {
        console.error("Error details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  useEffect(() => {
    if (meals.length > 0) {
      // Group meals by date
      const mealsByDate = {};

      meals.forEach((meal) => {
        const date = meal.date;

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
          if (meal.isOrdered) {
            mealsByDate[date].orderedMeal = meal;
          }
        }
      });

      // Convert to array and sort by date ascending
      const sortedGroups = Object.values(mealsByDate).sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      setGroupedMeals(sortedGroups);
      console.log("Grouped meals:", sortedGroups);
    }
  }, [meals]);

  return (
    <div className="flex flex-col">
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">Meals</h1>

        {loading && <p>Loading meals...</p>}

        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && meals.length === 0 && <p>No meals found.</p>}

        {!loading && !error && groupedMeals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedMeals.map((dateGroup, index) => (
              <MealCard key={dateGroup.date || index} dateGroup={dateGroup} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Obedy;
