"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadmeModule = void 0;
const common_1 = require("@nestjs/common");
const readme_controller_1 = require("./readme.controller");
const readme_service_1 = require("./readme.service");
const prisma_module_1 = require("../../common/prisma/prisma.module");
const redis_module_1 = require("../../common/redis/redis.module");
const user_module_1 = require("../user/user.module");
const auth_module_1 = require("../auth/auth.module");
let ReadmeModule = class ReadmeModule {
};
exports.ReadmeModule = ReadmeModule;
exports.ReadmeModule = ReadmeModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, redis_module_1.RedisModule, user_module_1.UserModule, auth_module_1.AuthModule],
        controllers: [readme_controller_1.ReadmeController],
        providers: [readme_service_1.ReadmeService],
        exports: [readme_service_1.ReadmeService],
    })
], ReadmeModule);
//# sourceMappingURL=readme.module.js.map