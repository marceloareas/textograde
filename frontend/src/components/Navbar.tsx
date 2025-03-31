import { Menu, Dropdown, Space, Tooltip } from "antd";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isLoggedIn, nomeUsuario, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const userMenuItems = [
    {
      key: "welcome",
      label: <span>Seja bem-vindo, {nomeUsuario}</span>,
    },
    {
      key: "logout",
      label: (
        <a onClick={logout} style={{ color: "red" }}>
          Sair
        </a>
      ),
    },
  ];

  const menuItems = [
    {
      key: "home",
      label: <Link href="/">TextGrader</Link>,
    },
    isLoggedIn
      ? {
          key: "textgrader-home",
          label: <Link href="/textgrader/">Home</Link>,
        }
      : {
          key: "textgrader-home-disabled",
          label: (
            <Tooltip title="Você precisa fazer login para acessar essa página">
              <span>Home</span>
            </Tooltip>
          ),
          disabled: true,
        },
    {
      key: "competencias",
      label: <Link href="/textgrader/competencias">Competências</Link>,
    },
    {
      key: "sobre",
      label: <Link href="/textgrader/sobre">Sobre</Link>,
    },
    isLoggedIn
      ? {
          key: "user",
          label: (
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={["click"]}
              onOpenChange={setIsMenuOpen}
              overlayStyle={{ marginTop: "8px" }}
            >
              <Space>
                {nomeUsuario}
                {isMenuOpen ? <CaretUpOutlined /> : <CaretDownOutlined />}
              </Space>
            </Dropdown>
          ),
          style: { marginLeft: "auto" },
        }
      : {
          key: "login",
          label: <Link href="/login">Login</Link>,
          style: { marginLeft: "auto" },
        },
  ];

  return <Menu theme="dark" mode="horizontal" items={menuItems} />;
};

export default Navbar;
