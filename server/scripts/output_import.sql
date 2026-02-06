SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;
START TRANSACTION;

-- Helper map for dot_thanh_toan (thang,nam) -> id
DROP TEMPORARY TABLE IF EXISTS import_dot_map;
CREATE TEMPORARY TABLE import_dot_map (
  thang INT NOT NULL,
  nam INT NOT NULL,
  dot_id INT NULL,
  PRIMARY KEY (thang, nam)
) ENGINE=Memory;










COMMIT;
SET FOREIGN_KEY_CHECKS=1;
