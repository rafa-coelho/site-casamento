require('dotenv').config();
global.PROD = process.env.NODE_ENV == 'prod';
const fs = require('fs');
const path = require('path');
const database = require('.');

const migrationsDir = path.join(__dirname, 'migrations');

const createDB = async () => {
    if(PROD){
        const conn = {
            host: process.env.DB_HOST ? process.env.DB_HOST : "127.0.0.1",
            user: process.env.DB_USER ? process.env.DB_USER : "root",
            password: process.env.DB_PASS ? process.env.DB_PASS : "",
            charset: 'utf8'
        };
    
        try{
            const knex = require('knex')({ client: 'mysql', connection: conn });
            await knex.raw(`CREATE DATABASE ${process.env.DB_BASE ? process.env.DB_BASE : "raml"}`).then(() => { }).catch(e => {});
        }catch(e){
            console.log(e);
        }
    }
    return true;
};

const migrate = async () => {
    await createDB();
    
    const migrations = fs.readdirSync(migrationsDir);

    for (const file of migrations) {
        const migration = require(`${migrationsDir}/${file}`);
        let error = false;
        try{
            await migration.up(database, PROD);
        }catch(E){
            error = true;
            console.log(E);
        }
        if(!error){
            console.log(`Runned ${file} successfully!`);
        }
    }

    console.log('Database generated successfully');
    console.log();
    console.log();
    await seed();
    process.exit();
}

const seed = async () => {
    const seedsDir = path.join(__dirname, 'seeds');
    try{
        const seeds = fs.readdirSync(seedsDir);
    
        for (const file of seeds) {
            const seed = require(`${seedsDir}/${file}`);
            let error = false;
            try {
                const exists = (await database(seed.table).whereIn('id', seed.values.map(x => x.id))).length > 0;
                if(!exists){
                    await database(seed.table).insert(seed.values)
                }
                
            } catch (E) {
                error = true;
                console.log(E);
            }
            if (!error) {
                console.log(`Runned ${file} successfully!`);
            }
        }
    }catch(e){
        // console.log(e)
    }

    console.log('Done!');
};

migrate();