export declare enum Genders {
    male = "male",
    female = "female",
    unknown = "unknown",
}
export default class AdRequest {
    _props?: {
        keywords?: string[];
        testDevices?: string[];
        gender?: string;
        contentUrl?: string;
        requestAgent?: string;
        isDesignedForFamilies?: boolean;
        tagForChildDirectedTreatment?: boolean;
    };
    constructor();
    build(): {
        keywords?: string[];
        testDevices?: string[];
        gender?: string;
        contentUrl?: string;
        requestAgent?: string;
        isDesignedForFamilies?: boolean;
        tagForChildDirectedTreatment?: boolean;
    };
    addTestDevice(deviceId?: string): this;
    addKeyword(keyword: string): this;
    setBirthday(): void;
    setContentUrl(url: string): this;
    setGender(gender: keyof typeof Genders): this;
    setLocation(): void;
    setRequestAgent(requestAgent: string): this;
    setIsDesignedForFamilies(isDesignedForFamilies: boolean): this;
    tagForChildDirectedTreatment(tagForChildDirectedTreatment: boolean): this;
}
