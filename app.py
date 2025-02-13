from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
  return render_template('index.html')

@app.route('/buscar', methods=['POST'])
def buscar():
    vehiculo = {}
    msj = ''
    placa = request.form.get('plate')
    image = request.form.get('image')
    file = request.form.get('file')

    if placa:
        vehiculo['placa'] = placa
        vehiculo = {'placa': placa, 'marca': 'placa', 'modelo': 'placa'}
    
    if image:
        vehiculo = {'placa': 'imagen', 'marca': 'imagen', 'modelo': 'imagen'}
    
    if file:
        print(type(file), file)
        vehiculo = {'placa': 'archivo', 'marca': 'archivo', 'modelo': 'archivo'}
       
    if vehiculo == {}:
        msj = 'No se encontraron resultados para la placa ingresada.'
        vehiculo = {'placa': '', 'marca': '', 'modelo': ''}

    return render_template('buscar.html', vehiculo=vehiculo, msj=msj, image=image)


if __name__ == '__main__':
  app.run()