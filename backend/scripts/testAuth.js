/**
 * Test Authentication Flow
 * Tests login for both demo users
 */

const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

const testUsers = [
  {
    name: 'Demo Patient',
    email: 'patient@sehat.com',
    password: 'Patient@123',
    expectedRole: 'patient',
  },
  {
    name: 'Dr. Rajesh Sharma',
    email: 'drrajesh@sehat.com',
    password: 'Rajesh@123',
    expectedRole: 'doctor',
  },
];

async function testLogin() {
  console.log('\n🔐 Testing Authentication System\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  for (const user of testUsers) {
    try {
      console.log(`Testing login for: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: user.email,
        password: user.password,
      });

      if (response.data.success) {
        const userData = response.data.data.user;
        const token = response.data.data.accessToken;
        
        console.log(`  ✅ Login successful!`);
        console.log(`  - User ID: ${userData._id}`);
        console.log(`  - Role: ${userData.role}`);
        console.log(`  - Name: ${userData.profile.fullName}`);
        
        if (userData.role === 'patient') {
          console.log(`  - Patient ID: ${userData.patientInfo.patientId}`);
        } else if (userData.role === 'doctor') {
          console.log(`  - Specialty: ${userData.doctorInfo.specialty}`);
          console.log(`  - Hospital: ${userData.doctorInfo.hospital}`);
        }
        
        console.log(`  - Token: ${token.substring(0, 30)}...`);
        
        // Test /me endpoint
        const meResponse = await axios.get(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (meResponse.data.success) {
          console.log(`  ✅ /me endpoint verified`);
        }
        
        console.log('');
      }
    } catch (error) {
      console.log(`  ❌ Login failed!`);
      if (error.response) {
        console.log(`  - Error: ${error.response.data.error}`);
      } else {
        console.log(`  - Error: ${error.message}`);
      }
      console.log('');
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Authentication tests completed!\n');
}

// Test appointment booking
async function testAppointmentBooking() {
  console.log('\n📅 Testing Appointment Booking\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Login as patient
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'patient@sehat.com',
      password: 'Patient@123',
    });

    const patientToken = loginResponse.data.data.accessToken;
    console.log('✅ Patient logged in');

    // Book appointment
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 1); // Tomorrow

    const appointmentData = {
      appointmentDate: appointmentDate.toISOString(),
      appointmentTime: '10:00 AM',
      type: 'video',
      reason: 'Regular checkup',
      symptoms: ['Headache', 'Fever'],
    };

    const bookingResponse = await axios.post(
      `${API_URL}/appointments`,
      appointmentData,
      {
        headers: {
          Authorization: `Bearer ${patientToken}`,
        },
      }
    );

    if (bookingResponse.data.success) {
      const appointment = bookingResponse.data.data.appointment;
      console.log('✅ Appointment booked successfully!');
      console.log(`  - Appointment ID: ${appointment._id}`);
      console.log(`  - Doctor: ${appointment.doctorId.profile.fullName}`);
      console.log(`  - Date: ${new Date(appointment.appointmentDate).toLocaleDateString()}`);
      console.log(`  - Time: ${appointment.appointmentTime}`);
      console.log(`  - Type: ${appointment.type}`);
      console.log(`  - Status: ${appointment.status}`);
      console.log('');

      // Login as doctor and check appointments
      const doctorLoginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: 'drrajesh@sehat.com',
        password: 'Rajesh@123',
      });

      const doctorToken = doctorLoginResponse.data.data.accessToken;
      console.log('✅ Doctor logged in');

      const doctorAppointmentsResponse = await axios.get(
        `${API_URL}/appointments`,
        {
          headers: {
            Authorization: `Bearer ${doctorToken}`,
          },
        }
      );

      if (doctorAppointmentsResponse.data.success) {
        const appointments = doctorAppointmentsResponse.data.data.appointments;
        console.log(`✅ Doctor can see ${appointments.length} appointment(s)`);
        
        if (appointments.length > 0) {
          console.log('  - Latest appointment:');
          const latest = appointments[0];
          console.log(`    • Patient: ${latest.patientId.profile.fullName}`);
          console.log(`    • Date: ${new Date(latest.appointmentDate).toLocaleDateString()}`);
          console.log(`    • Time: ${latest.appointmentTime}`);
          console.log(`    • Reason: ${latest.reason}`);
        }
      }
    }
  } catch (error) {
    console.log('❌ Appointment booking test failed!');
    if (error.response) {
      console.log(`  - Error: ${error.response.data.error}`);
    } else {
      console.log(`  - Error: ${error.message}`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Appointment tests completed!\n');
}

async function runTests() {
  try {
    await testLogin();
    await testAppointmentBooking();
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

runTests();
