"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, Deck } from "@/types";
import { Import } from "lucide-react";

const fetchCards = async (cards: { quantity: number; name: string; set?: string }[]) => {
	const results: { card: Card; quantity: number }[] = [];
	const errors: string[] = [];

	for (const { name, quantity, set } of cards) {
		try {
			await new Promise((resolve) => setTimeout(resolve, 100)); // scryfall api has a rate limit

			const url = set
				? `https://api.scryfall.com/cards/named?exact=${name}&set=${set.toLowerCase()}&format=json`
				: `https://api.scryfall.com/cards/named?exact=${name}&format=json`;

			const response = await fetch(url);

			if (!response.ok) {
				// Fallback 1: Try without set code
				if (set) {
					const fallbackResponse = await fetch(
						`https://api.scryfall.com/cards/named?exact=${name}&format=json`
					);
					if (fallbackResponse.ok) {
						const card: Card = await fallbackResponse.json();
						results.push({ card, quantity });
						continue;
					}
				}

				// Fallback 2: Try fuzzy search (for Omenpath cards with different printed names)
				const fuzzyResponse = await fetch(
					`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(name)}&format=json`
				);
				if (fuzzyResponse.ok) {
					const card: Card = await fuzzyResponse.json();
					results.push({ card, quantity });
					continue;
				}

				errors.push(name);
				continue;
			}

			const card: Card = await response.json();
			results.push({ card, quantity });
		} catch {
			errors.push(name);
		}
	}

	return { results, errors };
};

// Header lines to discard (case-insensitive)
const HEADER_PATTERN = /^(deck|sideboard|commander|companion|maindeck|\/\/.*)$/i;

// Unified card pattern handles all three formats:
// - MTGA: "4 Lightning Bolt [LEB]"
// - Simple: "4 Lightning Bolt"
// - Moxfield: "1 Black Lotus (LEB) 232"
const CARD_PATTERN = /^(?:(\d+)\s+)?([^\[\(\n]+?)(?:\s*(?:\[([^\]]+)\]|\(([^)]+)\)))?(?:\s+\d+)?$/;

const parseDeckList = (text: string) => {
	return text
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line && !HEADER_PATTERN.test(line))
		.map((line) => {
			// Handle "SB:" prefix (sideboard indicator used by some exporters)
			const cleanLine = line.replace(/^SB:\s*/i, "");

			const match = cleanLine.match(CARD_PATTERN);
			if (!match) return null;

			const quantity = match[1] ? parseInt(match[1], 10) : 1;
			const name = match[2].trim();
			// Set can be in group 3 (brackets) or group 4 (parentheses)
			const set = match[3]?.trim() || match[4]?.trim();

			return { quantity, name, set };
		})
		.filter(
			(card): card is { quantity: number; name: string; set: string | undefined } => card !== null
		);
};

const transformCardsToDeck = (results: { card: Card; quantity: number }[]): Deck => {
	return results.reduce(
		(deck, { card, quantity }) => {
			deck.entries[card.id] = {
				id: card.id,
				quantity,
				name: card.name,
				imageUrl: card.image_uris?.normal || card.card_faces?.[0].image_uris?.normal,
				type_line: card.type_line,
				mana_cost: card.mana_cost,
			};
			deck.total += quantity;
			return deck;
		},
		{ entries: {}, total: 0 } as Deck
	);
};

export const DeckImport = ({ setDeck }: { setDeck: (deck: Deck) => void }) => {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant='outline' className='flex place-items-center gap-x-2 '>
					<Import className='size-4' />
					<p className='hidden md:block'>TXT</p>
				</Button>
			</DialogTrigger>
			{open && <DeckImportContent setDeck={setDeck} onClose={() => setOpen(false)} />}
		</Dialog>
	);
};

interface DeckImportContentProps {
	setDeck: (deck: Deck) => void;
	onClose: () => void;
}

const DeckImportContent = ({ setDeck, onClose }: DeckImportContentProps) => {
	const [text, setText] = useState("");
	const [finished, setFinished] = useState(false);

	const {
		refetch: importDeck,
		data,
		isFetching,
	} = useQuery({
		queryKey: ["importDeck"],
		queryFn: () => fetchCards(parseDeckList(text)),
		enabled: false,
	});

	const handleImport = async () => {
		const { data } = await importDeck();

		if (data && data.results.length > 0) {
			const newDeck = transformCardsToDeck(data.results);
			setDeck(newDeck);
			setFinished(true);

			if (data.errors.length === 0) {
				onClose();
				setText("");
			}
		}
	};

	return (
		<DialogContent className='sm:max-w-[625px]'>
			<DialogHeader>
				<DialogTitle>Import Deck List</DialogTitle>
			</DialogHeader>
			<div className='space-y-4'>
				<Textarea
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder='Paste your deck list here...'
					className='min-h-[300px] font-mono'
				/>
				{data && (
					<div className='space-y-2'>
						<Alert variant='default' className='bg-lime-300'>
							<AlertTitle className='text-md text-lime-950 font-medium'>{`Success! ${data.results.length} cards imported successfully`}</AlertTitle>
						</Alert>
						{data.errors.length ? (
							<Alert variant='default' className='bg-indigo-950'>
								<AlertTitle className='text-md text-indigo-300 font-medium'>
									{`Import Errors [${data.errors.length}]`}
								</AlertTitle>
								<AlertDescription>
									<p className='font-light'>The following cards could not be found:</p>
									<p className='list-disc ml-4 mt-2 font-light'>{data.errors.join(" - ")}</p>
								</AlertDescription>
							</Alert>
						) : null}
					</div>
				)}
				<div className='flex place-items-center justify-start gap-x-4'>
					<Button onClick={handleImport} disabled={!text.trim() || isFetching}>
						{isFetching ? "Importing..." : "Import"}
					</Button>
					{finished && (
						<Button onClick={onClose} variant='outline' className='border-white'>
							Close
						</Button>
					)}
				</div>
			</div>
		</DialogContent>
	);
};
