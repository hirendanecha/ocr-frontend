"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const routes = [
  { name: "Car Registration Card", path: "/" },
  { name: "Driving Card", path: "/driving" },
  { name: "Emirates ID", path: "/emirates" },
  { name: "New Car Detect", path: "/new-car-detect", badge: true }, // Added new route with badge
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-md border ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-gray-800 hover:text-gray-600 transition-colors"
            >
              OCR Tool
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === route.path
                    ? "border-indigo-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } transition-colors duration-200 ease-in-out`}
              >
                {route.name}
                {route.badge && ( // Render badge if route has badge prop
                  <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                    claude 3.5 Sonnet
                  </span>
                )}
              </Link>
            ))}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isOpen ? "block" : "hidden"} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          {routes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${pathname === route.path
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                } transition-colors duration-200 ease-in-out`}
              onClick={() => setIsOpen(false)}
            >
              {route.name}
              {route.badge && ( // Render badge if route has badge prop
                <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                  New
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
