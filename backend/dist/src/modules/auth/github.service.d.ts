export interface GitHubUserInfo {
    id: number;
    login: string;
    name?: string;
    email?: string;
    bio?: string;
    location?: string;
    blog?: string;
    company?: string;
    twitter_username?: string;
    avatar_url: string;
    followers: number;
    following: number;
    public_repos: number;
}
interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    description?: string;
    language?: string;
    stargazers_count: number;
    forks_count: number;
    fork: boolean;
    topics: string[];
    homepage?: string;
    html_url: string;
    updated_at: string;
}
export declare class GitHubService {
    private client;
    constructor();
    getUserInfo(token: string): Promise<GitHubUserInfo | null>;
    getUserRepos(token: string, options?: {
        page?: number;
        per_page?: number;
        sort?: string;
        direction?: string;
        type?: string;
    }): Promise<GitHubRepo[]>;
    getUserLanguages(token: string): Promise<Record<string, number>>;
    updateProfile(token: string, data: {
        bio?: string;
        location?: string;
        blog?: string;
        company?: string;
        twitter_username?: string;
    }): Promise<GitHubUserInfo>;
    getRateLimit(token: string): Promise<{
        remaining: number;
        limit: number;
    }>;
}
export {};
