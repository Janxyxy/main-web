const Meal = ({ meal, isOrdered }) => {
  return (
    <div className={`p-3 ${isOrdered ? "bg-green-50" : ""}`}>
      <div className="flex justify-between items-center">
        <div>
          <span className="inline-block bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded mr-2">
            {meal.type}
          </span>
          <span className={`font-medium ${isOrdered ? "text-green-700" : ""}`}>
            {meal.name}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-700">
            ${parseFloat(meal.price).toFixed(2)}
          </span>
          {isOrdered && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
              ✓
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
export default Meal;
