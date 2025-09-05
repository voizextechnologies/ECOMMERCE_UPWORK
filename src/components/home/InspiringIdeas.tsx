import React from 'react';

const ideas = [
  {
    id: 'garden-makeover',
    title: 'Garden Makeover Ideas',
    description: 'Transform your outdoor space with these inspiring garden design ideas',
    image: 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg',
    category: 'Garden & Outdoor'
  },
  {
    id: 'storage-solutions',
    title: 'Smart Storage Solutions',
    description: 'Maximize your space with clever storage ideas for every room',
    image: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg',
    category: 'Storage & Organization'
  },
  {
    id: 'outdoor-living',
    title: 'Outdoor Living Spaces',
    description: 'Create the perfect outdoor entertaining area for family and friends',
    image: 'https://images.pexels.com/photos/1105325/pexels-photo-1105325.jpeg',
    category: 'Outdoor Living'
  },
  {
    id: 'diy-projects',
    title: 'Weekend DIY Projects',
    description: 'Easy DIY projects you can complete in a weekend',
    image: 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg',
    category: 'DIY & Projects'
  }
];

export function InspiringIdeas() {
  return (
    <section className="py-12 bg-brown-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-1 h-8 bg-brown-900 mr-4"></div>
            <h2 className="text-2xl md:text-3xl font-bold text-brown-900">
              Inspiring ideas to update your space
            </h2>
          </div>
          <button className="flex items-center px-4 py-2 border border-brown-300 rounded-lg hover:bg-brown-200 transition-colors">
            <span className="text-brown-900 font-medium">All D.I.Y. Advice categories</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={idea.image}
                  alt={idea.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-brown-500 text-brown-900 text-xs font-medium px-2 py-1 rounded">
                    {idea.category}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-brown-900 mb-2 group-hover:text-brown-700 transition-colors">
                  {idea.title}
                </h3>
                
                <p className="text-sm text-brown-700 leading-relaxed">
                  {idea.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}