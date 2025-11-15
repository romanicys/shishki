'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Image as ImageType } from '@/types';

interface ImageGalleryProps {
  images: ImageType[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img, index) => (
          <div
            key={img.id}
            className="relative aspect-video cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setSelectedImage(index)}
          >
            <Image
              src={img.url.startsWith('http') ? img.url : `http://localhost:8000${img.url}`}
              alt={img.alt_text || `Image ${img.id}`}
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              unoptimized
            />
          </div>
        ))}
      </div>

      {selectedImage !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-full">
            <Image
              src={images[selectedImage].url.startsWith('http') ? images[selectedImage].url : `http://localhost:8000${images[selectedImage].url}`}
              alt={images[selectedImage].alt_text || `Image ${images[selectedImage].id}`}
              width={images[selectedImage].width || 1920}
              height={images[selectedImage].height || 1080}
              className="max-w-full max-h-[90vh] object-contain"
              unoptimized
            />
            <button
              className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-gray-300"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-2xl font-bold hover:text-gray-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage((selectedImage - 1 + images.length) % images.length);
                  }}
                >
                  ‹
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-2xl font-bold hover:text-gray-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage((selectedImage + 1) % images.length);
                  }}
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

