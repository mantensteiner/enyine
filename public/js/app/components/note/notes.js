enyine.component('notes', {
  templateUrl: '/js/app/components/note/notes.html',
  restrict: 'E',
  controller: ['$scope', '$state', '$stateParams', '$q', 'spaceService', 'notifier', '$location', 
               'noteService', '$timeout', NotesController]
});

function NotesController($scope, $state, $stateParams, $q, spaceService, notifier, $location, noteService, $timeout) {
    var ctrl = this;

    // Init
    ctrl.$onInit = function() {
        ctrl.spaceId = $stateParams.spaceId;
        ctrl.noteId = $stateParams.noteId ? $stateParams.noteId : '';
        ctrl.space = null;
        ctrl.spaceLoading = false;
        ctrl.selectedNote = null;
        ctrl.editSelectedNote = false;
        ctrl.notes = [];

        loadSpace();
        loadNotes();
    }   

    function loadNotes() {
        noteService.getBySpace(ctrl.spaceId, "*")
        .then(
            function(data) {
                ctrl.notes = data;
                if(ctrl.noteId) {
                    ctrl.selectedNote = _.findWhere(ctrl.notes, {id:ctrl.noteId});
                }
                else {
                    // selected first note
                    ctrl.selectedNote = ctrl.notes[0];
                }
            },
            function(err) {
                notifier.error(err.message);
        });
    }

    function loadSpace() {
        ctrl.spaceLoading = true;
        var defer = $q.defer();

        spaceService.getById(ctrl.spaceId).success(function(p) {
            ctrl.space = p;

            ctrl.spaceName = p.name;
            ctrl.spaceLoading = false;

            defer.resolve(ctrl.space);
        });

        return defer.promise;
    }

    ctrl.selectNote = function(n) {
        ctrl.selectedNote = n;
        if(!n)
            return;

        $state.go('in.space_notes', {spaceId:ctrl.spaceId, noteId:ctrl.selectedNote.id});
    }

    ctrl.editNote = function(val) {
        ctrl.editSelectedNote = val;
    }

    ctrl.addNote = function() {
        var note = {
            name: ctrl.selectedNote.name,
            content: ''
        }

        noteService.save(ctrl.spaceId, note).then(function(_note){
            $timeout(function() {
                notifier.success("New Note '" + _note.data.name + "' created!");
                loadNotes();
                //$state.go('in.space_notes', {spaceId: ctrl.spaceId, noteId: _note.data.id});
            }, 1000);
        }, function(err){
            notifier.error(err.message || err.data.message);
        });
    }

    ctrl.deleteNote = function(id) {
        if(confirm("Really delete note?")) {
            noteService.delete(id, ctrl.spaceId).then(function(_note){
            $timeout(function() {
                notifier.success("Note deleted!");
                loadNotes();
            }, 500);
            }, function(err){
            notifier.error(err.message || err.data.message);
            });
        }
    }

    ctrl.saveNote = function(cb) {
        noteService.save(ctrl.spaceId, ctrl.selectedNote).then(function(_note){
            //ctrl.selectedNote = _note.data;
            notifier.success("Note '" + ctrl.selectedNote.name + "' saved!");
        }, function(err){
            notifier.error(err.message || err.data.message);
            if(cb) {
            cb(false);
            }
        });
    }

    ctrl.lockNote = function() {
        ctrl.selectedNote.private = !ctrl.selectedNote.private;
        ctrl.saveNote(function(success) {
            ctrl.selectedNote.private = success;
        });
    }
}