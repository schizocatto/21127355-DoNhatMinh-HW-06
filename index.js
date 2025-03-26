// Lấy tham chiếu đến thẻ video và canvas
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const width = 1280, height = 720;

// Khi video chạy, xử lý từng frame
video.addEventListener('play', function () {
    function processFrame() {
        ctx.drawImage(video, 0, 0, width, height);
        applyEdgeDetection(ctx, width, height);
        requestAnimationFrame(processFrame);
    }
    requestAnimationFrame(processFrame);
});

function applyEdgeDetection(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const grayscale = new Uint8ClampedArray(width * height);

    // Chuyển ảnh sang grayscale
    for (let i = 0; i < data.length; i += 4) {
        grayscale[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }

    // Áp dụng Sobel
    const sobelData = new Uint8ClampedArray(width * height);
    let maxMagnitude = 0;
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            const gx =
                -grayscale[idx - width - 1] + grayscale[idx - width + 1]
                - 2 * grayscale[idx - 1] + 2 * grayscale[idx + 1]
                - grayscale[idx + width - 1] + grayscale[idx + width + 1];

            const gy =
                -grayscale[idx - width - 1] - 2 * grayscale[idx - width] - grayscale[idx - width + 1]
                + grayscale[idx + width - 1] + 2 * grayscale[idx + width] + grayscale[idx + width + 1];

            const magnitude = Math.sqrt(gx * gx + gy * gy);
            maxMagnitude = Math.max(maxMagnitude, magnitude);
            sobelData[idx] = magnitude;
        }
    }

    const contrastFactor = 1.5; // Tăng độ đậm
    for (let i = 0; i < sobelData.length; i++) {
        let val = (sobelData[i] / maxMagnitude) * 255 * contrastFactor;
        val = Math.min(255, val); // Giới hạn max 255
        data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = val;
        data[i * 4 + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
}
