import { useState } from "react";
import { IconCheck } from "@tabler/icons-react";
import { IconX } from "@tabler/icons-react";
import { IconClock } from "@tabler/icons-react";

const DayMealCard = ({ dayMeals }) => {
  const { date, soup, meals, orderedMeal } = dayMeals;

  // Format the date (ISO format "YYYY-MM-DD" to readable format)
  const formatDate = (isoDate) => {
    if (!isoDate) return "Unknown Date";
    const dateObj = new Date(isoDate);

    const options = {
      weekday: "long",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    };
    return dateObj.toLocaleDateString("cs-CZ", options);
  };

  const sortedMeals = [...meals].sort((a, b) => {
    // Extract numeric part from type, assuming types like "1", "2", etc.
    const aNum = parseInt(a.type, 10) || 999; // Default to high number for non-numeric types
    const bNum = parseInt(b.type, 10) || 999;
    return aNum - bNum;
  });

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-800">
      {/* Date header with selected indicator if any meal is ordered */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {orderedMeal ? (
            <div className="bg-purple-700 rounded-md p-1.5">
              <IconCheck size={20} />
            </div>
          ) : (
            <div className=" rounded-md p-1.5">
              <IconX size={20} />
            </div>
          )}
          <h2 className="text-xl font-semibold">{formatDate(date)}</h2>
        </div>
      </div>

      {/* Soup Section */}
      {soup && (
        <div className="p-4 border-b border-gray-700 flex justify-between items-center group hover:bg-gray-800 transition-colors duration-200">
          <div className="flex-1">
            <div className="text-white">
              <span className="font-medium text-xs sm:text-sm md:text-base">
                Polévka -{" "}
              </span>
              <span className="font-medium text-xs sm:text-sm md:text-base">
                {soup.name}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Meals Section - USING sortedMeals INSTEAD OF meals */}
      <div className="divide-y divide-gray-700">
        {sortedMeals.map((meal) => {
          const isSelected = orderedMeal && orderedMeal.id === meal.id;
          return (
            <div
              key={meal.id}
              className={`p-4 flex justify-between items-center transition-colors duration-200 ${
                isSelected
                  ? "bg-purple-900 hover:bg-purple-800"
                  : "hover:bg-gray-800"
              }`}
            >
              <div className="flex items-center flex-1">
                <div className="text-white">
                  <div>
                    <div>
                      <span className="font-medium text-xs sm:text-sm md:text-base">
                        {meal.type != 5 ? `Oběd ${meal.type} - ` : "Salát - "}
                        <span className="font-medium text-xs sm:text-sm md:text-base">
                          {meal.name}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-white font-medium text-xs sm:text-sm md:text-base whitespace-nowrap mr-2">
                  {parseFloat(meal.price).toFixed(2).replace(".", ",")} Kč
                </span>
              </div>
              {isSelected ? (
                <div className="mr-2 bg-purple-700 rounded-md p-1.5 text-white">
                  <IconCheck size={20} />
                </div>
              ) : (
                <div className="mr-2 bg-gray-700 rounded-md p-4"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Order Status */}
      {orderedMeal && (
        <div className="p-4 bg-gray-800 border-t border-gray-700 ">
          <span className="text-purple-300 font-medium justify-start flex items-center gap-2">
            Lze objednat do: {formatOrderEndTime(orderedMeal.order_end_time)}
            <IconClock size={20} className="" />
          </span>
        </div>
      )}
    </div>
  );
};

function formatOrderEndTime(timestamp) {
  if (!timestamp) return "N/A";

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp; // Return original if invalid

  return date.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default DayMealCard;
