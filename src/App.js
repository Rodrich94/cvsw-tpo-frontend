import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LaptopOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons';
import logo from './logo192.png';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import Traslados from './components/Traslados'; 
import Diagramas from './components/Diagramas'; 
import DetalleDiagrama from './components/DetalleDiagrama';
import Presentacion from './components/Inicio'; // Importa el nuevo componente

const { Header, Content, Sider } = Layout;

const App = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [collapsed, setCollapsed] = useState(false);

  // Componente para manejar las migas de pan
  const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(x => x);

    return (
      <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item>
          <Link to="/">Inicio</Link>
        </Breadcrumb.Item>
        {pathnames.map((pathname, index) => {
          const isLast = index === pathnames.length - 1;
          const url = `/${pathnames.slice(0, index + 1).join('/')}`;

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
        <Header style={{ display: 'flex', alignItems: 'center' }}>
          <div className="demo-logo" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center' }}>
            <img style={{ width: '50px', height: '50px' }} src={logo} className="App-logo" alt="logo" />
          </div>
        </Header>
        <Layout>
          <Sider
            collapsible
            width={200}
            style={{
              background: colorBgContainer,
            }}
            collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}
          >
            <Menu mode="inline" defaultSelectedKeys={['1']} style={{ height: '100%', borderRight: 0 }}>
              <Menu.Item key="1" icon={<UserOutlined />}>
                <Link to="/">Inicio</Link>
              </Menu.Item>
              <Menu.Item key="2" icon={<LaptopOutlined />}>
                <Link to="/traslados">Traslados</Link>
              </Menu.Item>
              <Menu.Item key="3" icon={<NotificationOutlined />}>
                <Link to="/diagramas">Diagramas</Link>
              </Menu.Item>
            </Menu>
          </Sider>
          <Layout style={{ padding: '0 24px 24px' }}>
            <Breadcrumbs />
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
                <Route path="/" element={<Presentacion />} /> {/* Usa el componente de presentación */}
                <Route path="/traslados" element={<Traslados />} />
                <Route path="/diagramas" element={<Diagramas />} />
                <Route path="/diagrama/:id" element={<DetalleDiagrama />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;
