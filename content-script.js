class Sampled {
    constructor() {
        this.mutationObs();
    }

    mutationObs() {
        const target = document.body;
        const config = {childList: true};
        const observer = new MutationObserver((mutations) => {
            /* Check if the 'main' div was added to the DOM */
            mutations.map((mutation) => {
                const nodelist = mutation.previousSibling;

                if (nodelist && nodelist.id && nodelist.id == 'main') {
                    return this.insertButton();
                }
            });
        });

        observer.observe(target, config);
    }

    insertButton() {
        if (document.querySelector('#sampled-track')) {
            return;
        } else {
            const sampled = document.createElement('div');
            sampled.id = 'sampled-track';

            /* Insert the button to the player */
            const extra = document.querySelector('.ExtraControls');
            extra.prepend(sampled);

            /* Add an icon to the button */
            const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            icon.setAttributeNS(null, 'viewBox', '0 0 24 24');
            icon.setAttributeNS(null, 'fill', '#b3b3b3');
            icon.setAttributeNS(null, 'width', '18px');
            icon.setAttributeNS(null, 'height', '18px');

            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttributeNS(null, 'd', 'M0 0h24v24H0z');
            path1.setAttributeNS(null, 'fill', 'none');
            icon.append(path1);

            const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path2.setAttributeNS(
                null,
                'd',
                'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z'
            );
            icon.append(path2);

            sampled.append(icon);
            sampled.addEventListener('click', this.getSample);
        }
    }

    getSample() {
        const artist = document.querySelector('.b6d18e875efadd20e8d037931d535319-scss a').textContent;
        const trackname = document.querySelector('a[data-testid=nowplaying-track-link]').textContent;

        const track = artist.concat(' ', trackname);
        chrome.runtime.sendMessage({getSample: track}, (response) => {
            console.log(response);
        });
    }
}

s = new Sampled();
