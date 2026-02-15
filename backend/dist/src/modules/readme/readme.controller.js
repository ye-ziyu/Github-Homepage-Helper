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
exports.ReadmeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const readme_service_1 = require("./readme.service");
const generate_readme_dto_1 = require("./dto/generate-readme.dto");
const common_2 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
let ReadmeController = class ReadmeController {
    constructor(readmeService) {
        this.readmeService = readmeService;
    }
    async generateReadme(user, generateReadmeDto) {
        return this.readmeService.generateReadme(user.id, generateReadmeDto);
    }
    async previewReadme(user, generateReadmeDto) {
        return this.readmeService.previewReadme(user.id, generateReadmeDto);
    }
    async getTemplates() {
        return this.readmeService.getTemplates();
    }
};
exports.ReadmeController = ReadmeController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate README' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, generate_readme_dto_1.GenerateReadmeDto]),
    __metadata("design:returntype", Promise)
], ReadmeController.prototype, "generateReadme", null);
__decorate([
    (0, common_1.Post)('preview'),
    (0, swagger_1.ApiOperation)({ summary: 'Preview README' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, generate_readme_dto_1.GenerateReadmeDto]),
    __metadata("design:returntype", Promise)
], ReadmeController.prototype, "previewReadme", null);
__decorate([
    (0, common_1.Get)('templates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get README templates' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReadmeController.prototype, "getTemplates", null);
exports.ReadmeController = ReadmeController = __decorate([
    (0, swagger_1.ApiTags)('README'),
    (0, common_1.Controller)('readme'),
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [readme_service_1.ReadmeService])
], ReadmeController);
//# sourceMappingURL=readme.controller.js.map