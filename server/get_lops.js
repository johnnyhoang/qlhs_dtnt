require('dotenv').config();
const { AppDataSource } = require('./src/data-source');
const { HocSinh } = require('./src/entities/HocSinh');

AppDataSource.initialize().then(async () => {
    const hocSinhRepo = AppDataSource.getRepository(HocSinh);
    const count = await hocSinhRepo.count();
    console.log('TOTAL_STUDENTS:', count);
    
    const lops = await hocSinhRepo.createQueryBuilder()
        .select('DISTINCT lop', 'lop')
        .getRawMany();
    
    console.log('UNIQUE_LOPS:', JSON.stringify(lops));
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
