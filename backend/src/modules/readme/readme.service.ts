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
          readme += this.buildFooter(userInfo, showVisitors);
          break;
      }
    }

    return readme;
  }

  private buildHeader(userInfo: any, theme: string): string {
    const username = userInfo.username;
    const displayName = userInfo.displayName || username;
    const bio = userInfo.bio || '热爱编程、音乐、读书、旅行';

    return `
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,2,5,30&height=280&section=header&text=${encodeURIComponent(displayName)}&fontSize=50&fontAlign=50&fontAlignY=40&desc=${encodeURIComponent(bio)}&descSize=20&descAlign=50&descAlignY=60" />
</p>

<p align="center">
  <a href="https://github.com/${username}"><img src="https://img.shields.io/github/followers/${username}?style=flat-square&color=607D8B&label=github%20followers&logo=github" /></a>
  <a href="mailto:${userInfo.email || ''}"><img src="https://img.shields.io/badge/-${encodeURIComponent(userInfo.email || 'email')}-c14438?style=flat-square&logo=Gmail&logoColor=white" /></a>
  <a href="https://twitter.com/${userInfo.twitterUsername || ''}"><img src="https://img.shields.io/twitter/follow/${userInfo.twitterUsername || ''}?style=flat-square&color=blue&logo=x" /></a>
  <img src="https://komarev.com/ghpvc/?username=${username}&style=flat-square&color=orange&label=Views" />
  <a href="https://wakatime.com/@${username}"><img src="https://wakatime.com/badge/user/${username}.svg?style=flat-square" /></a>
</p>

`;
  }

  private buildAbout(userInfo: any): string {
    const bio = userInfo.bio || '我是一名热爱编程的开发者';
    const location = userInfo.location || '地球';
    const company = userInfo.company || '';

    return `
## 👋 嗨，你好！

${bio}

${company ? `\n🏢 **公司:** ${company}\n` : ''}
📍 **位置:** ${location}

`;
  }

  private buildSkills(userInfo: any): string {
    return `
## 🛠️ 技术栈

### 编程语言
<p>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=JavaScript&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=TypeScript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=Python&logoColor=white"/>
  <img src="https://img.shields.io/badge/Java-007396?style=flat-square&logo=Java&logoColor=white"/>
  <img src="https://img.shields.io/badge/Go-00ADD8?style=flat-square&logo=Go&logoColor=white"/>
  <img src="https://img.shields.io/badge/Rust-000000?style=flat-square&logo=Rust&logoColor=white"/>
</p>

### 前端开发
<p>
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=React&logoColor=black"/>
  <img src="https://img.shields.io/badge/Vue.js-4FC08D?style=flat-square&logo=Vue.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Angular-DD0031?style=flat-square&logo=Angular&logoColor=white"/>
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=Next.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square&logo=Tailwind%20CSS&logoColor=white"/>
</p>

### 后端开发
<p>
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=Node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=NestJS&logoColor=white"/>
  <img src="https://img.shields.io/badge/Spring-6DB33F?style=flat-square&logo=Spring&logoColor=white"/>
  <img src="https://img.shields.io/badge/Django-092E20?style=flat-square&logo=Django&logoColor=white"/>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=FastAPI&logoColor=white"/>
</p>

### 数据库与工具
<p>
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=PostgreSQL&logoColor=white"/>
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=MySQL&logoColor=white"/>
  <img src="https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=Redis&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=MongoDB&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=Docker&logoColor=white"/>
  <img src="https://img.shields.io/badge/Kubernetes-326CE5?style=flat-square&logo=Kubernetes&logoColor=white"/>
  <img src="https://img.shields.io/badge/Git-F05032?style=flat-square&logo=Git&logoColor=white"/>
</p>

`;
  }

  private buildStats(userInfo: any, showStats: boolean): string {
    if (!showStats) return '';
    const username = userInfo.username;

    return `
## 📊 GitHub 统计

<div align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&theme=github_dark&hide_border=true&bg_color=0d1117" height="165"/>
  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&layout=compact&theme=github_dark&hide_border=true&bg_color=0d1117" height="165"/>
</div>

<div align="center">
  <img src="https://github-readme-streak-stats.herokuapp.com/?user=${username}&theme=github_dark&hide_border=true&background=0d1117" />
</div>

<div align="center">
  <img src="https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=${username}&theme=github_dark&hide_border=true" />
</div>

<div align="center">
  <img src="https://github-readme-activity-graph.vercel.app/graph?username=${username}&theme=github-compact&hide_border=true&bg_color=0d1117&color=58a6ff&line=58a6ff&point=1f6feb" />
</div>

`;
  }

  private buildProjects(userInfo: any): string {
    const username = userInfo.username;

    return `
## 🚀 我的项目

<div align="center">
  <a href="https://github.com/${username}/codesstyle"><img width="49%" src="https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=codesstyle&theme=github_dark&hide_border=true&bg_color=0d1117" /></a>
  <a href="https://github.com/${username}/WorldSoul-Mod"><img width="49%" src="https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=WorldSoul-Mod&theme=github_dark&hide_border=true&bg_color=0d1117" /></a>
</div>

`;
  }

  private buildLanguages(userInfo: any): string {
    const username = userInfo.username;

    return `
## 💻 Wakatime 统计

<div align="center">
  <img src="https://github-readme-stats.vercel.app/api/wakatime?username=${username}&theme=github_dark&hide_border=true&bg_color=0d1117&layout=compact" />
</div>

## 🏆 GitHub 奖杯

<div align="center">
  <img src="https://github-profile-trophy.vercel.app/?username=${username}&theme=darkhub&no-frame=true&row=1&&margin-w=20&no-bg=true" />
</div>

`;
  }

  private buildContact(userInfo: any): string {
    const username = userInfo.username;
    const email = userInfo.email || '';
    const blog = userInfo.blog || '';

    return `
## 📬 联系我

<p align="center">
  ${email ? `<a href="mailto:${email}"><img src="https://img.shields.io/badge/-Gmail-c14438?style=flat-square&logo=Gmail&logoColor=white&link=mailto:${email}" /></a>` : ''}
  ${blog ? `<a href="${blog}"><img src="https://img.shields.io/badge/Blog-FFA500?style=flat-square&logo=rss&logoColor=white" /></a>` : ''}
  <a href="https://github.com/${username}"><img src="https://img.shields.io/badge/-Github-181717?style=flat-square&logo=GitHub&logoColor=white" /></a>
  ${userInfo.twitterUsername ? `<a href="https://twitter.com/${userInfo.twitterUsername}"><img src="https://img.shields.io/badge/-Twitter-1DA1F2?style=flat-square&logo=x&logoColor=white" /></a>` : ''}
  <a href="https://www.linkedin.com/in/${username}"><img src="https://img.shields.io/badge/-LinkedIn-0077B5?style=flat-square&logo=Linkedin&logoColor=white" /></a>
</p>

`;
  }

  private buildFooter(userInfo: any, showVisitors: boolean): string {
    const username = userInfo.username;

    return `
---

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,2,5,30&height=100&section=footer" />
</div>

<div align="center">
  ${showVisitors ? `<img src="https://visitor-badge.laobi.icu/badge?page_id=${username}.${username}" />` : ''}
  <img src="https://img.shields.io/badge/Made%20with-%E2%9D%A4-red" />
</div>

<div align="center">
  <i>⭐ 由 <a href="https://github.com/${username}">${username}</a> 精心打造</i>
</div>

`;
  }
}
