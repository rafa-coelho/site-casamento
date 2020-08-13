require('dotenv').config();
global.PROD = process.env.NODE_ENV == 'prod';
const fs = require('fs');
const path = require('path');
const knex = require('.');

const migrationsDir = path.join(__dirname, 'migrations');

const rollback = async () => {
    
    const migrations = fs.readdirSync(migrationsDir);

    for (const file of migrations) {
        const migration = require(`${migrationsDir}/${file}`);
        let error = false;
        try{
            await migration.down(knex);
        }catch(E){
            if(E.toString().indexOf('Knex only supports collate statement with mysql.') < 0){
                error = true;
                console.log(E);
            }
        }
        if(!error){
            // console.log(`Runned ${file} successfully!`);
        }
    }

    console.log('Database deleted successfully');
    process.exit();
}

rollback();