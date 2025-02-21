from flask import Flask, render_template, request
from dotenv import load_dotenv
from src.func import (get_placa_from_image,
                      blob_to_image,
                      image_to_base64,
                      stream_to_image,
                      imagebytes_to_base64)


load_dotenv()
app = Flask(__name__)


@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'GET':
        return render_template('index.html')

    if request.method == 'POST':
        vehiculo = {}
        msj = ''
        placa = request.form.get('plate')
        image = request.form.get('image')
        file = request.form.get('file')
        preview = None

        if 'file' in request.files:
            try:
                fileimg = request.files['file'].read()
                preview = image_to_base64(fileimg)
                vehiculo = get_placa_from_image(blob_to_image(fileimg))
            except Exception as e:
                print(e)

        if 'image' in request.files:
            try:
                # Leer la imagen directamente desde la memoria
                fileimg = stream_to_image(request.files['image'].stream)
                preview = imagebytes_to_base64(fileimg)
                vehiculo = get_placa_from_image(fileimg)
            except Exception as e:
                print(e)

        if placa:
            vehiculo['placa'] = placa
            vehiculo = {'placa': placa, 'marca': 'placa', 'modelo': 'placa'}

        if vehiculo == {}:
            msj = 'No se encontraron.'
            vehiculo = {'placa': '', 'marca': '', 'modelo': ''}

        if isinstance(vehiculo, list):
            msj = "Verifica que solo hay un vehiculo en la imagen"
            vehiculo = {'placa': '', 'marca': '', 'modelo': ''}

        return render_template(
            'buscar.html', vehiculo=vehiculo, msj=msj, image=preview
        )


if __name__ == '__main__':
    app.run(debug=True,
            host='0.0.0.0',
            port=5000,
            ssl_context=('cert/cert.pem', 'cert/key.pem'))
