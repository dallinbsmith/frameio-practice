type BuildInfo = {
  version: string;
  buildTime: string;
  nodeEnv: string;
  nextVersion: string;
};

export const getBuildInfo = (): BuildInfo => {
  return {
    version: process.env['npm_package_version'] ?? '0.1.0',
    buildTime: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    nextVersion: '14.2.x',
  };
};

export const logBuildInfo = () => {
  if (process.env.NODE_ENV === 'development') {
    const info = getBuildInfo();
    console.log(
      '%c Frame.io Study Guide ',
      'background: #7c3aed; color: white; padding: 4px 8px; border-radius: 4px;',
      `\nVersion: ${info.version}`,
      `\nEnvironment: ${info.nodeEnv}`,
      `\nNext.js: ${info.nextVersion}`
    );
  }
};
