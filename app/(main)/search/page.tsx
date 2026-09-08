import { VerticalCard } from '@/components/ui/VerticalCard';

export default function SearchPage() {
  return (
    <>
      <VerticalCard
        className="w-60"
        product={{
          imageUrl: 'https://placehold.co/200x150.png',
          name: '야마자키 12년',
          originalName: '山崎 | Yamazaki 12yo',
          discountRate: -42,
          krPrice: 298000,
          jpPrice: 168500,
          jpPriceYen: 18500,
        }}
      />
    </>
  );
}
