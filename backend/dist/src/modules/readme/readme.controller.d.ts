import { ReadmeService } from './readme.service';
import { GenerateReadmeDto } from './dto/generate-readme.dto';
export declare class ReadmeController {
    private readonly readmeService;
    constructor(readmeService: ReadmeService);
    generateReadme(user: any, generateReadmeDto: GenerateReadmeDto): Promise<{
        readme: string;
        wordCount: number;
        lineCount: number;
    }>;
    previewReadme(user: any, generateReadmeDto: GenerateReadmeDto): Promise<{
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
}
