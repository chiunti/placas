import io
import json
import google.generativeai as genai
import os
import base64
from io import BytesIO
from PIL import Image

api_key = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel("models/gemini-2.0-flash-exp",
                              generation_config={"response_mime_type": "application/json"})


def base64_a_imagen(data_uri):
    """
    Convierte una cadena data:image/png;base64 a un objeto de imagen PIL.
    """
    # Separa la parte base64 de la cadena URI
    _, contenido = data_uri.split('base64,')
    
    # Decodifica la cadena base64
    imagen_decodificada = base64.b64decode(contenido)
    
    # Abre la imagen desde los datos decodificados
    imagen = Image.open(BytesIO(imagen_decodificada))
    return imagen



def get_placa_from_base64(image_base64):
    image = base64_a_imagen(image_base64)
    return get_placa_from_image(image)


def get_placa_from_image(image):
    prompt ="""## Instrucciones
1. **Recibir imagen:** El modelo recibirá una imagen de un vehículo.
2. **Analizar imagen:** El modelo analizará la imagen para identificar la placa del vehículo, la marca y el modelo.
3. **Generar JSON:** El modelo generará un objeto JSON con la siguiente estructura:
```json
{
"placa": "XXXXXXX",
"marca": "XXXXXXX",
"modelo": "XXXXXXX"
}
Valores por defecto:
Si no se encuentra una placa en la imagen, el valor de "placa" debe ser "-".
Si no se puede identificar la marca del vehículo, el valor de "marca" debe ser "-".
Si no se puede identificar el modelo del vehículo, el valor de "modelo" debe ser "-".
Si solo hay un elemento en el array de resultado, solo devolver el primer elemento.
"""
    # Simulate a response from the API
    if prompt != "":
        response = model.generate_content([prompt, image])
    else:
        response = model.generate_content(image)

    return json.loads(response.text)


def get_placa_from_file(image_bytes):
    image = blob_to_image(image_bytes)
    return get_placa_from_image(image)

def blob_to_image(blob):
    return Image.open(BytesIO(blob))