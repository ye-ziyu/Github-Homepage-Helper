import { BioService } from './bio.service';
import { GenerateBioDto } from './dto/generate-bio.dto';
export declare class BioController {
    private readonly bioService;
    constructor(bioService: BioService);
    generateBio(user: any, generateBioDto: GenerateBioDto): Promise<{
        jobId: any;
        status: string;
        estimatedTime: number;
        createdAt: string;
    }>;
    getTemplates(): Promise<{
        id: string;
        name: string;
        description: string;
        template: string;
    }[]>;
    getJobStatus(jobId: string): Promise<any>;
}
