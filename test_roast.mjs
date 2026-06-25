import http from 'http';
import fs from 'fs';

// 1. Create test resume
fs.writeFileSync('test_resume.txt', 'John Doe\nFull Stack Developer\nSkills: React, Node.js, Python\nIntern at ABC Corp\nB.S. Computer Science');

// 2. Test 1: Check if server is running
console.log('=== Test 1: Server health check ===');
try {
  const r = await fetch('http://localhost:5000/api/roast', { method: 'POST' });
  console.log('Server is running');
} catch(e) {
  console.log('Server NOT running: ' + e.message);
  process.exit(1);
}

// 3. Test 2: Make exact frontend-style request
console.log('\n=== Test 2: Frontend-style fetch with FormData ===');
const formData = new FormData();
const fileBlob = new Blob([fs.readFileSync('test_resume.txt')], { type: 'text/plain' });
formData.append('resume', fileBlob, 'test_resume.txt');

try {
  const response = await fetch('http://localhost:5000/api/roast', {
    method: 'POST',
    body: formData,
  });
  console.log('Status:', response.status, response.statusText);
  const data = await response.json();
  console.log('Response keys:', Object.keys(data));
  console.log('Has summary:', !!data.summary);
  console.log('Has brutalityScore:', !!data.brutalityScore);
  console.log('Has roasts:', data.roasts?.length);
  console.log('ROAST TEST: PASS');
} catch(e) {
  console.log('FETCH ERROR:', e.name, '-', e.message);
}

// 4. Test 3: Test recruit endpoint too for comparison
console.log('\n=== Test 3: Recruit endpoint ===');
const formData2 = new FormData();
formData2.append('resume', fileBlob, 'test_resume.txt');
try {
  const response = await fetch('http://localhost:5000/api/recruit', {
    method: 'POST',
    body: formData2,
  });
  console.log('Status:', response.status, response.statusText);
  const data = await response.json();
  console.log('Has atsScore:', !!data.atsScore);
  console.log('Has strengths:', data.strengths?.length);
  console.log('RECRUIT TEST: PASS');
} catch(e) {
  console.log('FETCH ERROR:', e.name, '-', e.message);
}

fs.unlinkSync('test_resume.txt');
console.log('\n=== ALL TESTS COMPLETE ===');
