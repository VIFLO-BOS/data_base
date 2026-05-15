const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://cgjbusgkwkiuwamtozqd.supabase.co',
  'sb_publishable_sR5YeP22fE4l_jIfEPIKiQ_3RXwt7Z-',
);

supabase
  .from('_test')
  .select('*')
  .then((res) => {
    console.log('connection succesful', res.status);
  })
  .catch((err) => {
    console.log('Connection failed', err.message);
  });
  