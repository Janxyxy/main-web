const Meal = ({ meal, isOrdered }) => {
  return (
    <div
      className={`p-4 transition-colors duration-200 ${
        isOrdered ? "bg-green-50 hover:bg-green-100" : "hover:bg-gray-50"
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <span className="inline-block bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded mr-2">
              {meal.type}
            </span>
            <span
              className={`font-medium ${
                isOrdered ? "text-green-700" : "text-gray-800"
              }`}
            >
              {meal.name}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3 ml-4">
          <span className="text-gray-700 font-medium whitespace-nowrap">
            {parseFloat(meal.price).toFixed(2)}Kč
          </span>
          {/* {isOrdered && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default Meal;
