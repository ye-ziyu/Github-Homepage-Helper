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
exports.GitHubService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let GitHubService = class GitHubService {
    constructor() {
        this.client = axios_1.default.create({
            baseURL: 'https://api.github.com',
            timeout: 10000,
        });
    }
    async getUserInfo(token) {
        try {
            const response = await this.client.get('/user', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('GitHub API error:', error);
            return null;
        }
    }
    async getUserRepos(token, options = {}) {
        try {
            const response = await this.client.get('/user/repos', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    page: options.page || 1,
                    per_page: options.per_page || 20,
                    sort: options.sort || 'updated',
                    direction: options.direction || 'desc',
                    type: options.type || 'all',
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('GitHub API error:', error);
            throw new common_1.NotFoundException('Failed to fetch repositories');
        }
    }
    async getUserLanguages(token) {
        const repos = await this.getUserRepos(token, { per_page: 100 });
        const languages = {};
        for (const repo of repos) {
            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
            }
        }
        return languages;
    }
    async updateProfile(token, data) {
        try {
            const response = await this.client.patch('/user', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('GitHub API error:', error);
            throw new common_1.NotFoundException('Failed to update profile');
        }
    }
    async getRateLimit(token) {
        try {
            const response = await this.client.get('/rate_limit', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return {
                remaining: response.data.resources.core.remaining,
                limit: response.data.resources.core.limit,
            };
        }
        catch (error) {
            return { remaining: 0, limit: 5000 };
        }
    }
};
exports.GitHubService = GitHubService;
exports.GitHubService = GitHubService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GitHubService);
//# sourceMappingURL=github.service.js.map