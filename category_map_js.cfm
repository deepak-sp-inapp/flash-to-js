<script>
  "use strict";
  var quickBookItems = [];
  var quickBookAccounts = [];
  var currentItemScrollPosition;
  var currentAccountScrollPosition;
  $(function () {
    var lastChecked = null;
    var dragging = false;

    $("#qb-items").css("display", "none");
    $("#qb-accounts").css("display", "none");

     ["#tree tr", "#qb-items tr, #qb-accounts tr"].forEach(function (
      currentElement
   ) {

      $("table").on("mousedown", currentElement, function (e) {
         $(currentElement).removeClass("active");
         var x = e.screenX;
         var y = e.screenY;
         $("table").on("mousemove", currentElement, function (e) {
            if (Math.abs(x - e.screenX) > 5 || Math.abs(y - e.screenY) > 5) {
               dragging = true;
               e.target.parentElement.classList.add("active");
            }
            showActionButtons();
         });
      });

      $("table").on("mouseup", currentElement, function (e) {
         $("table").off("mousemove", currentElement);
         if (dragging) {
            e.target.parentElement.classList.add("active");
         }
         dragging = false;
         showActionButtons();
      });

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
         }
         else {
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
         (function loop(i, length) {
            if (i >= length) {
               clearSelection();
               getCategories();
               return;
            }
            var requests = new XMLHttpRequest();
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
            requests.open(
               "POST",
               "https://<cfoutput>#http_server#</cfoutput>/app/sync/category_map_rpc.cfm",
               false
            );
            requests.onload = function () {
               loop(i + 1, length);
            };
            requests.send(params);
         })(0, mappedItems.length);
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
               $(value).children("td").attr("data-id")
            ) {
               content +=
                  "<tr>" + $(value).children("td").get(0).outerHTML + "</tr>";
            }
         });
         content += "</tbody></table>";
         content +=
            '<div class="okBtn"><button id="abortAction">Cancel</button> <button id="deleteMappedItems">OK</button></div>';
         $(".modal-heading").html(header);
         $(".modal-content").html(content);
         $(".modal")
            .toggleClass("is-visible")
            .on("click", "#deleteMappedItems", function () {
               $.when($("#loader").css("display", "block")).then(function () {
                  unMapItems();
               });
            })
            .on("click", "#abortAction", function () {
               $(".modal").removeClass("is-visible");
            });
      }
   });


    $("input[name='items']").on("change", function () {
      var qbType = $(this).val();
      $.when($("tr").removeClass()).then(function () {
        if (qbType == "items") {
          $("#qb-accounts").css("display", "none");
          $("#qb-items").fadeIn(300);
        }
        if (qbType == "accounts") {
          $("#qb-items").css("display", "none");
          $("#qb-accounts").fadeIn(300);
        }
        showActionButtons();
      });
    });

    $.when(
      $("#loader, #qb-items").css("display", "block"),
      $("input[name='items'][value='items']").prop("checked", true)
    ).then(function () {
      getAccounts();
      getItems();
      getCategories();
    });

    $("#items").scroll(function () {
      currentItemScrollPosition = $("#items").scrollTop();
    });
    $("#accounts").scroll(function () {
      currentAccountScrollPosition = $("#accounts").scrollTop();
    });
  });

  function itemScrollPosition() {
    if (currentItemScrollPosition) {
      $("#items").animate({ scrollTop: currentItemScrollPosition }, 600);
    }
  }

  function accountScrollPosition() {
    if (currentAccountScrollPosition) {
      $("#accounts").animate({ scrollTop: currentAccountScrollPosition }, 600);
    }
  }

  function unMapItems() {
    $.when($(".modal").removeClass("is-visible")).then(function () {
      var mappedItems = selectedMappedItems();
      var itemType = $("input[name='items']:checked").val();
      var job_id = $("#new_template_id").val();
      (function loop(i, length) {
         if (i >= length) {
            clearSelection();
            getCategories();
            return;
         }
         var requests = new XMLHttpRequest();
         var params = new FormData();
         var item_type = itemType === "items" ? "item_id" : "account_id";
         params.append("req", "setMapping");
         params.append("job_id", job_id);
         params.append("cat_nbr", mappedItems[i]);
         params.append(item_type, "");
         requests.open(
            "POST",
            "https://<cfoutput>#http_server#</cfoutput>/app/sync/category_map_rpc.cfm",
            false
         );
         requests.onload = function () {
            loop(i + 1, length);
         };
         requests.send(params);
      })(0, mappedItems.length);
    });
  }

function initCap() {
   if (arguments[0]) {
      var string = arguments[0].toLowerCase().replace('_', ' ');
      var arr = string.split(" ");
      for (var i = 0; i < arr.length; i++) {
         arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
      }
      return arr.join(" ");
   }
}

   function clearSelection() {
      $('tr').removeClass("active");
   }

  function startBuildCategory() {
    if (!arguments[0]) return;
    var jsonData = arguments[0];
    var element = document.getElementById("tree");
    var liParent = "";
    jsonData.forEach(function (data) {
      if (!data.cat_desc && !data.cat_nbr) return;
      if (data.item_id) {
        var mappedItem = quickBookItems
          .filter(function (item) {
            return (item.item_id == data.item_id && item.ext_status !== 0);
          })
          .map(function (item) {
            return { 
               id: item.item_id, 
               name: item.item_name, 
               type: "item",
               level: item.item_level,
            };
          })[0];
      }
      if (data.account_id) {
        var mappedItem = quickBookAccounts
          .filter(function (item) {
            return (item.account_id == data.account_id && item.ext_status !== 0);
          })
          .map(function (item) {
            return {
              id: item.account_id,
              name: item.account_desc,
              type: "acct",
              level: item.account_level,
            };
          })[0];
      }
      var indent = 0;
      if (mappedItem && mappedItem.level) {
         indent = parseInt(mappedItem.level) - 1 === 0 ? 5 : (parseInt(mappedItem.level) - 1) * 15;
      }
      liParent +=
        '<tr><td width="47%" style="padding-left: ' +
        data.cat_level * 15 +
        'px" data-level="' +
        data.cat_level +
        '" data-id="' +
        data.cat_nbr +
        '" data-title="' +
        data.cat_desc +
        '">  <span>' +
        data.cat_desc +
        '</span></td><td width="6%" class="center">' +
        (mappedItem ? initCap(mappedItem.type) : "") +
        '</td><td style="padding-left: ' +
        (mappedItem && mappedItem.level ? indent : 0) +
         'px" width="47%" data-qb-id="' +
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
    itemScrollPosition();
    accountScrollPosition();
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
        $(value).find("td:first").data("id")
      ) {
        selectedItemObjects.push({
          id: $(value).find("td:first").data("id"),
            title: $(value).find("td:first").data("title"),
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
      if ((!data.item_name && !data.item_id) || parseInt(data.ext_status) === 0 || parseInt(data.active_flag) !== 1) return;
      liParent +=
        '<tr><td width="45%" style="padding-left: ' +
        (data.item_level - 1) * 15 +
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
      if ((!data.account_desc && !data.account_id) || parseInt(data.ext_status) === 0 || parseInt(data.active_flag) !== 1) return;
      liParent +=
        '<tr><td width="45%" style="padding-left: ' +
        (data.item_level - 1) * 15 +
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
    if ($("#items tr").hasClass("active")) {
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
      "https://<cfoutput>#http_server#</cfoutput>/app/sync/category_map_rpc.cfm?req=getAccounts",
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
      "https://<cfoutput>#http_server#</cfoutput>/app/sync/category_map_rpc.cfm?req=getCategories&job_id="+job_id,
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
      "https://<cfoutput>#http_server#</cfoutput>/app/sync/category_map_rpc.cfm?req=getItems",
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
      var income_account_id = arguments[2] ? arguments[2] : '';
      var expense_account_id = arguments[3] ? arguments[3] : '';
      if (i >= length || error) {
        clearSelection();
        getItems();
        getCategories();
        $("#loaderMsg").text("");
        return;
      }
      $.when($("#loaderMsg").text("Adding " + (i + 1) + " of " + itemsToAdd.length + " items")).then(function () {
         var params = new FormData();
         params.append("req", "getItemAddReq");
         params.append("job_id", job_id);
         params.append("income_account_id", income_account_id);
         params.append("expense_account_id", expense_account_id);
         params.append("cat_nbr", encodeURIComponent(itemsToAdd[i].id));
        var url =
          "https://<cfoutput>#http_server#</cfoutput>/app/sync/category_map_rpc.cfm";
        request.open("POST", url);
        request.onreadystatechange = function () {
          if (
               request.readyState === XMLHttpRequest.DONE &&
               request.status === 200
            ) {
               var response = JSON.parse(request.response);
               if (response.error_code === 0) {
                  if (response.data.xml_request) {
                     var xml_request = execute_qbxml_request(response.data.xml_request);
                     $.when($("#loaderMsg").text("Adding " + (i + 1) + " of " + itemsToAdd.length + " items")).then(function () {
                        postItemAddResponse(xml_request, job_id, itemsToAdd[i].id).then(
                           function (postItemResponse) {
                              income_account_id = '';
                              expense_account_id = '';
                              var postResponse = JSON.parse(postItemResponse);
                              if (postResponse.error_code !== 0) {
                                 window.alert(postResponse.error_message);
                                 error = true;
                              }
                              loop(i + 1, length);
                           }
                        );
                     });
                  } else {
                     loop(i + 1, length);
                  }
               } else if (response.error_code === 7) {
                  $.when($("#loader").css("display", "none")).then(function () {
                     getAccountDialog(response.error_message).then(function (data) {
                        if (data.error_code === 0) {
                           $.when($("#loader").css("display", "block")).then(function () {
                              loop(i, length, data.income_account_id, data.expense_account_id);
                           });
                        } else {
                           error = true;
                           loop(i + 1, length);
                        }
                     });
                  });
               }
               else {
                  var message = response.error_message
                     ? response.error_message
                     : "Failed";
                  window.alert(message);
                  error = true;
                  loop(i + 1, length);
               }
          }
        };
        request.send(params);
      });
    })(0, itemsToAdd.length);
  }

  function postItemAddResponse() {
    var deferred = jQuery.Deferred();
    if (!arguments) deferred.resolve({ error_code: 1, error_message: "Failed!!, no item to add" });
    var params = new FormData();
    params.append("req", "postItemAddResp");
    params.append("xml_response", arguments[0]);
    params.append("job_id", arguments[1]);
    params.append("cat_nbr", arguments[2]);
    var requests = new XMLHttpRequest();
    requests.open(
      "POST",
      "https://<cfoutput>#http_server#</cfoutput>/app/sync/category_map_rpc.cfm",
      false
    );
    requests.onload = function () {
      deferred.resolve(requests.response);
    };
    requests.onerror = function () {
      deferred.resolve({ error_code: 1, error_message: "Failed" });
    };
    requests.send(params);
    return deferred.promise();
  }


function getAccountDialog() {
   var deferred = jQuery.Deferred();
   var header = arguments[0];
   var incomeAccounts = ['INCOME', 'OTHERINC'];
   var expenseAccounts = ['COSTOFGO', 'EXPENSE', 'OTHEREXP'];
   var content = '';
   ['income_account', 'expense_account'].forEach(function (item) {
      content += "<div class='selectAccount'><p>" + initCap(item) + "</p><select name='" + item + "'>";
      content += "<option value=''>(None)</option>";
      quickBookAccounts.forEach(function (data) {
         if ((!data.account_desc && !data.account_id) || parseInt(data.ext_status) === 0) return;
         if ((item == 'income_account' && incomeAccounts.indexOf(data.account_type) !== -1) || (item == 'expense_account' && expenseAccounts.indexOf(data.account_type) !== -1)) {
            content +=
               "<option value='" + data.account_id + "'>" + data.account_desc + "</option>";
         }
      });
      content += "</select></div>";
   });

   content +=
      '<div class="okBtn"><button id="abortAction">Cancel</button> <button id="confirmAssignAccount">OK</button></div>';
   $(".modal-heading").html(header);
   $(".modal-content").html(content);
   $(".modal")
      .addClass("is-visible")
      .on("click", "#confirmAssignAccount", function (e) {
         var income_account_id = $("select[name='income_account']").val();
         var expense_account_id = $("select[name='expense_account']").val();
         if (!income_account_id && !expense_account_id) {
            e.stopImmediatePropagation();
            window.alert('Please select at least one account to continue');
         } else {
            $.when($(".modal").removeClass("is-visible")).then(function () {
               deferred.resolve(
                  {
                     error_code: 0,
                     error_message: "Assigned account",
                     income_account_id: income_account_id,
                     expense_account_id: expense_account_id
                  }
               );
            });
         }
      })
      .on("click", "#abortAction", function () {
         $.when($(".modal").removeClass("is-visible")).then(function () {
            deferred.resolve({ error_code: 1, error_message: "" });
         });
      });
   return deferred.promise();
}
</script>
