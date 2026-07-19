"""sound / dice 共通のデータセット定義。

sound: training/data/sound/{label}_{連番}.{ext} のフラット構成。
       ファイル名の最後の "_" より右が連番、左がラベル（例: "a_ka_001" → label="a_ka"）。
dice:  training/data/dice/{dakuten,handakuten}/ のフォルダ分け構成。

元画像が1クラスあたり1〜数枚しかないため、各元画像から augment_count 枚の
データ拡張バリエーションを事前生成し、それを train/val に分割して使う。
"""

from pathlib import Path

from PIL import Image
from torch.utils.data import Dataset
from torchvision import transforms

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg"}


def _load_flat_samples(data_dir: Path) -> tuple[list[tuple[Path, str]], list[str]]:
    samples: list[tuple[Path, str]] = []
    for path in sorted(data_dir.iterdir()):
        if path.suffix.lower() not in IMAGE_EXTENSIONS:
            continue
        label, _seq = path.stem.rsplit("_", 1)
        samples.append((path, label))

    labels = sorted({label for _, label in samples})
    return samples, labels


def _load_folder_samples(data_dir: Path) -> tuple[list[tuple[Path, str]], list[str]]:
    samples: list[tuple[Path, str]] = []
    labels = sorted(p.name for p in data_dir.iterdir() if p.is_dir())
    for label in labels:
        for path in sorted((data_dir / label).iterdir()):
            if path.suffix.lower() not in IMAGE_EXTENSIONS:
                continue
            samples.append((path, label))
    return samples, labels


class AugmentedImageDataset(Dataset):
    """元画像1枚あたり augment_count 枚のバリエーションを事前生成するDataset。

    生成済みのテンソルをメモリに保持するため、train/val分割後もリークなく再利用できる。
    """

    def __init__(
        self,
        source_samples: list[tuple[Path, str]],
        classes: list[str],
        augment_transform,
        augment_count: int,
    ) -> None:
        self.class_to_idx = {label: i for i, label in enumerate(classes)}
        self.classes = classes

        self.items: list[tuple[object, int]] = []
        for path, label in source_samples:
            image = Image.open(path).convert("RGB")
            label_idx = self.class_to_idx[label]
            for _ in range(augment_count):
                augmented = augment_transform(image)
                self.items.append((augmented, label_idx))

    def __len__(self) -> int:
        return len(self.items)

    def __getitem__(self, index: int):
        return self.items[index]


def build_train_val_datasets(
    data_dir: Path,
    *,
    layout: str,
    augment_transform,
    eval_transform,
    augment_count: int = 20,
    val_ratio: float = 0.2,
    seed: int = 42,
) -> tuple[AugmentedImageDataset, AugmentedImageDataset, list[str]]:
    """元画像を1件ずつtrain/valに割り当ててから、それぞれ独立にバリエーションを生成する。

    val側の元画像はtrain側の拡張生成に一切使われないため、
    「同じ元画像由来のバリエーション同士」でのリークは起きない。
    """
    if layout == "flat":
        samples, classes = _load_flat_samples(data_dir)
    elif layout == "folder":
        samples, classes = _load_folder_samples(data_dir)
    else:
        raise ValueError(f"unknown layout: {layout}")

    if not samples:
        raise RuntimeError(f"{data_dir} に画像が見つかりません")

    import random

    rng = random.Random(seed)

    by_label: dict[str, list[tuple[Path, str]]] = {}
    for sample in samples:
        by_label.setdefault(sample[1], []).append(sample)

    train_samples: list[tuple[Path, str]] = []
    val_samples: list[tuple[Path, str]] = []

    for label, label_samples in by_label.items():
        shuffled = label_samples[:]
        rng.shuffle(shuffled)

        if len(shuffled) == 1:
            # 元画像が1枚しかないクラスは、その1枚をtrainとvalの両方の元画像として使う
            # （拡張後のピクセルは毎回異なる乱数で生成されるため、拡張後サンプル自体は重複しない）
            train_samples.extend(shuffled)
            val_samples.extend(shuffled)
            continue

        split_at = max(1, int(len(shuffled) * (1 - val_ratio)))
        train_samples.extend(shuffled[:split_at])
        val_samples.extend(shuffled[split_at:])

    val_augment_count = max(1, augment_count // 4)

    train_dataset = AugmentedImageDataset(
        train_samples, classes, augment_transform, augment_count
    )
    val_dataset = AugmentedImageDataset(
        val_samples, classes, eval_transform, val_augment_count
    )

    return train_dataset, val_dataset, classes
