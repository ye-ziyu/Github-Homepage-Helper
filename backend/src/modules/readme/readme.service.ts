import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { UserService } from '../user/user.service';
import { GenerateReadmeDto } from './dto/generate-readme.dto';

@Injectable()
export class ReadmeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly userService: UserService,
  ) {}

  async generateReadme(userId: string, generateReadmeDto: GenerateReadmeDto) {
    const userInfo = await this.userService.getUserInfo(userId);
    const config = generateReadmeDto.config;

    const readme = this.buildReadme(
      userInfo,
      config.sections || [],
      config.theme || 'auto',
      config.showStats !== false,
      config.showVisitors !== false,
    );

    // Calculate word and line count
    const lines = readme.split('\n').length;
    const words = readme.split(/\s+/).filter(w => w.length > 0).length;

    return {
      readme,
      wordCount: words,
      lineCount: lines,
    };
  }

  async previewReadme(userId: string, generateReadmeDto: GenerateReadmeDto) {
    return this.generateReadme(userId, generateReadmeDto);
  }

  async getTemplates() {
    return [
      {
        id: 'minimal',
        name: 'Minimal',
        description: 'Clean and minimal README',
        sections: ['header', 'about'],
      },
      {
        id: 'developer',
        name: 'Developer',
        description: 'Full developer profile',
        sections: ['header', 'about', 'skills', 'stats', 'projects'],
      },
      {
        id: 'comprehensive',
        name: 'Comprehensive',
        description: 'Complete profile with all sections',
        sections: ['header', 'about', 'skills', 'stats', 'projects', 'languages', 'contact', 'footer'],
      },
    ];
  }

  private buildReadme(
    userInfo: any,
    sections: string[],
    theme: string,
    showStats: boolean,
    showVisitors: boolean,
  ): string {
    let readme = '';

    for (const section of sections) {
      switch (section) {
        case 'header':
          readme += this.buildHeader(userInfo, theme);
          break;
        case 'about':
          readme += this.buildAbout(userInfo);
          break;
        case 'skills':
          readme += this.buildSkills(userInfo);
          break;
        case 'stats':
          readme += this.buildStats(userInfo, showStats);
          break;
        case 'projects':
          readme += this.buildProjects(userInfo);
          break;
        case 'languages':
          readme += this.buildLanguages(userInfo);
          break;
        case 'contact':
          readme += this.buildContact(userInfo);
          break;
        case 'footer':
          readme += this.buildFooter(showVisitors);
          break;
      }
    }

    return readme;
  }

  private buildHeader(userInfo: any, theme: string): string {
    const displayName = userInfo.displayName || userInfo.username;
    const avatarUrl = userInfo.avatarUrl || `https://github.com/${userInfo.username}.png`;

    return `
<div align="center">
  <img src="${avatarUrl}" alt="Avatar" style="width: 150px; border-radius: 50%;">
  <h2 align="center">${displayName}</h2>
  <p align="center">
    <a href="https://github.com/${userInfo.username}">GitHub</a> •
    <a href="https://twitter.com/${userInfo.twitterUsername || ''}">Twitter</a>
  </p>
</div>

`;
  }

  private buildAbout(userInfo: any): string {
    const bio = userInfo.bio || 'I am a passionate developer.';
    const location = userInfo.location ? `📍 ${userInfo.location}` : '';
    const company = userInfo.company ? `💼 ${userInfo.company}` : '';

    return `## 🙋‍♂️ About

${bio}

${[location, company].filter(Boolean).join(' | ')}

`;
  }

  private buildSkills(userInfo: any): string {
    return `## 🛠️ Skills

I work with various technologies and tools.

`;
  }

  private buildStats(userInfo: any, showStats: boolean): string {
    if (!showStats) return '';

    return `## 📊 Stats

![GitHub Stats](https://github-readme-stats.vercel.app/api?username=${userInfo.username}&show_icons=true&hide_border=true)
![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?username=${userInfo.username}&layout=compact&hide_border=true)

`;
  }

  private buildProjects(userInfo: any): string {
    return `## 🚀 Projects

Some of my notable projects.

`;
  }

  private buildLanguages(userInfo: any): string {
    return `## 💻 Languages

`;
  }

  private buildContact(userInfo: any): string {
    const email = userInfo.email ? `- Email: ${userInfo.email}` : '';
    const blog = userInfo.blog ? `- Blog: ${userInfo.blog}` : '';

    return `## 📬 Contact

${[email, blog].filter(Boolean).join('\n')}

`;
  }

  private buildFooter(showVisitors: boolean): string {
    let footer = '\n---\n\n';

    if (showVisitors) {
      footer += '![Visitors](https://visitor-badge.laobi.icu/badge?page_id=yourusername)\n';
    }

    footer += 'Made with ❤️ using [GitHub Profile Enhancer](https://github.com/yourusername)\n';

    return footer;
  }
}
