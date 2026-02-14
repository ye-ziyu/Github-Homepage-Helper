import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, Space, Alert } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';
import { syncApi } from '../api';

const { Title, Paragraph } = Typography;

const InfoConfirmPage = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuthStore();
  const [form] = Form.useForm();

  useEffect(() => {
    if (userInfo) {
      form.setFieldsValue({
        displayName: userInfo.displayName,
        bio: userInfo.bio,
        location: userInfo.location,
        blog: userInfo.blog,
        company: userInfo.company,
        twitterUsername: userInfo.twitterUsername,
      });
    }
  }, [userInfo, form]);

  const handleSubmit = async (values: any) => {
    try {
      await syncApi.profile(values);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
    }
  };

  if (!userInfo) {
    return <Alert message="未登录" description="请先登录" type="warning" showIcon />;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/dashboard')}
        style={{ marginBottom: 16 }}
      >
        返回仪表板
      </Button>

      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={2}>确认个人信息</Title>
            <Paragraph>
              请确认你的个人信息，我们将使用这些信息生成个人简介和 README。
            </Paragraph>
          </div>

          <Alert
            message="提示"
            description="修改后的信息将同步到你的 GitHub 账户。"
            type="info"
            showIcon
          />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              label="Display Name"
              name="displayName"
            >
              <Input placeholder="Your display name" />
            </Form.Item>

            <Form.Item
              label="Bio"
              name="bio"
            >
              <Input.TextArea
                rows={4}
                placeholder="A brief bio about yourself"
                maxLength={160}
                showCount
              />
            </Form.Item>

            <Form.Item
              label="Location"
              name="location"
            >
              <Input placeholder="Your location" />
            </Form.Item>

            <Form.Item
              label="Blog URL"
              name="blog"
            >
              <Input placeholder="https://yourblog.com" />
            </Form.Item>

            <Form.Item
              label="Company"
              name="company"
            >
              <Input placeholder="Your company or organization" />
            </Form.Item>

            <Form.Item
              label="Twitter Username"
              name="twitterUsername"
            >
              <Input placeholder="@yourusername" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                icon={<SaveOutlined />}
              >
                保存并继续
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default InfoConfirmPage;
