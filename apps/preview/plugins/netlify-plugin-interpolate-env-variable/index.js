function log(message) {
  console.log(`[netlify interp-env] ${message}`);
}

export async function onPreBuild({ inputs, utils }) {
  if (inputs.variable && process.env[inputs.variable]) {
    log(`Interpolating environment variable ${inputs.variable}`);
    const envVariable = process.env[inputs.variable];
    const { stdout: interpolated } = await utils.run("echo", [envVariable], {
      env: process.env,
      shell: true,
      stdout: "pipe",
    });
    process.env[inputs.variable] = interpolated;
    log(`Environmental variable ${inputs.variable} has been updated`);
  } else {
    utils.build.failBuild(
      "Input variable is not defined or does not exist in the environment variables.",
    );
  }
}
