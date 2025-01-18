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
import { Card, Deck } from "@/types";
import { Import } from "lucide-react";

const fetchCards = async (cards: { quantity: number; name: string; set?: string }[]) => {
	const results: { card: Card; quantity: number }[] = [];
	const errors: string[] = [];

	console.log("query cards", cards);

	for (const { name, quantity, set } of cards) {
		try {
			await new Promise((resolve) => setTimeout(resolve, 100)); // scryfall api has a rate limit

			// Modify URL to include set if available
			const url = set
				? `https://api.scryfall.com/cards/named?exact=${name}&set=${set.toLowerCase()}&format=json`
				: `https://api.scryfall.com/cards/named?exact=${name}&format=json`;

			const response = await fetch(url);

			if (!response.ok) {
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

const parseDeckList = (text: string) => {
	return text
		.split("\n")
		.filter((line) => line.trim())
		.map((line) => {
			const match = line.match(/^(?:(\d+)\s+)?([^<\[]+)(?:.*?\[([^\]]+)\])?/);
			if (!match) return null;

			return {
				quantity: match[1] ? parseInt(match[1], 10) : 1,
				name: match[2].trim(),
				set: match[3] ? match[3].trim() : undefined,
			};
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
				<Button variant='outline' className='flex place-items-center gap-x-2 h-12'>
					<Import />
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
	const [importCards, setImportCards] = useState<
		{ quantity: number; name: string; set?: string }[]
	>([]);

	const {
		refetch: importDeck,
		data,
		isFetching,
	} = useQuery({
		queryKey: ["importDeck"],
		queryFn: () => fetchCards(importCards),
		enabled: false,
	});

	const handleImport = async () => {
		console.log(parseDeckList(text));
		setImportCards(parseDeckList(text));
		const { data } = await importDeck();

		if (data && data.results.length > 0) {
			const newDeck = transformCardsToDeck(data.results);
			setDeck(newDeck);

			if (data.errors.length === 0) {
				onClose();
				setText("");
			}
		}
	};

	return (
		<DialogContent className='sm:max-w-[625px]'>
			<DialogHeader>
				<DialogTitle>Import Deck List (MTGA notation)</DialogTitle>
			</DialogHeader>
			<div className='space-y-4'>
				<Textarea
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder='Paste your deck list here...'
					className='min-h-[300px] font-mono'
				/>
				{data?.errors.length ? (
					<div className='text-destructive'>
						<p>Cards not found:</p>
						<ul className='list-disc pl-4'>
							{data.errors.map((card) => (
								<li key={card}>{card}</li>
							))}
						</ul>
					</div>
				) : null}
				<Button onClick={handleImport} disabled={!text.trim() || isFetching} className='mx-auto'>
					{isFetching ? "Importing..." : "Import"}
				</Button>
			</div>
		</DialogContent>
	);
};
