import path from 'path';
import fse from 'fs-extra';
import * as Yup from 'yup';

export interface GlobalOptions {
  importFrom?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ZensqlConfig {
  sqlFolder: string;
  generatedFile: string;
}

const ZensqlConfigSchema = Yup.object().shape<ZensqlConfig>({
  sqlFolder: Yup.string().required(),
  generatedFile: Yup.string().required(),
});

export const Config = {
  read: readConfig,
  resolveSqlFolders,
};

interface SqlFolders {
  tables: string;
  queries: string;
}

function resolveSqlFolders(sqlFolder: string): SqlFolders {
  return {
    tables: path.resolve(sqlFolder, 'tables'),
    queries: path.resolve(sqlFolder, 'queries'),
  };
}

async function readConfig(projectPath: string): Promise<ZensqlConfig> {
  const pkgPath = path.resolve(projectPath, 'package.json');
  if (fse.existsSync(pkgPath) === false) {
    throw new Error(`Cannot finc package.json`);
  }
  const pkg = await fse.readJSON(pkgPath);
  if (pkg.zensql === undefined) {
    throw new Error(`Cannot find "zensql" config in package.json`);
  }
  const config = await ZensqlConfigSchema.validate(pkg.zensql);
  return {
    generatedFile: path.resolve(projectPath, config.generatedFile),
    sqlFolder: path.resolve(projectPath, config.sqlFolder),
  };
}
