$(document).ready(() => {
  // global variables
  // var baseUrl = 'http://localhost:3010'
  var baseUrl = "http://growee.local";
  hideLoader();

  //functions
  function getScanResults() {
    $.ajax({
      type: "POST",
      url: `${baseUrl}/wifi`,
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        action: "scan-results"
      })
    })
      .done(data => {
        console.log("Got scan results");
        console.log(data);
        if (data.success) {
          $content = $('<div id="networks"></div>');
          for (var i = 0; i < data.count; i++) {
            if (data.items[i].authtype == 5) {
              // WPA2 Enterprise security - not supported
              continue;
            }

            //generating dynamic id
            $item = $(
              '<div id="' +
              i +
              '" class="network" onclick="return on_network_click(this);"></div>'
            );
            // check and reflect rssi
            if (data.items[i].rssi < -80) {
              $item.append(
                '<img src="./img/layer561.png" alt="wifi-signal-very-low">'
              );
            } else if (data.items[i].rssi < -70) {
              $item.append(
                '<img src="./img/layer3_copy7.png" alt="wifi-signal-low">'
              );
            } else if (data.items[i].rssi < -60) {
              $item.append(
                '<img src="./img/layer558.png" alt="wifi-signal-normal">'
              );
            } else {
              $item.append(
                '<img src="./img/layer557.png" alt="wifi-signal-good">'
              );
            }
            // AP name
            $item.append('<a href="#">' + data.items[i].ssid + "</a>");
            // check and reflect authtype
            if (data.items[i].authtype == 0) {
              // open AP
              /*$item.append(
                '<img class="wifi-signal" src="./img/layer7.png" alt="open">'
              );*/
            } else if (data.items[i].authtype == 1) {
              // WEP security
              /*$item.append(
                '<img class="wifi-signal" src="./img/layer4_copy3.png" alt="badly-protected">'
              );*/
            } else {
              // WPA/WPA2
              $item.append(
                '<img class="wifi-signal" src="./img/layer4_copy4.png" alt="protected">'
              );
            }

            $item.data("ssid", data.items[i].ssid);
            $item.data("authtype", data.items[i].authtype);
            $item.data("bssid", data.items[i].bssid);
            $content.append($item);
          }
          $("#networks").replaceWith($content);
        } else {
        }
        $("#scan-btn").removeClass("disabled");
        hideLoader();
      })
      .fail((jqXHR, textStatus, errorThrown) => {
        console.log("Get scan results failed");
        $("#scan-btn").removeClass("disabled");
        hideLoader();
      });
  }

  function scan() {
    $.ajax({
      type: "POST",
      url: `${baseUrl}/wifi`,
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        action: "scan"
      })
    })
      .done(data => {
        console.log("Scan started");
        console.log(data);
        //location.assign('./networks.html')
        $("#scan-btn").addClass("disabled");
        setTimeout(getScanResults, 5000);
      })
      .fail((jqXHR, textStatus, errorThrown) => {
        console.log("Scan failed");
        hideLoader();
      });
  }

  function login() {
    $.ajax({
      type: "POST",
      url: `${baseUrl}/auth`,
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        user: "admin",
        password: "growee"
      })
    })
      .done(data => {
        console.log("Login success");
        console.log(data);
        location.assign("./");
        hideLoader();
      })
      .fail((jqXHR, textStatus, errorThrown) => {
        console.log("Login failed");
        hideLoader();
      });
  }

  function storeLastTried() {
    $.ajax({
      type: "POST",
      url: `${baseUrl}/wifi`,
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        action: "store-last-tried"
      })
    })
      .done(data => {
        console.log(data);
        location.assign("./registration.html");
        hideLoader();
      })
      .fail((jqXHR, textStatus, errorThrown) => {
        console.log("Store last tried AP failed");
        location.assign("./");
        hideLoader();
      });
  }

  function tryStatus() {
    $.ajax({
      type: "POST",
      url: `${baseUrl}/status`,
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        status: "try-ap"
      })
    })
      .done(data => {
        console.log(data);
        if (data.status <= 0) {
	  showError("Password is incorrect");
          hideLoader();
        } else if (data.status == 6) {
          $("#loader-message").text("Connected! Storing data ...");
          setTimeout(storeLastTried, 1000);
        } else {
          switch (data.status) {
            case 1:
              $("#loader-message").text("Preparing ...");
              break;
            case 2:
              $("#loader-message").text("Scanning ...");
              break;
            case 3:
              $("#loader-message").text("Connecting ...");
              break;
            case 4:
              $("#loader-message").text("Retrieving IP ...");
              break;
            case 5:
              $("#loader-message").text("Checking Internet ...");
              break;
            default:
              break;
          }
          setTimeout(tryStatus, 1000);
        }
      })
      .fail((jqXHR, textStatus, errorThrown) => {
        setTimeout(tryStatus, 1000);
        hideLoader();
      });
  }

  function tryAccessPoint() {
    $.ajax({
      type: "POST",
      url: `${baseUrl}/wifi`,
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        action: "try-ap",
        ssid: sessionStorage.getItem("ssid"),
        pass: $("#network-password").val(),
        bssid: sessionStorage.getItem("bssid")
      })
    })
      .done(data => {
        console.log("Network success");
        console.log(data);
        //location.assign('./registration.html')
        if (data.success) {
          setTimeout(tryStatus, 1000);
          $("#loader-message").text("Preparing ...");
        } else {
          showError("Something goes wrong :(");
          hideLoader();
        }
      })
      .fail((jqXHR, textStatus, errorThrown) => {
        showError("Something goes wrong :(");
        hideLoader();
      });
  }

  function regStatus() {
    $.ajax({
      type: "POST",
      url: `${baseUrl}/status`,
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        status: "registration"
      })
    })
      .done(data => {
        console.log(data);
        if (data.status <= 0) {
          hideLoader();
        } else if (data.status == 6) {
          $("#loader-message").text("Registered!");
          setTimeout(function() {
            location.assign("./success.html");
            hideLoader();
          }, 1000);
        } else if (data.status == 5) {
          showError("Wrong registration code");
          hideLoader();
        } else if (data.status == 4) {
          showError("Already registered");
          hideLoader();
        } else {
          switch (data.status) {
            case 1:
              $("#loader-message").text("Connecting ...");
              break;
            case 2:
              $("#loader-message").text("Sending request ...");
              break;
            case 3:
              $("#loader-message").text("Receiving response ...");
              break;
            default:
              break;
          }
          setTimeout(regStatus, 1000);
        }
      })
      .fail((jqXHR, textStatus, errorThrown) => {
        showError("Something goes wrong :(");
        hideLoader();
      });
  }

  function registerDevice() {
    $("#register-btn").data("disabled", true);

    $.ajax({
      type: "POST",
      url: `${baseUrl}/registration`,
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        rc: $("#rc-code").val()
      })
    })
      .done(data => {
        if (!data.success) {
          showError("Code entered is incorrect")
          console.log("Registration failed");
          regReset();
          hideLoader();
        } else {
          console.log("Registration started");
          console.log(data);
          //location.assign('./success.html')
          $("#loader-message").text("Preparing ...");
	  showLoader();
          setTimeout(regStatus, 1000);
        }
      })
      .fail((jqXHR, textStatus, errorThrown) => {
        showError("Code entered is incorrect")
        regReset();
        hideLoader();
        console.log("Registration failed");
      });
  }

  function logout() {
    $.ajax({
      type: "POST",
      url: `${baseUrl}/auth`,
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        user: null,
        password: null
      })
    })
      .done(data => {
        console.log("Logout success");
        console.log(data);
        location.replace("./login.html");
        hideLoader();
      })
      .fail((jqXHR, textStatus, errorThrown) => {
        console.log("Logout failed");
        hideLoader();
      });
  }

  function on_network_click(obj) {
    sessionStorage.setItem("bssid", $(obj).data("bssid"));
    sessionStorage.setItem("ssid", $(obj).data("ssid"));
    sessionStorage.setItem("authtype", $(obj).data("authtype"));

    //change screen to password.html
    location.assign("./password.html");
    return false;
  }

  function getMobileOperatingSystem() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
      return "Windows Phone";
    }

    if (/android/i.test(userAgent)) {
      return "Android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return "iOS";
    }

    return "unknown";
  }

  function locateToMagazine() {
    var device = getMobileOperatingSystem();

    hideLoader()
    switch (device) {
      case "Android":
        location.assign("market://details?id=com.phonegap.growee");
        break;
      case "iOS":
        location.assign("https://apps.apple.com/us/app/growee/id1387533617");
        break;
      default:
        return;
    }
  }

  function showLoader() {
    $(".loader").data("shown", true);
    $("#loader-message").text("This may take a few moments...");
    $("#loader-parent").css({ "display": "initial", "z-index": "9999" });
    $("#loader-message").css({ "display": "initial" });
    $("#layout").css({ "opacity": "0.2" });
    hideError();
  }

  function hideLoader() {
    $(".loader").data("shown", false);
    $("#loader-parent").css({ "display": "none" });
    $("#loader-message").css({ "display": "none" });
    $("#layout").css({ "opacity": "1" });
  }

  function loaderShown() {
    return $("#loader").data("shown");
  }

  function showError(msg) {
    $("#error").text(`${msg}`);
    $("#error").css({
      "color": "red",
      "text-align": "center",
      "padding-bottom": "12px"
    })
    $(".input-error").css({ "border-color": "red" })
    $("input").val("");
  }
  function hideError() {
    $("#error").text("");
    $("#error").css({
      "padding-bottom": "0px"
    })
    $(".input-error").css({ "border-color": "initial" })
  }

  window.on_network_click = on_network_click;

  //events
  //screen 1
  $("#login-btn").click(() => {
    if (!loaderShown()) {
      setTimeout(() => {
        login();
      }, 1000);
      showLoader();
    }
  });

  //screen 2
  $("#scan-btn").click(() => {
    if (!loaderShown()) {
      showLoader();
      scan();
    }
  });

  if ($("#network-password").length > 0) {
    // password page
    $("#password-cover").text(sessionStorage.getItem("ssid"));
    if (sessionStorage.getItem("authtype") == 0) {
      $("#network-password").attr("disabled", "disabled");
      $("#network-password").removeAttr("minlength");
      $("#network-password").removeAttr("required");
    } else {
      $("#network-password").removeAttr("disabled");
      $("#network-password").attr("minlength", "8");
      $("#network-password").attr("required", "");
    }
    $("#network-password").val("");
    hideLoader();
  }

  //screen 3
  //getting network id
  //getting typed password from input field
  $("network-password").on("keyup", e => {
    n_pass = e.target.value;
  });

  $("#section-2").submit(event => {
    showLoader();
    tryAccessPoint();
    event.preventDefault();
  });

  $("input").focusin(() => {
      hideError();
  });

  $("#network-connect-btn").click(() => {
    if (!loaderShown()) {
      showLoader();
      $("#section-2").submit();
    }
  });

  if ($("#networks").length > 0) {
    //networks page
    showLoader();
    getScanResults();
  }

  //screen 4
  $("#rc-code").on("keyup", e => {
    rc_code = e.target.value;
  });

  $("#register-btn").click(() => {
    if (!loaderShown()) {
      setTimeout(() => {
        registerDevice();
      }, 1000);
      showLoader();
    }
  });

  //screen 5
  $("#logout-btn").click(() => {
    setTimeout(() => {
      logout();
    }, 1000);
    showLoader();
  });

  $("#app-store-btn").click(() => {
    if (loaderShown()) return;

    showLoader();
    $.ajax({
      type: "POST",
      url: `${baseUrl}/wifi`,
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        action: "disconnect"
      })
    })
      .done(data => {
        locateToMagazine();
      })
      .fail((jqXHR, textStatus, errorThrown) => {
        console.log("Disconnect failed");
        hideLoader();
        locateToMagazine();
      });
  });
});
