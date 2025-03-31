import { ReactNode } from "react";
import { Layout } from "antd";
import Navbar from "../components/Navbar";

const { Content, Footer } = Layout;

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Navbar />
      <Content>{children}</Content>
      <Footer style={{ textAlign: "center" }}>TextGrader ©2024</Footer>
    </Layout>
  );
};

export default MainLayout;
