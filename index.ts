import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('data.json', 'utf-8'));
console.log(data);
