import { AuthService } from './auth.service';
import { ValidateTokenDto } from './dto/validate-token.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    validateToken(validateTokenDto: ValidateTokenDto): Promise<{
        isValid: boolean;
        userInfo: {
            id: string;
            githubId: string;
            username: string;
            displayName: string;
            email: string;
            bio: string;
            location: string;
            blog: string;
            company: string;
            twitterUsername: string;
            avatarUrl: string;
            followers: number;
            following: number;
            publicRepos: number;
            stars: number;
            languages: string[];
            createdAt: string;
            updatedAt: string;
        };
        scopes: string[];
        jwtToken: string;
        expiresIn: number;
    }>;
}
