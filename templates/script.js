let currentSlide = 0;
var webcamStream;
const slides = document.querySelectorAll('.slide-item');
const slideContainer = document.getElementById('slide');
// Funcionalidad de la cámara
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const canvasCam = document.getElementById("canvasCam");
const captureButton = document.getElementById('takeSnapshot');
const lente = document.getElementById('lente');

function showSlide(n) {
    currentSlide = n;
    slideContainer.style.transform = `translateX(-${n * 100}%)`;
    for (let i = 0; i < slides.length; i++) {
        slides[i].classList.remove('active');
    }
    slides[n].classList.add('active');
    if (n === 0) {
        if (video.style.display != 'none') {
            startWebcam();
            captureButton.disabled = false;
            lente.style.display = 'initial';
        }
    } else {
        stopWebcam();
    }
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
}



function startWebcam() {
     if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        })
            .then(function (localMediaStream) {
                video.srcObject = localMediaStream;
                webcamStream = localMediaStream;
            })
            .catch(function (err) {
                captureButton.disabled = true;
                lente.style.display = 'none';
                console.log("Error: " + err);
            });
    } else {
        console.log("El navegador no soporta getUserMedia");
    }
}

function stopWebcam() {
    if (webcamStream) {
        let tracks = webcamStream.getTracks();
        tracks.forEach(track => track.stop());
    }
}

captureButton.addEventListener('click', () => {
    const videoAspectRatio = video.videoWidth / video.videoHeight;
    const canvasAspectRatio = canvasCam.width / canvasCam.height;
    if (video.style.display === 'none') {
        // Cambiar a modo captura
        video.style.display='initial';
        canvasCam.style.display='none';
        lente.style.borderRadius = '50%';
        lente.style.display = 'initial';
        startWebcam();
    }
    else {
        // Cambiar a modo visualización
        if (videoAspectRatio > canvasAspectRatio) {
            const scaleFactor = canvasCam.height / video.videoHeight;
            const newWidth = video.videoWidth * scaleFactor;
            const offsetX = (canvasCam.width - newWidth) / 2;
            canvasCam.getContext('2d').clearRect(0, 0, canvasCam.width, canvasCam.height);
            canvasCam.getContext('2d').drawImage(video, 0, 0, canvasCam.width, canvasCam.height);
            // canvasCam.getContext('2d').drawImage(video, offsetX, 0, newWidth, canvasCam.height);
        } else {
            const scaleFactor = canvasCam.width / video.videoWidth;
            const newHeight = video.videoHeight * scaleFactor;
            const offsetY = (canvasCam.height - newHeight) / 2;
            canvasCam.getContext('2d').clearRect(0, 0, canvasCam.width, canvasCam.height);
            canvasCam.getContext('2d').drawImage(video, 0, 0, canvasCam.width, canvasCam.height);
            // canvasCam.getContext('2d').drawImage(video, 0, offsetY, canvasCam.width, newHeight);
        }

        // canvasCam.width = video.videoWidth;
        // canvasCam.height = video.videoHeight;
        // canvasCam.getContext('2d').drawImage(video, 0, 0, canvasCam.width, canvasCam.height);
        video.style.display='none';
        canvasCam.style.display='initial';
        lente.style.display = 'initial';
        lente.style.borderRadius = '0%';
        stopWebcam();
    }
    // Aquí puedes enviar la imagen capturada (canvas.toDataURL())
});


// Funcionalidad de carga de archivos
const fileInput = document.getElementById('file-input');
const filePreview = document.getElementById('file-preview');

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        filePreview.src = e.target.result;
        filePreview.style.display = 'initial';
    }

    reader.readAsDataURL(file);
});

// Funcionalidad del botón enviar
const sendButton = document.getElementById('send-button');

sendButton.addEventListener('click', () => {
    if (slides[0].classList.contains('active')) {
        // Enviar imagen capturada (usar canvas.toDataURL())
        console.log('Enviando imagen capturada');
    } else if (slides[1].classList.contains('active')) {
        // Enviar archivo cargado (usar fileInput.files[0])
        console.log('Enviando archivo cargado');
    } else {
        // Enviar placa ingresada
        const plate = document.getElementById('plate-input').value;
        console.log('Enviando placa:', plate);
    }
});

// Mostrar el primer slide al cargar la página
showSlide(currentSlide);
