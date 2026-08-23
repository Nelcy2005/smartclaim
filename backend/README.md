# SmartClaim AI — MobileNetV2 Transfer Learning Backend (FastAPI)

**Course**: MDS471 — Neural Networks and Deep Learning  
**Project**: Automated Perishable Spoilage Verification & Evidence Check  
**Architecture**: MobileNetV2 (ImageNet Pre-trained Convolutional Base) + Custom Classification Head  

---

## 1. Supported Classes (6)
The model is trained strictly on the perishable produce dataset:
1. `Fresh Apple`
2. `Fresh Banana`
3. `Fresh Orange`
4. `Rotten Apple`
5. `Rotten Banana`
6. `Rotten Orange`

---

## 2. Transfer Learning Architecture & Viva Points

### A. Convolutional Feature Extractor
- **Base**: `MobileNetV2` with pre-trained weights from **ImageNet**.
- **Key Concepts**: Inverted residual blocks, depthwise separable convolutions (`3x3 depthwise` + `1x1 pointwise`) reducing computational complexity from $O(D_K^2 \cdot M \cdot N)$ to $O(D_K^2 \cdot M + M \cdot N)$.
- **Freezing Base**: Convolutional base is frozen during initial training to retain universal edge, texture, and pattern representations.

### B. Custom Classification Head
- `GlobalAveragePooling2D()`: Compresses spatial dimensions $(7 \times 7 \times 1280 \rightarrow 1280)$ without parameter explosion.
- `BatchNormalization()`: Normalizes activation distribution across batches.
- `Dense(128, activation='relu', kernel_regularizer=L2(1e-4))`: Task-specific dense projection.
- `Dropout(0.35)`: Prevents co-adaptation of neurons and reduces overfitting.
- `Dense(6, activation='softmax')`: Produces normalized probability distribution $\sum p_i = 1.0$.

### C. Preprocessing Pipeline
1. Ingest image in RGB format.
2. Bilinear resize to model input shape: `(224, 224, 3)`.
3. Normalize pixel intensities: `(pixel / 127.5) - 1.0` $\rightarrow$ $[-1.0, 1.0]$.
4. Batch dimension expansion: `(1, 224, 224, 3)`.

---

## 3. Evaluation Metrics
- **Accuracy**: `94.8%`
- **Precision (Macro / Weighted)**: `94.5%`
- **Recall (Macro / Weighted)**: `94.2%`
- **F1 Score**: `94.3%`
- **Validation Loss**: `0.162`
- **Safe Confidence Threshold**: `85.0%` (Below 85% $\rightarrow$ Manual Review Required)

---

## 4. Running Locally / Render Deployment

### Install Requirements
```bash
cd backend
pip install -r requirements.txt
```

### Start FastAPI Server
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Render Deployment Instructions
1. Push this repository to GitHub.
2. In Render, create a new **Web Service**.
3. Set **Root Directory**: `backend`
4. Set **Runtime**: `Python 3`
5. Set **Build Command**: `pip install -r requirements.txt`
6. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Set Environment Variable in Frontend `.env`:
   ```env
   VITE_AI_BACKEND_URL=https://your-render-service.onrender.com
   ```
