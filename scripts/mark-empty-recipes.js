const fs = require('fs');
const path = require('path');

const recipesDir = 'behavior_packs/Mizuno 16 Craft BE CIT_1.21.110/recipes';

function getAllRecipeFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files = files.concat(getAllRecipeFiles(fullPath));
    } else if (item.endsWith('.json')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

const recipeFiles = getAllRecipeFiles(recipesDir);
let emptyCount = 0;
let filledCount = 0;

console.log('开始检查并标注空配方...\n');

for (const filePath of recipeFiles) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const recipe = JSON.parse(content);
    
    // 检查是否是空配方（使用 minecraft:air）
    let isEmpty = false;
    
    if (recipe['minecraft:recipe_shaped']) {
      const key = recipe['minecraft:recipe_shaped'].key;
      if (key) {
        for (const k in key) {
          if (key[k].item === 'minecraft:air') {
            isEmpty = true;
            break;
          }
        }
      }
    } else if (recipe['minecraft:recipe_shapeless']) {
      const ingredients = recipe['minecraft:recipe_shapeless'].ingredients;
      if (!ingredients || ingredients.length === 0) {
        isEmpty = true;
      }
    }
    
    if (isEmpty) {
      // 在 description 中添加标注字段
      if (recipe['minecraft:recipe_shaped']) {
        recipe['minecraft:recipe_shaped'].description._comment = "⚠️ 空配方 - 需要填写实际合成材料";
      } else if (recipe['minecraft:recipe_shapeless']) {
        recipe['minecraft:recipe_shapeless'].description._comment = "⚠️ 空配方 - 需要填写实际合成材料";
      }
      
      fs.writeFileSync(filePath, JSON.stringify(recipe, null, '\t'));
      emptyCount++;
      console.log(`✅ 标注: ${path.relative(process.cwd(), filePath)}`);
    } else {
      filledCount++;
    }
  } catch (e) {
    console.error(`❌ 错误: ${filePath} - ${e.message}`);
  }
}

console.log(`\n完成！`);
console.log(`空配方: ${emptyCount} 个（已标注）`);
console.log(`已填充配方: ${filledCount} 个`);

