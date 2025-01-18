// components/TopNav.tsx
import { ReactNode } from "react";

export const TopNav = ({ children }: { children: ReactNode }) => {
	return (
		<nav className='w-full h-[120px] sm:h-[80px] text-white bg-slate-950 border-b flex flex-col sm:flex-row place-items-center px-4 sm:justify-between'>
			<h1 className='sm:pl-2 sm:pr-8 text-center sm:text-left text-xl font-light font-mono tracking-wider pt-2 sm:pt-0'>
				MTGProx
			</h1>
			<div className='flex justify-start place-items-center gap-x-4 flex-grow'>{children}</div>
		</nav>
	);
};
