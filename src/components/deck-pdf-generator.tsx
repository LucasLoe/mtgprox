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
const SPACING_PT = 1;
const PADDING_PT = 26;

const CARDS_PER_ROW = Math.floor((A4_WIDTH_PT + SPACING_PT) / (CARD_WIDTH_PT + SPACING_PT));
const CARDS_PER_COLUMN = Math.floor((A4_HEIGHT_PT + SPACING_PT) / (CARD_HEIGHT_PT + SPACING_PT));
const CARDS_PER_PAGE = CARDS_PER_ROW * CARDS_PER_COLUMN;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DeckPdfGenerator = ({ deck }: { deck: Deck }) => {
	const [open, setOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [cardImages, setCardImages] = useState<{ [key: string]: string }>({});
	const [isLoading, setIsLoading] = useState(false);
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth <= 768);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const loadImages = async () => {
		const images: { [key: string]: string } = {};
		const entries = Object.values(deck.entries);

		setIsLoading(true);
		setProgress(0);

		for (let i = 0; i < entries.length; i++) {
			const entry = entries[i];
			if (entry.imageUrl) {
				try {
					await sleep(100);
					const img = new window.Image();
					img.crossOrigin = "anonymous";
					const cacheBusterUrl = `${entry.imageUrl}?r=${Math.random()}`;
					img.src = cacheBusterUrl;

					await new Promise((resolve, reject) => {
						img.onload = resolve;
						img.onerror = reject;
					});

					images[entry.id] = cacheBusterUrl;
					setProgress(Math.round(((i + 1) / entries.length) * 100));
				} catch (error) {
					console.error(`Failed to load image for card ${entry.id}:`, error);
				}
			}
		}

		setCardImages(images);
		setIsLoading(false);
		setOpen(true);
	};

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
								src={cardImages[card.id] || ""}
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
			<Button onClick={loadImages} className='flex gap-2' disabled={isLoading}>
				<Printer className='h-4 w-4' />
				{isLoading ? `Loading ${progress}%` : "Download PDF"}
			</Button>
		);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant='outline'
					className='flex gap-2'
					onClick={(e) => {
						e.preventDefault();
						if (!open) loadImages();
					}}
					disabled={isLoading}
				>
					<Printer className='h-4 w-4' />
					{isLoading ? `Loading ${progress}%` : "Print Proxies"}
				</Button>
			</DialogTrigger>
			{open && (
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
			)}
		</Dialog>
	);
};

export default DeckPdfGenerator;
