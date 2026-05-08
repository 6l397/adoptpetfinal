from typing import Any, Optional

import pytorch_lightning as pl
import timm
import torch
import torchmetrics
from timm.data.mixup import Mixup
from timm.loss import SoftTargetCrossEntropy


class EfficientNetClassifier(pl.LightningModule):
    def __init__(
        self,
        num_classes: int,
        model_name: str = "efficientnet_b3",
        learning_rate: float = 1e-4,
        weight_decay: float = 1e-4,
        unfreeze_epoch: int = 5,
        label_smoothing: float = 0.0,
        mixup_alpha: Optional[float] = None,
        cutmix_alpha: Optional[float] = None,
        top_k: int = 5,
    ) -> None:
        super().__init__()
        self.save_hyperparameters()

        self.model = timm.create_model(model_name, pretrained=True, num_classes=num_classes)
        self.learning_rate = learning_rate
        self.weight_decay = weight_decay
        self.unfreeze_epoch = unfreeze_epoch
        self.top_k = top_k

        if mixup_alpha or cutmix_alpha:
            self.mixup_fn: Optional[Mixup] = Mixup(
                mixup_alpha=mixup_alpha or 0.0,
                cutmix_alpha=cutmix_alpha or 0.0,
                num_classes=num_classes,
            )
            self.criterion = SoftTargetCrossEntropy()
        else:
            self.mixup_fn = None
            self.criterion = torch.nn.CrossEntropyLoss(label_smoothing=label_smoothing)

        self.train_acc = torchmetrics.Accuracy(task="multiclass", num_classes=num_classes, top_k=1)
        self.val_acc = torchmetrics.Accuracy(task="multiclass", num_classes=num_classes, top_k=1)
        self.val_topk = torchmetrics.Accuracy(task="multiclass", num_classes=num_classes, top_k=top_k)

        self._freeze_backbone()

    def forward(self, x: torch.Tensor) -> torch.Tensor:  # type: ignore[override]
        return self.model(x)

    def training_step(self, batch: Any, batch_idx: int) -> torch.Tensor:  # type: ignore[override]
        images, targets = batch
        if self.mixup_fn is not None:
            images, targets = self.mixup_fn(images, targets)
        logits = self.forward(images)
        loss = self.criterion(logits, targets)

        self.log("train_loss", loss, on_step=True, on_epoch=True, prog_bar=True)
        if targets.ndim == 1:
            acc = self.train_acc(logits, targets)
            self.log("train_acc", acc, on_step=False, on_epoch=True, prog_bar=True)
        return loss

    def validation_step(self, batch: Any, batch_idx: int) -> None:  # type: ignore[override]
        images, targets = batch
        logits = self.forward(images)
        loss = self.criterion(logits, targets)
        acc1 = self.val_acc(logits, targets)
        acck = self.val_topk(logits, targets)

        self.log("val_loss", loss, prog_bar=True, on_epoch=True, sync_dist=True)
        self.log("val_acc1", acc1, prog_bar=True, on_epoch=True, sync_dist=True)
        self.log(
            f"val_acc{self.top_k}",
            acck,
            prog_bar=False,
            on_epoch=True,
            sync_dist=True,
        )

    def test_step(self, batch: Any, batch_idx: int) -> None:  # type: ignore[override]
        images, targets = batch
        logits = self.forward(images)
        acc1 = self.val_acc(logits, targets)
        acck = self.val_topk(logits, targets)

        self.log("test_acc1", acc1, prog_bar=True, on_epoch=True, sync_dist=True)
        self.log(
            f"test_acc{self.top_k}", acck, prog_bar=True, on_epoch=True, sync_dist=True
        )

    def configure_optimizers(self):  # type: ignore[override]
        optimizer = torch.optim.AdamW(
            self.parameters(), lr=self.learning_rate, weight_decay=self.weight_decay
        )
        scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=self.trainer.max_epochs)
        return {
            "optimizer": optimizer,
            "lr_scheduler": scheduler,
            "monitor": "val_loss",
        }

    def on_train_epoch_start(self) -> None:  # type: ignore[override]
        if self.unfreeze_epoch and self.current_epoch == self.unfreeze_epoch:
            self._unfreeze_backbone()

    def _freeze_backbone(self) -> None:
        classifier = self.model.get_classifier()
        classifier_param_ids = {id(p) for p in classifier.parameters()} if classifier else set()
        for param in self.model.parameters():
            if id(param) in classifier_param_ids:
                param.requires_grad = True
            else:
                param.requires_grad = self.unfreeze_epoch == 0

    def _unfreeze_backbone(self) -> None:
        for param in self.model.parameters():
            param.requires_grad = True