import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Document, Page, View, Image, PDFViewer, pdf } from "@react-pdf/renderer";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Printer } from "lucide-react";
import { Deck } from "@/types";

const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;
const CARD_WIDTH_PT = 178.58;
const CARD_HEIGHT_PT = 249.45;
const SPACING_PT = 1.415;
const PADDING_PT = 26;

const CARDS_PER_ROW = Math.floor((A4_WIDTH_PT + SPACING_PT) / (CARD_WIDTH_PT + SPACING_PT));
const CARDS_PER_COLUMN = Math.floor((A4_HEIGHT_PT + SPACING_PT) / (CARD_HEIGHT_PT + SPACING_PT));
const CARDS_PER_PAGE = CARDS_PER_ROW * CARDS_PER_COLUMN;

const DeckPdfGenerator = ({ deck }: { deck: Deck }) => {
	const [open, setOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		// we don't use css classes, because we don't want to render it at all on mobile
		const checkMobile = () => setIsMobile(window.innerWidth <= 768);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const cards = Object.values(deck.entries).flatMap((entry) =>
		Array(entry.quantity).fill({ ...entry })
	);

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
						flexDirection: "row",
						flexWrap: "wrap",
						padding: PADDING_PT,
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

	if (isMobile) {
		return (
			<Button onClick={handleDownload} className='flex gap-2'>
				<Printer className='h-4 w-4' />
				Download PDF
			</Button>
		);
	}

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
					<PDFViewer className='flex-1 w-full'>
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
