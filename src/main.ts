import './style.css'

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

async function startCamera(): Promise<void> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false,
    })
    video.srcObject = stream
    resultText.textContent = 'カメラ起動完了。翻訳結果はここに表示されます。'
  } catch (error) {
    resultText.textContent = 'カメラを起動できませんでした。カメラへのアクセスを許可してください。'
    console.error(error)
  }
}

void startCamera()
