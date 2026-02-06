#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import re
from typing import Any, Dict, List, Optional, Tuple

import pandas as pd

try:
    from unidecode import unidecode
except ImportError:
    unidecode = None


# -------------------------
# Normalization helpers
# -------------------------

def _strip_accents(s: str) -> str:
    if unidecode:
        return unidecode(s)
    # Fallback: keep as-is if unidecode not installed
    return s

def norm_header(x: Any) -> str:
    if x is None:
        return ""
    s = str(x).strip()
    s = _strip_accents(s)
    s = s.lower()
    s = s.replace("đ", "d")  # just in case fallback path
    s = re.sub(r"[\(\)\[\]\{\}]", " ", s)
    s = re.sub(r"[^a-z0-9]+", "_", s)
    s = re.sub(r"_+", "_", s).strip("_")
    return s


# -------------------------
# Column candidates
# -------------------------

CANDIDATES: Dict[str, List[str]] = {
    "ma_hoc_sinh": [
        "ma_hoc_sinh", "ma_hs", "mahs", "ma", "student_id", "student_code",
        "ma_hoc_sinh_student_code", "ma_hoc_sinh_student_id",
        "ma_hoc_sinh_code", "ma_hoc_sinh_id",
        "mhs",
    ],
    "ho_ten": [
        "ho_ten", "ho_va_ten", "hoten", "ten", "full_name", "name", "student_name",
    ],
    "lop": [
        "lop", "class", "class_name", "ten_lop",
    ],
    "ma_moet": [
        "ma_moet", "moet", "moet_id", "ma_dinh_danh_bgd", "ma_bgd",
    ],
    "gioi_tinh": [
        "gioi_tinh", "gender", "gt", "sex",
    ],
}

# Also allow partial match: e.g. "ma_hoc_sinh_(bat_buoc)" -> contains "ma_hoc_sinh"
PARTIAL_HINTS: Dict[str, List[str]] = {
    "ma_hoc_sinh": ["ma_hoc_sinh", "ma_hs", "student"],
    "ho_ten": ["ho_ten", "ho_va_ten", "ten", "name"],
    "lop": ["lop", "class"],
    "ma_moet": ["moet", "bgd"],
    "gioi_tinh": ["gioi_tinh", "gender", "sex", "gt"],
}


def normalize_gender(v: Any) -> str:
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return ""
    s = str(v).strip()
    s_norm = _strip_accents(s).lower()
    s_norm = s_norm.replace("đ", "d")
    if s_norm in ("nam", "male", "m", "1"):
        return "Nam"
    if s_norm in ("nu", "nữ", "female", "f", "0", "2"):
        return "Nữ"
    # sometimes "Nam/Nữ" in one cell etc. -> keep empty to avoid wrong data
    return ""


# -------------------------
# Detect header row & map columns
# -------------------------

def score_header_row(row_values: List[Any]) -> Tuple[int, Dict[str, int]]:
    """Return (score, hits_per_field) for a potential header row."""
    normed = [norm_header(v) for v in row_values]
    hits: Dict[str, int] = {k: 0 for k in CANDIDATES.keys()}

    for cell in normed:
        if not cell:
            continue

        for field, cand_list in CANDIDATES.items():
            if cell in cand_list:
                hits[field] += 2  # exact match stronger
            else:
                # partial hints
                for hint in PARTIAL_HINTS[field]:
                    if hint and hint in cell:
                        hits[field] += 1
                        break

    # mandatory fields weight
    score = hits["ma_hoc_sinh"] * 5 + hits["ho_ten"] * 4 + hits["lop"] * 4
    score += hits["ma_moet"] + hits["gioi_tinh"]
    return score, hits


def pick_best_sheet_and_header(excel_path: str, max_header_scan_rows: int = 10) -> Tuple[str, int]:
    xls = pd.ExcelFile(excel_path, engine="openpyxl")
    best = ("", -1, -1)  # (sheet, header_row_idx, score)

    for sheet in xls.sheet_names:
        tmp = pd.read_excel(excel_path, sheet_name=sheet, header=None, nrows=max_header_scan_rows, engine="openpyxl")
        for i in range(min(max_header_scan_rows, len(tmp))):
            row = tmp.iloc[i].tolist()
            score, hits = score_header_row(row)
            # require at least some evidence of mandatory columns
            if hits["ma_hoc_sinh"] == 0 or hits["ho_ten"] == 0 or hits["lop"] == 0:
                continue
            if score > best[2]:
                best = (sheet, i, score)

    if best[2] < 0:
        # fallback: try sheet named hoc_sinh (normalized), row 0
        for sheet in xls.sheet_names:
            if norm_header(sheet) == "hoc_sinh":
                return sheet, 0
        return xls.sheet_names[0], 0

    return best[0], best[1]


def build_column_map(df: pd.DataFrame) -> Dict[str, str]:
    """Map target fields -> actual df column names."""
    norm_to_real = {norm_header(c): c for c in df.columns}

    result: Dict[str, str] = {}

    def find_field(field: str) -> Optional[str]:
        # exact candidate
        for cand in CANDIDATES[field]:
            if cand in norm_to_real:
                return norm_to_real[cand]
        # partial
        for nc, real in norm_to_real.items():
            for hint in PARTIAL_HINTS[field]:
                if hint and hint in nc:
                    return real
        return None

    for f in CANDIDATES.keys():
        col = find_field(f)
        if col:
            result[f] = col

    return result


# -------------------------
# Export
# -------------------------

def export_students(excel_path: str, out_csv: str, sheet: Optional[str] = None, header_row: Optional[int] = None) -> None:
    if not unidecode:
        print("ℹ️  Bạn nên cài thêm 'unidecode' để dò cột tiếng Việt chính xác hơn: pip install unidecode")

    if sheet is None or header_row is None:
        auto_sheet, auto_header = pick_best_sheet_and_header(excel_path)
        sheet = sheet or auto_sheet
        header_row = auto_header if header_row is None else header_row

    df = pd.read_excel(excel_path, sheet_name=sheet, header=header_row, engine="openpyxl")

    # Drop unnamed columns
    df = df.loc[:, [c for c in df.columns if str(c).strip() and not str(c).lower().startswith("unnamed")]]

    col_map = build_column_map(df)

    missing_required = [k for k in ["ma_hoc_sinh", "ho_ten", "lop"] if k not in col_map]
    if missing_required:
        raise SystemExit(
            f"❌ Không tìm thấy cột bắt buộc: {missing_required}\n"
            f"Sheet đang dùng: '{sheet}', header_row={header_row}\n"
            f"Cột hiện có: {list(df.columns)}\n"
            f"Gợi ý: thử chỉ định --sheet và --header-row đúng dòng header."
        )

    out = pd.DataFrame()
    out["ma_hoc_sinh"] = df[col_map["ma_hoc_sinh"]].astype(str).str.strip()
    out["ho_ten"] = df[col_map["ho_ten"]].astype(str).str.strip()
    out["lop"] = df[col_map["lop"]].astype(str).str.strip()

    if "ma_moet" in col_map:
        out["ma_moet"] = df[col_map["ma_moet"]].astype(str).str.strip()
        out.loc[out["ma_moet"].isin(["nan", "None"]), "ma_moet"] = ""
    else:
        out["ma_moet"] = ""

    if "gioi_tinh" in col_map:
        out["gioi_tinh"] = df[col_map["gioi_tinh"]].apply(normalize_gender)
    else:
        out["gioi_tinh"] = ""

    # clean empties
    out["ma_hoc_sinh"] = out["ma_hoc_sinh"].replace({"nan": "", "None": ""})
    out["ho_ten"] = out["ho_ten"].replace({"nan": "", "None": ""})
    out["lop"] = out["lop"].replace({"nan": "", "None": ""})

    out = out[out["ma_hoc_sinh"].str.len() > 0].copy()

    # validate required
    for req in ["ma_hoc_sinh", "ho_ten", "lop"]:
        bad = out[req].astype(str).str.strip() == ""
        if bad.any():
            idxs = out.index[bad].tolist()[:20]
            raise SystemExit(f"❌ Có dòng thiếu '{req}' (ví dụ index): {idxs}")

    # validate unique ma_hoc_sinh
    dup = out["ma_hoc_sinh"][out["ma_hoc_sinh"].duplicated(keep=False)]
    if not dup.empty:
        dups = sorted(set(dup.tolist()))
        raise SystemExit(f"❌ Có mã học sinh bị trùng: {dups[:30]}" + (" ..." if len(dups) > 30 else ""))

    # write CSV (UTF-8 with BOM for Excel)
    out.to_csv(out_csv, index=False, encoding="utf-8-sig")
    print(f"✅ Exported {len(out)} học sinh -> {out_csv}")
    print(f"   Used sheet='{sheet}', header_row={header_row}")
    print(f"   Column mapping: {col_map}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--excel", required=True, help="Đường dẫn file .xlsx")
    ap.add_argument("--out", required=True, help="Đường dẫn output .csv")
    ap.add_argument("--sheet", default=None, help="Tên sheet (nếu muốn chỉ định)")
    ap.add_argument("--header-row", type=int, default=None, help="Dòng header (0-based). Ví dụ header nằm ở dòng 3 => --header-row 2")
    args = ap.parse_args()

    export_students(args.excel, args.out, args.sheet, args.header_row)


if __name__ == "__main__":
    main()
