// Run with: ego-browser nodejs -e "await import('file:///C:/ai_dev/apps/discussion/scripts/export-brand.mjs')"
const fs = await import('node:fs/promises');
const root = 'C:/ai_dev/apps/discussion';
const task = await taskSpace('discussion-brand-20261028');
const page = task.page('p1');
await page.goto('http://localhost:4173/workroom.html?view=both#personal');
console.log({ spaceId: task.spaceId });
const exports = [
  ['knoltalk-mark.svg', 'knoltalk-mark.png', 1024, 1024],
  ['knoltalk-logo.svg', 'knoltalk-logo.png', 1524, 600],
  ['knoltalk-mark.svg', 'knoltalk-touch.png', 180, 180],
  ['knoltalk-mark.svg', 'knoltalk-favicon.png', 32, 32],
];
for (const [source, target, width, height] of exports) {
  const data = await page.evaluate(async ({source, width, height}) => {
    const image = new Image();
    image.src = 'assets/brand/' + source;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    canvas.getContext('2d').drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/png').split(',')[1];
  }, {source, width, height});
  await fs.writeFile(`${root}/assets/brand/${target}`, Buffer.from(data, 'base64'));
  console.log({target, width, height});
}
console.log(await page.snapshot());
