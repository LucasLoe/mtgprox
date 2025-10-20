import { useState, useEffect, Fragment } from "react";
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
									Crosshair
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
	const CARDS_PER_ROW = Math.floor(
		(A4_WIDTH_PT - 2 * PADDING_PT + spacing) / (CARD_WIDTH_PT + spacing)
	);
	const CARDS_PER_COLUMN = Math.floor(
		(A4_HEIGHT_PT - 2 * PADDING_PT + spacing) / (CARD_HEIGHT_PT + spacing)
	);
	const CARDS_PER_PAGE = CARDS_PER_ROW * CARDS_PER_COLUMN;

	const pages = Array.from({ length: Math.ceil(cards.length / CARDS_PER_PAGE) }, (_, i) =>
		cards.slice(i * CARDS_PER_PAGE, (i + 1) * CARDS_PER_PAGE)
	);

	// Helper function to calculate card position
	const getCardPosition = (cardIndex: number) => {
		const col = cardIndex % CARDS_PER_ROW;
		const row = Math.floor(cardIndex / CARDS_PER_ROW);
		const x = PADDING_PT + col * (CARD_WIDTH_PT + spacing);
		const y = PADDING_PT + row * (CARD_HEIGHT_PT + spacing);
		return { x, y };
	};

	// Helper function to calculate grid line position
	const getGridLinePosition = (index: number, isVertical: boolean) => {
		if (isVertical) {
			return PADDING_PT + index * (CARD_WIDTH_PT + spacing) - spacing / 2;
		} else {
			return PADDING_PT + index * (CARD_HEIGHT_PT + spacing) - spacing / 2;
		}
	};

	// Helper function to calculate crosshair position
	const getCrosshairPosition = (col: number, row: number) => {
		const x = PADDING_PT + col * CARD_WIDTH_PT;
		const y = PADDING_PT + row * CARD_HEIGHT_PT;
		return { x, y };
	};

	// Calculate the total grid area dimensions
	const gridWidth = CARDS_PER_ROW * CARD_WIDTH_PT + (CARDS_PER_ROW - 1) * spacing;
	const gridHeight = CARDS_PER_COLUMN * CARD_HEIGHT_PT + (CARDS_PER_COLUMN - 1) * spacing;

	const PdfDocument = () => (
		<Document>
			{pages.map((pageCards, pageIndex) => (
				<Page
					key={pageIndex}
					size='A4'
					style={{
						position: "relative",
					}}
				>
					{/* Black background for card grid area */}
					<View
						style={{
							position: "absolute",
							left: PADDING_PT,
							top: PADDING_PT,
							width: gridWidth,
							height: gridHeight,
							backgroundColor: "black",
						}}
					/>

					{/* White border mode: render grid lines */}
					{delimiter === "white-border" && (
						<>
							{Array.from({ length: CARDS_PER_ROW + 1 }).map((_, i) => (
								<View
									key={`vline-${i}`}
									style={{
										position: "absolute",
										left: getGridLinePosition(i, true),
										top: PADDING_PT,
										width: "0.5pt",
										height: gridHeight,
										backgroundColor: "white",
									}}
								/>
							))}

							{Array.from({ length: CARDS_PER_COLUMN + 1 }).map((_, i) => (
								<View
									key={`hline-${i}`}
									style={{
										position: "absolute",
										top: getGridLinePosition(i, false),
										left: PADDING_PT,
										width: gridWidth,
										height: "0.5pt",
										backgroundColor: "white",
									}}
								/>
							))}
						</>
					)}

					{/* Cards with absolute positioning */}
					{pageCards.map((card, cardIndex) => {
						const { x, y } = getCardPosition(cardIndex);
						return (
							<View
								key={`${card.id}-${cardIndex}`}
								style={{
									position: "absolute",
									left: x,
									top: y,
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
						);
					})}

					{/* Crosshair mode: render crosshairs at grid intersections */}
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
							{Array.from({ length: CARDS_PER_ROW + 1 }).map((_, col) =>
								Array.from({ length: CARDS_PER_COLUMN + 1 }).map((_, row) => {
									const { x, y } = getCrosshairPosition(col, row);

									return (
										<Fragment key={`crosshair-${col}-${row}`}>
											{/* Vertical line */}
											<Line
												x1={x}
												y1={y - CROSSHAIR_LENGTH_PT / 2}
												x2={x}
												y2={y + CROSSHAIR_LENGTH_PT / 2}
												strokeWidth='0.5'
												stroke='#36C9E3'
											/>
											{/* Horizontal line */}
											<Line
												x1={x - CROSSHAIR_LENGTH_PT / 2}
												y1={y}
												x2={x + CROSSHAIR_LENGTH_PT / 2}
												y2={y}
												strokeWidth='0.5'
												stroke='#36C9E3'
											/>
										</Fragment>
									);
								})
							)}
						</Svg>
					)}
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
