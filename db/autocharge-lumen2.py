import pymongo
import pandas as pd

myclient = pymongo.MongoClient("mongodb://localhost:27017/")
mydb = myclient["lumen2"]

data = pd.read_excel('territorios-todo.xlsx', encoding='UTF8')

for i in data.index:
	inner_id     = str(int(data['inner_id'][i]))
	try:
		cuadra_id    = str(int(data['cuadra_id'][i]))
	except:
		cuadra_id    = "999"
	territorio   = str(int(data['territorio'][i]))
	manzana      = str(int(data['manzana'][i]))
	direccion    = str(data['dirección'][i])
	telefono     = str(data['teléfono'][i])
	estado       = str(data['estado'][i])

	vivienda = {"inner_id": inner_id, "cuadra_id": cuadra_id, "territorio": territorio, "manzana": manzana, "direccion": direccion, "telefono": telefono, "estado": estado}

	print("\n")
	print(vivienda)
	print("\n")
	mydb.viviendas.insert_one(vivienda)
