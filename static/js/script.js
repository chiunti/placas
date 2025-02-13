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
const sendButton = document.getElementById('send-button');

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
            sendButton.disabled = filePreview.style.display === 'none';
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

captureButton.addEventListener('click', () => {
    const videoAspectRatio = video.videoWidth / video.videoHeight;
    const canvasAspectRatio = canvasCam.width / canvasCam.height;

    let scaledWidth, scaledHeight;

    if (video.style.display === 'none') {
        // Cambiar a modo captura
        video.style.display='initial';
        canvasCam.style.display='none';
        lente.style.borderRadius = '50%';
        lente.style.display = 'initial';
        sendButton.disabled = true;
        startWebcam();
    }
    else {
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

        video.style.display='none';
        canvasCam.style.display='initial';
        lente.style.display = 'initial';
        lente.style.borderRadius = '0%';
        sendButton.disabled = false;
        stopWebcam();
    }
    // Aquí puedes enviar la imagen capturada (canvas.toDataURL())
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
          // Dibujar la imagen en el canvas
          canvasImg.getContext('2d').drawImage(img, 0, 0);
  
          // Mostrar el canvas
          canvasImg.style.display = 'block';
        };
        img.src = e.target.result;
      };
  
      reader.readAsDataURL(file);
    } else {
      // Si no se selecciona ningún archivo, ocultar el canvas
      canvasImg.style.display = 'none';
      // Limpiar el canvas (opcional)
      canvasImg.getContext('2d').clearRect(0, 0, canvasImg.width, canvasImg.height);
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
    let data = {};

    if (slides[0].classList.contains('active')) {
        // Enviar imagen capturada (usar canvas.toDataURL())
        console.log('Enviando imagen capturada');
        data.type = 'image';
        data.value = canvasCam.toDataURL();
    } else if (slides[1].classList.contains('active')) {
        // Enviar archivo cargado (usar fileInput.files[0])
        console.log('Enviando archivo cargado');
        data.type = 'file';
        data.value = filePreview.toDataURL();
        // data.value = fileInput.files[0];
    } else {
        // Enviar placa ingresada
        const plate = document.getElementById('plate-input').value;
        console.log('Enviando placa:', plate);
        data.type = 'plate';
        data.value = plate;
    }

    // enviar el formulario
    form.method = 'POST';
    form.action = '/buscar';
    input.type = 'hidden';
    input.name = data.type;
    input.value = data.value;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();


    sendData(data);
});





// Mostrar el primer slide al cargar la página
showSlide(currentSlide);
