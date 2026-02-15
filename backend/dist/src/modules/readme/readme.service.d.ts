import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { UserService } from '../user/user.service';
import { GenerateReadmeDto } from './dto/generate-readme.dto';
export declare class ReadmeService {
    private readonly prisma;
    private readonly redis;
    private readonly userService;
    constructor(prisma: PrismaService, redis: RedisService, userService: UserService);
    generateReadme(userId: string, generateReadmeDto: GenerateReadmeDto): Promise<{
        readme: string;
        wordCount: number;
        lineCount: number;
    }>;
    previewReadme(userId: string, generateReadmeDto: GenerateReadmeDto): Promise<{
        readme: string;
        wordCount: number;
        lineCount: number;
    }>;
    getTemplates(): Promise<{
        id: string;
        name: string;
        description: string;
        sections: string[];
    }[]>;
    private buildReadme;
    private buildHeader;
    private buildAbout;
    private buildSkills;
    private buildStats;
    private buildProjects;
    private buildLanguages;
    private buildContact;
    private buildFooter;
}
