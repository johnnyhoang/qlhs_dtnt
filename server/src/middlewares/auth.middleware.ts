import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { NguoiDungService } from '../services/nguoi-dung.service';
import { VaiTro } from '../entities/NguoiDung';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as any;

    if (!decoded) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const user = await NguoiDungService.getUserWithPermissions(decoded.id);
    if (!user) {
        return res.status(401).json({ message: 'User not found or disabled' });
    }

    (req as any).user = user;
    next();
};

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (user?.vai_tro !== VaiTro.ADMIN) {
        return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    next();
};

export const checkModuleAccess = (moduleName: string, requireWrite = false) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        if (user.vai_tro === VaiTro.ADMIN) return next();

        const permission = user.danh_sach_quyen?.find((p: any) => p.ma_module === moduleName);
        
        if (!permission) {
            return res.status(403).json({ message: `Access denied to module: ${moduleName}` });
        }

        if (requireWrite && !permission.co_quyen_sua) {
            return res.status(403).json({ message: `Write access denied to module: ${moduleName}` });
        }

        next();
    };
};
