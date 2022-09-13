import * as fs from 'fs';
import * as sharp from 'sharp';

export const resizeImage = (path, size) => {
  const readStream = fs.createReadStream(path);
  const transform = sharp().resize(size, size);

  return readStream.pipe(transform);
};
