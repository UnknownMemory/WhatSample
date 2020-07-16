const mutationObs = () => {
    const target = document.body;
    const config = {childList: true};
    const observer = new MutationObserver(mainTarget);

    observer.observe(target, config);
};

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
        const extra = document.querySelector('.ExtraControls');
        extra.append(sampled);
    }
};

mutationObs();
