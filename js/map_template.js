"use strict";

var quickBookItems = [];
$(function () {
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
      showActionButtons();
    });
  });
  $("#tree, #account-items").on("mouseup", function (e) {
    $("#tree, #account-items").off("mousemove");
    if (dragging) {
      e.target.parentElement.classList.add("active");
    }
    dragging = false;
    showActionButtons();
  });
  ["#tree tr", "#account-items tr"].forEach(function (currentElement) {
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
    console.log("category items", selectedCategoryItems());
    console.log("quickbook items", selectedQuickBookItems());
    console.log("mapped items", selectedMappedItems());
  });

  $("#map-items").click(function (e) {
    var job_id = $("#new_template_id").val();
    var mappedItems = selectedCategoryItems();
    var qbItems = selectedQuickBookItems();
    var requests = [];
    for (var i = 0; i < mappedItems.length; i++) {
      var params = new FormData();
      params.append("req", "setMapping");
      params.append("job_id", job_id);
      params.append("cat_nbr", mappedItems[i]);
      if (qbItems.length > 1) {
        params.append("item_id", qbItems[i]);
      } else {
        params.append("item_id", qbItems[0]);
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
        '<button class="modal-toggle" id="deleteMappedItems">Ok</button>';
      $(".modal-heading").html(header);
      $(".modal-content").html(content);
      $(".modal")
        .toggleClass("is-visible")
        .on("click", "#deleteMappedItems", function () {
          var requests = [];
          var job_id = $("#new_template_id").val();
          for (var i = 0; i < mappedItems.length; i++) {
            var params = new FormData();
            params.append("req", "setMapping");
            params.append("job_id", job_id);
            params.append("cat_nbr", mappedItems[i]);
            params.append("item_id", "");
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
          $(".modal").toggleClass("is-visible");
        });
    }
  });

  $(".modal-toggle").click(function (e) {
    $(".modal").toggleClass("is-visible");
  });

  getItems();
  getCategories();
});

function startBuildCategory() {
  if (!arguments[0]) return;
  var jsonData = arguments[0];
  var element = document.getElementById("tree");

  jsonData.forEach(function (data) {
    if (!data.cat_desc && !data.cat_nbr) return;
    var liParent = document.createElement("tr");
    var mappedItem = quickBookItems.filter(function (item) {
      return item.item_id == data.item_id;
    })[0];
    liParent.innerHTML =
      '<td width="45%" style="padding-left: ' +
      data.cat_level * 15 +
      'px" data-id="' +
      data.cat_nbr +
      '" data-title="' +
      data.cat_desc +
      '">  <span>' +
      data.cat_desc +
      '</span></td><td width="10%" class="center">' +
      (mappedItem && mappedItem.item_type
        ? mappedItem.item_type.toLowerCase()
        : "") +
      '</td><td style="padding-left: ' +
      data.cat_level * 15 +
      'px" width="45%" data-qb-id="' +
      (mappedItem && mappedItem.item_id ? mappedItem.item_id : "") +
      '" data-id="' +
      data.cat_nbr +
      '" id="' +
      data.cat_nbr +
      '">' +
      (mappedItem && mappedItem.item_name ? mappedItem.item_name : "") +
      "</td>";
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
    if (!data.item_name && !data.item_id) return;
    var liParent = document.createElement("tr");
    liParent.innerHTML =
      '<td width="45%" style="padding-left: ' +
      data.item_level * 15 +
      'px" data-id="' +
      data.item_id +
      '" data-title="' +
      data.item_name +
      '">  <span>' +
      data.item_name +
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
    $("#account-items tr").hasClass("active")
  ) {
    var selectedCategories = selectedCategoryItems();
    var selectedQuickBook = selectedQuickBookItems();
    if (
      selectedQuickBook.length === 1 ||
      selectedCategories.length === selectedQuickBook.length
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
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      if (xhr.response) {
        var response = xhr.response;
        response =
          typeof response == "object" ? response : JSON.parse(response);
        if (response.data) {
          startBuildQuickBook(response.data);
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
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      if (xhr.response) {
        var response = xhr.response;
        response =
          typeof response == "object" ? response : JSON.parse(response);
        if (response.data) {
          quickBookItems = response.data;
          startBuildQuickBook(response.data);
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
  xhr.send(null);
}
