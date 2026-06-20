const axios = require('axios');
async function test() {
  try {
    const loginRes = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'admin@annotator.com',
      password: 'password'
    });
    const token = loginRes.data.data.accessToken;

    const res = await axios.get('http://localhost:3001/api/v1/timesheets?period=All Time', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (res.data.data && res.data.data.length > 0) {
       console.log("Tasker 0:", JSON.stringify(res.data.data[0].tasker, null, 2));
       console.log("Raw timesheet row 0:", JSON.stringify(res.data.data[0], null, 2));
    } else {
       console.log("No timesheets returned.");
    }
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}
test();
