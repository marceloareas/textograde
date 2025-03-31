from flask import Blueprint, jsonify, request
from pymongo import MongoClient
from flask_jwt_extended import jwt_required, get_jwt_identity
import os

user_bp = Blueprint('user', __name__)

mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri)
db = client.textgrader

# Função para verificar permissões
def check_user_permission(current_user, required_role):
    """
    Verifica se o usuário tem a permissão necessária.
    """
    if required_role == "admin":
        return current_user["tipoUsuario"] == "admin"
    elif required_role == "professor":
        return current_user["tipoUsuario"] in ["admin", "professor"]
    elif required_role == "aluno":
        return current_user["tipoUsuario"] == "aluno"
    return False

# Rota para pegar os alunos
@user_bp.get("/alunos")
@jwt_required()
def get_alunos():
    # Obtém as informações do usuário autenticado
    current_user = get_jwt_identity()

    # Verifica se o usuário tem permissão para acessar os dados (se for admin ou professor)
    if not check_user_permission(current_user, "professor"):
        return jsonify({"message": "Você não tem permissão para acessar essa rota."}), 403

    # Filtra alunos
    users_collection = db.users
    alunos = list(users_collection.find({"tipoUsuario": "aluno"}))

    for aluno in alunos:
        aluno['_id'] = str(aluno['_id']) 
        aluno.pop('password', None)

    return jsonify(alunos)

# Rota para pegar os professores
@user_bp.get("/professores")
@jwt_required()
def get_profs():
    # Obtém as informações do usuário autenticado
    current_user = get_jwt_identity()

    # Verifica se o usuário tem permissão para acessar os dados (se for admin ou professor)
    if not check_user_permission(current_user, "professor"):
        return jsonify({"message": "Você não tem permissão para acessar essa rota."}), 403

    # Filtra professores
    users_collection = db.users
    professores = list(users_collection.find({"tipoUsuario": "professor"}))

    for professor in professores:
        professor['_id'] = str(professor['_id']) 
        professor.pop('password', None)

    return jsonify(professores)

# Rota para pegar dados do usuário autenticado (exemplo)
@user_bp.get("/me")
@jwt_required()
def get_me():
    # Obtém as informações do usuário autenticado
    current_user = get_jwt_identity()

    # Busca o usuário no banco de dados usando o ID do JWT
    users_collection = db.users
    user = users_collection.find_one({"_id": current_user["id"]})

    if user:
        user['_id'] = str(user['_id']) 
        user.pop('password', None)  # Remove a senha do retorno
        return jsonify(user)
    
    return jsonify({"message": "Usuário não encontrado"}), 404
