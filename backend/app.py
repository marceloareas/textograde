from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
from routes.general import general_bp
from routes.user import user_bp
from routes.tema import tema_bp
from routes.redacao import redacao_bp
from flasgger import Swagger

# Carregar variáveis do .env
load_dotenv()

app = Flask(__name__)
swagger = Swagger(app, template_file='docs/doc.yml')
CORS(app)


# Configuração do JWT
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "chave_secreta_padrao")
jwt = JWTManager(app)

# Configurar o cliente MongoDB
mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client["textgrader"]

# Inicializar rotas de livre acesso (sem autenticação)
app.register_blueprint(general_bp)

app.register_blueprint(user_bp)
app.register_blueprint(tema_bp, url_prefix="/tema")
app.register_blueprint(redacao_bp, url_prefix="/redacao")

if __name__ == '__main__':
    debug = True
    app.run(host='0.0.0.0', port=5000, debug=True)
