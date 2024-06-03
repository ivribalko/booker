import { Page, launch } from 'puppeteer';
import { sendFailure, sendSuccess } from './bot.js';
import { DAYS } from './days.js';
import { URL, LOGIN, PASSWORD, CLASSES } from './secret.js';

(async () =>
{
    try
    {
        let classes = getClassData();
        let browser = await launch();
        let page = await browser.newPage();

        try
        {
            await page.goto(URL, { waitUntil: 'networkidle2' });
            await auth(page);
            await wait(page);
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
})();

/**
 * @param {Page} page
 */
async function auth(page)
{
    await page.type('#t_user', LOGIN);
    await page.type('#t_pwd', PASSWORD);
    await page.click('#b_logon');
}

/**
 * @param {Page} page
 */
async function wait(page)
{
    await page.waitForNetworkIdle({ idleTime: 3000, timeout: 13000 });
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
    await wait(page);

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
    await wait(page);
}

function getClassData()
{
    let afterTomorrow = (new Date().getDay() + 2) % DAYS.length
    let classData = CLASSES.find(i => i.day == afterTomorrow);

    if (classData == null)
    {
        throw new Error("you have no classes to book for the day after tomorrow");
    }

    return classData;
}
