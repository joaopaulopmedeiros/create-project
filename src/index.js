import chalk from "chalk";
import fs from "fs";
import ncp from "ncp";
import path from "path";
import { promisify } from "util";

const access = promisify(fs.access);

const copy = promisify(ncp);

async function copyTemplateFiles(options){
    return copy(options.templateDirectory, options.targetDirectory, {
        clobber: false,
    });
}

export async function createProject(options) {
    options = {
        ...options,
        targetDirectory: options.targetDirectory || process.cwd(),
    }

    const currentFileUrl = import.meta.url;
    
    const templateDir = path.resolve(
        new URL(currentFileUrl).pathname,
        '../../templates',
        options.template.toLowerCase()
    );

    options.templateDirectory = templateDir;

    try {
        await access(templateDir,fs.constants.R_OK);
    } catch(error){
        console.error('$s Nome de template inválido', chalk.red.bold('ERRO'));
        process.exit(1);
    }

    console.log('Arquivos do projeto estão sendo copiados...');

    await copyTemplateFiles(options);

    console.log('$s Projeto saindo do forno!', chalk.green.bold('SUCESSO'));

    return true; 
}