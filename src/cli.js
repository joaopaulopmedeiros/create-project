import arg from "arg";
import inquirer from "inquirer";

function parseArgsIntoOptions(cliArgs) {
  const args = arg(
    {
      "--git": Boolean,
      "--yes": Boolean,
      "--install": Boolean,
      "-g": "--git",
      "-y": "--yes",
      "-i": "--install",
    },
    {
      argv: cliArgs.slice(2),
    }
  );
  return {
    skipPrompts: args["--yes"] || false,
    git: args["--git"] || false,
    template: args._[0],
    runInstall: args["install"] || false,
  };
}

async function promptForMissingOptions(options) {
  const defaultTemplate = "Javascript";

  if (options.skipPrompts) {
    return {
      ...options,
      template: options.template || defaultTemplate,
    };
  }

  const questions = [];

  if (!options.template) {
    questions.push({
      type: "list",
      name: "template",
      message: "Você não informou o template para uso neste projeto.",
      choices: ["Javascript", "Typescript"],
    });
  }

  if (!options.git) {
    questions.push({
      type: "confirm",
      name: "git",
      message: "Você não informou se haverá necessidade de uso de git neste projeto.",
      default: false,
    });
  }

  const answers = await inquirer.prompt(questions);

  return {
      ...options,
      template: options.template || answers.template,
      git: options.git || answers.git,
  };
}

export async function cli(args) {
  let options = parseArgsIntoOptions(args);
  options = await promptForMissingOptions(options);
  console.log(options);
}
