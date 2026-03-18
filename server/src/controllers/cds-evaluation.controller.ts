import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { CdsEvaluation } from '../entities/CdsEvaluation';
import { CdsEvaluationDetail } from '../entities/CdsEvaluationDetail';
import { CdsCriterion } from '../entities/CdsCriterion';
import { CdsEvaluationPeriod } from '../entities/CdsEvaluationPeriod';

export const CdsEvaluationController = {
  // Lấy danh sách tiêu chí
  async getCriteria(req: Request, res: Response) {
    try {
      const criteria = await AppDataSource.getRepository(CdsCriterion).find({
        order: { order_index: 'ASC' }
      });
      res.json(criteria);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // Lấy danh sách kỳ đánh giá
  async getPeriods(req: Request, res: Response) {
    try {
      const periods = await AppDataSource.getRepository(CdsEvaluationPeriod).find({
        order: { year: 'DESC' }
      });
      res.json(periods);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // Tạo kỳ đánh giá mới (dành cho Admin)
  async createPeriod(req: Request, res: Response) {
    try {
      const param = req.body;
      const repo = AppDataSource.getRepository(CdsEvaluationPeriod);
      const newPeriod = repo.create(param);
      await repo.save(newPeriod);
      res.json(newPeriod);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // Lấy danh sách phiếu của User hiện tại
  async getMyEvaluations(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const repo = AppDataSource.getRepository(CdsEvaluation);
      let evals;
      
      if (user.vai_tro === 'ADMIN') {
        evals = await repo.find({
          relations: ['period', 'user'],
          order: { createdAt: 'DESC' }
        });
      } else {
        evals = await repo.find({
          where: { user: { id: user.id } },
          relations: ['period', 'user'],
          order: { createdAt: 'DESC' }
        });
      }
      res.json(evals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // Lấy chi tiết một phiếu
  async getEvaluationById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      const evalData = await AppDataSource.getRepository(CdsEvaluation).findOne({
        where: { id },
        relations: ['period', 'user', 'details', 'details.criterion']
      });
      if (!evalData) return res.status(404).json({ message: "Not found" });
      res.json(evalData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // Tạo mới phiếu đánh giá
  async createEvaluation(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { periodId, details, status } = req.body;
      
      const evalRepo = AppDataSource.getRepository(CdsEvaluation);
      const detailRepo = AppDataSource.getRepository(CdsEvaluationDetail);

      const period = await AppDataSource.getRepository(CdsEvaluationPeriod).findOneBy({ id: periodId });
      if (!period) return res.status(400).json({ message: "Invalid periodId" });

      let scoreGroup1 = 0;
      let scoreGroup2 = 0;

      const newEval = evalRepo.create({
        user: { id: userId },
        period: { id: periodId },
        status: status || 'DRAFT',
        submitter_name: req.body.submitter_name || (req as any).user.ho_ten
      });
      
      const savedEval = await evalRepo.save(newEval);

      if (details && details.length > 0) {
        const criteriaList = await AppDataSource.getRepository(CdsCriterion).find();
        const criteriaMap = new Map(criteriaList.map(c => [c.id, c]));

        for (const d of details) {
          const criterion = criteriaMap.get(d.criterionId);
          if (criterion) {
             const scr = parseFloat(d.score) || 0;
             if (criterion.group_code === 'DAY_HOC') scoreGroup1 += scr;
             else if (criterion.group_code === 'QUAN_TRI') scoreGroup2 += scr;

             await detailRepo.save(detailRepo.create({
               evaluation: { id: savedEval.id },
               criterion: { id: d.criterionId },
               score: scr,
               evidence_link: d.evidence_link,
               note: d.note
             }));
          }
        }
      }

      let level = 1;
      if (scoreGroup1 >= 75 && scoreGroup2 >= 75) level = 3;
      else if (scoreGroup1 >= 50 && scoreGroup2 >= 50) level = 2;

      savedEval.total_score_group1 = scoreGroup1;
      savedEval.total_score_group2 = scoreGroup2;
      savedEval.level = level;
      await evalRepo.save(savedEval);

      res.status(201).json(savedEval);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // Cập nhật phiếu đánh giá
  async updateEvaluation(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      const { details, status } = req.body;

      const evalRepo = AppDataSource.getRepository(CdsEvaluation);
      const detailRepo = AppDataSource.getRepository(CdsEvaluationDetail);

      const existingEval = await evalRepo.findOne({ where: { id } });
      if (!existingEval) return res.status(404).json({ message: "Not found" });

      if (status) existingEval.status = status;
      if (req.body.submitter_name !== undefined) existingEval.submitter_name = req.body.submitter_name;

      let scoreGroup1 = 0;
      let scoreGroup2 = 0;

      if (details) {
        await detailRepo.delete({ evaluation: { id } });

        const criteriaList = await AppDataSource.getRepository(CdsCriterion).find();
        const criteriaMap = new Map(criteriaList.map(c => [c.id, c]));

        for (const d of details) {
          const criterion = criteriaMap.get(d.criterionId);
          if (criterion) {
             const scr = parseFloat(d.score) || 0;
             if (criterion.group_code === 'DAY_HOC') scoreGroup1 += scr;
             else if (criterion.group_code === 'QUAN_TRI') scoreGroup2 += scr;

             await detailRepo.save(detailRepo.create({
               evaluation: { id },
               criterion: { id: d.criterionId },
               score: scr,
               evidence_link: d.evidence_link,
               note: d.note
             }));
          }
        }

        let level = 1;
        if (scoreGroup1 >= 75 && scoreGroup2 >= 75) level = 3;
        else if (scoreGroup1 >= 50 && scoreGroup2 >= 50) level = 2;

        existingEval.total_score_group1 = scoreGroup1;
        existingEval.total_score_group2 = scoreGroup2;
        existingEval.level = level;
      }

      await evalRepo.save(existingEval);
      res.json(existingEval);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // Tổng hợp dữ liệu cho Dashboard
  async getDashboardStats(req: Request, res: Response) {
    try {
      const evals = await AppDataSource.getRepository(CdsEvaluation).find({
        where: { status: 'SUBMITTED' } // Chỉ lấy phiếu đã nộp để làm thống kê
      });
      
      const totalEvaluations = evals.length;
      let averageGroup1 = 0;
      let averageGroup2 = 0;

      if (totalEvaluations > 0) {
        averageGroup1 = evals.reduce((sum, e) => sum + Number(e.total_score_group1), 0) / totalEvaluations;
        averageGroup2 = evals.reduce((sum, e) => sum + Number(e.total_score_group2), 0) / totalEvaluations;
      }

      res.json({
        totalEvaluations,
        averageGroup1: Number(averageGroup1.toFixed(2)),
        averageGroup2: Number(averageGroup2.toFixed(2))
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // Xoá phiếu đánh giá (Chỉ Admin hoặc Chủ sở hữu phiếu mới được xoá)
  async deleteEvaluation(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      const user = (req as any).user;
      
      const evalRepo = AppDataSource.getRepository(CdsEvaluation);
      const detailRepo = AppDataSource.getRepository(CdsEvaluationDetail);

      const existingEval = await evalRepo.findOne({ where: { id }, relations: ['user'] });
      if (!existingEval) return res.status(404).json({ message: "Not found" });

      if (user.vai_tro !== 'ADMIN' && existingEval.user.id !== user.id) {
        return res.status(403).json({ message: "Bạn không có quyền xoá phiếu của người khác." });
      }

      await detailRepo.delete({ evaluation: { id } });
      await evalRepo.delete(id);
      
      res.json({ message: "Đã xoá thành công." });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
};
