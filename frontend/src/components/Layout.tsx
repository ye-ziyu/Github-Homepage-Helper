import { Layout as AntLayout, Menu, Avatar, Dropdown, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  UserOutlined,
  EditOutlined,
  PictureOutlined,
  FileTextOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';

const { Header, Content, Sider } = AntLayout;

const Layout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userInfo, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: '仪表板',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/bio',
      icon: <EditOutlined />,
      label: '生成简介',
      onClick: () => navigate('/bio'),
    },
    {
      key: '/image',
      icon: <PictureOutlined />,
      label: '生成头像',
      onClick: () => navigate('/image'),
    },
    {
      key: '/readme',
      icon: <FileTextOutlined />,
      label: '生成 README',
      onClick: () => navigate('/readme'),
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: userInfo?.username || 'User',
      disabled: true,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff',
          padding: '0 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
          }}
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
        >
          <img
            src="/github-icon.svg"
            alt="GitHub"
            style={{ width: 32, height: 32 }}
          />
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
            GitHub 个人形象增强器
          </h1>
        </div>
        {isAuthenticated && (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar
                size="small"
                src={userInfo?.avatarUrl}
                icon={!userInfo?.avatarUrl && <UserOutlined />}
              />
              <span>{userInfo?.displayName || userInfo?.username}</span>
            </Button>
          </Dropdown>
        )}
      </Header>
      <AntLayout>
        {isAuthenticated && (
          <Sider width={200} style={{ background: '#fff' }}>
            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              items={menuItems}
              style={{ height: '100%', borderRight: 0 }}
            />
          </Sider>
        )}
        <Content style={{ padding: '24px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
