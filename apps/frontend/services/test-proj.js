const axios = require('axios');

async function test() {
  try {
    const loginRes = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'admin@annotator.com',
      password: 'password'
    });
    const token = loginRes.data.data.accessToken;

    const res = await axios.get('http://localhost:3001/api/v1/projects?page=1&limit=100', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(JSON.stringify(res.data, null, 2));

  } catch (err) {
    console.error("Status:", err.response?.status);
    console.error("Data:", err.response?.data);
  }
}
test();
