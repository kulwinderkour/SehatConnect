# Records Section - Quick Reference Card

## 🎯 Quick Links
- **Main Screen**: `src/screens/RecordsScreen.tsx`
- **Data Management**: `src/contexts/RecordsContext.tsx`
- **Notifications**: `src/services/NotificationService.ts`
- **Types**: `src/types/health.ts`
- **Setup Guide**: `RECORDS_SECTION_GUIDE.md`
- **Summary**: `RECORDS_IMPLEMENTATION_SUMMARY.md`

## 📦 Install Dependencies
```bash
./setup-records-dependencies.sh
```

## 🔑 Key Functions

### From RecordsContext (`useRecords()`)
```typescript
const {
  state,                      // All records data
  addConsultation,            // Add consultation history
  addMedicalHistory,          // Add medical condition/allergy
  addPrescription,            // Add prescription & create schedule
  toggleMedicationReminder,   // Enable/disable reminders
  markDoseTaken,              // Mark medication dose as taken
  syncWithABHA,               // Sync medical history from ABHA
  getActiveMedications,       // Get active medication schedules
  getUpcomingDoses,           // Get next doses due
} = useRecords();
```

### From NotificationService
```typescript
import { notificationService } from '../services/NotificationService';

// Schedule medication reminder
notificationService.scheduleMedicationReminder(
  scheduleId,
  medicationName,
  dosage,
  time,      // 'HH:mm' format
  repeatDaily
);

// Cancel reminder
notificationService.cancelMedicationReminder(scheduleId, time);

// Play buzzer
notificationService.playMedicationBuzzer();

// Request permissions
await notificationService.requestPermissions();
```

### From useHealthRecords Hook
```typescript
import { useHealthRecords } from '../hooks/useHealthRecords';

const { 
  completeConsultation,
  addPrescriptionToRecords,
  createSamplePrescription 
} = useHealthRecords();

// After video consultation ends
await completeConsultation(
  appointment,
  diagnosis,
  prescription,
  notes
);
```

## 📊 State Structure
```typescript
state = {
  consultationHistory: ConsultationHistory[],
  medicalHistory: MedicalHistory[],
  activePrescriptions: Prescription[],
  medicationSchedules: MedicationSchedule[],
  labReports: LabTest[],
  loading: boolean,
  error: string | null,
  abhaLinked: boolean,
  lastSyncedAt: string
}
```

## 🎨 UI Components

### Tabs
- **Medications**: Active medication schedules with reminders
- **Consultations**: Past consultation history
- **Medical History**: Conditions, allergies, surgeries from ABHA

### Cards
- **MedicationCard**: Shows medication with daily schedule
- **ConsultationCard**: Shows past consultation details
- **MedicalHistoryCard**: Shows medical conditions

## 🔔 Notification Flow
```
1. Prescription added
   ↓
2. Medication schedule created
   ↓
3. Notifications scheduled (daily recurring)
   ↓
4. At scheduled time:
   - Notification appears
   - Buzzer plays
   ↓
5. User marks dose taken
   ↓
6. Checkmark appears on time chip
```

## 🧪 Test with Sample Data
```typescript
import { loadSampleData } from '../utils/sampleRecordsData';

// In your component
const records = useRecords();
await loadSampleData(records);
```

## ⚙️ Required Permissions

### AndroidManifest.xml
```xml
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
```

### Info.plist (iOS)
```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

## 🎵 Sound File Required
- **File**: `medication_alert.mp3`
- **Android**: `android/app/src/main/res/raw/medication_alert.mp3`
- **iOS**: Add to Xcode project

## 🚦 Status Indicators

### Medication Status
- 🟢 **Active**: Currently taking
- ⏸️ **Inactive**: Stopped or completed
- ✓ **Dose Taken**: Completed for the day
- ⏰ **Upcoming**: Next dose scheduled

### Medical History Severity
- 🟢 **Mild**: Green badge
- 🟡 **Moderate**: Orange badge
- 🔴 **Severe**: Red badge

## 📱 Usage Examples

### Add Consultation After Video Call
```typescript
const consultation: ConsultationHistory = {
  id: generateId(),
  appointmentId: appointment.id,
  doctorName: appointment.doctorName,
  doctorSpecialty: appointment.doctorSpecialty,
  date: new Date().toISOString(),
  time: appointment.time,
  type: 'video-consultation',
  diagnosis: 'Viral Fever',
  symptoms: ['Fever', 'Headache'],
  prescription: prescription,
  notes: 'Follow up in 3 days',
  status: 'completed',
};

await addConsultation(consultation);
```

### Mark Dose Taken
```typescript
await markDoseTaken(scheduleId, time);
```

### Toggle Reminder
```typescript
await toggleMedicationReminder(scheduleId, enabled);
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Notifications not working | 1. Install dependencies<br>2. Check permissions<br>3. Request permissions |
| Buzzer not playing | 1. Add sound file<br>2. Check volume<br>3. Test on real device |
| Data not persisting | 1. Check AsyncStorage<br>2. Verify save operations |
| Reminders not repeating | 1. Check `repeatDaily` flag<br>2. Verify notification channel |

## 📝 Common Tasks

### Load Demo Data
```typescript
import { loadSampleData } from '../utils/sampleRecordsData';
await loadSampleData(useRecords());
```

### Test Immediate Notification
```typescript
notificationService.sendImmediateNotification(
  'Paracetamol',
  '500mg',
  'Time to take your medication'
);
```

### Get Next Dose
```typescript
const upcoming = getUpcomingDoses();
console.log('Next dose:', upcoming[0]);
```

### Check Active Medications
```typescript
const active = getActiveMedications();
console.log('Active medications:', active.length);
```

## ✅ Checklist Before Testing

- [ ] Install dependencies (`npm install`)
- [ ] Add Android permissions
- [ ] Add iOS background modes
- [ ] Add medication_alert.mp3 sound file
- [ ] Rebuild app
- [ ] Request notification permissions
- [ ] Load sample data
- [ ] Test notification at near time
- [ ] Test marking dose taken
- [ ] Test reminder toggle

## 🎓 Learning Path

1. **Start**: Read `RECORDS_SECTION_GUIDE.md`
2. **Understand**: Review `RECORDS_IMPLEMENTATION_SUMMARY.md`
3. **Setup**: Run `./setup-records-dependencies.sh`
4. **Configure**: Add permissions & sound file
5. **Test**: Load sample data and test features
6. **Integrate**: Connect with video consultation
7. **Deploy**: Test on real devices

---

**Quick Status**: ✅ Implementation Complete | ⏳ Dependencies Needed | 🧪 Ready for Testing
