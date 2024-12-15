import * as fs from 'fs';

export async function readFile(path: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err || !data) {
        // eslint-disable-next-line no-console
        console.error("Couldn't read file:" + path);
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

export async function writeFile(path: string, contents: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(path, contents, 'utf8', err => {
      if (err) {
        // eslint-disable-next-line no-console
        console.error("Couldn't write file:" + path);
        reject(err);
        return;
      }
      resolve();
    });
  });
}

export async function copyFile(path1: string, path2: string): Promise<void> {
  const fileContents = await readFile(path1);
  await writeFile(path2, fileContents);
}

export function dirExists(path: string): boolean {
  return fs.existsSync(path);
}
