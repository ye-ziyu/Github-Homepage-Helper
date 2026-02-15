export type BioStyle = 'professional' | 'casual' | 'humorous' | 'minimal';
export type BioLanguage = 'zh' | 'en' | 'bilingual';
export type BioLength = 'short' | 'medium' | 'long';
export declare class GenerateBioDto {
    userInfo?: any;
    skills?: any;
    projects?: any[];
    config: {
        language: BioLanguage;
        style: BioStyle;
        length: BioLength;
        includeStats?: boolean;
        includeSkills?: boolean;
        includeProjects?: boolean;
    };
    async?: boolean;
}
