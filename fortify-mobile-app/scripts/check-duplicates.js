const data = require('../exercises-export.json');
const names = data.map(e => e.name);
const duplicates = names.filter((n, i) => names.indexOf(n) !== i);
const uniqueDupes = [...new Set(duplicates)];
console.log('Duplicate names found:', uniqueDupes.length);
uniqueDupes.forEach(n => {
  const count = names.filter(x => x === n).length;
  console.log(`  - "${n}" appears ${count} times`);
});
