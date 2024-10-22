import type { BoundingBox, ObjectDetectionResult } from '$lib/types';
import { classes } from './classes';
import { loadImage, imageToTensor, extractPatch } from './dataloader';
import { createSession } from './session';

import type { JimpInstance } from 'jimp';

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

export async function detect(
	src: string,
	filter?: string
): Promise<ObjectDetectionResult | undefined> {
	try {
		const { originalImage, resizedImage } = await loadImage(src, TENSOR_DIMENSIONS);
		const tensor = imageToTensor(resizedImage, TENSOR_DIMENSIONS);

		const session = await createSession();

		let start = performance.now();
		const feeds = { [session.inputNames[0]]: tensor };
		const output = (await session.run(feeds))[session.outputNames[0]].data as Float32Array;
		const latency = [(performance.now() - start) / 1000];

		start = performance.now();
		const bboxes = postProcess(output, originalImage, filter);
		latency.push((performance.now() - start) / 1000);

		return {
			bboxes,
			latency,
			image: originalImage
		};
	} catch (error) {
		console.error('error classifying image:', error);
		return undefined;
	}
}

export function postProcess(
	output: Float32Array,
	originalImage: JimpInstance,
	filter?: string
): BoundingBox[] {
	// get bounding box transform function based on original image and the fixed input size
	const transform = getBoundingBoxTransform(originalImage);

	// extract bounding bboxes
	let bboxes: BoundingBox[] = [];
	for (let index = 0; index < N_ANCHOR_BOXES; index++) {
		const [classId, probability] = getClassAndProbability(output, index);
		if (probability < CONFIDENCE_THRESHOLD) {
			continue;
		}
		const label = classes[classId];
		bboxes.push({ ...getBoundingBox(output, index, transform), label, probability });
	}

	// sort by probability
	bboxes.sort((a, b) => b.probability - a.probability);

	// perform non-maximum suppression
	bboxes = nonMaximumSuppression(bboxes);

	// filter by class
	if (filter) {
		bboxes = bboxes.filter((box) => box.label === filter);
	}

	// extract patches from image for downstream classification task
	bboxes = bboxes.map((bbox) => {
		bbox.patch = extractPatch(originalImage, bbox);
		return bbox;
	});

	return bboxes;
}

function getClassAndProbability(output: Float32Array, index: number): [number, number] {
	return [...Array(80).keys()]
		.map((col): [number, number] => [
			col,
			output[N_ANCHOR_BOXES * (col + CLASS_PROB_OFFSET_START) + index]
		])
		.reduce((accumulator, item) => (item[1] > accumulator[1] ? item : accumulator), [0, 0]);
}

function getBoundingBox(
	output: Float32Array,
	index: number,
	transform: ReturnType<typeof getBoundingBoxTransform>
): { x: number; y: number; width: number; height: number } {
	const [xc, yc, w, h] = [
		output[X_OUTPUT_OFFSET * N_ANCHOR_BOXES + index],
		output[Y_OUTPUT_OFFSET * N_ANCHOR_BOXES + index],
		output[W_OUTPUT_OFFSET * N_ANCHOR_BOXES + index],
		output[H_OUTPUT_OFFSET * N_ANCHOR_BOXES + index]
	];

	return { ...transform(xc, yc, w, h) };
}

function nonMaximumSuppression(bboxes: BoundingBox[]): BoundingBox[] {
	const result: BoundingBox[] = [];
	while (bboxes.length > 0) {
		result.push(bboxes[0]);
		bboxes = bboxes.filter((box) => iou(bboxes[0], box) < IOU_THRESHOLD);
	}
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

function getBoundingBoxTransform(
	originalImage: JimpInstance
): (
	xc: number,
	yc: number,
	w: number,
	h: number
) => { x: number; y: number; width: number; height: number } {
	// scale is determined by the larger dimension, since the smaller dimension will be padded
	const scale = Math.max(originalImage.width / WIDTH, originalImage.height / HEIGHT);

	// calculate padding. one of these will be 0, depending on which dimension is larger
	// the other will be the padding required to center the image
	const xPadding = (WIDTH - originalImage.width / scale) / 2;
	const yPadding = (HEIGHT - originalImage.height / scale) / 2;

	return (xc, yc, w, h) => {
		const x = (xc - w / 2 - xPadding) * scale;
		const y = (yc - h / 2 - yPadding) * scale;
		const width = w * scale;
		const height = h * scale;

		return { x, y, width, height };
	};
}

export function getInverseBoundingBoxTransform(
	originalImage: JimpInstance
): (
	x: number,
	y: number,
	width: number,
	height: number
) => { xc: number; yc: number; w: number; h: number } {
	const scale = Math.max(originalImage.width / WIDTH, originalImage.height / HEIGHT);
	const xPadding = (WIDTH - originalImage.width / scale) / 2;
	const yPadding = (HEIGHT - originalImage.height / scale) / 2;

	return (x, y, width, height) => {
		const xc = x / scale + xPadding + width / (2 * scale);
		const yc = y / scale + yPadding + height / (2 * scale);
		const w = width / scale;
		const h = height / scale;

		return { xc, yc, w, h };
	};
}
