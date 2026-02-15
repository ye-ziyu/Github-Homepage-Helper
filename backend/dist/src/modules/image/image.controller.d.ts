import { ImageService } from './image.service';
import { GenerateAvatarDto } from './dto/generate-avatar.dto';
export declare class ImageController {
    private readonly imageService;
    constructor(imageService: ImageService);
    generateAvatar(user: any, generateAvatarDto: GenerateAvatarDto): Promise<{
        jobId: any;
        status: string;
        estimatedTime: number;
        createdAt: string;
    }>;
    getStyles(): Promise<{
        id: string;
        name: string;
        description: string;
        preview: string;
    }[]>;
}
