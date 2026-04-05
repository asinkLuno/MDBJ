"""
用 HanLP 分析歌词中「我→谓→你」/「你→谓→我」主谓关系，输出全量歌词 JSON。
支持跨行分析：使用滑动窗口（例如 3 行一组）进行分析。
优化关系提取：寻找共享同一 Head 或共同祖先的「我」和「你」。
"""

import json
import re
import sys
from pathlib import Path
from typing import Any

import hanlp

ROOT = Path(__file__).parent.parent.parent
LYRICS_DIR = ROOT / "resources" / "lyrics"
OUTPUT = LYRICS_DIR / "pronoun_relations.json"

WO_SET = {"我", "我们", "我們"}
NI_SET = {"你", "你们", "你們"}

SECTION_LABELS = {
    "verse",
    "chorus",
    "bridge",
    "outro",
    "intro",
    "pre-chorus",
    "post-chorus",
    "interlude",
    "hook",
}


# 只要有共同 head，不再局限于 nsubj/obj
def extract_relations(conll_sent: list[dict[str, Any]]) -> list[dict[str, Any]]:
    tokens = [t["form"] for t in conll_sent]
    heads = [t["head"] for t in conll_sent]  # 1-based
    relations = []

    # 找出所有“我”和“你”的索引
    me_indices = [i for i, w in enumerate(tokens) if w in WO_SET]
    you_indices = [i for i, w in enumerate(tokens) if w in NI_SET]

    if not me_indices or not you_indices:
        return []

    # 1. 寻找共享相同 head 或共同祖先的情况 (Ancestor chain search)
    for m_idx in me_indices:
        # 获取“我”的祖先链 (包含自己，最多向上看4层)
        m_anc = [m_idx]
        curr = heads[m_idx] - 1
        while curr >= 0 and len(m_anc) < 5:
            m_anc.append(curr)
            curr = heads[curr] - 1

        for y_idx in you_indices:
            # 获取“你”的祖先链
            y_anc = [y_idx]
            curr = heads[y_idx] - 1
            while curr >= 0 and len(y_anc) < 5:
                y_anc.append(curr)
                curr = heads[curr] - 1

            # 寻找最近的共同祖先
            common = None
            for ma in m_anc:
                if ma in y_anc:
                    common = ma
                    break

            if common is not None:
                # 如果共同祖先就是其中一个，谓语用其 head 或它本身
                pred_idx = common
                pred_word = tokens[pred_idx]

                # 排除“我”或“你”本身作为谓词的情况（除非语义确实如此）
                if pred_idx == m_idx or pred_idx == y_idx:
                    # 尝试取共同祖先的 head
                    actual_pred_idx = heads[pred_idx] - 1
                    if actual_pred_idx >= 0:
                        pred_idx = actual_pred_idx
                        pred_word = tokens[pred_idx]

                relations.append(
                    {
                        "subject": {"word": tokens[m_idx], "index": m_idx},
                        "predicate": {"word": pred_word, "index": pred_idx},
                        "object": {"word": tokens[y_idx], "index": y_idx},
                        "direction": "我↔你",
                    }
                )

    # 去重
    seen = set()
    unique_rels = []
    for r in relations:
        key = tuple(sorted((r["subject"]["index"], r["object"]["index"]))) + (
            r["predicate"]["index"],
        )
        if key not in seen:
            seen.add(key)
            unique_rels.append(r)

    return unique_rels


def annotate_tokens(
    conll_sent: list[dict[str, Any]], relations: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    tokens = [t["form"] for t in conll_sent]
    role_map: dict[int, set[str]] = {i: set() for i in range(len(tokens))}
    for rel in relations:
        role_map[rel["subject"]["index"]].add("subject")
        role_map[rel["predicate"]["index"]].add("predicate")
        role_map[rel["object"]["index"]].add("object")
    return [{"word": w, "roles": sorted(role_map[i])} for i, w in enumerate(tokens)]


def load_all_lines(path: Path) -> list[str]:
    lines = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or is_section_label(line) or is_english_only(line):
            continue
        lines.append(line)
    return lines


def is_section_label(line: str) -> bool:
    return line.strip().lower() in SECTION_LABELS


def is_english_only(line: str) -> bool:
    return bool(re.fullmatch(r"[A-Za-z0-9\s\-'!\?,\.~]+", line.strip()))


def main():
    print("加载 HanLP 模型…", flush=True)
    tok = hanlp.load(hanlp.pretrained.tok.COARSE_ELECTRA_SMALL_ZH)
    dep = hanlp.load(hanlp.pretrained.dep.CTB9_DEP_ELECTRA_SMALL)

    txt_files = sorted(LYRICS_DIR.glob("*.txt"))
    print(f"找到 {len(txt_files)} 首歌词文件\n", flush=True)

    seen_cross: set[str] = set()
    songs_output = []

    for path in txt_files:
        all_lines = load_all_lines(path)
        if not all_lines:
            continue

        title = path.stem
        print(f"  《{title}》分析中…", flush=True)

        song_lines = []
        # 窗口调大一点以捕捉更长跨度的关系
        window_size = 5
        step = 3

        windows = []
        for i in range(0, len(all_lines), step):
            win_lines = all_lines[i : i + window_size]
            if not win_lines:
                break
            windows.append(" ".join(win_lines))

        try:
            tokenized_windows = tok(windows)
            if tokenized_windows and isinstance(tokenized_windows[0], str):
                tokenized_windows = [tokenized_windows]
            parsed_windows = dep(tokenized_windows)
        except Exception as e:
            print(f"    !! 解析失败: {e}", file=sys.stderr)
            continue

        for win_text, _, conll in zip(windows, tokenized_windows, parsed_windows):
            if win_text in seen_cross:
                continue

            relations = extract_relations(conll)
            tokens_out = annotate_tokens(conll, relations)

            song_lines.append(
                {
                    "line": win_text,
                    "tokens": tokens_out,
                    "relations": relations,
                }
            )
            seen_cross.add(win_text)

        if song_lines:
            songs_output.append({"title": title, "lines": song_lines})

    output = {"songs": songs_output}
    OUTPUT.write_text(
        json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    relation_units = sum(
        1 for s in songs_output for ln in s["lines"] if ln["relations"]
    )
    print(f"\n✓ 输出 → {OUTPUT.relative_to(ROOT)} | 含关系单元：{relation_units}")


if __name__ == "__main__":
    main()
