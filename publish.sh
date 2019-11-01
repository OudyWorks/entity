NEWVERSION=${1:-patch}

echo "Hi ${NEWVERSION}"

npm version $NEWVERSION --no-git-tag-version
mkdir npm

npm run build

cp package.json npm/
# cp .npmignore npm/

cd npm

node --eval 'let fs = require("fs"), package = require("./package.json"); delete package.devDependencies; fs.writeFileSync("./package.json", JSON.stringify(package, null, 2))'

npm publish

cd ../

rm -rf npm