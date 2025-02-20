let currentSlide = 1;
var webcamStream;
const slides = document.querySelectorAll('.slide-item');
const slideContainer = document.getElementById('slide');
// Funcionalidad de la cámara
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const canvasCam = document.getElementById("canvasCam");
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
        video.style.display='initial';
        canvasCam.style.display='none';
        lente.style.borderRadius = '50%';
        lente.style.display = 'initial';
        sendButton.disabled = true;
        startWebcam();
    }
    else if (mode === 'off') {
          // Cambiar a modo normal
        video.style.display='none';
        canvasCam.style.display='initial';
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
        scaledWidth = scaledHeight * videoAspectRatio *1.5;
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

function saveVideoToCanvasToSend(){
    canvasToSend.width = video.videoWidth;
    canvasToSend.height = video.videoHeight;

    // Dibuja el frame actual del video en el canvas
    canvasToSend.getContext('2d').drawImage(video, 0, 0, canvasToSend.width, canvasToSend.height);
}

function saveFileToCanvasToSend(img){
    canvasToSend.width = img.width;
    canvasToSend.height = img.height;

    // Dibuja la imagen en el canvas
    canvasToSend.getContext('2d').drawImage(img, 0, 0, canvasToSend.width, canvasToSend.height);
}


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
const filePreview = document.getElementById('file-preview');
const canvasImg = document.getElementById('canvasImg');

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
  
    if (file) {
      const reader = new FileReader();
  
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            saveFileToCanvasToSend(img);
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

/* fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        filePreview.src = e.target.result;
        filePreview.style.display = 'initial';
        sendButton.disabled = false;
    }

    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona una imagen.');
        fileInput.value = ''; // Limpia el input
        filePreview.style.display = 'none';
        sendButton.disabled = true;
        return;
    }

    reader.readAsDataURL(file);
}); */

// Funcionalidad del botón enviar
sendButton.addEventListener('click', () => {
    const form = document.createElement('form');
    const input = document.createElement('input');
    form.method = 'POST';
    form.action = '/';
    const compressedStream = new Response(
        new Blob([canvasToSend.toDataURL('image/png')]).stream().pipeThrough(new CompressionStream('gzip')) );

    if (slides[0].classList.contains('active')) {
        // Enviar imagen capturada (usar canvas.toDataURL())
        console.log('image')
        // form.enctype = 'application/x-www-form-urlencoded';
        input.type = 'image';
        input.name = 'image';
        input.value = canvasToSend.toDataURL('image/png');
    } else if (slides[1].classList.contains('active')) {
        // Enviar archivo cargado (usar fileInput.files[0])
        form.enctype = 'multipart/form-data';
        input.type = 'blob';
        input.name = 'file';
        input.hidden = true;
        canvasToSend.toBlob( (blob) => {
            input.value = blob;
            form.appendChild(input);
            document.body.appendChild(form);
            form.submit();
        }, 'image/png' );
        return;
        // sendLargeBinary(canvasToSend.toDataURL('image/png'), '/');
 
    } else {
        // Enviar placa ingresada
        const plate = document.getElementById('plate-input').value;
        form.enctype = 'multipart/form-data';
        input.type = 'hidden';
        input.name = 'plate';
        input.value = plate;
    }

    // enviar el formulario
    // form.append(input);
    // form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
});

async function sendLargeBinary(binaryText, endpoint, chunkSize = 1024 * 1024) { // 1MB por chunk
    const totalChunks = Math.ceil(binaryText.length / chunkSize);
    
    for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const chunk = binaryText.slice(start, start + chunkSize);
        
        const formData = new FormData();
        const blob = new Blob([chunk], { type: 'application/octet-stream' });
        formData.append('chunk', blob);
        formData.append('index', i);
        formData.append('total', totalChunks);
        formData.append('id', Date.now()); // Identificador único para la sesión
        
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) throw new Error('Error en chunk ' + i);
        } catch (error) {
            console.error('Error enviando chunk:', error);
            throw error;
        }
    }
    console.log('Envío completo');
}

function comprimirBase64(base64String) {
    const decoded = atob(base64String);
    const data = new Uint8Array(decoded.split('').map(char => char.charCodeAt(0)));
    const compressed = pako.gzip(data); // o pako.deflate(data)
    const compressedBase64 = btoa(String.fromCharCode.apply(null, compressed));
    return compressedBase64;
}

// Mostrar el primer slide al cargar la página
showSlide(currentSlide);
