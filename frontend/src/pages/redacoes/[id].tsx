import { useRouter } from 'next/router';
import { ReactElement, useEffect, useState } from 'react';
import { client } from '../../../services/client';

type Essay = {
  _id: string;
  titulo: string;
  conteudo: string;
  nota_professor?: number;
  nota_competencia_1_model?: number;
  nota_competencia_2_model?: number;
  nota_competencia_3_model?: number;
  nota_competencia_4_model?: number;
  nota_competencia_5_model?: number;
}; 

export default function RedacaoPage(): ReactElement {
  const router = useRouter();
  const { id } = router.query; // Obter o ID da URL

  const [redacao, setRedacao] = useState<Essay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchRedacao = async () => {
        try {
          const {data} = await client.get(`/api/redacao/${id}`);
          
          if (data) {
            setRedacao(data);
            setLoading(false);
          } else {
            throw new Error("Redação não encontrada");
          }
        } catch (error) {
          console.error("Redação não encontrada");
          setLoading(false);
        }
      }

      fetchRedacao();
    }
  }, [id]);

  if (loading) return <p>Carregando...</p>;

  if (!redacao) return <p>Redação não encontrada.</p>;

  return (
    <div>
      {redacao && (
        <>
          <h1>{redacao.titulo}</h1>
          <p>{redacao.conteudo}</p>
        </>
      )}
    </div>
  );
}
