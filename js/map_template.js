"use strict";

$(function () {
  $("#add-items").css("visibility", "hidden");
  $("#map-items").css("visibility", "hidden");
  $("#unmap-items").css("visibility", "hidden");

  getCategories(10622295);
  startBuildQuickBook(10622295);
  startBuildMapped(10622295);

  var lastChecked = null;
  var dragging = false;

  $("#tree, #account-items").on("mousedown", function (e) {
    var x = e.screenX;
    var y = e.screenY;
    $("#tree, #account-items").on("mousemove", function (e) {
      if (Math.abs(x - e.screenX) > 5 || Math.abs(y - e.screenY) > 5) {
        dragging = true;
        e.target.parentElement.classList.add("active");
      }
    });
    showActionButtons();
  });
  $("#tree, #account-items").on("mouseup", function (e) {
    $("#tree, #account-items").off("mousemove");
    if (dragging) {
      e.target.parentElement.classList.add("active");
    }
    dragging = false;
    showActionButtons();
  });
  [$("#tree tr"), $("#account-items tr")].forEach(function (currentElement) {
    var $element = currentElement;
    $element.click(function (e) {
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

  $("#add-items, #map-items").click(function (e) {
    console.log("category items", selectedCategoryItems());
    console.log("quickbook items", selectedQuickBookItems());
    console.log("mapped items", selectedMappedItems());
  });

  $("#unmap-items").click(function (e) {
    var mappedItems = selectedMappedItems();
    if (mappedItems.length > 0) {
      var header = "Remove mapping(s) for ?";
      var content = "<table><tbody>";
      $("#tree tr").each(function (index, value) {
        if (
          $(value).attr("class") === "active" &&
          $(value).children("td:eq(2)").attr("data-id")
        ) {
          content +=
            "<tr>" + $(value).children("td:eq(2)").get(0).outerHTML + "</tr>";
        }
      });
      content += "</tbody></table>";
      content +=
        '<button class="modal-toggle" onclick="removeMappedItems()">Ok</button>';
      $(".modal-heading").html(header);
      $(".modal-content").html(content);
      $(".modal").toggleClass("is-visible");
    }
  });

  $(".modal-toggle").click(function (e) {
    $(".modal").toggleClass("is-visible");
  });
});

function startBuildCategory() {
  if (!arguments[0]) return;
  var jsonData = arguments[0];
  var element = document.getElementById("tree");

  jsonData.forEach(function (data) {
    if (!data.cat_name && !data.cat_nbr) return;
    var liParent = document.createElement("tr");
    liParent.innerHTML =
      '<td width="45%" style="padding-left: ' +
      data.cat_level * 15 +
      'px" data-id="' +
      data.cat_nbr +
      '" data-title="' +
      data.cat_name +
      '">  <span>' +
      data.cat_name +
      '</span></td><td width="10%" class="center">Item</td><td style="padding-left: ' +
      data.cat_level * 15 +
      'px" width="45%" id="' +
      data.cat_nbr +
      '"></td>';
    element.appendChild(liParent);
  });
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

function startBuildQuickBook() {
  if (!arguments[0] || !Array.isArray(arguments[0])) return;
  var jsonData = arguments[0];
  var element = document.getElementById("account-items");
  jsonData.forEach(function (data) {
    if (!data.cat_name && !data.cat_nbr) return;
    var liParent = document.createElement("tr");
    liParent.innerHTML =
      '<td width="45%" style="padding-left: ' +
      data.cat_level * 15 +
      'px" data-id="' +
      data.cat_nbr +
      '" data-title="' +
      data.cat_name +
      '">  <span>' +
      data.cat_name +
      "</span></td>";
    element.appendChild(liParent);
  });
}

function selectedQuickBookItems() {
  var selectedItems = [];
  $("#account-items tr").each(function (index, value) {
    if (
      $(value).attr("class") === "active" &&
      $(value).find("td:first").data("id")
    ) {
      selectedItems.push($(value).find("td:first").data("id"));
    }
  });
  return selectedItems;
}

function startBuildMapped() {
  if (!arguments[0] || !Array.isArray(arguments[0])) return;
  var jsonData = arguments[0];
  jsonData.forEach(function (data) {
    $("#" + data.id).attr("data-id", data.id);
    $("#" + data.id).html("<span>" + data.title + "</span>");
  });
}

function selectedMappedItems() {
  var selectedItems = [];
  $("#tree tr").each(function (index, value) {
    if (
      $(value).attr("class") === "active" &&
      $(value).children("td:eq(2)").attr("data-id")
    ) {
      selectedItems.push($(value).children("td:eq(2)").attr("data-id"));
    }
  });
  return selectedItems;
}

function showActionButtons() {
  if ($("#tree tr").hasClass("active")) {
    $("#add-items").css("visibility", "visible");
  }
  if (
    $("#tree tr").hasClass("active") &&
    $("#account-items tr").hasClass("active")
  ) {
    $("#map-items").css("visibility", "visible");
  }

  var showCount = 0;
  $("#tree tr").each(function (index, value) {
    if (
      $(value).attr("class") === "active" &&
      $(value).children("td:eq(2)").attr("data-id")
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
  var request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (request.readyState == 4 && request.status == 200) {
      console.log(request.status);
    }
  };
  request.open(
    "GET",
    "https://dev-testd.buildstar.com/app/sync/category_map_rpc.cfm?req=getAccounts",
    true
  );
  request.send(null);
}

function getCategories() {
  if (!arguments[0]) return;
  var job_id = arguments[0];

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      if (xhr.response && xhr.response.error_code == 0) {
        console.log('response', xhr.response.data);
        if (xhr.response.data) {
          startBuildCategory(xhr.response.data);
        } else {
          console.log("No data");
        }
      } else {
        console.log("Error fetching remote data");
      }
    } else {
      console.log("fetching data..", xhr.readyState);
    }
  };
  xhr.open(
    "GET",
    "https://dev-testd.buildstar.com/app/sync/category_map_rpc.cfm?req=getCategories&job_id=" +
      job_id,
    true
  );
  xhr.send(null);
}

function getItems() {
  if (!arguments[0]) return;
  var job_id = arguments[0];
  var http = new XMLHttpRequest();
  var job_id = "";
  http.onreadystatechange = function () {
    if (http.readyState === 4 && http.status === 200) {
      console.log(http.status, http.response);
    }
  };
  http.open(
    "GET",
    "https://dev-testd.buildstar.com/app/sync/category_map_rpc.cfm?req=getItems" +
      "?job_id=" +
      job_id,
    true
  );
  http.send(null);
}

function sendMappedItems() {
  if (!arguments[0]) return;
  var mappedItems = arguments[0];
  var request = new XMLHttpRequest();
  mappedItems.forEach(function (item) {
    var url =
      "https://dev-testd.buildstar.com/app/sync/category_map_rpc.cfm?req" +
      item;
    request.open("GET", url);
    request.send();

    // not handling readyState, since we'll be following synchronous requests
    if (request.status === 200) {
      var data = JSON.parse(request.responseText);
      console.log("response => " + data);
    }
  });
}

function removeMappedItems() {
  var mappedItems = selectedMappedItems();
  if (mappedItems && mappedItems.length > 0) {
    $("#tree tr").each(function (index, value) {
      var currentId = $(value).children("td:eq(2)").attr("data-id");
      if (
        $(value).attr("class") === "active" &&
        currentId &&
        mappedItems.indexOf(currentId.toString()) > -1
      ) {
        $(value).children("td:eq(2)").get(0).innerHTML = "";
      }
    });
  }
  $(".modal").toggleClass("is-visible");
}
