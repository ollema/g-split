import { loadImage, imageToTensor } from './dataloader';
import { createSession } from './session';

const CHANNELS = 3;
export const WIDTH = 640;
export const HEIGHT = 640;
const TENSOR_DIMENSIONS = [1, CHANNELS, WIDTH, HEIGHT];
const N_ANCHOR_BOXES = 8400;
const X_OUTPUT_OFFSET = 0;
const Y_OUTPUT_OFFSET = 1;
const W_OUTPUT_OFFSET = 2;
const H_OUTPUT_OFFSET = 3;
const CLASS_PROB_OFFSET_START = 4;
const CONFIDENCE_THRESHOLD = 0.5;
const IOU_THRESHOLD = 0.7;

export type BoundingBox = {
	x: number;
	y: number;
	width: number;
	height: number;
	label: (typeof classes)[number];
	probability: number;
};

type ObjectDetectionResult = {
	bboxes: BoundingBox[];
	latency: number[];
};

type YoloOutput = Float32Array;

export async function detect(
	imageObjectUrl: string,
	filter?: string
): Promise<ObjectDetectionResult | undefined> {
	try {
		const image = await loadImage(imageObjectUrl, TENSOR_DIMENSIONS);
		const tensor = imageToTensor(image, TENSOR_DIMENSIONS);

		const session = await createSession();

		let start = performance.now();
		const feeds = { [session.inputNames[0]]: tensor };
		const output = (await session.run(feeds))[session.outputNames[0]].data as Float32Array;
		const latency = [(performance.now() - start) / 1000];

		start = performance.now();
		const bboxes = postProcess(output, filter);
		latency.push((performance.now() - start) / 1000);

		return { bboxes, latency };
	} catch (error) {
		console.error('error classifying image:', error);
		return undefined;
	}
}

export function postProcess(output: YoloOutput, filter?: string): BoundingBox[] {
	let boxes: BoundingBox[] = [];

	for (let index = 0; index < N_ANCHOR_BOXES; index++) {
		const [classId, probability] = [...Array(80).keys()]
			.map((col): [number, number] => [
				col,
				output[N_ANCHOR_BOXES * (col + CLASS_PROB_OFFSET_START) + index]
			])
			.reduce((accumulator, item) => (item[1] > accumulator[1] ? item : accumulator), [0, 0]);

		if (probability < CONFIDENCE_THRESHOLD) {
			continue;
		}

		const label = classes[classId];
		const [xc, yc, w, h] = [
			output[X_OUTPUT_OFFSET * N_ANCHOR_BOXES + index],
			output[Y_OUTPUT_OFFSET * N_ANCHOR_BOXES + index],
			output[W_OUTPUT_OFFSET * N_ANCHOR_BOXES + index],
			output[H_OUTPUT_OFFSET * N_ANCHOR_BOXES + index]
		];

		// TODO: scale these based on aspect ratio
		const x1 = xc - w / 2;
		const y1 = yc - h / 2;
		const x2 = xc + w / 2;
		const y2 = yc + h / 2;

		boxes.push({ x: x1, y: y1, width: x2 - x1, height: y2 - y1, label, probability });
	}

	boxes.sort((a, b) => b.probability - a.probability);

	// non-maximum suppression
	let result: BoundingBox[] = [];
	while (boxes.length > 0) {
		result.push(boxes[0]);
		boxes = boxes.filter((box) => iou(boxes[0], box) < IOU_THRESHOLD);
	}

	// filter by class
	if (filter) {
		result = result.filter((box) => box.label === filter);
	}

	// extract patches from image

	return result;
}

function iou(box1: BoundingBox, box2: BoundingBox): number {
	const intersectionArea = intersection(box1, box2);
	const unionArea = union(box1, box2);
	return intersectionArea / unionArea;
}

function union(box1: BoundingBox, box2: BoundingBox): number {
	const box1Area = box1.width * box1.height;
	const box2Area = box2.width * box2.height;
	return box1Area + box2Area - intersection(box1, box2);
}

function intersection(box1: BoundingBox, box2: BoundingBox): number {
	const x1 = Math.max(box1.x, box2.x);
	const y1 = Math.max(box1.y, box2.y);
	const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
	const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);
	return Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
}

const classes = [
	'person',
	'bicycle',
	'car',
	'motorcycle',
	'airplane',
	'bus',
	'train',
	'truck',
	'boat',
	'traffic light',
	'fire hydrant',
	'stop sign',
	'parking meter',
	'bench',
	'bird',
	'cat',
	'dog',
	'horse',
	'sheep',
	'cow',
	'elephant',
	'bear',
	'zebra',
	'giraffe',
	'backpack',
	'umbrella',
	'handbag',
	'tie',
	'suitcase',
	'frisbee',
	'skis',
	'snowboard',
	'sports ball',
	'kite',
	'baseball bat',
	'baseball glove',
	'skateboard',
	'surfboard',
	'tennis racket',
	'bottle',
	'wine glass',
	'cup',
	'fork',
	'knife',
	'spoon',
	'bowl',
	'banana',
	'apple',
	'sandwich',
	'orange',
	'broccoli',
	'carrot',
	'hot dog',
	'pizza',
	'donut',
	'cake',
	'chair',
	'couch',
	'potted plant',
	'bed',
	'dining table',
	'toilet',
	'tv',
	'laptop',
	'mouse',
	'remote',
	'keyboard',
	'cell phone',
	'microwave',
	'oven',
	'toaster',
	'sink',
	'refrigerator',
	'book',
	'clock',
	'vase',
	'scissors',
	'teddy bear',
	'hair drier',
	'toothbrush'
] as const;
