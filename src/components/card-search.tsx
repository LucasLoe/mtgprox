"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import useDebounce from "@/hooks/use-debounce";
import { useState } from "react";
import { FileSearch2 } from "lucide-react";
import { Separator } from "./ui/separator";

interface CardSearchAutocompleteProps {
	onCardSearch: (searchTerm: string) => void;
}
export const CardSearchAutocomplete = ({ onCardSearch }: CardSearchAutocompleteProps) => {
	const [search, setSearch] = useState("");
	const [showList, setShowList] = useState(false);
	const debouncedSearch = useDebounce(search, 200);

	const { data, isFetching } = useQuery({
		queryKey: ["cardSearch", debouncedSearch],
		queryFn: async () => {
			if (debouncedSearch.length < 2) return { data: [] };
			const response = await fetch(
				`https://api.scryfall.com/cards/autocomplete?q=${debouncedSearch}`
			);
			return response.json();
		},
		enabled: debouncedSearch.length >= 2,
		initialData: { data: [] },
	});

	const handleSearch = (term: string) => {
		onCardSearch(term);
		setShowList(false);
	};

	return (
		<div className='relative'>
			<Command
				shouldFilter={false}
				className='rounded-lg border shadow-md outline-white outline-1 outline'
			>
				<CommandInput
					placeholder='Search for cards...'
					value={search}
					onValueChange={(value) => {
						setSearch(value);
						setShowList(true);
					}}
				/>
				{showList && (
					<div className='absolute top-full left-0 right-0 z-50 mt-1 bg-popover rounded-lg border shadow-md'>
						<CommandList>
							{search && (
								<CommandGroup>
									{debouncedSearch.length < 2 ? (
										<CommandItem disabled>Type at least 2 characters to search</CommandItem>
									) : isFetching ? (
										<CommandItem disabled className='flex items-center gap-2'>
											<svg
												className='animate-spin h-4 w-4'
												xmlns='http://www.w3.org/2000/svg'
												fill='none'
												viewBox='0 0 24 24'
											>
												<circle
													className='opacity-25'
													cx='12'
													cy='12'
													r='10'
													stroke='currentColor'
													strokeWidth='4'
												/>
												<path
													className='opacity-75'
													fill='currentColor'
													d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
												/>
											</svg>
											Searching Scryfall...
										</CommandItem>
									) : data?.data?.length === 0 ? (
										<CommandEmpty>No cards were found.</CommandEmpty>
									) : (
										<>
											{search && (
												<CommandItem onSelect={() => handleSearch(search)}>
													<FileSearch2 className='mr-2 h-4 w-4' />
													Search for "{search}"
												</CommandItem>
											)}
											<Separator className='my-2' />
											{data?.data?.map((card: string) => (
												<CommandItem key={card} onSelect={() => handleSearch(card)}>
													{card}
												</CommandItem>
											))}
										</>
									)}
								</CommandGroup>
							)}
						</CommandList>
					</div>
				)}
			</Command>
		</div>
	);
};
