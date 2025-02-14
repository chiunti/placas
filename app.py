from flask import Flask, render_template, request, jsonify
from src.func import blob_to_image, get_placa_from_base64, get_placa_from_file, get_placa_from_image
from dotenv import load_dotenv

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

        print('archivos:', request.files)
        print('placa:', placa, ', image:',image, ', file:', file)

        if 'file' in request.files:
            fileimg = request.files['file'].read()
            preview = blob_to_image(fileimg)
            vehiculo = get_placa_from_image(preview)

        if placa:
            vehiculo['placa'] = placa
            vehiculo = {'placa': placa, 'marca': 'placa', 'modelo': 'placa'}
        
        if image:
            preview = image
            vehiculo = get_placa_from_base64(image)
        
        if file:
            file = request.files['file'].read()
            preview = file
            vehiculo = get_placa_from_base64(file)
        
        if vehiculo == {}:
            msj = 'No se encontraron resultados para la placa ingresada.'
            vehiculo = {'placa': '', 'marca': '', 'modelo': ''}

        if isinstance(vehiculo, list):
            msj = "Verifica que solo hay un vehiculo en la imagen"
            vehiculo = {'placa': '', 'marca': '', 'modelo': ''}

        return render_template('buscar.html', vehiculo=vehiculo, msj=msj, image=preview)


if __name__ == '__main__':
  app.run(debug=True, host='0.0.0.0', port=5000, ssl_context=('cert/win.crt', 'cert/win.key'))