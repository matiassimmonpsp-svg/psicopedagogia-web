const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
const id = process.argv[2] || 'cmr9s6yot0021kpkqs1u6lnpa';
p.resource.findUnique({ where: { id }, include: { course: true, area: true, subarea: true, tags: { include: { tag: true } } } }).then(r => {
  if (!r) { console.log('NOT FOUND'); return; }
  console.log(JSON.stringify({
    id: r.id,
    title: r.title,
    description: r.description ? r.description.substring(0, 100) : '(empty)',
    previewPath: r.previewPath,
    isFree: r.isFree,
    priceClp: r.priceClp,
    filePath: r.filePath,
    resourceType: r.resourceType,
    courseName: r.course?.name,
  }, null, 2));
  p.$disconnect();
});
