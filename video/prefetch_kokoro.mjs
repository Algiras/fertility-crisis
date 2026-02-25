import { pipeline } from '@huggingface/transformers';
async function prefetch() {
  console.log("Downloading Kokoro ONNX model to cache...");
  let lastPct = -1;
  await pipeline('text-to-speech', 'onnx-community/Kokoro-82M-v1.0-ONNX', {
    dtype: 'fp32',
    progress_callback: (info) => {
      if (info.status === 'progress' && info.progress) {
        const p = Math.floor(info.progress);
        if (p % 10 === 0 && p !== lastPct) {
          console.log(`Downloading ${info.file}: ${p}%`);
          lastPct = p;
        }
      } else if (info.status === 'ready') {
         console.log(`Ready: ${info.file}`);
      }
    }
  });
  console.log("Model downloaded successfully!");
}
prefetch().catch(console.error);
