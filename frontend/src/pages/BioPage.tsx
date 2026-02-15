import { useState } from 'react';
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
  Checkbox,
  Progress,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  FileTextOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';
import { useBioStore } from '../stores/bioStore';
import { BioConfig } from '../types';

const { Title, Paragraph } = Typography;

const BioPage = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuthStore();
  const { generateBio, generatedBio, generatedShortBio, isLoading, error, progress, clearError, shortBioLanguage, setShortBioLanguage } = useBioStore();
  const [form] = Form.useForm();
  const [customPrompt, setCustomPrompt] = useState('');

  const handleGenerate = async (values) => {
    clearError();
    const config = {
      language: values.language,
      style: values.style,
      length: values.length,
      includeStats: values.includeStats,
      includeSkills: values.includeSkills,
      includeProjects: values.includeProjects,
      identity: values.identity,
      workplace: values.workplace,
      customPrompt: customPrompt,
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

  const parseShortBio = (shortBio) => {
    if (!shortBio) return { zh: '', en: '' };
    
    const parts = shortBio.split('\n\n');
    if (parts.length === 2) {
      return {
        zh: parts[0].trim(),
        en: parts[1].trim()
      };
    }
    
    if (shortBio.includes('我是')) {
      return {
        zh: shortBio,
        en: ''
      };
    } else if (shortBio.includes('I\'m')) {
      return {
        zh: '',
        en: shortBio
      };
    }
    
    return { zh: shortBio, en: '' };
  };

  const getCurrentShortBio = () => {
    if (!generatedShortBio) return '';
    const parsed = parseShortBio(generatedShortBio);
    return shortBioLanguage === 'zh' ? parsed.zh : parsed.en;
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
              identity: '',
              workplace: '',
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

            <Form.Item label="身份（可选）" name="identity">
              <Input
                placeholder="例如：学生、开发者、研究员等"
              />
            </Form.Item>

            <Form.Item label="工作/学习地点（可选）" name="workplace">
              <Input
                placeholder="例如：北京大学、Google等"
              />
            </Form.Item>

            <Form.Item label="包含内容">
              <Space direction="vertical">
                <Form.Item name="includeStats" valuePropName="checked" noStyle>
                  <Checkbox>统计数据</Checkbox>
                </Form.Item>
                <Form.Item name="includeSkills" valuePropName="checked" noStyle>
                  <Checkbox>技能</Checkbox>
                </Form.Item>
                <Form.Item name="includeProjects" valuePropName="checked" noStyle>
                  <Checkbox>项目</Checkbox>
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

        {isLoading && (
          <Card>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Paragraph>AI 正在生成你的个人简介...</Paragraph>
              <Progress percent={progress} status="active" />
            </Space>
          </Card>
        )}

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

        {generatedBio && !isLoading && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Card
              title="生成的简介"
              extra={
                <Space>
                  <Button
                    type="default"
                    icon={<CopyOutlined />}
                    onClick={() => {
                      navigator.clipboard.writeText(generatedBio);
                      message.success('简介已复制到剪贴板');
                    }}
                  >
                    复制
                  </Button>
                  <Button
                    type="default"
                    icon={<FileTextOutlined />}
                    onClick={() => {
                      navigate('/readme');
                    }}
                  >
                    制作 Readme
                  </Button>
                </Space>
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

            {generatedShortBio && (
              <Card
                title="短简介 (160字)"
                extra={
                  <Space>
                    <Button
                      type="default"
                      icon={<CopyOutlined />}
                      onClick={() => {
                        navigator.clipboard.writeText(getCurrentShortBio());
                        message.success('短简介已复制到剪贴板');
                      }}
                    >
                      复制
                    </Button>
                    <Button
                      type="default"
                      icon={<GlobalOutlined />}
                      onClick={() => {
                        setShortBioLanguage(prev => prev === 'zh' ? 'en' : 'zh');
                      }}
                    >
                      切换到{shortBioLanguage === 'zh' ? '英文' : '中文'}
                    </Button>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={handleSyncToGitHub}
                    >
                      同步到 GitHub
                    </Button>
                  </Space>
                }
              >
                <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
                  <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                    {getCurrentShortBio()}
                  </Paragraph>
                </div>
              </Card>
            )}
          </Space>
        )}
      </Space>
    </div>
  )
};

export default BioPage;