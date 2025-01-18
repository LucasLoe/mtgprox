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
};

const PlusButton = ({ onClickFn, cns }: { onClickFn: (args: any) => void; cns?: string }) => {
	return (
		<Button
			className={cn("bg-slate-800 hover:bg-slate-700 text-white size-8", cns)}
			variant={"default"}
			size={"icon"}
			onClick={onClickFn}
		>
			<Plus className='size-4' />
		</Button>
	);
};

const MinusButton = ({ onClickFn, cns }: { onClickFn: (args: any) => void; cns?: string }) => {
	return (
		<Button
			className={cn("bg-slate-800 hover:bg-slate-700 text-white size-8", cns)}
			variant={"default"}
			size={"icon"}
			onClick={onClickFn}
		>
			<Minus className='size-4' />
		</Button>
	);
};

const Quantity = ({ quantity }: { quantity: number }) => {
	return (
		<span className='font-medium h-8 min-w-8 bg-slate-600 text-slate-300 flex place-items-center text-center justify-center  '>
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

export const CardQuantity = ({ card, deck, handleDeckCardQuantityChange }: CardItemProps) => {
	const quantity = deck?.entries[card.id]?.quantity || 0;

	if (quantity === 0) return <PlusButton onClickFn={() => handleDeckCardQuantityChange(card, 1)} />;

	return (
		<div className='flex place-items-center rounded'>
			<MinusButton cns='rounded-r-none' onClickFn={() => handleDeckCardQuantityChange(card, -1)} />
			<Quantity quantity={quantity} />
			<PlusButton cns='rounded-l-none' onClickFn={() => handleDeckCardQuantityChange(card, 1)} />
		</div>
	);
};
