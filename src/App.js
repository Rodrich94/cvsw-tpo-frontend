import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LaptopOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons';
import logo from './logo.svg';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import Traslados from './components/Traslados'; 
import Diagramas from './components/Diagramas'; 
import DetalleDiagrama from './components/DetalleDiagrama';

const { Header, Content, Sider } = Layout;

const App = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Componente para manejar las migas de pan
  const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(x => x); // Obtiene las partes de la ruta

    return (
      <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item>
          <Link to="/">Inicio</Link>
        </Breadcrumb.Item>
        {pathnames.map((pathname, index) => {
          const isLast = index === pathnames.length - 1;
          const url = `/${pathnames.slice(0, index + 1).join('/')}`; // Crea la URL hasta el ítem actual

          return isLast ? (
            <Breadcrumb.Item key={url}>{pathname.charAt(0).toUpperCase() + pathname.slice(1)}</Breadcrumb.Item>
          ) : (
            <Breadcrumb.Item key={url}>
              <Link to={url}>{pathname.charAt(0).toUpperCase() + pathname.slice(1)}</Link>
            </Breadcrumb.Item>
          );
        })}
      </Breadcrumb>
    );
  };

  return (
    <Router>
      <Layout>
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div className="demo-logo" style={{ width: '60px', height: '60px' }}>
            <img src={logo} className="App-logo" alt="logo" />
          </div>
        </Header>
        <Layout>
          <Sider
            width={200}
            style={{
              background: colorBgContainer,
            }}
          >
            <Menu
              mode="inline"
              defaultSelectedKeys={['1']}
              style={{
                height: '100%',
                borderRight: 0,
              }}
            >
              <Menu.Item key="1" icon={<UserOutlined />}>
                <Link to="/">Inicio</Link>
              </Menu.Item>
              <Menu.Item key="2" icon={<LaptopOutlined />}>
                <Link to="/traslados">Traslados</Link>
              </Menu.Item>
              <Menu.Item key="3" icon={<NotificationOutlined />}>
                <Link to="/diagramas">Diagramas</Link>
              </Menu.Item>
              {/* Agregar ítems */}
            </Menu>
          </Sider>
          <Layout
            style={{
              padding: '0 24px 24px',
            }}
          >
            <Breadcrumbs /> {/* Llama al componente Breadcrumbs aquí */}
            <Content
              style={{
                padding: 24,
                margin: 0,
                minHeight: '85vh',
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
              <Routes>
                <Route path="/" element={<div><h1>APLICACION GUARDIAS SALUD</h1></div>} />
                <Route path="/traslados" element={<Traslados />} />
                <Route path="/diagramas" element={<Diagramas />} />
                <Route path="/diagrama/:id" element={<DetalleDiagrama />} />
                {/* Agrega más rutas */}
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;
