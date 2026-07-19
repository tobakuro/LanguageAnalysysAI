"""音（前景の絵 + 背景模様の組み合わせ）分類器の訓練スクリプト。

training/data/sound/ 配下のフラット画像（ファイル名にラベル埋め込み）から学習する。

【検証方法の注意】
1クラスあたりの元画像がほぼ1枚しかないため、元画像そのものをtrain/valに分けることはできない。
そのため、元画像から augment_count 枚のデータ拡張バリエーションを生成し、それをtrain/valに
分割する。多くのクラスではtrain/valが同一の元画像に由来するため、この検証で測れるのは
「回転・明るさ変化などのバリエーションにどれだけ頑健か」であり、「本物の紙で撮った未知画像への
汎化性能」ではない。後者は実機での撮影テスト（別Issue）で別途検証する必要がある。
"""

import json
from pathlib import Path

import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import transforms

from dataset import build_train_val_datasets
from model import build_model

DATA_DIR = Path(__file__).parent / "data" / "sound"
OUTPUT_DIR = Path(__file__).parent / "models"
IMAGE_SIZE = 224
EPOCHS = 30
BATCH_SIZE = 8
LEARNING_RATE = 1e-3
AUGMENT_COUNT = 20
VAL_RATIO = 0.2

NORMALIZE = transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])

train_transform = transforms.Compose(
    [
        transforms.RandomResizedCrop(IMAGE_SIZE, scale=(0.8, 1.0)),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.2),
        transforms.ToTensor(),
        NORMALIZE,
    ]
)

eval_transform = transforms.Compose(
    [
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        NORMALIZE,
    ]
)


def run_epoch(model, loader, device, criterion, optimizer=None):
    is_train = optimizer is not None
    model.train(is_train)

    total_loss = 0.0
    correct = 0
    total = 0

    with torch.set_grad_enabled(is_train):
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)

            if is_train:
                optimizer.zero_grad()

            outputs = model(images)
            loss = criterion(outputs, labels)

            if is_train:
                loss.backward()
                optimizer.step()

            total_loss += loss.item() * images.size(0)
            correct += (outputs.argmax(dim=1) == labels).sum().item()
            total += images.size(0)

    return total_loss / total, correct / total


def main() -> None:
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    train_dataset, val_dataset, classes = build_train_val_datasets(
        DATA_DIR,
        layout="flat",
        augment_transform=train_transform,
        eval_transform=eval_transform,
        augment_count=AUGMENT_COUNT,
        val_ratio=VAL_RATIO,
    )

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)

    model = build_model(num_classes=len(classes)).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE)

    for epoch in range(1, EPOCHS + 1):
        train_loss, train_acc = run_epoch(model, train_loader, device, criterion, optimizer)
        val_loss, val_acc = run_epoch(model, val_loader, device, criterion, optimizer=None)
        print(
            f"epoch {epoch:3d}/{EPOCHS}  "
            f"train_loss={train_loss:.4f} train_acc={train_acc:.3f}  "
            f"val_loss={val_loss:.4f} val_acc={val_acc:.3f}"
        )

    OUTPUT_DIR.mkdir(exist_ok=True)
    torch.save(model.state_dict(), OUTPUT_DIR / "sound.pt")
    with (OUTPUT_DIR / "sound_classes.json").open("w", encoding="utf-8") as f:
        json.dump(classes, f, ensure_ascii=False, indent=2)

    print(f"モデルを保存しました: {OUTPUT_DIR / 'sound.pt'}")
    print(f"クラス数: {len(classes)}")


if __name__ == "__main__":
    main()
