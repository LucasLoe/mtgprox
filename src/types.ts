export type Card = {
	id: string;
	name: string;
	mana_cost: string;
	image_uris?: {
		small: string;
		normal: string;
		large: string;
		png: string;
		art_crop: string;
		border_crop: string;
	};
	type_line: string;
	oracle_text?: string;
	colors: string[];
	color_identity: string[];
	card_faces?: Array<{
		name: string;
		mana_cost: string;
		type_line: string;
		oracle_text: string;
		colors?: string[];
		power?: string;
		toughness?: string;
		image_uris?: {
			small: string;
			normal: string;
			large: string;
			png: string;
			art_crop: string;
			border_crop: string;
		};
	}>;
	rarity: string;
	power?: string;
	toughness?: string;
};

export type DeckEntry = {
	id: string;
	quantity: number;
	name: string; // For easier display without looking up
	mana_cost: string;
	type_line: string;
	imageUrl?: string; // Cache the image URL
};

export type Deck = {
	entries: Record<string, DeckEntry>; // Keyed by cardId for easy lookup
	total: number; // Total number of cards
};

export type HandleDeckChange = (card: Card | DeckEntry, change: number) => void;

export type HandleDeckPrintingChange = (id: string, printingUrl: string) => void;
