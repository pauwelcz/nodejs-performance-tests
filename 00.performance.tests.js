'use strict';
require('dotenv').config()
const fs = require('fs')
require('events').EventEmitter.defaultMaxListeners = 1000;
const mkdirp = require('mkdirp')

const program = require('commander')
program
  .option('-i, --iterations <number>', 'iteration artuments', 1000)
  .option('-o, --output <value>', 'iteration artuments', `./output`)
  .option('-n, --name <value>', 'name of csv', `results_nodejs_single`)
  .parse(process.argv)
/**
 * Postgres
 */
const pgformat = require('pg-format')
const promise = require('bluebird')
const pg = require('pg')
const pgp = require('pg-promise')({
	promiseLib: promise,
	query (e) {

	},
});

const connectionString = process.env.DATABASE;

const pgdbTest = new pg.Client(connectionString);

pgdbTest.connect();
/**
 * DATA
 */
const five_hundred = fs.readFileSync(`./data/five_hundred.txt`, 'utf8')
const three_hundred_thousand = fs.readFileSync(`./data/three_hundred_thousand.txt`, 'utf8')
const postgresql_logo = fs.readFileSync(`./data/postgresql-logo.png`)

const DEFAULT_MESAGE = "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
const INSERT_TEXT_MESSAGE_ID = `INSERT INTO text (id, value) VALUES ($1, $2) RETURNING id;`
const INSERT_TEXT_MESSAGE = `INSERT INTO text (value) VALUES ($2) RETURNING id;`
const INSERT_BIN_MESSAGE = `INSERT INTO bin (id, value) VALUES ($1, $2);`
const UPDATE_TEXT = `UPDATE text SET value = 'changed';`
const DELETE_TEXT = `DELETE FROM text WHERE id = $1;`
/**
 * Functions
 */

 /**
  * Delete all tables
  * @param {*} pgdbTest 
  */
async function deleteTables(pgdbTest) {
    console.log(`Cleaning database`);
    await pgdbTest.query(`
        DELETE FROM text;
        DELETE FROM bin;
    `)
    console.log(`Cleaning database -- SUCCESS`)
}

async function insertText(pgdbTest, id, number, message) {
    const startTime = new Date()
    try {
        for (let i = 0; i < number; i++) {
            let value 
            await pgdbTest.query(INSERT_TEXT_MESSAGE_ID, [id, message])
            await pgdbTest.on('notification', async (data) => {
                switch (data.channel) {
                    case 'q_event': 
                        value = data
                        break;
                    case 'q_event_bin':
                        value = data
                        break;
                    default:
                        break;
                }
            })
            
            // process.exit()
            id++
        }
        
    } catch (e)
    {
        console.log(e)
        process.exit()
    }
    const endTime = new Date()
    return {
        time: (endTime - startTime)/(number*1000),
        value: null,
        id: id,
    }
}

async function insertTextAndImage(pgdbTest, id, number, message, image) {
    const startTime = new Date()
    try {
        for (let i = 0; i < number; i++) {
            let value 
            await pgdbTest.query(INSERT_TEXT_MESSAGE_ID, [id, message])
            await pgdbTest.on('notification', async (data) => {
                switch (data.channel) {
                    case 'q_event': 
                        value = data
                        break;
                    case 'q_event_bin':
                        value = data
                        break;
                    default:
                        break;
                }
            })
            await pgdbTest.query(INSERT_BIN_MESSAGE, [id, image])
            await pgdbTest.on('notification', async (data) => {
                switch (data.channel) {
                    case 'q_event': 
                        value = data
                        break;
                    case 'q_event_bin':
                        value = data
                        break;
                    default:
                        break;
                }
            })
            
            // process.exit()
            id++
        }
        
    } catch (e)
    {
        console.log(e)
        process.exit()
    }
    const endTime = new Date()
    return {
        time: (endTime - startTime)/(number*1000),
        value: null,
        id: id,
    }
}

async function insertTextAndImageAndDelete(pgdbTest, id, number, message, image) {
    const startTime = new Date()
    try {
        for (let i = 0; i < number; i++) {
            let value 
            pgdbTest.query(INSERT_TEXT_MESSAGE_ID, [id, message])
            pgdbTest.on('notification', async (data) => {
                switch (data.channel) {
                    case 'q_event': 
                        value = data
                        break;
                    case 'q_event_bin':
                        value = data
                        break;
                    default:
                        break;
                }
            })
            await pgdbTest.query(INSERT_BIN_MESSAGE, [id, image])
            await pgdbTest.on('notification', async (data) => {
                switch (data.channel) {
                    case 'q_event': 
                        value = data
                        break;
                    case 'q_event_bin':
                        value = data
                        break;
                    default:
                        break;
                }
            })
            await pgdbTest.query(DELETE_TEXT, [id])
            await pgdbTest.on('notification', async (data) => {
                switch (data.channel) {
                    case 'q_event': 
                        value = data
                        break;
                    case 'q_event_bin':
                        value = data
                        break;
                    default:
                        break;
                }
            })
            // process.exit()
            id++
        }
        
    } catch (e)
    {
        console.log(e)
        process.exit()
    }
    const endTime = new Date()
    return {
        time: (endTime - startTime)/(number*1000),
        value: null,
        id: id,
    }
}

(async function () { 
    const output = program.output
    const outputFile = program.name
    const saveDir = `${output}/${outputFile}.csv`

    mkdirp.sync(output)
    // process.exit()
    if (await fs.existsSync(saveDir)) {
        console.log(`Removing older results`)
        await fs.unlinkSync(saveDir)
    }

    await fs.appendFileSync(saveDir, `"Benchmark","Mode","Threads","Score","Unit","Param: noProcesses","Param: numInserts"\n`)
    let id = 0
    let number = parseInt(program.iterations, 10)
    console.log(`Starting listening,...`)
    await pgdbTest.query('LISTEN q_event')
    await pgdbTest.query('LISTEN q_event_bin')
    await deleteTables(pgdbTest)
    console.log(`Starting performance tests,...`)
    // insertNaive performance test
    console.log(`\tinsertNaive performance test`)
    const insertNaiveObject = await insertText(pgdbTest, id, number, DEFAULT_MESAGE)
    id = insertNaiveObject.id
    await fs.appendFileSync(saveDir, `"insertNaive","avgt","1","${insertNaiveObject.time}","s/op","0","0"\n`)
    console.log(`\tinsertNaive performance test -- SUCCESS`)
    process.removeAllListeners();

    // insertHundredsOfChars performance test
    console.log(`\tinsertHundredsOfChars performance test`)
    const insertHundredsOfCharsObject = await insertText(pgdbTest, id, number, five_hundred)
    id = insertHundredsOfCharsObject.id
    console.log(`\tinsertHundredsOfChars performance test -- SUCCESS`)
    await fs.appendFileSync(saveDir, `"insertHundredsOfChars","avgt","1","${insertHundredsOfCharsObject.time}","s/op","0","0"\n`)
    process.removeAllListeners();

    // insertHundredsOfChars performance test
    console.log(`\tinsertHundredsOfThousandsOfChars performance test`)
    const insertHundredsOfThousandsOfCharsObject = await insertText(pgdbTest, id, number, three_hundred_thousand)
    id = insertHundredsOfThousandsOfCharsObject.id
    console.log(`\tinsertHundredsOfThousandsOfChars performance test -- SUCCESS`)
    await fs.appendFileSync(saveDir, `"insertHundredsOfThousandsOfChars","avgt","1","${insertHundredsOfThousandsOfCharsObject.time}","s/op","0","0"\n`)
    process.removeAllListeners();


    // tinsertTextAndImage performance test
    console.log(`\tinsertTextAndImage performance test`)
    const insertTextAndImageObject = await insertTextAndImage(pgdbTest, id, number, DEFAULT_MESAGE, postgresql_logo)
    id = insertTextAndImageObject.id
    console.log(`\tinsertTextAndImage performance test -- SUCCESS`)
    await fs.appendFileSync(saveDir, `"insertTextAndImageAndDelete","avgt","1","${insertTextAndImageObject.time}","s/op","0","0"\n`)
    process.removeAllListeners();

    // insertNaive performance test
    console.log(`\tinsertTextAndImageAndDelete performance test`)
    const insertTextAndImageAndDeleteObject = await insertTextAndImageAndDelete(pgdbTest, id, number, DEFAULT_MESAGE, postgresql_logo)
    id = insertTextAndImageAndDeleteObject.id
    console.log(`\tinsertTextAndImageAndDelete performance test -- SUCCESS`)
    await fs.appendFileSync(saveDir, `"insertTextAndImageAndDelete","avgt","1","${insertTextAndImageAndDeleteObject.time}","s/op","0","0"\n`)
    console.log(`The end`)
    process.exit()
    
    process.removeAllListeners();
})();