from io import BytesIO
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from pymongo import MongoClient
from bson import ObjectId
import os
from functions import persist_essay, get_text, read_text_from_image

redacao_bp = Blueprint('redacao', __name__)

mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri)
db = client.textgrader

# Função para verificar permissões do usuário (somente aluno e admin podem criar, alterar ou excluir)
def check_user_permission(current_user):
    """
    Verifica se o usuário é admin ou aluno.
    """
    return current_user["tipoUsuario"] in ["admin", "professor", "aluno"]

# Função para validar o ID do tema
def validate_tema(id_tema):
    """
    Verifica se o tema existe na coleção de temas.
    """
    try:
        tema = db.temas.find_one({"_id": ObjectId(id_tema)})
        return tema is not None
    except Exception as e:
        return False

# Função simulada de avaliação (substitua pela sua real)
def evaluate_redacao(texto):
    # Simulando notas para teste
    return {
        "nota_1": 40,
        "nota_2": 80,
        "nota_3": 120,
        "nota_4": 160,
        "nota_5": 200
    }

# Função para verificar se a redação pertence ao aluno autenticado
def is_own_redacao(current_user, redacao):
    """
    Verifica se a redação pertence ao aluno autenticado.
    """
    return redacao["aluno"] == current_user["username"] 

# Rota para pegar todas as redações (acessível por todos os usuários)
@redacao_bp.get("/")
@jwt_required()
def get_redacoes():
    """
    Retorna todas as redações, com a opção de filtrar por aluno.
    """
    redacoes_collection = db.redacoes

    # Obtém o usuário autenticado do token JWT
    current_user_email = get_jwt_identity()
    current_user = db.users.find_one({"email": current_user_email})

    if current_user["tipoUsuario"] == "aluno":
        redacoes = list(redacoes_collection.find({"aluno": current_user["username"]}))
    else:
        username = request.args.get("username")
        if username is not None:
            redacoes = list(redacoes_collection.find({"aluno": username}))
        else:
            redacoes = list(redacoes_collection.find())

    for redacao in redacoes:
        redacao['_id'] = str(redacao['_id'])
    return jsonify(redacoes)

# Rota para pegar uma redação por ID (acessível por todos os usuários)
@redacao_bp.get("/<id>")
@jwt_required()
def get_redacao_by_id(id):
    redacoes_collection = db.redacoes
    redacao = redacoes_collection.find_one({"_id": ObjectId(id)})
    if redacao:
        redacao['_id'] = str(redacao['_id'])
        return jsonify(redacao)
    else:
        return jsonify({"error": "Redação não encontrada"}), 404
    
# Rota para criar uma nova redação (somente admin ou aluno pode criar)
@redacao_bp.post("/")
@jwt_required()
def create_redacao():
    """
    Cria uma nova redação, somente permitido para admin ou aluno.
    """
    try:
        # Obtém o usuário autenticado do token JWT
        current_user_email = get_jwt_identity()
        current_user = db.users.find_one({"email": current_user_email})

        # Verifica se o usuário tem permissão para criar a redação (admin ou aluno)
        if not check_user_permission(current_user):
            return jsonify({"message": "Você não tem permissão para criar uma redação."}), 403

        # Recebe os dados da redação (título e id do tema)
        redacao_data = request.json
        id_tema = redacao_data.get('id_tema')
        titulo = redacao_data.get('titulo')

        # Verifica se todos os campos necessários foram preenchidos
        if not titulo or not id_tema:
            return jsonify({"error": "Título da redação e ID do tema são obrigatórios."}), 400

        # Adiciona o nome do aluno ao dado da redação
        redacao_data['aluno'] = current_user["username"]
        redacao_data['email_aluno'] = current_user["email"]

        # Adiciona o ID do tema (no caso, verificando que o tema existe)
        tema = db.temas.find_one({"_id": ObjectId(id_tema)})
        if not tema:
            return jsonify({"error": "Tema não encontrado."}), 404
        
        # Criação da redação
        redacao_data['tema'] = tema['tema']

        # Insere a redação no banco de dados
        redacao_id = db.redacoes.insert_one(redacao_data).inserted_id

        return jsonify({"message": "Redação criada com sucesso", "redacao_id": str(redacao_id)}), 201

    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500

@redacao_bp.put("/<id>")
@jwt_required()
def update_redacao(id):
    redacoes_collection = db.redacoes

    try:
        object_id = ObjectId(id)
        data = request.json

        # Obtém as informações do usuário autenticado
        current_user_email = get_jwt_identity()
        current_user = db.users.find_one({"email": current_user_email})

        # Busca a redação para verificar se o usuário tem permissão para atualizá-la
        redacao = redacoes_collection.find_one({"_id": object_id})
        if not redacao:
            return jsonify({"error": "Redação não encontrada"}), 404

        # Verifica se o usuário pode modificar essa redação (admin ou professor ou aluno)
        if current_user["tipoUsuario"] not in ["admin", "professor", "aluno"]:
            return jsonify({"message": "Você não tem permissão para modificar essa redação."}), 403

        # Se for aluno, verifica se está tentando modificar sua própria redação
        if current_user["tipoUsuario"] == "aluno" and not is_own_redacao(current_user, redacao):
            return jsonify({"message": "Você só pode modificar suas próprias redações."}), 403

        # Prepara os dados que podem ser atualizados
        update_data = {}

        # Bloqueia alunos de modificar notas
        if "nota" in data or any(key.startswith("nota_") for key in data.keys()):
            if current_user["tipoUsuario"] not in ["admin", "professor"]:
                return jsonify({"message": "Você não tem permissão para modificar notas."}), 403
            else:
                # Se for admin ou professor, pode alterar as notas
                for key in ["nota", "nota_competencia_1_model", "nota_competencia_2_model", "nota_competencia_3_model", 
                            "nota_competencia_4_model", "nota_competencia_5_model"]:
                    if key in data:
                        update_data[key] = data[key]

                # Caso haja alteração nas notas das competências, recalcule a nota total do professor
                competencias = [
                    "nota_competencia_1_model",
                    "nota_competencia_2_model",
                    "nota_competencia_3_model",
                    "nota_competencia_4_model",
                    "nota_competencia_5_model"
                ]
                

                competencias_professor = [
                    "nota_competencia_1_professor",
                    "nota_competencia_2_professor",
                    "nota_competencia_3_professor",
                    "nota_competencia_4_professor",
                    "nota_competencia_5_professor"
                ]

                # Adiciona as notas do professor
                for competencia in competencias_professor:
                    if competencia in data:
                        update_data[competencia] = data[competencia]

                # Cálculo da média das notas do modelo
                media_modelo = sum([
                    data.get("nota_competencia_1_model", 0),
                    data.get("nota_competencia_2_model", 0),
                    data.get("nota_competencia_3_model", 0),
                    data.get("nota_competencia_4_model", 0),
                    data.get("nota_competencia_5_model", 0)
                ]) / 5

                # Cálculo da média das notas do professor (se disponíveis)
                media_professor = sum([
                    data.get("nota_competencia_1_professor", 0),
                    data.get("nota_competencia_2_professor", 0),
                    data.get("nota_competencia_3_professor", 0),
                    data.get("nota_competencia_4_professor", 0),
                    data.get("nota_competencia_5_professor", 0)
                ]) / 5

        

        # Permite que alunos alterem apenas o título da redação
        if "titulo" in data:
            update_data["titulo"] = data["titulo"]

        # Verifica se há algo para atualizar
        if not update_data:
            return jsonify({"message": "Nenhuma alteração permitida."}), 400

        # Aplica a atualização no banco de dados
        result = redacoes_collection.update_one(
            {"_id": object_id},
            {"$set": update_data}
        )

        if result.matched_count == 1:
            if result.modified_count == 1:
                return jsonify({"message": "Redação atualizada com sucesso!"}), 200
            else:
                return jsonify({"message": "Nada foi alterado."}), 304
        else:
            return jsonify({"error": "Redação não encontrada"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# Rota para deletar uma redação (somente admin ou aluno pode excluir suas próprias redações)
@redacao_bp.delete("/<id>")
@jwt_required()
def delete_redacao(id):
    redacoes_collection = db.redacoes
    try:
        object_id = ObjectId(id)

        # Obtém as informações do usuário autenticado
        current_user_email = get_jwt_identity()
        current_user = db.users.find_one({"email": current_user_email})

        # Busca a redação para verificar se o usuário tem permissão para deletá-la
        redacao = redacoes_collection.find_one({"_id": object_id})
        if not redacao:
            return jsonify({"error": "Redação não encontrada"}), 404

        # Verifica a permissão do usuário para deletar a redação (admin ou aluno)
        if not check_user_permission(current_user):
            return jsonify({"message": "Você não tem permissão para deletar essa redação."}), 403

        # Verifica se o aluno está tentando deletar sua própria redação
        if current_user["tipoUsuario"] == "aluno" and not is_own_redacao(current_user, redacao):
            return jsonify({"message": "Você não tem permissão para deletar esta redação."}), 403

        result = redacoes_collection.delete_one({"_id": object_id})

        if result.deleted_count == 1:
            return jsonify({"message": "Redação deletada com sucesso!"}), 200
        else:
            return jsonify({"error": "Redação não encontrada"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Rota para avaliar uma redação fornecida como texto (somente aluno ou admin)
@redacao_bp.post("/avaliacao/")
@jwt_required()
def avaliar_redacao_texto():
    """
    Avalia uma redação fornecida como texto.
    """
    try:
        # Obtém o usuário autenticado
        current_user_email = get_jwt_identity()
        current_user = db.users.find_one({"email": current_user_email})

        # Verifica se o usuário tem permissão para avaliar (aluno ou admin)
        if not check_user_permission(current_user):
            return jsonify({"message": "Você não tem permissão para avaliar a redação."}), 403

        # Obtém os dados da requisição
        redacao_data = request.json
        essay = redacao_data.get('essay')
        title = redacao_data.get('title')
        id_tema = redacao_data.get('id')

        # Verifica se todos os campos necessários foram preenchidos
        if not essay or not id_tema:
            return jsonify({"error": "Redação e ID do tema são obrigatórios."}), 400

        # Valida o ID do tema
        if not validate_tema(id_tema):
            return jsonify({"error": "Tema não encontrado."}), 404

        # Obtém o nome do aluno automaticamente (não é mais necessário enviar no corpo da requisição)
        aluno = current_user["username"]

        # Verifica se o aluno está enviando a redação dele
        if current_user["tipoUsuario"] == "aluno" and current_user["username"] != aluno:
            return jsonify({"message": "Você não tem permissão para avaliar a redação de outro aluno."}), 403

        # Processa a redação
        lines = essay.split('\n')

        formatted_essay = '\n'.join(line.strip() for line in lines if line.strip())

        # Avalia a redação
        obj = evaluate_redacao(essay)

        # Prepara as notas
        grades = {f"nota{i+1}": float(obj.get(f'nota_{i+1}', 0)) for i in range(5)}

        # Estrutura de dados para salvar a redação
        essay_data = {
            "titulo": title,
            "texto": formatted_essay.strip(),
            "nota_competencia_1_model": grades['nota1'],
            "nota_competencia_2_model": grades['nota2'],
            "nota_competencia_3_model": grades['nota3'],
            "nota_competencia_4_model": grades['nota4'],
            "nota_competencia_5_model": grades['nota5'],
            "nota_competencia_1_professor": None,
            "nota_competencia_2_professor": None,
            "nota_competencia_3_professor": None,
            "nota_competencia_4_professor": None,
            "nota_competencia_5_professor": None,
            "id_tema": id_tema,
            "aluno": aluno
        }

        # Insere a redação no banco de dados
        redacoes_collection = db.redacoes
        redacao_id = redacoes_collection.insert_one(essay_data).inserted_id

        # Resposta de sucesso
        response = jsonify({
            "message": "Redação avaliada com sucesso",
            "grades": obj,
            "essay_id": str(redacao_id)
        })
        response.headers.add('Access-Control-Allow-Origin', '*')

        return response

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@redacao_bp.post("/imagem")
@jwt_required()
def avaliar_redacao_imagem():
    """
    Avalia uma redação fornecida como imagem.
    """
    current_user_email = get_jwt_identity()  # Obtém o usuário autenticado
    current_user = db.users.find_one({"email": current_user_email})

    # Verifica se o usuário tem permissão para avaliar (aluno ou admin)
    if not check_user_permission(current_user):
        return jsonify({"message": "Você não tem permissão para avaliar a redação."}), 403

    # Recebe a imagem e o ID do tema
    image = request.files.get('image')
    id_tema = request.form.get('id')
    aluno = request.form.get('aluno')

    # Verifica se a imagem foi enviada corretamente
    if not image:
        return jsonify({"error": "Imagem não fornecida."}), 400

    # Verifica se o aluno está enviando a redação dele
    if current_user["tipoUsuario"] == "aluno" and current_user["username"] != aluno:
        return jsonify({"message": "Você não tem permissão para avaliar a redação de outro aluno."}), 403

    essay = get_text(image)

    obj = evaluate_redacao(essay)

    grades = {f"nota{i+1}": float(obj.get(f'nota_{i+1}', 0)) for i in range(5)}

    essay_data = {
        "titulo": "Redação de imagem",
        "texto": essay,
        "nota_competencia_1_model": grades['nota1'],
        "nota_competencia_2_model": grades['nota2'],
        "nota_competencia_3_model": grades['nota3'],
        "nota_competencia_4_model": grades['nota4'],
        "nota_competencia_5_model": grades['nota5'],
        "nota_total": sum(grades.values()),
        "id_tema": id_tema,
        "aluno": aluno
    }

    redacoes_collection = db.redacoes
    redacao_id = redacoes_collection.insert_one(essay_data).inserted_id

    response = jsonify({"grades": obj})
    response.headers.add('Access-Control-Allow-Origin', '*')

    persist_essay(essay, obj)
    return response

@redacao_bp.post("/image-to-text")
@jwt_required()
def ocr_imagem():
    """
    Recebe uma imagem e retorna o texto extraído usando Azure OCR.
    Permitido para usuários autenticados (admin ou aluno).
    """
    try:
        current_user_email = get_jwt_identity()
        current_user = db.users.find_one({"email": current_user_email})

        if not check_user_permission(current_user):
            return jsonify({"message": "Você não tem permissão para utilizar essa funcionalidade."}), 403

        if 'imagem' not in request.files:
            return jsonify({"error": "Nenhuma imagem enviada."}), 400

        file = request.files['imagem']
        if file.filename == '':
            return jsonify({"error": "Nome de arquivo inválido."}), 400

        image_stream = BytesIO(file.read())
        texto_extraido = read_text_from_image(image_stream)

        return jsonify({"texto": texto_extraido}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500