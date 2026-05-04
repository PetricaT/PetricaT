#!/usr/bin/env python3
"""Converts TamrielTradeCentre PriceTableEU.lua and ItemLookUpTable_EN.lua to plain JSON."""

import json
import re
import os

raw_mats: list[str] = ["jute", "rawhide", "iron ingot", "sanded maple", "rubedite ingot", "rubedo leather", "sanded ruby ash", "ancestor silk"]
upgrade_mats: list[str] = ["honing stone", "dwarven oil", "grain solvent", "tempering alloy", "hemming", "embroidery", "elegant lining", "dreugh wax", "pitch", "turpen", "mastic", "rosin"]
rune_level: list[str] = ["denata", "rekuta", "kuta"]
rune: list[str] = ["hakeijo"]
jewelry: list[str] = ["platinum ounce"]
weapon_trait: list[str] = ["chysolite", "amethyst", "ruby", "jade", "turquoise", "carnelian", "fire opal", "citrine", "potent nirncrux"]
armor_trait: list[str] = ["quartz", "diamond", "sardonyx", "almandine", "emerald", "bloodstone", "garnet", "sapphire", "fortified nirncrux"]
jewelry_trait: list[str] = ["antimony", "cobalt", "zinc", "gilding wax", "dibellium", "dawn-prism", "slaughterstone", "titanium", "aurbic amber"]

material_filter = set(raw_mats + upgrade_mats + rune_level + rune + jewelry + weapon_trait + armor_trait + jewelry_trait)

class LuaParser:
    """Minimal parser for minified Lua tables."""

    def __init__(self, text):
        self.text = text
        self.pos = 0

    def skip_ws(self):
        while self.pos < len(self.text) and self.text[self.pos] in " \t\n\r":
            self.pos += 1

    def peek(self):
        self.skip_ws()
        if self.pos >= len(self.text):
            return None
        return self.text[self.pos]

    def consume(self, ch):
        self.skip_ws()
        if self.pos >= len(self.text) or self.text[self.pos] != ch:
            raise ValueError(f"Expected '{ch}' at pos {self.pos}, got '{self.text[self.pos] if self.pos < len(self.text) else 'EOF'}'")
        self.pos += 1

    def parse_string(self):
        self.consume('"')
        start = self.pos
        while True:
            if self.pos >= len(self.text):
                raise ValueError("Unterminated string")
            if self.text[self.pos] == '\\':
                self.pos += 2
            elif self.text[self.pos] == '"':
                break
            else:
                self.pos += 1
        s = self.text[start:self.pos]
        self.pos += 1  # skip closing "
        return s

    def parse_number(self):
        start = self.pos
        if self.pos < len(self.text) and self.text[self.pos] == '-':
            self.pos += 1
        while self.pos < len(self.text) and (self.text[self.pos].isdigit() or self.text[self.pos] == '.'):
            self.pos += 1
        # Handle scientific notation
        if self.pos < len(self.text) and self.text[self.pos] in ('E', 'e'):
            self.pos += 1
            if self.pos < len(self.text) and self.text[self.pos] in ('+', '-'):
                self.pos += 1
            while self.pos < len(self.text) and self.text[self.pos].isdigit():
                self.pos += 1
        num_str = self.text[start:self.pos]
        return float(num_str) if '.' in num_str or 'E' in num_str or 'e' in num_str else int(num_str)

    def parse_value(self):
        self.skip_ws()
        ch = self.peek()
        if ch == '{':
            return self.parse_table()
        elif ch == '"':
            return self.parse_string()
        elif ch == '-' or (ch and ch.isdigit()):
            return self.parse_number()
        elif self.text[self.pos:self.pos + 3] == 'nil':
            self.pos += 3
            return None
        else:
            raise ValueError(f"Unexpected char '{ch}' at pos {self.pos}")

    def parse_key(self):
        self.skip_ws()
        if self.text[self.pos:self.pos + 2] == '["':
            self.pos += 1  # skip [
            s = self.parse_string()
            self.consume(']')
            return s, True  # string key
        elif self.text[self.pos] == '[':
            self.pos += 1  # skip [
            key = self.parse_value()
            self.consume(']')
            return key, False  # numeric key
        else:
            raise ValueError(f"Unexpected key start at pos {self.pos}")

    def parse_table(self):
        self.consume('{')
        result = {}
        while True:
            self.skip_ws()
            if self.peek() == '}':
                self.pos += 1
                return result
            # Check if this is a key-value pair
            if self.text[self.pos:self.pos + 2] == '["' or self.text[self.pos] == '[':
                key, _ = self.parse_key()
                self.consume('=')
                value = self.parse_value()
                result[key] = value
            else:
                # Could be array-style or named key (but minified only uses [] style)
                raise ValueError(f"Unexpected key format at pos {self.pos}")
            self.skip_ws()
            if self.peek() == ',':
                self.pos += 1
            elif self.peek() != '}':
                raise ValueError(f"Expected ',' or '}}' at pos {self.pos}")


def extract_lua_table(filepath):
    """Extract the Lua table from a file like: function Foo:Bar() self.X=... end"""
    with open(filepath, 'r') as f:
        content = f.read()
    # Find self.Something={ after the function definition
    match = re.search(r'self\.\w+=', content)
    if not match:
        raise ValueError("Could not find table assignment")
    # Find the start of the table value
    start = match.end()  # right after '='
    # Now parse from that point
    parser = LuaParser(content[start:])
    return parser.parse_value()


def load_item_lookup(filepath):
    """Load ItemLookUpTable: maps lowercase item name -> {specializedItemType: itemID}"""
    with open(filepath, 'r') as f:
        content = f.read()
    # Find self.ItemLookUpTable=
    match = re.search(r'self\.ItemLookUpTable=', content)
    if not match:
        raise ValueError("Could not find ItemLookUpTable")
    start = match.end()
    parser = LuaParser(content[start:])
    return parser.parse_value()


def build_id_to_name(lookup_table):
    """Build a mapping from itemID -> item_name."""
    id_to_name = {}
    for item_name, type_map in lookup_table.items():
        for spec_type, item_id in type_map.items():
            id_to_name[item_id] = item_name
    return id_to_name


WANTED_KEYS = {"A": "avg", "X": "max", "N": "min", "SA": "sale_avg"}


def is_price_entry(d):
    return isinstance(d, dict) and "A" in d


def extract_leaf_prices(d):
    """Recursively find all leaf price dicts in the nested structure."""
    if is_price_entry(d):
        return [d]
    leaves = []
    if isinstance(d, dict):
        for v in d.values():
            leaves.extend(extract_leaf_prices(v))
    return leaves


def pick_best_price(leaves):
    """Pick the price entry with the most data (highest entry_count)."""
    best = max(leaves, key=lambda d: d.get("EC", 0))
    return {WANTED_KEYS[k]: best[k] for k in WANTED_KEYS if k in best}


def convert_price_table(price_data, id_to_name):
    result = {}
    for item_id_str, quality_dict in price_data.items():
        item_id = int(item_id_str)
        item_name = id_to_name.get(item_id)
        if item_name is None or item_name not in material_filter:
            continue
        leaves = extract_leaf_prices(quality_dict)
        if not leaves:
            continue
        result[item_name] = pick_best_price(leaves)
    return result


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    price_table_file = f"{base_dir}/PriceTableEU.lua"
    lookup_file = f"{base_dir}/ItemLookUpTable_EN.lua"
    output_file = f"{base_dir.replace('scripts', 'docs')}/PriceTableEU.json"

    print("Loading item lookup table...")
    lookup_table = load_item_lookup(lookup_file)
    id_to_name = build_id_to_name(lookup_table)
    print(f"\tFound {len(id_to_name)} item IDs mapped to names")

    print("Loading price table...")
    price_data = extract_lua_table(price_table_file)
    data_dict = price_data.get("Data", price_data)
    print(f"\tFound {len(data_dict)} items in price table")

    print("Converting to JSON with item names...")
    result = convert_price_table(data_dict, id_to_name)
    print(f"\tGenerated {len(result)} item entries")

    print(f"Writing to {output_file}...")
    with open(output_file, 'w') as f:
        json.dump(dict(sorted(result.items())), f, indent=2)

    print("Done!")


if __name__ == "__main__":
    main()
