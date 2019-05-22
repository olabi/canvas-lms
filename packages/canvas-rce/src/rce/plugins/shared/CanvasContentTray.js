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

import React, {Suspense, useEffect, useState} from 'react'
import {bool, func, instanceOf, oneOf} from 'prop-types'
import {Tray} from '@instructure/ui-overlays'
import {CloseButton} from '@instructure/ui-buttons'
import {Heading, Spinner} from '@instructure/ui-elements'
import {Flex, FlexItem} from '@instructure/ui-layout'

import Bridge from '../../../bridge/Bridge'
import formatMessage from '../../../format-message'
import Filter, {useFilterSettings} from './Filter'
import {StoreProvider} from './StoreContext'

/**
 * Returns the translated tray label
 * @param {Object} filterSettings
 * @param {string} filterSettings.contentSubtype - The current subtype of
 * content loaded in the tray
 * @returns {string}
 */
function getTrayLabel({contentType, contentSubtype}) {
  if (contentType === 'links') {
    return formatMessage('Course Links')
  }

  switch (contentSubtype) {
    case 'images':
      return formatMessage('Course Images')
    case 'media':
      return formatMessage('Course Media')
    case 'documents':
      return formatMessage('Course Documents')
    default:
      return formatMessage('Tray') // Shouldn't ever get here
  }
}

/**
 * Returns the component lazily for the given filter settings
 * @param {Object} filterSettings
 * @param {string} filterSettings.contentSubtype - The current subtype of
 * content loaded in the tray
 */
function loadTrayContent({contentType, contentSubtype}) {
  switch (contentSubtype) {
    case 'images':
      return React.lazy(() => import('../instructure_image/Images'))
    case 'documents':
    case 'media':
    default:
      return React.lazy(() => import('./FakeComponent'))
  }
}

const FILTER_SETTINGS_BY_PLUGIN = {
  documents: {contentType: 'files', contentSubtype: 'documents', sortValue: 'date_added'},
  images: {contentType: 'files', contentSubtype: 'images', sortValue: 'date_added'},
  links: {contentType: 'links', contentSubtype: 'all', sortValue: 'date_added'},
  media: {contentType: 'files', contentSubtype: 'media', sortValue: 'date_added'}
}

/**
 * This component is used within various plugins to handle loading in content
 * from Canvas.  It is essentially the main component.
 */
export default function CanvasContentTray(props) {
  const [isOpen, setIsOpen] = useState(false)

  const [filterSettings, setFilterSettings] = useFilterSettings()
  const ContentComponent = loadTrayContent(filterSettings)

  useEffect(() => {
    const controller = {
      showTrayForPlugin(plugin) {
        setFilterSettings(FILTER_SETTINGS_BY_PLUGIN[plugin])
        setIsOpen(true)
      }
    }

    props.bridge.attachController(controller)

    return () => {
      props.bridge.detachController(controller)
    }
  }, [props.bridge])

  return (
    <Tray
      label={getTrayLabel(filterSettings)}
      open={isOpen}
      placement="end"
      size="regular"
    >
      <Flex direction="column" display="block" height="100vh" overflowY="hidden">
        <FlexItem padding="medium" shadow="above">
          <Flex margin="none none medium none">
            <FlexItem>
              <CloseButton placement="static" variant="icon" onClick={() => setIsOpen(false)}>
                {formatMessage('Close')}
              </CloseButton>
            </FlexItem>

            <FlexItem grow shrink>
              <Heading level="h2" margin="none none none medium">{formatMessage('Add')}</Heading>
            </FlexItem>
          </Flex>

          <Filter {...filterSettings} onChange={setFilterSettings} />
        </FlexItem>

        <FlexItem grow shrink>
          <StoreProvider {...props}>
            {contentProps => (
              <Suspense fallback={<Spinner title={formatMessage('Loading')} size="large" />}>
                <ContentComponent {...contentProps} />
              </Suspense>
            )}
          </StoreProvider>
        </FlexItem>
      </Flex>
    </Tray>
  )
}

CanvasContentTray.propTypes = {
  bridge: instanceOf(Bridge).isRequired,
}
