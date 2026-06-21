import fs from "fs";

const filepath = "src/components/TelegramSimulator.tsx";
const content = fs.readFileSync(filepath, "utf8");

const lines = content.split(/\r?\n/);
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"funche_shiro"')) {
    console.log(`Line ${i+1}: ${lines[i]}`);
    for (let j = Math.max(0, i-3); j <= Math.min(lines.length-1, i+4); j++) {
      console.log(`  ${j+1}: ${lines[j]}`);
    }
  }
}
