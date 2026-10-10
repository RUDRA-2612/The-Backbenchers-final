const { API_URL = 'http://localhost:5000' } = process.env;

async function testPerf() {
  const endpoints = [
    '/api/materials',
    '/api/admin/reports',
    '/api/admin/logins',
    '/api/admin/users',
    '/api/admin/downloads',
    '/api/admin/blocked-emails',
    '/api/admin/user-activities',
    '/api/admin/activity-logs'
  ];

  console.log('Testing individual endpoint latency...');
  for (const ep of endpoints) {
    const start = Date.now();
    try {
      const res = await fetch(`${API_URL}${ep}`, {
        headers: {
          'x-user-email': 'rudrapalsinghshekhawat@jklu.edu.in',
          'x-user-id': 'b1c24747-063a-4be7-ab87-0b5c179c32de' // mock or valid id if needed, actually server bypasses if valid admin email? Wait, server needs valid admin userId. Let's see if it works without userId for just timing if we mock it, but verifyAdmin requires it.
        }
      });
      const end = Date.now();
      console.log(`${ep}: ${res.status} - ${end - start}ms`);
    } catch (e) {
      console.error(ep, 'Error:', e.message);
    }
  }
}

testPerf();
