const NavLinks = {
    getLinks() {
        const anchors = [];
        document.querySelectorAll("nav, menu").forEach(function(container) {
            container.querySelectorAll('a').forEach(function(anchor){
                anchors.push({title: anchor.innerText.trim(), url: anchor.href});
            });
        });

        return anchors;
    },

    async domReady() {
        if (document.readyState !== "loading") return Promise.resolve();
        return new Promise((res) => document.addEventListener("DOMContentLoaded", res, { once: true }));
    },

    waitForMenus(timeoutMs = 300) {
        // Resolve as soon as any <nav> or <menu> appears or timeout hits.
        return new Promise((res) => {
            const haveMenus = () => document.querySelector("nav, menu") != null;
            if (haveMenus()) return res();

            const obs = new MutationObserver(() => {
                if (haveMenus()) {
                    obs.disconnect();
                    res();
                }
            });
            obs.observe(document.documentElement, { childList: true, subtree: true });
            setTimeout(() => {
                obs.disconnect();
                res(); // timeout: just try collecting whatever exists
            }, timeoutMs);
        });
    },

    async getLinksStabilized() {
        await this.domReady();
        await new Promise((r) => requestAnimationFrame(r));

        let links = this.getLinks();
        if (links.length) return links;

        // Menus not in DOM yet? wait briefly for SPA to render
        await this.waitForMenus(300);
        links = this.getLinks();

        return links;
    }
};


chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.handler === "getNavLinks") {
        (async () => {
            try {
                const links = await NavLinks.getLinksStabilized();
                sendResponse({ ok: true, links: links });
            } catch (e) {
                sendResponse({ ok: false, error: String(e) });
            }
        })();
        return true;
    }
});
