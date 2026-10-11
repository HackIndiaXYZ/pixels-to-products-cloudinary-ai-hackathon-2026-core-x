# pixels-to-products-cloudinary-ai-hackathon-2026-core-x
Hackathon team repository for Core X - [hackindia-team:pixels-to-products-cloudinary-ai-hackathon-2026:core-x]
the problem, solution, track, technologies used, Cloudinary integration, setup instructions and how to run/use the project.
# ResQStream AI

**Multi-Modal Search and Rescue (SAR) Media Pipeline**

ResQStream AI is a low-bandwidth search-and-rescue media processing engine designed for emergency services and urban search-and-rescue (USAR) units operating in disaster zones.

---

## 📌 Track & Domain

* **Track:** AI Media Pipeline / Developer Tools & Infrastructure
* **Domain:** Emergency Services, Disaster Response, Urban Search and Rescue (USAR), Remote Sensing

---

## 🚨 The Problem

Disaster response operations face severe, competing constraints during the critical "golden 24–48 hours" of a crisis:

1. **The Network Bottleneck:** Aerial drone teams collect large $4\text{K}$ thermal and optical footage, but disaster zones suffer from destroyed or severely degraded cellular/satellite networks. Field rescue units cannot receive heavy raw video files in real time.
2. **The Subterranean Blindspot:** USAR teams insert micro-cameras and endoscopic snake-cameras into dark, dusty rubble voids after earthquakes or structural collapses. Operators waste crucial time manually scrubbing through low-light, disorienting video while trapped survivors face rapid asphyxiation and trauma timelines.

---

## 🛠️ How We Used Cloudinary

Cloudinary is integrated into **ResQStream AI** as a core media engine rather than simple storage, providing adaptive bandwidth management, pre-processing, and real-time visual overlays:

* **Extreme Low-Light Media Remediation:** Dynamically brightens and sharpens dark subterranean snake-camera feeds before AI processing using transformation chains (`e_gamma:50`, `e_improve`, `e_sharpen:100`, `e_denoise`).
* **Thermal-Optical Visual Layer Alignment:** Blends infrared thermal drone streams over optical footage via dynamic layer opacity transformations (`l_image`, `o_60`, `e_screen`).
* **Adaptive Low-Bandwidth HLS Delivery:** Automatically converts heavy raw video into bandwidth-optimized HTTP Live Streaming (HLS) playlists (`.m3u8`) with mobile-friendly quality parameters (`q_auto:eco`, `f_auto`, `w_720`), allowing field teams on $3\text{G}$ or satellite networks to stream video smoothly.
* **Burned-In Telemetry & Hazard Overlays:** Burns AI-detected bounding boxes, life-indicator indicators, and telemetry text (`l_text:Arial_18_bold`, dynamic vector overlays) directly onto output video frames.
* **Dynamic Frame-Accurate Slicing:** Extracts precise $5\text{--}10\text{ second}$ evidence clips (`so_`, `eo_`) around detected life indicators for fast field dispatch review.
* **Direct Signed Ingestion:** Uses server-side HMAC-SHA256 signatures (`/api/sign-upload`) to allow direct client uploads with automated server-side upload presets and asynchronous processing webhooks (`/api/cloudinary-webhook`).

---

## 🏗️ System Architecture

```
[ DUAL MEDIA SOURCES ]
  ├── Aerial Drone: Dual-Stream Thermal + Optical MP4/RTSP
  └── Subterranean Snake-Camera: Ultra-Low Light / Endoscopic Rubble Feed
            │
            ▼
[ BACKEND INGESTION & SECURITY ]
  ├── Signed Upload Signatures (HMAC-SHA256)
  └── Webhook Receivers (/api/cloudinary-webhook)
            │
            ▼
[ FRONTEND CLIENT & FIELD METADATA ]
  ├── Direct Cloudinary Uploads (Chunked for >20MB files)
  └── GPS & Sensor Telemetry Attachment
            │
            ▼
[ CLOUDINARY TRANSCODING & OVERLAYS ]
  ├── Low-Light Enhancement (`e_gamma:50,e_improve,e_sharpen`)
  ├── Dual Thermal/RGB Compositing (`l_image,o_60,e_screen`)
  └── Burned-in Telemetry Overlays (`l_text:Arial_18_bold`)
            │
            ▼
[ ADAPTIVE DELIVERY & TACTICAL DASHBOARD ]
  ├── HLS Adaptive Stream Playlist Generation (`.m3u8`)
  ├── Dynamic Thumbnail Grid (`f_auto,q_auto,w_400`)
  └── Edge-Friendly Tactical Dashboard (Video.js / Mapbox)

```

---

## 💻 Tech Stack

* **Backend:** Node.js (Express) / Python (FastAPI), Cloudinary Node/Python SDK
* **Frontend:** React.js, Tailwind CSS, Video.js (HLS streaming), Mapbox GL
* **AI / CV Processing:** PyTorch, YOLOv8-Pose, OpenCV, Gemini 1.5 Pro VLM
* **Testing:** Playwright, Jest, Mock Service Worker (MSW)

---

## 🚀 Setup & Installation Instructions

### Prerequisites

* Node.js v18.x or higher
* Python 3.10 or higher
* A Cloudinary Account (Cloud Name, API Key, API Secret)

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/resqstream-ai.git
cd resqstream-ai

```

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_WEBHOOK_SECRET=your_webhook_secret

```

Create a `.env.local` file in the `frontend/` directory:

```env
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_API_BASE_URL=http://localhost:5000/api

```

### 3. Backend Setup

```bash
cd backend
npm install
npm run dev

```

The backend API server will start on `http://localhost:5000`.

### 4. Frontend Setup

In a new terminal window:

```bash
cd frontend
npm install
npm start

```

The frontend application will launch on `http://localhost:3000`.

---

## 🧪 How to Test

### Quick Local Test (Zero Credit Usage / Mock Mode)

To test the frontend UI and layout without making live network requests to Cloudinary:

```bash
cd frontend
npm run test:mock

```

This launches the dashboard populated with local mock assets from `/public/samples/mock_rubble.jpg` and `/public/samples/mock_drone.mp4`.

### Full Integration Test (Live Pipeline)

1. **Start Services:** Ensure local servers are running.
Ensure both the backend (http://localhost:5000) and frontend (http://localhost:3000) are running.


2. **Navigate to Ingestion:** Access the upload drawer.
Open http://localhost:3000 in your browser and click on the Tactical Upload Drawer.


3. **Upload Sample Media:** Select feed type and add file.
Select sensor type (e.g., Snake-Cam or Drone Thermal), attach GPS coordinates, and upload a sample MP4 video file from the /samples/ folder.


4. **Verify Transformation:** Inspect brightened low-light view.
Observe the uploaded item in the Tactical Gallery Grid. The subterranean video will automatically process through Cloudinary's exposure and noise reduction filters.


5. **Test HLS Streaming:** Verify low-bandwidth playback.
Click on the processed video card to open the HLS Player Modal. Verify that the video plays back via the generated .m3u8 adaptive stream with burned-in telemetry overlays.


### Running E2E Automated Tests

To execute the automated Playwright testing suite:

```bash
cd frontend
npx playwright test

```

---

## 📂 Repository Structure

```
resqstream-ai/
├── backend/
│   ├── config/cloudinary.js          # Cloudinary SDK Configuration
│   ├── routes/uploadSign.js          # HMAC-SHA256 Signature Generation
│   ├── routes/webhooks.js            # Asynchronous Webhook Receivers
│   └── server.js                     # Express API Server
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadWidget.jsx      # Drag-and-Drop Direct Upload UI
│   │   │   ├── GalleryGrid.jsx       # Tactical GIS Media Grid
│   │   │   ├── VideoPlayer.jsx       # HLS Adaptive Player Modal
│   │   │   └── TransformBar.jsx      # Live Transformation Controls
│   │   └── utils/
│   │       ├── urlBuilder.js         # Cloudinary Delivery URL Generator
│   │       └── transformPipeline.js  # Dynamic Overlay Transformations
└── tests/
    ├── e2e/resqstream.spec.js        # Playwright E2E Integration Suite
    └── mocks/mockAssets.json         # Offline Local Test Fixtures

```
