# MediScript AI - Prescription Decoder Setup Guide

## Overview
MediScript AI is a hyper-intelligent prescription decoder powered by Google Gemini Vision API. It transforms any doctor's handwritten or printed prescription into a structured, actionable health plan.

## Features
- ✅ OCR extraction with bounding box confidence scores
- ✅ Medical Entity Recognition (medications, dosage, frequency, duration, tests)
- ✅ Intelligent normalization (BD → twice daily, TDS → thrice daily, etc.)
- ✅ Safety conflict detection (allergies, contraindications)
- ✅ Auto-schedule dose reminders
- ✅ Today's Health Actions banner
- ✅ Pharmacy-ready output
- ✅ Lab tests extraction and prioritization

## Setup Instructions

### 1. Backend Setup

1. **Install Dependencies** (already done)
   ```bash
   cd backend
   npm install @google/generative-ai
   ```

2. **Get Gemini API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the API key

3. **Configure Environment Variables**
   - Add to `backend/.env`:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start Backend Server**
   ```bash
   cd backend
   npm start
   ```

### 2. Frontend Setup

The frontend is already configured. The prescription decoder is integrated into the Pharmacy screen.

### 3. Usage

1. Open the **Pharmacy** tab in the app
2. Tap the **camera icon** in the search bar
3. Choose **Camera** or **Gallery**
4. Take/select a prescription image
5. Wait for decoding (shows loading animation)
6. Review the decoded prescription on the PrescriptionDecoder screen
7. Tap **"Schedule Reminders"** to auto-schedule medication reminders
8. Tap **"Save to Records"** to save the prescription

## API Endpoint

**POST** `/api/prescriptions/decode`

**Request:**
- Content-Type: `multipart/form-data`
- Body: FormData with `prescription` field (image file)

**Response:**
```json
{
  "success": true,
  "data": {
    "prescription": {
      "medications": [...],
      "tests": [...],
      "summary": "...",
      "confidence": 88,
      "safetyAlerts": [],
      "remindersScheduled": false,
      ...
    }
  }
}
```

## Features Breakdown

### 1. Raw OCR Extraction
Extracts all visible text with confidence scores using Gemini Vision.

### 2. Medical Entity Recognition
- Medications (name, strength, form)
- Dosage (e.g., 500mg, 1 tab)
- Frequency (BD, TDS, SOS, 1-0-1)
- Duration (5 days, 2 weeks)
- Route (oral, IV, topical)
- Doctor Notes
- Tests Advised
- Diagnosis Hints

### 3. Intelligent Normalization
- BD → Twice daily (morning & night)
- TDS → Thrice daily
- SOS → When needed
- AC → Before food
- PC → After food
- Standardizes drug names

### 4. Safety Engine
- Drug-duplicate alerts
- Allergy conflicts
- Contraindications
- Overdose risks

### 5. Auto-Schedule Reminders
Automatically creates push notifications for each medication based on frequency and duration.

### 6. Today's Health Actions
Dynamic banner showing:
- Medications to take today
- Tests to get
- Doctor follow-ups

## Troubleshooting

### "Prescription decoder service is not configured"
- Make sure `GEMINI_API_KEY` is set in `backend/.env`
- Restart the backend server after adding the key

### "Failed to decode prescription"
- Ensure the image is clear and well-lit
- Check that the prescription text is readable
- Verify the backend server is running
- Check backend logs for errors

### Reminders not scheduling
- Ensure notification permissions are granted
- Check that MedicineReminderService is properly initialized

## Notes

- The decoder works best with clear, well-lit images
- Handwritten prescriptions may have lower confidence scores
- Always review decoded prescriptions for accuracy
- Safety alerts should be taken seriously

