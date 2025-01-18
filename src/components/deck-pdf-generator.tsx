import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Document, Page, View, Image, PDFViewer, pdf } from "@react-pdf/renderer";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Printer } from "lucide-react";
import { Deck } from "@/types";

// Conversion helper
const MM_TO_PT = 2.83465; // 1mm = 2.83465pt

// A4 dimensions in mm converted to points
const A4_WIDTH_PT = 210 * MM_TO_PT; // 210mm
const A4_HEIGHT_PT = 297 * MM_TO_PT; // 297mm

// Standard Magic card dimensions in points
const CARD_WIDTH_PT = 63 * MM_TO_PT; // 63mm
const CARD_HEIGHT_PT = 88 * MM_TO_PT; // 88mm

// 0.5mm spacing in points for a cutting margin
const SPACING_PT = 0.5 * MM_TO_PT;

// Calculate how many cards fit per row and column with spacing
const CARDS_PER_ROW = Math.floor((A4_WIDTH_PT + SPACING_PT) / (CARD_WIDTH_PT + SPACING_PT));
const CARDS_PER_COLUMN = Math.floor((A4_HEIGHT_PT + SPACING_PT) / (CARD_HEIGHT_PT + SPACING_PT));
const CARDS_PER_PAGE = CARDS_PER_ROW * CARDS_PER_COLUMN;

// Grid should be centered on the page
const GRID_WIDTH = CARDS_PER_ROW * CARD_WIDTH_PT + (CARDS_PER_ROW - 1) * SPACING_PT;
const GRID_HEIGHT = CARDS_PER_COLUMN * CARD_HEIGHT_PT + (CARDS_PER_COLUMN - 1) * SPACING_PT;
const MARGIN_X = (A4_WIDTH_PT - GRID_WIDTH) / 2;
const MARGIN_Y = (A4_HEIGHT_PT - GRID_HEIGHT) / 2;

const DeckPdfGenerator = ({ deck }: { deck: Deck }) => {
	const [open, setOpen] = useState(false);

	// Flatten deck entries into array of cards respecting quantities
	const cards = Object.values(deck.entries).flatMap((entry) =>
		Array(entry.quantity).fill({ ...entry })
	);

	// Split cards into pages
	const pages = Array.from({ length: Math.ceil(cards.length / CARDS_PER_PAGE) }, (_, i) =>
		cards.slice(i * CARDS_PER_PAGE, (i + 1) * CARDS_PER_PAGE)
	);

	const PdfDocument = () => (
		<Document>
			{pages.map((pageCards, pageIndex) => (
				<Page
					key={pageIndex}
					size='A4'
					style={{
						paddingTop: MARGIN_Y,
						paddingLeft: MARGIN_X,
						position: "relative",
					}}
				>
					<View
						style={{
							display: "flex",
							flexDirection: "row",
							flexWrap: "wrap",
							gap: SPACING_PT,
						}}
					>
						{pageCards.map((card, cardIndex) => (
							<View
								key={`${card.id}-${cardIndex}`}
								style={{
									width: CARD_WIDTH_PT,
									height: CARD_HEIGHT_PT,
								}}
							>
								<Image
									src={card.imageUrl || ""}
									style={{
										width: "100%",
										height: "100%",
										objectFit: "contain",
									}}
								/>
							</View>
						))}
					</View>
				</Page>
			))}
		</Document>
	);

	const handleDownload = async () => {
		const blob = await pdf(<PdfDocument />).toBlob();
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "deck-printout.pdf";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant='outline' className='flex gap-2'>
					<Printer className='h-4 w-4' />
					Print Proxies
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-4xl h-[80vh]'>
				<div className='flex flex-col h-full gap-4'>
					<PDFViewer style={{ flex: 1, width: "100%" }}>
						<PdfDocument />
					</PDFViewer>
					<div className='flex justify-end gap-2'>
						<Button variant='outline' onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleDownload}>Download PDF</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default DeckPdfGenerator;
