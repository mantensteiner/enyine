enyine.component('itemsRelations', {
  templateUrl: '/js/app/components/item/itemsRelations.html',
  restrict: 'E',
  controller: ['$scope', '$rootScope', '$state', '$stateParams', '$q', 'spaceService', 'itemService', '$timeout',
    'itemTypeService', 'notifier', 'filterService', '$location', 'tagService', ItemsBulkEditController]
});