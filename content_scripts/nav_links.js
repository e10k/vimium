const NavLinks = {
    readLinks() {
        let links = [];
        document.querySelectorAll("nav, menu").forEach(function(container) {
            container.querySelectorAll('a').forEach(function(link){
                let title = link.innerText.trim();
                let url = link.href;

                if (! title.length && ! url.length) {
                    return;
                }

                links.push({
                    title: title,
                    url: url
                });
            });
        });

        return links;
    },

    async getLinks() {
        await DomUtils.documentReady();
        await new Promise((r) => requestAnimationFrame(r));

        let links = this.readLinks();

        if (links.length) {
            console.log('first attempt', links);
            return links;
        }

        await this.waitForMenus(300);
        console.log('wait...');
        links = this.readLinks();

        console.log('second attempt', links);

        return links;
    },

    waitForMenus(timeoutMs = 300) {
        return new Promise((res) => {
            setTimeout(() => {
                res();
            }, timeoutMs);
        });
    },
};

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.handler === "getNavLinks") {
        (async () => {
            try {
                const links = await NavLinks.getLinks();
                sendResponse({ ok: true, links: links });
            } catch (e) {
                sendResponse({ ok: false, error: String(e) });
            }
        })();

        return true;
    }
});
