function Navbar() {
  return (
    <nav className="w-full bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">honza.space</div>
        <ul className="flex space-x-6">
          <li>
            <a href="/" className="hover:text-gray-300">
              Home
            </a>
          </li>
          <li>
            <a href="/obedy" className="hover:text-gray-300">
              Obědy
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
