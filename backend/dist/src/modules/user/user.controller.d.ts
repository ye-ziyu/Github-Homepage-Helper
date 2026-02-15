import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getUserInfo(user: any, refresh?: string): Promise<any>;
    getUserRepos(user: any, cursor?: string, page_size?: string, sort?: string, direction?: string): Promise<any>;
    getUserLanguages(user: any): Promise<any>;
    getUserStats(user: any): Promise<any>;
}
