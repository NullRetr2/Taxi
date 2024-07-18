function showTaxiAlert(message) {
  const alertHtml = `
      <div id="taxi-alert" class="alert alert-warning alert-dismissible fade show position-absolute" role="alert" style="top: 50%; left: 50%; transform: translate(-50%, -50%);">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;

  $("body").append(alertHtml);

  setTimeout(() => {
    $("#taxi-alert").alert("close");
  }, 5000);
}

function showTaxiAlertError(message) {
  const alertHtml = `
      <div id="taxi-alert" class="alert alert-danger fade show position-absolute" role="alert" style="top: 50%; left: 50%; transform: translate(-50%, -50%);">
        ${message}
      </div>
    `;

  $("body").append(alertHtml);

  setTimeout(() => {
    $("#taxi-alert").remove();
  }, 5000);
}

export { showTaxiAlert, showTaxiAlertError };
