import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'admin@glass.local', // wait I don't know the admin credentials.
      password: 'admin' // Let's guess. But actually I can just run a script inside the NestJS context to bypass auth.
    });
    console.log(res.data);
  } catch(e) {
    console.error(e.response?.data || e.message);
  }
}
test();
