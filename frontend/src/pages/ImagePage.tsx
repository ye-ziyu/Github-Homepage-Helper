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
  Radio,
  Tag,
  Progress,
  Input,
  ColorPicker,
  message,
  Image,
} from 'antd';
import {
  ArrowLeftOutlined,
  ThunderboltOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';
import { useBioStore } from '../stores/bioStore';
import { ImageStyle, ImageGender, ImageAgeGroup } from '../types';

const { Title, Paragraph } = Typography;

const ImagePage = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuthStore();
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [form] = Form.useForm();

  const handleGenerate = async (values: any) => {
    setIsLoading(true);
    setProgress(0);
    setGeneratedImage(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Call API to generate avatar
      // const response = await imageApi.generateAvatar({ config: values });

      // For demo, use a placeholder image
      setTimeout(() => {
        clearInterval(progressInterval);
        setProgress(100);
        setGeneratedImage('https://api.dicebear.com/7.x/avataaars/svg?seed=' + userInfo?.username);
        setIsLoading(false);
        message.success('头像生成成功！');
      }, 5000);
    } catch (error: any) {
      setIsLoading(false);
      message.error('生成失败: ' + error.message);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'github-avatar.png';
      link.click();
      message.success('下载成功！');
    }
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
        {/* Avatar Config */}
        <Card title="生成头像">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleGenerate}
            initialValues={{
              style: 'realistic',
              gender: 'undefined',
              ageGroup: 'adult',
              backgroundColor: '#ffffff',
            }}
          >
            <Form.Item
              label="风格"
              name="style"
              rules={[{ required: true }]}
            >
              <Radio.Group>
                <Radio.Button value="realistic">写实</Radio.Button>
                <Radio.Button value="cartoon">卡通</Radio.Button>
                <Radio.Button value="pixel">像素</Radio.Button>
                <Radio.Button value="illustration">插画</Radio.Button>
                <Radio.Button value="minimal">极简</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="性别"
              name="gender"
            >
              <Select
                options={[
                  { value: 'undefined', label: '不指定' },
                  { value: 'male', label: '男性' },
                  { value: 'female', label: '女性' },
                  { value: 'neutral', label: '中性' },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="年龄段"
              name="ageGroup"
            >
              <Select
                options={[
                  { value: 'young', label: '年轻' },
                  { value: 'adult', label: '成年' },
                  { value: 'mature', label: '成熟' },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="配饰"
              name="accessories"
            >
              <Select
                mode="tags"
                placeholder="选择配饰（可选）"
                options={[
                  { value: 'glasses', label: '眼镜' },
                  { value: 'headphones', label: '耳机' },
                  { value: 'hat', label: '帽子' },
                  { value: 'scarf', label: '围巾' },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="表情"
              name="expression"
            >
              <Select
                options={[
                  { value: 'happy', label: '开心' },
                  { value: 'smile', label: '微笑' },
                  { value: 'neutral', label: '中性' },
                  { value: 'serious', label: '严肃' },
                  { value: 'cool', label: '酷' },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="背景颜色"
              name="backgroundColor"
            >
              <ColorPicker format="hex" />
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
                生成头像
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Progress */}
        {isLoading && (
          <Card>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Paragraph>AI 正在生成你的头像...</Paragraph>
              <Progress percent={progress} status="active" />
            </Space>
          </Card>
        )}

        {/* Result */}
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
            <div style={{ textAlign: 'center', padding: 24 }}>
              <Image
                src={generatedImage}
                alt="Generated Avatar"
                style={{ maxWidth: 300, borderRadius: 16 }}
                preview
              />
              <Alert
                message="生成成功"
                description="点击下载按钮保存头像，然后将其上传到你的 GitHub 账户"
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
