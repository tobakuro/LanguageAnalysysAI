import './style.css'
import { ImageClassifier } from './classifier'
import { labelToKana } from './kana'

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) {
  throw new Error('#app要素が見つかりません')
}

app.innerHTML = `
  <div id="camera-view">
    <video id="camera-preview" autoplay muted playsinline></video>
  </div>
  <div id="result-panel">
    <p id="result-text">カメラの起動を待っています...</p>
  </div>
`

const video = document.querySelector<HTMLVideoElement>('#camera-preview')!
const resultText = document.querySelector<HTMLParagraphElement>('#result-text')!

const CLASSIFY_INTERVAL_MS = 500

async function startCamera(): Promise<void> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' },
    audio: false,
  })
  video.srcObject = stream
  await video.play()
}

function captureFrame(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('2D描画コンテキストを取得できません')
  }
  ctx.drawImage(video, 0, 0)
  return canvas
}

function startClassifyLoop(soundClassifier: ImageClassifier): void {
  setInterval(() => {
    void (async () => {
      const started = performance.now()
      const frame = captureFrame()
      const result = await soundClassifier.classify(frame)
      const elapsedMs = performance.now() - started

      const kana = labelToKana(result.label)
      const confidencePercent = Math.round(result.confidence * 100)
      resultText.textContent = `${kana}（確信度 ${confidencePercent}% / ${elapsedMs.toFixed(0)}ms）`
    })()
  }, CLASSIFY_INTERVAL_MS)
}

async function main(): Promise<void> {
  try {
    resultText.textContent = 'モデルを読み込んでいます...'
    const soundClassifier = await ImageClassifier.load(
      '/models/sound.onnx',
      '/models/sound_classes.json',
    )

    resultText.textContent = 'カメラの起動を待っています...'
    await startCamera()

    resultText.textContent = '解析中...'
    startClassifyLoop(soundClassifier)
  } catch (error) {
    resultText.textContent = '初期化に失敗しました。カメラへのアクセスを許可してください。'
    console.error(error)
  }
}

void main()
