import { useState } from "react";
import { CardDisplay } from "./components/card-display";
import { CardSearchAutocomplete } from "./components/card-search";
import { Card, Deck, DeckEntry } from "./types";
import { updateCardQuantity } from "./lib/deck";
import { TopNav } from "./components/top-nav";
import { DeckImport } from "./components/card-txt-import";
import { DeckOverviewMenu } from "./components/deck-overview-menu";

function App() {
	const [searchResults, setSearchResults] = useState<Card[]>([]);
	const [deck, setDeck] = useState<Deck>({ entries: {}, total: 0 });

	const handleDeckCardQuantityChange = (card: Card | DeckEntry, change: number) => {
		let imageUrl = "";

		if ("image_uris" in card) {
			imageUrl = (card as Card)?.image_uris?.normal || card?.image_uris?.png || "";
		}
		if ("imageUrl" in card) {
			imageUrl = (card as DeckEntry).imageUrl || "";
		}

		setDeck((prev) => updateCardQuantity(prev, card.id, card.name, imageUrl, change));
	};

	const handleDeckCardPrintingChange = (id: string, printingUrl: string) => {
		setDeck((prev) => {
			const entry = prev.entries[id];
			if (!entry) return prev;
			return {
				...prev,
				entries: {
					...prev.entries,
					[id]: { ...entry, imageUrl: printingUrl },
				},
			};
		});
	};

	const handleSearch = async (searchTerm: string) => {
		try {
			const response = await fetch(
				`https://api.scryfall.com/cards/search?q=${encodeURIComponent(
					searchTerm
				)}&order=name&page=1&page_size=10`
			);
			const data = await response.json();
			setSearchResults(data.data);
		} catch (error) {
			console.error("Error fetching cards:", error);
		}
	};

	return (
		<div className='h-screen w-screen bg-gradient-to-b from-indigo-950 to-slate-950 '>
			<TopNav>
				<div className='w-full flex justify-center place-items-center gap-x-4'>
					<div className='max-w-96 flex-grow'>
						<CardSearchAutocomplete onCardSearch={handleSearch} />
					</div>
					<DeckImport setDeck={setDeck} />
				</div>
				<div className='ml-auto mr-0'>
					<DeckOverviewMenu
						deck={deck}
						handleDeckCardQuantityChange={handleDeckCardQuantityChange}
						handleDeckCardPrintingChange={handleDeckCardPrintingChange}
					/>
				</div>
			</TopNav>
			<div className='p-4 flex flex-col items-center gap-4 h-[calc(100%-80px)]'>
				<CardDisplay
					cards={searchResults}
					deck={deck}
					handleDeckCardQuantityChange={handleDeckCardQuantityChange}
					handleCardDeckPrintingChange={() => {}}
				/>
			</div>
		</div>
	);
}

export default App;
