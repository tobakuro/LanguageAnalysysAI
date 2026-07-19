"""訓練済みモデル（.pt）をONNX形式に変換する。

PWA側（public/models/）に配置してONNX Runtime Webから読み込む想定。
使い方:
    uv run export_onnx.py sound
    uv run export_onnx.py dice
"""

import argparse
import json
from pathlib import Path

import torch

from model import build_model

MODELS_DIR = Path(__file__).parent / "models"
IMAGE_SIZE = 224


def export(name: str) -> None:
    classes_path = MODELS_DIR / f"{name}_classes.json"
    weights_path = MODELS_DIR / f"{name}.pt"

    if not classes_path.exists() or not weights_path.exists():
        raise FileNotFoundError(
            f"{weights_path} または {classes_path} が見つかりません。先に train_{name}.py を実行してください"
        )

    with classes_path.open(encoding="utf-8") as f:
        classes = json.load(f)

    model = build_model(num_classes=len(classes))
    model.load_state_dict(torch.load(weights_path, map_location="cpu"))
    model.eval()

    # ブラウザでは1枚ずつ推論する想定のため、バッチサイズは固定（1）にする
    dummy_input = torch.randn(1, 3, IMAGE_SIZE, IMAGE_SIZE)
    onnx_path = MODELS_DIR / f"{name}.onnx"

    # dynamo=Falseで単一ファイル出力にする（dynamo=Trueだと重みが .onnx.data に分離される）
    torch.onnx.export(
        model,
        dummy_input,
        onnx_path,
        input_names=["input"],
        output_names=["logits"],
        opset_version=17,
        dynamo=False,
    )

    print(f"ONNXモデルを出力しました: {onnx_path}")
    print(f"クラス数: {len(classes)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("name", choices=["sound", "dice"])
    args = parser.parse_args()
    export(args.name)
