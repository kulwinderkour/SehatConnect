/**
 * Prescription Decoder Controller
 * Uses Gemini Vision API to decode prescription images
 */

const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const DecodedPrescription = require('../models/DecodedPrescription');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Initialize Gemini AI
let genAI;
try {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
} catch (error) {
  console.warn('Gemini API not configured. Set GEMINI_API_KEY in .env file.');
}

/**
 * Decode prescription from image using Gemini Vision
 * @route POST /api/prescriptions/decode
 */
exports.decodePrescription = async (req, res, next) => {
  try {
    if (!genAI) {
      return res.status(503).json({
        success: false,
        error: 'Prescription decoder service is not configured. Please set GEMINI_API_KEY in environment variables.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No prescription image provided',
      });
    }

    // Convert image buffer to base64
    const imageBase64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';
    
    console.log('Decoding prescription:', {
      imageSize: req.file.buffer.length,
      mimeType: mimeType,
      base64Length: imageBase64.length,
    });

    // Get patient profile if available (for safety checks)
    const patientProfile = req.body.patientProfile ? JSON.parse(req.body.patientProfile) : null;

    // Use Gemini Vision to decode prescription
    // Use available models that support vision (gemini-2.5 models support vision)
    let model;
    const modelNames = [
      'gemini-2.5-flash-preview-05-20',  // Fast preview model (supports vision)
      'gemini-2.5-pro-preview-03-25',    // Pro preview model (supports vision)
      'gemini-1.5-pro',                   // Fallback
      'gemini-pro',                       // Last resort
    ];
    
    let lastError;
    for (const modelName of modelNames) {
      try {
        model = genAI.getGenerativeModel({ model: modelName });
        console.log(`✅ Using model: ${modelName}`);
        break;
      } catch (error) {
        console.warn(`Failed to load ${modelName}:`, error.message);
        lastError = error;
        continue;
      }
    }
    
    if (!model) {
      throw new Error(`Failed to initialize any Gemini model. Last error: ${lastError?.message || 'Unknown'}`);
    }

    const prompt = `You are MediScript AI — a medical prescription decoder. 

User uploaded a prescription image. 

Step 1: Use Vision OCR to extract all text with coordinates.

Step 2: Identify medications, dosage, frequency, duration, tests, and notes.

Step 3: Normalize abbreviations (BD=twice daily, TDS=thrice daily, SOS=when needed, AC=before food, PC=after food) and drug names.

Step 4: Generate JSON + plain English summary + dose schedule.

Step 5: Flag conflicts if patient has allergies/chronic illness.

Step 6: Output structured JSON with a human summary below.

Return in strict JSON format with this structure:
{
  "medications": [
    {
      "name": "string",
      "strength": "string",
      "form": "string",
      "dosage": "string",
      "frequency": "string",
      "duration": "string",
      "route": "string",
      "notes": "string",
      "normalizedFrequency": "string",
      "times": ["08:00", "20:00"]
    }
  ],
  "tests": [
    {
      "name": "string",
      "urgency": "routine|urgent|asap",
      "notes": "string"
    }
  ],
  "summary": "string",
  "safetyAlerts": ["string"],
  "confidence": number,
  "rawOcr": "string",
  "doctorNotes": "string",
  "diagnosisHints": ["string"],
  "needsReview": boolean,
  "reviewFlags": ["string"]
}

${patientProfile ? `Patient Profile: ${JSON.stringify(patientProfile)}` : ''}

Analyze the prescription image and return the JSON.`;

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    };

    let result, response, text;
    try {
      console.log('Calling Gemini API with model:', model);
      result = await model.generateContent([prompt, imagePart]);
      response = await result.response;
      text = response.text();
      console.log('Gemini API response received, length:', text.length);
    } catch (apiError) {
      console.error('Gemini API Error:', apiError);
      console.error('Error details:', {
        message: apiError.message,
        status: apiError.status,
        statusText: apiError.statusText,
      });
      throw new Error(`Gemini API error: ${apiError.message || 'Unknown error'}`);
    }

    // Parse JSON from response (might have markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').trim();
    }

    let decodedData;
    try {
      decodedData = JSON.parse(jsonText);
    } catch (parseError) {
      // Try to extract JSON from text if parsing fails
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        decodedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse JSON from AI response');
      }
    }

    // Normalize and enhance the data
    const normalizedData = normalizePrescriptionData(decodedData);

    // Generate pharmacy-ready list
    normalizedData.pharmacyReadyList = generatePharmacyList(normalizedData.medications || []);

    // Set reminders scheduled flag
    normalizedData.remindersScheduled = false; // Will be set to true after scheduling

    res.status(200).json({
      success: true,
      data: {
        prescription: normalizedData,
      },
    });
  } catch (error) {
    console.error('Error decoding prescription:', error);
    console.error('Error stack:', error.stack);
    
    // Return more detailed error message
    const errorMessage = error.message || 'Unknown error occurred';
    const isApiError = errorMessage.includes('Gemini') || errorMessage.includes('API');
    
    res.status(500).json({
      success: false,
      error: 'Failed to decode prescription',
      message: isApiError 
        ? `Gemini API error: ${errorMessage}. Please check your API key and model availability.`
        : errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

/**
 * Normalize prescription data
 */
function normalizePrescriptionData(data) {
  const normalized = { ...data };

  // Normalize medications
  if (normalized.medications && Array.isArray(normalized.medications)) {
    normalized.medications = normalized.medications.map(med => {
      const normalizedMed = { ...med };

      // Normalize frequency
      if (med.frequency) {
        const freqResult = normalizeFrequency(med.frequency);
        normalizedMed.normalizedFrequency = freqResult.normalized;
        if (!normalizedMed.times || normalizedMed.times.length === 0) {
          normalizedMed.times = freqResult.times;
        }
      }

      // Ensure all required fields
      normalizedMed.name = normalizedMed.name || 'Unknown';
      normalizedMed.strength = normalizedMed.strength || '';
      normalizedMed.form = normalizedMed.form || 'tablet';
      normalizedMed.dosage = normalizedMed.dosage || '1';
      normalizedMed.frequency = normalizedMed.frequency || 'once daily';
      normalizedMed.duration = normalizedMed.duration || '';

      return normalizedMed;
    });
  } else {
    normalized.medications = [];
  }

  // Ensure tests array
  if (!normalized.tests || !Array.isArray(normalized.tests)) {
    normalized.tests = [];
  }

  // Ensure safety alerts
  if (!normalized.safetyAlerts || !Array.isArray(normalized.safetyAlerts)) {
    normalized.safetyAlerts = [];
  }

  // Ensure confidence score
  if (typeof normalized.confidence !== 'number') {
    normalized.confidence = 75; // Default confidence
  }

  // Ensure summary
  if (!normalized.summary) {
    normalized.summary = generateSummary(normalized.medications, normalized.tests);
  }

  return normalized;
}

/**
 * Normalize frequency abbreviations
 */
function normalizeFrequency(frequency) {
  const freq = frequency.toUpperCase().trim();
  
  const frequencyMap = {
    'BD': { normalized: 'twice daily', times: ['08:00', '20:00'] },
    'BID': { normalized: 'twice daily', times: ['08:00', '20:00'] },
    'TDS': { normalized: 'thrice daily', times: ['08:00', '14:00', '20:00'] },
    'TID': { normalized: 'thrice daily', times: ['08:00', '14:00', '20:00'] },
    'QID': { normalized: 'four times daily', times: ['08:00', '12:00', '16:00', '20:00'] },
    'OD': { normalized: 'once daily', times: ['08:00'] },
    'ONCE': { normalized: 'once daily', times: ['08:00'] },
    'SOS': { normalized: 'when needed', times: [] },
    'PRN': { normalized: 'when needed', times: [] },
    'AC': { normalized: 'before food', times: ['08:00', '20:00'] },
    'PC': { normalized: 'after food', times: ['08:00', '20:00'] },
  };

  if (frequencyMap[freq]) {
    return frequencyMap[freq];
  }

  // Try to parse as "1-0-1" format
  if (freq.match(/^\d+-\d+-\d+$/)) {
    const parts = freq.split('-');
    const times = [];
    if (parts[0] !== '0') times.push('08:00');
    if (parts[1] !== '0') times.push('14:00');
    if (parts[2] !== '0') times.push('20:00');
    return {
      normalized: `${times.length} times daily`,
      times,
    };
  }

  return {
    normalized: frequency,
    times: ['08:00'],
  };
}

/**
 * Generate human-readable summary
 */
function generateSummary(medications, tests) {
  const medSummaries = medications.map(med => {
    const timing = med.notes || '';
    return `Take **${med.name} ${med.strength}** – ${med.dosage} **${med.normalizedFrequency || med.frequency}**${timing ? ` ${timing}` : ''}${med.duration ? ` for **${med.duration}**` : ''}.`;
  });

  const testSummaries = tests.map(test => {
    return `Get **${test.name}**${test.urgency ? ` (${test.urgency})` : ''}${test.notes ? ` - ${test.notes}` : ''}.`;
  });

  return [...medSummaries, ...testSummaries].join(' ');
}

/**
 * Generate pharmacy-ready list
 */
function generatePharmacyList(medications) {
  return medications.map(med => {
    const form = med.form === 'tablet' ? 'Tab.' : med.form === 'syrup' ? 'Syp.' : med.form;
    return `${form} ${med.name} ${med.strength} – ${med.dosage}`;
  });
}

/**
 * Save decoded prescription to database
 * @route POST /api/prescriptions/save-decoded
 */
exports.saveDecodedPrescription = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id; // Get from demo user middleware
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const prescriptionData = req.body;

    // Create new decoded prescription
    const decodedPrescription = new DecodedPrescription({
      userId,
      ...prescriptionData,
    });

    await decodedPrescription.save();

    res.status(201).json({
      success: true,
      data: {
        prescription: decodedPrescription,
      },
      message: 'Prescription saved successfully',
    });
  } catch (error) {
    console.error('Error saving decoded prescription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save prescription',
      message: error.message,
    });
  }
};

/**
 * Get all decoded prescriptions for a user
 * @route GET /api/prescriptions/decoded
 */
exports.getDecodedPrescriptions = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const { limit = 20, isActive } = req.query;

    const query = { userId };
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const prescriptions = await DecodedPrescription.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        prescriptions,
      },
    });
  } catch (error) {
    console.error('Error fetching decoded prescriptions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prescriptions',
      message: error.message,
    });
  }
};

/**
 * Get a single decoded prescription by ID
 * @route GET /api/prescriptions/decoded/:id
 */
exports.getDecodedPrescriptionById = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const prescription = await DecodedPrescription.findOne({
      _id: id,
      userId,
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        error: 'Prescription not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        prescription,
      },
    });
  } catch (error) {
    console.error('Error fetching decoded prescription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prescription',
      message: error.message,
    });
  }
};

// Export multer middleware
exports.upload = upload.single('prescription');


