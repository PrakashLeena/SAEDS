import React from 'react';
import ImageCard from './ImageCard';

const GalleryGrid = ({ images, onDelete, onSelect }) => {
  if (!images || images.length === 0) {
    return (
      <div className="text-center py-20">
        <svg className="mx-auto h-24 w-24 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h3 className="text-xl font-semibold text-slate-600 mb-2">No images yet</h3>
        <p className="text-slate-500">Upload your first image to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {images.map((image, index) => (
        <ImageCard
          key={image.id}
          image={image}
          index={index}
          onDelete={onDelete}
          onClick={() => onSelect?.(image)}
        />
      ))}
    </div>
  );
};

export default GalleryGrid;

