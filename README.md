# MelanoLens AI
**See the Edges. Understand the Boundaries.**

> MelanoLens AI is an educational computer vision project for experimental skin lesion boundary enhancement and image analysis. It is not a medical diagnostic tool. Its outputs must not be used to diagnose skin cancer or make treatment decisions.

Milestone 3 (Stage 1-4): backend + frontend. Backend: validation, preprocessing, Edge Booster, edge detectors,
boundary extraction, metrics, REST API, 51 tests. Frontend: 6 pages in plain HTML/CSS/vanilla JS served by Flask
(Dataset Browser and ISIC integration come in Milestone 4).
Full README (dataset, API docs, frontend) comes in Stage 7.

## Quick start (Windows PowerShell)
```powershell
cd melanolens-ai
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
cd backend
pytest
python app.py          # http://127.0.0.1:5000/api/health
```
If PowerShell blocks activation: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

## API quick reference (Milestone 2)
| Method | Path | Purpose |
|---|---|---|
| GET | /api/health | status |
| GET | /api/defaults | default parameters and option lists |
| POST | /api/upload | multipart: `image` (required), `mask` (optional reference) -> `result_id` |
| POST | /api/process | JSON `{"result_id": "...", "params": {...}}` runs the full pipeline |
| GET | /api/results/<id> | metadata, image and download URLs |
| GET | /api/results/<id>/image/<type> | PNG (e.g. original, enhanced, edges, contour_overlay, mask, reference_mask, difference, edges_conv_canny, edges_enh_canny) |
| GET | /api/results/<id>/download/<type> | same PNG as a download |
| DELETE | /api/results/<id> | delete all stored files of a result |
| POST | /api/evaluate | JSON `{"result_id": "..."}` -> metrics table (or "Ground-truth mask unavailable") |
| GET | /api/evaluate/<id>/export?format=csv\|json | metrics export |
| GET | /api/evaluate/<id>/chart.png | Matplotlib Dice chart |

Uploads and results are stored in `data/results/<result_id>/`. Delete that folder (or call DELETE) to remove them.

## Using the app (Milestone 3)
```powershell
cd backend
python app.py
```
Open **http://127.0.0.1:5000/** (not by double-clicking index.html: the pages call the Flask API on the same address).

Demo flow: Upload (image + optional reference mask) -> Process Image -> Edge Booster workspace (change sliders, Process again)
-> Boundary Analysis (zoom, before/after slider, candidate contours, downloads) -> Evaluation (conventional vs enhanced table, chart, CSV/JSON export).
Frontend files: `frontend/*.html`, `frontend/css/`, `frontend/js/` (app.js = shared helpers, viewer.js = zoom/compare viewer).

## Practical notes from testing on a real ISIC image
- **Image frames:** many dermoscopy images have a 1-2 px bright/dark frame. "Ignore image border" (default 5 px) overwrites the outer pixels with their inner neighbours *before* filtering, so the frame cannot become a contour.
- **Auto Canny thresholds** (default on): high = percentile of the gradient magnitude, low = 0.4 x high, computed separately for the conventional and the enhanced image so both get a comparable edge budget. Fixed thresholds on the enhanced image can flood the edge map into one giant blob.
- **Dermoscopy preset** button (workspace): larger blur (9), closing kernel 11, "closest to centre" selection. It is a starting point tuned on a single image (ISIC_0000000), not a validated setting.
- Soft, fuzzy lesion borders give ragged contours (low circularity). Without a reference mask no accuracy can be computed; judge visually or add a mask.
