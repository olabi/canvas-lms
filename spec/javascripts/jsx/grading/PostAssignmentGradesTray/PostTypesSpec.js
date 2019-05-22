/*
 * Copyright (C) 2019 - present Instructure, Inc.
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

import React from 'react'
import ReactDOM from 'react-dom'

import PostTypes from 'jsx/grading/PostAssignmentGradesTray/PostTypes'

QUnit.module('PostAssignmentGradesTray PostTypes', suiteHooks => {
  let $container
  let context

  function getLabel(text) {
    return [...$container.querySelectorAll('label')].find($label =>
      $label.textContent.includes(text)
    )
  }

  function getPostType(type) {
    return document.getElementById(getLabel(type).htmlFor)
  }

  function mountComponent() {
    ReactDOM.render(<PostTypes {...context} />, $container)
  }

  suiteHooks.beforeEach(() => {
    $container = document.body.appendChild(document.createElement('div'))
    context = {
      defaultValue: 'everyone',
      postTypeChanged: () => {}
    }
  })

  suiteHooks.afterEach(() => {
    ReactDOM.unmountComponentAtNode($container)
    $container.remove()
  })

  test('"Everyone" type includes description"', () => {
    mountComponent()
    const labelText = 'Everyone\nGrades will be made visible to all students'
    strictEqual(getLabel('Everyone').innerText, labelText)
  })

  test('"Graded" type includes description"', () => {
    mountComponent()
    const labelText = 'Graded\nGrades will be made visible to students with graded submissions'
    strictEqual(getLabel('Graded').innerText, labelText)
  })

  test('the defaultValue is selected', () => {
    context.defaultValue = 'graded'
    mountComponent()
    strictEqual(getPostType('graded').checked, true)
  })

  test('selecting another type calls postTypeChanged', () => {
    const postTypeChangedSpy = sinon.spy()
    context.postTypeChanged = postTypeChangedSpy
    mountComponent()
    getPostType('graded').click()
    strictEqual(postTypeChangedSpy.callCount, 1)
  })
})
