import puppeteer from 'puppeteer';

export async function scrapeWhatsApp(page, contacts = []) {
  const allMessages = [];

  for (const chatName of contacts) {
    try {
      console.log(`Searching for chat: ${chatName}`);

      // Scroll into view and click the chat
      await page.evaluate((name) => {
        const chatSpans = Array.from(document.querySelectorAll('span[title]'));
        const target = chatSpans.find(span => span.getAttribute('title') === name);
        if (target) {
          target.scrollIntoView();
          target.click();
        } else {
          throw new Error(`Chat "${name}" not found`);
        }
      }, chatName);

      // Wait for messages to load
      await page.waitForSelector('div[data-pre-plain-text]', { timeout: 10000 });

      // Extract the last 10 messages with actual timestamps
      const messages = await page.evaluate((contactName) => {
        const messageNodes = Array.from(document.querySelectorAll('div[data-pre-plain-text]'));

        return messageNodes.slice(-10).map(el => {
          const meta = el.getAttribute('data-pre-plain-text');
          const textSpan = el.querySelector('span.selectable-text');
          const messageText = textSpan?.innerText?.trim() || '';

          let timestamp = new Date().toISOString(); // fallback

          // Match WhatsApp's format: [10:38 pm, 24/07/2025]
          const match = meta?.match(/\[(\d{1,2}:\d{2} (?:am|pm)), (\d{1,2}\/\d{1,2}\/\d{4})\]/i);
          if (match) {
            const [, timeStr, dateStr] = match;
            const combinedStr = `${dateStr} ${timeStr}`;
            const parsed = new Date(combinedStr);
            if (!isNaN(parsed)) {
              timestamp = parsed.toISOString();
            }
          }

          return {
            contact: contactName,
            text: messageText,
            timestamp,
            meta // optional: for debugging
          };
        });
      }, chatName);

      console.log(`✅ Scraped ${messages.length} messages from "${chatName}"`);
      allMessages.push(...messages);
    } catch (err) {
      console.error(`❌ Failed for "${chatName}":`, err.message);
      allMessages.push({
        contact: chatName,
        text: `Error: ${err.message}`,
        timestamp: new Date().toISOString(),
        error: true
      });
    }
  }

  return allMessages;
}
