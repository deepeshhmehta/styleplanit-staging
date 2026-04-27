/**
 * subscribe.js - Mailchimp subscription and animations
 */
const SubscribeFeature = {
  init: function (config) {
    const container = $("#subscribe-container");
    const form = $("#mc-embedded-subscribe-form, .subscribe-form");
    const success = $("#subscribe-success");

    if (form.length === 0) return;

    // 1. Mailchimp validation configuration
    window.fnames = new Array();
    window.ftypes = new Array();
    fnames[0] = "EMAIL"; ftypes[0] = "email";
    fnames[1] = "FNAME"; ftypes[1] = "text";
    fnames[2] = "LNAME"; ftypes[2] = "text";
    fnames[4] = "PHONE"; ftypes[4] = "phone";
    fnames[5] = "BIRTHDAY"; ftypes[5] = "birthday";

    // 2. Setup Birthday Dropdowns
    this.setupBirthdayDropdowns();

    // 3. Defer loading validation script
    if (!$('script[src*="mc-validate.js"]').length) {
      $(document).on('appReady', function() {
        const script = document.createElement("script");
        script.src = "//s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js";
        script.type = "text/javascript";
        script.async = true;
        document.body.appendChild(script);
      });
    }

    // 3. Handle submission
    form.off("submit").on("submit", function (e) {
      // Guard: Ensure action has been populated
      if (form.attr('action') === '#' || form.attr('action') === '') {
          console.warn("[Subscribe] Form action not yet ready.");
          e.preventDefault();
          return false;
      }

      if (!$("#legal-checkbox").is(":checked")) {
        e.preventDefault();
        e.stopPropagation();
        alert("Please agree to the terms and conditions to subscribe.");
        return false;
      }

      Analytics.trackConversion('newsletter_signup', 'footer', 1);

      setTimeout(() => {
        container.fadeOut(600, function() {
          success.fadeIn(600);
          setTimeout(() => {
            success.fadeOut(600, function() {
              form[0].reset();
              container.fadeIn(600);
            });
          }, 20000);
        });
      }, 500);
    });
  },

  setupBirthdayDropdowns: function() {
    const monthSelect = $("#birthday-month");
    const daySelect = $("#birthday-day");
    const hiddenInput = $("#mce-BIRTHDAY");

    const daysInMonth = {
      "01": 31, "02": 29, "03": 31, "04": 30, "05": 31, "06": 30,
      "07": 31, "08": 31, "09": 30, "10": 31, "11": 30, "12": 31
    };

    function updateHiddenInput() {
      const m = monthSelect.val();
      const d = daySelect.val();
      if (m && d) {
        hiddenInput.val(`${m}/${d}`);
      }
    }

    monthSelect.on("change", function() {
      const month = $(this).val();
      const numDays = daysInMonth[month];
      
      daySelect.empty().append('<option value="" disabled selected>Birth Day</option>');
      for (let i = 1; i <= numDays; i++) {
        const val = i < 10 ? `0${i}` : i;
        daySelect.append(`<option value="${val}">${i}</option>`);
      }
      updateHiddenInput();
    });

    daySelect.on("change", updateHiddenInput);
  }
};
