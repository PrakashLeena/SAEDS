import React, { useState, useEffect } from 'react';

const OptimizedImage = ({
    src,
    alt,
    width,
    height,
    className = '',
    loading = 'lazy',
    fetchPriority = 'auto',
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (loading === 'eager') {
            setIsLoaded(true);
        }
    }, [loading]);

    return (
        <div
            className={`relative overflow-hidden ${className}`}
            style={{ aspectRatio: width && height ? `${width}/${height}` : 'auto' }}
        >
            <img
                src={src}
                alt={alt}
                width={width}
                height={height}
                loading={loading}
                fetchPriority={fetchPriority}
                onLoad={() => setIsLoaded(true)}
                className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                {...props}
            />
            {!isLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
        </div>
    );
};

export default OptimizedImage;
