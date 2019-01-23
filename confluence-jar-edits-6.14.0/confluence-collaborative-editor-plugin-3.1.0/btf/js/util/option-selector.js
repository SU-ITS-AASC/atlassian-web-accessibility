define('confluence-collaborative-editor-plugin/btf/util/option-selector', [], function () {
    /**
     * Selects an option from the given options based on the parameters given.
     * @param {Array} options This is an array of the form:
     *                             [ {
     *                                  option: {*},
     *                                  conditions: {
     *                                      conditionKey: <conditionValue> | <Array<conditionValue>>
     *                                  }
     *                               },
     *                               ...
     *                             ]
     *
     *                         The option field will be selected if the conditions are met given
     *                         the parameters.
     *
     *                         If the conditionKey value is a non-array then there must exist a parameter in the
     *                         parameters object with the same key and value.
     *
     *                         If the conditionKey value is an array then there must exist a parameter in the
     *                         parameters object with the same key where the value is found in the conditions
     *                         array. This is treated as an OR.
     *
     *                         It will select the first item from the options that matches all the conditions
     * @param {object} parameters   An object of the parameters to match against.
     * @param {*} defaultValue  Optional. A default value to return if none of the options match.
     * @returns {*} It returns the .option field of the first option object in the options @param whose conditions
     *              match the given parameters, or the default value if nothing matches.
     */
    function selectOption(options, parameters, defaultValue) {
        // Loop through all the options first
        for (var i = 0; i < options.length; i++) {
            var option = options[i];
            // Then check the conditions of each option
            // First one to pass all its conditions given the parameters wins.
            if (_checkConditions(option, parameters)) {
                return option.option;
            }
        }

        return defaultValue; // or undefined if not supplied
    }

    /**
     * Checks the map of conditions for this option.
     * If every condition for the option is satisfied by the given parameters,
     * then it returns true and this option will be selected. If any of the conditions don't match the
     * supplied parameters, then false is returned and we will move on to check the next option.
     * @param {object} option The option under test
     * @param {object} parameters Parameters supplied to test with
     * @return {boolean} true iff all the conditions pass for this option given the parameters
     */
    function _checkConditions(option, parameters) {
        for (var key in option.conditions) {
            if (option.conditions.hasOwnProperty(key)) {
                // If the supplied parameters object doesn't contain that key, then we move on
                if (typeof parameters[key] === 'undefined') {
                    return false;
                }

                // If any condition doesn't equal the given parameter,
                // then we can't choose this option. An option will
                // only be chosen if all its conditions are met
                // by the corresponding values in the parameters.
                if (!_checkCondition(option.conditions[key], parameters[key])) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Processes the current condition to see if the supplied parameter matches it.
     * @param {Array|*} condition An array of values that are allowed, or an individual value
     *                              the must be the same as the supplied parameter
     * @param {*} parameter Supplied parameter will be check against the single condition value
     *                      or against an array to see if it is in the array or not.
     * @returns {boolean} true iff the condition succeeds.
     */
    function _checkCondition(condition, parameter) {
        if (Array.isArray(condition)) {
            // If it's an array, it's treated as an OR so we just need to
            // find one value from the array that matches the supplied parameter
            for (var j = 0; j < condition.length; j++) {
                if (parameter === condition[j]) {
                    return true;
                }
            }
            // The parameter value wasn't found in the array of allowed values in the condition
            return false;
        } else if (condition !== parameter) {
            // If it's not an array and the value for the option doesn't match
            // what is provided in the parameters, then this condition doesn't pass
            return false;
        }

        return true;
    }

    return selectOption;
});