import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { Article } from '@/types';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={`/articles/${article.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        {article.cover_image_url && (
          <div className="relative aspect-video w-full bg-gray-200">
            <Image
              src={article.cover_image_url.startsWith('http') ? article.cover_image_url : `http://localhost:8000${article.cover_image_url}`}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />
          </div>
        )}
        <CardHeader>
          <h3 className="font-semibold text-xl mb-2 line-clamp-2">{article.title}</h3>
          {article.excerpt && (
            <p className="text-sm text-gray-600 line-clamp-3">{article.excerpt}</p>
          )}
        </CardHeader>
        <CardContent className="mt-auto pt-0">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{new Date(article.published_at).toLocaleDateString('ru-RU')}</span>
            <span>{article.views} просмотров</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

