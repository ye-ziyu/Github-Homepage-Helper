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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const redis_service_1 = require("../../common/redis/redis.service");
const github_service_1 = require("./github.service");
let AuthService = class AuthService {
    constructor(jwtService, prisma, redis, githubService) {
        this.jwtService = jwtService;
        this.prisma = prisma;
        this.redis = redis;
        this.githubService = githubService;
    }
    async validateGitHubToken(token) {
        const userInfo = await this.githubService.getUserInfo(token);
        if (!userInfo) {
            throw new common_1.UnauthorizedException('Invalid GitHub token');
        }
        let user = await this.prisma.user.findUnique({
            where: { githubId: userInfo.id.toString() },
            include: { preferencesRel: true },
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    githubId: userInfo.id.toString(),
                    username: userInfo.login,
                    displayName: userInfo.name,
                    email: userInfo.email,
                    bio: userInfo.bio,
                    location: userInfo.location,
                    blog: userInfo.blog,
                    company: userInfo.company,
                    twitterUsername: userInfo.twitter_username,
                    avatarUrl: userInfo.avatar_url,
                    followers: userInfo.followers,
                    following: userInfo.following,
                    publicRepos: userInfo.public_repos,
                    lastSyncAt: new Date(),
                    preferencesRel: {
                        create: {},
                    },
                },
                include: { preferencesRel: true },
            });
        }
        else {
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    displayName: userInfo.name || user.displayName,
                    email: userInfo.email || user.email,
                    bio: userInfo.bio,
                    location: userInfo.location,
                    blog: userInfo.blog,
                    company: userInfo.company,
                    twitterUsername: userInfo.twitter_username,
                    avatarUrl: userInfo.avatar_url,
                    followers: userInfo.followers,
                    following: userInfo.following,
                    publicRepos: userInfo.public_repos,
                    lastSyncAt: new Date(),
                },
                include: { preferencesRel: true },
            });
            await this.redis.set(`user:${user.id}`, JSON.stringify(user), 3600);
        }
        const jwtToken = this.jwtService.sign({
            userId: user.id,
            githubId: user.githubId,
            username: user.username,
        });
        return {
            isValid: true,
            userInfo: {
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
            },
            scopes: ['user', 'repo'],
            jwtToken,
            expiresIn: 86400,
        };
    }
    async validateUser(userId) {
        const cached = await this.redis.get(`user:${userId}`);
        if (cached) {
            return JSON.parse(cached);
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (user) {
            await this.redis.set(`user:${userId}`, JSON.stringify(user), 3600);
        }
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        github_service_1.GitHubService])
], AuthService);
//# sourceMappingURL=auth.service.js.map