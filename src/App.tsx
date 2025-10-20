// App.tsx
import { useState } from "react";
import { Deck, DeckEntry, Card } from "./types";
import { updateCardQuantity } from "./lib/deck";
import { TopNav } from "./components/top-nav";
import { DeckImport } from "./components/card-txt-import";
import { CardSearchDialog } from "./components/card-search-dialog";
import { DeckViewer } from "./components/deck-viewer";

function App() {
	const [deck, setDeck] = useState<Deck>({ entries: {}, total: 0 });

	const handleDeckCardQuantityChange = (card: Card | DeckEntry, change: number) => {
		console.log(card);
		let imageUrl = "";

		if ("image_uris" in card) {
			imageUrl = (card as Card)?.image_uris?.normal || card?.image_uris?.png || "";
		}
		if ("imageUrl" in card) {
			imageUrl = (card as DeckEntry).imageUrl || "";
		}

		setDeck((prev) =>
			updateCardQuantity(prev, card.id, card.name, imageUrl, card.type_line, card.mana_cost, change)
		);
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

	return (
		<div className='h-screen w-screen bg-gradient-to-b from-indigo-950 to-slate-950'>
			<TopNav>
				<div className='w-full flex justify-center place-items-center gap-x-4'>
					<CardSearchDialog
						deck={deck}
						handleDeckCardQuantityChange={handleDeckCardQuantityChange}
						handleCardDeckPrintingChange={handleDeckCardPrintingChange}
					/>
					<DeckImport setDeck={setDeck} />
				</div>
				<div className='ml-auto mr-0'>
					<div className='relative'>
						<div className='p-2 rounded-full bg-primary/10'>
							<svg
								className='size-6'
								viewBox='0 0 15 15'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									d='M2 3.5C2 3.22386 2.22386 3 2.5 3H12.5C12.7761 3 13 3.22386 13 3.5V9.5C13 9.77614 12.7761 10 12.5 10H2.5C2.22386 10 2 9.77614 2 9.5V3.5ZM2 10.9146C1.4174 10.7087 1 10.1531 1 9.5V3.5C1 2.67157 1.67157 2 2.5 2H12.5C13.3284 2 14 2.67157 14 3.5V9.5C14 10.1531 13.5826 10.7087 13 10.9146V11.5C13 12.3284 12.3284 13 11.5 13H3.5C2.67157 13 2 12.3284 2 11.5V10.9146ZM12 11V11.5C12 11.7761 11.7761 12 11.5 12H3.5C3.22386 12 3 11.7761 3 11.5V11H12Z'
									fill='currentColor'
									fillRule='evenodd'
									clipRule='evenodd'
								></path>
							</svg>
						</div>
						<p
							key={deck.total}
							className='flex absolute -bottom-1 -right-1 size-6 justify-center place-items-center text-xs p-0.5 rounded-full bg-indigo-500 animate-pop'
						>
							{deck.total}
						</p>
					</div>
				</div>
			</TopNav>
			<div className='h-[calc(100%-80px)]'>
				<DeckViewer
					deck={deck}
					handleDeckCardQuantityChange={handleDeckCardQuantityChange}
					handleDeckCardPrintingChange={handleDeckCardPrintingChange}
				/>
			</div>
		</div>
	);
}

export default App;
