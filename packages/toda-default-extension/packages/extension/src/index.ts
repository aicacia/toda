import { extension } from '@toda/extension';

extension(async (context) => {
  console.debug(`${context.config.packageJSON.name}@${context.config.packageJSON.version} activated`);

  context.subscriptions.push(() => {
    console.debug(`${context.config.packageJSON.name}@${context.config.packageJSON.version} deactivated`);
  });
});