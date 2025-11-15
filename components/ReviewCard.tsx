import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { Review } from '@/types';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Link href={`/reviews/${review.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        <CardHeader>
          <h3 className="font-semibold text-xl mb-2 line-clamp-2">{review.title}</h3>
          {review.rating && (
            <div className="flex items-center gap-1 mb-2">
              <span className="text-yellow-500">★</span>
              <span className="text-sm font-medium">{review.rating.toFixed(1)}</span>
            </div>
          )}
          <p className="text-sm text-gray-600 line-clamp-3">
            {review.content.substring(0, 200)}...
          </p>
        </CardHeader>
        <CardContent className="mt-auto pt-0">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{new Date(review.published_at).toLocaleDateString('ru-RU')}</span>
            <span>{review.views} просмотров</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
