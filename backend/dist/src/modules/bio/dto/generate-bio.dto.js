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
exports.GenerateBioDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class GenerateBioDto {
}
exports.GenerateBioDto = GenerateBioDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User info (optional)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GenerateBioDto.prototype, "userInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Skills (optional)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GenerateBioDto.prototype, "skills", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Projects (optional)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], GenerateBioDto.prototype, "projects", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Bio configuration',
        example: {
            language: 'zh',
            style: 'professional',
            length: 'medium',
        },
    }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GenerateBioDto.prototype, "config", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: true, description: 'Process asynchronously' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GenerateBioDto.prototype, "async", void 0);
//# sourceMappingURL=generate-bio.dto.js.map