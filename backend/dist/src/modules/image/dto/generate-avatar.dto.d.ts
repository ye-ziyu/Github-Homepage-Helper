export type ImageStyle = 'realistic' | 'cartoon' | 'pixel' | 'illustration' | 'minimal';
export type ImageGender = 'male' | 'female' | 'neutral' | 'undefined';
export type ImageAgeGroup = 'young' | 'adult' | 'mature';
export declare class GenerateAvatarDto {
    userInfo?: any;
    config: {
        style: ImageStyle;
        gender?: ImageGender;
        ageGroup?: ImageAgeGroup;
        accessories?: string[];
        clothing?: string;
        expression?: string;
        backgroundColor?: string;
        size?: string;
    };
}
