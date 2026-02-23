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
  Radio,
  Progress,
  message,
  Image,
} from 'antd';
import {
  ArrowLeftOutlined,
  ThunderboltOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { imageApi } from '../api';

const { Paragraph, Text } = Typography;

interface StyleOption {
  id: string;
  name: string;
  description: string;
}

interface ModelOption {
  id: string;
  name: string;
  description: string;
}

interface JobStatusResponse {
  status: string;
  progress: number;
  result: {
    imageUrl: string;
    prompt: string;
    style: string;
  } | null;
  error: string;
}

interface GenerateResponse {
  jobId: string;
  status: string;
  estimatedTime: number;
  createdAt: string;
}

const ImagePage = () => {
  const navigate = useNavigate();
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [styles, setStyles] = useState<StyleOption[]>([]);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadStyles();
    loadModels();
  }, []);

  const loadStyles = async () => {
    try {
      const response = await imageApi.getStyles() as unknown as StyleOption[];
      setStyles(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to load styles:', error);
    }
  };

  const loadModels = async () => {
    try {
      const response = await imageApi.getModels() as unknown as ModelOption[];
      setModels(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const maxAttempts = 60;
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        message.error('生成超时，请重试');
        setIsLoading(false);
        return;
      }

      try {
        const status = await imageApi.getJobStatus(jobId) as unknown as JobStatusResponse;

        console.log('Job status:', status);
        setProgress(status.progress || 0);

        if (status.status === 'completed') {
          if (status.result?.imageUrl) {
            setGeneratedImage(status.result.imageUrl);
            message.success('头像生成成功！');
          } else {
            message.error('生成结果为空');
          }
          setIsLoading(false);
          setCurrentJobId(null);
          return;
        } else if (status.status === 'failed') {
          message.error('生成失败: ' + (status.error || '未知错误'));
          setIsLoading(false);
          setCurrentJobId(null);
          return;
        } else {
          attempts++;
          setTimeout(poll, 2000);
        }
      } catch (error: unknown) {
        console.error('Poll error:', error);
        attempts++;
        setTimeout(poll, 2000);
      }
    };

    await poll();
  };

  const handleGenerate = async (values: Record<string, unknown>) => {
    setIsLoading(true);
    setProgress(0);
    setGeneratedImage(null);

    try {
      console.log('Generating avatar with config:', values);
      
      const response = await imageApi.generateAvatar({
        config: values,
      }) as unknown as GenerateResponse;

      console.log('Generate response:', response);

      if (response.jobId) {
        setCurrentJobId(response.jobId);
        await pollJobStatus(response.jobId);
      } else {
        message.error('未获取到任务ID');
        setIsLoading(false);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Generation error:', error);
      setIsLoading(false);
      message.error('生成失败: ' + (err.message || '未知错误'));
    }
  };

  const handleDownload = async () => {
    if (generatedImage) {
      try {
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `github-avatar-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        message.success('下载成功！');
      } catch (error) {
        message.error('下载失败: ' + ((error as Error).message || '未知错误'));
      }
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px 0' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/dashboard')}
        style={{ marginBottom: 16 }}
      >
        返回仪表板
      </Button>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          message="图片生成服务"
          description="使用API易的Sora Image生图API生成个性化头像。请确保已在.env文件中配置了API_EASY_KEY。"
          type="info"
          showIcon
        />

        <Card title="生成个性化头像">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleGenerate}
            initialValues={{
              style: 'realistic',
              gender: 'undefined',
              ageGroup: 'adult',
              model: 'dall-e-3',
              size: '1024x1024',
            }}
            style={{ maxWidth: 500 }}
          >
            <Form.Item
              label="AI模型"
              name="model"
              initialValue="dall-e-3"
            >
              <Select
                style={{ width: '100%' }}
                placeholder="选择AI模型"
                optionLabelProp="label"
              >
                <Select.Option key="dall-e-3" value="dall-e-3" label="DALL-E 3">
                  <div>
                    <div style={{ fontWeight: 500 }}>DALL-E 3</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>高质量图像生成，支持hd高清</div>
                  </div>
                </Select.Option>
                <Select.Option key="dall-e-2" value="dall-e-2" label="DALL-E 2">
                  <div>
                    <div style={{ fontWeight: 500 }}>DALL-E 2</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>经典图像生成，快速响应</div>
                  </div>
                </Select.Option>
                <Select.Option key="sd-3.5" value="sd-3.5" label="Stable Diffusion 3.5">
                  <div>
                    <div style={{ fontWeight: 500 }}>Stable Diffusion 3.5</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>开源图像模型，创意生成</div>
                  </div>
                </Select.Option>
                <Select.Option key="midjourney-v6" value="midjourney-v6" label="Midjourney V6">
                  <div>
                    <div style={{ fontWeight: 500 }}>Midjourney V6</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>艺术风格图像生成</div>
                  </div>
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="风格"
              name="style"
              rules={[{ required: true, message: '请选择风格' }]}
            >
              <Radio.Group style={{ width: '100%' }}>
                <Radio.Button value="realistic">写实</Radio.Button>
                <Radio.Button value="cartoon">卡通</Radio.Button>
                <Radio.Button value="pixel">像素</Radio.Button>
                <Radio.Button value="illustration">插画</Radio.Button>
                <Radio.Button value="minimal">极简</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="图片尺寸"
              name="size"
            >
              <Select style={{ width: '100%' }}>
                <Select.Option value="1024x1024">1024 x 1024 (方形)</Select.Option>
                <Select.Option value="1792x1024">1792 x 1024 (横向)</Select.Option>
                <Select.Option value="1024x1792">1024 x 1792 (纵向)</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="性别"
              name="gender"
            >
              <Select style={{ width: '100%' }}>
                <Select.Option value="undefined">不指定</Select.Option>
                <Select.Option value="male">男性</Select.Option>
                <Select.Option value="female">女性</Select.Option>
                <Select.Option value="neutral">中性</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="年龄段"
              name="ageGroup"
            >
              <Select style={{ width: '100%' }}>
                <Select.Option value="young">年轻</Select.Option>
                <Select.Option value="adult">成年</Select.Option>
                <Select.Option value="mature">成熟</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="配饰"
              name="accessories"
            >
              <Select
                mode="multiple"
                placeholder="选择配饰（可选）"
                style={{ width: '100%' }}
              >
                <Select.Option value="glasses">眼镜</Select.Option>
                <Select.Option value="headphones">耳机</Select.Option>
                <Select.Option value="hat">帽子</Select.Option>
                <Select.Option value="scarf">围巾</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="表情"
              name="expression"
            >
              <Select style={{ width: '100%' }}>
                <Select.Option value="happy">开心</Select.Option>
                <Select.Option value="smile">微笑</Select.Option>
                <Select.Option value="neutral">中性</Select.Option>
                <Select.Option value="serious">严肃</Select.Option>
                <Select.Option value="cool">酷</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                icon={<ThunderboltOutlined />}
                loading={isLoading}
                block
              >
                {isLoading ? '正在生成...' : '生成头像'}
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {isLoading && (
          <Card>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Paragraph>
                <Text strong>AI 正在生成你的头像...</Text>
              </Paragraph>
              <Progress percent={progress} status="active" />
              <Text type="secondary">
                任务ID: {currentJobId}
                <br />
                生成时间通常需要10-30秒，请耐心等待。
              </Text>
            </Space>
          </Card>
        )}

        {generatedImage && !isLoading && (
          <Card
            title="生成的头像"
            extra={
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownload}
              >
                下载头像
              </Button>
            }
          >
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Image
                src={generatedImage}
                alt="Generated Avatar"
                style={{ 
                  maxWidth: 300, 
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                preview
              />
              <Alert
                message="生成成功"
                description="点击下载按钮保存头像，然后将其上传到你的 GitHub 账户设置中。"
                type="success"
                showIcon
                style={{ marginTop: 16 }}
              />
            </div>
          </Card>
        )}
      </Space>
    </div>
  );
};

export default ImagePage;
