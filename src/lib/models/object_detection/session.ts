import * as ort from 'onnxruntime-web/webgpu';
import wasm from '$lib/assets/wasm/ort-wasm-simd-threaded.jsep.wasm?url';
import model from '$lib/assets/onnx/yolo11s.onnx?url';

export async function createSession(): Promise<ort.InferenceSession> {
	ort.env.wasm.wasmPaths = { wasm };

	return ort.InferenceSession.create(model, {
		executionProviders: ['wasm', 'webgpu'],
		graphOptimizationLevel: 'all'
	});
}
