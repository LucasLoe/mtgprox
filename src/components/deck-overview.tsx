import { Deck, DeckEntry, HandleDeckChange, HandleDeckPrintingChange } from "@/types";
import { CardQuantity } from "./card-quantity";
import CardPrinting from "./card-printing";
import { ScrollArea } from "./ui/scroll-area";
import { motion } from "framer-motion";

const CardEntry = ({
	card,
	deck,
	handleCardDeckQuantityChange,
	handleDeckCardPrintingChange,
	index,
}: {
	card: DeckEntry;
	deck: Deck;
	handleCardDeckQuantityChange: HandleDeckChange;
	handleDeckCardPrintingChange: HandleDeckPrintingChange;
	index: number;
}) => {
	return (
		<motion.div
			className='w-36 flex flex-col place-items-center justify-center gap-2'
			initial={{ opacity: 0, scale: 0.8, y: 20 }}
			animate={{ opacity: 1, scale: 1, y: 0 }}
			transition={{
				duration: 0.3,
				delay: index * 0.02,
				ease: "easeOut",
			}}
		>
			<p className='w-full  border-b-slate-700 border-b-[1px] py-0.5 line-clamp-1 px-1 text-ellipsis overflow-hidden text-sm font-light text-white'>
				{card.name}
			</p>
			<CardPrinting
				deck={deck}
				card={card}
				handleCardDeckPrintingChange={handleDeckCardPrintingChange}
			/>
			<motion.img
				src={card.imageUrl}
				className='w-full aspect-[5/7] object-cover rounded-lg'
				whileHover={{ scale: 1.05 }}
				transition={{ duration: 0.2 }}
			/>

			<CardQuantity
				card={card}
				deck={deck}
				handleDeckCardQuantityChange={handleCardDeckQuantityChange}
			/>
		</motion.div>
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
				{Object.values(deck.entries).map((card, index) => (
					<CardEntry
						key={card.id}
						card={card}
						deck={deck}
						handleCardDeckQuantityChange={handleCardDeckQuantityChange}
						handleDeckCardPrintingChange={handleDeckCardPrintingChange}
						index={index}
					/>
				))}
			</div>
		</ScrollArea>
	);
};

export default DeckOverview;
