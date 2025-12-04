import React from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';

const WorkshopCard = ({
    title = "Community Workshop",
    description,
    date,
    location = "Mannar, Sri Lanka",
    image = "/logo.png"
}) => {
    return (
        <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100">
            {/* Image Section */}
            <div className="md:w-2/5 relative h-48 md:h-auto overflow-hidden">
                <img
                    src={image}
                    alt="SAEDS educational workshop for students in Sri Lanka"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width="600"
                    height="400"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden" />
            </div>

            {/* Content Section */}
            <div className="p-6 md:w-3/5 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-primary-600 text-sm font-semibold mb-2">
                    <Users className="w-4 h-4" />
                    <span>Educational Workshop</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {title}
                </h3>

                <p className="text-gray-600 mb-4 leading-relaxed">
                    {description}
                </p>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-auto">
                    <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                        {date}
                    </div>
                    <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
                        {location}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkshopCard;
