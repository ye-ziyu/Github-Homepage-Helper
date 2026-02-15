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
exports.BioService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const redis_service_1 = require("../../common/redis/redis.service");
const uuid_1 = require("uuid");
let BioService = class BioService {
    constructor(bioQueue, prisma, redis) {
        this.bioQueue = bioQueue;
        this.prisma = prisma;
        this.redis = redis;
    }
    async generateBio(userId, generateBioDto) {
        const jobId = (0, uuid_1.v4)();
        const history = await this.prisma.generationHistory.create({
            data: {
                userId,
                generationType: 'bio',
                inputConfig: {
                    userInfo: generateBioDto.userInfo,
                    config: generateBioDto.config
                },
                status: 'pending',
                taskId: jobId,
            },
        });
        await this.bioQueue.add('generate-bio', {
            userId,
            config: generateBioDto.config,
            jobId,
            historyId: history.id,
        });
        return {
            jobId,
            status: 'pending',
            estimatedTime: 10,
            createdAt: new Date().toISOString(),
        };
    }
    async getJobStatus(jobId) {
        const cached = await this.redis.get(`job:${jobId}`);
        if (cached) {
            return JSON.parse(cached);
        }
        const history = await this.prisma.generationHistory.findFirst({
            where: { taskId: jobId },
        });
        if (!history) {
            return {
                jobId,
                status: 'not_found',
                progress: 0,
                result: null,
                error: null,
            };
        }
        const result = {
            jobId,
            status: history.status,
            progress: history.progress,
            result: history.outputResult ? JSON.parse(history.outputResult) : null,
            error: history.errorMessage,
        };
        await this.redis.set(`job:${jobId}`, JSON.stringify(result), 60);
        return result;
    }
    async getTemplates() {
        return [
            {
                id: 'developer',
                name: 'Developer',
                description: 'Professional developer bio',
                template: 'I am a passionate {languages} developer with {years} years of experience.',
            },
            {
                id: 'student',
                name: 'Student',
                description: 'Student/learner bio',
                template: 'I am a student learning {languages} and interested in {topics}.',
            },
            {
                id: 'open-source',
                name: 'Open Source',
                description: 'Open source contributor bio',
                template: 'I contribute to open source projects and love building things with {languages}.',
            },
        ];
    }
};
exports.BioService = BioService;
exports.BioService = BioService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bull_1.InjectQueue)('bio-generation')),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], BioService);
//# sourceMappingURL=bio.service.js.map