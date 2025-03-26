const DayMealCard = ({ dayMeals }) => {
  const { date, soup, meals, orderedMeal } = dayMeals;

  // Format the date
  const formattedDate = formatDate(date);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="bg-blue-600 text-white p-3">
        <h2 className="text-xl font-semibold">{formattedDate}</h2>
      </div>

      {/* Soup Section */}
      {soup && (
        <div className="p-3 bg-yellow-50 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <span className="inline-block bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded mr-2">
                Soup
              </span>
              <span className="font-medium">{soup.name}</span>
            </div>
            <span className="text-gray-700">
              ${parseFloat(soup.price).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Meals Section */}
      <div className="divide-y divide-gray-200">
        {meals.map((meal) => (
          <Meal
            key={meal.id}
            meal={meal}
            isOrdered={orderedMeal && orderedMeal.id === meal.id}
          />
        ))}
      </div>

      {/* Order Status */}
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        {orderedMeal ? (
          <div className="flex justify-between items-center">
            <span className="text-green-600 font-medium">
              Ordered: {orderedMeal.name}
            </span>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
              Qty: {orderedMeal.quantity}
            </span>
          </div>
        ) : (
          <span className="text-gray-500">No meal ordered for this day</span>
        )}
      </div>
    </div>
  );
};

export default DayMealCard;
