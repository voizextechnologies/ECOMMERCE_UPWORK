import React from 'react';
import { Leaf, ChevronRight } from 'lucide-react';

const featuredCategories = [
  {
    id: 'garden-supplies',
    title: 'Garden Supplies & Maintenance',
    description: 'Everything you need to keep your garden looking its best',
    image: 'https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg',
    icon: Leaf,
    link: '/category/garden-supplies'
  },
  {
    id: 'landscaping',
    title: 'Landscaping Supplies',
    description: 'Transform your outdoor space with professional landscaping materials',
    image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg',
    icon: Leaf,
    link: '/category/landscaping'
  },
  {
    id: 'plants',
    title: 'Plants',
    description: 'Beautiful plants and flowers to brighten up any space',
    image: 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg',
    icon: Leaf,
    link: '/category/plants'
  },
  {
    id: 'bbqs',
    title: 'BBQs',
    description: 'Premium BBQs and outdoor cooking equipment',
    image: 'https://images.pexels.com/photos/1105325/pexels-photo-1105325.jpeg',
    icon: Leaf,
    link: '/category/bbqs'
  }
];

export function FeaturedCategoriesWeek() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-1 h-8 bg-brown-900 mr-4"></div>
            <h2 className="text-2xl md:text-3xl font-bold text-brown-900">
              Featured categories this week
            </h2>
          </div>
          <button className="flex items-center px-4 py-2 border border-brown-300 rounded-lg hover:bg-brown-100 transition-colors">
            <span className="text-brown-900 font-medium">View all categories</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-5 h-5 text-brown-900" />
                    <ChevronRight className="w-4 h-4 text-brown-500 group-hover:text-brown-900 transition-colors" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-brown-900 mb-2 group-hover:text-brown-700 transition-colors">
                    {category.title}
                  </h3>
                  
                  <p className="text-sm text-brown-700 leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}