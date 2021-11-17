"use strict";

var jsonData = [
  {
    title: "Category title 1",
    parentSubcat: [
      {
        title: "Sub title",
        id: "ID value",
        sub1: [
          {
            title: "costitem11",
          },
          {
            title: "costitem12",
          },
        ],
      },
      {
        title: "Sub title",
        id: "ID value",
        sub2: [
          {
            title: "costitem21",
          },
          {
            title: "costitem22",
          },
        ],
      },
      {
        title: "Sub title",
        id: "ID value",
        sub3: [
          {
            title: "costitem3",
          },
        ],
      },
    ],
  },
  {
    title: "Category title 2",
    parentSubcat: [
      {
        title: "Sub title",
        id: "ID value",
        sub21: [
          {
            title: "costitem211",
          },
          {
            title: "costitem212",
          },
        ],
      },
      {
        title: "Sub title",
        id: "ID value",
        sub22: [
          {
            title: "costitem221",
          },
          {
            title: "costitem222",
          },
        ],
      },
      {
        title: "Sub title",
        id: "ID value",
        sub23: [
          {
            title: "costitem23",
          },
        ],
      },
    ],
  },
  {
    title: "Category title 2",
    parentSubcat: [
      {
        title: "Sub title",
        id: "ID value",
        sub21: [
          {
            title: "costitem211",
          },
          {
            title: "costitem212",
          },
        ],
      },
      {
        title: "Sub title",
        id: "ID value",
        sub22: [
          {
            title: "costitem221",
          },
          {
            title: "costitem222",
          },
        ],
      },
      {
        title: "Sub title",
        id: "ID value",
        sub23: [
          {
            title: "costitem23",
          },
        ],
      },
    ],
  },
];

var buildCategory = {
  tree: document.getElementById("tree"),
  start: function start(jsonData) {
    var _this = this;
    jsonData.forEach(function (data) {
      var liParent = document.createElement("tr");
      liParent.innerHTML =
        '<td width="45%" class="indent-1" data-title="' +
        data.title +
        '">  <span>' +
        data.title +
        '</span></td><td width="10%" class="center">Item</td><td width="45%"></td>';
      _this.tree.appendChild(liParent);
      if (data.parentSubcat !== undefined) {
        _this.childs(liParent, data);
      }
    });
  },
  childs: function childs(liParent, data) {
    var _this2 = this;
    data.parentSubcat.forEach(function (child) {
      var liChild = document.createElement("tr");
      liChild.innerHTML =
        '<td width="45%" class="indent-2" data-title="' +
        child.title +
        '">  <span>' +
        child.title +
        '</span></td><td width="10%" class="center">Item</td><td width="45%"></td>';
      _this2.tree.appendChild(liChild);
      if (_this2.checkChilds(child) !== undefined) {
        var checkChildrenIndex = _this2.checkChilds(child);
        var children = child[checkChildrenIndex];
        children.forEach(function (child) {
          var liChildren = document.createElement("tr");
          liChildren.innerHTML =
            '  <td width="45%" class="indent-3" data-title="' +
            child.title +
            '">    <span>' +
            child.title +
            '</span>  </td>  <td width="10%" class="center">Item</td>  <td width="45%" ></td>';
          _this2.tree.appendChild(liChildren);
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
        $(value).find("td:first").data("title")
      ) {
        selectedItems.push($(value).find("td:first").data("title"));
      }
    });
    console.log(selectedItems);
    return selectedItems;
  },
};
buildCategory.start(jsonData);

var quickBookItems = {
  element: document.getElementById("account-items"),
  start: function start(jsonData) {
    var _this3 = this;
    jsonData.forEach(function (data) {
      var liParent = document.createElement("tr");
      liParent.innerHTML =
        '<td class="indent-1" data-title="' +
        data.title +
        '">  <span>' +
        data.title +
        "</span></td>";
      _this3.element.appendChild(liParent);
      if (data.parentSubcat !== undefined) {
        _this3.childs(liParent, data);
      }
    });
  },
  childs: function childs(liParent, data) {
    var _this4 = this;
    data.parentSubcat.forEach(function (child) {
      var liChild = document.createElement("tr");
      liChild.innerHTML =
        '<td class="indent-2" data-title="' +
        child.title +
        '">  <span>' +
        child.title +
        "</span></td>";
      _this4.element.appendChild(liChild);
      if (_this4.checkChilds(child) !== undefined) {
        var checkChildrenIndex = _this4.checkChilds(child);
        var children = child[checkChildrenIndex];
        children.forEach(function (child) {
          var liChildren = document.createElement("tr");
          liChildren.innerHTML =
            '  <td class="indent-3" data-title="' +
            child.title +
            '">    <span>' +
            child.title +
            "</span>  </td>";
          _this4.element.appendChild(liChildren);
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
    $("#account-items tr").each(function (index, value) {
      if (
        $(value).attr("class") === "active" &&
        $(value).find("td:first").data("title")
      ) {
        selectedItems.push($(value).find("td:first").data("title"));
      }
    });
    console.log(selectedItems);
    return selectedItems;
  },
};
quickBookItems.start(jsonData);

$(function () {
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

      console.log(start, end);
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
    console.log("buildCategory", buildCategory.selectedItems());
  });

  $accountItems.click(function (e) {
    if (!lastChecked) {
      lastChecked = this;
    }
    if (e.shiftKey) {
      var start = $accountItems.index(this);
      var end = $accountItems.index(lastChecked);

      console.log(start, end);
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
    console.log("quickBookItems", quickBookItems.selectedItems());
  });
});
