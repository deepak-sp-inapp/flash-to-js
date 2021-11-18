"use strict";

var jsonData = [
  {
    id: "01-1",
    title: "01-1 Planning & Design",
    parentSubcat: [
      {
        title: "01-100 Planning & Design LUMP SUM",
        id: "01-100",
        sub1: [
          {
            id: "01-100-10",
            title: "1 Brush",
          },
          {
            id: "01-100-20",
            title: "2 Oil Paint",
          },
        ],
      },
      {
        title: "01-110 Architect",
        id: "01-110",
        sub2: [
          {
            id: "01-110-00",
            title: "01-110-10 Architecture Lump Sum ",
          },
          {
            id: "01-110-01",
            title: "01-110-20 Architect",
          },
        ],
      },
      {
        title: "01-111 Plans / Blueprints",
        id: "01-111",
        sub3: [
          {
            id: "01-111-10",
            title: "01-111-10 Plans/Blueprints",
          },
        ],
      },
    ],
  },
  {
    id: "02-",
    title: "02- Permits, Fees & Bonds",
    parentSubcat: [
      {
        title: "02-00 Permits, Fees & Bonds - LUMP SUM",
        id: "02-00",
        sub21: [
          {
            id: "02-00-00",
            title: "02-00-00 Planning General",
          },
          {
            id: "02-00-11",
            title: "02-00-11 Bond",
          },
        ],
      },
      {
        title: "02-10 Permits",
        id: "02-10",
        sub22: [
          {
            id: "02-10-10",
            title: "02-10-10 Building Permit",
          },
          {
            id: "02-10-20",
            title: "02-10-20 Building Permit - Sq Ft",
          },
        ],
      },
      {
        title: "02-20 Fees",
        id: "02-20",
        sub23: [
          {
            id: "02-20-00",
            title: "02-20-00 Fees LUMP SUM NM",
          },
        ],
      },
    ],
  },
  {
    id: "03-",
    title: "03- Construction Loan Costs",
    parentSubcat: [
      {
        title: "03-00 Construction Loan Origins",
        id: "03-00",
        sub21: [
          {
            id: "03-00-00",
            title: "03-00-00 Planning General",
          },
          {
            id: "03-00-11",
            title: "03-00-11 Pre Construction",
          },
        ],
      },
      {
        title: "03-10 Lot Costs",
        id: "03-10",
        sub22: [
          {
            id: "03-10-10",
            title: "02-10-10 Lot Purchase Cost",
          },
          {
            id: "03-10-20",
            title: "02-10-20 Pre Construction Lot Application Cost",
          },
        ],
      },
      {
        title: "03-20 Sheathing",
        id: "03-20",
        sub23: [
          {
            id: "03-20-00",
            title: "03-20-00 Cable Sheathing",
          },
        ],
      },
    ],
  },
  {
    id: "04-",
    title: "04- Demolition",
    parentSubcat: [
      {
        title: "04-00 Demolition LUMP SUM",
        id: "04-00",
        sub21: [
          {
            id: "04-00-00",
            title: "04-00-00 Planning General",
          },
          {
            id: "04-00-11",
            title: "04-00-11 Pre Construction",
          },
        ],
      },
      {
        title: "04-10 Lot Costs",
        id: "04-10",
        sub22: [
          {
            id: "04-10-10",
            title: "02-10-10 Lot Purchase Cost",
          },
          {
            id: "04-10-20",
            title: "02-10-20 Pre Construction Lot Application Cost",
          },
        ],
      },
      {
        title: "04-20 Sheathing",
        id: "04-20",
        sub23: [
          {
            id: "04-20-00",
            title: "04-20-00 Cable Sheathing",
          },
        ],
      },
    ],
  },
];

var mappedData = [
  {
    id: "02-",
    title: "02- Permits, Fees & Bonds",
    parentSubcat: [
      {
        title: "02-00 Permits, Fees & Bonds - LUMP SUM",
        id: "02-00",
        sub21: [
          {
            id: "02-00-00",
            title: "02-00-00 Planning General",
          },
          {
            id: "02-00-11",
            title: "02-00-11 Bond",
          },
        ],
      },
    ],
  },
];

var buildCategory = {
  target: "",
  indent: 1,
  start: function start(jsonData, target = "") {
    var _this = this;
    _this.target =
      target === "" ? _this.target : document.getElementById(target);
    jsonData.forEach(function (data) {
      var liParent = document.createElement("tr");
      liParent.innerHTML =
        '<td width="45%" class="indent-' +
        _this.indent +
        '" data-id="' +
        data.id +
        '" data-title="' +
        data.title +
        '">  <span>' +
        data.title +
        '</span></td><td width="10%" class="center">Item</td><td class="indent-' +
        _this.indent +
        '" width="45%" id="' +
        data.id +
        '"></td>';
      _this.target.appendChild(liParent);
      if (_this.checkChilds(data) !== undefined) {
        _this.indent = _this.indent + 1;
        var checkChildIndex = _this.checkChilds(data);
        var children = data[checkChildIndex];
        _this.start(children);
      }
    });
    _this.indent = 1;
  },
  checkChilds: function checkChilds(object) {
    var keys = Object.keys(object);
    var children = keys.filter(function (key) {
      return object[key].constructor === Array;
    });
    if (children) {
      return children[0];
    }
  },
  selectedItems: function selectedItems() {
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
  },
};

var mapWithCategory = {
  tree: document.getElementById("tree"),
  start: function start(mappedData) {
    var _this = this;
    mappedData.forEach(function (data) {
      $("#" + data.id).attr("data-id", data.id);
      $("#" + data.id).html("<span>" + data.title + "</span>");
      if (data.parentSubcat !== undefined) {
        _this.childs(data);
      }
    });
  },
  childs: function childs(data) {
    var _this2 = this;
    data.parentSubcat.forEach(function (child) {
      $("#" + child.id).attr("data-id", child.id);
      $("#" + child.id).html("<span>" + child.title + "</span>");
      if (_this2.checkChilds(child) !== undefined) {
        var checkChildrenIndex = _this2.checkChilds(child);
        var children = child[checkChildrenIndex];
        children.forEach(function (child) {
          $("#" + child.id).attr("data-id", child.id);
          $("#" + child.id).html("<span>" + child.title + "</span>");
        });
      }
    });
  },
  checkChilds: function checkChilds(object) {
    var keys = Object.keys(object);
    var children = keys.filter(function (key) {
      return key.includes("sub");
    });
    if (children) {
      return children[0];
    }
  },
  selectedItems: function selectedItems() {
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
  },
};

var quickBookItems = {
  target: "",
  indent: 1,
  start: function start(jsonData, target = "") {
    var _this = this;
    _this.target =
      target === "" ? _this.target : document.getElementById(target);
    jsonData.forEach(function (data) {
      var liParent = document.createElement("tr");
      liParent.innerHTML =
        '<td width="45%" class="indent-' +
        _this.indent +
        '" data-id="' +
        data.id +
        '" data-title="' +
        data.title +
        '">  <span>' +
        data.title +
        "</span></td>";
      _this.target.appendChild(liParent);
      if (_this.checkChilds(data) !== undefined) {
        _this.indent = _this.indent + 1;
        var checkChildIndex = _this.checkChilds(data);
        var children = data[checkChildIndex];
        _this.start(children);
      }
    });
    _this.indent = 1;
  },
  checkChilds: function checkChilds(object) {
    var keys = Object.keys(object);
    var children = keys.filter(function (key) {
      return object[key].constructor === Array;
    });
    if (children) {
      return children[0];
    }
  },
  selectedItems: function selectedItems() {
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
  },
};

var xmlHttpRequest = {
  getItems: function () {
    return jsonData;
    var request = new XMLHttpRequest();
    var job_id = "";
    request.onreadystatechange = function () {
      if (request.readyState == 4 && request.status == 200) {
        console.log(request.status);
      }
    };
    request.open(
      "GET",
      "https://dev-testd.buildstar.com/app/sync/category_map_rpc.cfm?req=getItems" +
        "?job_id=" +
        1,
      true
    );
    request.send(null);
  },
  getAccounts: function () {},
  getCategories: function () {},
};

$(function () {
  buildCategory.start(jsonData, "tree");
  quickBookItems.start(jsonData, "account-items");
  mapWithCategory.start(mappedData);

  var $items = $("#tree tr");
  var $accountItems = $("#account-items tr");
  var lastChecked = null;

  $items.click(function (e) {
    if (!lastChecked) {
      lastChecked = this;
    }
    if (e.shiftKey) {
      var start = $items.index(this);
      var end = $items.index(lastChecked);
      $items
        .slice(Math.min(start, end), Math.max(start, end) + 1)
        .removeClass("active")
        .addClass("active");
    } else if (e.ctrlKey) {
      $(this).toggleClass("active");
    } else {
      $items.removeClass("active");
      $(this).toggleClass("active");
    }
    lastChecked = this;
  });

  $accountItems.click(function (e) {
    if (!lastChecked) {
      lastChecked = this;
    }
    if (e.shiftKey) {
      var start = $accountItems.index(this);
      var end = $accountItems.index(lastChecked);
      $accountItems
        .slice(Math.min(start, end), Math.max(start, end) + 1)
        .removeClass("active")
        .addClass("active");
    } else if (e.ctrlKey) {
      $(this).toggleClass("active");
    } else {
      $accountItems.removeClass("active");
      $(this).toggleClass("active");
    }
    lastChecked = this;
  });

  $("#add-items, #map-items, #unmap-items").click(function (e) {
    console.log("category items", buildCategory.selectedItems());
    console.log("quickbook items", quickBookItems.selectedItems());
    console.log("mapped items", mapWithCategory.selectedItems());
  });

  // console.log(xmlHttpRequest.getItems());
});
