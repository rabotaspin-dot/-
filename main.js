const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 640;
canvas.height = 480;

// Запуск камеры
async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve();
        };
    });
}

// Рисуем линии между точками (скелет)
function drawSkeleton(landmarks) {
    // Связи между точками (индексы)
    const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],       // большой палец
        [0, 5], [5, 6], [6, 7], [7, 8],       // указательный
        [0, 9], [9, 10], [10, 11], [11, 12],  // средний
        [0, 13], [13, 14], [14, 15], [15, 16],// безымянный
        [0, 17], [17, 18], [18, 19], [19, 20] // мизинец
    ];

    ctx.lineWidth = 4;
    ctx.strokeStyle = "lime";

    connections.forEach(([a, b]) => {
        const [x1, y1] = landmarks[a];
        const [x2, y2] = landmarks[b];

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    });
}

// Рисуем точки
function drawKeypoints(predictions) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    predictions.forEach(pred => {
        const landmarks = pred.landmarks;

        // рисуем линии
        drawSkeleton(landmarks);

        // рисуем точки
        for (let i = 0; i < landmarks.length; i++) {
            const [x, y] = landmarks[i];

            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.fillStyle = "red";
            ctx.fill();

            // номер точки (чтобы видно было что за сустав)
            ctx.fillStyle = "white";
            ctx.font = "12px Arial";
            ctx.fillText(i, x + 8, y + 4);
        }
    });
}

// Запуск трекинга
async function run() {
    await startCamera();

    const model = await handpose.load();

    async function detect() {
        const predictions = await model.estimateHands(video);

        if (predictions.length > 0) {
            drawKeypoints(predictions);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        requestAnimationFrame(detect);
    }

    detect();
}

run();