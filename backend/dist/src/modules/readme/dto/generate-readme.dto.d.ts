export type ReadmeTheme = 'light' | 'dark' | 'auto';
export declare class GenerateReadmeDto {
    userInfo: any;
    bio?: string;
    avatarUrl?: string;
    skills?: string[];
    projects?: any[];
    config: {
        sections?: string[];
        theme?: ReadmeTheme;
        showStats?: boolean;
        showVisitors?: boolean;
    };
}
