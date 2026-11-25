"use client";

import Image from "next/image";

import { useCart } from "@/components/providers/cart-provider";
import { formatPrice } from "@/lib/format";
import type { MenuItem } from "@/db/schema";



import { useState } from 'react';



type MenuCardProps = {
  item: MenuItem;
};

export function MenuCard({ item }: MenuCardProps) {
  const { addItem } = useCart();

  const [image, setImage] = useState(item.imageUrl);

  return (
    <article className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-52 w-full">
        <Image
          // src={item.imageUrl}
          src={image}
          onError={() => {
            console.log(`Failed to load image: ${item.imageUrl}, using fallback image instead.`);
            setImage("/localImages/calamari.jpg");
          }}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-stone-900">{item.name}</h3>
          <p className="text-base font-semibold text-red-700">
            {formatPrice(item.priceCents)}
          </p>
        </div>
        <p className="text-sm leading-6 text-stone-600">{item.description}</p>
        <button
          type="button"
          onClick={() =>
            addItem({
              menuItemId: item.id,
              name: item.name,
              description: item.description,
              priceCents: item.priceCents,
              imageUrl: item.imageUrl,
            })
          }
          className="w-full rounded-full bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700"
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}
