// components/CardDisplay.tsx
import { Card, Deck, HandleDeckChange, HandleDeckPrintingChange } from "@/types";
import { CardQuantity } from "./card-quantity";
import { ScrollArea } from "./ui/scroll-area";

type SelectedCardsProps = {
	cards: Card[];
	deck: Deck;
	handleDeckCardQuantityChange: HandleDeckChange;
	handleCardDeckPrintingChange: HandleDeckPrintingChange;
};

export const CardDisplay = ({ cards, deck, handleDeckCardQuantityChange }: SelectedCardsProps) => {
	if (!cards) return null;
	if (cards.length === 0) return null;

	return (
		<ScrollArea className='w-full h-full '>
			<div className='w-full h-full mx-auto grid gap-2 grid-cols-[repeat(auto-fit,minmax(250px,1fr))] justify-items-center'>
				{cards.map((card) => (
					<div>
						<div
							key={card.id}
							className='rounded-lg  overflow-hidden flex flex-col h-72 aspect-[2.5/3.5]'
						>
							{card.image_uris?.normal && (
								<img src={card.image_uris.normal} alt={card.name} className='w-full h-auto' />
							)}
						</div>
						<div className='w-full flex justify-between items-center'>
							<p className='text-center text-xs text-wrap w-28'>{card.name}</p>
							<CardQuantity
								card={card}
								deck={deck}
								handleDeckCardQuantityChange={handleDeckCardQuantityChange}
							/>
						</div>
					</div>
				))}
			</div>
		</ScrollArea>
	);
};
