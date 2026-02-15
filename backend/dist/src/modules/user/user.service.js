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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const redis_service_1 = require("../../common/redis/redis.service");
const auth_service_1 = require("../auth/auth.service");
let UserService = class UserService {
    constructor(prisma, redis, authService) {
        this.prisma = prisma;
        this.redis = redis;
        this.authService = authService;
    }
    async getUserInfo(userId, refresh = false) {
        const cacheKey = `user:${userId}:info`;
        if (!refresh) {
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { preferencesRel: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const userInfo = {
            id: user.id,
            githubId: user.githubId,
            username: user.username,
            displayName: user.displayName,
            email: user.email,
            bio: user.bio,
            location: user.location,
            blog: user.blog,
            company: user.company,
            twitterUsername: user.twitterUsername,
            avatarUrl: user.avatarUrl,
            followers: user.followers,
            following: user.following,
            publicRepos: user.publicRepos,
            stars: user.stars,
            languages: user.languages,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        };
        await this.redis.set(cacheKey, JSON.stringify(userInfo), 300);
        return userInfo;
    }
    async getUserRepos(userId, options) {
        const cacheKey = `user:${userId}:repos:${options.cursor || '0'}:${options.page_size}`;
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const result = {
            repos: [],
            pagination: {
                next_cursor: null,
                prev_cursor: null,
                has_more: false,
                total: user.publicRepos,
            },
        };
        await this.redis.set(cacheKey, JSON.stringify(result), 1800);
        return result;
    }
    async getUserLanguages(userId) {
        const cacheKey = `user:${userId}:languages`;
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const languages = user.languages;
        const result = {
            languages: languages || [],
            cachedAt: new Date().toISOString(),
        };
        await this.redis.set(cacheKey, JSON.stringify(result), 3600);
        return result;
    }
    async getUserStats(userId) {
        const cacheKey = `user:${userId}:stats`;
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const result = {
            followers: user.followers,
            following: user.following,
            publicRepos: user.publicRepos,
            totalStarsReceived: user.stars,
            totalStarsGiven: 0,
            totalCommits: 0,
            totalPullRequests: 0,
            totalIssues: 0,
            contributionGraph: {
                total: 0,
                lastYear: 0,
                longestStreak: 0,
                currentStreak: 0,
            },
            cachedAt: new Date().toISOString(),
        };
        await this.redis.set(cacheKey, JSON.stringify(result), 300);
        return result;
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        auth_service_1.AuthService])
], UserService);
//# sourceMappingURL=user.service.js.map