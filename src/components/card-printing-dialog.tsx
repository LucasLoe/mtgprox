import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Document, Page, View, Image, PDFViewer, pdf, Line, Svg } from "@react-pdf/renderer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Printer } from "lucide-react";
import { Deck } from "@/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;
const CARD_WIDTH_PT = 178.58;
const CARD_HEIGHT_PT = 249.45;
const SPACING_PT = 0.5;
const PADDING_PT = 26;
const CROSSHAIR_LENGTH_PT = 5.67; // 2mm in points (1mm = 2.835pt)

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type DelimiterType = "white-border" | "crosshair";

// Settings Dialog Component
const PrintSettingsDialog = ({
	open,
	onOpenChange,
	onConfirm,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (delimiter: DelimiterType) => void;
}) => {
	const [delimiter, setDelimiter] = useState<DelimiterType>("white-border");

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-md'>
				<DialogHeader>
					<DialogTitle>Print Settings</DialogTitle>
				</DialogHeader>
				<div className='space-y-6 py-4'>
					<div className='space-y-3'>
						<Label className='text-base font-semibold'>Card Delimiter</Label>
						<RadioGroup
							value={delimiter}
							onValueChange={(value) => setDelimiter(value as DelimiterType)}
						>
							<div className='flex items-center space-x-2'>
								<RadioGroupItem value='white-border' id='white-border' />
								<Label htmlFor='white-border' className='font-normal cursor-pointer'>
									White Border
								</Label>
							</div>
							<div className='flex items-center space-x-2'>
								<RadioGroupItem value='crosshair' id='crosshair' />
								<Label htmlFor='crosshair' className='font-normal cursor-pointer'>
									Crosshair (no spacing)
								</Label>
							</div>
						</RadioGroup>
					</div>
				</div>
				<div className='flex justify-end gap-2'>
					<Button variant='outline' onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={() => onConfirm(delimiter)}>
						<Printer className='h-4 w-4 mr-2' />
						Generate PDF
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export const CardPrintingDialog = ({ deck }: { deck: Deck }) => {
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [pdfOpen, setPdfOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [cardImages, setCardImages] = useState<{ [key: string]: string }>({});
	const [isLoading, setIsLoading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [delimiter, setDelimiter] = useState<DelimiterType>("white-border");

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
		setPdfOpen(true);
	};

	const handleSettingsConfirm = async (selectedDelimiter: DelimiterType) => {
		setDelimiter(selectedDelimiter);
		setSettingsOpen(false);
		await loadImages();
	};

	const cards = Object.values(deck.entries).flatMap((entry) =>
		Array(entry.quantity).fill({ ...entry })
	);

	// Calculate cards per page based on delimiter type
	const spacing = delimiter === "crosshair" ? 0 : SPACING_PT;
	const CARDS_PER_ROW = Math.floor((A4_WIDTH_PT + spacing) / (CARD_WIDTH_PT + spacing));
	const CARDS_PER_COLUMN = Math.floor((A4_HEIGHT_PT + spacing) / (CARD_HEIGHT_PT + spacing));
	const CARDS_PER_PAGE = CARDS_PER_ROW * CARDS_PER_COLUMN;

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
						gap: spacing,
						position: "relative",
					}}
				>
					{/* White border mode: render grid lines (current behavior) */}
					{delimiter === "white-border" && (
						<>
							{Array.from({ length: CARDS_PER_ROW + 1 }).map((_, i) => (
								<View
									key={`vline-${i}`}
									style={{
										position: "absolute",
										left: PADDING_PT + (CARD_WIDTH_PT + SPACING_PT) * i - SPACING_PT / 2,
										top: 0,
										width: "0.5pt",
										height: "100%",
										backgroundColor: "black",
									}}
								/>
							))}

							{Array.from({ length: CARDS_PER_COLUMN + 1 }).map((_, i) => (
								<View
									key={`hline-${i}`}
									style={{
										position: "absolute",
										top: PADDING_PT + (CARD_HEIGHT_PT + SPACING_PT) * i - SPACING_PT / 2,
										left: 0,
										width: "100%",
										height: "0.5pt",
										backgroundColor: "black",
									}}
								/>
							))}
						</>
					)}
					{/* 
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
					))} */}
					{/* Crosshair mode: render crosshairs at grid intersections on edges */}
					{delimiter === "crosshair" && (
						<Svg
							style={{
								position: "absolute",
								left: 0,
								top: 0,
								width: A4_WIDTH_PT,
								height: A4_HEIGHT_PT,
							}}
						>
							{/* Top edge: 2 crosshairs */}
							<Line
								x1={PADDING_PT + CARD_WIDTH_PT}
								y1={PADDING_PT - CROSSHAIR_LENGTH_PT / 2}
								x2={PADDING_PT + CARD_WIDTH_PT}
								y2={PADDING_PT + CROSSHAIR_LENGTH_PT / 2}
								strokeWidth='1'
								stroke='#36C9E3'
							/>
							<Line
								x1={PADDING_PT + CARD_WIDTH_PT - CROSSHAIR_LENGTH_PT / 2}
								y1={PADDING_PT}
								x2={PADDING_PT + CARD_WIDTH_PT + CROSSHAIR_LENGTH_PT / 2}
								y2={PADDING_PT}
								strokeWidth='1'
								stroke='#36C9E3'
							/>

							<Line
								x1={PADDING_PT + CARD_WIDTH_PT * 2}
								y1={PADDING_PT - CROSSHAIR_LENGTH_PT / 2}
								x2={PADDING_PT + CARD_WIDTH_PT * 2}
								y2={PADDING_PT + CROSSHAIR_LENGTH_PT / 2}
								strokeWidth='1'
								stroke='#36C9E3'
							/>
							<Line
								x1={PADDING_PT + CARD_WIDTH_PT * 2 - CROSSHAIR_LENGTH_PT / 2}
								y1={PADDING_PT}
								x2={PADDING_PT + CARD_WIDTH_PT * 2 + CROSSHAIR_LENGTH_PT / 2}
								y2={PADDING_PT}
								strokeWidth='1'
								stroke='#36C9E3'
							/>

							{/* Bottom edge: 2 crosshairs */}
							<Line
								x1={PADDING_PT + CARD_WIDTH_PT}
								y1={PADDING_PT + CARD_HEIGHT_PT * 3 - CROSSHAIR_LENGTH_PT / 2}
								x2={PADDING_PT + CARD_WIDTH_PT}
								y2={PADDING_PT + CARD_HEIGHT_PT * 3 + CROSSHAIR_LENGTH_PT / 2}
								strokeWidth='1'
								stroke='#36C9E3'
							/>
							<Line
								x1={PADDING_PT + CARD_WIDTH_PT - CROSSHAIR_LENGTH_PT / 2}
								y1={PADDING_PT + CARD_HEIGHT_PT * 3}
								x2={PADDING_PT + CARD_WIDTH_PT + CROSSHAIR_LENGTH_PT / 2}
								y2={PADDING_PT + CARD_HEIGHT_PT * 3}
								strokeWidth='1'
								stroke='#36C9E3'
							/>

							<Line
								x1={PADDING_PT + CARD_WIDTH_PT * 2}
								y1={PADDING_PT + CARD_HEIGHT_PT * 3 - CROSSHAIR_LENGTH_PT / 2}
								x2={PADDING_PT + CARD_WIDTH_PT * 2}
								y2={PADDING_PT + CARD_HEIGHT_PT * 3 + CROSSHAIR_LENGTH_PT / 2}
								strokeWidth='1'
								stroke='#36C9E3'
							/>
							<Line
								x1={PADDING_PT + CARD_WIDTH_PT * 2 - CROSSHAIR_LENGTH_PT / 2}
								y1={PADDING_PT + CARD_HEIGHT_PT * 3}
								x2={PADDING_PT + CARD_WIDTH_PT * 2 + CROSSHAIR_LENGTH_PT / 2}
								y2={PADDING_PT + CARD_HEIGHT_PT * 3}
								strokeWidth='1'
								stroke='#36C9E3'
							/>

							{/* Left edge: 2 crosshairs */}
							<Line
								x1={PADDING_PT}
								y1={PADDING_PT + CARD_HEIGHT_PT - CROSSHAIR_LENGTH_PT / 2}
								x2={PADDING_PT}
								y2={PADDING_PT + CARD_HEIGHT_PT + CROSSHAIR_LENGTH_PT / 2}
								strokeWidth='1'
								stroke='#36C9E3'
							/>
							<Line
								x1={PADDING_PT - CROSSHAIR_LENGTH_PT / 2}
								y1={PADDING_PT + CARD_HEIGHT_PT}
								x2={PADDING_PT + CROSSHAIR_LENGTH_PT / 2}
								y2={PADDING_PT + CARD_HEIGHT_PT}
								strokeWidth='1'
								stroke='#36C9E3'
							/>

							<Line
								x1={PADDING_PT}
								y1={PADDING_PT + CARD_HEIGHT_PT * 2 - CROSSHAIR_LENGTH_PT / 2}
								x2={PADDING_PT}
								y2={PADDING_PT + CARD_HEIGHT_PT * 2 + CROSSHAIR_LENGTH_PT / 2}
								strokeWidth='1'
								stroke='#36C9E3'
							/>
							<Line
								x1={PADDING_PT - CROSSHAIR_LENGTH_PT / 2}
								y1={PADDING_PT + CARD_HEIGHT_PT * 2}
								x2={PADDING_PT + CROSSHAIR_LENGTH_PT / 2}
								y2={PADDING_PT + CARD_HEIGHT_PT * 2}
								strokeWidth='1'
								stroke='#36C9E3'
							/>

							{/* Right edge: 2 crosshairs */}
							<Line
								x1={PADDING_PT + CARD_WIDTH_PT * 3}
								y1={PADDING_PT + CARD_HEIGHT_PT - CROSSHAIR_LENGTH_PT / 2}
								x2={PADDING_PT + CARD_WIDTH_PT * 3}
								y2={PADDING_PT + CARD_HEIGHT_PT + CROSSHAIR_LENGTH_PT / 2}
								strokeWidth='1'
								stroke='#36C9E3'
							/>
							<Line
								x1={PADDING_PT + CARD_WIDTH_PT * 3 - CROSSHAIR_LENGTH_PT / 2}
								y1={PADDING_PT + CARD_HEIGHT_PT}
								x2={PADDING_PT + CARD_WIDTH_PT * 3 + CROSSHAIR_LENGTH_PT / 2}
								y2={PADDING_PT + CARD_HEIGHT_PT}
								strokeWidth='1'
								stroke='#36C9E3'
							/>

							<Line
								x1={PADDING_PT + CARD_WIDTH_PT * 3}
								y1={PADDING_PT + CARD_HEIGHT_PT * 2 - CROSSHAIR_LENGTH_PT / 2}
								x2={PADDING_PT + CARD_WIDTH_PT * 3}
								y2={PADDING_PT + CARD_HEIGHT_PT * 2 + CROSSHAIR_LENGTH_PT / 2}
								strokeWidth='1'
								stroke='#36C9E3'
							/>
							<Line
								x1={PADDING_PT + CARD_WIDTH_PT * 3 - CROSSHAIR_LENGTH_PT / 2}
								y1={PADDING_PT + CARD_HEIGHT_PT * 2}
								x2={PADDING_PT + CARD_WIDTH_PT * 3 + CROSSHAIR_LENGTH_PT / 2}
								y2={PADDING_PT + CARD_HEIGHT_PT * 2}
								strokeWidth='1'
								stroke='#36C9E3'
							/>
						</Svg>
					)}
					{/* Test SVG - Giant Red Line */}
					<Svg height='210' width='500'>
						<Line x1='0' y1='0' x2='200' y2='200' strokeWidth={2} stroke='rgb(255,0,0)' />
					</Svg>
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
		setPdfOpen(false);
	};

	if (isMobile) {
		return (
			<>
				<Button onClick={() => setSettingsOpen(true)} className='flex gap-2' disabled={isLoading}>
					<Printer className='h-4 w-4' />
					{isLoading ? `Loading ${progress}%` : "Download PDF"}
				</Button>
				<PrintSettingsDialog
					open={settingsOpen}
					onOpenChange={setSettingsOpen}
					onConfirm={async (selectedDelimiter) => {
						await handleSettingsConfirm(selectedDelimiter);
						if (!isLoading) {
							await handleDownload();
						}
					}}
				/>
			</>
		);
	}

	return (
		<>
			<Button
				variant='outline'
				className='flex gap-2'
				onClick={() => setSettingsOpen(true)}
				disabled={isLoading}
			>
				<Printer className='h-4 w-4' />
				{isLoading ? `Loading ${progress}%` : "Print Proxies"}
			</Button>

			<PrintSettingsDialog
				open={settingsOpen}
				onOpenChange={setSettingsOpen}
				onConfirm={handleSettingsConfirm}
			/>

			<Dialog open={pdfOpen} onOpenChange={setPdfOpen}>
				<DialogContent className='max-w-4xl h-[80vh]'>
					<div className='flex flex-col h-full gap-4'>
						<PDFViewer className='flex-1 w-full'>
							<PdfDocument />
						</PDFViewer>
						<div className='flex justify-end gap-2'>
							<Button variant='outline' onClick={() => setPdfOpen(false)}>
								Cancel
							</Button>
							<Button onClick={handleDownload}>Download PDF</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};
