import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, Space, Alert, Radio, Select } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';
import { useBioStore } from '../stores/bioStore';
import { useUserStore } from '../stores/userStore';
import { syncApi } from '../api';

const { Title, Paragraph } = Typography;

const InfoConfirmPage = () => {
  const navigate = useNavigate();
  const { generatedShortBio, shortBioLanguage, setShortBioLanguage, bioOption, setBioOption } = useBioStore();
  const { userInfo, fetchUserInfo } = useUserStore();
  const [form] = Form.useForm();

  useEffect(() => {
    // Fetch latest user info from GitHub API to ensure original bio is up to date
    fetchUserInfo(true);
  }, [fetchUserInfo]);

  useEffect(() => {
    if (userInfo) {
      form.setFieldsValue({
        displayName: userInfo.displayName,
        location: userInfo.location,
        blog: userInfo.blog,
        company: userInfo.company,
        twitterUsername: userInfo.twitterUsername,
      });
    }
  }, [userInfo, form]);

  useEffect(() => {
    if (bioOption === 'generated' && generatedShortBio) {
      // Extract the selected language part
      const parsedBio = parseShortBio(generatedShortBio);
      form.setFieldsValue({ bio: shortBioLanguage === 'zh' ? parsedBio.zh : parsedBio.en || generatedShortBio });
    }
  }, [bioOption, generatedShortBio, shortBioLanguage, form]);

  const handleSubmit = async (values: any) => {
    try {
      // Remove displayName from values as it's not allowed in the backend DTO
      const { displayName, ...profileValues } = values;
      await syncApi.profile(profileValues);
      // Refresh user info from GitHub to ensure dashboard shows latest bio
      await fetchUserInfo(true);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleBioOptionChange = (e: any) => {
    const value = e.target.value;
    setBioOption(value);
    
    if (value === 'generated' && generatedShortBio) {
      // Extract the selected language part
      const parsedBio = parseShortBio(generatedShortBio);
      form.setFieldsValue({ bio: shortBioLanguage === 'zh' ? parsedBio.zh : parsedBio.en || generatedShortBio });
    } else if (value === 'original' && userInfo) {
      form.setFieldsValue({ bio: userInfo.bio });
    }
  };

  const handleLanguageOptionChange = (value: string) => {
    setShortBioLanguage(value as 'zh' | 'en');
    
    if (bioOption === 'generated' && generatedShortBio) {
      // Extract the selected language part
      const parsedBio = parseShortBio(generatedShortBio);
      form.setFieldsValue({ bio: value === 'zh' ? parsedBio.zh : parsedBio.en || generatedShortBio });
    }
  };

  const parseShortBio = (shortBio: string) => {
    if (!shortBio) return { zh: '', en: '' };
    
    const parts = shortBio.split('\n\n');
    if (parts.length === 2) {
      return {
        zh: parts[0].trim(),
        en: parts[1].trim()
      };
    }
    
    return { zh: shortBio, en: '' };
  };

  if (!userInfo) {
    return <Alert message="未登录" description="请先登录" type="warning" showIcon />;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/dashboard')}
        >
          返回仪表板
        </Button>
        <Button
          onClick={() => navigate('/bio')}
        >
          返回生成简介
        </Button>
      </Space>

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

          {/* Bio Comparison Section */}
          {generatedShortBio && (
            <Card title="简介选择" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
                <Select
                  value={shortBioLanguage}
                  onChange={handleLanguageOptionChange}
                  style={{ width: 120 }}
                  options={[
                    { value: 'zh', label: '中文' },
                    { value: 'en', label: '英文' },
                  ]}
                />
                <Radio.Group value={bioOption} onChange={handleBioOptionChange}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Radio value="original">
                      <div style={{ padding: '8px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                        <strong>原始简介：</strong>
                        <div style={{ marginTop: '4px', minHeight: '40px' }}>
                          {userInfo.bio || '无'}
                        </div>
                      </div>
                    </Radio>
                    <Radio value="generated">
                      <div style={{ padding: '8px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                        <strong>生成简介：</strong>
                        <div style={{ marginTop: '4px', minHeight: '40px' }}>
                          {shortBioLanguage === 'zh' ? parseShortBio(generatedShortBio).zh : parseShortBio(generatedShortBio).en || generatedShortBio}
                        </div>
                      </div>
                    </Radio>
                  </Space>
                </Radio.Group>
              </Space>
            </Card>
          )}

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
