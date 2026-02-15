import { SyncService } from './sync.service';
import { SyncProfileDto } from './dto/sync-profile.dto';
export declare class SyncController {
    private readonly syncService;
    constructor(syncService: SyncService);
    syncProfile(user: any, syncProfileDto: SyncProfileDto): Promise<{
        success: boolean;
        profile: import("../auth/github.service").GitHubUserInfo;
    }>;
    syncReadme(user: any, body: {
        owner: string;
        repo: string;
        content: string;
        commitMessage?: string;
    }): Promise<{
        success: boolean;
        message: string;
        url: string;
    }>;
    createPullRequest(user: any, body: any): Promise<{
        success: boolean;
        message: string;
        url: string;
    }>;
}
