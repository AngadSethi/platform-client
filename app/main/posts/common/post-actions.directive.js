module.exports = PostActionsDirective;

PostActionsDirective.$inject = [
    '$rootScope',
    'PostsSdk',
    'Notify',
    '$location',
    '$state',
    'PostActionsService',
    'PostLockService',
    '_'
    ];
function PostActionsDirective(
    $rootScope,
    PostsSdk,
    Notify,
    $location,
    $state,
    PostActionsService,
    PostLockService,
    _) {
    return {
        restrict: 'E',
        replace: false,
        scope: {
            post: '='
        },
        template: require('./post-actions.html'),
        link: PostActionsLink
    };

    function PostActionsLink($scope) {
        $scope.deletePost = deletePost;
        $scope.updateStatus = updateStatus;
        $scope.openEditMode = openEditMode;
        $scope.postIsUnlocked = postIsUnlocked;

        activate();

        function activate() {
            $scope.statuses = PostActionsService.getStatuses();
        }

        // Called when a single data item is deleted.
        function deletePost() {
            PostActionsService.delete($scope.post).then(function () {
                $rootScope.$broadcast('event:edit:post:status:data:mode:saveSuccess', {post: $scope.post, deleted: true});
                // If we're not already on some of the posts views
                if (!$state.$current.includes.posts) {
                    // Redirect to list
                    $state.go('posts.data');
                } else if ($state.$current.includes['posts.map']) {
                    // only map needs to reload
                    $state.reload();
                }
            });
        }

        function postIsUnlocked() {
            return !PostLockService.isPostLockedForCurrentUser($scope.post);
        }

        function openEditMode(postId) {
            // Ensure Post is not locked before proceeding
            if (!postIsUnlocked()) {
                Notify.error('post.already_locked');
                return;
            }

            $state.go('posts.data.edit', {postId: postId});
        }
        //Depending on the new endpoint we might not need this
        function getCompletedTasks() {
             return _.chain($scope.post.completed_stages)
                .filter(stage => {
                    if (stage.completed === 1) {
                        return stage.form_stage_id;
                    }
                })
                .map(stage => {
                    return stage.form_stage_id;
                })
                .value();
        }

        function updateStatus(status) {
            // do a copy of the post to avoid updating the status-label in the card before its successfully saved
            let post = angular.copy($scope.post);
            post.status = status;
            // Maybe not needed when we are using the new endpoint...
            post.completed_stages = getCompletedTasks();
            // change to new endpoint
            PostsSdk.patchPost(post).then(function (response) {
                // @uirouter-refactor fix this to work with new states
                // adding post to broadcast to make sure it gets filtered out from post-list if it does not match the filters.

                // tell the $scope about the status-update (maybe needs another structure depending on the endpoint...)
                $scope.post = post;
                $rootScope.$broadcast('event:edit:post:status:data:mode:saveSuccess', {post: $scope.post});
                Notify.notify('notify.post.save_success', { name: $scope.post.title });
            }, function (errorResponse) {
                // sdkErrors instead of apiErrors
                Notify.sdkErrors(errorResponse);
            });
        }
    }
}
