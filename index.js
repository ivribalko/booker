import { Page, launch } from 'puppeteer';
import { sendFailure, sendSuccess } from './bot.js';
import { DAYS } from './days.js';
import { URL, LOGIN, PASSWORD, CLASSES } from './secret.js';
import * as cron from 'node-cron';

CLASSES.forEach(data =>
{
    cron.schedule(getCronSchedule(data),
        () =>
        {
            auth_and_book(data);
        },
        {
            timezone: "America/New_York"
        });
});

/**
 * @return String 
 */
function getCronSchedule(data)
{
    let time = data.time.substring(0, 7);
    let hour = Number(time.substring(0, 1));
    if (time.includes('pm'))
    {
        hour += 12;
    }
    let minute = Number(time.substring(2, 4));
    // both cron and DAYS are 0 based starting Sunday
    // -2 is two days before; +7 to avoid negative 
    let day = (data.day - 2 + 7) % 7;
    // + 1 minute to get into 48 hours window
    return `${minute + 1} ${hour} * * ${day}`;
}

async function auth_and_book(classes)
{
    try
    {
        let browser = await launch({
            headless: true,
            executablePath: '/usr/bin/chromium',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        let page = await browser.newPage();

        try
        {
            await page.goto(URL, { waitUntil: 'networkidle2' });
            await auth(page);
            await wait();
            await book(page, classes);
            await sendSuccess(`${classes.type} at ${classes.time} on ${DAYS[classes.day]} booked!`);
        }
        finally
        {
            await browser.close();
        }
    }
    catch (e)
    {
        await sendFailure(`${e}`);
    }
}

/**
 * @param {Page} page
 */
async function auth(page)
{
    await page.type('#t_user', LOGIN);
    await page.type('#t_pwd', PASSWORD);
    await page.click('#b_logon');
}

async function wait()
{
    // page.waitForNetworkIdle always times out inside docker
    await new Promise(resolve => setTimeout(resolve, 30000));
}

/**
 * @param {Page} page
 */
async function book(page, classData)
{
    // get handle for div container with classes for the day after tomorrow
    let daySchedule = await page.$('#classFinderGrid > :nth-child(6)');
    // get handles for all classes table rows from that container div
    let classHandles = await daySchedule.$$('.ant-table-row-level-0');
    // get all text contents of those classes rows
    let texts = await Promise.all(classHandles.map(i => i.evaluate(i => i.textContent)));
    // find the class index
    let index = texts.findIndex(i =>
        i.includes(classData.time) &&
        i.includes(classData.type));

    if (index < 0)
    {
        throw new Error("your gym class not found on page");
    }

    let button1 = await classHandles[index].$('button');
    if (button1 == null)
    {
        throw new Error("can't find class book button, maybe already booked");
    }

    await button1.click();
    await wait();

    let button2 = await page.$('div.classDialog__messageArea > button');
    if (button2 == null)
    {
        throw new Error("can't find dialog book button");
    }

    if (await button2.evaluate(i => i.disabled))
    {
        throw new Error("dialog book button is disabled, maybe booking too early");
    }

    await button2.click();
    await wait();
}
