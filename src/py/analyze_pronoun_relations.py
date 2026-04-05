"""
用 HanLP 分析歌词中「我→谓→你」/「你→谓→我」主谓关系，输出全量歌词 JSON。

用法：uv run python src/py/analyze_pronoun_relations.py
输出：resources/lyrics/pronoun_relations.json

JSON 结构：
{
  "songs": [
    {
      "title": str,
      "lines": [
        {
          "line": str,       // 原始歌词行
          "tokens": [...],   // 仅当含 我+你 时有值（用于 arrow 渲染）
          "relations": [...]  // 我→谓→你 / 你→谓→我；无则为 []
        }
      ]
    }
  ],
  "summary": { "wo_to_ni": {...}, "ni_to_wo": {...} }
}
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

SUBJECT_DEPRELS = {"nsubj", "nsubj:pass"}
OBJECT_DEPRELS = {"dobj", "obj", "iobj"}


def is_section_label(line: str) -> bool:
    return line.strip().lower() in SECTION_LABELS


def is_english_only(line: str) -> bool:
    return bool(re.fullmatch(r"[A-Za-z0-9\s\-'!\?,\.~]+", line.strip()))


def clean_line(line: str) -> str:
    line = line.strip()
    if not line or is_section_label(line) or is_english_only(line):
        return ""
    return line


def load_all_lines(path: Path) -> list[str]:
    """返回歌词文件中所有非空、非标签行（保留重复，保留歌曲结构）。"""
    lines = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        cleaned = clean_line(raw)
        if cleaned:
            lines.append(cleaned)
    return lines


def extract_relations(conll_sent: list[dict[str, Any]]) -> list[dict[str, Any]]:
    tokens = [t["form"] for t in conll_sent]
    heads = [t["head"] for t in conll_sent]
    deprels = [t["deprel"] for t in conll_sent]
    n = len(tokens)
    relations = []

    for i, (word, head_idx, deprel) in enumerate(zip(tokens, heads, deprels)):
        if deprel not in SUBJECT_DEPRELS:
            continue
        if word in WO_SET:
            obj_set, direction = NI_SET, "我→谓→你"
        elif word in NI_SET:
            obj_set, direction = WO_SET, "你→谓→我"
        else:
            continue

        pred_i = head_idx - 1
        if pred_i < 0 or pred_i >= n:
            continue

        obj = None
        for j in range(n):
            if heads[j] - 1 == pred_i and deprels[j] in OBJECT_DEPRELS:
                if tokens[j] in obj_set:
                    obj = {"word": tokens[j], "index": j}
                break

        if obj is None:
            continue

        relations.append(
            {
                "subject": {"word": word, "index": i},
                "predicate": {"word": tokens[pred_i], "index": pred_i},
                "object": obj,
                "direction": direction,
            }
        )
    return relations


def annotate_tokens(
    conll_sent: list[dict[str, Any]], relations: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    tokens = [t["form"] for t in conll_sent]
    role_map: dict[int, set[str]] = {i: set() for i in range(len(tokens))}
    for rel in relations:
        role_map[rel["subject"]["index"]].add("subject")
        role_map[rel["predicate"]["index"]].add("predicate")
        if rel["object"]:
            role_map[rel["object"]["index"]].add("object")
    return [{"word": w, "roles": sorted(role_map[i])} for i, w in enumerate(tokens)]


def main():
    print("加载 HanLP 分词模型…", flush=True)
    tok = hanlp.load(hanlp.pretrained.tok.COARSE_ELECTRA_SMALL_ZH)
    print("加载 HanLP 依存分析模型…", flush=True)
    dep = hanlp.load(hanlp.pretrained.dep.CTB9_DEP_ELECTRA_SMALL)

    txt_files = sorted(LYRICS_DIR.glob("*.txt"))
    print(f"找到 {len(txt_files)} 首歌词文件\n", flush=True)

    # 跨曲去重：同一行只保留首次出现（保留曲内重复）
    seen_cross: set[str] = set()

    songs_output = []
    wo_to_ni: dict[str, int] = {}
    ni_to_wo: dict[str, int] = {}

    for path in txt_files:
        all_lines = load_all_lines(path)
        if not all_lines:
            continue

        title = path.stem
        print(f"  《{title}》({len(all_lines)} 行)…", flush=True)

        # 找出需要 dep 分析的行（含 我+你）
        needs_dep: list[int] = [
            i
            for i, line in enumerate(all_lines)
            if any(c in line for c in WO_SET) and any(c in line for c in NI_SET)
        ]
        dep_lines = [all_lines[i] for i in needs_dep]
        dep_tokenized: list[list[str]] | None = None
        dep_parsed: list[list[dict[str, Any]]] | None = None

        if dep_lines:
            try:
                dep_tokenized = tok(dep_lines)
                dep_parsed = dep(dep_tokenized)
            except Exception as e:
                print(f"    !! dep 解析失败: {e}", file=sys.stderr)

        # 建立 index → (tokenized, parsed) 映射
        dep_map: dict[int, tuple[list[str], list[dict[str, Any]]]] = {}
        if dep_parsed and dep_tokenized:
            for k, idx in enumerate(needs_dep):
                dep_map[idx] = (dep_tokenized[k], dep_parsed[k])

        song_lines = []
        seen_in_song: set[str] = set()

        for i, line_text in enumerate(all_lines):
            # 曲内重复保留；跨曲重复删除
            if line_text in seen_cross:
                continue

            if i in dep_map:
                _tok_words, conll = dep_map[i]
                relations = extract_relations(conll)
                tokens_out = annotate_tokens(conll, relations)
            else:
                relations = []
                tokens_out = []

            song_lines.append(
                {
                    "line": line_text,
                    "tokens": tokens_out,
                    "relations": relations,
                }
            )

            if line_text not in seen_in_song:
                seen_in_song.add(line_text)
                # 只有首次在本曲出现时才加入跨曲去重集
                # （本曲内后续重复仍可出现）
            # 跨曲去重：第一首出现该行后，其他曲跳过
            seen_cross.add(line_text)

            for rel in relations:
                pred = rel["predicate"]["word"]
                if rel["direction"] == "我→谓→你":
                    wo_to_ni[pred] = wo_to_ni.get(pred, 0) + 1
                else:
                    ni_to_wo[pred] = ni_to_wo.get(pred, 0) + 1

        if song_lines:
            songs_output.append({"title": title, "lines": song_lines})

    def top_sorted(d: dict[str, int]) -> dict[str, int]:
        return dict(sorted(d.items(), key=lambda x: -x[1]))

    output = {
        "songs": songs_output,
        "summary": {
            "wo_to_ni": top_sorted(wo_to_ni),
            "ni_to_wo": top_sorted(ni_to_wo),
        },
    }

    OUTPUT.write_text(
        json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    total_lines = sum(len(s["lines"]) for s in songs_output)
    relation_lines = sum(
        1 for s in songs_output for ln in s["lines"] if ln["relations"]
    )
    print(f"\n✓ 输出 → {OUTPUT.relative_to(ROOT)}")
    print(
        f"  歌曲：{len(songs_output)} 首 | 总行数：{total_lines} | 含主谓关系：{relation_lines}"
    )
    print(f"  我→谓→你：{sum(wo_to_ni.values())} | 你→谓→我：{sum(ni_to_wo.values())}")


if __name__ == "__main__":
    main()
