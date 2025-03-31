from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from pymongo import MongoClient
import os
from bson import ObjectId

tema_bp = Blueprint('tema', __name__)

mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri)
db = client.textgrader

# Função para verificar permissões do usuário (somente admin ou professor)
def check_user_permission(current_user):
    """
    Verifica se o usuário é admin ou professor.
    """
    return current_user["tipoUsuario"] in ["admin", "professor"]

# Função para verificar se o professor está tentando modificar seus próprios temas
def is_own_tema(current_user, tema):
    """
    Verifica se o tema pertence ao professor autenticado.
    """
    return tema["nome_professor"] == current_user["username"]  # Assumindo que o nome do professor está no JWT e no tema

# Rota para pegar todos os temas (acessível por todos os usuários)
@tema_bp.get("/")
@jwt_required()
def get_temas():
    """
    Retorna todos os temas.
    """
    temas_collection = db.temas
    temas = list(temas_collection.find())
    for tema in temas:
        tema['_id'] = str(tema['_id'])
    return jsonify(temas)

# Rota para pegar uma redação por ID (acessível por todos os usuários)
@tema_bp.get("/<id>")
@jwt_required()
def get_tema_by_id(id):
    temas_collection = db.temas
    tema = temas_collection.find_one({"_id": ObjectId(id)})
    if tema:
        tema['_id'] = str(tema['_id'])
        return jsonify(tema)
    else:
        return jsonify({"error": "Tema não encontrada"}), 404
    
# Rota para criar um novo tema (somente admin ou professor pode criar)
@tema_bp.post("/")
@jwt_required()
def create_tema():
    """
    Cria um novo tema, somente permitido para admin ou professor.
    """
    try:
        # Obtém o usuário autenticado do token JWT
        current_user_email = get_jwt_identity()
        current_user = db.users.find_one({"email": current_user_email})

        # Verifica se o usuário tem permissão para criar o tema (admin ou professor)
        if not check_user_permission(current_user):
            return jsonify({"error": "Apenas administradores ou professores podem criar temas."}), 403

        # Recebe os dados do tema (nome e descrição)
        tema_data = request.json
        tema = tema_data.get('tema')
        descricao = tema_data.get('descricao')

        # Verifica se todos os campos necessários foram preenchidos
        if not tema or not descricao:
            return jsonify({"error": "Tema e descrição do tema são obrigatórios."}), 400

        # Criação do tema
        tema = {
            "tema": tema,
            "descricao": descricao,
            "nome_professor": current_user["username"], 
            "email_professor": current_user["email"] 
        }

        # Insere o tema no banco de dados
        db.temas.insert_one(tema)

        return jsonify({"message": "Tema criado com sucesso!"}), 201

    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500

# Rota para atualizar um tema (somente admin ou professor pode atualizar)
@tema_bp.put("/<_id>")
@jwt_required()
def update_tema(_id):
    try:
        # Obtém o usuário autenticado do token JWT
        current_user_email = get_jwt_identity()
        current_user = db.users.find_one({"email": current_user_email})

        # Verifica se o usuário tem permissão para atualizar o tema
        if not check_user_permission(current_user):
            return jsonify({"error": "Apenas administradores ou professores podem atualizar temas."}), 403

        # Converte _id para ObjectId
        _id = ObjectId(_id)

        # Busca o tema pelo ID
        tema = db.temas.find_one({"_id": _id})
        if not tema:
            return jsonify({"error": "Tema não encontrado."}), 404

        # Verifica se o professor está tentando atualizar seu próprio tema
        if not is_own_tema(current_user, tema):
            return jsonify({"error": "Você não tem permissão para editar este tema."}), 403

        # Recebe os dados do tema para atualização
        tema_data = request.json
        tema = tema_data.get('tema')
        descricao = tema_data.get('descricao')

        # Verifica se pelo menos um campo foi passado para atualização
        if not tema and not descricao:
            return jsonify({"error": "Pelo menos o tema ou a descrição devem ser fornecidos para atualização."}), 400

        # Atualiza os campos do tema
        update_fields = {}
        if tema:
            update_fields['tema'] = tema
        if descricao:
            update_fields['descricao'] = descricao

        # Atualiza o tema no banco de dados
        db.temas.update_one({"_id": _id}, {"$set": update_fields})

        return jsonify({"message": "Tema atualizado com sucesso!"}), 200

    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500

@tema_bp.delete("/<_id>")
@jwt_required()
def delete_tema(_id):
    try:
        # Obtém o usuário autenticado do token JWT
        current_user_email = get_jwt_identity()
        current_user = db.users.find_one({"email": current_user_email})

        # Verifica se o usuário tem permissão para deletar o tema
        if not check_user_permission(current_user):
            return jsonify({"error": "Apenas administradores ou professores podem deletar temas."}), 403

        # Converte _id para ObjectId
        _id = ObjectId(_id)

        # Busca o tema pelo ID
        tema = db.temas.find_one({"_id": _id})
        if not tema:
            return jsonify({"error": "Tema não encontrado."}), 404

        # Verifica se o professor está tentando deletar seu próprio tema
        if not is_own_tema(current_user, tema):
            return jsonify({"error": "Você não tem permissão para deletar este tema."}), 403

        # Deleta o tema do banco de dados
        db.temas.delete_one({"_id": _id})

        return jsonify({"message": "Tema deletado com sucesso!"}), 200

    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500
