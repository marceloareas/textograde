import React from "react";
import styled from "styled-components";
import withSession from "../../hoc/withSession";

const Container = styled.div`
  max-width: 800px;
  margin: 40px auto 0px;
  padding: 20px;
  font-family: "Roboto", sans-serif;
  color: #333;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 2rem;
  color: #024791;
`;

const Subtitle = styled.p`
  text-align: center;
  font-size: 1.2rem;
  margin-bottom: 40px;
`;

const ListaCompetencias = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CompetenciaCard = styled.div`
  background: #ffffff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.02);
  }
`;

const CompetenciaTitulo = styled.h3`
  font-size: 1.3rem;
  color: #024791;
`;

const CompetenciaSubtitulo = styled.p`
  font-size: 1rem;
  color: #c0bcbc;
`;

const CompetenciaTexto = styled.p`
  font-size: 1rem;
  color: #555;
`;

const LinkContainer = styled.a`
  display: flex;
  justify-content: center;
  margin-top: 50px;
  font-weight: bold;
`;

const CompetenciaLink = styled.a`
  display: inline-block;
  margin-top: 8px;
  color: #007bff;
  font-weight: bold;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const competencias = [
  {
    titulo: "Competência 1",
    subtitulo:
      "Demonstrar domínio da modalidade escrita formal da língua portuguesa.",
    descricao:
      "A Competência 1 da redação do Enem é um critério que analisa se o participante possui escrita formal da língua portuguesa, usando as regras gramaticais e a construção sintática de forma adequada. Essa competência também verifica se ele adota as regras de ortografia e de acentuação gráfica em conformidade com o atual Acordo Ortográfico.",
    link: "https://vestibular.brasilescola.uol.com.br/enem/competencia-1-redacao-enem-os-erros-mais-comuns.htm",
  },
  {
    titulo: "Competência 2",
    subtitulo:
      "Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento.",
    descricao:
      "A Competência 2 da redação do Enem avalia se o estudante seguiu o formativo dissertativo-argumentativo. Outro aspecto analisado é a presença de repertório sociocultural, que é uma informação, um fato, uma citação ou uma experiência vivida que, de alguma forma, contribui como argumento para a discussão proposta.",
    link: "https://brasilescola.uol.com.br/redacao/competencia-2-redacao-enem.htm",
  },
  {
    titulo: "Competência 3",
    subtitulo:
      "Selecionar, relacionar, organizar e interpretar informações em defesa de um ponto de vista.",
    descricao:
      "A Competência 3 da redação do Enem analisa se o inscrito elaborou um texto que possui coerência e da plausibilidade entre as ideias apresentadas e se atende o projeto de redação (planejamento prévio à escrita) que deve ser produzida.",
    link: "https://brasilescola.uol.com.br/redacao/competencia-3-da-redacao-do-enem.htm",
  },
  {
    titulo: "Competência 4",
    subtitulo:
      "Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação.",
    descricao:
      "A Competência 4 da redação do Enem é um critério que analisa se o estudante produziu o texto com uma estruturação lógica e formal. Sendo assim, as frases e os parágrafos devem estar interligados, apresentando as ideias de forma coerente.",
    link: "https://brasilescola.uol.com.br/redacao/competencia-3-da-redacao-do-enem.htm",
  },
  {
    titulo: "Competência 5",
    subtitulo:
      "Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos.",
    descricao:
      "Na Competência 5 da redação do Enem, é avaliado se participante apresentou uma proposta de intervenção, ou seja, uma iniciativa que busque enfrentar o problema exposto. Conforme a cartilha de redação, é a ocasião para que o estudante demonstre seu preparo para exercitar a cidadania e atuar na realidade, em consonância com os direitos humanos.",
  },
];

interface CompetenciaProps {
  titulo: string;
  subtitulo: string;
  descricao: string;
  link?: string;
}

const Competencia = ({
  titulo,
  subtitulo,
  descricao,
  link,
}: CompetenciaProps) => (
  <CompetenciaCard>
    <CompetenciaTitulo>{titulo}</CompetenciaTitulo>
    <CompetenciaSubtitulo>{subtitulo}</CompetenciaSubtitulo>
    <CompetenciaTexto>{descricao}</CompetenciaTexto>
    {link && <CompetenciaLink href={link}>Saiba mais</CompetenciaLink>}
  </CompetenciaCard>
);

const Competencias = () => {
  return (
    <Container>
      <Title>Competências da redação do Enem</Title>
      <Subtitle>
        Ao entender as cinco competências da redação do Enem, o estudante
        chegará preparado para cumprir os critérios que serão observados no seu
        texto. Confira abaixo alguns detalhes importantes sobre as competências:
      </Subtitle>
      <ListaCompetencias>
        {competencias.map((item, index) => (
          <Competencia key={index} {...item} />
        ))}
      </ListaCompetencias>
      <LinkContainer
        href={
          "https://vestibular.brasilescola.uol.com.br/enem/enem-2023-entenda-as-5-competencias-da-redacao/355070.html"
        }
      >
        Quer ler o artigo que fala sobre isso? Clique aqui!
      </LinkContainer>
    </Container>
  );
};

export default withSession(Competencias);
