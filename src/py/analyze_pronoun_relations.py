"""
用 HanLP 分析歌词中「我→谓→你」/「你→谓→我」主谓关系，输出全量歌词 JSON。
优化 1：按音乐段落 (Section) 严格隔离，避免跨段落强行拼句。
优化 2：清洗纯拟声词 (啦啦啦) 和冗余符号。
优化 3：解除祖先链深度限制，使用依存标签和位置动态判定主宾方向。
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


def clean_lyric_line(line: str) -> str:
    """清理无意义的拟声词及括号，提取有效文本"""
    # 移除常见的括号
    line = line.replace("（", "").replace("）", "").replace("(", "").replace(")", "")
    # 清除常见的无意义语气词开头（如果整行都是，就会变为空字符串）
    line = re.sub(r"^[啦啊喔噢哦WooAh\s]+", "", line, flags=re.IGNORECASE)
    return line.strip()


def load_and_group_sections(path: Path) -> list[list[str]]:
    """将文本按 Section 标签分组，隔离不同段落"""
    raw_lines = path.read_text(encoding="utf-8").splitlines()
    sections = []
    current_section = []

    for raw in raw_lines:
        line = raw.strip()
        if not line:
            continue

        # 遇到标签，切割出新的段落
        if line.lower() in SECTION_LABELS:
            if current_section:
                sections.append(current_section)
                current_section = []
            continue

        # 过滤纯英文行
        if bool(re.fullmatch(r"[A-Za-z0-9\s\-'!\?,\.~]+", line)):
            continue

        # 清洗歌词行
        cleaned = clean_lyric_line(line)
        if cleaned:
            current_section.append(cleaned)

    if current_section:
        sections.append(current_section)

    return sections


def extract_relations(conll_sent: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """提取主谓宾关系，动态判断主客体"""
    tokens = [t["form"] for t in conll_sent]
    heads = [t["head"] for t in conll_sent]  # 1-based
    deprels = [t.get("deprel", "") for t in conll_sent]  # 提取依存关系标签
    relations = []

    # 找出所有“我”和“你”的索引
    me_indices = [i for i, w in enumerate(tokens) if w in WO_SET]
    you_indices = [i for i, w in enumerate(tokens) if w in NI_SET]

    if not me_indices or not you_indices:
        return []

    # 寻找共享相同 head 或共同祖先的情况
    for m_idx in me_indices:
        for y_idx in you_indices:
            # 获取“我”的祖先链 (使用 in 检查防止非法解析导致死循环)
            m_anc = [m_idx]
            curr = heads[m_idx] - 1
            while curr >= 0 and curr not in m_anc:
                m_anc.append(curr)
                curr = heads[curr] - 1

            # 获取“你”的祖先链
            y_anc = [y_idx]
            curr = heads[y_idx] - 1
            while curr >= 0 and curr not in y_anc:
                y_anc.append(curr)
                curr = heads[curr] - 1

            # 寻找最近的共同祖先 (Lowest Common Ancestor)
            common = None
            for ma in m_anc:
                if ma in y_anc:
                    common = ma
                    break

            if common is not None:
                pred_idx = common
                pred_word = tokens[pred_idx]

                # 排除“我”或“你”本身作为谓词的情况（除非语义确实如此）
                if pred_idx == m_idx or pred_idx == y_idx:
                    actual_pred_idx = heads[pred_idx] - 1
                    if actual_pred_idx >= 0:
                        pred_idx = actual_pred_idx
                        pred_word = tokens[pred_idx]

                # --- 动态判断谁是主语，谁是宾语 ---
                # 策略 1：检查依存句法标签
                m_is_subj = "subj" in deprels[m_idx].lower()
                y_is_subj = "subj" in deprels[y_idx].lower()
                m_is_obj = "obj" in deprels[m_idx].lower()
                y_is_obj = "obj" in deprels[y_idx].lower()

                if y_is_subj or m_is_obj:
                    subj_idx, obj_idx = y_idx, m_idx
                    direction = "你→谓→我"
                elif m_is_subj or y_is_obj:
                    subj_idx, obj_idx = m_idx, y_idx
                    direction = "我→谓→你"
                else:
                    # 策略 2：Fallback，根据在句子中的先后位置推断
                    if y_idx < m_idx:
                        subj_idx, obj_idx = y_idx, m_idx
                        direction = "你→谓→我 (位置推断)"
                    else:
                        subj_idx, obj_idx = m_idx, y_idx
                        direction = "我→谓→你 (位置推断)"

                relations.append(
                    {
                        "subject": {"word": tokens[subj_idx], "index": subj_idx},
                        "predicate": {"word": pred_word, "index": pred_idx},
                        "object": {"word": tokens[obj_idx], "index": obj_idx},
                        "direction": direction,
                    }
                )

    # 去重：基于准确的主、谓、宾索引组合
    seen = set()
    unique_rels = []
    for r in relations:
        key = (r["subject"]["index"], r["predicate"]["index"], r["object"]["index"])
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


def main():
    print("加载 HanLP 模型…", flush=True)
    tok = hanlp.load(hanlp.pretrained.tok.COARSE_ELECTRA_SMALL_ZH)
    dep = hanlp.load(hanlp.pretrained.dep.CTB9_DEP_ELECTRA_SMALL)

    # 确保输出目录存在
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    txt_files = sorted(LYRICS_DIR.glob("*.txt"))
    print(f"找到 {len(txt_files)} 首歌词文件\n", flush=True)

    seen_cross: set[str] = set()
    songs_output = []

    for path in txt_files:
        # 按 Section 隔离提取段落
        sections = load_and_group_sections(path)
        if not sections:
            continue

        title = path.stem
        print(f"  《{title}》分析中…", flush=True)
        song_lines = []

        for section_lines in sections:
            # 在独立的段落内，采用 2 行微窗口滑动
            window_size = 2

            windows = []
            for i in range(0, len(section_lines)):
                win_lines = section_lines[i : i + window_size]
                # 使用中文逗号连接，暗示模型此处有停顿但属于同一语义块
                win_text = "，".join(win_lines)
                if win_text not in seen_cross:
                    windows.append(win_text)
                    seen_cross.add(win_text)

            if not windows:
                continue

            try:
                # 批量解析
                tokenized_windows = tok(windows)
                if tokenized_windows and isinstance(tokenized_windows[0], str):
                    tokenized_windows = [tokenized_windows]
                parsed_windows = dep(tokenized_windows)
            except Exception as e:
                print(f"    !! 解析失败: {e}", file=sys.stderr)
                continue

            for win_text, _, conll in zip(windows, tokenized_windows, parsed_windows):
                relations = extract_relations(conll)
                # 即使没有检测到关系，如果你想保留这行的记录，也可以存入
                if relations:
                    tokens_out = annotate_tokens(conll, relations)
                    song_lines.append(
                        {
                            "line": win_text,
                            "tokens": tokens_out,
                            "relations": relations,
                        }
                    )

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
