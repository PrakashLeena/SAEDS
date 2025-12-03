import React from 'react';
import { BookOpen, Download } from 'lucide-react';

const BrowseCard = ({ title, description, image, category, link }) => {
    return (
        <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                    src={image}
                    alt={`${title} - Free Download for ${category} Students Sri Lanka`}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    width="400"
                    height="300"
                />
                {/* Category Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary-700 shadow-sm">
                    {category}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {title}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
                    {description}
                </p>

                {/* Footer / Action */}
                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-sm">
                    <span className="flex items-center text-gray-500">
                        <BookOpen className="w-4 h-4 mr-1" />
                        PDF Resource
                    </span>
                    <a
                        href={link}
                        className="flex items-center font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                        aria-label={`Download ${title}`}
                    >
                        Download
                        <Download className="w-4 h-4 ml-1" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default BrowseCard;
