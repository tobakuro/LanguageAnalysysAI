import * as ort from 'onnxruntime-web/wasm'

const IMAGE_SIZE = 224
// PyTorch側（training/train_sound.py, train_dice.py）の正規化と揃える
const MEAN = [0.485, 0.456, 0.406]
const STD = [0.229, 0.224, 0.225]

export interface ClassificationResult {
  label: string
  confidence: number
}

export class ImageClassifier {
  private readonly session: ort.InferenceSession
  private readonly classes: string[]

  private constructor(session: ort.InferenceSession, classes: string[]) {
    this.session = session
    this.classes = classes
  }

  static async load(modelUrl: string, classesUrl: string): Promise<ImageClassifier> {
    const [session, classes] = await Promise.all([
      ort.InferenceSession.create(modelUrl, { executionProviders: ['wasm'] }),
      fetch(classesUrl).then((res) => res.json() as Promise<string[]>),
    ])
    return new ImageClassifier(session, classes)
  }

  async classify(image: ImageData | HTMLCanvasElement): Promise<ClassificationResult> {
    const input = preprocess(image)
    const feeds: Record<string, ort.Tensor> = { input }
    const outputs = await this.session.run(feeds)
    const logits = outputs.logits.data as Float32Array

    const probabilities = softmax(logits)
    const bestIndex = argmax(probabilities)

    return {
      label: this.classes[bestIndex],
      confidence: probabilities[bestIndex],
    }
  }
}

function preprocess(image: ImageData | HTMLCanvasElement): ort.Tensor {
  const canvas = document.createElement('canvas')
  canvas.width = IMAGE_SIZE
  canvas.height = IMAGE_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('2D描画コンテキストを取得できません')
  }

  if (image instanceof HTMLCanvasElement) {
    ctx.drawImage(image, 0, 0, IMAGE_SIZE, IMAGE_SIZE)
  } else {
    ctx.putImageData(image, 0, 0)
  }

  const { data } = ctx.getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE)
  const chwData = new Float32Array(3 * IMAGE_SIZE * IMAGE_SIZE)
  const pixelCount = IMAGE_SIZE * IMAGE_SIZE

  for (let i = 0; i < pixelCount; i++) {
    const r = data[i * 4] / 255
    const g = data[i * 4 + 1] / 255
    const b = data[i * 4 + 2] / 255

    chwData[i] = (r - MEAN[0]) / STD[0]
    chwData[pixelCount + i] = (g - MEAN[1]) / STD[1]
    chwData[pixelCount * 2 + i] = (b - MEAN[2]) / STD[2]
  }

  return new ort.Tensor('float32', chwData, [1, 3, IMAGE_SIZE, IMAGE_SIZE])
}

function softmax(logits: Float32Array): Float32Array {
  const max = Math.max(...logits)
  const exps = logits.map((v) => Math.exp(v - max))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map((v) => v / sum)
}

function argmax(values: Float32Array): number {
  let bestIndex = 0
  let bestValue = values[0]
  for (let i = 1; i < values.length; i++) {
    if (values[i] > bestValue) {
      bestValue = values[i]
      bestIndex = i
    }
  }
  return bestIndex
}
