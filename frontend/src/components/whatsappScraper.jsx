import puppeteer from 'puppeteer';

export async function scrapeWhatsApp() {
    const browser = await puppeteer.launch({
        headless: false,  // Show the browser UI to allow QR scanning
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://web.whatsapp.com/');

    console.log('Please scan the QR code on WhatsApp Web...');
    await page.waitForSelector('canvas[aria-label="Scan me!"]');
    await page.waitForTimeout(300000);  // Wait for 10 seconds to scan

    // Wait for the chat list to load after scanning the QR code
    console.log('Logged in successfully!');
    await page.waitForSelector('div._3Dr46', { visible: true, timeout: 300000 });  // Chat list selector
    console.log('Chat list loaded.');

    // Get all the chat names (the names of contacts or groups)
    const chats = await page.$$eval('div._3Dr46', chatElements => {
        return chatElements.map(chat => chat.innerText);
    });

    console.log('Scraped Chats:', chats);

    // Define the name of the chat you want to target (e.g., "John Doe" or "Family Group")
    const targetChatName = 'emmanuel';  // Replace with the desired chat name

    // Find the chat index for the target chat
    const chatIndex = chats.findIndex(chat => chat.includes(targetChatName));

    if (chatIndex !== -1) {
        // If the chat is found, click on it
        const chat = await page.$x(`//span[contains(text(), '${chats[chatIndex]}')]`);
        if (chat.length > 0) {
            await chat[0].click();  // Click to open the chat
        }

        // Wait for the messages to load
        await page.waitForSelector('span.selectable-text');  // Message element selector

        // Extract the last 10 messages from the selected chat
        const messages = await page.evaluate(() => {
            const messageElements = document.querySelectorAll('span.selectable-text');
            const messageTexts = [];
            messageElements.forEach(element => {
                messageTexts.push(element.innerText);
            });
            return messageTexts.slice(-10);  // Get the last 10 messages
        });

        console.log(`Last 10 messages from ${targetChatName}:`, messages);
        await browser.close();
        return messages;
    } else {
        console.log(`Chat with name "${targetChatName}" not found.`);
        await browser.close();
        return [];
    }
}

