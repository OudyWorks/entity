NEWVERSION=${1:-patch}

echo "Hi ${NEWVERSION}"

npm version $NEWVERSION --no-git-tag-version
mkdir publish

babel ./ -d publish 

cp package.json publish/
cp .npmignore publish/

cd publish

node --eval 'let fs = require("fs"), package = require("./package.json"); delete package.devDependencies; fs.writeFileSync("./package.json", JSON.stringify(package, null, 2))'

npm publish

cd ../

rm -rf publish