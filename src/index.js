import chalk from "chalk";
import fs from "fs";
import ncp from "ncp";
import path from "path";
import { promisify } from "util";
import execa from "execa";
import Listr from "listr";
import { projectInstall } from "pkg-install";

const access = promisify(fs.access);

const copy = promisify(ncp);

async function copyTemplateFiles(options){
    return copy(options.templateDirectory, options.targetDirectory, {
        clobber: false,
    });
}

export async function initGit(options){
    const result = await execa("git", ['init'], {
        cwd: options.targetDirectory,
    });
    
    if(result.failed) {
        return Promise.reject(new Error('Falha ao inicializar Git.'));
    }
    return ;
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

    const tasks = new Listr([
        {
            title: 'Copiando arquivos do projeto',
            task: () => copyTemplateFiles(options),
        },
        {
            title: 'Inicializando Git',
            task: () => initGit(options),
            enabled: () => options.git,
        }, {
            title: 'Instalando dependências do projeto',
            task: () => projectInstall({
                cwd: options.targetDirectory,
            }),
            skip: () => !options.runInstall ? 'Digite --install para automaticamente instalar suas dependências' : undefined,
        }
    ])

    await tasks.run();

    return true; 
}