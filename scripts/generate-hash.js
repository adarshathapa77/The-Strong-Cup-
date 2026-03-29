import bcrypt from 'bcryptjs';

async function generateHash(password) {
  try {
    const hash = await bcrypt.hash(password, 10);
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('\nUse this hash in your database.');
  } catch (error) {
    console.error('Error generating hash:', error);
  }
}

// Generate hash for NANU@ADMIN
generateHash('NANU@ADMIN');
