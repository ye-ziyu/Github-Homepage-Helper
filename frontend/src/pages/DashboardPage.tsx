import { useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Avatar,
  Typography,
  Tag,
  List,
  Skeleton,
  Alert,
  Button,
} from 'antd';
import {
  UserOutlined,
  StarOutlined,
  ForkOutlined,
  GithubOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';

const { Title, Paragraph, Text } = Typography;

const DashboardPage = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuthStore();
  const {
    userInfo: userDetail,
    stats,
    languages,
    isLoading,
    error,
    fetchUserInfo,
    fetchStats,
    fetchLanguages,
  } = useUserStore();

  useEffect(() => {
    if (userInfo?.id) {
      fetchUserInfo(true); // Force refresh from GitHub API
      fetchStats();
      fetchLanguages();
    }
  }, [userInfo?.id]);

  if (isLoading && !userDetail) {
    return (
      <Card>
        <Skeleton active />
      </Card>
    );
  }

  if (error) {
    return <Alert message="加载失败" description={error} type="error" showIcon />;
  }

  const user = userDetail || userInfo;
  if (!user) {
    return <Alert message="未登录" description="请先登录" type="warning" showIcon />;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Row gutter={[24, 24]}>
        {/* User Info Card */}
        <Col xs={24} md={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Avatar
                size={100}
                src={user.avatarUrl}
                icon={<UserOutlined />}
                style={{ marginBottom: 16 }}
              />
              <Title level={3} style={{ marginBottom: 8 }}>
                {user.displayName || user.username}
              </Title>
              <Text type="secondary">@{user.username}</Text>
              {user.bio && (
                <Paragraph
                  style={{ marginTop: 16, marginBottom: 0 }}
                >
                  {user.bio}
                </Paragraph>
              )}
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                {user.company && <Tag icon={<GithubOutlined />}>{user.company}</Tag>}
                {user.location && <Tag>{user.location}</Tag>}
                {user.blog && <Tag href={user.blog} target="_blank">Blog</Tag>}
              </div>
            </div>
            <Button
              type="primary"
              block
              size="large"
              style={{ marginTop: 24 }}
              onClick={() => navigate('/bio')}
            >
              生成个人简介
            </Button>
          </Card>
        </Col>

        {/* Stats Cards */}
        <Col xs={24} md={16}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Followers"
                  value={user.followers}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Following"
                  value={user.following}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Public Repos"
                  value={user.publicRepos}
                  prefix={<CodeOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Stars"
                  value={user.stars}
                  prefix={<StarOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* Contribution Stats */}
          {stats && (
            <Card title="贡献统计" style={{ marginTop: 24 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Last Year Contributions"
                    value={stats.contributionGraph.lastYear}
                    suffix="commits"
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Current Streak"
                    value={stats.contributionGraph.currentStreak}
                    suffix="days"
                  />
                </Col>
              </Row>
            </Card>
          )}

          {/* Languages */}
          {languages && languages.languages.length > 0 && (
            <Card title="编程语言" style={{ marginTop: 24 }}>
              <List
                dataSource={languages.languages.slice(0, 6)}
                renderItem={(lang) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Tag color="blue">{lang.name}</Tag>}
                      title={`${(lang.percentage * 100).toFixed(1)}%`}
                      description={`${lang.repos} repositories`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}

          {/* Quick Actions */}
          <Card title="快速操作" style={{ marginTop: 24 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Button
                  block
                  size="large"
                  icon={<UserOutlined />}
                  onClick={() => navigate('/bio')}
                >
                  生成简介
                </Button>
              </Col>
              <Col span={8}>
                <Button
                  block
                  size="large"
                  icon={<StarOutlined />}
                  onClick={() => navigate('/image')}
                >
                  生成头像
                </Button>
              </Col>
              <Col span={8}>
                <Button
                  block
                  size="large"
                  icon={<ForkOutlined />}
                  onClick={() => navigate('/readme')}
                >
                  生成 README
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
