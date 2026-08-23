"""
MDS471 — Neural Networks and Deep Learning
Academic Project: SmartClaim AI — Automated Perishable Spoilage Verification
Model Architecture: MobileNetV2 with Transfer Learning for Perishable Produce Freshness Classification

Supported Classes (6):
1. Fresh Apple
2. Fresh Banana
3. Fresh Orange
4. Rotten Apple
5. Rotten Banana
6. Rotten Orange
"""

import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
NUM_CLASSES = 6
CLASS_NAMES = [
    "Fresh Apple",
    "Fresh Banana",
    "Fresh Orange",
    "Rotten Apple",
    "Rotten Banana",
    "Rotten Orange"
]


def build_transfer_learning_model(num_classes=NUM_CLASSES):
    """
    Constructs the MobileNetV2 Transfer Learning Architecture:
    1. Base Model: MobileNetV2 pre-trained on ImageNet (include_top=False)
    2. Freeze Base Feature Extractor layers initially
    3. Custom Classification Head:
       - GlobalAveragePooling2D
       - BatchNormalization
       - Dense(128, activation='relu') + L2 regularization
       - Dropout(0.35) for regularized generalization
       - Dense(num_classes, activation='softmax') output layer
    """
    base_model = MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze the convolutional base initially
    base_model.trainable = False

    inputs = tf.keras.Input(shape=(224, 224, 3))
    
    # Preprocessing layer: normalizes pixels from [0, 255] to [-1.0, 1.0] as expected by MobileNetV2
    x = tf.keras.applications.mobilenet_v2.preprocess_input(inputs)
    
    # Feature extraction via frozen MobileNetV2 base
    x = base_model(x, training=False)
    
    # Classification Head
    x = layers.GlobalAveragePooling2D(name='global_avg_pool')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dense(128, activation='relu', kernel_regularizer=tf.keras.regularizers.l2(1e-4))(x)
    x = layers.Dropout(0.35)(x)
    outputs = layers.Dense(num_classes, activation='softmax', name='freshness_predictions')(x)

    model = models.Model(inputs=inputs, outputs=outputs, name='SmartClaim_MobileNetV2_TransferLearning')
    return model, base_model


def train_model(train_dataset=None, val_dataset=None, epochs=10, model_save_path='mobilenetv2_freshness.keras'):
    """
    Trains the classification model using transfer learning and optional fine-tuning.
    """
    model, base_model = build_transfer_learning_model()

    # Compile with Adam optimizer and Categorical Crossentropy loss
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss='categorical_crossentropy',
        metrics=['accuracy', tf.keras.metrics.Precision(name='precision'), tf.keras.metrics.Recall(name='recall')]
    )

    print("Phase 1: Training Classification Head on Frozen MobileNetV2 Base...")
    model.summary()

    callbacks = [
        EarlyStopping(monitor='val_loss', patience=3, restore_best_weights=True, verbose=1),
        ModelCheckpoint(filepath=model_save_path, monitor='val_accuracy', save_best_only=True, verbose=1),
        ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=2, min_lr=1e-6, verbose=1)
    ]

    if train_dataset is not None and val_dataset is not None:
        history = model.fit(
            train_dataset,
            validation_data=val_dataset,
            epochs=epochs,
            callbacks=callbacks
        )

        # Phase 2: Fine-tune the top convolutional layers of MobileNetV2 (from layer 140 onwards)
        print("\nPhase 2: Fine-Tuning Top Convolutional Blocks of MobileNetV2...")
        base_model.trainable = True
        fine_tune_at = 140
        for layer in base_model.layers[:fine_tune_at]:
            layer.trainable = False

        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),  # Lower learning rate for fine-tuning
            loss='categorical_crossentropy',
            metrics=['accuracy', tf.keras.metrics.Precision(name='precision'), tf.keras.metrics.Recall(name='recall')]
        )

        history_finetune = model.fit(
            train_dataset,
            validation_data=val_dataset,
            epochs=5,
            callbacks=callbacks
        )
    else:
        print("Note: Simulated mode for script demonstration. Saving baseline architecture.")
        model.save(model_save_path)

    # Save class names config
    with open('class_names.json', 'w') as f:
        json.dump(CLASS_NAMES, f, indent=2)
    print(f"Model saved successfully to {model_save_path} and class mapping exported to class_names.json.")

    return model


if __name__ == '__main__':
    train_model()
