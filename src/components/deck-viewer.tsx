// components/deck-viewer.tsx
import { Deck, HandleDeckChange, HandleDeckPrintingChange } from "@/types";
import DeckOverview from "./deck-overview";
import DeckPdfGenerator from "./deck-pdf-generator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, List } from "lucide-react";
import { useState } from "react";
import { DeckListView } from "./deck-list-view";

type DeckViewerProps = {
	deck: Deck;
	handleDeckCardQuantityChange: HandleDeckChange;
	handleDeckCardPrintingChange: HandleDeckPrintingChange;
};

export const DeckViewer = ({
	deck,
	handleDeckCardQuantityChange,
	handleDeckCardPrintingChange,
}: DeckViewerProps) => {
	const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

	return (
		<div className='flex flex-col h-full'>
			{/* Top Controls */}
			<div className='flex justify-end items-center p-2'>
				<ToggleGroup
					type='single'
					value={viewMode}
					onValueChange={(value) => value && setViewMode(value as "cards" | "list")}
				>
					<ToggleGroupItem value='cards' aria-label='Card view'>
						<LayoutGrid className='h-4 w-4' />
					</ToggleGroupItem>
					<ToggleGroupItem value='list' aria-label='List view'>
						<List className='h-4 w-4' />
					</ToggleGroupItem>
				</ToggleGroup>
			</div>

			{/* Main Content */}
			<div className='flex-1 overflow-hidden xl:px-16'>
				{viewMode === "cards" ? (
					<DeckOverview
						deck={deck}
						handleCardDeckQuantityChange={handleDeckCardQuantityChange}
						handleDeckCardPrintingChange={handleDeckCardPrintingChange}
					/>
				) : (
					<DeckListView
						deck={deck}
						handleDeckCardQuantityChange={handleDeckCardQuantityChange}
						handleDeckCardPrintingChange={handleDeckCardPrintingChange}
					/>
				)}
			</div>

			{/* Bottom Bar */}
			<div className='mt-4 flex items-center justify-between py-3 px-4 bg-background/50 backdrop-blur-sm border-t border-white/10 rounded-lg'>
				<div className='flex items-center gap-4'>
					<p className='text-sm font-light'>
						Total Cards: <span className='font-semibold text-lg'>{deck.total}</span>
					</p>
				</div>
				<DeckPdfGenerator deck={deck} />
			</div>
		</div>
	);
};
