module.exports = [
    'Util',
    'Session',
    'UshahidiSdk',
function (
    Util,
    Session,
    UshahidiSdk
) {

    let _ushahidi = null;

    const ushahidi = function () {
        if (_ushahidi) { return _ushahidi; }
        return new UshahidiSdk.Surveys(
            Util.url(''),
            Session.getSessionDataEntry('accessToken'),
            Session.getSessionDataEntry('accessTokenExpires')
        );
    }
    /**
     *
     * @param id of the survey [optional]
     * @param includeOnly a list in the form "id,name", the API will include everything if not set,
     * but it will avoid hydration if the parameter is set & empty
     * @param hydrateOnly a list in the form "tasks, categories", the API will include everything if not set,
     * but it will avoid hydration if the parameter is set & empty
     * @returns {{then: then}}
     */
    const getSurveys = function(includeOnly, hydrateOnly) {
        return ushahidi()
                    .getSurveys(includeOnly, hydrateOnly);
    }
    /**
     *
     * @param id of the survey [optional]
     * @param includeOnly a list in the form "id,name", the API will include everything if not set,
     * but it will avoid hydration if the parameter is set & empty
     * @param hydrateOnly a list in the form "tasks, categories", the API will include everything if not set,
     * but it will avoid hydration if the parameter is set & empty
     * @returns {{then: then}}
     */
    const findSurvey = function(id, includeOnly, hydrateOnly) {
        return ushahidi()
            .findSurvey(id, includeOnly, hydrateOnly);
    }

    const saveSurvey = function(survey) {
        return ushahidi()
            .saveSurvey(survey);
    }
    const getSurveysTo = function(reason) {
        switch (reason) {
            case 'list_and_permissions':
            case 'filters':
                return ushahidi()
                    .getSurveys(
                        [
                            'name', 'description', 'targeted_survey', 'everyone_can_create', 'can_create', 'id'
                        ],
                        [
                            'translations', 'enabled_languages'
                        ]
                    );
            case 'count':
                return ushahidi()
                    .getSurveys(
                        [
                            'id'
                        ],
                        []
                    );
        }
    }

    const findSurveyTo = function(id, reason) {
        switch (reason) {
            case 'edit':
                return ushahidi()
                    .findSurvey(
                        id
                    );
                break;
            case 'delete':
                return ushahidi()
                    .findSurvey(
                        id,
                        [
                            'targeted_survey', 'everyone_can_create', 'can_create', 'id'
                        ]
                    );
                break;
            case 'get_minimal_form':
                return ushahidi()
                    .findSurvey(
                        id,
                        [
                            'name', 'color', 'description', 'targeted_survey', 'everyone_can_create', 'can_create', 'id'
                        ],
                        [
                            'translations', 'enabled_languages'
                        ]
                    );
                break;
        }
    }
    const deleteSurvey = function(id) {
        return ushahidi()
                .deleteSurvey(id);
    }

    return { findSurveyTo, getSurveysTo, findSurvey, getSurveys, saveSurvey, deleteSurvey };
}];
