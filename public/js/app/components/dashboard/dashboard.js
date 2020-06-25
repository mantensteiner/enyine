enyine.component('dashboard', {
  templateUrl: '/js/app/components/dashboard/dashboard.html',
  restrict: 'E',
  controller: ['$scope', '$rootScope', '$state', '$q', 'itemService', 'spaceService',
               'itemTypeService', 'userService', 'notifier', DashboardController]
});

function DashboardController($scope, $rootScope, $state, $q, itemService, spaceService,
    itemTypeService, userService, notifier) {
    var ctrl = this;

    ctrl.$onInit = function() {
        $(document).ready(function () {
            $('[data-toggle="offcanvas"]').click(function () {
                $('.row-offcanvas').toggleClass('active')
            });
        });

        $rootScope.$broadcast('selectedSpace', null);

        ctrl.loadingActions = false;
        ctrl.loadingEvents = false;
        ctrl.spacesAreLoading = false;
        ctrl.selectedSpace = null;
        ctrl.userActions = [];
        ctrl.newItemLabelsMarkup = [];
        ctrl.newItem = null;

        loadSpaces();
    }

    function loadSpaces() {
        var defer = $q.defer();

        ctrl.spacesAreLoading = true;
        spaceService.get().then(function(spaces) {
            ctrl.spaces = spaces.data;
            ctrl.spacesAreLoading = false;
            defer.resolve(ctrl.spaces);
            loadUserActions();
            loadEventItems();
        }, function(err) {
            ctrl.spacesAreLoading = false;  
        });

        return defer.promise;
    }

    ctrl.spacesLoading = function() {
        if(ctrl.spacesAreLoading)
            return true;

        return false;
    }

    /*
    ctrl.selectSpace = function(p) {
        $rootScope.$broadcast('selectedSpace', p);
        //$state.go('in.project', { id: p._id });
    }
    */
    
    ctrl.addSpaceItem = function(p) {
        ctrl.selectedSpace = p._source;
        ctrl.newItem = {};
        loadLabels(function(err, mkup) {
            if(!err)
            ctrl.newItemLabelsMarkup = mkup;
        });
    }

    ctrl.addItem = function() {
        ctrl.newItem.spaceId = ctrl.selectedSpace.id;

        if(ctrl.newItem.labels)
            ctrl.newItem.labels = _.map(ctrl.newItem.labels, function(el) {return el.id});

        itemService.save(ctrl.newItem).success(function(item) {
            $("#addItemModal").modal('hide');
            ctrl.newItem = null;
            notifier.success('Item \'' + item.name + '\’ added!');
        }).error(function(err) {
            notifier.error(err.message);
        });
    }


    function loadUserActions() {
        ctrl.loadingActions = true;
        userService.getActions().then(function(actions) {
            ctrl.userActions = actions;
            ctrl.loadingActions = false;
        }, function(err) {
            notifier.error(err.message);
        });
    }

    
    function loadEventItems() {
        ctrl.loadingEvents = true;
        userService.getEventItems().then(function(eventItems) {
            ctrl.eventItems = eventItems;
            ctrl.loadingEvents = false;
        }, function(err) {
            notifier.error(err.message);
        });
    }

    ctrl.search = function() {
        $state.go("in.search", {term: ctrl.searchQuery});
    }

    ctrl.getSpaceName = function(pId) {
        var res = _.findWhere(ctrl.spaces, {id:pId});
        if(!res)
            return 'not_found';
        return res.name;
    }

    ctrl.goToRecord = function(action) {
        if(action.type === 'item') {
            $state.go("in.item_detail", {spaceId:action.spaceId, id: action.recordId});
        }
        else if(action.type === 'note') {
            $state.go("in.notes", {spaceId:action.spaceId, noteId: action.recordId});
        }
        else {
            $state.go("in.space_settings", {id:action.spaceId});
        }
    }

    function loadLabels(cb) {
        var skip = 0;
        var take = 10000;

        itemTypeService.getBySpace(ctrl.selectedSpace.id, '*', take, skip)
        .then(function(labels) {
            ctrl.newItem.labels = labels;
            var mkup = buildLabelsMarkup(ctrl.newItem.labels);
            cb(null, mkup);
        }, function(err) {
            notifier.error(err.message);
            cb(err.message);
        });
    }

    function buildLabelsMarkup(labels) {
        var markupItems = [];
        _.each(labels, function(l) {
            var el = {
            id: l.id,
            name:   "<span style='color:" + l.color + "'>" + l.name + "</span>",
            ticked: false
            };

            if(l.icon) {
            el.color =  "<span style='color:" + l.color + "'><i class='" + l.icon + "'></i></span>";
            }
            else {
            el.color =  "<span style='color:" + l.color + "'><i class='fa fa-tag'></i></span>";
            }

            markupItems.push(el);
        })
        return markupItems;
    };

    ctrl.addedSpace = function() {
        loadSpaces();
    }    
}