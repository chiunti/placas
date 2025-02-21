let currentSlide = 1;
var webcamStream;
const slides = document.querySelectorAll('.slide-item');
const slideContainer = document.getElementById('slide');
// Funcionalidad de la cámara
const video = document.getElementById('video');
const canvasCam = document.getElementById("canvasCam");
const canvasImg = document.getElementById('canvasImg');
const captureButton = document.getElementById('takeSnapshot');
const lente = document.getElementById('lente');
const sendButton = document.getElementById('send-button');
const canvasToSend = document.createElement('canvas');

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
        sendButton.disabled = canvasCam.style.display === 'none';
    } else {
        stopWebcam();
        if (n === 1) {
            sendButton.disabled = canvasImg.style.display === 'none';
        }
        if (n === 2) {
            sendButton.disabled = false;
        }
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
            video: {
                facingMode: "environment"
            }
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

function setCapture(mode) {
    if (mode === 'on') {
        // Cambiar a modo captura
        video.style.display = 'initial';
        canvasCam.style.display = 'none';
        lente.style.borderRadius = '50%';
        lente.style.display = 'initial';
        sendButton.disabled = true;
        startWebcam();
    }
    else if (mode === 'off') {
        // Cambiar a modo normal
        video.style.display = 'none';
        canvasCam.style.display = 'initial';
        lente.style.display = 'initial';
        lente.style.borderRadius = '0%';
        sendButton.disabled = false;
        stopWebcam();
    }
}


function showCamPreview() {
    const videoAspectRatio = video.videoWidth / video.videoHeight;
    const canvasAspectRatio = canvasCam.width / canvasCam.height;

    let scaledWidth, scaledHeight;

    if (videoAspectRatio > canvasAspectRatio) {
        scaledWidth = canvasCam.width;
        scaledHeight = scaledWidth / videoAspectRatio;
    } else {
        scaledHeight = canvasCam.height;
        scaledWidth = scaledHeight * videoAspectRatio * 1.5;
    }

    const x = (canvasCam.width - scaledWidth) / 2;
    const y = (canvasCam.height - scaledHeight) / 2;

    canvasCam.getContext('2d').clearRect(0, 0, canvasCam.width, canvasCam.height);
    canvasCam.getContext('2d').drawImage(video, x, y, scaledWidth, scaledHeight);

}

function showFilePreview(img) {
    const ImageAspectRatio = img.width / img.height;
    const canvasAspectRatio = canvasImg.width / canvasImg.height;

    let scaledWidth, scaledHeight;

    if (ImageAspectRatio > canvasAspectRatio) {
        scaledWidth = canvasImg.width;
        scaledHeight = scaledWidth / ImageAspectRatio;
    } else {
        scaledHeight = canvasImg.height;
        scaledWidth = scaledHeight * ImageAspectRatio;
    }

    const x = (canvasImg.width - scaledWidth) / 2;
    const y = (canvasImg.height - scaledHeight) / 2;

    canvasImg.getContext('2d').clearRect(0, 0, canvasImg.width, canvasImg.height);
    canvasImg.getContext('2d').drawImage(img, x, y, scaledWidth, scaledHeight);

    // Mostrar el canvas
    canvasImg.style.display = 'initial';
    sendButton.disabled = false;

}

function hideFilePreview() {
    canvasImg.style.display = 'none';
    sendButton.disabled = true;
}

function saveVideoToCanvasToSend() {
    canvasToSend.width = video.videoWidth;
    canvasToSend.height = video.videoHeight;

    // Dibuja el frame actual del video en el canvas
    canvasToSend.getContext('2d').drawImage(video, 0, 0, canvasToSend.width, canvasToSend.height);
}

// function saveFileToCanvasToSend(img) {
//     canvasToSend.width = img.width;
//     canvasToSend.height = img.height;

//     // Dibuja la imagen en el canvas
//     canvasToSend.getContext('2d').drawImage(img, 0, 0, canvasToSend.width, canvasToSend.height);
// }


captureButton.addEventListener('click', () => {
    if (video.style.display === 'none') {
        setCapture('on');
    }
    else {
        saveVideoToCanvasToSend();
        showCamPreview();
        setCapture('off');
    }
});


// Funcionalidad de carga de archivos
const fileInput = document.getElementById('file-input');
// const filePreview = document.getElementById('file-preview');
const imageInput = document.getElementById('image-input');
const uploadFileForm = document.getElementById('upload-file-form');
const uploadPlateForm = document.getElementById('upload-plate-form');
const uploadImageForm = document.getElementById('upload-image-form');

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // saveFileToCanvasToSend(img);
                showFilePreview(img);
            };
            img.src = e.target.result;
        };

        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecciona una imagen.');
            fileInput.value = ''; // Limpia el input
            hideFilePreview();
            return;
        }

        reader.readAsDataURL(file);
    } else {
        // Si no se selecciona ningún archivo, ocultar el canvas
        hideFilePreview();
    }
});

// Funcionalidad del botón enviar
sendButton.addEventListener('click', () => {
    if (slides[0].classList.contains('active')) {
        // Enviar imagen capturada
        // Convertir la imagen del canvas a un archivo Blob
        canvasToSend.toBlob(function(blob) {
            // Crear un archivo File desde el Blob
            const file = new File([blob], 'imagen.png', { type: 'image/png' });

            // Crear un DataTransfer para asignar el archivo al input file
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            imageInput.files = dataTransfer.files;

            // Enviar el formulario
            uploadImageForm.submit();
        }, 'image/png');
    } else if (slides[1].classList.contains('active')) {
        // Enviar archivo cargado
        uploadFileForm.submit();
    } else {
        // Enviar placa ingresada
        uploadPlateForm.submit();
    }
    return;
});

// Mostrar el primer slide al cargar la página
showSlide(currentSlide);
