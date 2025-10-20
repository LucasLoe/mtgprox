// components/deck-list-view.tsx
import { Deck, HandleDeckChange, HandleDeckPrintingChange } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardQuantity } from "./card-quantity";
import { DeckEntry } from "@/types";
import { CardPrintingDialog } from "./card-printing-dialog";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type DeckListViewProps = {
	deck: Deck;
	handleDeckCardQuantityChange: HandleDeckChange;
	handleDeckCardPrintingChange: HandleDeckPrintingChange;
};

type CardTypeGroup = {
	type: string;
	cards: Array<DeckEntry>;
};

// Separate component for each card type group
const CardTypeGroupComponent = ({
	group,
	deck,
	handleDeckCardQuantityChange,
	onCardClick,
	index,
}: {
	group: CardTypeGroup;
	deck: Deck;
	handleDeckCardQuantityChange: HandleDeckChange;
	onCardClick: (card: DeckEntry) => void;
	index: number;
}) => {
	return (
		<motion.div
			className='break-inside-avoid'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration: 0.3,
				delay: index * 0.05,
				ease: "easeOut",
			}}
		>
			<h3 className='text-lg font-semibold mb-6 flex items-center gap-2'>
				<span>{group.type}</span>
				<span className='text-sm text-muted-foreground'>({group.cards.length})</span>
			</h3>
			<div className='mb-3'>
				{group.cards.map((card, cardIndex) => (
					<motion.div
						key={card.id}
						className='flex items-center justify-between px-2 hover:bg-white/5 rounded-md transition-colors'
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{
							duration: 0.2,
							delay: index * 0.05 + cardIndex * 0.02,
							ease: "easeOut",
						}}
					>
						<button
							onClick={() => onCardClick(card)}
							className='flex items-center gap-1 flex-1 min-w-0 text-left text-sm px-0'
						>
							<span className='text-sm text-muted-foreground w-8 flex-shrink-0'>
								{card.quantity}
							</span>
							<span className='text-sm truncate hover:text-primary transition-colors'>
								{card.name}
							</span>
							{card.mana_cost && (
								<span className='text-xs text-muted-foreground font-mono flex-shrink-0'>
									{card.mana_cost}
								</span>
							)}
						</button>
						<div className='flex-shrink-0'>
							<CardQuantity
								card={card}
								deck={deck}
								handleDeckCardQuantityChange={handleDeckCardQuantityChange}
								invisibleButtons={true}
							/>
						</div>
					</motion.div>
				))}
			</div>
		</motion.div>
	);
};

export const DeckListView = ({
	deck,
	handleDeckCardQuantityChange,
	handleDeckCardPrintingChange,
}: DeckListViewProps) => {
	const [numColumns, setNumColumns] = useState(3);
	const [selectedCard, setSelectedCard] = useState<DeckEntry | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);

	useEffect(() => {
		const calculateColumns = () => {
			const width = window.innerWidth;
			const safetyMargin = 100;
			const effectiveWidth = width - safetyMargin;
			const minColumnWidth = 350;

			const cols = Math.max(1, Math.floor(effectiveWidth / minColumnWidth));
			setNumColumns(Math.min(cols, 4));
		};

		calculateColumns();
		window.addEventListener("resize", calculateColumns);
		return () => window.removeEventListener("resize", calculateColumns);
	}, []);

	const getCardType = (typeLine: string | undefined): string => {
		if (!typeLine) return "Other";

		const lowerType = typeLine.toLowerCase();

		if (lowerType.includes("planeswalker")) return "Planeswalkers";
		if (lowerType.includes("creature")) return "Creatures";
		if (lowerType.includes("sorcery")) return "Sorceries";
		if (lowerType.includes("instant")) return "Instants";
		if (lowerType.includes("enchantment")) return "Enchantments";
		if (lowerType.includes("artifact")) return "Artifacts";
		if (lowerType.includes("land")) return "Lands";

		return "Other";
	};

	const groupCardsByType = (): CardTypeGroup[] => {
		const groups: { [key: string]: CardTypeGroup } = {
			Planeswalkers: { type: "Planeswalkers", cards: [] },
			Creatures: { type: "Creatures", cards: [] },
			Sorceries: { type: "Sorceries", cards: [] },
			Instants: { type: "Instants", cards: [] },
			Enchantments: { type: "Enchantments", cards: [] },
			Artifacts: { type: "Artifacts", cards: [] },
			Lands: { type: "Lands", cards: [] },
			Other: { type: "Other", cards: [] },
		};

		Object.entries(deck.entries).forEach(([_, entry]) => {
			const cardType = getCardType(entry.type_line);
			groups[cardType].cards.push(entry);
		});

		const typeOrder = [
			"Planeswalkers",
			"Creatures",
			"Sorceries",
			"Instants",
			"Enchantments",
			"Artifacts",
			"Lands",
			"Other",
		];

		return typeOrder.map((type) => groups[type]).filter((group) => group.cards.length > 0);
	};

	// Distribute groups into columns to balance heights
	const distributeIntoColumns = (groups: CardTypeGroup[], cols: number) => {
		const columns: CardTypeGroup[][] = Array.from({ length: cols }, () => []);
		const columnHeights: number[] = Array(cols).fill(0);

		// Sort groups by size (largest first) for better distribution
		const sortedGroups = [...groups].sort((a, b) => b.cards.length - a.cards.length);

		// Greedy algorithm: assign each group to the column with least height
		sortedGroups.forEach((group) => {
			const minHeightIndex = columnHeights.indexOf(Math.min(...columnHeights));
			columns[minHeightIndex].push(group);
			// Estimate height: header (1) + cards + spacing
			columnHeights[minHeightIndex] += 1 + group.cards.length;
		});

		return columns;
	};

	const handleCardClick = (card: DeckEntry) => {
		setSelectedCard(card);
		setDialogOpen(true);
	};

	const cardGroups = groupCardsByType();
	const columns = distributeIntoColumns(cardGroups, numColumns);

	// Flatten groups with their original index for staggered animation
	const flattenedGroups = columns.flatMap((col) => col);

	return (
		<>
			<ScrollArea className='h-full'>
				<div className='flex gap-6 text-white pr-4'>
					{columns.map((columnGroups, colIndex) => (
						<div key={colIndex} className='flex-1 space-y-6 min-w-[300px]'>
							{columnGroups.map((group) => {
								const groupIndex = flattenedGroups.indexOf(group);
								return (
									<CardTypeGroupComponent
										key={group.type}
										group={group}
										deck={deck}
										handleDeckCardQuantityChange={handleDeckCardQuantityChange}
										onCardClick={handleCardClick}
										index={groupIndex}
									/>
								);
							})}
						</div>
					))}
				</div>
			</ScrollArea>

			{selectedCard && (
				<CardPrintingDialog
					card={selectedCard}
					open={dialogOpen}
					onOpenChange={setDialogOpen}
					onSelectPrinting={handleDeckCardPrintingChange}
				/>
			)}
		</>
	);
};
