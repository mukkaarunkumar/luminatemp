
export type Mode = 'hot' | 'cool' | 'off';

export interface UserSession {
    isActive: boolean;
    isTrial: boolean;
    startTime: number;
    expiryTime: number;
    balancePaid: boolean;
}

export interface ComfortInsight {
    title: string;
    description: string;
    advice: string;
}
