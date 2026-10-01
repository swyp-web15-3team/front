import { HorizontalScroller } from '@/components/ui/HorizontalScroller';
import { VerticalCard } from '@/components/ui/VerticalCard';
import { whiskyToProduct } from '@/lib/utils';
import { WhiskyCard } from '@/types/whisky';

interface RelatedWhiskySectionProps {
  whiskies: WhiskyCard[];
}

export function RelatedWhiskySection({ whiskies }: RelatedWhiskySectionProps) {
  if (whiskies.length === 0) return null;

  return (
    <section>
      <h2 className="text-section-title">연관 추천 위스키</h2>
      <HorizontalScroller className="mt-4">
        {whiskies.map((whisky) => (
          // href가 있으면 VerticalCard가 Link(w-full)로 감싸지므로 폭은 바깥에서 잡는다
          <div key={whisky.id} className="w-40 shrink-0 snap-start sm:w-56">
            <VerticalCard
              product={whiskyToProduct(whisky)}
              href={`/detail/${whisky.id}`}
            />
          </div>
        ))}
      </HorizontalScroller>
    </section>
  );
}
