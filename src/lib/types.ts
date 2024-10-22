import type { classes } from '$lib/models/object_detection/classes';

import type { JimpInstance } from 'jimp';

export type BoundingBox = {
	x: number;
	y: number;
	width: number;
	height: number;
	label: (typeof classes)[number];
	probability: number;
	patch?: JimpInstance;
};

export type ObjectDetectionResult = {
	bboxes: BoundingBox[];
	latency: number[];
	image: JimpInstance;
};
