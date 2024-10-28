import * as ort from 'onnxruntime-web/webgpu';

const DEFAULT_MODEL_FILE_PATH = '/yolo11s.onnx';
const DEFAULT_EXECUTION_PROVIDERS = ['wasm', 'webgpu'];
const DEFAULT_GRAPH_OPTIMIZATION_LEVEL = 'all';

export async function createSession(
	model: string = DEFAULT_MODEL_FILE_PATH,
	executionProviders = DEFAULT_EXECUTION_PROVIDERS,
	graphOptimizationLevel = DEFAULT_GRAPH_OPTIMIZATION_LEVEL
): Promise<ort.InferenceSession> {
	ort.env.wasm.wasmPaths = '/';

	// @ts-expect-error false positive
	return ort.InferenceSession.create(model, {
		executionProviders,
		graphOptimizationLevel
	});
}
