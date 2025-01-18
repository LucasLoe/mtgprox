import { cn } from "@/lib/utils";

type ManaSymbolProps = {
	symbol: string;
	className?: string;
};

export const ManaSymbol = ({ symbol }: ManaSymbolProps) => (
	<span className='font-medium'>{symbol}</span>
);

type ManaCostProps = {
	manaCost: string;
	className?: string;
};

export const ManaCost = ({ manaCost, className }: ManaCostProps) => {
	return (
		<span className={cn("font-medium font-mono tracking-wide text-xs", className)}>
			{manaCost}
		</span>
	);
};
