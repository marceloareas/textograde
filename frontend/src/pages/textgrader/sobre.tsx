import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import styled from "styled-components";
import { Card, Layout } from "antd";
import { client } from "../../services/client";

const StyledLayout = styled(Layout)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
`;

const Container = styled.div`
  max-width: 1258px;
  margin: 40px auto 0px;
  padding: 20px;
  font-family: "Roboto", sans-serif;
  color: #333;

  @media (max-width: 980px) {
    max-width: 900px;
  }

  @media (max-width: 808px) {
    max-width: 600px;
  }

  @media (max-width: 480px) {
    max-width: 400px;
  }
`;

const StyledCard = styled(Card)`
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border: none;
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

const MarkdownWrapper = styled.div`
  color: #595959;
  line-height: 1.6;
  font-size: 16px;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const Sobre = () => {
  const [content, setContent] = useState("");

  useEffect(() => {
    client.get("/Sobre.md")
      .then((response) => response.text())
      .then((text) => setContent(text));
  }, []);

  return (
    <StyledLayout>
      <Container>
        <Title>Quer saber como esse projeto foi construído?</Title>
        <Subtitle>
          A seguir é possível encontrar informações sobre o projeto e como ele
          foi desenvolvido.
        </Subtitle>
        <StyledCard>
          <MarkdownWrapper>
            <ReactMarkdown rehypePlugins={[rehypeRaw]} skipHtml={false}>
              {content}
            </ReactMarkdown>
          </MarkdownWrapper>
        </StyledCard>
      </Container>
    </StyledLayout>
  );
};

export default Sobre;
