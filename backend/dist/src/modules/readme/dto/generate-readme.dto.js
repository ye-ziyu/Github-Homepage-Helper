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
exports.GenerateReadmeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class GenerateReadmeDto {
}
exports.GenerateReadmeDto = GenerateReadmeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User info (optional)', required: true }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GenerateReadmeDto.prototype, "userInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bio text (optional)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateReadmeDto.prototype, "bio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Avatar URL (optional)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateReadmeDto.prototype, "avatarUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Skills list (optional)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], GenerateReadmeDto.prototype, "skills", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Projects list (optional)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], GenerateReadmeDto.prototype, "projects", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'README configuration',
        example: {
            sections: ['header', 'about', 'skills'],
            theme: 'auto',
            showStats: true,
            showVisitors: true,
        },
    }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GenerateReadmeDto.prototype, "config", void 0);
//# sourceMappingURL=generate-readme.dto.js.map