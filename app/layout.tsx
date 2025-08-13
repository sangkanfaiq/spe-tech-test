"use client"
import React from 'react';
import {
  ShoppingCartOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import "./globals.css"

const { Header, Content, Sider } = Layout;

const siderStyle: React.CSSProperties = {
  overflow: 'auto',
  height: '100vh',
  position: 'fixed',

};

const menuItems: MenuProps['items'] = [
  {
    key: 'orders',
    icon: React.createElement(ShoppingCartOutlined),
    label: 'Order List',
  },
];

const App = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    const routes: Record<string, string> = {
      orders: '/orders',
    };
    const route = routes[e.key];
    if (route) {
      router.push(route);
    }
  };
  const getSelectedKey = () => {
    if (pathname.startsWith('/orders')) return ['orders'];
    return ['orders'];
  };

  return (
    <html>
      <body>
        <Layout hasSider>
          <Sider style={siderStyle}>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={getSelectedKey()}
              items={menuItems}
              onClick={handleMenuClick}
            />
          </Sider>
          <Layout>
            <Header style={{ padding: 0, background: "#fff" }} />
            <Content style={{ marginLeft: 200, padding: 12, minHeight: '100vh' }}>
              {children}
            </Content>
          </Layout>
        </Layout>
      </body>
    </html>
  );
};

export default App;