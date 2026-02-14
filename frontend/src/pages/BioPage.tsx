import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Select,
  Button,
  Typography,
  Space,
  Alert,
  Input,
  Radio,
  Progress,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';
import { useBioStore } from '../stores/bioStore';
import { BioConfig, BioStyle, BioLanguage, BioLength } from '../types';

const { Title, Paragraph } = Typography;

const BioPage = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuthStore();
  const { generateBio, generatedBio, isLoading, error, progress, clearError } = useBioStore();
  const [form] = Form.useForm();
  const [customPrompt, setCustomPrompt] = useState('');

  const handleGenerate = async (values: any) => {
    clearError();
    const config: BioConfig = {
      language: values.language,
      style: values.style,
      length: values.length,
      includeStats: values.includeStats,
      includeSkills: values.includeSkills,
      includeProjects: values.includeProjects,
    };

    await generateBio(config);

    if (generatedBio) {
      message.success('简介生成成功！');
    }
  };

  const handleSyncToGitHub = async () => {
    if (!generatedBio) {
      message.warning('请先生成简介');
      return;
    }
    navigate('/info-confirm');
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/dashboard')}
        style={{ marginBottom: 16 }}
      >
        返回仪表板
      </Button>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Bio Config */}
        <Card title="生成个人简介">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleGenerate}
            initialValues={{
              language: 'zh',
              style: 'professional',
              length: 'medium',
              includeStats: true,
              includeSkills: true,
              includeProjects: true,
            }}
          >
            <Form.Item
              label="语言"
              name="language"
              rules={[{ required: true }]}
            >
              <Radio.Group>
                <Radio.Button value="zh">中文</Radio.Button>
                <Radio.Button value="en">英文</Radio.Button>
                <Radio.Button value="bilingual">双语</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="风格"
              name="style"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: 'professional', label: '专业' },
                  { value: 'casual', label: '轻松' },
                  { value: 'humorous', label: '幽默' },
                  { value: 'minimal', label: '极简' },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="长度"
              name="length"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: 'short', label: '短 (1-2句话)' },
                  { value: 'medium', label: '中等 (3-4句话)' },
                  { value: 'long', label: '长 (1段)' },
                ]}
              />
            </Form.Item>

            <Form.Item label="包含内容">
              <Space direction="vertical">
                <Form.Item name="includeStats" valuePropName="checked" noStyle>
                  <Button>统计数据</Button>
                </Form.Item>
                <Form.Item name="includeSkills" valuePropName="checked" noStyle>
                  <Button>技能</Button>
                </Form.Item>
                <Form.Item name="includeProjects" valuePropName="checked" noStyle>
                  <Button>项目</Button>
                </Form.Item>
              </Space>
            </Form.Item>

            <Form.Item label="自定义提示（可选）">
              <Input.TextArea
                rows={3}
                placeholder="添加你想在简介中特别强调的内容..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                icon={<ThunderboltOutlined />}
                loading={isLoading}
                block
              >
                生成简介
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Progress */}
        {isLoading && (
          <Card>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Paragraph>AI 正在生成你的个人简介...</Paragraph>
              <Progress percent={progress} status="active" />
            </Space>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Alert
            message="生成失败"
            description={error}
            type="error"
            showIcon
            closable
            onClose={clearError}
          />
        )}

        {/* Result */}
        {generatedBio && !isLoading && (
          <Card
            title="生成的简介"
            extra={
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleSyncToGitHub}
              >
                同步到 GitHub
              </Button>
            }
          >
            <Alert
              message="生成成功"
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                {generatedBio}
              </Paragraph>
            </div>
          </Card>
        )}
      </Space>
    </div>
  );
};

export default BioPage;
