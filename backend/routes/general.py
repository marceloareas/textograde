from flask import Blueprint, request, jsonify
from pymongo import MongoClient, errors
from flask_jwt_extended import create_access_token, jwt_required, get_jwt, get_jwt_identity, JWTManager
import bcrypt
import os
from datetime import timedelta

# Blueprint para rotas gerais
general_bp = Blueprint('general', __name__)

# Configuração do MongoDB
mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri)
db = client.textgrader

# Configuração JWT
jwt = JWTManager()
blacklist = set()  # Em produção, use uma solução persistente (Redis, DB, etc.)

@jwt.token_in_blocklist_loader
def check_if_token_in_blacklist(jwt_header, jwt_payload):
    """
    Callback para verificar se um token está na blacklist.
    """
    jti = jwt_payload["jti"]
    return jti in blacklist

# Testa a conexão com o MongoDB
@general_bp.route("/", methods=["GET"])
def connection():
    try:
        client.admin.command('ping')  # Teste de conexão
        return jsonify({"message": "Conexão com MongoDB bem-sucedida!"}), 200
    except Exception as e:
        return jsonify({"error": f"Erro ao conectar ao MongoDB: {str(e)}"}), 500

# Rota de registro de usuários
@general_bp.route("/register", methods=["POST"])
def register():
    try:
        user_data = request.json
        email = user_data.get('email')
        username = user_data.get('nomeUsuario')
        password = user_data.get('password')

        if not email or not username or not password:
            return jsonify({"error": "Preencha todos os campos obrigatórios"}), 400

        # Validação de senha
        if len(password) < 8:
            return jsonify({"error": "A senha deve ter no mínimo 8 caracteres"}), 400

        # Verifica duplicidade de email ou username
        if db.users.find_one({"email": email}):
            return jsonify({"error": "Email já está cadastrado"}), 400
        if db.users.find_one({"username": username}):
            return jsonify({"error": "Nome de usuário já está cadastrado"}), 400

        # Hash da senha
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Criação do usuário no banco
        db.users.insert_one({
            "email": email,
            "username": username,
            "password": hashed_password,
            "tipoUsuario": user_data.get('tipoUsuario', 'usuario')
        })

        return jsonify({"message": "Usuário registrado com sucesso!"}), 201
    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500

# Rota de login de usuários
@general_bp.route("/login", methods=["POST"])
def login():
    try:
        user_data = request.json
        email = user_data.get('email')
        password = user_data.get('password')

        if not email or not password:
            return jsonify({"error": "Email e senha são obrigatórios"}), 400

        user = db.users.find_one({"email": email})

        # Verifica se o usuário existe e a senha está correta
        if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            return jsonify({"error": "Email ou senha inválidos"}), 401

        # Criação do token JWT com expiração
        access_token = create_access_token(identity=user['email'], expires_delta=timedelta(hours=1))
        return jsonify({
            "access_token": access_token,
            "tipoUsuario": user.get('tipoUsuario', 'usuario'),
            "nomeUsuario": user.get('username')
        }), 200
    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500

# Rota de logout
@general_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    try:
        token = get_jwt()
        jti = token["jti"]
        blacklist.add(jti)
        return jsonify({"message": "Logout efetuado com sucesso!"}), 200
    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500

# Rota para obter os dados do usuário autenticado
@general_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    try:
        # Obtém o token JWT da requisição
        current_user_email = get_jwt_identity()

        # Busca o usuário no banco de dados com base no email do token
        user = db.users.find_one({"email": current_user_email})

        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404

        # Retorna as informações do usuário
        return jsonify({
            "nomeUsuario": user.get('username'),
            "tipoUsuario": user.get('tipoUsuario')
        }), 200

    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500
