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
var BioQueueProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BioQueueProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma.service");
const redis_service_1 = require("../../../common/redis/redis.service");
let BioQueueProcessor = BioQueueProcessor_1 = class BioQueueProcessor {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
        this.logger = new common_1.Logger(BioQueueProcessor_1.name);
    }
    async handleBioGeneration(job) {
        const { userId, config, jobId, historyId } = job.data;
        this.logger.log(`Processing bio generation for user ${userId}`);
        try {
            await this.updateProgress(historyId, 10);
            await this.updateJobCache(jobId, 10);
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new Error('User not found');
            }
            await this.updateProgress(historyId, 30);
            await this.updateJobCache(jobId, 30);
            const bio = await this.generateBioContent(user, config);
            await this.updateProgress(historyId, 80);
            await this.updateJobCache(jobId, 80);
            const result = {
                bio,
                wordCount: bio.split(/\s+/).filter(w => w.length > 0).length,
                characterCount: bio.length,
            };
            await this.prisma.generationHistory.update({
                where: { id: historyId },
                data: {
                    status: 'completed',
                    progress: 100,
                    outputResult: JSON.stringify(result),
                },
            });
            await this.updateProgress(historyId, 100);
            await this.updateJobCache(jobId, 100);
            setTimeout(() => {
                this.redis.del(`job:${jobId}`);
            }, 3600000);
            return result;
        }
        catch (error) {
            this.logger.error(`Bio generation failed: ${error.message}`);
            await this.prisma.generationHistory.update({
                where: { id: historyId },
                data: {
                    status: 'failed',
                    errorMessage: error.message,
                },
            });
            await this.updateJobCache(jobId, 100);
            throw error;
        }
    }
    async generateBioContent(user, config) {
        const displayName = user.displayName || user.username;
        const languages = user.languages.slice(0, 3).join(', ');
        const company = user.company ? ` at ${user.company}` : '';
        let bio = '';
        switch (config.language) {
            case 'zh':
                bio = `我是一名${languages || '全栈'}开发者${company}。`;
                if (user.bio) {
                    bio += ` ${user.bio}`;
                }
                switch (config.style) {
                    case 'professional':
                        bio += ' 专注于构建高质量、可扩展的软件解决方案。';
                        break;
                    case 'casual':
                        bio += ' 热爱编程，享受创造的过程。';
                        break;
                    case 'humorous':
                        bio += ' 代码是我的母语，bug是我的朋友。';
                        break;
                    case 'minimal':
                        bio += ' 简单即是美。';
                        break;
                }
                break;
            case 'en':
            default:
                bio = `I am a ${languages || 'full-stack'} developer${company}.`;
                if (user.bio) {
                    bio += ` ${user.bio}`;
                }
                switch (config.style) {
                    case 'professional':
                        bio += ' I focus on building high-quality, scalable software solutions.';
                        break;
                    case 'casual':
                        bio += ' I love coding and enjoy the creative process.';
                        break;
                    case 'humorous':
                        bio += ' I speak code and make friends with bugs.';
                        break;
                    case 'minimal':
                        bio += ' Simple is beautiful.';
                        break;
                }
                break;
        }
        return bio.trim();
    }
    async updateProgress(historyId, progress) {
        await this.prisma.generationHistory.update({
            where: { id: historyId },
            data: { progress },
        });
    }
    async updateJobCache(jobId, progress) {
        await this.redis.set(`job:${jobId}`, JSON.stringify({
            jobId,
            status: progress < 100 ? 'processing' : 'completed',
            progress,
            result: null,
            error: null,
        }), 60);
    }
};
exports.BioQueueProcessor = BioQueueProcessor;
__decorate([
    (0, bull_1.Process)('generate-bio'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BioQueueProcessor.prototype, "handleBioGeneration", null);
exports.BioQueueProcessor = BioQueueProcessor = BioQueueProcessor_1 = __decorate([
    (0, bull_1.Processor)('bio-generation'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], BioQueueProcessor);
//# sourceMappingURL=bio-queue.processor.js.map