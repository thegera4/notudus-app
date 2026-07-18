const React = require('react')

function MockIcon(props) {
  return React.createElement(
    'Text',
    { testID: props.testID, accessibilityLabel: props.name },
    props.name || 'icon',
  )
}

module.exports = MockIcon
module.exports.default = MockIcon
