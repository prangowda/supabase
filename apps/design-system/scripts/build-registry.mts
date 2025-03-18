import fs from 'fs';
import path from 'path';
import { Project } from 'ts-morph';
import rimraf from 'rimraf';
import chalk from 'chalk';

const REGISTRY_DIR = path.resolve('registry');
const TEMP_DIR = path.join(REGISTRY_DIR, 'temp');
const REGISTRY_INDEX = path.join(REGISTRY_DIR, 'index.ts');

const project = new Project();

function cleanTempDir() {
    if (fs.existsSync(TEMP_DIR)) {
        rimraf.sync(TEMP_DIR);
    }
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

function getSourceFiles(): string[] {
    return fs.readdirSync(REGISTRY_DIR)
        .filter(file => file.endsWith('.ts') && file !== 'index.ts')
        .map(file => path.join(REGISTRY_DIR, file));
}

function extractImports(filePath: string): string[] {
    const sourceFile = project.addSourceFileAtPath(filePath);
    return sourceFile.getImportDeclarations().map(declaration => declaration.getModuleSpecifierValue());
}

function processFile(filePath: string) {
    const fileName = path.basename(filePath);
    const tempFilePath = path.join(TEMP_DIR, fileName);
    const imports = extractImports(filePath);

    let content = fs.readFileSync(filePath, 'utf8');
    imports.forEach(importPath => {
        const alias = `_${path.basename(importPath).replace(/\W/g, '_')}`;
        content = content.replace(new RegExp(importPath, 'g'), alias);
    });

    fs.writeFileSync(tempFilePath, content, 'utf8');
    return tempFilePath;
}

function generateRegistryIndex() {
    const files = getSourceFiles().map(processFile);
    const exportStatements = files.map(file => `export * from './temp/${path.basename(file, '.ts')}';`).join('\n');
    fs.writeFileSync(REGISTRY_INDEX, exportStatements, 'utf8');
}

function buildRegistry() {
    console.log(chalk.blue('Cleaning temporary directory...'));
    cleanTempDir();
    console.log(chalk.green('Processing TypeScript files...'));
    generateRegistryIndex();
    console.log(chalk.yellow('Registry index generated successfully!'));
}

buildRegistry();
