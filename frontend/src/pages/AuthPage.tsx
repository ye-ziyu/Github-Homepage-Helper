import { useState } from 'react';
import { Card, Form, Input, Button, Typography, Alert, Space, Modal, Divider } from 'antd';
import { GithubOutlined, ArrowRightOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const { Title, Paragraph, Text, Link } = Typography;

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [token, setToken] = useState('');
  const [helpModalVisible, setHelpModalVisible] = useState(false);

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
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: 520, 
          maxWidth: '100%',
          borderRadius: 16, 
          boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          border: '1px solid #e8e8e8',
          overflow: 'hidden'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', padding: '0 32px 32px' }}>
          <div style={{ textAlign: 'center', paddingTop: 32 }}>
            <div style={{ 
              width: 100, 
              height: 100, 
              borderRadius: 50, 
              backgroundColor: '#e6f7ff', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              margin: '0 auto 24px'
            }}>
              <GithubOutlined style={{ fontSize: 56, color: '#1890ff' }} />
            </div>
            <Title level={2} style={{ marginTop: 0, marginBottom: 12, fontSize: 24, fontWeight: 600 }}>
              GitHub 个人形象增强器
            </Title>
            <Paragraph type="secondary" style={{ fontSize: 16, lineHeight: '24px' }}>
              使用 AI 生成个人简介、头像和 README，提升你的 GitHub 形象
            </Paragraph>
          </div>

          <div style={{ marginBottom: 24 }}>
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
              action={
                <Button
                  size="small"
                  type="link"
                  icon={<QuestionCircleOutlined />}
                  onClick={() => setHelpModalVisible(true)}
                  style={{ marginLeft: 8 }}
                >
                  详细指南
                </Button>
              }
            />
          </div>

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
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            {error && (
              <Alert
                message="验证失败"
                description={error}
                type="error"
                closable
                onClose={clearError}
                style={{ marginBottom: 16, borderRadius: 8 }}
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
                style={{ borderRadius: 8, height: 48, fontSize: 16 }}
              >
                开始使用
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 14 }}
            >
              🔗 生成新的 GitHub Token
            </Link>
          </div>
        </Space>
      </Card>

      {/* Token 配置帮助模态框 */}
      <Modal
        title="GitHub Token 配置帮助"
        open={helpModalVisible}
        onCancel={() => setHelpModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setHelpModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4}>Token 权限配置</Title>
            <Paragraph>
              为了使 GitHub 个人形象增强器正常工作，你需要为 Token 配置以下权限：
            </Paragraph>
            
            <div style={{ margin: '20px 0', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <Title level={5}>必需权限：</Title>
              <ul style={{ paddingLeft: 20 }}>
                <li><strong>read:user</strong> - 读取用户基本信息（用户名、简介、所在地等）</li>
                <li><strong>user:email</strong> - 读取用户邮箱信息</li>
                <li><strong>repo</strong> - 仓库读写权限（用于更新 README 文件）</li>
                <li><strong>user:profile</strong> - 读写个人资料（用于自动更新个人简介）</li>
              </ul>
            </div>
          </div>

          <Divider />

          <div>
            <Title level={4}>详细配置步骤</Title>
            
            <div style={{ marginBottom: 20 }}>
              <Paragraph><strong>步骤 1：访问 Token 生成页面</strong></Paragraph>
              <ol style={{ paddingLeft: 20 }}>
                <li>登录 GitHub 账号</li>
                <li>点击右上角的个人头像 → <strong>Settings</strong></li>
                <li>在左侧菜单中选择 <strong>Developer settings</strong></li>
                <li>选择 <strong>Personal access tokens</strong> → <strong>Tokens (classic)</strong></li>
                <li>点击 <strong>Generate new token</strong> → <strong>Generate new token (classic)</strong></li>
              </ol>
            </div>

            <div style={{ marginBottom: 20 }}>
              <Paragraph><strong>步骤 2：填写 Token 信息</strong></Paragraph>
              <ol style={{ paddingLeft: 20 }}>
                <li><strong>Note</strong>：填写 Token 名称，例如 "GitHub 个人形象增强器"</li>
                <li><strong>Expiration</strong>：选择 Token 过期时间，建议选择 30 天或 90 天</li>
              </ol>
            </div>

            <div style={{ marginBottom: 20 }}>
              <Paragraph><strong>步骤 3：选择权限</strong></Paragraph>
              <Paragraph>
                在权限列表中勾选以下选项：
              </Paragraph>
              <div style={{ margin: '10px 0', padding: '16px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
                <ul style={{ paddingLeft: 20 }}>
                  <li><strong>user</strong> 部分：勾选 <strong>read:user</strong> 和 <strong>user:email</strong></li>
                  <li><strong>repo</strong> 部分：勾选完整的 <strong>repo</strong> 权限组</li>
                  <li><strong>user</strong> 部分：勾选 <strong>user:profile</strong>（如果有）</li>
                </ul>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <Paragraph><strong>步骤 4：生成并复制 Token</strong></Paragraph>
              <ol style={{ paddingLeft: 20 }}>
                <li>点击页面底部的 <strong>Generate token</strong> 按钮</li>
                <li>生成成功后，立即复制 Token（此 Token 只会显示一次）</li>
                <li>将复制的 Token 粘贴到本应用的输入框中</li>
              </ol>
            </div>
          </div>

          <Divider />

          <div>
            <Title level={4}>GitHub 配置界面参考</Title>
            <Paragraph>
              以下是 GitHub Token 配置界面的参考步骤（英文界面）：
            </Paragraph>
            
            <div style={{ margin: '20px 0', padding: '16px', backgroundColor: '#fafafa', borderRadius: '8px' }}>
              <Title level={5}>参考路径：</Title>
              <pre style={{ backgroundColor: '#f0f0f0', padding: '12px', borderRadius: '4px', overflowX: 'auto' }}>
                GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token (classic)
              </pre>
            </div>

            <div style={{ margin: '20px 0', padding: '16px', backgroundColor: '#fafafa', borderRadius: '8px' }}>
              <Title level={5}>权限勾选位置：</Title>
              <ul style={{ paddingLeft: 20 }}>
                <li><strong>User</strong> section: Select "read:user" and "user:email"</li>
                <li><strong>Repo</strong> section: Select the entire "repo" checkbox</li>
                <li><strong>User</strong> section: Select "user:profile" if available</li>
              </ul>
            </div>
          </div>

          <Divider />

          <div>
            <Title level={4}>安全提示</Title>
            <div style={{ padding: '16px', backgroundColor: '#fff3f3', borderRadius: '8px' }}>
              <ul style={{ paddingLeft: 20 }}>
                <li>Token 是访问你 GitHub 账户的密钥，请妥善保管</li>
                <li>不要与他人分享你的 Token</li>
                <li>定期更新 Token 以保持账户安全</li>
                <li>如果 Token 泄露，请立即在 GitHub 上撤销它</li>
                <li>本应用不会存储你的 Token，仅用于临时 API 调用</li>
              </ul>
            </div>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default AuthPage;
