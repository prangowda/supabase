const fs = require('fs/promises');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const { parseArgs } = require('node:util');
const assert = require('assert');

const args = parseArgs({
  options: {
    secretName: { type: 'string', short: 'n', required: true },
  },
});

const secretName = args.values.secretName;
assert(secretName, 'secretName is required');

const region = 'ap-southeast-2';

const getSecrets = async (name, region) => {
  try {
    const secretsmanager = new SecretsManagerClient({ region });
    const command = new GetSecretValueCommand({ SecretId: name });
    const data = await secretsmanager.send(command);

    if (!data.SecretString) {
      throw new Error('Secrets not found');
    }
    return JSON.parse(data.SecretString);
  } catch (err) {
    console.error('Error getting secrets:', err);
    process.exit(1);
  }
};

const writeSecretsToFile = async (secrets) => {
  try {
    const secretContent = Object.entries(secrets)
      .map(([key, value]) => `${key}="${value.replace(/"/g, '\\"')}"`)
      .join('\n');
    
    await fs.writeFile('.env.local', secretContent.trim(), { mode: 0o600 });
    console.log('.env.local file successfully written with secure permissions.');
  } catch (err) {
    console.error('Error writing secrets to file:', err);
    process.exit(1);
  }
};

getSecrets(secretName, region).then(writeSecretsToFile);
