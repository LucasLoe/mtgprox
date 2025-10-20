import { Deck } from "@/types";

export const updateCardQuantity = (
	deck: Deck,
	id: string,
	name: string,
	imageUrl: string | undefined,
	type_line: string,
	mana_cost: string,
	change: number
): Deck => {
	const entry = deck.entries[id];
	const newQuantity = (entry?.quantity || 0) + change;

	// If quantity is 0 or less --> remove it from the deck
	if (newQuantity <= 0) {
		const { [id]: removed, ...entries } = deck.entries;
		return {
			entries,
			total: deck.total - (removed?.quantity || 0),
		};
	}

	// Else --> update the quantity
	return {
		entries: {
			...deck.entries,
			[id]: {
				id,
				name,
				imageUrl,
				type_line,
				mana_cost,
				quantity: newQuantity,
			},
		},
		total: deck.total + change,
	};
};
