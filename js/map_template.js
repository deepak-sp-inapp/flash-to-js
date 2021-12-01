"use strict";
var quickBookItems = [];
var quickBookAccounts = [];
$(function () {
  var lastChecked = null;
  var dragging = false;

  $("#qb-items").css("display", "none");
  $("#qb-accounts").css("display", "none");

  $("#tree, #qb-items, #qb-accounts").on("mousedown", function (e) {
    var x = e.screenX;
    var y = e.screenY;
    $("#tree, #qb-items, #qb-accounts").on("mousemove", function (e) {
      if (Math.abs(x - e.screenX) > 5 || Math.abs(y - e.screenY) > 5) {
        dragging = true;
        e.target.parentElement.classList.add("active");
      }
      showActionButtons();
    });
  });

  $("#tree, #qb-items, #qb-accounts").on("mouseup", function (e) {
    $("#tree, #qb-items, #qb-accounts").off("mousemove");
    if (dragging) {
      e.target.parentElement.classList.add("active");
    }
    dragging = false;
    showActionButtons();
  });

  ["#tree tr", "#qb-items tr, #qb-accounts tr"].forEach(function (
    currentElement
  ) {
    $("table").on("click", currentElement, function (e) {
      var $element = $(currentElement);
      if (!lastChecked) {
        lastChecked = this;
      }
      if (e.shiftKey) {
        var start = $element.index(this);
        var end = $element.index(lastChecked);
        $element
          .slice(Math.min(start, end), Math.max(start, end) + 1)
          .removeClass("active")
          .addClass("active");
      } else if (e.ctrlKey) {
        $(this).toggleClass("active");
      } else {
        $element.removeClass("active");
        $(this).toggleClass("active");
      }
      lastChecked = this;
      showActionButtons();
    });
  });

  $("#add-items").click(function (e) {
    $.when($("#loader").css("display", "block")).then(function () {
      getItemAddRequest();
    });
  });

  $("#map-items").click(function (e) {
    $.when($("#loader").show()).then(function () {
      var job_id = $("#new_template_id").val();
      var mappedItems = selectedCategoryItems();
      var itemType = $("input[name='items']:checked").val();
      var qbItems =
        itemType === "items"
          ? selectedQuickBookItems()
          : selectedQuickBookAccounts();
      var requests = [];
      for (var i = 0; i < mappedItems.length; i++) {
        var params = new FormData();
        var item_type = itemType === "items" ? "item_id" : "account_id";
        params.append("req", "setMapping");
        params.append("job_id", job_id);
        params.append("cat_nbr", mappedItems[i]);
        if (qbItems.length > 1) {
          params.append(item_type, qbItems[i]);
        } else {
          params.append(item_type, qbItems[0]);
        }
        requests[i] = new XMLHttpRequest();
        requests[i].open(
          "POST",
          "https://dev-testd.buildstar.com/app/sync/category_map_rpc.cfm",
          false
        );
        requests[i].onload = function () {
          console.log(requests[i].response);
        };
        requests[i].send(params);
      }
      getCategories();
    });
  });

  $("#unmap-items").click(function (e) {
    var mappedItems = selectedMappedItems();
    if (mappedItems.length > 0) {
      var header = "Remove mapping(s) for ?";
      var content = "<table><tbody>";
      $("#tree tr").each(function (index, value) {
        if (
          $(value).attr("class") === "active" &&
          $(value).children("td:eq(2)").attr("data-qb-id")
        ) {
          content +=
            "<tr>" + $(value).children("td:eq(2)").get(0).outerHTML + "</tr>";
        }
      });
      content += "</tbody></table>";
      content +=
        '<button class="modal-toggle" id="deleteMappedItems">Ok</button>';
      $(".modal-heading").html(header);
      $(".modal-content").html(content);
      $(".modal")
        .toggleClass("is-visible")
        .on("click", "#deleteMappedItems", function (e) {
          e.stopPropagation();
          $.when($("#loader").css("display", "block")).then(function () {
            unMapItems();
          });
        });
    }
  });

  $(".modal-toggle").click(function (e) {
    $(".modal").toggleClass("is-visible");
  });

  $("input[name='items']").on("change", function () {
    $.when($("tr").removeClass()).then(function () {
      getCategories();
    });
    if ($(this).val() == "items") {
      $("#qb-accounts").css("display", "none");
      $("#qb-items").fadeIn(300);
    }
    if ($(this).val() == "accounts") {
      $("#qb-items").css("display", "none");
      $("#qb-accounts").fadeIn(300);
    }
  });

  $.when($("#loader").css("display", "block"), ).then(function () {
    getAccounts();
    getItems();
    getCategories();
  });
});

function unMapItems() {
  $.when($(".modal").removeClass("is-visible")).then(function () {
    var mappedItems = selectedMappedItems();
    var itemType = $("input[name='items']:checked").val();
    var requests = [];
    var job_id = $("#new_template_id").val();
    for (var i = 0; i < mappedItems.length; i++) {
      var params = new FormData();
      var item_type = itemType === "items" ? "item_id" : "account_id";
      params.append("req", "setMapping");
      params.append("job_id", job_id);
      params.append("cat_nbr", mappedItems[i]);
      params.append(item_type, "");
      requests[i] = new XMLHttpRequest();
      requests[i].open(
        "POST",
        "https://dev-testd.buildstar.com/app/sync/category_map_rpc.cfm",
        false
      );
      requests[i].onload = function () {
        console.log(requests[i].response);
      };
      requests[i].send(params);
    }
    getCategories();
  });
}

function initCap() {
  if (arguments[0]) {
    var string = arguments[0].toLowerCase();
    return string.charAt(0).toUpperCase() + string.substring(1);
  }
}

function startBuildCategory() {
  if (!arguments[0]) return;
  var jsonData = arguments[0];
  var element = document.getElementById("tree");
  var itemType = $("input[name='items']:checked").val();
  var liParent = "";
  jsonData.forEach(function (data) {
    if (!data.cat_desc && !data.cat_nbr) return;
    if (itemType === "items") {
      var mappedItem = quickBookItems
        .filter(function (item) {
          return item.item_id == data.item_id;
        })
        .map(function (item) {
          return { id: item.item_id, name: item.item_name, type: "item" };
        })[0];
    }
    if (itemType === "accounts") {
      var mappedItem = quickBookAccounts
        .filter(function (item) {
          return item.account_id == data.account_id;
        })
        .map(function (item) {
          return {
            id: item.account_id,
            name: item.account_desc,
            type: "account",
          };
        })[0];
    }
    liParent +=
      '<tr><td width="45%" style="padding-left: ' +
      data.cat_level * 15 +
      'px" data-level="' +
      data.cat_level +
      '" data-id="' +
      data.cat_nbr +
      '" data-title="' +
      data.cat_desc +
      '">  <span>' +
      data.cat_desc +
      '</span></td><td width="10%" class="center">' +
      (mappedItem ? initCap(mappedItem.type) : "") +
      '</td><td style="padding-left: ' +
      data.cat_level * 15 +
      'px" width="45%" data-qb-id="' +
      (mappedItem && mappedItem.id ? mappedItem.id : "") +
      '" data-id="' +
      data.cat_nbr +
      '" id="' +
      data.cat_nbr +
      '">' +
      (mappedItem && mappedItem.name ? mappedItem.name : "") +
      "</td></tr>";
  });
  element.innerHTML = liParent;
  showActionButtons();
}

function selectedCategoryItems() {
  var selectedItems = [];
  $("#tree tr").each(function (index, value) {
    if (
      $(value).attr("class") === "active" &&
      $(value).find("td:first").data("id")
    ) {
      selectedItems.push($(value).find("td:first").data("id"));
    }
  });
  return selectedItems;
}

function selectedCategoryItemObjects() {
  var selectedItemObjects = [];
  $("#tree tr").each(function (index, value) {
    if (
      $(value).attr("class") === "active" &&
      $(value).find("td:first").data("id") &&
      $(value).find("td:first").data("level")
    ) {
      selectedItemObjects.push({
        id: $(value).find("td:first").data("id"),
        level: $(value).find("td:first").data("level"),
      });
    }
  });
  return selectedItemObjects;
}

function startBuildQuickBookItems() {
  if (!arguments[0] || !Array.isArray(arguments[0])) return;
  var jsonData = arguments[0];
  var element = document.getElementById("qb-items");
  var liParent = "";
  jsonData.forEach(function (data) {
    if (!data.item_name && !data.item_id) return;
    liParent +=
      '<tr><td width="45%" style="padding-left: ' +
      data.item_level * 15 +
      'px" data-id="' +
      data.item_id +
      '" data-title="' +
      data.item_name +
      '">  <span>' +
      data.item_name +
      "</span></td></tr>";
  });
  element.innerHTML = liParent;
}

function selectedQuickBookItems() {
  var selectedItems = [];
  $("#qb-items tr").each(function (index, value) {
    if (
      $(value).attr("class") === "active" &&
      $(value).find("td:first").data("id")
    ) {
      selectedItems.push($(value).find("td:first").data("id"));
    }
  });
  return selectedItems;
}

function startBuildQuickBookAccounts() {
  if (!arguments[0] || !Array.isArray(arguments[0])) return;
  var jsonData = arguments[0];
  var element = document.getElementById("qb-accounts");
  var liParent = "";
  jsonData.forEach(function (data) {
    if (!data.account_desc && !data.account_id) return;
    liParent +=
      '<tr><td width="45%" style="padding-left: ' +
      data.account_level * 15 +
      'px" data-id="' +
      data.account_id +
      '" data-title="' +
      data.account_desc +
      '">  <span>' +
      data.account_desc +
      "</span></td></tr>";
  });
  element.innerHTML = liParent;
}

function selectedQuickBookAccounts() {
  var selectedItems = [];
  $("#qb-accounts tr").each(function (index, value) {
    if (
      $(value).attr("class") === "active" &&
      $(value).find("td:first").data("id")
    ) {
      selectedItems.push($(value).find("td:first").data("id"));
    }
  });
  return selectedItems;
}

function selectedMappedItems() {
  var selectedItems = [];
  $("#tree tr").each(function (index, value) {
    if (
      $(value).attr("class") === "active" &&
      $(value).children("td:eq(2)").attr("data-qb-id")
    ) {
      selectedItems.push($(value).children("td:eq(2)").attr("data-id"));
    }
  });
  return selectedItems;
}

function showActionButtons() {
  if ($("#tree tr").hasClass("active")) {
    $("#add-items").css("visibility", "visible");
  } else {
    $("#add-items").css("visibility", "hidden");
  }

  if (
    $("#tree tr").hasClass("active") &&
    ($("#qb-items tr").hasClass("active") ||
      $("#qb-accounts tr").hasClass("active"))
  ) {
    var selectedCategories = selectedCategoryItems();
    var selectedQbItems = selectedQuickBookItems();
    var selectedQbAccounts = selectedQuickBookAccounts();
    if (
      selectedQbItems.length === 1 ||
      selectedCategories.length === selectedQbItems.length ||
      selectedQbAccounts.length === 1 ||
      selectedCategories.length === selectedQbAccounts.length
    ) {
      $("#map-items").css("visibility", "visible");
    } else {
      $("#map-items").css("visibility", "hidden");
    }
  } else {
    $("#map-items").css("visibility", "hidden");
  }

  var showCount = 0;
  $("#tree tr").each(function (index, value) {
    if (
      $(value).attr("class") === "active" &&
      $(value).children("td:eq(2)").attr("data-qb-id")
    ) {
      showCount = showCount + 1;
    }
  });
  if (showCount > 0) {
    $("#unmap-items").css("visibility", "visible");
  } else {
    $("#unmap-items").css("visibility", "hidden");
  }
}

function getAccounts() {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      if (xhr.response) {
        var response = xhr.response;
        response =
          typeof response == "object" ? response : JSON.parse(response);
        if (response.data) {
          quickBookAccounts = response.data;
          startBuildQuickBookAccounts(response.data);
        } else {
          console.log("No data");
        }
      } else {
        console.log("Error fetching remote data");
      }
    }
  };
  xhr.open(
    "GET",
    "https://dev-testd.buildstar.com/app/sync/category_map_rpc.cfm?req=getAccounts",
    true
  );
  xhr.onerror = function (e) {
    console.log(e);
  };
  xhr.send(null);
}

function getCategories() {
  var job_id = $("#new_template_id").val();
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      if (xhr.response) {
        var response = xhr.response;
        response =
          typeof response == "object" ? response : JSON.parse(response);
        if (response.data) {
          startBuildCategory(response.data);
        } else {
          console.log("No data");
        }
      } else {
        console.log("Error fetching remote data");
      }
      $("#loader").fadeOut(200);
    }
  };
  xhr.open(
    "GET",
    "https://dev-testd.buildstar.com/app/sync/category_map_rpc.cfm?req=getCategories&job_id=" +
      job_id +
      "&" +
      new Date().getTime(),
    true
  );
  xhr.onerror = function (e) {
    $("#loader").fadeOut(200);
    console.log(e);
  };
  xhr.send(null);
}

function getItems() {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      if (xhr.response) {
        var response = xhr.response;
        response =
          typeof response == "object" ? response : JSON.parse(response);
        if (response.data) {
          quickBookItems = response.data;
          startBuildQuickBookItems(response.data);
        } else {
          console.log("No data");
        }
      } else {
        console.log("Error fetching remote data");
      }
    }
  };
  xhr.open(
    "GET",
    "https://dev-testd.buildstar.com/app/sync/category_map_rpc.cfm?req=getItems",
    true
  );
  xhr.onerror = function (e) {
    console.log(e);
  };
  xhr.send(null);
}

function getItemAddRequest() {
  var job_id = $("#new_template_id").val();
  var itemsToAdd = selectedCategoryItemObjects();
  var request = new XMLHttpRequest();
  var error = false;
  (function loop(i, length) {
    if (i >= length || error) {
      getCategories();
      getItems();
      $("#loader").fadeOut(200);
      return;
    }
    var url = "https://dev-testd.buildstar.com/app/sync/category_map_rpc.cfm?req=getItemAddReq&job_id="+job_id+"&cat_nbr="+itemsToAdd[i].id;
    request.open("GET", url);
    request.onreadystatechange = function () {
      if (
        request.readyState === XMLHttpRequest.DONE &&
        request.status === 200
      ) {
        var data = JSON.parse(request.response);
        if (data.error === 0) {
          loop(i + 1, length);
          // postItemAddResponse(data)
          //   .then(function (response) {
          //     loop(i + 1, length);
          //   })
          //   .catch(function (error) {
          //     window.alert(error);
          //     error = true;
          //   });
        } else {
          var message = data.error_message ? data.error_message : 'Failed !!';
          window.alert(message);
          error = true;
        }
      }
    };
    request.send();
  })(0, itemsToAdd.length);
}

function postItemAddResponse() {
  return new Promise(function (resolve, reject) {
    if (!arguments[0]) reject("Failed!!, no item to add");
    var xmlReponse = arguments[0];
    var requests = new XMLHttpRequest();
    var params = new FormData();
    params.append("req", "postItemAddResponse");
    params.append("xml_response", encodeURIComponent(xmlReponse));
    requests.open(
      "POST",
      "https://dev-testd.buildstar.com/app/sync/category_map_rpc.cfm",
      false
    );
    requests.onload = function () {
      resolve(requests.response);
    };
    requests.onerror = function () {
      reject("Failed !!");
    };
    requests.setRequestHeader(
      "Content-Type",
      "application/x-www-form-urlencoded"
    );
    requests.send(params);
  });
}
