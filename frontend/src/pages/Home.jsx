import { useState } from "react";
import MealsBanner from "../components/MealsBanner";

function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full">
        {/* Meals Banner */}
        <MealsBanner />
      </main>
    </div>
  );
}

export default Home;
