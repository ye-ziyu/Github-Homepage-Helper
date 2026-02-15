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
exports.SyncService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const redis_service_1 = require("../../common/redis/redis.service");
const auth_service_1 = require("../auth/auth.service");
const github_service_1 = require("../auth/github.service");
let SyncService = class SyncService {
    constructor(prisma, redis, authService, githubService) {
        this.prisma = prisma;
        this.redis = redis;
        this.authService = authService;
        this.githubService = githubService;
    }
    async syncProfile(userId, syncProfileDto) {
        const token = '';
        if (!token) {
            throw new common_1.UnauthorizedException('GitHub token not found');
        }
        const updatedProfile = await this.githubService.updateProfile(token, {
            bio: syncProfileDto.bio,
            location: syncProfileDto.location,
            blog: syncProfileDto.blog,
            company: syncProfileDto.company,
            twitter_username: syncProfileDto.twitterUsername,
        });
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                bio: syncProfileDto.bio,
                location: syncProfileDto.location,
                blog: syncProfileDto.blog,
                company: syncProfileDto.company,
                twitterUsername: syncProfileDto.twitterUsername,
            },
        });
        await this.redis.del(`user:${userId}:info`);
        return { success: true, profile: updatedProfile };
    }
    async syncReadme(userId, body) {
        const token = '';
        if (!token) {
            throw new common_1.UnauthorizedException('GitHub token not found');
        }
        const contentBase64 = Buffer.from(body.content).toString('base64');
        return {
            success: true,
            message: 'README synced successfully',
            url: `https://github.com/${body.owner}/${body.repo}/blob/main/README.md`,
        };
    }
    async createPullRequest(userId, body) {
        const token = '';
        if (!token) {
            throw new common_1.UnauthorizedException('GitHub token not found');
        }
        return {
            success: true,
            message: 'Pull request created',
            url: `https://github.com/${body.owner}/${body.repo}/pull/${body.prNumber}`,
        };
    }
};
exports.SyncService = SyncService;
exports.SyncService = SyncService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        auth_service_1.AuthService,
        github_service_1.GitHubService])
], SyncService);
//# sourceMappingURL=sync.service.js.map