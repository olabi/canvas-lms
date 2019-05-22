/*
 * Copyright (C) 2011 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

// true modules that we use in this file
import $ from 'jquery'
import Backbone from 'Backbone'
import splitAssetString from 'compiled/str/splitAssetString'
import {isMathMLOnPage, loadMathJax} from 'mathml'
import preventDefault from 'compiled/fn/preventDefault'

// these are all things that either define global $.whatever or $.fn.blah
// methods or set something up that other code expects to exist at runtime.
// so they have to be ran before any other app code runs.
import 'translations/_core_en'
import 'jquery.ajaxJSON'
import 'jquery.instructure_forms'
import 'ajax_errors'
import 'compiled/behaviors/activate'
import 'compiled/behaviors/tooltip'
import 'media_comments'


import('../runOnEveryPageButDontBlockAnythingElse')
if (ENV.csp) import('../account_settings/alert_enforcement').then(setupCSP => setupCSP(window.document))
if (ENV.INCOMPLETE_REGISTRATION) import('compiled/registration/incompleteRegistrationWarning')
if (ENV.badge_counts) import('compiled/badge_counts')

$('html').removeClass('scripts-not-loaded')

$('.help_dialog_trigger').click((event) => {
  event.preventDefault()
  require.ensure([], (require) => {
    const helpDialog = require('compiled/helpDialog')
    helpDialog.open()
  }, 'helpDialogAsyncChunk')
})


// Backbone routes
$('body').on('click', '[data-pushstate]', preventDefault(function() {
  Backbone.history.navigate($(this).attr('href'), true)
}))

if (
  window.ENV.NEW_USER_TUTORIALS &&
  window.ENV.NEW_USER_TUTORIALS.is_enabled &&
  (window.ENV.context_asset_string && (splitAssetString(window.ENV.context_asset_string)[0] === 'courses'))
) {
  require.ensure([], (require) => {
    const initializeNewUserTutorials = require('../new_user_tutorial/initializeNewUserTutorials')
    initializeNewUserTutorials()
  }, 'NewUserTutorialsAsyncChunk')
}

// edge < 15 does not support css vars
// edge >= 15 claims to, but is currently broken
const edge = window.navigator.userAgent.indexOf("Edge") > -1
const supportsCSSVars = !edge && window.CSS && window.CSS.supports && window.CSS.supports('(--foo: red)')
if (!supportsCSSVars) {
  require.ensure([], (require) => {
    window.canvasCssVariablesPolyfill = require('../canvasCssVariablesPolyfill')
  }, 'canvasCssVariablesPolyfill')
}

$(() => {
  if (isMathMLOnPage()) loadMathJax('TeX-MML-AM_HTMLorMML')
})
