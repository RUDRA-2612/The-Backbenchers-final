const fetch = require('node-fetch');

const blockUser = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/admin/block-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': 'rudrapalsinghshekhawat@jklu.edu.in',
        'x-user-id': 'bca5b2c7-013d-4c3e-8121-50e509cbfab0' // I will just use a fake UUID, wait, it verifies user ID
      },
      body: JSON.stringify({ email: 'test_block_123@gmail.com' })
    });
    
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
  } catch(e) {
    console.error(e);
  }
};

blockUser();
