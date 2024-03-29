import s from 'shelljs';
import fs from 'fs';
import yaml from 'js-yaml';
import { HttpClient } from 'openapi-typescript-codegen';
const OpenAPI = require('openapi-typescript-codegen');
const config = require('./tsconfig.json');
const outDir = config.compilerOptions.outDir;

const apiImplementationDir = '../../api-implementation';
const packageJsonFile = './package.json';
const packageJson = require(`${packageJsonFile}`);

const inputApiSpecFile = `${apiImplementationDir}/server/common/api.yml`;
// const workingDir = "./tmp";
const outputSrcDir = `./src`;
const outputApiSpecFile = `${outputSrcDir}/api.yml`;

const loadYamlFileAsJson = (apiSpecPath: string): any => {
    const b: Buffer = fs.readFileSync(apiSpecPath);
    return yaml.load(b.toString());
}

const getNpmLatestVersion = (): string => {
    let packageName = packageJson.name;
    let latestVersion = s.exec(`npm view ${packageName} version`).stdout.slice(0, -1);
    return latestVersion;
}
const getNewVersion = (): string => {
    let apiSpec = loadYamlFileAsJson(inputApiSpecFile);
    let version = apiSpec.info.version;
    return version;
}
const prepare = () => {
    if(s.rm('-rf', outDir).code !== 0) process.exit(1);
    if(s.mkdir('-p', outDir).code !== 0) process.exit(1);
    // s.rm('-rf', workingDir);
    // s.mkdir('-p', workingDir);
    if(s.rm('-rf', outputSrcDir).code !== 0) process.exit(1);
    if(s.mkdir('-p', outputSrcDir).code !== 0) process.exit(1);
    if(s.cp(`${inputApiSpecFile}`, `${outputApiSpecFile}`).code !== 0) process.exit(1);
}
const generateCode = () => {
    OpenAPI.generate({
        input: inputApiSpecFile,
        output: outputSrcDir
    })
        .then(() => {
            return;
        })
        .catch((error: any) => {
            console.log(error);
            process.exit(1);
        });
}
const main = () => {
    let npmVersion = getNpmLatestVersion();
    let newVersion = getNewVersion();
    console.log(`npm version='${npmVersion}', new version='${newVersion}'`);
    if(newVersion === npmVersion) {
        console.log('nothing to do, exiting.');
        process.exit(2);
    }
    prepare();
    generateCode();    
}

main();

