const mutationObs = () => {
    const target = document.body;
    const config = {childList: true};
    const observer = new MutationObserver(mainTarget);

    observer.observe(target, config);
};

/* Check if the 'main' div was added to the DOM */
const mainTarget = (mutations, observer) => {
    mutations.map((mutation) => {
        const nodelist = mutation.previousSibling;
        if (nodelist && nodelist.id && nodelist.id == 'main') {
            implementButton();
        }
    });
};

const implementButton = () => {
    if (document.querySelector('#sampled-track')) {
        return;
    } else {
        const sampled = document.createElement('div');
        sampled.id = 'sampled-track';

        /* Add the button to the player */
        const extra = document.querySelector('.ExtraControls');
        extra.prepend(sampled);

        /* Add an icon to the button */
        const icon = document.createElement('img');
        icon.src = chrome.runtime.getURL('icons/album-18dp.svg');

        sampled.append(icon);
    }
};

mutationObs();
