# How to Get Gemini API Key

## Quick Steps:

1. **Go to Google AI Studio**: https://makersuite.google.com/app/apikey

2. **Sign in** with your Google account

3. **Click "Create API Key"** or "Get API Key"

4. **Copy the API key** (it will look like: `AIzaSy...`)

5. **Add it to backend/.env file**:
   ```bash
   cd backend
   # Edit .env file and replace "your_api_key_here" with your actual key
   # Or run:
   # sed -i '' 's/your_api_key_here/YOUR_ACTUAL_KEY/g' .env
   ```

6. **Restart the backend server**:
   ```bash
   # Stop current server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

## Alternative: Set it directly

```bash
cd backend
# Replace YOUR_ACTUAL_KEY with the key from Google AI Studio
echo "GEMINI_API_KEY=YOUR_ACTUAL_KEY" >> .env
```

## After adding the key:

1. Restart backend: `cd backend && npm run dev`
2. Test the prescription decoder again
3. The error should be gone!

