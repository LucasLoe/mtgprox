"use client";

import { useState } from "react";
import { Card, Deck, DeckEntry } from "@/types";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

export const useCardPrintings = (cardName: string | undefined, enabled: boolean) => {
	return useQuery({
		queryKey: ["printings", cardName],
		queryFn: async () => {
			if (!cardName) return [];
			const response = await fetch(
				`https://api.scryfall.com/cards/named?exact=${cardName}&format=json&prints=true`
			);
			const data = await response.json();
			return data.prints_search_uri
				? fetch(data.prints_search_uri)
						.then((res) => res.json())
						.then((data) => data.data || [])
				: [];
		},
		enabled: Boolean(cardName) && enabled,
	});
};

type HandleDeckPrintingChange = (id: string, printingUrl: string) => void;

type CardPrintingOption = {
	id: string;
	name: string;
	set: string;
	set_name: string;
	image_uris?: {
		small?: string;
		normal?: string;
	};
	card_faces?: Array<{
		image_uris?: {
			small?: string;
			normal?: string;
		};
	}>;
};

const CardPrinting = ({
	deck,
	card,
	handleCardDeckPrintingChange,
}: {
	deck: Deck;
	card: Card | DeckEntry;
	handleCardDeckPrintingChange: HandleDeckPrintingChange;
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const { data: printings, isFetching: loading } = useCardPrintings(card.name, isOpen);

	const entry = deck.entries[card.id];
	if (!entry) return null;

	return (
		<div className='flex items-center gap-4 w-full'>
			<div className='flex-1 w-full'>
				<Select
					onValueChange={(value) => {
						handleCardDeckPrintingChange(entry.id, value);
						setIsOpen(false);
					}}
					onOpenChange={setIsOpen}
					defaultValue={entry.imageUrl}
				>
					<SelectTrigger className='w-full text-sm'>
						<SelectValue placeholder='Select printing' />
						{loading && (
							<span className='ml-2'>
								<svg
									className='animate-spin h-4 w-4'
									xmlns='http://www.w3.org/2000/svg'
									fill='none'
									viewBox='0 0 24 24'
								>
									<circle
										className='opacity-25'
										cx='12'
										cy='12'
										r='10'
										stroke='currentColor'
										strokeWidth='4'
									/>
									<path
										className='opacity-75'
										fill='currentColor'
										d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
									/>
								</svg>
							</span>
						)}
					</SelectTrigger>
					<SelectContent>
						{printings?.map((printing: CardPrintingOption) => {
							const normalImage = printing.image_uris?.normal || printing.card_faces?.[0].image_uris?.normal;
							const smallImage = printing.image_uris?.small || printing.card_faces?.[0].image_uris?.small;

							if (!normalImage) return null;

							return (
								<SelectItem key={printing.id} value={normalImage} className='flex items-center gap-2 pr-2'>
									<div className='flex items-center gap-2 flex-nowrap min-w-0'>
										{smallImage && (
											<img
												src={smallImage}
												alt={printing.name}
												className='w-8 h-8 object-cover rounded shrink-0'
											/>
										)}
										<span className='truncate text-xs'>
											{printing.set_name} ({printing.set})
										</span>
									</div>
								</SelectItem>
							);
						})}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
};

export default CardPrinting;
