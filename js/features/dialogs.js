/**
 * dialogs.js - Dynamic popup notification system
 */
const DialogsFeature = {
  init: async function () {
    const masterData = await Data.loadMasterData();
    const dialogs = masterData.dialogs || [];
    
    if (dialogs.length === 0) return;

    dialogs.forEach((config, index) => {
        this.scheduleDialog(config, index);
    });
  },

  scheduleDialog: function (config, index) {
    const waitTime = (parseInt(config.timeInSeconds) || 5) * 1000;
    
    // Check if user has already dismissed this specific dialog
    const storageKey = `dismissed_dialog_${btoa(config.title).substring(0, 10)}`;
    if (sessionStorage.getItem(storageKey)) return;

    setTimeout(() => {
        this.renderDialog(config, storageKey, index);
    }, waitTime);
  },

  renderDialog: function (config, storageKey, index) {
    const dialogId = `dialog-${index}`;
    // If a dialog with this ID already exists, don't re-render
    if ($(`#${dialogId}`).length > 0) return;

    const dialogHtml = `
        <div class="luxury-dialog" id="${dialogId}">
            <button class="dialog-close" aria-label="Close">&times;</button>
            <div class="dialog-content">
                <span class="section-subtitle" style="font-size: 0.6rem; letter-spacing: 2px;">Style Plan(it) Alert</span>
                <h3>${config.title}</h3>
                <p>${config.description}</p>
                <a href="${config.action}" target="_blank" rel="noopener noreferrer" class="btn btn-primary-accent" style="width: 100%; text-align: center; margin-top: 10px;">${config.cta}</a>
            </div>
        </div>
    `;

    $('body').append(dialogHtml);

    // Adjust vertical position based on index to allow multiple stacking
    const bottomOffset = 30 + (index * 20); // Slight stagger effect
    const leftOffset = 30 + (index * 20);
    $(`#${dialogId}`).css({
        'bottom': `${bottomOffset}px`,
        'left': `${leftOffset}px`,
        'z-index': 2000 + index
    });

    // Animate in
    setTimeout(() => {
        $(`#${dialogId}`).addClass('visible');
    }, 100);

    // Bind Close Event
    $(`#${dialogId} .dialog-close`).on('click', () => {
        this.dismissDialog(dialogId, storageKey);
    });
  },

  dismissDialog: function (dialogId, storageKey) {
    const dialog = $(`#${dialogId}`);
    dialog.removeClass('visible');
    sessionStorage.setItem(storageKey, 'true');
    
    setTimeout(() => {
        dialog.remove();
    }, 600);
  }
};
