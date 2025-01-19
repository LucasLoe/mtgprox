import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { Deck } from "@/types";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const CARD_WIDTH_MM = 63;
const CARD_HEIGHT_MM = 88;
const SPACING_MM = 0.5;
const PADDING_MM = 9;

const CARDS_PER_ROW = Math.floor(
	(A4_WIDTH_MM - 2 * PADDING_MM + SPACING_MM) / (CARD_WIDTH_MM + SPACING_MM)
);
const CARDS_PER_COLUMN = Math.floor(
	(A4_HEIGHT_MM - 2 * PADDING_MM + SPACING_MM) / (CARD_HEIGHT_MM + SPACING_MM)
);
const CARDS_PER_PAGE = CARDS_PER_ROW * CARDS_PER_COLUMN;

const DeckPdfGenerator = ({ deck }: { deck: Deck }) => {
	const [isGenerating, setIsGenerating] = useState(false);
	const [progress, setProgress] = useState({ current: 0, total: 0 });

	const cards = Object.values(deck.entries).flatMap((entry) =>
		Array(entry.quantity).fill({ ...entry })
	);

	const pages = Array.from({ length: Math.ceil(cards.length / CARDS_PER_PAGE) }, (_, i) =>
		cards.slice(i * CARDS_PER_PAGE, (i + 1) * CARDS_PER_PAGE)
	);

	const generatePDF = async () => {
		setIsGenerating(true);
		const pdf = new jsPDF({
			orientation: "portrait",
			unit: "mm",
			format: "a4",
		});

		const totalCards = pages.reduce((sum, page) => sum + page.length, 0);
		setProgress({ current: 0, total: totalCards });
		let processedCards = 0;

		try {
			for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
				if (pageIndex > 0) {
					pdf.addPage();
				}

				const pageCards = pages[pageIndex];

				for (let cardIndex = 0; cardIndex < pageCards.length; cardIndex++) {
					const card = pageCards[cardIndex];
					const row = Math.floor(cardIndex / CARDS_PER_ROW);
					const col = cardIndex % CARDS_PER_ROW;

					const x = PADDING_MM + col * (CARD_WIDTH_MM + SPACING_MM);
					const y = PADDING_MM + row * (CARD_HEIGHT_MM + SPACING_MM);

					try {
						const response = await fetch(card.imageUrl);
						const blob = await response.blob();
						const base64 = await new Promise((resolve) => {
							const reader = new FileReader();
							reader.onloadend = () => resolve(reader.result);
							reader.readAsDataURL(blob);
						});

						pdf.addImage(
							base64 as string,
							"JPEG",
							x,
							y,
							CARD_WIDTH_MM,
							CARD_HEIGHT_MM,
							`card-${cardIndex}`,
							"FAST"
						);

						processedCards++;
						setProgress({ current: processedCards, total: totalCards });
					} catch (error) {
						console.error(`Failed to load image for card ${card.id}:`, error);
					}
				}
			}

			pdf.save("deck-printout.pdf");
		} catch (error) {
			console.error("Failed to generate PDF:", error);
		} finally {
			setIsGenerating(false);
			setProgress({ current: 0, total: 0 });
		}
	};

	return (
		<Button
			onClick={generatePDF}
			disabled={isGenerating}
			variant='outline'
			className='flex gap-2 place-items-center justify-center'
		>
			{isGenerating ? (
				<>
					<Loader2 className='h-4 w-4 animate-spin' />
					<div className='flex place-items-center'>
						<p className='w-[4ch]'>{progress.current}</p>
						<p className='w-[1ch]'>/</p>
						<p className='w-[4ch]'>{progress.total}</p>
					</div>
				</>
			) : (
				<>
					<Printer className='h-4 w-4' />
					Print Proxies
				</>
			)}
		</Button>
	);
};

export default DeckPdfGenerator;
