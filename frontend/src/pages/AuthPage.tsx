import { useState } from 'react';
import { Card, Form, Input, Button, Typography, Alert, Space } from 'antd';
import { GithubOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const { Title, Paragraph, Text, Link } = Typography;

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [token, setToken] = useState('');

  const handleSubmit = async () => {
    if (!token.trim()) {
      return;
    }

    clearError();
    await login(token);

    // Check if login was successful
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card style={{ width: 480, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <GithubOutlined style={{ fontSize: 64, color: '#1890ff' }} />
            <Title level={2} style={{ marginTop: 16, marginBottom: 8 }}>
              GitHub 个人形象增强器
            </Title>
            <Paragraph type="secondary">
              使用 AI 生成个人简介、头像和 README，提升你的 GitHub 形象
            </Paragraph>
          </div>

          <Alert
            message="关于 GitHub Personal Access Token"
            description={
              <div>
                <Paragraph style={{ marginBottom: 8 }}>
                  请提供一个 GitHub Personal Access Token 来授权访问你的账户信息。
                </Paragraph>
                <ol style={{ paddingLeft: 20, marginBottom: 8 }}>
                  <li>访问 GitHub Settings → Developer settings</li>
                  <li>点击 Personal access tokens → Tokens (classic)</li>
                  <li>生成新 Token，勾选所需权限</li>
                  <li>复制 Token 并粘贴到下方</li>
                </ol>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Token 只用于访问你的公开信息和更新个人资料，我们不会将其存储在任何地方。
                </Text>
              </div>
            }
            type="info"
            showIcon
          />

          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="GitHub Personal Access Token"
              name="token"
              rules={[{ required: true, message: '请输入你的 GitHub Token' }]}
            >
              <Input.Password
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                prefix={<GithubOutlined />}
                size="large"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </Form.Item>

            {error && (
              <Alert
                message="验证失败"
                description={error}
                type="error"
                closable
                onClose={clearError}
                style={{ marginBottom: 16 }}
              />
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={isLoading}
                icon={<ArrowRightOutlined />}
              >
                开始使用
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Link
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
            >
              生成新的 GitHub Token
            </Link>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default AuthPage;
