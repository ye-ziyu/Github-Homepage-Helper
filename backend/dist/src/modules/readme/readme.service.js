"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadmeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const redis_service_1 = require("../../common/redis/redis.service");
const user_service_1 = require("../user/user.service");
let ReadmeService = class ReadmeService {
    constructor(prisma, redis, userService) {
        this.prisma = prisma;
        this.redis = redis;
        this.userService = userService;
    }
    async generateReadme(userId, generateReadmeDto) {
        const userInfo = await this.userService.getUserInfo(userId);
        const config = generateReadmeDto.config;
        const readme = this.buildReadme(userInfo, config.sections || [], config.theme || 'auto', config.showStats !== false, config.showVisitors !== false);
        const lines = readme.split('\n').length;
        const words = readme.split(/\s+/).filter(w => w.length > 0).length;
        return {
            readme,
            wordCount: words,
            lineCount: lines,
        };
    }
    async previewReadme(userId, generateReadmeDto) {
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
    buildReadme(userInfo, sections, theme, showStats, showVisitors) {
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
    buildHeader(userInfo, theme) {
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
    buildAbout(userInfo) {
        const bio = userInfo.bio || 'I am a passionate developer.';
        const location = userInfo.location ? `📍 ${userInfo.location}` : '';
        const company = userInfo.company ? `💼 ${userInfo.company}` : '';
        return `## 🙋‍♂️ About

${bio}

${[location, company].filter(Boolean).join(' | ')}

`;
    }
    buildSkills(userInfo) {
        return `## 🛠️ Skills

I work with various technologies and tools.

`;
    }
    buildStats(userInfo, showStats) {
        if (!showStats)
            return '';
        return `## 📊 Stats

![GitHub Stats](https://github-readme-stats.vercel.app/api?username=${userInfo.username}&show_icons=true&hide_border=true)
![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?username=${userInfo.username}&layout=compact&hide_border=true)

`;
    }
    buildProjects(userInfo) {
        return `## 🚀 Projects

Some of my notable projects.

`;
    }
    buildLanguages(userInfo) {
        return `## 💻 Languages

`;
    }
    buildContact(userInfo) {
        const email = userInfo.email ? `- Email: ${userInfo.email}` : '';
        const blog = userInfo.blog ? `- Blog: ${userInfo.blog}` : '';
        return `## 📬 Contact

${[email, blog].filter(Boolean).join('\n')}

`;
    }
    buildFooter(showVisitors) {
        let footer = '\n---\n\n';
        if (showVisitors) {
            footer += '![Visitors](https://visitor-badge.laobi.icu/badge?page_id=yourusername)\n';
        }
        footer += 'Made with ❤️ using [GitHub Profile Enhancer](https://github.com/yourusername)\n';
        return footer;
    }
};
exports.ReadmeService = ReadmeService;
exports.ReadmeService = ReadmeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        user_service_1.UserService])
], ReadmeService);
//# sourceMappingURL=readme.service.js.map