import jwt from 'jsonwebtoken';
import { CONFIG } from '../config';

export const signToken = (payload: any) => {
    return jwt.sign(payload, CONFIG.JWT_SECRET, { expiresIn: '1d' });
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, CONFIG.JWT_SECRET);
    } catch (error) {
        return null;
    }
};
