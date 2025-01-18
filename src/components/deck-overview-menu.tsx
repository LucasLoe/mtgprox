import { Deck, HandleDeckChange, HandleDeckPrintingChange } from "../types";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Trash2, X } from "lucide-react";
import DeckOverview from "./deck-overview";
import DeckPdfGenerator from "./deck-pdf-generator";

export const DeckOverviewMenu = ({
	deck,
	handleDeckCardQuantityChange,
	handleDeckCardPrintingChange,
}: {
	deck: Deck;
	handleDeckCardQuantityChange: HandleDeckChange;
	handleDeckCardPrintingChange: HandleDeckPrintingChange;
}) => {
	return (
		<Drawer direction='bottom'>
			<DrawerTrigger asChild>
				<div className='relative'>
					<button className='p-2 hover:bg-gray-100 hover:text-slate-950 rounded-full'>
						<svg
							className='size-6'
							viewBox='0 0 15 15'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M2 3.5C2 3.22386 2.22386 3 2.5 3H12.5C12.7761 3 13 3.22386 13 3.5V9.5C13 9.77614 12.7761 10 12.5 10H2.5C2.22386 10 2 9.77614 2 9.5V3.5ZM2 10.9146C1.4174 10.7087 1 10.1531 1 9.5V3.5C1 2.67157 1.67157 2 2.5 2H12.5C13.3284 2 14 2.67157 14 3.5V9.5C14 10.1531 13.5826 10.7087 13 10.9146V11.5C13 12.3284 12.3284 13 11.5 13H3.5C2.67157 13 2 12.3284 2 11.5V10.9146ZM12 11V11.5C12 11.7761 11.7761 12 11.5 12H3.5C3.22386 12 3 11.7761 3 11.5V11H12Z'
								fill='currentColor'
								fill-rule='evenodd'
								clip-rule='evenodd'
							></path>
						</svg>
					</button>
					<p
						key={deck.total}
						className='flex absolute -bottom-1 -right-1 size-6 justify-center place-items-center text-xs p-0.5 rounded-full bg-indigo-500 animate-pop'
					>
						{deck.total}
					</p>
				</div>
			</DrawerTrigger>
			<DrawerContent className='h-3/4 px-4 pb-4'>
				<div className='flex justify-end place-items-center gap-x-2 mb-8 mt-4 sm:mt-1'>
					<div className='ml-0 mr-auto'>
						<h2 className='  sm:text-lg font-light sm:border-b-[1px] border-white pr-8 w-fit'>{`Cards ( ${deck.total} )`}</h2>
					</div>
					<DeckPdfGenerator deck={deck} />
					<DrawerClose
						className='p-2 hover:bg-gray-100 hover:text-slate-950 rounded-full cursor-pointer'
						asChild
					>
						<X className='size-9 ' />
					</DrawerClose>
				</div>

				<DeckOverview
					deck={deck}
					handleCardDeckQuantityChange={handleDeckCardQuantityChange}
					handleDeckCardPrintingChange={handleDeckCardPrintingChange}
				/>
			</DrawerContent>
		</Drawer>
	);
};
