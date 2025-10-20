import { Card, Deck, DeckEntry, HandleDeckChange } from "@/types";
import { Button } from "./ui/button";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type CountBtnProps = { className?: string };

type CardItemProps = {
	card: Card | DeckEntry;
	deck: Deck;
	handleDeckCardQuantityChange: HandleDeckChange;
	invisibleButtons?: boolean;
};

const PlusButton = ({
	onClickFn,
	cns,
	invisibleButtons,
}: {
	onClickFn: (args: any) => void;
	cns?: string;
	invisibleButtons?: boolean;
}) => {
	return (
		<Button
			className={cn(
				invisibleButtons ? "" : "bg-slate-800 hover:bg-slate-700 text-white size-8",
				cns
			)}
			variant={invisibleButtons ? "link" : "default"}
			size={"icon"}
			onClick={onClickFn}
		>
			<Plus className='size-4' />
		</Button>
	);
};

const MinusButton = ({
	onClickFn,
	cns,
	invisibleButtons,
}: {
	onClickFn: (args: any) => void;
	cns?: string;
	invisibleButtons?: boolean;
}) => {
	return (
		<Button
			className={cn(
				invisibleButtons ? "" : "bg-slate-800 hover:bg-slate-700 text-white size-8",
				cns
			)}
			variant={invisibleButtons ? "link" : "default"}
			size={"icon"}
			onClick={onClickFn}
		>
			<Minus className='size-4' />
		</Button>
	);
};

const Quantity = ({
	quantity,
	invisibleButtons,
}: {
	quantity: number;
	invisibleButtons?: boolean;
}) => {
	return (
		<span
			className={cn(
				"font-medium h-8 min-w-8  flex place-items-center text-center justify-center",
				invisibleButtons ? " bg-slate-700 rounded-full" : "bg-slate-600 text-slate-300"
			)}
		>
			{quantity}
		</span>
	);
};

export default function CountBtn({ className }: CountBtnProps) {
	const [count, setCount] = useState(0);

	return (
		<Button onClick={() => setCount((count) => count + 1)} className={className}>
			Count is: {count}
		</Button>
	);
}

export const CardQuantity = ({
	card,
	deck,
	handleDeckCardQuantityChange,
	invisibleButtons,
}: CardItemProps) => {
	const quantity = deck?.entries[card.id]?.quantity || 0;

	if (quantity === 0) return <PlusButton onClickFn={() => handleDeckCardQuantityChange(card, 1)} />;

	return (
		<div className='flex place-items-center rounded'>
			<MinusButton
				cns='rounded-r-none'
				onClickFn={() => handleDeckCardQuantityChange(card, -1)}
				invisibleButtons={invisibleButtons}
			/>
			<Quantity quantity={quantity} invisibleButtons={invisibleButtons} />
			<PlusButton
				cns='rounded-l-none'
				onClickFn={() => handleDeckCardQuantityChange(card, 1)}
				invisibleButtons={invisibleButtons}
			/>
		</div>
	);
};
