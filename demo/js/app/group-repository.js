var GroupRepository = function () {};

GroupRepository.prototype = function () {
	var groups, groupNodeCache = {};

	var initGroupStore = function () {
		groups = new IDBStore({
			storeName: "group",
			dbVersion: 1,
			autoIncrement: true,
			onStoreReady: refreshGroups
		});

		["addGroup", "GroupName"].forEach(function(id) {
			groupNodeCache[id] = document.getElementById(id);
		});

		groupNodeCache.addGroup.addEventListener("click", createNewGroup);
	};
	var refreshGroups = function () {
		groups.getAll(groupList);
	};

	var groupList = function (data) {
	 	var source = $("#template-groups").html();
		template = Handlebars.compile(source);
		$("#placeholder-groups").html(template(
			{
				groups: data
			})
		);

		source = $("#template-group-dropdown").html();
		template = Handlebars.compile(source);
		$(".placeholder-group-dropdown").html(template(
			{
				groups: data
			})
		);

		$(document).trigger("CustomEvent/GroupStoreInitialized");
	};

	var isDataAlreadyExist = function (oldData) {
		var newData = {}, dataExists = false;
		["GroupName"].forEach(function(key) {
			var value = groupNodeCache[key].value.trim();
			newData[key] = value;
		});

		oldData.forEach(function (key) {
			if(newData.GroupName.toLowerCase() === key.GroupName.toLowerCase()) {
				$(".notification-add-group").html('<div class="alert alert-danger"><span>Record already exists!</span></div>').fadeIn(200).delay(1500).fadeOut(300);
				dataExists = true;
			}
		});
		if(!dataExists) {
			addGroupIntoDb(newData);
		}
	};

	var createNewGroup = function () {
		var groupAddForm = $("#group-add-form");
		groupAddForm.parsley("validate");

		if(groupAddForm.parsley("isValid")) {
			groups.getAll(isDataAlreadyExist);
		}
	};

	var addGroupIntoDb = function (data) {
		groups.put(data, function() {
			$("input").val("");
			refreshGroups();
			$(".notification-add-group").html('<div class="alert alert-success"><span>New record created.</span></div>').fadeIn(200).delay(1500).fadeOut(300);
		});
	};

	var editGroup = function (group) {
		var data = {
			id: parseInt(group.Id, 10),
			GroupName: group.GroupName.trim()
		};
		var groupEditForm = $("#group-edit-form");
		groupEditForm.parsley("validate");

		if(groupEditForm.parsley("isValid")) {
			groups.put(data, refreshGroups);
			$(".notification-edit-group").html('<div class="alert alert-success"><span>The record has been updated.</span></div>').fadeIn(200).delay(1500).fadeOut(300);
		}
	};

	var deleteGroup = function (id) {
		groups.remove(id, refreshGroups);
	};

	return {
		initGroupStore: initGroupStore,
		editGroup: editGroup,
		deleteGroup: deleteGroup,
		refreshGroups: refreshGroups
	};
}();