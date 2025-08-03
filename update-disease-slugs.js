// Simple script to generate slugs for existing diseases
// You can run this after updating your database schema

const diseases = [
  'Diabetes',
  'Hypertension', 
  'Arthritis',
  'Asthma',
  'Migraine',
  'Digestive Issues',
  'Skin Problems',
  'Respiratory Issues',
  'Heart Disease',
  'Kidney Problems',
  'Liver Issues',
  'Anxiety',
  'Depression',
  'Insomnia',
  'Joint Pain',
  'Back Pain',
  'Cold & Flu',
  'Fever',
  'Headache',
  'Stomach Problems',
  'Constipation',
  'Acidity',
  'Hair Loss',
  'Bone Health',
  'Eye Care',
  'Memory & Brain Health'
];

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim('-'); // Remove leading/trailing hyphens
}

console.log('Disease Name -> Slug mapping:');
console.log('==============================');

diseases.forEach(disease => {
  const slug = generateSlug(disease);
  console.log(`${disease} -> ${slug}`);
});

console.log('\nSQL INSERT statements:');
console.log('======================');

diseases.forEach((disease, index) => {
  const slug = generateSlug(disease);
  console.log(`INSERT INTO disease (name, slug) VALUES ('${disease}', '${slug}') ON CONFLICT (name) DO UPDATE SET slug = '${slug}';`);
});

console.log('\nSQL UPDATE statements (for existing records):');
console.log('=============================================');

diseases.forEach(disease => {
  const slug = generateSlug(disease);
  console.log(`UPDATE disease SET slug = '${slug}' WHERE name = '${disease}';`);
});