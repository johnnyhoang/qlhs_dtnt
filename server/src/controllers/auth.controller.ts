import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { signToken } from '../utils/jwt';
import { NguoiDungService } from '../services/nguoi-dung.service';
import { AppDataSource } from '../data-source';
import { NguoiDung } from '../entities/NguoiDung';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response) => {
    const { idToken } = req.body;

    try {
        let email: string;
        let name: string;
        let picture: string | undefined;

        // Temporary bypass for manual configuration
        if (idToken === 'super-admin-dev-bypass' || idToken === 'hoang.hoa@gmail.com') {
            console.log('Using bypass for:', idToken);
            email = idToken === 'hoang.hoa@gmail.com' ? 'hoang.hoa@gmail.com' : 'admin@hieubi.com';
            name = idToken === 'hoang.hoa@gmail.com' ? 'Hoa Hoang' : 'Super Admin (Bypass)';
        } else {
            try {
                console.log('Verifying Google token with Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Exists (starts with ' + process.env.GOOGLE_CLIENT_ID.substring(0, 10) + '...)' : 'MISSING');

                const ticket = await client.verifyIdToken({
                    idToken,
                    audience: process.env.GOOGLE_CLIENT_ID,
                });

                const payload = ticket.getPayload();
                if (!payload || !payload.email) {
                    console.error('Invalid Google token payload:', payload);
                    return res.status(400).json({ message: 'Invalid token payload' });
                }
                email = payload.email;
                name = payload.name || '';
                picture = payload.picture;
            } catch (verifyError: any) {
                // Fallback: If verification fails but it's the requested email, we allow it (TEMPORARY BYPASS)
                // This is useful if GOOGLE_CLIENT_ID is not yet correctly set on Vercel
                try {
                    const base64Payload = idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
                    const decoded: any = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
                    if (decoded.email === 'hoang.hoa@gmail.com') {
                        console.log('Verification failed but email is hoang.hoa@gmail.com, allowing bypass');
                        email = decoded.email;
                        name = decoded.name || 'Hoa Hoang';
                        picture = decoded.picture;
                    } else {
                        throw verifyError;
                    }
                } catch (e) {
                    throw verifyError;
                }
            }
        }

        const user = await NguoiDungService.findOrCreateByEmail(
            email,
            name,
            picture
        );

        // Auto-enable for bypass users so they don't get kicked out by middleware/getMe
        if ((idToken === 'super-admin-dev-bypass' || email === 'hoang.hoa@gmail.com') && !user.kich_hoat) {
            console.log('Auto-enabling bypass user:', email);
            user.kich_hoat = true;
            await AppDataSource.getRepository(NguoiDung).save(user);
        }

        if (!user.kich_hoat && idToken !== 'super-admin-dev-bypass' && email !== 'hoang.hoa@gmail.com') {
            console.warn('Login attempt for disabled user:', email);
            return res.status(403).json({ message: 'Account is disabled' });
        }

        const token = signToken({ 
            id: user.id,
            email: user.email, 
            vai_tro: user.vai_tro 
        });

        res.json({ 
            token, 
            user: {
                id: user.id,
                email: user.email,
                ho_ten: user.ho_ten,
                vai_tro: user.vai_tro,
                anh_dai_dien: user.anh_dai_dien,
                danh_sach_quyen: user.danh_sach_quyen
            } 
        });
    } catch (error: any) {
        console.error('Detailed Google Login Error:', {
            message: error.message,
            stack: error.stack,
            clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...'
        });
        res.status(401).json({ 
            message: 'Google authentication failed',
            details: error.message // Sending back error message for easier debugging
        });
    }
};

export const getMe = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await NguoiDungService.getUserWithPermissions(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user });
};
