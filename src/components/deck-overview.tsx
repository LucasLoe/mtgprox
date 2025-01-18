import { Deck, DeckEntry, HandleDeckChange, HandleDeckPrintingChange } from "@/types";
import { CardQuantity } from "./card-quantity";
import CardPrinting from "./card-printing";
import { ScrollArea } from "./ui/scroll-area";

const CardEntry = ({
	card,
	deck,
	handleCardDeckQuantityChange,
	handleDeckCardPrintingChange,
}: {
	card: DeckEntry;
	deck: Deck;
	handleCardDeckQuantityChange: HandleDeckChange;
	handleDeckCardPrintingChange: HandleDeckPrintingChange;
}) => {
	return (
		<div className='w-36 flex flex-col place-items-center justify-center gap-2'>
			<p className='w-full  border-b-slate-700 border-b-[1px] py-0.5 line-clamp-1 px-1 text-ellipsis overflow-hidden text-sm font-light text-white'>
				{card.name}
			</p>
			<CardPrinting
				deck={deck}
				card={card}
				handleCardDeckPrintingChange={handleDeckCardPrintingChange}
			/>
			<img src={card.imageUrl} className='w-full aspect-[5/7] object-cover'></img>

			<CardQuantity
				card={card}
				deck={deck}
				handleDeckCardQuantityChange={handleCardDeckQuantityChange}
			/>
		</div>
	);
};

const DeckOverview = ({
	deck,
	handleCardDeckQuantityChange,
	handleDeckCardPrintingChange,
}: {
	deck: Deck;
	handleCardDeckQuantityChange: HandleDeckChange;
	handleDeckCardPrintingChange: HandleDeckPrintingChange;
}) => {
	return (
		<ScrollArea className='w-full h-full'>
			<div className='w-full h-full  flex gap-x-8 gap-y-4 flex-wrap justify-evenly '>
				{Object.values(deck.entries).map((card, idcard) => (
					<CardEntry
						key={idcard}
						card={card}
						deck={deck}
						handleCardDeckQuantityChange={handleCardDeckQuantityChange}
						handleDeckCardPrintingChange={handleDeckCardPrintingChange}
					/>
				))}
			</div>
		</ScrollArea>
	);
};

export default DeckOverview;
