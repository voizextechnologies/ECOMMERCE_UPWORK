import React from 'react';
import {
  Bath,
  Archive,
  Lightbulb,
  Sofa,
  Layers,
  Paintbrush,
  Wrench,
  Hammer,
  ChevronRight
} from 'lucide-react';

const categories = [
  {
    id: 'bathroom-plumbing',
    name: 'Bathroom & Plumbing',
    icon: Bath,
    link: '/category/bathroom-plumbing'
  },
  {
    id: 'storage-cleaning',
    name: 'Storage & Cleaning',
    icon: Archive,
    link: '/category/storage-cleaning'
  },
  {
    id: 'lighting-electrical',
    name: 'Lighting & Electrical',
    icon: Lightbulb,
    link: '/category/lighting-electrical'
  },
  {
    id: 'indoor-living',
    name: 'Indoor Living',
    icon: Sofa,
    link: '/category/indoor-living'
  },
  {
    id: 'flooring',
    name: 'Flooring',
    icon: Layers,
    link: '/category/flooring'
  },
  {
    id: 'paint-wallpaper',
    name: 'Paint & Wallpaper',
    icon: Paintbrush,
    link: '/category/paint-wallpaper'
  },
  {
    id: 'tools',
    name: 'Tools',
    icon: Wrench,
    link: '/category/tools'
  },
  {
    id: 'building-hardware',
    name: 'Building & Hardware',
    icon: Hammer,
    link: '/category/building-hardware'
  }
];

export function ShopByCategory() {
  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center">
            <div className="w-1 h-8 bg-brown-900 mr-4"></div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-brown-900">
              Shop by category
            </h2>
          </div>
          <button className="hidden md:flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-sm lg:text-base font-medium">View all categories</span>
          </button>
        </div>

        {/* Mobile: 4-column grid */}
        <div className="grid grid-cols-4 gap-3 md:hidden">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <a
                key={category.id}
                href={category.link}
                className="flex flex-col items-center cursor-pointer"
              >
                <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-2 hover:shadow-lg transition-shadow">
                  <Icon className="w-6 h-6 text-brown-900" />
                </div>
                <p className="text-xs font-medium text-center text-brown-900">
                  {category.name}
                </p>
              </a>
            );
          })}
        </div>

        {/* Desktop: flex with equal distribution */}
        <div className="hidden md:flex md:justify-between md:items-start">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <a
                key={category.id}
                href={category.link}
                className="flex flex-col items-center cursor-pointer"
              >
                <div className="w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center mb-3 hover:shadow-lg transition-shadow">
                  <Icon className="w-8 h-8 text-brown-900" />
                </div>
                <p className="text-sm font-medium text-center text-brown-900">
                  {category.name}
                </p>
              </a>
            );
          })}
        </div>

        {/* Mobile View All Button */}
        <div className="md:hidden mt-6 text-center">
          <button className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-sm font-medium">View all categories</span>
          </button>
        </div>
      </div>
    </section>
  );
}
