import { Jimp, type JimpInstance } from 'jimp';
import { Tensor } from 'onnxruntime-web';

export async function loadImage(imageObjectUrl: string, dims: number[]): Promise<JimpInstance> {
	const response = await fetch(imageObjectUrl);
	const blob = await response.blob();
	const dataUrl = await blobToDataUrl(blob);
	const jimpImage = await Jimp.read(dataUrl);
	return jimpImage.contain({ w: dims[2], h: dims[3] }) as JimpInstance;
}

function blobToDataUrl(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(new Error('error reading file'));
		reader.readAsDataURL(blob);
	});
}

export function imageToTensor(image: JimpInstance, dims: number[]): Tensor {
	const { data } = image.bitmap;
	const rgbData = extractRgbData(data);
	const float32Data = normalizeData(rgbData);
	return new Tensor('float32', float32Data, dims);
}

function extractRgbData(data: Buffer): number[] {
	const rgbArrays = [[], [], []] as number[][];
	for (let i = 0; i < data.length; i += 4) {
		rgbArrays[0].push(data[i]); // Red
		rgbArrays[1].push(data[i + 1]); // Green
		rgbArrays[2].push(data[i + 2]); // Blue
	}
	return rgbArrays.flat();
}

function normalizeData(data: number[]): Float32Array {
	return Float32Array.from(data, (value) => value / 255.0);
}
