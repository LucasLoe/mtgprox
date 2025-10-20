// components/card-search-dialog-fancy.tsx
import { useState } from "react";
import { CardSearchAutocomplete } from "./card-search";
import { CardDisplay } from "./card-display";
import { Card, Deck, HandleDeckChange, HandleDeckPrintingChange } from "@/types";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

type CardSearchDialogProps = {
	deck: Deck;
	handleDeckCardQuantityChange: HandleDeckChange;
	handleCardDeckPrintingChange: HandleDeckPrintingChange;
};

export const CardSearchDialog = ({
	deck,
	handleDeckCardQuantityChange,
	handleCardDeckPrintingChange,
}: CardSearchDialogProps) => {
	const [searchResults, setSearchResults] = useState<Card[]>([]);
	const [open, setOpen] = useState(false);

	const handleSearch = async (searchTerm: string) => {
		try {
			const response = await fetch(
				`https://api.scryfall.com/cards/search?q=${encodeURIComponent(
					searchTerm
				)}&order=name&page=1&page_size=10`
			);
			const data = await response.json();
			setSearchResults(data.data || []);
		} catch (error) {
			console.error("Error fetching cards:", error);
			setSearchResults([]);
		}
	};

	return (
		<>
			{/* Compact Button State */}
			<AnimatePresence>
				{!open && (
					<Button variant='secondary' asChild>
						<motion.button layoutId='search-container' onClick={() => setOpen(true)}>
							<motion.div layoutId='search-icon'>
								<Search className='size-4' />
							</motion.div>
							<motion.span layoutId='search-text'>Search Cards</motion.span>
						</motion.button>
					</Button>
				)}
			</AnimatePresence>

			{/* Expanded Dialog State */}
			<AnimatePresence>
				{open && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className='fixed inset-0 z-50 bg-black/80'
							onClick={() => setOpen(false)}
						/>

						{/* Dialog Container */}
						<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
							<motion.div
								layoutId='search-container'
								className='relative w-full max-w-5xl h-[80vh] bg-background rounded-lg shadow-lg flex flex-col overflow-hidden'
								style={{ originX: 0.5, originY: 0.5 }}
							>
								{/* Header */}
								<div className='flex items-center justify-between p-6 border-b'>
									<motion.div
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.2 }}
										className='flex items-center gap-3'
									>
										<motion.div layoutId='search-icon'>
											<Search className='h-5 w-5' />
										</motion.div>
										<motion.h2 layoutId='search-text' className='text-lg font-semibold'>
											Search Cards
										</motion.h2>
									</motion.div>
									<motion.button
										initial={{ opacity: 0, rotate: -90 }}
										animate={{ opacity: 1, rotate: 0 }}
										transition={{ delay: 0.2 }}
										onClick={() => setOpen(false)}
										className='rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none'
									>
										<X className='h-4 w-4' />
									</motion.button>
								</div>

								{/* Search Input */}
								<motion.div
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.25, duration: 0.3 }}
									className='px-6 pt-4'
								>
									<CardSearchAutocomplete onCardSearch={handleSearch} />
								</motion.div>

								{/* Results */}
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.3, duration: 0.3 }}
									className='flex-1 overflow-hidden p-6  '
								>
									<CardDisplay
										cards={searchResults}
										deck={deck}
										handleDeckCardQuantityChange={handleDeckCardQuantityChange}
										handleCardDeckPrintingChange={handleCardDeckPrintingChange}
									/>
								</motion.div>
							</motion.div>
						</div>
					</>
				)}
			</AnimatePresence>
		</>
	);
};
