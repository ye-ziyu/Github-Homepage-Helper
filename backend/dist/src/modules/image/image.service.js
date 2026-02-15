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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const redis_service_1 = require("../../common/redis/redis.service");
const uuid_1 = require("uuid");
let ImageService = class ImageService {
    constructor(imageQueue, prisma, redis) {
        this.imageQueue = imageQueue;
        this.prisma = prisma;
        this.redis = redis;
    }
    async generateAvatar(userId, generateAvatarDto) {
        const jobId = (0, uuid_1.v4)();
        const history = await this.prisma.generationHistory.create({
            data: {
                userId,
                generationType: 'avatar',
                inputConfig: {
                    userInfo: generateAvatarDto.userInfo,
                    config: generateAvatarDto.config
                },
                status: 'pending',
                taskId: jobId,
            },
        });
        await this.imageQueue.add('generate-avatar', {
            userId,
            config: generateAvatarDto.config,
            jobId,
            historyId: history.id,
        });
        return {
            jobId,
            status: 'pending',
            estimatedTime: 30,
            createdAt: new Date().toISOString(),
        };
    }
    async getStyles() {
        return [
            {
                id: 'realistic',
                name: 'Realistic',
                description: 'Photorealistic portrait',
                preview: '/styles/realistic.jpg',
            },
            {
                id: 'cartoon',
                name: 'Cartoon',
                description: 'Cartoon style avatar',
                preview: '/styles/cartoon.jpg',
            },
            {
                id: 'pixel',
                name: 'Pixel Art',
                description: '8-bit pixel art style',
                preview: '/styles/pixel.jpg',
            },
            {
                id: 'illustration',
                name: 'Illustration',
                description: 'Digital illustration style',
                preview: '/styles/illustration.jpg',
            },
            {
                id: 'minimal',
                name: 'Minimalist',
                description: 'Clean and simple design',
                preview: '/styles/minimal.jpg',
            },
        ];
    }
};
exports.ImageService = ImageService;
exports.ImageService = ImageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bull_1.InjectQueue)('image-generation')),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], ImageService);
//# sourceMappingURL=image.service.js.map