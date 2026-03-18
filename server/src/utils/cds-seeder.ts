import { AppDataSource } from "../data-source";
import { CdsCriterion } from "../entities/CdsCriterion";

export const CDS_CRITERIA_DATA = [
  // Nhóm 1: Dạy, học
  { group_code: "DAY_HOC", code: "1.1", name: "1.1. Có ban hành kế hoạch tổ chức dạy học trực tuyến", is_mandatory: true, max_score: 0, order_index: 10 },
  { group_code: "DAY_HOC", code: "1.2", name: "1.2. Có ban hành quy chế tổ chức dạy học trực tuyến", is_mandatory: true, max_score: 0, order_index: 20 },
  { group_code: "DAY_HOC", code: "1.3.1", name: "1.3. Có triển khai phần mềm dạy học trực tuyến trực tiếp", is_mandatory: false, max_score: 6, order_index: 31 },
  { group_code: "DAY_HOC", code: "1.3.2", name: "1.3. Phần mềm LMS - Giao bài cho học sinh tự học", is_mandatory: false, max_score: 6, order_index: 32 },
  { group_code: "DAY_HOC", code: "1.3.3", name: "1.3. Phần mềm LMS - Giải đáp câu hỏi của học sinh", is_mandatory: false, max_score: 6, order_index: 33 },
  { group_code: "DAY_HOC", code: "1.3.4", name: "1.3. Phần mềm LMS - Tổ chức kiểm tra đánh giá thường xuyên", is_mandatory: false, max_score: 6, order_index: 34 },
  { group_code: "DAY_HOC", code: "1.3.5", name: "1.3. Phần mềm LMS - Phụ huynh tham gia theo dõi học tập", is_mandatory: false, max_score: 6, order_index: 35 },
  { group_code: "DAY_HOC", code: "1.4", name: "1.4. Số lượng học liệu được số hóa", is_mandatory: false, max_score: 10, order_index: 40 },
  { group_code: "DAY_HOC", code: "1.5.1", name: "1.5. Tổ chức kiểm tra trên phòng máy tính (phần mềm)", is_mandatory: false, max_score: 15, order_index: 51 },
  { group_code: "DAY_HOC", code: "1.5.2", name: "1.5. Phần mềm kiểm tra có trao đổi kết quả với hệ thống nhà trường", is_mandatory: false, max_score: 5, order_index: 52 },
  { group_code: "DAY_HOC", code: "1.6.1", name: "1.6. Tỉ lệ GV có tài khoản bồi dưỡng trực tuyến", is_mandatory: false, max_score: 7, order_index: 61 },
  { group_code: "DAY_HOC", code: "1.6.2", name: "1.6. Tỉ lệ giáo viên khai thác phần mềm đổi mới phương pháp", is_mandatory: false, max_score: 7, order_index: 62 },
  { group_code: "DAY_HOC", code: "1.6.3", name: "1.6. Tỉ lệ giáo viên xây dựng được học liệu số", is_mandatory: false, max_score: 6, order_index: 63 },
  { group_code: "DAY_HOC", code: "1.7.1", name: "1.7. Tỉ lệ phòng học có thiết bị trình chiếu và Internet", is_mandatory: false, max_score: 8, order_index: 71 },
  { group_code: "DAY_HOC", code: "1.7.2", name: "1.7. Mức độ đáp ứng yêu cầu dạy môn tin học", is_mandatory: false, max_score: 7, order_index: 72 },
  { group_code: "DAY_HOC", code: "1.7.3", name: "1.7. Có phòng studio xây dựng học liệu số", is_mandatory: false, max_score: 5, order_index: 73 },

  // Nhóm 2: Quản trị
  { group_code: "QUAN_TRI", code: "2.1", name: "2.1. Có bộ phận chỉ đạo ứng dụng CNTT, chuyển đổi số", is_mandatory: true, max_score: 0, order_index: 80 },
  { group_code: "QUAN_TRI", code: "2.2", name: "2.2. Có kế hoạch ứng dụng CNTT, chuyển đổi số", is_mandatory: true, max_score: 0, order_index: 90 },
  { group_code: "QUAN_TRI", code: "2.3.1", name: "2.3. Có quy chế sử dụng hệ thống quản trị nhà trường", is_mandatory: false, max_score: 6, order_index: 101 },
  { group_code: "QUAN_TRI", code: "2.3.2", name: "2.3. Có phân hệ quản lý học sinh", is_mandatory: false, max_score: 6, order_index: 102 },
  { group_code: "QUAN_TRI", code: "2.3.3", name: "2.3. Có sổ điểm điện tử, học bạ điện tử", is_mandatory: false, max_score: 10, order_index: 103 },
  { group_code: "QUAN_TRI", code: "2.3.4", name: "2.3. Có phân hệ quản lý đội ngũ", is_mandatory: false, max_score: 6, order_index: 104 },
  { group_code: "QUAN_TRI", code: "2.3.5", name: "2.3. Có phân hệ quản lý cơ sở vật chất", is_mandatory: false, max_score: 10, order_index: 105 },
  { group_code: "QUAN_TRI", code: "2.3.6", name: "2.3. Có phân hệ quản lý thông tin y tế trường học", is_mandatory: false, max_score: 10, order_index: 106 },
  { group_code: "QUAN_TRI", code: "2.3.7", name: "2.3. Có phân hệ quản lý kế toán", is_mandatory: false, max_score: 6, order_index: 107 },
  { group_code: "QUAN_TRI", code: "2.3.8", name: "2.3. Phần mềm trao đổi dữ liệu định kỳ với CSDL ngành", is_mandatory: false, max_score: 6, order_index: 108 },
  { group_code: "QUAN_TRI", code: "2.4.1", name: "2.4. Ứng dụng kết nối gia đình và nhà trường", is_mandatory: false, max_score: 8, order_index: 111 },
  { group_code: "QUAN_TRI", code: "2.4.2", name: "2.4. Tuyển sinh đầu cấp trực tuyến", is_mandatory: false, max_score: 12, order_index: 112 },
  { group_code: "QUAN_TRI", code: "2.4.3", name: "2.4. Thu phí dịch vụ giáo dục không dùng tiền mặt", is_mandatory: false, max_score: 10, order_index: 113 }
];

export const seedCdsCriteria = async () => {
    try {
        const repo = AppDataSource.getRepository(CdsCriterion);
        let count = 0;
        for (const item of CDS_CRITERIA_DATA) {
            const exists = await repo.findOneBy({ code: item.code });
            if (!exists) {
                const entity = repo.create(item);
                await repo.save(entity);
                count++;
            }
        }
        if (count > 0) {
            console.log(`[CdsSeeder] Đã thêm mới ${count} tiêu chí chuyển đổi số.`);
        }
    } catch (e) {
        console.error("[CdsSeeder] Lỗi khi tạo dữ liệu tiêu chí: ", e);
    }
};
