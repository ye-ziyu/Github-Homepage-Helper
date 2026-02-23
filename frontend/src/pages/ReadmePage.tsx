import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Checkbox,
  Button,
  Typography,
  Space,
  Alert,
  Row,
  Col,
  Radio,
  message,
  Tabs,
} from 'antd';
import {
  ArrowLeftOutlined,
  ThunderboltOutlined,
  CopyOutlined,
  SyncOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';
import { useReadmeStore } from '../stores/readmeStore';
import { syncApi } from '../api';
import { ReadmeConfig, ReadmeTheme } from '../types';

const { Title, Paragraph } = Typography;

const ReadmePage = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuthStore();
  const {
    generateReadme,
    preview,
    generatedReadme,
    previewReadme,
    isLoading,
    error,
    wordCount,
    lineCount,
    clearError,
  } = useReadmeStore();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('generate');

  const availableSections = [
    { value: 'header', label: 'Header (头像+名字)' },
    { value: 'about', label: 'About (关于我)' },
    { value: 'skills', label: 'Skills (技能)' },
    { value: 'stats', label: 'Stats (统计)' },
    { value: 'projects', label: 'Projects (项目)' },
    { value: 'languages', label: 'Languages (语言)' },
    { value: 'contact', label: 'Contact (联系)' },
    { value: 'footer', label: 'Footer (页脚)' },
  ];

  const handlePreview = async () => {
    const values = form.getFieldsValue();
    const config: ReadmeConfig = {
      sections: values.sections || availableSections.map(s => s.value),
      theme: values.theme,
      showStats: values.showStats,
      showVisitors: values.showVisitors,
    };

    await preview(config);
    setActiveTab('preview');
  };

  const handleGenerate = async () => {
    clearError();
    const values = form.getFieldsValue();
    const config: ReadmeConfig = {
      sections: values.sections || availableSections.map(s => s.value),
      theme: values.theme,
      showStats: values.showStats,
      showVisitors: values.showVisitors,
    };

    await generateReadme(config);
    setActiveTab('result');
    message.success('README 生成成功！');
  };

  const handleCopy = () => {
    const content = activeTab === 'preview' ? previewReadme : generatedReadme;
    if (content) {
      navigator.clipboard.writeText(content);
      message.success('已复制到剪贴板');
    }
  };

  const handleSyncToGitHub = async () => {
    const content = activeTab === 'preview' ? previewReadme : generatedReadme;
    if (!content || !userInfo) {
      message.warning('没有可同步的内容');
      return;
    }

    try {
      const repoName = prompt('请输入仓库名称 (如: username/username)', `${userInfo.username}/${userInfo.username}`);
      if (repoName) {
        const parts = repoName.split('/');
        const owner = parts[0] || userInfo.username;
        const repo = parts[1] || userInfo.username;
        await syncApi.readme({ 
          owner, 
          repo, 
          content,
          commitMessage: 'Update README.md via GitHub Profile Enhancer'
        });
        message.success('README 已同步到 GitHub！');
      }
    } catch (error: any) {
      message.error('同步失败: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDownload = () => {
    const content = activeTab === 'preview' ? previewReadme : generatedReadme;
    if (content) {
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'README.md';
      link.click();
      URL.revokeObjectURL(url);
      message.success('下载成功！');
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/dashboard')}
        style={{ marginBottom: 16 }}
      >
        返回仪表板
      </Button>

      <Row gutter={[24, 24]}>
        {/* Config Panel */}
        <Col xs={24} md={8}>
          <Card title="配置选项">
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                theme: 'auto',
                showStats: true,
                showVisitors: true,
                sections: ['header', 'about', 'skills', 'stats', 'projects', 'languages'],
              }}
            >
              <Form.Item label="主题" name="theme">
                <Radio.Group>
                  <Radio.Button value="light">浅色</Radio.Button>
                  <Radio.Button value="dark">深色</Radio.Button>
                  <Radio.Button value="auto">自动</Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item name="showStats" valuePropName="checked">
                <Checkbox>显示统计卡片</Checkbox>
              </Form.Item>

              <Form.Item name="showVisitors" valuePropName="checked">
                <Checkbox>显示访问统计</Checkbox>
              </Form.Item>

              <Form.Item label="包含板块">
                <Checkbox.Group options={availableSections} name="sections" />
              </Form.Item>

              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  icon={<EyeOutlined />}
                  onClick={handlePreview}
                  disabled={isLoading}
                  block
                >
                  预览
                </Button>
                <Button
                  type="primary"
                  icon={<ThunderboltOutlined />}
                  onClick={handleGenerate}
                  loading={isLoading}
                  block
                >
                  生成 README
                </Button>
              </Space>
            </Form>
          </Card>
        </Col>

        {/* Content Panel */}
        <Col xs={24} md={16}>
          {error && (
            <Alert
              message="生成失败"
              description={error}
              type="error"
              showIcon
              closable
              onClose={clearError}
              style={{ marginBottom: 16 }}
            />
          )}

          <Card
            title={
              <Space>
                <EditOutlined />
                <span>README 内容</span>
                {wordCount > 0 && (
                  <span style={{ color: '#999', fontSize: 12 }}>
                    ({wordCount} words, {lineCount} lines)
                  </span>
                )}
              </Space>
            }
            extra={
              <Space>
                <Button
                  icon={<CopyOutlined />}
                  onClick={handleCopy}
                  disabled={!previewReadme && !generatedReadme}
                >
                  复制
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleDownload}
                  disabled={!previewReadme && !generatedReadme}
                >
                  下载
                </Button>
                <Button
                  type="primary"
                  icon={<SyncOutlined />}
                  onClick={handleSyncToGitHub}
                  disabled={!previewReadme && !generatedReadme}
                >
                  同步到 GitHub
                </Button>
              </Space>
            }
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'generate',
                  label: '配置',
                  children: (
                    <Alert
                      message="准备生成"
                      description="在左侧配置选项后，点击预览或生成按钮"
                      type="info"
                      showIcon
                    />
                  ),
                },
                {
                  key: 'preview',
                  label: '预览',
                  children: previewReadme ? (
                    <pre style={{
                      background: '#f5f5f5',
                      padding: 16,
                      borderRadius: 8,
                      overflow: 'auto',
                      maxHeight: 600,
                      fontFamily: 'monospace',
                      fontSize: 13,
                    }}>
                      {previewReadme}
                    </pre>
                  ) : (
                    <Alert message="暂无预览内容" type="info" />
                  ),
                },
                {
                  key: 'result',
                  label: '生成结果',
                  children: generatedReadme ? (
                    <pre style={{
                      background: '#f5f5f5',
                      padding: 16,
                      borderRadius: 8,
                      overflow: 'auto',
                      maxHeight: 600,
                      fontFamily: 'monospace',
                      fontSize: 13,
                    }}>
                      {generatedReadme}
                    </pre>
                  ) : (
                    <Alert message="暂无生成内容" type="info" />
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReadmePage;
